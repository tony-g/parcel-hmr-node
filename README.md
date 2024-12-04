* `yarn start` which runs `parcel watch` to repro
* This produces `dist/node.js` with hmr-runtime (which besides being unnecessary, can crash since `location` isn't necessarily defined in node)
* Uncommenting copy/pasted `runtime-browser-hmr.js` from `.parcelrc` seems to fix, but obviously not ideal to have to copy/paste
