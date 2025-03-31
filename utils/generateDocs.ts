import { adminDb } from "@/firebaseAdmin";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function generateDocs(docId: string, userId: string) {

    try {

        console.log("----- Fetching the download URL from Firebase... -----");

        const docRef = adminDb.doc(`intellipdf_users/${userId}/files/${docId}`); // Direct path to the nested document
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.log("No such document!");
            throw new Error("No such document exists!");
        }

        const existingDocument = docSnap.data();

        if(!existingDocument?.downloadUrl) {
            throw new Error("Download URL not found");
        }

        console.log(`--- Download URL fetched successfully: ${existingDocument?.downloadUrl} ---`);

        // Fetch the PDF from the specified URL
        const response = await fetch(existingDocument?.downloadUrl);

        // Convert the response to a Blob
        const data = await response.blob();

        // Load the PDF document from the specified path
        console.log("--- Loading the PDF document... ---");

        // Pass the Blob object to PDFLoader
        const loader = new PDFLoader(data);
        const docs = await loader.load();

        // console.log("docs to pass in the splitter: ", docs);

        // Example output:
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

        // Example output:
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