// @flow strict-local

const { Runtime } = require('@parcel/plugin')
const fs = require('fs')
const path = require('path')

// Without this, the hmr-runtime.js is transpiled with the React Refresh swc transform because it
// lives in `/app/packages/runtimes/...` and thus the `config` in the JSTransformer is actually the
// user's package.json, and hmr-runtime.js is transpiled as a JSX asset.
const FILENAME =
  // $FlowFixMe
  process.env.PARCEL_BUILD_REPL && process.browser
    ? '/' + __filename
    : __filename

const HMR_RUNTIME = fs.readFileSync(
  path.join(
    __dirname,
    './node_modules/@parcel/runtime-browser-hmr/lib/loaders/hmr-runtime.js'
  ),
  'utf8'
)

module.exports = new Runtime({
  apply({ bundle, options }) {
    if (
      bundle.type !== 'js' ||
      !options.hmrOptions ||
      bundle.env.isLibrary ||
      bundle.env.isWorklet() ||
      bundle.env.sourceType === 'script' ||
      bundle.env.context === 'node'
    ) {
      return
    }

    const { host, port } = options.hmrOptions
    return {
      filePath: FILENAME,
      code:
        `var HMR_HOST = ${JSON.stringify(
          host != null && host !== '0.0.0.0' ? host : null
        )};` +
        `var HMR_PORT = ${JSON.stringify(
          port != null &&
            // Default to the HTTP port in the browser, only override
            // in watch mode or if hmr port != serve port
            (!options.serveOptions || options.serveOptions.port !== port)
            ? port
            : null
        )};` +
        `var HMR_SECURE = ${JSON.stringify(
          !!(options.serveOptions && options.serveOptions.https)
        )};` +
        `var HMR_ENV_HASH = "${bundle.env.id}";` +
        `var HMR_USE_SSE = ${
          // $FlowFixMe
          JSON.stringify(!!(process.env.PARCEL_BUILD_REPL && process.browser))
        };` +
        `module.bundle.HMR_BUNDLE_ID = ${JSON.stringify(bundle.id)};` +
        HMR_RUNTIME,
      isEntry: true,
      env: {
        sourceType: 'module',
      },
    }
  },
})
