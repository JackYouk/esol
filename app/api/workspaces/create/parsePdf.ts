import PDFParser from 'pdf2json';

interface ParserError {
  parserError: string | Error;
}

interface PDFParseResult {
  text: string;        // Raw text content
  data: {             // Full PDF data with styling and structure
    Meta?: {          // PDF metadata
      PDFFormatVersion?: string;
      IsAcroFormPresent?: boolean;
      IsXFAPresent?: boolean;
      Creator?: string;
      Producer?: string;
      CreationDate?: string;
      ModDate?: string;
      Metadata?: Record<string, string>;
    };
    Pages: Array<{
      Height: number;
      Width: number;
      HLines: any[];
      VLines: any[];
      Fills: any[];
      Texts: any[];
      Fields: any[];
      Boxsets: any[];
    }>;
  };
}

export async function parsePDFContent(pdfBuffer: Buffer): Promise<PDFParseResult> {
  return new Promise((resolve, reject) => {
    // Initialize parser without raw text mode to get full data
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData: ParserError) => {
      reject(new Error(typeof errData.parserError === 'string' 
        ? errData.parserError 
        : errData.parserError.message));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        // Get both the raw text and the full parsed data
        const result: PDFParseResult = {
          text: pdfParser.getRawTextContent(),
          data: pdfData
        };
        resolve(result);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to get PDF content'));
      }
    });

    try {
      pdfParser.parseBuffer(pdfBuffer);
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Failed to parse PDF buffer'));
    }
  });
}