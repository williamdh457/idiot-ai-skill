---
name: idiot-ai
description: Automatically scan local Codex, Grok, Kimi, Pi Agent, OpenCode, and ZCode logs for aggregate-only Idiot AI swear statistics, then ask once whether to upload the signed snapshot to the public leaderboard. Use when a user asks for “骂人统计”, “Idiot AI”, their AI-agent rage score, or wants to upload these local aggregates.
---

# Idiot AI local scan and optional upload

When this Skill is invoked, the **first tool call must be the scan command below**. Do not ask clarifying questions first. Do not manually inspect, open, or summarize log files.

This matches the Mac app scan path: one automatic `scanAll` over local agent sources. The agent only runs the script and reports the JSON.

## Install (once per machine / agent) — do this before any scan bash

If the skill is **not** installed yet, install first. Do **not** invent a scan path for a missing skill.

Primary:

```bash
npx skills add williamdh457/idiot-ai-skill -g -y
```

Optional targets:

```bash
npx skills add williamdh457/idiot-ai-skill -g -a codex -a zcode -y
```

Manual: clone or copy this repo into an agent skill root:

- ZCode: `~/.zcode/skills/idiot-ai`
- Codex: `~/.codex/skills/idiot-ai`
- Shared: `~/.agents/skills/idiot-ai`

Runtime is the bundled `runtime/skill.mjs` (no monorepo checkout).

## Scan first — always (after install)

Prefer an installed skill path (do **not** hardcode a machine-absolute path like `/Users/...`):

```bash
bash "$HOME/.zcode/skills/idiot-ai/scripts/idiot-ai-skill.sh" scan
# bash "$HOME/.agents/skills/idiot-ai/scripts/idiot-ai-skill.sh" scan
# bash "$HOME/.codex/skills/idiot-ai/scripts/idiot-ai-skill.sh" scan
```

The command prints one compact JSON object. It scans the six supported local agent sources (Codex, Grok, Kimi, Pi Agent, OpenCode, ZCode), calculates `today` / `7d` / `30d` / `all`, and writes `~/.idiot-ai/pending-upload.json` with mode `0600`.

The pending file contains only signed aggregate counts (schema v5: periods + byDay daily buckets): no transcript text, message text, source paths, or match context. It expires after 15 minutes.

Report only:
- four window scores (`today` / `7d` / `30d` / `all`: mild, severe, score)
- message / match totals when present
- top model rage when present
- top matched word when present

Then ask exactly one direct confirmation:

> 要把这份匿名聚合快照上传到公开榜吗？回复“上传”即可；不上传则数据只留在本机。

Never run the upload command as part of the scan response, and do not ask for a nickname, account, or any raw transcript.

## Upload — only after an unambiguous affirmative reply

If the user replies with an explicit affirmative such as “上传”, “确认上传”, or “yes”, run the matching upload command (same path resolution as scan):

```bash
bash "$HOME/.zcode/skills/idiot-ai/scripts/idiot-ai-skill.sh" upload
```

Report whether the upload succeeded. On success, use `allPeopleUrl` for `/dashboard?view=all` and `personalUrl` for that device’s `/dashboard?view=personal&device=...` page. The server upserts by the durable device ID, so a later upload replaces this device’s old snapshot instead of accumulating points.

If the user declines, do nothing further. If the cache has expired, run the scan flow again and ask for confirmation again.

## Privacy boundary

- Keep raw text local. Do not print, upload, or quote it.
- The script only uploads the signed aggregate snapshot after explicit confirmation.
- The durable anonymous identity is `~/.idiot-ai/device.json`; changing a nickname does not create a new leaderboard identity.
- Public leaderboard: https://dumbai.spur.best
- Source / install: https://github.com/williamdh457/idiot-ai-skill
