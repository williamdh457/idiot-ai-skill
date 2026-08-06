#!/usr/bin/env bash
set -euo pipefail

skill_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bundled="$skill_dir/runtime/skill.mjs"

if [[ -f "$bundled" ]]; then
  if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is required to run Idiot AI skill (runtime/skill.mjs)." >&2
    exit 1
  fi
  exec env NODE_NO_WARNINGS=1 node "$bundled" "$@"
fi

# Monorepo / local-dev fallback: run TypeScript core via tsx.
repo_root="$(cd "$skill_dir/../.." && pwd)"
core_dir="${IDIOT_AI_CORE_DIR:-$repo_root/packages/core}"

if [[ ! -f "$core_dir/package.json" ]]; then
  echo "Idiot AI runtime missing. Expected $bundled (public install) or core at $core_dir." >&2
  echo "Install: npx skills add williamdh457/idiot-ai-skill -g -y" >&2
  exit 1
fi

if [[ ! -x "$core_dir/node_modules/.bin/tsx" ]]; then
  echo "Idiot AI dependencies are missing. Run npm install from the monorepo root, or use the public skill package." >&2
  exit 1
fi

exec env NODE_NO_WARNINGS=1 "$core_dir/node_modules/.bin/tsx" "$core_dir/scripts/skill.ts" "$@"
