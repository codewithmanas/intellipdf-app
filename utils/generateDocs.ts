import { adminDb } from "@/firebaseAdmin";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function generateDocs(docId: string, userId: string) {
    console.log("----- Fetching the download URL from Firebase... -----");

    try {
        const docRef = adminDb.doc(`intellipdf_users/${userId}/files/${docId}`); // Direct path to the nested document
        const docSnap = await docRef.get();

        console.log("docSnap: ", docSnap);
        console.log("docSnap.exists: ", docSnap.exists);


        if (!docSnap.exists) {
            console.log("No such document!");
            throw new Error("No such document exists!");
        }

    const existingDocument = docSnap.data();
    console.log("downloadURL: ", existingDocument?.downloadUrl);

    if(!existingDocument?.downloadUrl) {
        throw new Error("Download URL not found");
    }

    console.log(`--- Download URL fetched successfully: ${existingDocument?.downloadUrl} ---`);


    const response = await fetch(existingDocument?.downloadUrl);
    const data = await response.blob();
    // const data = await response.arrayBuffer();

    // Convert Blob to ArrayBuffer
    // const arrayBuffer = await data.arrayBuffer();   

    console.log("----- Loading the PDF document... -----");

    // Pass the ArrayBuffer to PDFLoader
    const loader = new PDFLoader(data);
    const docs = await loader.load();

    console.log("docs to pass in splitter: ", docs);

    // [
    //     { "pageContent": "Long paragraph of text...", "metadata": { "source": "file1.txt" } }
    //   ]

    // Split the document
    console.log("----- Splitting the document into smaller parts... -----");

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // [
    //     {
    //       "pageContent": "Long paragraph of text split into chunk 1.",
    //       "metadata": { "source": "file1.txt" }
    //     },
    //     {
    //       "pageContent": "Chunk 2 of the original document.",
    //       "metadata": { "source": "file1.txt" }
    //     }
    //   ]

    console.log(`----- Split into ${splitDocs.length} parts... -----`);

    return splitDocs;
        
    } catch (error) {
        console.log("Error Generating Docs for Splitting: ", error);
        throw error;
    }

}