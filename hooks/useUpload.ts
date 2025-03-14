"use client";
import { generateEmbeddings } from "@/actions/generateEmbeddings";
import { db, storage } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
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

    const fileIdForUploadedFile = uuidv4();
    const docFilePath = `intellipdf_users/${user.id}/files/${fileIdForUploadedFile}`;

    const docStorageRef = ref(storage, docFilePath);

    const uploadTask = uploadBytesResumable(docStorageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progressInPercent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        // console.log("UPLOADING...");
        setStatus(StatusText.UPLOADING);
        setProgress(progressInPercent);

        if(progressInPercent === 100) {
          // console.log("UPLOADED...")
          setStatus(StatusText.UPLOADED);
        }

      },
      (error) => {
        console.error("Error uploading file", error);
      },
      async () => {

        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // console.log("SAVING...");
        setStatus(StatusText.SAVING);

        const userDocRef = doc(db, "intellipdf_users", user.id, "files", fileIdForUploadedFile);

        // setDoc method create or overwrite a single document,
        // If the document does not exist, it will be created,
        // If the document does exist, its contents will be overwritten with the newly provided data,
        // setDoc method does not return any promise
        await setDoc(userDocRef, {
          name: file.name,
          size: file.size,
          type: file.type,
          downloadUrl: downloadURL,
          ref: uploadTask.snapshot.ref.fullPath,
          createdAt: new Date(), // TODO: implement server timestamp - `timestamp: serverTimestamp()`
        });


        // console.log("GENERATING...");
        setStatus(StatusText.GENERATING);

        // TODO: Generate AI Embeddings...

        // const tempId = "04873930-93d0-4dfa-b7d8-500fc08fe123";
        // await generateEmbeddings(tempId);

        await generateEmbeddings(fileIdForUploadedFile);

        setFileId(fileIdForUploadedFile);
      }
    );
  };

  return { progress, fileId, status, handleUpload };
}
