#!/usr/bin/env bash
git diff --quiet && git diff --cached --quiet
if [ $? -eq 0 ]; then
  git checkout gh-pages
else
  echo "⚠️ Commit your changes first."
fi

