"use client";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PDFViewerProps {
  url: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function DIsplayPDFViewer({ url }: PDFViewerProps) {

  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const handleTextSelection = () => {
    const selectedText = window.getSelection()?.toString();
    if (selectedText) {
      console.log("Selected text:", selectedText);
    }
  };
  // url = "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
  return (
    <div className="h-full w-full max-w-4xl mx-auto space-y-4">
      <div
        className="h-full bg-gray-50 overflow-auto max-h-[calc(100vh-12rem)] rounded-lg"
        onMouseUp={handleTextSelection}
      >

        <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
          >
            <Search className="h-4 w-4 rotate-0" />
          </Button>
          <span className="min-w-[4rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
          >
            <Search className="h-4 w-4 rotate-90" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min={1}
            max={numPages}
            value={pageNumber}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= numPages) {
                setPageNumber(value);
              }
            }}
            className="w-16 text-center"
          />
          <span className="text-sm text-muted-foreground">of {numPages}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPageNumber((prev) => Math.min(numPages, prev + 1))}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="icon" asChild>
          <a href={url} download target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
