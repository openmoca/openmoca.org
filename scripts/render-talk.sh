#!/bin/sh
# Renders a talk's slides to PNG with headless Chrome, so a change can be checked by eye before it is committed.
#   scripts/render-talk.sh introduction-to-openmoca          every slide, to .talk-render/<talk>/NN.png
#   scripts/render-talk.sh introduction-to-openmoca 2 7      just slides 2 and 7
#   scripts/render-talk.sh introduction-to-openmoca --pdf    the whole deck as .talk-render/<talk>.pdf
# Needs Google Chrome (macOS path below; set CHROME to override).
set -e
cd "$(dirname "$0")/.."
TALK="$1"; shift
DECK="$PWD/public/talks/$TALK/index.html"
[ -f "$DECK" ] || { echo "No talk at public/talks/$TALK/"; exit 1; }
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
OUT="$PWD/.talk-render/$TALK"
mkdir -p "$OUT"
if [ "$1" = "--pdf" ]; then
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=3000 \
    --print-to-pdf="$OUT.pdf" "file://$DECK" 2>/dev/null
  echo "Wrote .talk-render/$TALK.pdf"; exit
fi
TOTAL=$(grep -c '^<section class="slide' "$DECK")
for n in ${@:-$(seq 1 "$TOTAL")}; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=3000 \
    --screenshot="$OUT/$(printf %02d "$n").png" "file://$DECK#$n" 2>/dev/null
done
echo "Rendered to .talk-render/$TALK/"
