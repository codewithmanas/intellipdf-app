"use server";

import { generateEmbeddingsInPineconeVectorStore } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function generateEmbeddings(docId: string) {

    // Protect this action with Clerk
    const { userId } = await auth();

    if (!userId) {
        throw new Error("You must be signed in to generate embeddings");
    }

    // Generate embeddings and store in Pinecone
    await generateEmbeddingsInPineconeVectorStore(docId);

    revalidatePath("/dashboard");

    return { completed: true, message: "Embeddings generated successfully" };
}