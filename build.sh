#!/usr/bin/env bash
git diff --quiet && git diff --cached --quiet
if [ $? -eq 0 ]; then
  git checkout gh-pages
  git merge -m "Merge branch 'main' into gh-pages" --ff main
  bun run build
  git add docs -f
  git commit -m 'publish!'
  git push
  git checkout main
else
  echo "⚠️ Commit your changes first."
fi

