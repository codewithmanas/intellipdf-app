import { pineconeClient } from "@/lib/pinecone";
import { generateEmbedding, } from "./generateEmbeddingsUsingGemini";
import { PineconeStore } from "@langchain/pinecone";

// import { EmbeddingsInterface } from "@langchain/core/embeddings";
// import { Document } from "@langchain/core/documents";
// import { ContentEmbedding } from "@google/generative-ai";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
// import { Document } from "@langchain/core/documents";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";


if(!process.env.PINECONE_INDEX_NAME) {
    throw new Error("PINECONE_INDEX_NAME is not set");
  }
  
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
  
const pineconeIndex = pineconeClient.index(pineconeIndexName);

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "text-embedding-004",
  apiKey: process.env.GOOGLE_GEMINI_API_KEY, // Ensure API Key is set
});


if(!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error("GOOGLE_GEMINI_API_KEY is not set");
}


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


async function namespaceExists(namespace: string) {

    try {

      if (!namespace) throw new Error("No Namespace value provided.");

      // Fetch index stats
      const indexStats = await pineconeIndex.describeIndexStats();
      console.log("indexStats: ", indexStats);

    /* - Example output:
    indexStats: {
      "namespaces": {
        '399632c5-1b43-41c2-bb5d-0ff45cdf81ab': { recordCount: 21 },
        '098125d4-465b-44de-81c4-705d17890a1c': { recordCount: 37 },
        },
      "totalRecordCount": 58,
      "dimension": 1536,
      indexFullness: 0,
    }
    */ 

    // Get all namespaces
    const existingNamespaces = Object.keys(indexStats.namespaces || {});
    console.log("existingNamespaces: ", existingNamespaces);

    if(existingNamespaces.length === 0) {
      console.log("No namespaces found in Pinecone vector DB.");
      return false;
    }

    // Check if namespace exists
    if (existingNamespaces.includes(namespace)) {
      console.log(`Namespace ${namespace} exists in Pinecone vector DB.`);
      return true;
    } else {
      console.log(`Namespace ${namespace} does not exist in Pinecone vector DB.`);
      return false;
    }
      
    } catch (error) {
      console.error("Error checking namespace existence:", error);
      throw error;
    }
}

// Fetch the existing vectors from Pinecone
// async function getExistingVectorStore(namespace: string, vectorArray: number[] | undefined) {
//     try {

//       // Query existing vectors (adjust filter and topK as needed)
//       const queryResult = await pineconeIndex.namespace(namespace).query({
//         topK: 100, // Number of results to fetch
//         includeMetadata: true, // Include metadata if needed
//         vector: vectorArray as unknown as number[],
//       });
  
//       console.log(`Vectors in namespace "${namespace}":`, queryResult.matches);

//       return queryResult.matches; // Return the existing vectors

//     } catch (error) {
//       console.error("Error fetching existing vector store:", error);
//       throw error;
//     }
//   }



// Generate Langchain Completion
export async function generateLangchainCompletion(docId: string, question: string) {

        console.log("Query: ", question);
        let existingVectorStore;

    try {

            // Checking if namespace exist or not in pinecone vector db
            console.log("----- Checking if namespace exist or not in pinecone vector db... -----");
  
            const isExist = await namespaceExists(docId);
            console.log("isExist: ", isExist);
        
            if (isExist) {
                    console.log(`----- Namespace ${docId} already exists, reusing existing embeddings... -----`);

                    // TODO: Replacing: generate embeddings from question
                    const vectorEmbeddings = await generateEmbedding("");

                    console.log("vectorEmbeddings: ", vectorEmbeddings);

                    // Query existing vectors (adjust filter and topK as needed)

                    // const existingVectors = await getExistingVectorStore(docId, vectorEmbeddings?.embedding.values);

                    existingVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
                      pineconeIndex: pineconeIndex,
                      namespace: docId,
                  });


                    console.log("existingVectorStore: ", existingVectorStore);

                  if(!existingVectorStore) {
                    throw new Error("No existing vector store found.");
                  }

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

                    // return existingVectorStore; 

            } else {
                console.log(`----- Namespace ${docId} does not exist, generating embeddings... -----`);
                    // await generateEmbeddings(docId);
                    return null;
            }
        
    } catch (error) {
        console.log("error: ", error);
        return null;
    }
}