import React from "react";
import { auth } from '@clerk/nextjs/server';
import { adminDb } from "@/firebaseAdmin";
import PDFViewer from "@/components/PDFViewer";
import { notFound } from "next/navigation";
// import { redirect } from "next/navigation";

const ChatToFilePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  auth.protect();

  const { userId, redirectToSignIn} = await auth();

  if(!userId) {
    return redirectToSignIn();
  }

 // Download the PDF from firestore via the stored Download URL 
  const docRef = adminDb.doc(`intellipdf_users/${userId}/files/${id}`); // Direct path to the nested document
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
      // throw new Error("No such document exists!");
      // redirect("/");
      notFound();
  }

      const existingDocument = docSnap.data();

      if(!existingDocument?.downloadUrl) {
        throw new Error("Download URL not found");
      }



  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* PDF Viewer Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200">
            <PDFViewer url={existingDocument?.downloadUrl} />
          </div>


          {/* Chat Section */}
          <div className="lg:col-span-1">
                Chat
          </div>


      </div>
    </div>
  );
};

export default ChatToFilePage;
