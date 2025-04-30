declare module 'pdf-parse/lib/pdf-parse' {
    interface PDFParseOptions {
      max?: number;
      version?: string;
    }
  
    interface PDFParseResult {
      numpages: number;
      numrender: number;
      info: object;
      metadata: object;
      version: string;
      text: string;
    }
  
    function pdf(buffer: Buffer, options?: PDFParseOptions): Promise<PDFParseResult>;
  
    export default pdf;
  }
  