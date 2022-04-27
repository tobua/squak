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
npm init --yes now squak
// Additional options:
npm init --yes now squak [./my-web-server] [template = 'default' | 'empty' | 'full' | 'graphql']
```

The default template includes a basic [`express`](http://npmjs.com/express) server. Here are the [templates](https://github.com/tobua/squak/tree/main/template).

## Usage

### `npm start`

Run the compiler and the node server in watch mode. Use this for development.

### `npm run production` | `npx squak production`

Build the project, prune devDependencies and then run the server.

### `npm test` (if tests found) | `npx squak test`

Run tests with `jest`.

### `npx squak lint`

Lint all files in the project with `ESLint` and format them with [`Prettier`](https://prettier.io/docs/en/options.html).

### `npx squak build`

Build the project by compiling the TypeScript source files.

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
        // Folder where tests are located, default 'test', false to disable tests.
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

Changes for configuration files will be applied each time before a script is run. `tsconfig.json` is best configured through the `package.json` -> `squak` property. [`ESLint`](https://eslint.org/docs/user-guide/configuring) and [`jest`](https://jestjs.io/docs/configuration) can directly be adapted in their respective fields in `package.json` which will be added upon installation.
