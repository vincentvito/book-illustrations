import { PDFParse } from 'pdf-parse'
import mammoth from 'mammoth'

export async function parseFile(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'txt': {
      return new TextDecoder('utf-8').decode(buffer)
    }
    case 'pdf': {
      const parser = new PDFParse({ data: new Uint8Array(buffer) })
      const result = await parser.getText()
      return result.text
    }
    case 'docx': {
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    }
    default:
      throw new Error(`Unsupported file format: .${ext}`)
  }
}
