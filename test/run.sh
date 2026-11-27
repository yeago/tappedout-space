#!/bin/sh
# Run the browser tests in Playwright's Docker image (no Node needed on the host).
set -e
cd "$(dirname "$0")/.."
exec docker run --rm -v "$PWD":/repo:ro mcr.microsoft.com/playwright:v1.49.1-jammy sh -c \
  'cd /tmp && npm i -s playwright@1.49.1 >/dev/null 2>&1 && NODE_PATH=/tmp/node_modules node /repo/test/run.js'
