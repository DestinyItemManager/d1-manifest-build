#!/bin/bash -eux

cd d1-manifests
for name in *.json; do gzip -9 -c --no-name $name > $name.gz; done
ls d1-manifest-*.json | xargs -n 1 brotli -f
