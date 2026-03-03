const ALLOWED_HOSTS = [
  'replicate.delivery',
  'pbxt.replicate.delivery',
  'replicate.com',
  'aisguzxdeuzremvdvepf.supabase.co',
]

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
  /^fd/,
  /^localhost$/i,
]

export function validateImageUrl(urlString: string): void {
  let url: URL
  try {
    url = new URL(urlString)
  } catch {
    throw new Error('Invalid image URL')
  }

  if (url.protocol !== 'https:') {
    throw new Error('Only HTTPS URLs are allowed')
  }

  const hostname = url.hostname

  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      throw new Error('Private/internal URLs are not allowed')
    }
  }

  if (!ALLOWED_HOSTS.some(allowed => hostname === allowed || hostname.endsWith('.' + allowed))) {
    throw new Error(`Host not allowed: ${hostname}`)
  }
}
