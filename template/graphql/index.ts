import express from 'express'
import { graphqlHTTP } from 'express-graphql' // Deprecated, use graphql-http (is missing graphiql UI used below).
import { buildSchema } from 'graphql'

// Also consider using the more popular apollo-server-express package.
// https://www.apollographql.com/docs/apollo-server/api/express-middleware

const schema = buildSchema(`
  type Query {
    greeting: String
  }
`)

// Resolver methods for endpoints.
const root = {
  greeting: () => 'Hello World!',
}

const app = express()
const port = process.env.PORT || 3000

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    // Show UI when opening in browser.
    graphiql: true,
  })
)

app.listen(port, () => console.log(`Running on http://localhost:${port}/graphql`))
