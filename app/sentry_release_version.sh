#!/bin/sh

# This shell script updates the latest production release in Sentry.

optouts_project_webhook="https://sentry.io/api/hooks/release/builtin/1314267/6a581e93201d63721790e78ec7b7be439f8fd6a07b0cce5f5287579eb74c7660/"

curl \
  -X POST \
  -H 'Content-Type: application/json' \
  --data "{\"version\": \"$VERSION\"}" \
  "$optouts_project_webhook"
