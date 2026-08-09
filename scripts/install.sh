#!/usr/bin/env bash
# Install Idiot AI skill into agent skill roots (symlink preferred).
# Usage:
#   bash skills/idiot-ai/scripts/install.sh            # same as: all
#   bash skills/idiot-ai/scripts/install.sh zcode
#   bash skills/idiot-ai/scripts/install.sh codex
#   bash skills/idiot-ai/scripts/install.sh agents
#   bash skills/idiot-ai/scripts/install.sh all
set -euo pipefail

skill_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
target="${1:-all}"
home="${HOME:-}"

if [[ -z "$home" ]]; then
  echo "HOME is not set; cannot install skill paths." >&2
  exit 1
fi

link_one() {
  local dest="$1"
  local parent
  parent="$(dirname "$dest")"
  mkdir -p "$parent"
  if [[ -L "$dest" || -e "$dest" ]]; then
    if [[ -L "$dest" ]]; then
      local current
      current="$(readlink "$dest" || true)"
      if [[ "$current" == "$skill_dir" ]]; then
        echo "ok  $dest -> $skill_dir (already)"
        return 0
      fi
    fi
    rm -rf "$dest"
  fi
  ln -s "$skill_dir" "$dest"
  echo "ok  $dest -> $skill_dir"
}

install_zcode() {
  link_one "$home/.zcode/skills/idiot-ai"
  # workspace-local discovery when running inside a repo clone
  if [[ -d "$skill_dir/../../.git" ]]; then
    local repo_root
    repo_root="$(cd "$skill_dir/../.." && pwd)"
    link_one "$repo_root/.zcode/skills/idiot-ai"
  fi
}

install_codex() {
  # Codex user skills + optional plugin-style path
  link_one "$home/.codex/skills/idiot-ai"
  if [[ -d "$home/.codex/plugins" ]]; then
    link_one "$home/.codex/plugins/idiot-ai"
  fi
}

install_agents() {
  # Shared agent skill root used by several CLIs / ZCode
  link_one "$home/.agents/skills/idiot-ai"
}

case "$target" in
  zcode) install_zcode ;;
  codex) install_codex ;;
  agents) install_agents ;;
  all)
    install_agents
    install_zcode
    install_codex
    ;;
  *)
    echo "Unknown target: $target" >&2
    echo "Usage: $0 [all|zcode|codex|agents]" >&2
    exit 1
    ;;
esac

echo
echo "Installed. In the agent chat, say: 骂人统计 / Idiot AI"
echo "Scan+upload: bash \"$skill_dir/scripts/idiot-ai-skill.sh\" scan --upload"
echo "Retry upload: bash \"$skill_dir/scripts/idiot-ai-skill.sh\" upload"
echo "Open personal: bash \"$skill_dir/scripts/idiot-ai-skill.sh\" open"
echo
echo "Manual paths if you prefer copy instead of symlink:"
echo "  ZCode:  $home/.zcode/skills/idiot-ai"
echo "  Codex:  $home/.codex/skills/idiot-ai"
echo "  Agents: $home/.agents/skills/idiot-ai"
if [[ -f "$skill_dir/runtime/skill.mjs" ]]; then
  echo "Runtime: $skill_dir/runtime/skill.mjs (Node 18+; no monorepo checkout required)."
else
  echo "No bundled runtime/skill.mjs — monorepo dev needs: npm install (or IDIOT_AI_CORE_DIR)."
  echo "Public install: npx skills add williamdh457/idiot-ai-skill -g -y"
fi
