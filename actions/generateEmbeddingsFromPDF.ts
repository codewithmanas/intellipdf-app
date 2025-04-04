"use server";

import { pineconeClient } from "@/lib/pinecone";
import { generateDocs } from "@/utils/generateDocs";
import { generateEmbeddingsUsingGemini } from "@/utils/generateEmbeddingsUsingGemini";
import { storeEmbeddingsInPinecone } from "@/utils/storeEmbeddingsInPinecone";
import { auth } from "@clerk/nextjs/server";

if(!process.env.PINECONE_INDEX_NAME) {
  throw new Error("PINECONE_INDEX_NAME is not set");
}

const pineconeIndexName = process.env.PINECONE_INDEX_NAME;

const pineconeIndex = pineconeClient.index(pineconeIndexName);
//  Latest: const pineconeIndex = pineconeClient.index(pineconeIndexName);
//  Deprecated: const pineconeIndex = pineconeClient.Index(pineconeIndexName);

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


export async function generateEmbeddingsFromPDF(docId: string) {
try {
    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("You must be signed in to generate embeddings");
    }
  
    // Checking if namespace exist or not in pinecone vector db
    console.log("----- Checking if namespace exist or not in pinecone vector db... -----");
  
    const isExist = await namespaceExists(docId);
    console.log("isExist: ", isExist);
  
    if (isExist) {
      console.log(`----- Namespace ${docId} already exists, reusing existing embeddings... -----`);
      return;
      
    } else {
  
        // if the namespace doesn't exist, download the PDF from firestore via the stored Download URL 
        // and generate the embeddings and store them in the Pinecone vector store
  
        console.log(`----- Splitting PDF into chunks... -----`);
  
        const splitDocs = await generateDocs(docId, userId);
        
        console.log("splitDocs: ", splitDocs);

        console.log(`----- Storing the embeddings in namespace ${docId} in the ${pineconeIndexName} Pinecone vector store... -----`);

        // store the embeddings in namespace ${docId} in the ${indexName} pinecone vector store...

        const vectorEmbeddings = await generateEmbeddingsUsingGemini(splitDocs);

        console.log("vectorEmbeddings: ", vectorEmbeddings);

        if (vectorEmbeddings.length > 0) {
          // await pineconeIndex.upsert({
          //   upsertRequest: {
          //     vectors: vectorEmbeddings,
          //     namespace: docId,
          //   },
          // });
          console.log("vector embeddings generated to store in Pinecone.");
          const result = await storeEmbeddingsInPinecone(vectorEmbeddings, docId);

          if (result) {
            console.log("Embeddings stored in Pinecone.");
            console.log("result: ", result);
          }

        } else {
          console.log("No embeddings were generate.");
          throw new Error("No vector embeddings were generate.");
        }

      } 
    
    } catch (error) {
        console.log("Error in generateEmbeddings: ", error);
        throw error;
      }
  }





    // steps of generating embeddings and store in pinecone vector db
    
    // 1. Check namespace exist or not by docId(as namespace) and indexname
    // 2. If namespace exists, return the existed vectorstore
    // 3. If namespace does not exist, 
            // - fetch file from firebase by docId and userId and get the downloadUrl 
            // - split the pdf file content into chunks
            // - store the embeddings in namespace ${docId} in the ${indexName} pinecone vector store...
            // 



