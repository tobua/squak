import request from 'supertest'
import app from '../app'

test('Returns hello world.', async () => {
  const response = await request(app).get('/')
  expect(response.statusCode).toEqual(200)
  expect(response.text).toContain('Hello World')
})
