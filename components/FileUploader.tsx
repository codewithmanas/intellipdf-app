"use client";
import { StatusText, useUpload } from "@/hooks/useUpload";
import { CheckCircleIcon, CircleArrowDown, HammerIcon, RocketIcon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";


const FileUploader = () => {
    const { progress, fileId, status, handleUpload } = useUpload();
    const router = useRouter();

    useEffect(() => {
            if(fileId) {
                router.push(`/dashboard/file/${fileId}`);
            }
    }, [fileId, router]);


    // Function to handle file upload
    const handleFileAccepted = useCallback(async (acceptedFiles: File[]) => {

        const file = acceptedFiles[0];

        if(file) {
            await handleUpload(file);
        } else {
            console.error("Failed to upload file");
        }

    }, [handleUpload]);

    // dropzone functionality
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleFileAccepted,
        maxFiles: 1,
        accept: {
        "application/pdf": [".pdf"],
        },
    });

  const statusIcons: {[key in StatusText] : React.ReactElement} = {
    [StatusText.UPLOADING]: <RocketIcon className="h-15 w-15 text-blue-500" />,
    [StatusText.UPLOADED]: <CheckCircleIcon className="h-15 w-15 text-blue-500" />,
    [StatusText.SAVING]: <SaveIcon className="h-15 w-15 text-blue-500" />,
    [StatusText.GENERATING]: <HammerIcon className="h-15 w-15 text-blue-500 animate-bounce" />,
}

    // to check progress of file upload
    const uploadInProgress = progress != null && progress >= 0 && progress <= 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    {uploadInProgress && (
                <div className="flex flex-col justify-center items-center gap-5">
                <div 
                    className={`text-blue-500 ${ progress === 100 ? "hidden" : ""}`}
                    role="progressbar"
                >
                    {progress} %
                </div>

                {
                    // @ts-expect-error giving errors
                    statusIcons[status!]
                }

                {/* @ts-expect-error giving errors */}
                <p className="text-blue-500 animate-pulse">{status}</p>
            </div>
            )}


    {!uploadInProgress && (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg text-slate-400 p-8 text-center cursor-pointer transition-colors
                ${
                isDragActive
                    ? "bg-blue-100 border-blue-500"
                    : "border-slate-400 hover:border-blue-500 hover:text-blue-500 bg-blue-50 hover:bg-blue-100"
                }
                `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center">
                    {isDragActive ? ( 
                        <>
                            <RocketIcon className="h-15 w-15 animate-ping text-blue-500" />
                            <p className="text-blue-500">Drop the files here ...</p>
                        </>
                        ) : (
                            <>
                                <CircleArrowDown className="h-15 w-15 animate-bounce" />
                                <p>Drag {`'n'`} drop some files here, or click to select files</p>
                            </>
                        )}
            </div>
        </div>
        )}
    </div>
  );
};

export default FileUploader;
