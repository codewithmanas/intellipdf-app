import { supabase } from "@/lib/supabase";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function generateDocs(docId: string, userId: string) {
  try {
    console.log("----- Fetching the download URL from the database... -----");

    const { data: dbData, error: dbError } = await supabase
      .from("files")
      .select("path")
      .eq("user_id", userId)
      .eq("doc_id", docId)
      .single();

    if (dbError) {
      throw dbError;
    }

    if (!dbData?.path) {
      throw new Error("File path not found");
    }

    const filePath = dbData?.path;

    const { data: fileData, error: fileDataError } = await supabase.storage
      .from("intellipdf-files")
      .createSignedUrl(filePath, 60 * 60);

    if (fileDataError) {
      console.error("Signed URL error:", fileDataError);
      // throw fileDataError;
    }

    if (!fileData?.signedUrl) {
      console.error("Failed to generate signed URL");
      // throw new Error("Failed to generate signed URL");
    }

    const downloadUrl = fileData?.signedUrl;


    console.log(
      `--- Download URL fetched successfully: ${downloadUrl} ---`,
    );

    // Fetch the PDF from the specified URL
    const response = await fetch(downloadUrl as string);

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
