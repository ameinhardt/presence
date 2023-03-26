The node.js backend

## Configuration
All configurations can be stored in .env files. For facilitating the development, multiple files can be used. The first file that exists in this directory will be used out of:\
`.env.${NODE_ENV}.local`, `.env.${NODE_ENV}`, `.env.local` or `.env`.

`SIGN_CERT` is the base64 encoded backend public key to validate requests to this service backend.

In order to e.g. allow secure cookies on a non-secure communication, `PROXY` must be set to true. Usually that is the case in an app service cloud environment.

## Development
```
npm run dev
```
Starts a nodemon watcher and typescript transpilation

## Build
```
npm run dev:build
```
Builds the deliverables by transpiling the deliverables

```
npm run build
```
Transpiles typescript, bundles and uglifies the deliverables

## Run
```
node index
```
Runs the builds
