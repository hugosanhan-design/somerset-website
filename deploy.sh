#!/usr/bin/env bash
# One-command deploy for the Somerset App.
# Deploys to production, then re-points the permanent address at the new build,
# so the app always lives at the SAME clean URL no matter how many times you deploy.
#
# Why this looks the way it does: an earlier version wrapped the deploy in
# RAW="$(npx vercel --prod)", which CAPTURED all of Vercel's output into a variable.
# That hid the build progress AND any prompt Vercel showed (login, "Ok to proceed?"),
# so a run that was quietly waiting for a keystroke looked frozen for minutes.
# This version STREAMS everything to the screen (via tee), auto-confirms the package
# install (npx --yes) and the project-link step (vercel --yes) so nothing blocks
# silently, then reads the deployment URL back out of the streamed log.
set -uo pipefail

DOMAIN="somerset-language-centre.vercel.app"
LOG="$(mktemp -t somerset-deploy)"

echo "Deploying Somerset App to production…"
echo "(Vercel's output streams below — if it ever asks you to log in, just follow the prompt.)"
echo

# --yes (npx): auto-accept installing the vercel package the first time.
# --yes (vercel): accept the existing project link / defaults, so it never waits silently.
# 2>&1 | tee: show progress + prompts live AND keep a copy to parse the URL from.
npx --yes vercel --prod --yes 2>&1 | tee "$LOG"
STATUS=${PIPESTATUS[0]}

if [ "$STATUS" -ne 0 ]; then
  rm -f "$LOG"
  echo
  echo "✗ Vercel exited with an error (see its output above). Nothing was re-pointed."
  exit "$STATUS"
fi

# The production deployment URL is the one on Vercel's "Production" line
# (a long  https://<project>-<hash>-<team>.vercel.app  address).
URL="$(grep -E 'Production' "$LOG" | grep -Eo 'https://[a-zA-Z0-9.-]+\.vercel\.app' | tail -1)"
# Fallback: the last vercel.app URL printed, if the label ever changes.
[ -z "$URL" ] && URL="$(grep -Eo 'https://[a-zA-Z0-9.-]+\.vercel\.app' "$LOG" | tail -1)"
rm -f "$LOG"

if [ -z "$URL" ]; then
  echo
  echo "✗ Couldn't find the deployment URL in Vercel's output. Check above; the build may have failed."
  exit 1
fi

echo
echo "Pointing $DOMAIN at the new build ($URL)…"
npx --yes vercel alias set "$URL" "$DOMAIN"

printf '\n============================================\n'
printf '  Your app is live (always this address):\n'
printf '  https://%s\n' "$DOMAIN"
printf '============================================\n'
