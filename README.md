# D1 Manifests Scripts

To update the D1 Manifest JSON

1. Install `brotli` (`brew install brotli`)
2. `yarn`
3. `API_KEY=<api key> node ./processBungieManifest.js`
4. `./compress.sh`
5. `mv d1-manifests/* ../DIM/src/data/d1/manifests/`
