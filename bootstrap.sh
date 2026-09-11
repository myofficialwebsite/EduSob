#!/usr/bin/env bash
# স্যান্ডবক্স রিসেটের পরে পরিবেশ পুনর্গঠন।
# বারবার node_modules, Playwright ব্রাউজার ও সিস্টেম-লাইব্রেরি মুছে যায়,
# তাই প্রতিবার হাতে না করে এই স্ক্রিপ্ট চালানো হয়।
#
#   bash bootstrap.sh
#
set -euo pipefail
cd "$(dirname "$0")"

echo "▸ npm ডিপেন্ডেন্সি…"
npm install --silent >/dev/null 2>&1 || npm install >/dev/null 2>&1

if ! node -e "require.resolve('playwright')" 2>/dev/null; then
  echo "▸ Playwright…"
  npm install --silent playwright >/dev/null 2>&1
fi

echo "▸ Chromium…"
npx playwright install chromium >/dev/null 2>&1 || true

echo "▸ সিস্টেম-লাইব্রেরি…"
sudo apt-get install -y -qq \
  libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
  libgbm1 libpango-1.0-0 libcairo2 libasound2 >/dev/null 2>&1 || true

echo "▸ Node 22 (wrangler-এর জন্য)…"
if [ ! -x /tmp/node-v22.14.0-linux-x64/bin/node ]; then
  curl -sL -o /tmp/n22.tar.xz \
    https://nodejs.org/dist/v22.14.0/node-v22.14.0-linux-x64.tar.xz
  tar -xf /tmp/n22.tar.xz -C /tmp
fi

echo "▸ Git পরিচয়…"
git config user.email "dev@edusob.local" || true
git config user.name  "EduSob Dev"      || true
# রিমোটও মুছে যায়
git remote get-url origin >/dev/null 2>&1 \
  || git remote add origin https://github.com/myofficialwebsite/EduSob.git

echo
echo "✅ প্রস্তুত। সার্ভার: npx tsx server.ts (পোর্ট ৩০০০)"
echo "   ডেপ্লয়: export PATH=/tmp/node-v22.14.0-linux-x64/bin:\$PATH"
echo "           export CLOUDFLARE_API_TOKEN=…"
echo "           npx --yes wrangler@4 pages deploy dist --project-name edusob --branch main --commit-dirty=true"
