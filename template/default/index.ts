import express from 'express'

const app = express()

app.get('/', (_request, response) => {
  response.send('Hello World!')
})

app.listen(3000, () => console.log(`Running on http://localhost:3000`))
