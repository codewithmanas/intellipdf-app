import { pineconeIndex } from "@/lib/pinecone";


export async function namespaceExists(namespace: string) {
    if (namespace === null) throw new Error("Namespace value is not provided.");

    const { namespaces } = await pineconeIndex.describeIndexStats();
    return namespaces?.[namespace] !== undefined;
    // Boolean(namespaces?.[namespace]); // Another way to Check if namespace exists
}



// ? Readable Approach

// export async function namespaceExists(namespace: string) {

//     try {

//       if (!namespace) throw new Error("Namespace value is not provided.");

//       // Fetch index stats
//       const indexStats = await pineconeIndex.describeIndexStats();
//       console.log("indexStats: ", indexStats);

//     /* - Example output:
//     indexStats: {
//       "namespaces": {
//         '399632c5-1b43-41c2-bb5d-0ff45cdf81ab': { recordCount: 21 },
//         '098125d4-465b-44de-81c4-705d17890a1c': { recordCount: 37 },
//         },
//       "totalRecordCount": 58,
//       "dimension": 1536,
//       indexFullness: 0,
//     }
//     */ 

//     // Get all namespaces
//     const existingNamespaces = Object.keys(indexStats.namespaces || {});
//     console.log("existingNamespaces: ", existingNamespaces);

//     if(existingNamespaces.length === 0) {
//       console.log("No namespaces found in Pinecone vector DB.");
//       return false;
//     }

//     // Check if namespace exists
//     if (existingNamespaces.includes(namespace)) {
//       console.log(`Namespace ${namespace} exists in Pinecone vector DB.`);
//       return true;
//     } else {
//       console.log(`Namespace ${namespace} does not exist in Pinecone vector DB.`);
//       return false;
//     }
      
//     } catch (error) {
//       console.error("Error checking namespace existence:", error);
//       throw error;
//     }
// }