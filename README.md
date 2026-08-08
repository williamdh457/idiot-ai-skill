# Idiot AI Skill

Scan local AI-agent chat logs (Codex, Grok, Kimi, Pi Agent, OpenCode, ZCode) for aggregate swear stats, then optionally upload a **signed, anonymous** snapshot to the public leaderboard.

- Leaderboard: https://dumbai.spur.best
- Privacy: raw transcripts never leave the machine; only aggregate counts are uploaded after you confirm.

## First-time install (never installed before)

Assume you have **no** Idiot AI skill yet. Do **not** jump to `bash … scan` until install finishes.

### 1. Install the skill

```bash
npx skills add williamdh457/idiot-ai-skill -g -y
```

Or paste this into Codex / ZCode and let the agent install for you:

```text
我还没有安装 Idiot AI skill。请按下面步骤完成（不要直接 bash scan）：

1. 运行：npx skills add williamdh457/idiot-ai-skill -g -y
2. 安装完成后，用 skill 扫描我的本地骂人统计（在 Agent 里说「骂人统计」即可）
3. 只汇报四窗分数等聚合结果，不要读日志原文
4. 再问我要不要上传匿名快照；我说「上传」后再执行 upload
5. 上传成功后给我 personalUrl
```

### 2. Trigger a scan

In the agent chat, say: **骂人统计** / **Idiot AI**.

The installed skill runs the local scan. You do not need to invent a bash path yourself.

### 3. Optional upload

When the agent asks, reply **上传** only if you want the anonymous aggregate on the public board.

### 4. Open your personal page

After a successful upload, open the returned `personalUrl` (`/dashboard?view=personal&device=...`).

### Manual install (optional)

Copy or clone this repo into an agent skill root:

| Agent | Path |
|-------|------|
| ZCode | `~/.zcode/skills/idiot-ai` |
| Codex | `~/.codex/skills/idiot-ai` |
| Shared | `~/.agents/skills/idiot-ai` |

## Commands the skill uses (after install)

These are for the **installed** skill / agent runtime, not first-time setup:

```bash
bash "$HOME/.zcode/skills/idiot-ai/scripts/idiot-ai-skill.sh" scan
bash "$HOME/.zcode/skills/idiot-ai/scripts/idiot-ai-skill.sh" upload
```

(Other roots: `~/.agents/skills/idiot-ai` or `~/.codex/skills/idiot-ai`.)

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
