import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

if(!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error("GOOGLE_GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({model: "text-embedding-004"});



// Function to generate embeddings
async function generateEmbedding(text: string) {
    try {
      const response = await model.embedContent({
        content: { role: "user", parts: [{ text }] }, // Correct structure
      });

      console.log("embedding response: ", response);
  
      return {
        embedding: response.embedding,
        textContent: text
      };

    } catch (error) {
      console.error("Error generating embeddings:", error);
      return null;
    }
  }


export async function generateEmbeddingsUsingGemini(splitDocs: Document<Record<string, { text: string }>>[]) {
        const vectors = [];

        for (const doc of splitDocs) {
            const embeddingResponse = await generateEmbedding(doc.pageContent);
            console.log("embeddingResponse: ", embeddingResponse);

            if (embeddingResponse) {
                vectors.push({
                    id: `chunks-${Date.now()}`, // Unique ID for each chunk
                    values: embeddingResponse.embedding.values, // Embedding Values array, e.g., [0.1, 0.2, 0.3]
                    metadata: { text: embeddingResponse.textContent }, // Store original chunk text
                });
            }
        }

        console.log("vectors: ", vectors);
        console.log("vectors length: ", vectors.length);

        if (vectors.length > 0) {
            // await index.upsert(vectors);
            // console.log("Embeddings stored in Pinecone.");
            return vectors;
          } else {
            // console.log("No embeddings were stored.");
            return [];
          }

        // return vectors;

}