// Import Pinecone library
import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not set");
}

if(!process.env.PINECONE_INDEX_NAME) {
    throw new Error("PINECONE_INDEX_NAME is not set");
}

// Initialize a Pinecone Client with your API key
const pineconeClient = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});


const pineconeIndexName = process.env.PINECONE_INDEX_NAME;

// Create an index to use pinecone methods
const pineconeIndex = pineconeClient.index(pineconeIndexName);

//  Updated: const pineconeIndex = pineconeClient.index(pineconeIndexName);
//  Deprecated: const pineconeIndex = pineconeClient.Index(pineconeIndexName);

export { pineconeClient, pineconeIndexName, pineconeIndex };