"use client";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSelectedText } from './selected-text-provider';
import { LearningToolbar } from './toolbar';
import _ from 'lodash';
import { Message } from '@prisma/client';

interface PDFViewerProps {
  url: string;
  workspaceId: string
  addMessage: (message: string) => void
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


export function DisplayPDFViewer({ url, workspaceId, addMessage }: PDFViewerProps) {
  const { value, setValue } = useSelectedText();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageNumberInputValue, setPageNumberInputValue] = useState<string>(pageNumber.toString()); // Temporary input state
  const [scale, setScale] = useState<number>(1.0);
  const [lastProcessedSelection, setLastProcessedSelection] = useState<string>("");

  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const isDoubleClick = useRef(false);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const isValidSelection = (text: string): boolean => {
    const trimmed = text.trim();
    return trimmed.length >= 2 && !trimmed.includes('\n') && /^\S+(\s+\S+)*$/.test(trimmed);
  };

  // Debounced function to update selected text
  const debouncedSetValue = useCallback(
    _.debounce((text: string) => {
      if (text !== lastProcessedSelection) {
        setValue(text);
        setLastProcessedSelection(text);
      }
    }, 300),
    [setValue, lastProcessedSelection]
  );

  const processSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || "";

    if (selectedText && isValidSelection(selectedText)) {
      const trimmedText = selectedText.trim();
      if (trimmedText !== lastProcessedSelection) {
        debouncedSetValue(trimmedText);
      }
    }
  };

  const handleMouseDown = () => {
    // Reset double click state
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      isDoubleClick.current = true;
      clickTimeout.current = null;
    } else {
      isDoubleClick.current = false;
      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null;
      }, 300); // 300ms is typical double-click threshold
    }
  };

  const handleMouseUp = () => {
    // Only process selection if it's a double click or if the user dragged to select
    if (isDoubleClick.current || window.getSelection()?.type === 'Range') {
      processSelection();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
      }
      debouncedSetValue.cancel();
    };
  }, [debouncedSetValue]);


  return (
    <div className="h-full w-full max-w-4xl mx-auto space-y-4">
      <div
        className="h-full bg-gray-50 overflow-auto max-h-[calc(100vh-12rem)] rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
          <Page
            pageNumber={pageNumber}
            scale={scale}
            className="flex justify-center"
          />
        </Document>
      </div>
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
            >
              <ZoomOut className="h-4 w-4 rotate-0" />
            </Button>
            <span className="min-w-[4rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
            >
              <ZoomIn className="h-4 w-4 rotate-90" />
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
              type="text"
              value={pageNumberInputValue}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty input or numeric input
                if (value === "" || /^[0-9]+$/.test(value)) {
                  setPageNumberInputValue(value); // Update the temporary input state
                }
              }}
              onBlur={() => {
                const parsedValue = parseInt(pageNumberInputValue, 10);
                // Reset to the closest valid number if the input is invalid or empty
                if (isNaN(parsedValue) || parsedValue < 1 || parsedValue > numPages) {
                  setPageNumberInputValue(pageNumber.toString()); // Reset to the last valid page number
                } else {
                  setPageNumber(parsedValue); // Update the main page number state
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const parsedValue = parseInt(pageNumberInputValue, 10);
                  // Reset to the closest valid number if the input is invalid or empty
                  if (isNaN(parsedValue) || parsedValue < 1 || parsedValue > numPages) {
                    setPageNumberInputValue(pageNumber.toString()); // Reset to the last valid page number
                  } else {
                    setPageNumber(parsedValue); // Update the main page number state
                  }
                }
              }}
              className="w-10 text-center"
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
            <a href={url + "?download=1"} download rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
        <LearningToolbar workspaceId={workspaceId} addMessage={addMessage} />
      </div>
    </div>
  );
}