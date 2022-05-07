import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(request: VercelRequest, response: VercelResponse) {
  const date = new Date()
  response.status(200).json({
    today: date.toLocaleDateString(),
  })
}
