// Import the Pinecone library
import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not set");
}

// Initialize a Pinecone Client with your API key
const pineconeClient = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});


export { pineconeClient };