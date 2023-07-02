import { existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import tcpPortUsed from 'tcp-port-used'
import { test, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  registerVitest,
  prepare,
  environment,
  packageJson,
  file,
  wait,
  listFilesMatching,
} from 'jest-fixture'
import { configure } from '../configure'
import { production } from '../script/production'
import { clearCache } from '../helper'

registerVitest(beforeEach, afterEach, vi)

environment('production')

afterEach(clearCache)

const expressApp = (port: number) => `import express from 'express'
const app = express()
app.get('/', (_request, response) => response.send('Hello World!'))
app.listen(${port}, () => console.log('running'))`

test('DevDependencies are pruned after build and server is running.', async () => {
  const port = 5823
  const { dist } = prepare([
    packageJson('production', {
      dependencies: {
        express: 'latest',
      },
      devDependencies: {
        '@types/express': 'latest',
      },
    }),
    file('index.ts', expressApp(port)),
  ])

  configure()

  // Install dependencies.
  execSync('npm install', { stdio: 'inherit', cwd: process.cwd() })

  expect(existsSync(join(process.cwd(), 'node_modules/express'))).toEqual(true)
  expect(existsSync(join(process.cwd(), 'node_modules/@types/express'))).toEqual(true)

  // Port is free before starting server.
  expect(await tcpPortUsed.check(port)).toEqual(false)

  const close = await production()

  const distFiles = listFilesMatching('*.js', dist)

  expect(distFiles.length).toEqual(1)

  expect(existsSync(join(process.cwd(), 'node_modules/express'))).toEqual(true)
  expect(existsSync(join(process.cwd(), 'node_modules/@types/express'))).toEqual(false)

  // Wait 1 second for the server to start.
  await wait(1)

  // Port is used by server.
  expect(await tcpPortUsed.check(port)).toEqual(true)

  // Close the server process.
  close()
}, 10000)
