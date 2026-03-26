"use client";
import { generateEmbeddings } from "@/actions/generateEmbeddings";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export enum StatusText {
  UPLOADING = "Uploading file...",
  UPLOADED = "File uploaded successfully",
  SAVING = "Saving file to database...",
  GENERATING = "Generating AI Embeddings, This will only take a few seconds...",
}

export type Status = StatusText[keyof StatusText];

export function useUpload() {
  const [progress, setProgress] = useState<number | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

  // Get the loggedin user
  const { user } = useUser();

  const handleUpload = async (file: File) => {
    if (!file || !user) return;

    // TODO: FREE/PRO Limitations...

    try {
      setStatus(StatusText.UPLOADING);
      setProgress(0);

      const fileIdForUploadedFile = uuidv4();
      const fileName = `${fileIdForUploadedFile}-${file.name}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("intellipdf-files")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      setProgress(100);
      setStatus(StatusText.UPLOADED);

      // small delay (important)
      await new Promise((res) => setTimeout(res, 200));

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

      // Save to DB
      setStatus(StatusText.SAVING);

      const { error: dbError } = await supabase.from("files").insert({
        user_id: user.id,
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
        download_url: downloadUrl,
      });

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      setStatus(StatusText.GENERATING);
      await generateEmbeddings(fileIdForUploadedFile);

      setFileId(fileIdForUploadedFile);
    } catch (error) {
      console.error("File upload failed:", error);
      setStatus(null);
      setProgress(null);
    }
  };

  return { progress, fileId, status, handleUpload };
}
