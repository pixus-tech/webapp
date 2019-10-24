# pixus

## Development

In the project directory, you can run `npm install` to install the current
dependencies. This step does also build scripts that are imported from web
workers. Run `bin/build-workers.sh` when you change something in `src/worker-scripts`.

To prepare for running the app locally, add `127.0.0.1 pixus.local` to your
`/etc/hosts` file.

`npm start` runs the app in development mode. The page will reload if you make
edits. You will also see any lint errors in the console.

`npm test` launches the test runner in the interactive watch mode.
