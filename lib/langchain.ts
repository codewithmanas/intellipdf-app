import { namespaceExists } from "@/utils/namespaceExists";
import { auth } from "@clerk/nextjs/server";
import { PineconeStore } from "@langchain/pinecone";
import { pineconeIndex, pineconeIndexName } from "./pinecone";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { generateDocs } from "@/utils/generateDocs";
import { adminDb } from "@/firebaseAdmin";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";

if(!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error("GOOGLE_GEMINI_API_KEY is not set");
}

// Initialize Google's Generative AI Embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "text-embedding-004", // Use text-embedding-004
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

// Initialize Google's Generative AI LLM (Chat Model)
export const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro", // Use Gemini model for chat
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});


async function fetchMessageFromDB(docId: string) {

    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("You must be signed in to use firebase");
    }
  
    console.log("----- Fetching chat history from DB... -----");
  
    const chats = await adminDb
        .collection("intellipdf_users")
        .doc(userId)
        .collection("files")
        .doc(docId)
        .collection("chat")
        .orderBy("createdAt", "asc")
        // .limit(3)
        .get();
  
    const chatHistory = chats.docs.map((doc) => {
      const data = doc.data();
  
      return (
        data.role === "human"
        ? new HumanMessage(data.text)
        : new AIMessage(data.text)
      );
    });
  
    console.log(`--- ${chatHistory.length} Chat history fetched successfully ---`);
   
    console.log(chatHistory.map(msg => msg.content.toString()));
  
    return chatHistory;
  
  }


// Generate embeddings and store them in Pinecone
export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
        try {

            const { userId } = await auth();
            
            if (!userId) {
                throw new Error("You must be signed in to generate embeddings");
            }

            // Checking if namespace exist or not in pinecone vector db
            console.log("----- Checking if namespace exist or not in pinecone vector db... -----");
            
            const isExist = await namespaceExists(docId);

            if(isExist) {
                console.log(`----- Namespace ${docId} already exists, reusing existing embeddings... -----`);

                const existingVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
                    pineconeIndex: pineconeIndex,
                    namespace: docId,
                });

                return existingVectorStore;

            } else {

                    // if the namespace doesn't exist, download the PDF from firestore via the stored Download URL 
                    // and generate the embeddings and store them in the Pinecone vector store
                    console.log(`----- Namespace ${docId} does not exist, generating new embeddings... -----`);

                    console.log(`----- Splitting PDF into chunks... -----`);

                    const splitDocs = await generateDocs(docId, userId);
                            
                    console.log("splitDocs: ", splitDocs);

                    console.log(`--- Storing the embeddings in namespace ${docId} in the ${pineconeIndexName} Pinecone vector store... ---`);

                    const newPineconeVectorStore = await PineconeStore.fromDocuments(
                        splitDocs, 
                        embeddings, 
                        {
                            pineconeIndex: pineconeIndex,
                            namespace: docId,
                        }
                    );
        
                    console.log("--- Embeddings stored successfully! ---");
        
                    return newPineconeVectorStore;
            }

            
        } catch (error) {
            console.log("Error in generateEmbeddings: ", error);
            throw error;
        }
}



// Generate Langchain Completion
export async function generateLangchainCompletion(docId: string, question: string) {

    try {
            console.log("Query: ", question);

            const existingVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);

            // create a retriever to search through the vector store
            console.log("----- Creating retriever... -----");

            const retriever =  existingVectorStore.asRetriever();

            const chatHistory = await fetchMessageFromDB(docId);

            // define prompt template
            console.log("----- Defining prompt template... -----");

            const historyAwarePrompt = ChatPromptTemplate.fromMessages([
                ...chatHistory,
                ["user", "{input}"],
                ["user", "Given the above conversations, generate a search query to lookup in the order to get information relevant to the conversation"]
              ])                    

              console.log("--- Creating history aware retriever chain ... ---");

              const historyAwareRetrieverChain = await createHistoryAwareRetriever({
               llm: model,
               retriever: retriever,
               rephrasePrompt: historyAwarePrompt
              })                   

              console.log("---  Defining prompt template for answering question ---");

              const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
               ["system",
                 "Answer the user's question based on the below context: \n\n {context}"
               ],
               ...chatHistory,
               ["user", "{input}"],
             ])                   

             console.log("--- Creating a document combining chain ---");
             const historyAwareCombineDocsChain = await createStuffDocumentsChain({
               llm: model,
               prompt: historyAwareRetrievalPrompt
             });                  

             console.log("--- Creating a main retriever chain ---");
             const conversationalRetrieverChain = await createRetrievalChain({
                 retriever: historyAwareRetrieverChain,
                 combineDocsChain: historyAwareCombineDocsChain,
             })                  

             console.log(" --- Creating a conversation chain ---");

             const reply = await conversationalRetrieverChain.invoke({
               chat_history: chatHistory,
               input: question
             })                  

            console.log("----- Answer: ", reply.answer);

            return reply.answer;
        
    } catch (error) {
        console.log("Error in generateLangchainCompletion: ", error);
        throw new Error("Error in generateLangchainCompletion");
        // return null;
    }
}