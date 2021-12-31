#!/bin/sh

# This shell script will send message to #dev channel regarding

slack_webhook='https://hooks.slack.com/services/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'

curl \
  -X POST \
  -H 'Content-type: application/json' \
  --data "{\"text\":\"[Production] Optouts package vulnerability detected. See <$CI_JOB_URL|job> report for more details.\"}" \
  "$slack_webhook"
