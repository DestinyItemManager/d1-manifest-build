# D1 Manifests Scripts

To update the D1 Manifest JSON

1. Install `brotli` (`brew install brotli`)
2. `yarn`
3. `API_KEY=<api key> node ./processBungieManifest.js`
4. `./compress.sh`
5. `mv d1-manifests/* ../DIM/src/data/d1/manifests/`
6. `cd ../DIM`
6. Modify `d1-manifest-service.ts` to have a new date on the manifest URL.
7. `git commit --no-verify -m'Update D1 Manifests'`
