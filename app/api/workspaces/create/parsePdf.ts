import PDFParser from 'pdf2json';

interface ParserError {
  parserError: string | Error;
}

interface PDFParseResult {
  text: string;
}

export async function parsePDFContent(pdfBuffer: Buffer): Promise<PDFParseResult> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true);

    pdfParser.on("pdfParser_dataError", (errData: ParserError) => {
      reject(new Error(typeof errData.parserError === 'string' 
        ? errData.parserError 
        : errData.parserError.message));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        const text = pdfParser.getRawTextContent().replace(/\r\n/g, "\n");
        resolve({ text });
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