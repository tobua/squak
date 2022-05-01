import { execSync } from 'child_process'
import tcpPortUsed from 'tcp-port-used'
import {
  prepare,
  environment,
  packageJson,
  file,
  wait,
  listFilesMatching,
  writeFile,
  contentsForFilesMatching,
} from 'jest-fixture'
import getPort from 'get-port'
import { configure } from '../configure'
import { start } from '../script/start'
import { clearCache } from '../helper'

environment('start')

afterEach(clearCache)

// Increase async timeout.
jest.setTimeout(50000)

const expressApp = (port: number) => `import express from 'express'
const app = express()
app.get('/', (_request, response) => response.send('Hello World!'))
app.listen(${port}, () => console.log('running'))`

test('Server starts, rebuilds and reboots on file change.', async () => {
  const port = await getPort({ port: 5000 })
  const { dist } = prepare([
    packageJson('start', {
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

  // Port is free before starting server.
  expect(await tcpPortUsed.check(port)).toEqual(false)

  const close = await start()

  const distFiles = listFilesMatching('*.js', dist)

  expect(distFiles.length).toEqual(1)

  // Wait 3 seconds for the watcher and server to start.
  await wait(5)

  // Port is used by server.
  expect(await tcpPortUsed.check(port)).toEqual(true)

  const newPort = port + 1

  // Port is free before restarting server.
  expect(await tcpPortUsed.check(newPort)).toEqual(false)

  writeFile('index.ts', expressApp(newPort))

  // Wait for watcher to pick up the change, rebuild and restart the server.
  await wait(10)

  // Port is used by server.
  expect(await tcpPortUsed.check(newPort)).toEqual(true)
  // Old port is freed up.
  expect(await tcpPortUsed.check(port)).toEqual(false)

  const contents = contentsForFilesMatching('*.js', dist)

  // File changes written to disk.
  expect(contents[0].contents).toContain(String(newPort))

  // Close the server process.
  close()
})
