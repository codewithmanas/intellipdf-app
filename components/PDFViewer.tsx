"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2Icon,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDFViewer = ({ url }: { url: string }) => {
  const [file, setFile] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const fetchFile = async () => {
      const response = await fetch(url);
      const data = await response.blob();

      setFile(data);
    };

    fetchFile();
  }, [url]);

  // We need to configure CORS
  // gsutil cors set cors.json gs://all-testing-projects-a9a1b.firebasestorage.app
  // gsutil cors set cors.json gs://all-testing-projects-a9a1b.firebasestorage.app
  // go here >>> https://console.cloud.google.com/
  // create new file in editor calls cors.json
  // run >>> // gsutil cors set cors.json gs://all-testing-projects-a9a1b.firebasestorage.app
  // https://firebase.google.com/docs/storage/web/download-files#cors_configuration

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  function zoomIn() {
    if (scale >= 2) {
      return;
    }

    setScale((prevScale) => prevScale + 0.2);
  }

  function zoomOut() {
    if (scale <= 0.6) {
      return;
    }

    setScale((prevScale) => prevScale - 0.2);
  }

  function rotate() {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  }

  function goToPrevPage() {
    if (pageNumber > 1) {
      setPageNumber((prevPageNumber) => prevPageNumber - 1);
    }
  }

  function goToNextPage() {
    if (pageNumber < numPages!) {
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={zoomOut}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-5 w-5 text-slate-600" />
          </button>

          <button
            onClick={zoomIn}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-5 w-5 text-slate-600" />
          </button>

          <button
            onClick={rotate}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Rotate"
          >
            <RotateCw className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        <div className="flex items-center space-x-4 ">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>

          <span className="text-sm text-slate-600">
            Page {pageNumber} of {numPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages!}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* PDFViewer */}
      <div className="flex justify-center border rounded-xl bg-slate-50 overflow-auto max-h-[calc(100vh-300px)]">
        {!file ? (
          <>
            <Loader2Icon className="animate-spin h-15 w-15 text-blue-500 mt-10" />
          </>
        ) : (
          <Document
            loading={null}
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            className="mx-auto"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              className="shadow-lg"
            />
          </Document>
        )}
      </div>
    </>
  );
};

export default PDFViewer;
