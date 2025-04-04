"use server";

import { Message } from "@/components/ChatView";
import { adminDb } from "@/firebaseAdmin";
import { generateLangchainCompletion } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";

// const FREE_LIMIT = 3;
// const PRO_LIMIT = 100;


export async function askQuestion(id: string, question: string) {

    try {
        const { userId } = await auth();
          
        if (!userId) {
            throw new Error("You must be signed in to chat with Intellipdf");
        }


        // Fetch chat messages of user from firestore
        const docRef = adminDb.collection(`intellipdf_users/${userId}/files/${id}/chat`); // Direct path to the nested document
        const docSnap = await docRef.get();

        if (docSnap.empty) {
            console.log("No such document exists!");
            // throw new Error("No such document exists!");
        }

        const existingChatCollection = docSnap.docs.map((doc) => doc.data());

        const userChatCollection = existingChatCollection.filter((doc) => doc.role === "human");


        // limit the FREE/PRO users
        if(userChatCollection.length >= 10) {
            throw new Error("You have reached the maximum number of questions. Please upgrade to PRO to continue.");
        }

        console.log("question: ", question);

        const userMessage: Message = {
            role: "human",
            text: question,
            createdAt: new Date(),
        };

        // Add user message to firestore
        await docRef.add(userMessage);


        // Generate AI Response
        const reply = await generateLangchainCompletion(id, question);


        const aiMessage: Message = {
            role: "ai",
            text: reply!,
            createdAt: new Date(),
        };

        // Add AI response to firestore
        await docRef.add(aiMessage);
    
        return { success: true, message: null };
        
    } catch (error) {
        console.log("ask question error: ", error);
        return { success: false, message: error };
    }
}