#!/usr/bin/env bash
# এক-ধাপে টেস্ট চালানোর স্ক্রিপ্ট
#
# কেন: স্যান্ডবক্স প্রতি বার্তায় node_modules, dist, Node-২২, Playwright-ব্রাউজার
# মুছে দেয় এবং ব্যাকগ্রাউন্ড সার্ভার মেরে ফেলে। তাই প্রতি পর্বে আলাদা আলাদা
# কমান্ডে পরিবেশ গুছাতে গেলে অনেক সময় নষ্ট হয়। এই স্ক্রিপ্ট একটি মাত্র
# bash কলে সব গুছিয়ে টেস্ট চালায় এবং শেষে সার্ভার বন্ধ করে দেয়।
#
# ব্যবহার:  ./run-test.sh <টেস্ট-ফাইল.mjs> [আরও টেস্ট...]
#   যেমন:   ./run-test.sh mcq-test.mjs notices-test.mjs
set -uo pipefail
cd "$(dirname "$0")"

export PATH="/tmp/node-v22.14.0-linux-x64/bin:$PATH"
PORT="${PORT:-3000}"

# ── ১) নির্ভরতা ──────────────────────────────────────────────────────
[ -d node_modules ] || { echo "→ npm install ..."; npm install >/tmp/rt-npm.log 2>&1; }
[ -f /tmp/node-v22.14.0-linux-x64/bin/node ] || {
  echo "→ Node ২২ ডাউনলোড ..."
  curl -sL -o /tmp/n22.tar.xz https://nodejs.org/dist/v22.14.0/node-v22.14.0-linux-x64.tar.xz
  tar xf /tmp/n22.tar.xz -C /tmp
}
[ -f dist/_worker.js ] || { echo "→ বিল্ড ..."; npm run build >/tmp/rt-build.log 2>&1; }
[ -d /home/user/.cache/ms-playwright ] || : # ব্রাউজার দরকার হলে টেস্ট নিজে বার্তা দেবে

# ── ২) AI বাইন্ডিং সাময়িকভাবে সরানো (remote হলে টোকেন দাবি করে) ──────
python3 - <<'PY'
import re
s=open('wrangler.jsonc').read()
if '"ai"' in s:
    open('/tmp/wrangler.jsonc.rt','w').write(s)
    open('wrangler.jsonc','w').write(re.sub(r'"ai"\s*:\s*\{[^}]*\},?\n?','',s))
PY

cleanup() {
  [ -n "${SRV_PID:-}" ] && kill "$SRV_PID" 2>/dev/null
  pkill -P "$SRV_PID" 2>/dev/null
  # wrangler.jsonc পুনরুদ্ধার (AI বাইন্ডিং যেন কখনো কমিট না হয়)
  [ -f /tmp/wrangler.jsonc.rt ] && cp /tmp/wrangler.jsonc.rt wrangler.jsonc
  rm -f /tmp/wrangler.jsonc.rt
}
trap cleanup EXIT

# ── ৩) সার্ভার চালু ──────────────────────────────────────────────────
npx wrangler pages dev dist --port "$PORT" --ip 0.0.0.0 >/tmp/rt-server.log 2>&1 &
SRV_PID=$!

for i in $(seq 1 60); do
  if curl -s -o /dev/null --max-time 2 "http://127.0.0.1:${PORT}/"; then
    echo "→ সার্ভার প্রস্তুত (পোর্ট ${PORT})"
    break
  fi
  sleep 1
done

curl -s -o /dev/null --max-time 3 "http://127.0.0.1:${PORT}/" || {
  echo "❌ সার্ভার চালু হয়নি:"; tail -12 /tmp/rt-server.log; exit 1
}

# ── ৪) টেস্ট ─────────────────────────────────────────────────────────
overall=0
for t in "$@"; do
  echo ""
  node "$t" || overall=1
done

exit "$overall"
