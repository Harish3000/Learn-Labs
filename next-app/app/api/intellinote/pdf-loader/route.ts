import { NextResponse } from 'next/server'
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { NextRequest } from 'next/server';

// interface Request {
//     url: string;
// }

export async function GET(req: NextRequest) {
    const reqUrl = req.url;
    const { searchParams } = new URL(reqUrl);
    const pdfUrl = searchParams.get('pdfUrl');
    console.log("Pdf Url", pdfUrl);

    // 1. Load the PDF file
    if (!pdfUrl) {
        return NextResponse.json({ error: 'pdfUrl query parameter is missing' }, { status: 400 });
    }
    const response = await fetch(pdfUrl);
    const data = await response.blob();
    const loader = new WebPDFLoader(data);
    const docs = await loader.load();

    let pdfTextContext = '';
    docs.forEach(doc => {
        pdfTextContext = pdfTextContext + doc.pageContent + " ";
    });

    // 2. Split the Text into Smaller chunks
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 20,
    });

    const output = await splitter.createDocuments([pdfTextContext]);

    let splitterList: string[] = [];
    output.forEach(doc => {
        splitterList.push(doc.pageContent);
    });

    return NextResponse.json({ result: splitterList });
}
