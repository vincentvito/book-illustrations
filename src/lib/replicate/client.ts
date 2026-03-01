import Replicate from 'replicate'

let _replicate: Replicate | null = null

export function getReplicate(): Replicate {
  if (!_replicate) {
    _replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
    })
  }
  return _replicate
}
