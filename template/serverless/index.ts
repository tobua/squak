import express from 'express'
import index from './api'
import today from './api/today'
import user from './api/hello/[user]'

const app = express()
const port = process.env.PORT || 3000

// @ts-ignore
app.get('/', index)
// @ts-ignore
app.get('/today', today)
// @ts-ignore
app.get('/hello/:user', user)

app.listen(port, () => console.log(`Running on http://localhost:${port}`))
