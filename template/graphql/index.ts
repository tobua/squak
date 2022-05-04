import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { buildSchema } from 'graphql'

// Also consider using the more popular apollo-server-express package.
// https://www.apollographql.com/docs/apollo-server/integrations/middleware#apollo-server-express

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
