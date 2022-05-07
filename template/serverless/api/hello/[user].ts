import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(
  request: VercelRequest & { params?: any },
  response: VercelResponse
) {
  const inputs = request.params || request.query
  const { user } = inputs as { user?: string }

  if (!user) {
    return response.status(500).json({
      error: 'Missing user query parameter.',
    })
  }

  return response.status(200).json({
    hello: user,
  })
}
