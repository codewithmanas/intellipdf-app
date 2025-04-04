import { pineconeClient } from "@/lib/pinecone";


if(!process.env.PINECONE_INDEX_NAME) {
    throw new Error("PINECONE_INDEX_NAME is not set");
  }
  
  const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
  
  const pineconeIndex = pineconeClient.index(pineconeIndexName);


  interface VectorType {
    id: string;
    values: number[];
    metadata: {
      text: string;
    };
  }

// Function to check if namespace exists
async function namespaceExists(namespace: string) {
    if (!namespace) throw new Error("No Namespace value provided.");
  
    const indexStats = await pineconeIndex.describeIndexStats(); 
    return Boolean(indexStats.namespaces?.[namespace]); // Check if namespace exists
  }
  


export async function storeEmbeddingsInPinecone(vectors: VectorType[], websiteId: string) {

    try {
        // Step 1: Check if the namespace exists
        const namespaceExistsFlag = await namespaceExists(websiteId);
    
        if (namespaceExistsFlag) {
          console.log(`--- Namespace ${websiteId} already exists. Skipping insertion. ---`);
          return true;
        }
    
        console.log(`--- Namespace ${websiteId} does not exist. Inserting data... ---`);
    
        // Step 2: Insert new embeddings
        const upsertResult = await pineconeIndex.namespace(websiteId).upsert(vectors);
    
        console.log("upsertResult: ", upsertResult);
    
        return true;
        } catch (error) {
            console.error("Error storing embeddings in Pinecone:", error);
            return false;
        }
}