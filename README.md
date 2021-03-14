# squak

<img align="right" src="https://github.com/tobua/squak/raw/main/logo.png" width="20%" alt="Squak Logo" />

Setup and build modern Web Servers in TypeScript.

- ESLint, Prettier
- TypeScript Configuration
- Watcher
- Production Standalone Build
- All just by installing it...

## Installation

### Existing TypeScript Project

```
npm install squak --save-dev
```

This will automatically adapt your `package.json` and create the necessary configuration files.

### New Project

```js
// Bootstrap the default template in the current directory.
npm init now squak
// Additional options:
npm init now squak [./my-web-server] [template = 'default' | 'empty' | 'graphql' | 'nestjs']
```

The default template includes a basic [`express`](http://npmjs.com/express) server.

## Usage

### `npm start`

Run the compiler and the node server in watch mode. Use this for development.

### `npx squak build`

Build the project by compiling the TypeScript source files.

### `npx squak production`

Build the project, prune devDependencies and then run the server.

### `npx squak test` | `npm test` (if tests found)

Run tests with `jest`.

### `npx squak lint`

Lint all files in the project with ESLint and format them with Prettier.

## Configuration

This plugin provides an extensive set of configurations aimed at working in various environments. However the configurations can easily be extended by adding a `squak` property to your `package.json`.

```js
{
    "name": "my-web-server",
    "squak": {
        // What's the name of the entry file, automatically adds [src/]?index.ts file if available.
        entry: 'my-server.ts',
        entry: ['rest-server.ts', 'graphql-server.ts'],
        // Output directory for compiled files, default 'dist'.
        output: 'node-server',
        // Folder where tests are located, default 'test'.
        test: 'spec',
        // Overrides for the TypeScript configuration.
        tsconfig: {
            compilerOptions: {
                moduleResolution: 'node'
            }
        },
        // Additional entries to be added to gitignore, default none.
        // Can also be entered directly into .gitignore file.
        gitignore: [],
    }
}
```

Changes for configuration files will be applied each time before a script is run.
