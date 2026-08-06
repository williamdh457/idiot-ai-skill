# Idiot AI Skill

Scan local AI-agent chat logs (Codex, Grok, Kimi, Pi Agent, OpenCode, ZCode) for aggregate swear stats, then optionally upload a **signed, anonymous** snapshot to the public leaderboard.

- Leaderboard: https://dumbai.spur.best
- Privacy: raw transcripts never leave the machine; only aggregate counts are uploaded after you confirm.

## Install

```bash
npx skills add williamdh457/idiot-ai-skill -g -y
```

Then in your agent chat say: **骂人统计** / **Idiot AI**.

### Agent prompt (paste into chat)

```text
请运行 npx skills add williamdh457/idiot-ai-skill -g -y 安装 Idiot AI skill，然后扫描我的本地骂人统计。
```

### Manual paths

Copy or clone this repo to:

| Agent | Path |
|-------|------|
| ZCode | `~/.zcode/skills/idiot-ai` |
| Codex | `~/.codex/skills/idiot-ai` |
| Shared | `~/.agents/skills/idiot-ai` |

Requires **Node.js 18+**.

## Scan / upload

```bash
bash "$HOME/.zcode/skills/idiot-ai/scripts/idiot-ai-skill.sh" scan
bash "$HOME/.zcode/skills/idiot-ai/scripts/idiot-ai-skill.sh" upload
```

After a successful upload, open the returned `personalUrl` (`/dashboard?view=personal&device=...`).

## What’s in this repo

| Path | Role |
|------|------|
| `SKILL.md` | Agent instructions |
| `runtime/skill.mjs` | Bundled scanner (no monorepo source) |
| `scripts/idiot-ai-skill.sh` | Thin launcher |
| `agents/`, `.codex-plugin/` | Agent metadata |

This package is **skill-only**. Application source (web, desktop, TypeScript monorepo) is not published here.

## License

See the upstream project. Aggregate-only telemetry; do not modify scanners to upload raw transcripts.
