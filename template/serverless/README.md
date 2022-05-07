# Squak Serverless Example for Vercel

## `npm run local:serverless`

Runs a local Vercel serverless instance closely resembling the environment when deployed. This will prompt to login to Vercel and link the project for later deployment.

## `npm run local:node`

Runs a local express server importing the API routes and mostly matching the serverless environment on Vercel. Simply an alias for `npx squak start`.

## `npm run deploy`

Deploys the application to Vercel.

## Routes

The `vercel.json` configuration file routes all requests directly to the `/api` folder. The template includes the following routes:

- `/` Runs `api/index.ts`
- `/today` Runs `api/today.ts`
- `/hello/:name` Runs `api/hello/[today].ts`, name can be any string
