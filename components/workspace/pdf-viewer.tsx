"use client";

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSelectedText } from './selected-text-provider';
import _ from 'lodash';
import LearningToolbar from './toolbar';

interface PDFViewerProps {
  url: string;
  workspaceId: string;
  addMessage: (message: string) => void;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function DisplayPDFViewer({ url, workspaceId, addMessage }: PDFViewerProps) {
  const { value, setValue } = useSelectedText();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageNumberInputValue, setPageNumberInputValue] = useState<string>(pageNumber.toString());
  const [scale, setScale] = useState<number>(1.3);
  const [lastProcessedSelection, setLastProcessedSelection] = useState<string>("");
  
  // State for the floating toolbar’s position and visibility
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number; visible: boolean }>({
    top: 0,
    left: 0,
    visible: false,
  });

  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const isDoubleClick = useRef(false);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const isValidSelection = (text: string): boolean => {
    const trimmed = text.trim();
    return trimmed.length >= 2 && !trimmed.includes('\n') && /^\S+(\s+\S+)*$/.test(trimmed);
  };

  // Debounced function to update the selected text
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
        // Calculate the selection’s bounding rectangle
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setToolbarPosition({
            top: rect.top + window.scrollY - 40, // position 40px above selection
            left: rect.left + window.scrollX + rect.width / 2, // centered horizontally
            visible: true,
          });
        }
      }
    } else {
      // Clear the toolbar if selection is invalid or removed
      setToolbarPosition(prev => ({ ...prev, visible: false }));
      setValue("");
    }
  };

  const handleMouseDown = () => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      isDoubleClick.current = true;
      clickTimeout.current = null;
    } else {
      isDoubleClick.current = false;
      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null;
      }, 300);
    }
  };

  const handleMouseUp = () => {
    if (isDoubleClick.current || window.getSelection()?.type === 'Range') {
      processSelection();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout.current) clearTimeout(clickTimeout.current);
      debouncedSetValue.cancel();
    };
  }, [debouncedSetValue]);

  return (
    <div className="relative h-full w-full max-w-4xl mx-auto space-y-4">
      <div
        className="h-full bg-gray-50 overflow-auto max-h-[calc(100vh-12rem)] rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} scale={scale} className="flex justify-center" />
        </Document>
      </div>
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="min-w-[4rem] text-center">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="icon" onClick={() => setScale(prev => Math.min(2, prev + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setPageNumber(prev => Math.max(1, prev - 1))} disabled={pageNumber <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Input
              type="text"
              value={pageNumberInputValue}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^[0-9]+$/.test(value)) {
                  setPageNumberInputValue(value);
                }
              }}
              onBlur={() => {
                const parsedValue = parseInt(pageNumberInputValue, 10);
                if (isNaN(parsedValue) || parsedValue < 1 || parsedValue > numPages) {
                  setPageNumberInputValue(pageNumber.toString());
                } else {
                  setPageNumber(parsedValue);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const parsedValue = parseInt(pageNumberInputValue, 10);
                  if (isNaN(parsedValue) || parsedValue < 1 || parsedValue > numPages) {
                    setPageNumberInputValue(pageNumber.toString());
                  } else {
                    setPageNumber(parsedValue);
                  }
                }
              }}
              className="w-10 text-center"
            />
            <span className="text-sm text-muted-foreground">of {numPages}</span>
            <Button variant="outline" size="icon" onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))} disabled={pageNumber >= numPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="icon" asChild>
            <a href={url + "?download=1"} download rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Render the floating toolbar above the selected text */}
      {toolbarPosition.visible && value && (
        <LearningToolbar
          workspaceId={workspaceId}
          addMessage={addMessage}
          selectedText={value}
          position={{ top: toolbarPosition.top, left: toolbarPosition.left }}
          onClearSelection={() => {
            setValue("");
            setToolbarPosition(prev => ({ ...prev, visible: false }));
            if (window.getSelection) window.getSelection()?.removeAllRanges();
          }}
        />
      )}
    </div>
  );
}
