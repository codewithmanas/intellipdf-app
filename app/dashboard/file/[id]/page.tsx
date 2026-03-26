import React from "react";
import { auth } from "@clerk/nextjs/server";
import PDFViewer from "@/components/PDFViewer";
import { notFound } from "next/navigation";
import ChatView from "@/components/ChatView";
import { supabase } from "@/lib/supabase";

const ChatToFilePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  // Download the PDF from database via the stored Download URL
  const { data: dbData, error: dbError } = await supabase
    .from("files")
    .select("path")
    .eq("user_id", userId)
    .eq("doc_id", id)
    .single();

  if (dbError) {
    throw dbError;
  }

  if (!dbData?.path) {
    // throw new Error("File path not found");
    notFound();
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

  const downloadUrl = fileData?.signedUrl || "";

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PDF Viewer Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <PDFViewer url={downloadUrl} />
        </div>

        {/* Chat Section */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-200px)] lg:h-auto">
          <ChatView id={id} />
        </div>
      </div>
    </div>
  );
};

export default ChatToFilePage;
