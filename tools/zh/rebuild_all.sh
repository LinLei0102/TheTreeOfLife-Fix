#!/usr/bin/env bash
# 一键从英文基线重放整个汉化流程
set -e
cd "$(dirname "$0")/../.."
python tools/zh/normalize_dictionary.py
python tools/zh/add_missing_units.py
python tools/zh/rebuild.py
python tools/zh/finalize.py
echo "=== 语法检查 ==="
find js -name '*.js' -print0 | while IFS= read -r -d '' f; do node --check "$f" >/dev/null || { echo "FAIL $f"; exit 1; }; done
echo "ALL OK"
