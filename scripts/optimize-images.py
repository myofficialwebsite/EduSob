"""এডুসব — হিরো ইমেজ অপটিমাইজেশন

হিরো ইমেজগুলো `opacity-30` ডেকোরেটিভ ব্যাকগ্রাউন্ড (object-cover) —
তাই দৃশ্যমান মানের প্রয়োজন কম। রিসাইজ + WebP → ~৮৫% সাশ্রয়।

চালান: python3 scripts/optimize-images.py
"""
import os
from PIL import Image

SRC = 'public/static/img'
NAMES = ['hero-students', 'hero-exam', 'hero-career']
# ডেকোরেটিভ ব্যাকগ্রাউন্ড → বড় সাইজের প্রয়োজন নেই
SIZES = [('', 960), ('-sm', 480)]

total_before = total_after = 0

for name in NAMES:
    path = os.path.join(SRC, f'{name}.jpg')
    if not os.path.exists(path):
        print(f'  ⚠️  নেই: {path}')
        continue

    before = os.path.getsize(path)
    total_before += before
    img = Image.open(path).convert('RGB')

    for suffix, width in SIZES:
        h = round(img.height * width / img.width)
        resized = img.resize((width, h), Image.LANCZOS)
        out = os.path.join(SRC, f'{name}{suffix}.webp')
        resized.save(out, 'WEBP', quality=52, method=6)
        after = os.path.getsize(out)
        total_after += after
        print(f'  {name}{suffix}.webp'.ljust(28) + f'{width}×{h}'.ljust(12) + f'{after/1024:6.0f} KB')

    print(f'  {name}.jpg'.ljust(28) + 'মূল'.ljust(11) + f'{before/1024:6.0f} KB  (রেখে দেওয়া হচ্ছে — og:image ও ফলব্যাক)')

print(f'\n✅ WebP ভ্যারিয়েন্ট: {total_after/1024:.0f} KB '
      f'(মূল JPEG {total_before/1024:.0f} KB — ব্রাউজার এখন WebP লোড করবে)')
print('→ landing.ts-এ <picture> + srcset ব্যবহার করুন')
