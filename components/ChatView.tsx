"use client";
import { askQuestion } from "@/actions/askQuestion";
import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { collection, orderBy, query } from "firebase/firestore";
import { Loader2Icon, Send } from "lucide-react";
import React, { useEffect, useState, useTransition } from "react";
import { useCollection } from "react-firebase-hooks/firestore";

export interface Message {
  id?: string;
  role: "human" | "ai" | "placeholder";
  text: string;
  createdAt: Date;
}
// Placeholder Message
const placeholderMessage = {
  id: Date.now().toString(),
  role: "placeholder",
  text: "Hi, How can I help you?",
  createdAt: new Date(),
} as Message;

const ChatView = ({ id }: { id: string }) => {
  const { isSignedIn, user, isLoaded } = useUser();

  // console.log("user: ", user)

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, "intellipdf_users", user?.id, "files", id, "chat"),
        orderBy("createdAt", "asc")
      )
  );

  useEffect(() => {
    if (!snapshot) return;

    console.log("Updated Snapshot: ", snapshot.docs);

    const lastMessage = messages.pop();

    if(lastMessage?.role === "ai" && lastMessage.text === "Thinking...") {
      return;
    }

    const newMessages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role,
        text: data.text,
        createdAt: data.createdAt.toDate(),
      };
    });


    // setMessages((prev) => [...prev, ...newMessages]);
    setMessages(newMessages);

    // setMessages(prev => {
    //   const newMessages = snapshot.docs.map((doc) => {
    //     const data = doc.data();
    //     return {
    //       id: doc.id,
    //       role: data.role,
    //       text: data.text,
    //       createdAt: data.createdAt.toDate(),
    //     };
    //   });
    //   return [...prev, ...newMessages];
    // });

  }, [snapshot]);

  useEffect(() => {
    setMessages((prev) => [...prev, placeholderMessage]);
  }, []);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Sign in to view this page</div>;
  }

  // Function to send message to Firebase DB
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const q = input.trim();

    setInput("");

    // Optimistically add the message to the UI
    // User Message
    const userMessage = {
      role: "human",
      text: q,
      createdAt: new Date(),
    } as Message;

    // Thinking Message
    const thinkingMessage = {
      role: "ai",
      text: "Thinking...",
      createdAt: new Date(),
    } as Message;

    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      thinkingMessage,
    ]);

    // Ask Question to Langchain
    startTransition(async () => {
        const { success, message } = await askQuestion(id, q);

        if(!success) {
          console.log("error: ", message);

          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages.pop(); // Remove the thinking message

            updatedMessages.push({
              role: "ai",
              text: `Whoops... ${message}`,
              createdAt: new Date(),
            });
            return updatedMessages;
          });

        }


    });

  };

  return (
    <>
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Chat with IntelliPDF AI
        </h2>
        <p className="text-sm text-slate-600">Ask questions about your PDF</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4 max-h-[500px]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "human" ? "justify-end" : "justify-start"
            }`}
          >
            <p
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === "human"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-900"
              } ${
                message.text === "Thinking..." && message.role === "ai"
                  ? "animate-pulse"
                  : ""
              }`}
            >
              {message.text} <br />{" "}
              <small>{message.createdAt.toLocaleString()}</small>
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-slate-200"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 text-slate-600 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            disabled={!input || isPending}
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            {isPending ? (
              <Loader2Icon className="animate-spin text-blue-500" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default ChatView;
