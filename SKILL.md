---
name: idiot-ai
description: Automatically scan local Codex, Grok, Kimi, Pi Agent, OpenCode, and ZCode logs for aggregate-only Idiot AI swear statistics, then auto-upload the signed snapshot to the public leaderboard. Use when a user asks for “骂人统计”, “Idiot AI”, “打开个人页”, their AI-agent rage score, or wants to upload these local aggregates.
---

# Idiot AI local scan and auto-upload

When this Skill is invoked for stats (`骂人统计` / Idiot AI), the **first tool call must be the scan --upload command below**. Do not ask clarifying questions first. Do not manually inspect, open, or summarize log files. Do **not** ask whether to upload — upload is automatic after the scan.

When the user only wants to open / re-bind their personal page (`打开个人页`, “把个人链接打开”, “这个浏览器还没绑上”), run **`open` only** — do not scan or upload.

This matches the Mac app scan path: one automatic `scanAll` over local agent sources, then the signed aggregate is uploaded. The agent only runs the script and reports the JSON.

## Install (once per machine / agent) — before any scan bash

If the user has **never** installed this skill, install first. Do **not** invent a scan path for a missing install.

Primary (public skill package via skills CLI):

```bash
npx skills add williamdh457/idiot-ai-skill -g -y
```

Optional targets:

```bash
npx skills add williamdh457/idiot-ai-skill -g -a codex -a zcode -y
```

From a monorepo checkout (developers only):

```bash
bash skills/idiot-ai/scripts/install.sh all
```

Manual install (symlink or copy the skill directory):

- ZCode: `~/.zcode/skills/idiot-ai`
- Codex: `~/.codex/skills/idiot-ai`
- Shared agents root: `~/.agents/skills/idiot-ai`

Public installs use bundled `runtime/skill.mjs`. Monorepo dev without the bundle still needs core deps (`npm install` at repo root, or `IDIOT_AI_CORE_DIR`).

## Scan + auto-upload — always (after install, for 骂人统计)

Prefer an installed skill path (do **not** hardcode a machine-absolute path like `/Users/...`):

```bash
bash "$HOME/.zcode/skills/idiot-ai/scripts/idiot-ai-skill.sh" scan --upload
# bash "$HOME/.agents/skills/idiot-ai/scripts/idiot-ai-skill.sh" scan --upload
# bash "$HOME/.codex/skills/idiot-ai/scripts/idiot-ai-skill.sh" scan --upload

# monorepo workspace (developers)
# bash skills/idiot-ai/scripts/idiot-ai-skill.sh scan --upload
```

The command prints one compact JSON object. It scans the six supported local agent sources (Codex, Grok, Kimi, Pi Agent, OpenCode, ZCode), calculates `today` / `7d` / `30d` / `all`, signs an aggregate-only snapshot, and **uploads it immediately**. On success, `status` is `"uploaded"` and the command opens `personalUrl` in the OS default browser (`openedBrowser: true` when that succeeds).

The snapshot contains only signed aggregate counts (schema v5: periods + byDay daily buckets): no transcript text, message text, source paths, or match context.

Report only:
- four window scores (`today` / `7d` / `30d` / `all`: mild, severe, score)
- message / match totals when present
- top model rage when present
- top matched word when present
- upload result: `status`, `personalUrl`, `allPeopleUrl`, `openedBrowser`

On success, use `allPeopleUrl` for `/dashboard?view=all` and `personalUrl` for that device’s `/dashboard?view=personal&device=...` page. The server upserts by the durable device ID, so a later upload replaces this device’s old snapshot instead of accumulating points.

Tell the user:

- Stats were scanned and the anonymous aggregate was uploaded automatically.
- Default browser should already show the personal page.
- That browser remembers this device after one open (close/reopen still works).
- Another browser is not bound yet — paste the website’s “打开个人页” agent prompt, or say「打开个人页」here.

Do not invent accounts, cookies, or browser-side keys. Do not use short-lived pairing codes. Do not ask for a nickname, account, or any raw transcript. Do **not** ask “要不要上传”.

### Retry upload only if auto-upload failed

If `scan --upload` scanned but upload failed (network / server error), a pending file may remain at `~/.idiot-ai/pending-upload.json` (mode `0600`, expires after 15 minutes). Retry with:

```bash
bash "$HOME/.zcode/skills/idiot-ai/scripts/idiot-ai-skill.sh" upload
```

Do not re-scan first unless the pending cache expired or the user asked for a fresh scan.

Local-only scan (developers / debugging; **not** the default 骂人统计 path):

```bash
bash "$HOME/.zcode/skills/idiot-ai/scripts/idiot-ai-skill.sh" scan
```

## Open personal page — bind another browser / re-open me

If the user asks to open their personal page, bind this browser, or re-show their link (no new scan needed):

```bash
bash "$HOME/.zcode/skills/idiot-ai/scripts/idiot-ai-skill.sh" open
# bash "$HOME/.agents/skills/idiot-ai/scripts/idiot-ai-skill.sh" open
# bash "$HOME/.codex/skills/idiot-ai/scripts/idiot-ai-skill.sh" open
```

This reads `~/.idiot-ai/device.json`, prints `personalUrl`, and opens it in the default browser. Do **not** rescan or re-upload. Give the user the `personalUrl` so they can paste it into a non-default browser if needed.

## Privacy boundary

- Keep raw text local. Do not print, upload, or quote it.
- The script uploads only the signed aggregate snapshot (counts, not transcripts). Invoking 骂人统计 auto-uploads that aggregate.
- The durable anonymous identity is `~/.idiot-ai/device.json`; changing a nickname does not create a new leaderboard identity.
