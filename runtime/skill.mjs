// Idiot AI skill runtime (bundled). Aggregate-only local scan + optional upload.

// packages/core/scripts/skill.ts
import {
  chmodSync as chmodSync2,
  existsSync as existsSync10,
  mkdirSync as mkdirSync4,
  readFileSync as readFileSync8,
  renameSync as renameSync4,
  rmSync,
  writeFileSync as writeFileSync4
} from "node:fs";
import { dirname as dirname5, join as join5 } from "node:path";

// packages/core/src/types/index.ts
var PERIOD_KEYS = ["today", "7d", "30d", "all"];
var SCHEMA_VERSION = 2;
var SCHEMA_VERSION_V3 = 3;
var SCHEMA_VERSION_V4 = 4;
var SCHEMA_VERSION_V5 = 5;

// packages/core/src/models/words.ts
var S = (sev) => sev;
var WORDS = [
  // Mild Chinese
  { id: "wo-kao", text: "\u6211\u9760", severity: S("mild"), lang: "zh", antiPatterns: ["\u9760\u8C31"] },
  { id: "wo-qu", text: "\u6211\u53BB", severity: S("mild"), lang: "zh" },
  { id: "kao", text: "\u9760", severity: S("mild"), lang: "zh", antiPatterns: ["\u9760\u8C31", "\u4F9D\u9760", "\u9760\u7740", "\u9760\u5C71", "\u9760\u8FD1"] },
  // 轻度「卧槽」不再挂 woc/我艹：那两个词形归重度「我操」，避免同一 alias 双归属
  { id: "wo-cao", text: "\u5367\u69FD", severity: S("mild"), lang: "zh", aliases: ["\u6211\u64E6"] },
  { id: "tian-a", text: "\u5929\u554A", severity: S("mild"), lang: "zh" },
  { id: "fu-le", text: "\u670D\u4E86", severity: S("mild"), lang: "zh" },
  { id: "wu-yu", text: "\u65E0\u8BED", severity: S("mild"), lang: "zh" },
  { id: "jue-le", text: "\u7EDD\u4E86", severity: S("mild"), lang: "zh" },
  { id: "li-pu", text: "\u79BB\u8C31", severity: S("mild"), lang: "zh" },
  { id: "han", text: "\u6C57", severity: S("mild"), lang: "zh" },
  { id: "emmm", text: "emmm", severity: S("mild"), lang: "mixed", aliases: ["emm"] },
  // Mild English
  { id: "damn", text: "damn", severity: S("mild"), lang: "en" },
  { id: "crap", text: "crap", severity: S("mild"), lang: "en" },
  { id: "shoot", text: "shoot", severity: S("mild"), lang: "en" },
  // what the / wtf / what the fuck 各自独立，禁止 alias 合并显示
  { id: "what-the", text: "what the", severity: S("mild"), lang: "en" },
  { id: "wtf", text: "wtf", severity: S("mild"), lang: "en" },
  { id: "jeez", text: "jeez", severity: S("mild"), lang: "en", aliases: ["geez"] },
  { id: "omg", text: "omg", severity: S("mild"), lang: "en" },
  { id: "dang", text: "dang", severity: S("mild"), lang: "en" },
  { id: "heck", text: "heck", severity: S("mild"), lang: "en" },
  // Severe Chinese
  { id: "cao", text: "\u64CD", severity: S("severe"), lang: "zh", antiPatterns: ["\u64CD\u4F5C", "\u64CD\u573A", "\u64CD\u5FC3", "\u64CD\u7EC3", "\u4F53\u64CD", "\u65E9\u64CD", "\u64CD\u63A7", "\u64CD\u7EB5", "\u64CD\u5B88", "\u64CD\u884C"] },
  { id: "wo-cao-sev", text: "\u6211\u64CD", severity: S("severe"), lang: "zh", aliases: ["\u5367\u64CD", "\u6211\u8349", "\u6211\u8279", "woc"] },
  { id: "ta-ma-de", text: "\u4ED6\u5988\u7684", severity: S("severe"), lang: "zh", aliases: ["tm\u7684", "tmd", "\u8E0F\u9A6C\u7684", "\u7279\u4E48\u7684", "\u4ED6\u9A6C\u7684"] },
  { id: "sha-bi", text: "\u50BB\u903C", severity: S("severe"), lang: "zh", aliases: ["\u715E\u7B14", "\u50BB\u5C44", "sb"] },
  { id: "bai-chi", text: "\u767D\u75F4", severity: S("severe"), lang: "zh" },
  { id: "nao-can", text: "\u8111\u6B8B", severity: S("severe"), lang: "zh" },
  { id: "hun-dan", text: "\u6DF7\u86CB", severity: S("severe"), lang: "zh" },
  // 不把单字「滚」当 alias：滚动/回滚/滚轮会误命中
  { id: "gun-dan", text: "\u6EDA\u86CB", severity: S("severe"), lang: "zh", aliases: ["\u6EDA\u5F00"] },
  { id: "qu-si", text: "\u53BB\u6B7B", severity: S("severe"), lang: "zh", aliases: ["\u53BB\u6B7B\u5427"] },
  { id: "ma-de", text: "\u5988\u7684", severity: S("severe"), lang: "zh", aliases: ["\u5988\u4E2A", "ma\u7684"] },
  { id: "cao-ni-ma", text: "\u8349\u6CE5\u9A6C", severity: S("severe"), lang: "zh", aliases: ["\u64CD\u4F60\u5988", "\u8349\u4F60\u9A6C", "cnm"] },
  { id: "ni-ma", text: "\u5C3C\u739B", severity: S("severe"), lang: "zh", aliases: ["\u4F60\u9A6C", "nm"] },
  { id: "la-ji", text: "\u5783\u573E", severity: S("severe"), lang: "zh" },
  { id: "qi-si-wo-l", text: "\u6C14\u6B7B\u6211\u4E86", severity: S("severe"), lang: "zh" },
  { id: "you-bing", text: "\u6709\u75C5", severity: S("severe"), lang: "zh" },
  { id: "zhi-zhang", text: "\u667A\u969C", severity: S("severe"), lang: "zh" },
  { id: "chun-huo", text: "\u8822\u8D27", severity: S("severe"), lang: "zh" },
  { id: "wang-ba-dan", text: "\u738B\u516B\u86CB", severity: S("severe"), lang: "zh" },
  { id: "feng-le", text: "\u75AF\u4E86", severity: S("severe"), lang: "zh", aliases: ["\u4F60\u75AF"] },
  // Severe English
  // 完整短语单独成词；与 what-the / fuck 重叠时由 matcher 最长+重度优先保留本条
  { id: "what-the-fuck", text: "what the fuck", severity: S("severe"), lang: "en", aliases: ["what the f*ck", "what the f**k"] },
  { id: "fuck", text: "fuck", severity: S("severe"), lang: "en", aliases: ["f*ck", "f**k", "f u c k", "fuk", "fu ck", "fcking"] },
  { id: "fucking", text: "fucking", severity: S("severe"), lang: "en", aliases: ["f*cking", "f**king"] },
  { id: "bitch", text: "bitch", severity: S("severe"), lang: "en", aliases: ["b*tch", "b**ch"] },
  { id: "fuck-you", text: "fuck you", severity: S("severe"), lang: "en", aliases: ["f*ck you", "f u", "f u c k you", "f u c k u"] },
  { id: "asshole", text: "asshole", severity: S("severe"), lang: "en", aliases: ["a**hole", "ass hole"] },
  // 产品名 Idiot AI / 路径 idiot_ai 不算骂人
  { id: "idiot", text: "idiot", severity: S("severe"), lang: "en", aliases: ["id*ot", "idiotic"], antiPatterns: ["idiot ai", "idiot_ai", "idiot-ai", "@idiot-ai"] },
  { id: "shit", text: "shit", severity: S("severe"), lang: "en", aliases: ["sh*t", "s**t"] },
  { id: "bastard", text: "bastard", severity: S("severe"), lang: "en" },
  { id: "motherfucker", text: "motherfucker", severity: S("severe"), lang: "en", aliases: ["mofo", "mthrfckr", "m f"] },
  { id: "stfu", text: "stfu", severity: S("severe"), lang: "en", aliases: ["shut the fuck up"] },
  // 去掉 dik：太短，易误伤；d*ck 只匹配带打码符的形式
  { id: "dick", text: "dick", severity: S("severe"), lang: "en", aliases: ["d*ck"] },
  { id: "damn-it", text: "damn it", severity: S("severe"), lang: "en", aliases: ["damnit"] },
  { id: "retard", text: "retard", severity: S("severe"), lang: "en", aliases: ["r*tard"] },
  { id: "moron", text: "moron", severity: S("severe"), lang: "en" },
  { id: "jerk", text: "jerk", severity: S("severe"), lang: "en", aliases: ["jerk off"] },
  { id: "piece-of-shit", text: "piece of shit", severity: S("severe"), lang: "en", aliases: ["pos", "piece of crap"] },
  { id: "suck", text: "suck", severity: S("mild"), lang: "en", aliases: ["sucks"] }
];

// packages/core/src/models/catalog.ts
var MODEL_CATALOG_VERSION = 5;
var UNKNOWN_MODEL = "unknown";
var PROVISIONAL_PREFIX = "p:";
var nfkcLower = (s) => s.normalize("NFKC").toLowerCase();
var normalizeModelKey = (raw) => nfkcLower(raw).replace(/[\s_\-.\\/]+/g, "").replace(/[^a-z0-9一-鿿]/g, "");
var stripProviderPrefix = (raw) => {
  let s = nfkcLower(raw).trim();
  s = s.replace(/^[\w\-. ]+[/:]/, "");
  return s.trim();
};
var isProvisionalModelId = (id) => Boolean(id && id.startsWith(PROVISIONAL_PREFIX));
var provisionalModelSlug = (raw) => {
  let s = nfkcLower(raw).trim();
  if (!s) return null;
  if (/:\/\//.test(s) || s.includes("\\") || s.includes("..")) return null;
  if (s.startsWith(PROVISIONAL_PREFIX)) s = s.slice(PROVISIONAL_PREFIX.length);
  const stripped = stripProviderPrefix(s);
  s = stripped || s;
  s = s.replace(/[_\s/]+/g, "-").replace(/[^a-z0-9一-鿿.+-]+/g, "-").replace(/-+/g, "-").replace(/^\.+|\.+$/g, "").replace(/^-+|-+$/g, "");
  if (!s || s.length < 3 || s.length > 64) return null;
  const hasDigit = /\d/.test(s);
  const segments = s.split(/[-.+]/).filter(Boolean);
  if (!hasDigit && (segments.length < 2 || s.length < 8)) return null;
  if (segments.length === 1 && !hasDigit) return null;
  return s;
};
var toProvisionalModelId = (raw) => {
  const slug = provisionalModelSlug(raw);
  if (!slug) return null;
  const key = normalizeModelKey(slug);
  if (!key || key.length < 3 || key.length > 80) return null;
  return `${PROVISIONAL_PREFIX}${key}`;
};
var disp = (id) => id.split("-").map((p) => /^\d/.test(p) || p.length <= 2 ? p.toUpperCase() : p[0].toUpperCase() + p.slice(1)).join(" ").replace(/^Gpt /, "GPT-").replace(/^Glm /, "GLM-").replace(/^Grok /, "Grok ").replace(/^O(\d)/, "o$1");
var family = ({ provider, prefix, versions, suffixes = [""] }) => {
  const out = [];
  for (const v of versions) {
    for (const suf of suffixes) {
      const id = `${prefix}-${v}${suf}`;
      out.push({
        id,
        displayName: disp(id),
        provider,
        aliases: [id]
      });
    }
  }
  return out;
};
var CATALOG = [
  // ---- OpenAI ----
  ...family({
    provider: "openai",
    prefix: "gpt",
    versions: ["5", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6"],
    suffixes: ["", "-codex", "-codex-max", "-codex-mini", "-codex-spark", "-pro", "-mini", "-nano", "-luna", "-sol", "-terra"]
  }),
  { id: "gpt-5.6", displayName: "GPT-5.6", provider: "openai", aliases: ["gpt-5.6"], providerAliases: ["5.6"] },
  { id: "gpt-5.6-sol", displayName: "GPT-5.6 Sol", provider: "openai", aliases: ["gpt-5.6-sol"], providerAliases: ["sol", "gpt-sol"] },
  { id: "gpt-5.5", displayName: "GPT-5.5", provider: "openai", aliases: ["gpt-5.5"], providerAliases: ["5.5"] },
  { id: "gpt-5", displayName: "GPT-5", provider: "openai", aliases: ["gpt-5"], providerAliases: ["5"] },
  { id: "codex-mini", displayName: "Codex Mini", provider: "openai", aliases: ["codex-mini", "codex mini", "codex-mini-latest"] },
  { id: "o4", displayName: "o4", provider: "openai", aliases: ["o4", "openai/o4"], strict: true },
  { id: "o3", displayName: "o3", provider: "openai", aliases: ["o3", "openai/o3"], strict: true },
  // ---- Anthropic ----
  ...family({ provider: "anthropic", prefix: "claude-opus", versions: ["4.1", "4.5", "4.6", "4.7", "4.8"] }),
  ...family({ provider: "anthropic", prefix: "claude-sonnet", versions: ["4", "4.5", "4.6", "5"] }),
  ...family({ provider: "anthropic", prefix: "claude-haiku", versions: ["4.5"] }),
  { id: "claude-fable-5", displayName: "Claude Fable 5", provider: "anthropic", aliases: ["claude-fable-5"] },
  { id: "claude-sonnet", displayName: "Claude Sonnet", provider: "anthropic", aliases: ["claude-sonnet", "claude sonnet", "sonnet"], providerAliases: ["sonnet"] },
  { id: "claude-opus", displayName: "Claude Opus", provider: "anthropic", aliases: ["claude-opus", "claude opus", "opus"], providerAliases: ["opus"] },
  { id: "claude-haiku", displayName: "Claude Haiku", provider: "anthropic", aliases: ["claude-haiku", "claude haiku", "haiku"], providerAliases: ["haiku"] },
  // ---- xAI ----
  ...family({ provider: "xai", prefix: "grok", versions: ["3", "4", "4.3", "4.5", "4.6", "4.20"] }),
  { id: "grok-4.20", displayName: "Grok 4.20", provider: "xai", aliases: ["grok-4.20-0309-reasoning", "grok-4.20-0309-non-reasoning", "grok-4.20-multi-agent-0309"] },
  { id: "grok-4", displayName: "Grok 4", provider: "xai", aliases: ["grok-4"], providerAliases: ["4"] },
  { id: "grok-3", displayName: "Grok 3", provider: "xai", aliases: ["grok-3"], providerAliases: ["3"] },
  { id: "grok-4.5", displayName: "Grok 4.5", provider: "xai", aliases: ["grok-4.5"], providerAliases: ["4.5"] },
  { id: "grok-4.6", displayName: "Grok 4.6", provider: "xai", aliases: ["grok-4.6"], providerAliases: ["4.6"] },
  { id: "grok-build-0.1", displayName: "Grok Build 0.1", provider: "xai", aliases: ["grok-build-0.1", "grok build", "grok-build"] },
  { id: "grok-code-fast", displayName: "Grok Code Fast", provider: "xai", aliases: ["grok-code-fast", "grok code fast", "grok-code-fast-1"] },
  // ---- Moonshot ----
  ...family({ provider: "moonshot", prefix: "kimi-k", versions: ["1.5", "2", "2.5", "2.6", "3"] }),
  { id: "kimi-k2.7-code", displayName: "Kimi K2.7 Code", provider: "moonshot", aliases: ["kimi-k2.7-code", "k2.7-code"] },
  { id: "kimi-code", displayName: "Kimi Code", provider: "moonshot", aliases: ["kimi-code", "kimi-for-coding", "k3.kimi-code", "k3 kimi-code"] },
  { id: "kimi-k2", displayName: "Kimi K2", provider: "moonshot", aliases: ["kimi-k2", "k2"], providerAliases: ["k2"] },
  { id: "kimi-k1.5", displayName: "Kimi K1.5", provider: "moonshot", aliases: ["kimi-k1.5", "k1.5"], providerAliases: ["k1.5"] },
  // ---- Google ----
  { id: "gemini-2.5-pro", displayName: "Gemini 2.5 Pro", provider: "google", aliases: ["gemini-2.5-pro"] },
  { id: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash", provider: "google", aliases: ["gemini-2.5-flash"] },
  { id: "gemini-3-flash", displayName: "Gemini 3 Flash", provider: "google", aliases: ["gemini-3-flash", "gemini-3"] },
  { id: "gemini-3.1-pro", displayName: "Gemini 3.1 Pro", provider: "google", aliases: ["gemini-3.1-pro"] },
  ...family({ provider: "google", prefix: "gemini", versions: ["3.5", "3.6"], suffixes: ["-flash", "-flash-lite"] }),
  // ---- Zhipu ----
  ...family({ provider: "zhipu", prefix: "glm", versions: ["4.6", "5", "5.1", "5.2"] }),
  // ---- DeepSeek ----
  { id: "deepseek-v3", displayName: "DeepSeek V3", provider: "deepseek", aliases: ["deepseek-v3"] },
  { id: "deepseek-r1", displayName: "DeepSeek R1", provider: "deepseek", aliases: ["deepseek-r1"] },
  { id: "deepseek-chat", displayName: "DeepSeek Chat", provider: "deepseek", aliases: ["deepseek-chat"] },
  { id: "deepseek-reasoner", displayName: "DeepSeek Reasoner", provider: "deepseek", aliases: ["deepseek-reasoner"] },
  ...family({ provider: "deepseek", prefix: "deepseek", versions: ["v4-flash", "v4-flash-free", "v4-pro"] }),
  // ---- Alibaba ----
  { id: "qwen3", displayName: "Qwen 3", provider: "alibaba", aliases: ["qwen3", "qwen-3"] },
  ...family({ provider: "alibaba", prefix: "qwen", versions: ["3.5-plus", "3.6-plus", "3.7-max", "3.7-plus"] }),
  // ---- MiniMax ----
  ...family({ provider: "minimax", prefix: "minimax-m", versions: ["2.5", "2.7", "3"] }),
  // ---- Xiaomi ----
  ...family({ provider: "xiaomi", prefix: "mimo-v", versions: ["2.5", "2.5-free", "2.5-pro"] })
];
var AGENT_PROVIDER = {
  codex: "openai",
  opencode: "openai",
  kimi: "moonshot",
  grok: "xai",
  piagent: "openai",
  chatgpt: "openai",
  claude: "anthropic",
  cursor: "anthropic",
  gemini: "google",
  deepseek: "deepseek",
  qwen: "alibaba",
  chatglm: "zhipu"
  // zcode can run any provider's model; resolve by the model string itself.
};
var builtinModelCatalog = () => ({
  version: MODEL_CATALOG_VERSION,
  updatedAt: "2026-08-06T00:00:00.000Z",
  models: CATALOG
});
var mergeModelCatalogs = (base, overlay) => {
  if (!overlay?.models?.length) return base;
  const byId = /* @__PURE__ */ new Map();
  for (const entry of base.models) byId.set(entry.id, entry);
  for (const entry of overlay.models) {
    if (!entry?.id) continue;
    byId.set(entry.id, entry);
  }
  return {
    version: Math.max(base.version, overlay.version || 0),
    updatedAt: overlay.updatedAt || base.updatedAt,
    models: [...byId.values()]
  };
};
var DISPLAY_BY_ID = new Map(CATALOG.map((entry) => [entry.id, entry.displayName]));
var modelDisplayName = (id) => {
  if (!id) return "\u672A\u77E5\u6A21\u578B";
  if (id === UNKNOWN_MODEL || id.startsWith("unrecognized:")) return "\u672A\u77E5\u6A21\u578B";
  if (isProvisionalModelId(id)) {
    const body = id.slice(PROVISIONAL_PREFIX.length);
    const hit = DISPLAY_BY_ID.get(body);
    if (hit) return hit;
    return body;
  }
  return DISPLAY_BY_ID.get(id) ?? id;
};
var ModelResolver = class {
  catalog;
  anyIndex = /* @__PURE__ */ new Map();
  providerIndex = /* @__PURE__ */ new Map();
  byId = /* @__PURE__ */ new Map();
  constructor(catalog = builtinModelCatalog()) {
    this.catalog = catalog;
    for (const entry of catalog.models) {
      this.byId.set(entry.id, entry);
      const all = [];
      for (const a of entry.aliases ?? []) {
        all.push({ normAlias: normalizeModelKey(a), scope: "any" });
      }
      all.push({ normAlias: normalizeModelKey(entry.id), scope: "any" });
      for (const a of entry.providerAliases ?? []) {
        all.push({ normAlias: normalizeModelKey(a), scope: "provider" });
      }
      for (const item of all) {
        if (!item.normAlias) continue;
        if (item.scope === "any") {
          const existing = this.anyIndex.get(item.normAlias);
          if (!existing || entry.id.length < existing.id.length) {
            this.anyIndex.set(item.normAlias, entry);
          }
        } else {
          const key = `${entry.provider}:${item.normAlias}`;
          const list = this.providerIndex.get(key) ?? [];
          if (!list.includes(entry)) list.push(entry);
          this.providerIndex.set(key, list);
        }
      }
    }
  }
  lookupAny(norm) {
    return this.anyIndex.get(norm) ?? null;
  }
  lookupProvider(provider, norm) {
    const list = this.providerIndex.get(`${provider}:${norm}`);
    if (!list || list.length !== 1) return null;
    return list[0];
  }
  /** Try direct alias lookup across the raw candidate forms. */
  lookupCandidates(raw, provider) {
    const candidates = [raw, stripProviderPrefix(raw)];
    const norms = [...new Set(candidates.map(normalizeModelKey).filter(Boolean))];
    for (const norm of norms) {
      const hit = this.lookupAny(norm);
      if (hit) return hit;
    }
    for (const norm of norms) {
      const hit = this.lookupProvider(provider, norm);
      if (hit) return hit;
    }
    return null;
  }
  /**
   * Resolve a raw model string to a catalog entry.
   *
   * Order: exact alias → provider-scoped alias → session context →
   * provisional (`p:<slug>`) → unknown.
   * Garbage / ultra-short unprovable tokens still collapse to `unknown`
   * (never `unrecognized:<provider>` buckets).
   */
  resolve(input) {
    const raw = input.rawModelId ?? null;
    const provider = input.provider ?? (input.agentId ? AGENT_PROVIDER[input.agentId] : void 0) ?? "unknown";
    const finish = (canonicalModelId, displayName, confidence) => ({
      rawModelId: raw,
      canonicalModelId,
      displayName,
      provider,
      confidence
    });
    const unknown = () => finish(UNKNOWN_MODEL, "\u672A\u77E5\u6A21\u578B", "unrecognized");
    if (!raw || !raw.trim()) {
      const fromContext = this.resolveFromContext(input.sessionModels, provider);
      if (fromContext) {
        return finish(fromContext.id, fromContext.displayName, "context");
      }
      return unknown();
    }
    if (isProvisionalModelId(raw)) {
      const body = raw.slice(PROVISIONAL_PREFIX.length);
      const promoted = this.lookupCandidates(body, provider) ?? this.byId.get(body) ?? // compact provisional body may match catalog after normalize
      this.lookupAny(normalizeModelKey(body));
      if (promoted) {
        return finish(promoted.id, promoted.displayName, "exact");
      }
      const keep = toProvisionalModelId(body);
      if (keep) {
        return finish(keep, modelDisplayName(keep), "provisional");
      }
      return unknown();
    }
    const direct = this.lookupCandidates(raw, provider);
    if (direct) {
      const rawNorms = [raw, stripProviderPrefix(raw)].map(normalizeModelKey);
      const conf = direct.providerAliases?.some(
        (a) => rawNorms.includes(normalizeModelKey(a)) && !direct.aliases?.some((al) => normalizeModelKey(al) === normalizeModelKey(a))
      ) ? "provider-alias" : "exact";
      return finish(direct.id, direct.displayName, conf);
    }
    const context = this.resolveFromContext(input.sessionModels, provider);
    if (context) {
      const rawNorm = normalizeModelKey(raw);
      const ctxNorm = normalizeModelKey(context.id);
      if (rawNorm && ctxNorm.includes(rawNorm)) {
        return finish(context.id, context.displayName, "context");
      }
    }
    const provisional = toProvisionalModelId(raw);
    if (provisional) {
      const pretty = provisionalModelSlug(raw);
      return finish(provisional, pretty ? disp(pretty) : modelDisplayName(provisional), "provisional");
    }
    return unknown();
  }
  resolveFromContext(sessionModels, provider) {
    if (!sessionModels?.length) return null;
    const resolved = /* @__PURE__ */ new Set();
    let entry = null;
    for (const raw of sessionModels) {
      if (!raw) continue;
      const hit = this.lookupCandidates(raw, provider);
      if (hit) {
        resolved.add(hit.id);
        entry = hit;
      }
    }
    return resolved.size === 1 ? entry : null;
  }
};
var defaultModelResolver = new ModelResolver();
var activeResolve = (input) => defaultModelResolver.resolve(input);
var setModelResolveFn = (fn) => {
  activeResolve = fn;
};
var resolveModel = (input) => activeResolve(input);

// packages/core/src/utils/matcher.ts
var WORD_DISPLAY = Object.fromEntries(
  WORDS.map((w) => [w.id, w.text])
);
var CJK_RE = /[㐀-鿿豈-﫿]/;
var wordBoundary = (s, i, len) => {
  if (i > 0) {
    const prev = s[i - 1];
    if (/[a-zA-Z0-9]/.test(prev)) return false;
  }
  if (i + len < s.length) {
    const next = s[i + len];
    if (/[a-zA-Z0-9]/.test(next)) return false;
  }
  return true;
};
var flatten = (entry) => {
  const base = { id: entry.id, text: entry.text, severity: entry.severity, anti: entry.antiPatterns ?? [] };
  const list = [base];
  for (const a of entry.aliases ?? []) {
    list.push({ id: entry.id, text: a, severity: entry.severity, anti: entry.antiPatterns ?? [] });
  }
  return list;
};
var normalizeSpaces = (s) => s.replace(/[\s_\-]+/g, " ").trim().toLowerCase();
var CENSOR_TOKEN = "\0";
var CENSOR_CLASS = "[*#@._-]";
var normalizeAsterisk = (s) => s.replace(/[*]+/g, CENSOR_TOKEN).replace(/[\s]+/g, "");
var isBlocked = (lower, start, end, anti) => {
  if (anti.length === 0) return false;
  for (const a of anti) {
    const al = a.toLowerCase();
    let idx = lower.indexOf(al);
    while (idx !== -1) {
      if (start < idx + al.length && end > idx) return true;
      idx = lower.indexOf(al, idx + 1);
    }
  }
  return false;
};
var escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var variantToRegexSource = (v) => {
  const parts = v.split(CENSOR_TOKEN);
  return parts.map((p) => escapeRegex(p)).join(`${CENSOR_CLASS}+`);
};
var prepare = (dictionary) => {
  const out = [];
  for (const entry of dictionary) {
    const flat = flatten(entry).sort((a, b) => b.text.length - a.text.length);
    for (const pat of flat) {
      const raw = pat.text.toLowerCase();
      const variants = /* @__PURE__ */ new Set();
      variants.add(raw);
      variants.add(normalizeSpaces(raw));
      if (raw.includes("*")) {
        variants.add(normalizeAsterisk(raw));
        variants.add(normalizeSpaces(normalizeAsterisk(raw)));
      }
      for (const v of variants) {
        if (!v) continue;
        if (v.includes(CENSOR_TOKEN) || CJK_RE.test(v)) {
          out.push({
            wordId: pat.id,
            severity: pat.severity,
            anti: pat.anti,
            regex: new RegExp(variantToRegexSource(v), "gi")
          });
        } else {
          out.push({ wordId: pat.id, severity: pat.severity, anti: pat.anti, substr: v });
        }
      }
    }
  }
  return out;
};
var preparedCache = /* @__PURE__ */ new WeakMap();
var preparedFor = (dictionary) => {
  let p = preparedCache.get(dictionary);
  if (!p) {
    p = prepare(dictionary);
    preparedCache.set(dictionary, p);
  }
  return p;
};
var scanText = (text, dictionary = WORDS) => {
  if (!text) return [];
  const lower = text.toLowerCase();
  const hits = [];
  for (const v of preparedFor(dictionary)) {
    if (v.regex) {
      v.regex.lastIndex = 0;
      const needsBoundary = !CJK_RE.test(v.regex.source);
      let m;
      while ((m = v.regex.exec(text)) !== null) {
        if (m[0].length === 0) break;
        if (needsBoundary && !wordBoundary(text, m.index, m[0].length)) continue;
        if (!isBlocked(lower, m.index, m.index + m[0].length, v.anti)) {
          hits.push({ wordId: v.wordId, text: m[0], severity: v.severity, start: m.index, end: m.index + m[0].length });
        }
      }
    } else if (v.substr) {
      let idx = lower.indexOf(v.substr);
      while (idx !== -1) {
        if (wordBoundary(text, idx, v.substr.length) && !isBlocked(lower, idx, idx + v.substr.length, v.anti)) {
          hits.push({ wordId: v.wordId, text: text.slice(idx, idx + v.substr.length), severity: v.severity, start: idx, end: idx + v.substr.length });
        }
        idx = lower.indexOf(v.substr, idx + 1);
      }
    }
  }
  hits.sort(
    (a, b) => b.end - b.start - (a.end - a.start) || (b.severity === "severe" ? 1 : 0) - (a.severity === "severe" ? 1 : 0) || a.start - b.start || a.wordId.localeCompare(b.wordId)
  );
  const taken = [];
  for (const h2 of hits) {
    if (taken.some((t) => h2.start < t.end && h2.end > t.start)) continue;
    taken.push(h2);
  }
  taken.sort((a, b) => a.start - b.start || b.end - a.end);
  return taken;
};

// packages/core/src/crypto.ts
import { randomBytes as randomBytes2, createHash } from "node:crypto";

// packages/core/node_modules/@noble/ed25519/index.js
var ed25519_CURVE = Object.freeze({
  p: 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffedn,
  n: 0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3edn,
  h: 8n,
  a: 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffecn,
  d: 0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3n,
  Gx: 0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an,
  Gy: 0x6666666666666666666666666666666666666666666666666666666666666658n
});
var { p: P, n: N, Gx, Gy, a: _a, d: _d, h } = ed25519_CURVE;
var L = 32;
var captureTrace = (...args) => {
  if ("captureStackTrace" in Error && typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(...args);
  }
};
var err = (message = "") => {
  const e = new Error(message);
  captureTrace(e, err);
  throw e;
};
var isBig = (n) => typeof n === "bigint";
var isStr = (s) => typeof s === "string";
var isBytes = (a) => a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
var abytes = (value, length, title = "") => {
  const bytes = isBytes(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    const msg = prefix + "expected Uint8Array" + ofLen + ", got " + got;
    throw bytes ? new RangeError(msg) : new TypeError(msg);
  }
  return value;
};
var u8n = (len) => new Uint8Array(len);
var u8fr = (buf) => Uint8Array.from(buf);
var padh = (n, pad) => n.toString(16).padStart(pad, "0");
var bytesToHex = (b) => Array.from(abytes(b)).map((e) => padh(e, 2)).join("");
var C = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
var _ch = (ch) => {
  if (ch >= C._0 && ch <= C._9)
    return ch - C._0;
  if (ch >= C.A && ch <= C.F)
    return ch - (C.A - 10);
  if (ch >= C.a && ch <= C.f)
    return ch - (C.a - 10);
  return;
};
var hexToBytes = (hex2) => {
  const e = "hex invalid";
  if (!isStr(hex2))
    return err(e);
  const hl = hex2.length;
  const al = hl / 2;
  if (hl % 2)
    return err(e);
  const array = u8n(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = _ch(hex2.charCodeAt(hi));
    const n2 = _ch(hex2.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0)
      return err(e);
    array[ai] = n1 * 16 + n2;
  }
  return array;
};
var cr = () => globalThis?.crypto;
var subtle = () => cr()?.subtle ?? err("crypto.subtle must be defined, consider polyfill");
var concatBytes = (...arrs) => {
  let len = 0;
  for (const a of arrs)
    len += abytes(a).length;
  const r = u8n(len);
  let pad = 0;
  arrs.forEach((a) => {
    r.set(a, pad);
    pad += a.length;
  });
  return r;
};
var randomBytes = (len = L) => {
  const c = cr();
  return c.getRandomValues(u8n(len));
};
var big = BigInt;
var assertRange = (n, min, max, msg = "bad number: out of range") => {
  if (!isBig(n))
    throw new TypeError(msg);
  if (min <= n && n < max)
    return n;
  throw new RangeError(msg);
};
var M = (a, b = P) => {
  const r = a % b;
  return r >= 0n ? r : b + r;
};
var P_MASK = (1n << 255n) - 1n;
var modP = (num) => {
  if (num < 0n)
    err("negative coordinate");
  let r = (num >> 255n) * 19n + (num & P_MASK);
  r = (r >> 255n) * 19n + (r & P_MASK);
  return r % P;
};
var modN = (a) => M(a, N);
var invert = (num, md) => {
  if (num === 0n || md <= 0n)
    err("no inverse n=" + num + " mod=" + md);
  let a = M(num, md), b = md, x2 = 0n, y = 1n, u = 1n, v = 0n;
  while (a !== 0n) {
    const q = b / a, r = b % a;
    const m = x2 - u * q, n = y - v * q;
    b = a, a = r, x2 = u, y = v, u = m, v = n;
  }
  return b === 1n ? M(x2, md) : err("no inverse");
};
var callHash = (name) => {
  const fn = hashes[name];
  if (typeof fn !== "function")
    err("hashes." + name + " not set");
  return fn;
};
var checkDigest = (value) => abytes(value, 64, "digest");
var apoint = (p) => p instanceof Point ? p : err("Point expected");
var B256 = 2n ** 256n;
var Point = class _Point {
  static BASE;
  static ZERO;
  X;
  Y;
  Z;
  T;
  // Constructor only bounds-checks and freezes XYZT coordinates; it does not prove the point is
  // on-curve or that T matches X*Y/Z.
  constructor(X, Y, Z, T2) {
    const max = B256;
    this.X = assertRange(X, 0n, max);
    this.Y = assertRange(Y, 0n, max);
    this.Z = assertRange(Z, 1n, max);
    this.T = assertRange(T2, 0n, max);
    Object.freeze(this);
  }
  static CURVE() {
    return ed25519_CURVE;
  }
  static fromAffine(p) {
    return new _Point(p.x, p.y, 1n, modP(p.x * p.y));
  }
  /** RFC8032 5.1.3: Bytes to Point. */
  static fromBytes(hex2, zip215 = false) {
    const d3 = _d;
    const normed = u8fr(abytes(hex2, L));
    const lastByte = hex2[31];
    normed[31] = lastByte & ~128;
    const y = bytesToNumberLE(normed);
    const max = zip215 ? B256 : P;
    assertRange(y, 0n, max);
    const y2 = modP(y * y);
    const u = M(y2 - 1n);
    const v = modP(d3 * y2 + 1n);
    let { isValid, value: x2 } = uvRatio(u, v);
    if (!isValid)
      err("bad point: y not sqrt");
    const isXOdd = (x2 & 1n) === 1n;
    const isLastByteOdd = (lastByte & 128) !== 0;
    if (!zip215 && x2 === 0n && isLastByteOdd)
      err("bad point: x==0, isLastByteOdd");
    if (isLastByteOdd !== isXOdd)
      x2 = M(-x2);
    return new _Point(x2, y, 1n, modP(x2 * y));
  }
  static fromHex(hex2, zip215) {
    return _Point.fromBytes(hexToBytes(hex2), zip215);
  }
  get x() {
    return this.toAffine().x;
  }
  get y() {
    return this.toAffine().y;
  }
  /** Checks if the point is valid and on-curve. */
  assertValidity() {
    const a = _a;
    const d3 = _d;
    const p = this;
    if (p.is0())
      return err("bad point: ZERO");
    const { X, Y, Z, T: T2 } = p;
    const X2 = modP(X * X);
    const Y2 = modP(Y * Y);
    const Z2 = modP(Z * Z);
    const Z4 = modP(Z2 * Z2);
    const aX2 = modP(X2 * a);
    const left = modP(Z2 * (aX2 + Y2));
    const right = M(Z4 + modP(d3 * modP(X2 * Y2)));
    if (left !== right)
      return err("bad point: equation left != right (1)");
    const XY = modP(X * Y);
    const ZT = modP(Z * T2);
    if (XY !== ZT)
      return err("bad point: equation left != right (2)");
    return this;
  }
  /** Equality check: compare points P&Q. */
  equals(other) {
    const { X: X1, Y: Y1, Z: Z1 } = this;
    const { X: X2, Y: Y2, Z: Z2 } = apoint(other);
    const X1Z2 = modP(X1 * Z2);
    const X2Z1 = modP(X2 * Z1);
    const Y1Z2 = modP(Y1 * Z2);
    const Y2Z1 = modP(Y2 * Z1);
    return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
  }
  is0() {
    return this.equals(I);
  }
  /** Flip point over y coordinate. */
  negate() {
    return new _Point(M(-this.X), this.Y, this.Z, M(-this.T));
  }
  /** Point doubling. Complete formula. Cost: `4M + 4S + 1*a + 6add + 1*2`. */
  double() {
    const { X: X1, Y: Y1, Z: Z1 } = this;
    const a = _a;
    const A = modP(X1 * X1);
    const B = modP(Y1 * Y1);
    const C2 = modP(2n * Z1 * Z1);
    const D = modP(a * A);
    const x1y1 = M(X1 + Y1);
    const E = M(modP(x1y1 * x1y1) - A - B);
    const G3 = M(D + B);
    const F = M(G3 - C2);
    const H2 = M(D - B);
    const X3 = modP(E * F);
    const Y3 = modP(G3 * H2);
    const T3 = modP(E * H2);
    const Z3 = modP(F * G3);
    return new _Point(X3, Y3, Z3, T3);
  }
  /** Point addition. Complete formula. Cost: `8M + 1*k + 8add + 1*2`. */
  add(other) {
    const { X: X1, Y: Y1, Z: Z1, T: T1 } = this;
    const { X: X2, Y: Y2, Z: Z2, T: T2 } = apoint(other);
    const a = _a;
    const d3 = _d;
    const A = modP(X1 * X2);
    const B = modP(Y1 * Y2);
    const C2 = modP(modP(T1 * d3) * T2);
    const D = modP(Z1 * Z2);
    const E = M(modP(M(X1 + Y1) * M(X2 + Y2)) - A - B);
    const F = M(D - C2);
    const G3 = M(D + C2);
    const H2 = M(B - modP(a * A));
    const X3 = modP(E * F);
    const Y3 = modP(G3 * H2);
    const T3 = modP(E * H2);
    const Z3 = modP(F * G3);
    return new _Point(X3, Y3, Z3, T3);
  }
  subtract(other) {
    return this.add(apoint(other).negate());
  }
  /**
   * Point-by-scalar multiplication. Safe mode requires `1 <= n < CURVE.n`.
   * Unsafe mode additionally permits `n = 0` and returns the identity point for that case.
   * Uses {@link wNAF} for base point.
   * Uses fake point to mitigate side-channel leakage.
   * @param n - scalar by which point is multiplied
   * @param safe - safe mode guards against timing attacks; unsafe mode is faster
   */
  multiply(n, safe = true) {
    if (!safe && n === 0n)
      return I;
    assertRange(n, 1n, N);
    if (!safe && this.is0())
      return I;
    if (n === 1n)
      return this;
    if (this.equals(G))
      return wNAF(n).p;
    let p = I;
    let f = G;
    for (let d3 = this; n > 0n; d3 = d3.double(), n >>= 1n) {
      if (n & 1n)
        p = p.add(d3);
      else if (safe)
        f = f.add(d3);
    }
    return p;
  }
  multiplyUnsafe(scalar) {
    return this.multiply(scalar, false);
  }
  /** Convert point to 2d xy affine point. (X, Y, Z) ∋ (x=X/Z, y=Y/Z) */
  toAffine() {
    const { X, Y, Z } = this;
    if (this.equals(I))
      return { x: 0n, y: 1n };
    const iz = invert(Z, P);
    if (modP(Z * iz) !== 1n)
      err("invalid inverse");
    const x2 = modP(X * iz);
    const y = modP(Y * iz);
    return { x: x2, y };
  }
  toBytes() {
    const { x: x2, y } = this.toAffine();
    const b = numTo32bLE(y);
    b[31] |= x2 & 1n ? 128 : 0;
    return b;
  }
  toHex() {
    return bytesToHex(this.toBytes());
  }
  clearCofactor() {
    return this.multiply(big(h), false);
  }
  isSmallOrder() {
    return this.clearCofactor().is0();
  }
  isTorsionFree() {
    let p = this.multiply(N / 2n, false).double();
    if (N % 2n)
      p = p.add(this);
    return p.is0();
  }
};
var G = new Point(Gx, Gy, 1n, M(Gx * Gy));
var I = new Point(0n, 1n, 1n, 0n);
Point.BASE = G;
Point.ZERO = I;
var numTo32bLE = (num) => hexToBytes(padh(assertRange(num, 0n, B256), 64)).reverse();
var bytesToNumberLE = (b) => big("0x" + bytesToHex(u8fr(abytes(b)).reverse()));
var pow2 = (x2, power) => {
  let r = x2;
  while (power-- > 0n) {
    r = modP(r * r);
  }
  return r;
};
var pow_2_252_3 = (x2) => {
  const x22 = modP(x2 * x2);
  const b2 = modP(x22 * x2);
  const b4 = modP(pow2(b2, 2n) * b2);
  const b5 = modP(pow2(b4, 1n) * x2);
  const b10 = modP(pow2(b5, 5n) * b5);
  const b20 = modP(pow2(b10, 10n) * b10);
  const b40 = modP(pow2(b20, 20n) * b20);
  const b80 = modP(pow2(b40, 40n) * b40);
  const b160 = modP(pow2(b80, 80n) * b80);
  const b240 = modP(pow2(b160, 80n) * b80);
  const b250 = modP(pow2(b240, 10n) * b10);
  const pow_p_5_8 = modP(pow2(b250, 2n) * x2);
  return { pow_p_5_8, b2 };
};
var RM1 = 0x2b8324804fc1df0b2b4d00993dfbd7a72f431806ad2fe478c4ee1b274a0ea0b0n;
var uvRatio = (u, v) => {
  const v3 = modP(v * modP(v * v));
  const v7 = modP(modP(v3 * v3) * v);
  const pow = pow_2_252_3(modP(u * v7)).pow_p_5_8;
  let x2 = modP(u * modP(v3 * pow));
  const vx2 = modP(v * modP(x2 * x2));
  const root1 = x2;
  const root2 = modP(x2 * RM1);
  const useRoot1 = vx2 === u;
  const useRoot2 = vx2 === M(-u);
  const noRoot = vx2 === M(-u * RM1);
  if (useRoot1)
    x2 = root1;
  if (useRoot2 || noRoot)
    x2 = root2;
  if ((M(x2) & 1n) === 1n)
    x2 = M(-x2);
  return { isValid: useRoot1 || useRoot2, value: x2 };
};
var modL_LE = (hash) => modN(bytesToNumberLE(hash));
var sha512a = (...m) => Promise.resolve(callHash("sha512Async")(concatBytes(...m))).then(checkDigest);
var sha512s = (...m) => checkDigest(callHash("sha512")(concatBytes(...m)));
var hash2extK = (hashed) => {
  const copy = u8fr(hashed);
  const head = copy.slice(0, 32);
  head[0] &= 248;
  head[31] &= 127;
  head[31] |= 64;
  const prefix = copy.slice(32, 64);
  const scalar = modL_LE(head);
  const point = G.multiply(scalar);
  const pointBytes = point.toBytes();
  return { head, prefix, scalar, point, pointBytes };
};
var getExtendedPublicKeyAsync = (secretKey) => sha512a(abytes(secretKey, L)).then(hash2extK);
var getExtendedPublicKey = (secretKey) => hash2extK(sha512s(abytes(secretKey, L)));
var getPublicKeyAsync = (secretKey) => getExtendedPublicKeyAsync(secretKey).then((p) => p.pointBytes);
var hashFinishA = (res) => sha512a(res.hashable).then(res.finish);
var _sign = (e, rBytes, msg) => {
  const { pointBytes: P3, scalar: s } = e;
  const r = modL_LE(rBytes);
  const R2 = G.multiply(r).toBytes();
  const hashable = concatBytes(R2, P3, msg);
  const finish = (hashed) => {
    const S3 = modN(r + modL_LE(hashed) * s);
    return abytes(concatBytes(R2, numTo32bLE(S3)), 64);
  };
  return { hashable, finish };
};
var signAsync = async (message, secretKey) => {
  const m = abytes(message);
  const e = await getExtendedPublicKeyAsync(secretKey);
  const rBytes = await sha512a(e.prefix, m);
  return hashFinishA(_sign(e, rBytes, m));
};
var hashes = {
  sha512Async: async (message) => {
    const s = subtle();
    const m = concatBytes(message);
    return u8n(await s.digest("SHA-512", m.buffer));
  },
  sha512: void 0
};
var randomSecretKey = (seed) => {
  seed = seed === void 0 ? randomBytes(L) : seed;
  return abytes(seed, L);
};
var utils = /* @__PURE__ */ Object.freeze({
  getExtendedPublicKeyAsync,
  getExtendedPublicKey,
  randomSecretKey
});
var W = 8;
var scalarBits = 256;
var pwindows = Math.ceil(scalarBits / W) + 1;
var pwindowSize = 2 ** (W - 1);
var precompute = () => {
  const points = [];
  let p = G;
  let b = p;
  for (let w = 0; w < pwindows; w++) {
    b = p;
    points.push(b);
    for (let i = 1; i < pwindowSize; i++) {
      b = b.add(p);
      points.push(b);
    }
    p = b.double();
  }
  return points;
};
var Gpows = void 0;
var ctneg = (cnd, p) => {
  const n = p.negate();
  return cnd ? n : p;
};
var wNAF = (n) => {
  const comp = Gpows || (Gpows = precompute());
  let p = I;
  let f = G;
  const pow_2_w = 2 ** W;
  const maxNum = pow_2_w;
  const mask = big(pow_2_w - 1);
  const shiftBy = big(W);
  for (let w = 0; w < pwindows; w++) {
    let wbits = Number(n & mask);
    n >>= shiftBy;
    if (wbits > pwindowSize) {
      wbits -= maxNum;
      n += 1n;
    }
    const off = w * pwindowSize;
    const offF = off;
    const offP = off + Math.abs(wbits) - 1;
    const isEven = w % 2 !== 0;
    const isNeg = wbits < 0;
    if (wbits === 0) {
      f = f.add(ctneg(isEven, comp[offF]));
    } else {
      p = p.add(ctneg(isNeg, comp[offP]));
    }
  }
  if (n !== 0n)
    err("invalid wnaf");
  return { p, f };
};

// packages/core/src/crypto.ts
var hex = (b) => Buffer.from(b).toString("hex");
var fromHex = (s) => Uint8Array.from(Buffer.from(s, "hex"));
var canonicalize = (value) => {
  const walk = (v) => {
    if (v === null || typeof v !== "object") return v;
    if (Array.isArray(v)) return v.map(walk);
    const obj = v;
    const out = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = walk(obj[key]);
    }
    return out;
  };
  return JSON.stringify(walk(value));
};
var generateDevice = async () => {
  const deviceId = randomBytes2(16).toString("hex");
  const priv = utils.randomSecretKey();
  const pub = await getPublicKeyAsync(priv);
  return { deviceId, publicKey: hex(pub), privateKey: hex(priv) };
};
var signPayload = async (payload, privateKey) => {
  const msg = new TextEncoder().encode(canonicalize(payload));
  const sig = await signAsync(msg, fromHex(privateKey));
  return hex(sig);
};

// packages/core/src/utils/aggregation.ts
var emptyScore = () => ({ mild: 0, severe: 0, score: 0 });
var bumpScore = (map, key, sev) => {
  if (!map[key]) map[key] = emptyScore();
  if (sev === "mild") {
    map[key].mild++;
    map[key].score += 1;
  } else {
    map[key].severe++;
    map[key].score += 3;
  }
};
var startOfLocalDay = (now = /* @__PURE__ */ new Date()) => {
  const d3 = new Date(now);
  d3.setHours(0, 0, 0, 0);
  return d3.getTime();
};
var periodStartMs = (period, now = /* @__PURE__ */ new Date()) => {
  if (period === "all") return null;
  if (period === "today") return startOfLocalDay(now);
  if (period === "7d") return now.getTime() - 7 * 24 * 60 * 60 * 1e3;
  return now.getTime() - 30 * 24 * 60 * 60 * 1e3;
};
var inPeriod = (timestamp, period, now = /* @__PURE__ */ new Date()) => {
  const start = periodStartMs(period, now);
  if (!Number.isFinite(timestamp) || timestamp > now.getTime()) return false;
  if (start === null) return true;
  return timestamp >= start;
};
var messageStatsFromMessages = (messages) => {
  const out = [];
  for (const m of messages) {
    if (m.role !== "user") continue;
    out.push({
      messageId: m.id,
      agentId: m.agentId,
      modelId: m.modelId,
      timestamp: m.timestamp
    });
  }
  return out;
};
var hitFormKey = (text, wordId, severity) => `${text}\0${wordId}\0${severity}`;
var eventsFromMessages = (messages) => {
  const out = [];
  for (const m of messages) {
    if (m.role !== "user") continue;
    const hits = scanText(m.content);
    for (const h2 of hits) {
      out.push({
        id: `${m.id}:${h2.wordId}:${h2.start}`,
        messageId: m.id,
        timestamp: m.timestamp,
        agentId: m.agentId,
        modelId: m.modelId,
        wordId: h2.wordId,
        matchedText: h2.text,
        severity: h2.severity,
        contextHash: "",
        content: m.content
      });
    }
  }
  return out;
};
var summarizeHitForms = (events) => {
  const map = /* @__PURE__ */ new Map();
  for (const e of events) {
    const text = e.matchedText ?? e.wordId;
    const key = hitFormKey(text, e.wordId, e.severity);
    const cur = map.get(key);
    if (cur) cur.count++;
    else map.set(key, { text, wordId: e.wordId, severity: e.severity, count: 1 });
  }
  return [...map.values()].sort(
    (a, b) => b.count - a.count || a.text.localeCompare(b.text) || a.wordId.localeCompare(b.wordId)
  );
};
var summarizeEvents = (events) => {
  let mild = 0;
  let severe = 0;
  const byAgent = {};
  const byModel = {};
  const byWord = {};
  for (const e of events) {
    if (e.severity === "mild") mild++;
    else severe++;
    bumpScore(byAgent, e.agentId, e.severity);
    bumpScore(byModel, e.modelId || "unknown", e.severity);
    if (!byWord[e.wordId]) byWord[e.wordId] = { count: 0, severity: e.severity };
    byWord[e.wordId].count++;
  }
  return {
    mild,
    severe,
    score: mild + severe * 3,
    byAgent,
    byModel,
    byWord,
    byHitForm: summarizeHitForms(events)
  };
};
var countMessagesByModel = (stats) => {
  const out = {};
  for (const s of stats) {
    const key = s.modelId || "unknown";
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
};
var attachModelStats = (byModelScores, modelMessages) => {
  const keys = /* @__PURE__ */ new Set([...Object.keys(byModelScores), ...Object.keys(modelMessages)]);
  const out = {};
  for (const key of keys) {
    const base = byModelScores[key] ?? emptyScore();
    const messageCount = modelMessages[key] ?? 0;
    out[key] = {
      mild: base.mild,
      severe: base.severe,
      score: base.score,
      messageCount,
      rage: messageCount > 0 ? base.score / messageCount : null
    };
  }
  return out;
};
var summarizePeriod = (events, messageStats) => {
  const base = summarizeEvents(events);
  const modelMessages = countMessagesByModel(messageStats);
  return {
    mild: base.mild,
    severe: base.severe,
    score: base.score,
    byAgent: base.byAgent,
    byModel: attachModelStats(base.byModel, modelMessages),
    byWord: base.byWord,
    byHitForm: base.byHitForm,
    modelMessages
  };
};
var buildPeriodSummaries = (events, messageStats, now = /* @__PURE__ */ new Date()) => {
  const out = {};
  for (const period of PERIOD_KEYS) {
    const pe = events.filter((e) => inPeriod(e.timestamp, period, now));
    const pm = messageStats.filter((m) => inPeriod(m.timestamp, period, now));
    out[period] = summarizePeriod(pe, pm);
  }
  return out;
};
var topModelRage = (byModel, opts) => {
  const min = opts?.minMessages ?? 1;
  const limit = opts?.limit ?? 10;
  return Object.entries(byModel).filter(([, v]) => v.messageCount >= min && v.rage !== null).map(([modelId, v]) => ({ modelId, ...v })).sort((a, b) => (a.rage ?? Infinity) - (b.rage ?? Infinity) || b.messageCount - a.messageCount).slice(0, limit);
};
var buildSnapshotPayload = (device, summaries, scannedAt = (/* @__PURE__ */ new Date()).toISOString()) => {
  const all = summaries.all;
  return {
    schemaVersion: SCHEMA_VERSION,
    deviceId: device.deviceId,
    nickname: device.nickname,
    publicKey: device.publicKey,
    scannedAt,
    periods: {
      today: { mild: summaries.today.mild, severe: summaries.today.severe, score: summaries.today.score },
      "7d": { mild: summaries["7d"].mild, severe: summaries["7d"].severe, score: summaries["7d"].score },
      "30d": { mild: summaries["30d"].mild, severe: summaries["30d"].severe, score: summaries["30d"].score },
      all: { mild: all.mild, severe: all.severe, score: all.score }
    },
    byAgent: all.byAgent,
    byModel: all.byModel,
    byWord: all.byWord,
    modelMessages: all.modelMessages
  };
};
var isAttributedModel = (modelId) => Boolean(modelId) && modelId !== "unknown" && !modelId.startsWith("unrecognized:");
var buildAgentSplit = (events, messageStats) => {
  const out = {};
  const ensure = (agent) => {
    if (!out[agent]) {
      out[agent] = {
        total: emptyScore(),
        attributed: emptyScore(),
        unattributed: emptyScore(),
        attributedMessages: 0,
        messageCount: 0
      };
    }
    return out[agent];
  };
  for (const e of events) {
    const s = ensure(e.agentId);
    const target = isAttributedModel(e.modelId) ? s.attributed : s.unattributed;
    const bump = (acc) => {
      if (e.severity === "mild") {
        acc.mild++;
        acc.score += 1;
      } else {
        acc.severe++;
        acc.score += 3;
      }
    };
    bump(s.total);
    bump(target);
  }
  for (const m of messageStats) {
    const s = ensure(m.agentId);
    s.messageCount++;
    if (isAttributedModel(m.modelId)) s.attributedMessages++;
  }
  return out;
};
var buildSnapshotPayloadV3 = (device, summaries, events, messageStats, scannedAt = (/* @__PURE__ */ new Date()).toISOString(), modelCatalogVersion = MODEL_CATALOG_VERSION) => {
  const base = buildSnapshotPayload(device, summaries, scannedAt);
  return {
    ...base,
    schemaVersion: SCHEMA_VERSION_V3,
    modelCatalogVersion,
    agentSplit: buildAgentSplit(events, messageStats)
  };
};
var buildSnapshotPayloadV4 = (device, summaries, events, messageStats, scannedAt = (/* @__PURE__ */ new Date()).toISOString(), modelCatalogVersion = MODEL_CATALOG_VERSION) => {
  const base = buildSnapshotPayloadV3(device, summaries, events, messageStats, scannedAt, modelCatalogVersion);
  return {
    ...base,
    schemaVersion: SCHEMA_VERSION_V4,
    byHitForm: summaries.all.byHitForm
  };
};
var localDayKey = (timestamp, now = /* @__PURE__ */ new Date()) => {
  const d3 = new Date(timestamp);
  const safe = Number.isFinite(d3.getTime()) ? d3 : now;
  const y = safe.getFullYear();
  const m = String(safe.getMonth() + 1).padStart(2, "0");
  const day = String(safe.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
var buildDailyTrend = (events, now = /* @__PURE__ */ new Date()) => {
  const byDay = /* @__PURE__ */ new Map();
  const nowMs = now.getTime();
  for (const e of events) {
    if (!Number.isFinite(e.timestamp) || e.timestamp > nowMs) continue;
    const key = localDayKey(e.timestamp, now);
    const cur = byDay.get(key) ?? { mild: 0, severe: 0 };
    if (e.severity === "mild") cur.mild++;
    else cur.severe++;
    byDay.set(key, cur);
  }
  return [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, v]) => ({ date, mild: v.mild, severe: v.severe }));
};
var buildSnapshotPayloadV5 = (device, summaries, events, messageStats, scannedAt = (/* @__PURE__ */ new Date()).toISOString(), modelCatalogVersion = MODEL_CATALOG_VERSION) => {
  const base = buildSnapshotPayloadV4(device, summaries, events, messageStats, scannedAt, modelCatalogVersion);
  return {
    ...base,
    schemaVersion: SCHEMA_VERSION_V5,
    byDay: buildDailyTrend(events, new Date(scannedAt))
  };
};
var buildSignedUploadV5 = async (device, summaries, events, messageStats, scannedAt = (/* @__PURE__ */ new Date()).toISOString(), modelCatalogVersion = MODEL_CATALOG_VERSION) => {
  const unsigned = buildSnapshotPayloadV5(
    device,
    summaries,
    events,
    messageStats,
    scannedAt,
    modelCatalogVersion
  );
  const signature = await signPayload(unsigned, device.privateKey);
  return { ...unsigned, signature };
};

// packages/core/src/utils/scan-cache.ts
import { createHash as createHash2 } from "node:crypto";
import {
  existsSync as existsSync2,
  mkdirSync as mkdirSync2,
  readFileSync as readFileSync2,
  writeFileSync as writeFileSync2,
  renameSync as renameSync2,
  openSync,
  readSync,
  closeSync,
  statSync,
  unlinkSync
} from "node:fs";
import { dirname as dirname2, join as join2 } from "node:path";

// packages/core/src/utils/model-catalog-cache.ts
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
var home = () => process.env.HOME || process.env.USERPROFILE || ".";
var defaultModelCatalogCachePath = () => join(process.env.IDIOT_AI_DIR ?? join(home(), ".idiot-ai"), "model-catalog.json");
var activeResolver = new ModelResolver(builtinModelCatalog());
var activeCatalog = builtinModelCatalog();
var getActiveModelCatalog = () => activeCatalog;
var setActiveModelCatalog = (catalog) => {
  activeCatalog = catalog;
  activeResolver = new ModelResolver(catalog);
  setModelResolveFn((input) => activeResolver.resolve(input));
  return activeResolver;
};
var isCatalog = (v) => {
  if (!v || typeof v !== "object") return false;
  const o = v;
  return typeof o.version === "number" && typeof o.updatedAt === "string" && Array.isArray(o.models);
};
var sanitizeModels = (models) => {
  if (!Array.isArray(models)) return [];
  const out = [];
  for (const raw of models) {
    if (!raw || typeof raw !== "object") continue;
    const m = raw;
    if (typeof m.id !== "string" || !m.id.trim()) continue;
    if (typeof m.displayName !== "string" || typeof m.provider !== "string") continue;
    const entry = {
      id: m.id.trim(),
      displayName: m.displayName,
      provider: m.provider
    };
    if (Array.isArray(m.aliases)) {
      entry.aliases = m.aliases.filter((a) => typeof a === "string");
    }
    if (Array.isArray(m.providerAliases)) {
      entry.providerAliases = m.providerAliases.filter((a) => typeof a === "string");
    }
    if (typeof m.strict === "boolean") entry.strict = m.strict;
    out.push(entry);
  }
  return out;
};
var readCachedModelCatalog = (path2 = defaultModelCatalogCachePath()) => {
  try {
    if (!existsSync(path2)) return null;
    const raw = JSON.parse(readFileSync(path2, "utf8"));
    if (!raw?.catalog || !isCatalog(raw.catalog)) return null;
    raw.catalog.models = sanitizeModels(raw.catalog.models);
    return raw;
  } catch {
    return null;
  }
};
var writeCachedModelCatalog = (catalog, opts = {}) => {
  const path2 = opts.path ?? defaultModelCatalogCachePath();
  mkdirSync(dirname(path2), { recursive: true });
  const payload = {
    fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    sourceUrl: opts.sourceUrl,
    catalog
  };
  const tmp = `${path2}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(payload), "utf8");
  renameSync(tmp, path2);
};
var hydrateModelCatalogFromCache = (path2 = defaultModelCatalogCachePath()) => {
  const cached = readCachedModelCatalog(path2);
  const merged = mergeModelCatalogs(builtinModelCatalog(), cached?.catalog);
  setActiveModelCatalog(merged);
  return merged;
};
var pullModelCatalog = async (opts) => {
  const path2 = opts.path ?? defaultModelCatalogCachePath();
  const maxAgeMs = opts.maxAgeMs ?? 24 * 60 * 60 * 1e3;
  const cached = readCachedModelCatalog(path2);
  const fresh = cached && Date.now() - Date.parse(cached.fetchedAt) < maxAgeMs && (cached.catalog.version ?? 0) >= MODEL_CATALOG_VERSION;
  if (fresh && cached) {
    const merged = mergeModelCatalogs(builtinModelCatalog(), cached.catalog);
    setActiveModelCatalog(merged);
    return { ok: true, catalog: merged, from: "cache" };
  }
  const base = opts.serverUrl.replace(/\/$/, "");
  const url = `${base}/api/v1/model-catalog`;
  const fetchFn = opts.fetchImpl ?? globalThis.fetch;
  if (!fetchFn) {
    const merged = mergeModelCatalogs(builtinModelCatalog(), cached?.catalog);
    setActiveModelCatalog(merged);
    return { ok: false, catalog: merged, from: cached ? "cache" : "builtin", error: "no_fetch" };
  }
  try {
    const res = await fetchFn(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout?.(15e3)
    });
    if (!res.ok) throw new Error(`http_${res.status}`);
    const body = await res.json();
    const remote = {
      version: typeof body.version === "number" ? body.version : MODEL_CATALOG_VERSION,
      updatedAt: typeof body.updatedAt === "string" ? body.updatedAt : (/* @__PURE__ */ new Date()).toISOString(),
      models: sanitizeModels(body.models)
    };
    const merged = mergeModelCatalogs(builtinModelCatalog(), remote);
    writeCachedModelCatalog(remote, { path: path2, sourceUrl: url });
    setActiveModelCatalog(merged);
    return { ok: true, catalog: merged, from: "network" };
  } catch (err2) {
    const merged = mergeModelCatalogs(builtinModelCatalog(), cached?.catalog);
    setActiveModelCatalog(merged);
    return {
      ok: false,
      catalog: merged,
      from: cached ? "cache" : "builtin",
      error: err2 instanceof Error ? err2.message : String(err2)
    };
  }
};

// packages/core/src/utils/scan-cache.ts
var SCAN_CACHE_VERSION = 2;
var home2 = () => process.env.HOME || process.env.USERPROFILE || ".";
var defaultCachePath = () => join2(process.env.IDIOT_AI_CACHE_DIR ?? join2(home2(), ".cache", "idiot-ai"), "scan-cache.json");
var SAMPLE = 4096;
var fingerprintFile = (path2) => {
  try {
    const st = statSync(path2);
    const fd = openSync(path2, "r");
    try {
      const size = st.size;
      const buf = Buffer.alloc(Math.min(SAMPLE * 2, Math.max(size, 1)));
      let off = 0;
      if (size > 0) {
        const headLen = Math.min(SAMPLE, size);
        readSync(fd, buf, 0, headLen, 0);
        off = headLen;
        if (size > SAMPLE) {
          const tailLen = Math.min(SAMPLE, size - headLen);
          readSync(fd, buf, off, tailLen, size - tailLen);
          off += tailLen;
        }
      }
      return {
        size,
        mtimeMs: st.mtimeMs,
        hash: createHash2("sha1").update(buf.subarray(0, off)).digest("hex")
      };
    } finally {
      closeSync(fd);
    }
  } catch {
    return null;
  }
};
var sameFp = (a, b) => a.size === b.size && a.mtimeMs === b.mtimeMs && a.hash === b.hash;
var ScanCache = class {
  data;
  path;
  dirty = false;
  constructor(path2 = defaultCachePath()) {
    this.path = path2;
    const catalogVersion = getActiveModelCatalog().version || MODEL_CATALOG_VERSION;
    this.data = { version: SCAN_CACHE_VERSION, catalogVersion, files: {}, db: {} };
    try {
      if (existsSync2(path2)) {
        const parsed = JSON.parse(readFileSync2(path2, "utf-8"));
        if (parsed?.version === SCAN_CACHE_VERSION && parsed?.files && parsed.catalogVersion === catalogVersion) {
          this.data = { ...parsed, db: parsed.db ?? {} };
        }
      }
    } catch {
    }
  }
  /** Cached messages for a file, or null when missing / stale. */
  get(fileKey, fp) {
    const entry = this.data.files[fileKey];
    if (!entry) return null;
    return sameFp(entry.fp, fp) ? entry.messages : null;
  }
  set(fileKey, fp, messages) {
    this.data.files[fileKey] = { fp, messages };
    this.dirty = true;
  }
  /** Drop cache entries under `prefix` not present in `keepKeys`. */
  prune(prefix, keepKeys) {
    for (const key of Object.keys(this.data.files)) {
      if (!key.startsWith(prefix)) continue;
      if (!keepKeys.has(key)) {
        delete this.data.files[key];
        this.dirty = true;
      }
    }
  }
  getDb(dbKey) {
    return this.data.db?.[dbKey] ?? null;
  }
  setDb(dbKey, fp) {
    if (!this.data.db) this.data.db = {};
    this.data.db[dbKey] = fp;
    this.dirty = true;
  }
  flush() {
    if (!this.dirty) return;
    try {
      mkdirSync2(dirname2(this.path), { recursive: true });
      const tmp = `${this.path}.tmp`;
      writeFileSync2(tmp, JSON.stringify(this.data));
      renameSync2(tmp, this.path);
      this.dirty = false;
    } catch {
    }
  }
};
var scanCacheSlot = { current: null };

// packages/core/src/adapters/codex.ts
import { readFileSync as readFileSync3, existsSync as existsSync3 } from "node:fs";

// packages/core/node_modules/balanced-match/dist/esm/index.js
var balanced = (a, b, str) => {
  const ma = a instanceof RegExp ? maybeMatch(a, str) : a;
  const mb = b instanceof RegExp ? maybeMatch(b, str) : b;
  const r = ma !== null && mb != null && range(ma, mb, str);
  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + ma.length, r[1]),
    post: str.slice(r[1] + mb.length)
  };
};
var maybeMatch = (reg, str) => {
  const m = str.match(reg);
  return m ? m[0] : null;
};
var range = (a, b, str) => {
  let begs, beg, left, right = void 0, result;
  let ai = str.indexOf(a);
  let bi = str.indexOf(b, ai + 1);
  let i = ai;
  if (ai >= 0 && bi > 0) {
    if (a === b) {
      return [ai, bi];
    }
    begs = [];
    left = str.length;
    while (i >= 0 && !result) {
      if (i === ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length === 1) {
        const r = begs.pop();
        if (r !== void 0)
          result = [r, bi];
      } else {
        beg = begs.pop();
        if (beg !== void 0 && beg < left) {
          left = beg;
          right = bi;
        }
        bi = str.indexOf(b, i + 1);
      }
      i = ai < bi && ai >= 0 ? ai : bi;
    }
    if (begs.length && right !== void 0) {
      result = [left, right];
    }
  }
  return result;
};

// packages/core/node_modules/brace-expansion/dist/esm/index.js
var escSlash = "\0SLASH" + Math.random() + "\0";
var escOpen = "\0OPEN" + Math.random() + "\0";
var escClose = "\0CLOSE" + Math.random() + "\0";
var escComma = "\0COMMA" + Math.random() + "\0";
var escPeriod = "\0PERIOD" + Math.random() + "\0";
var escSlashPattern = new RegExp(escSlash, "g");
var escOpenPattern = new RegExp(escOpen, "g");
var escClosePattern = new RegExp(escClose, "g");
var escCommaPattern = new RegExp(escComma, "g");
var escPeriodPattern = new RegExp(escPeriod, "g");
var slashPattern = /\\\\/g;
var openPattern = /\\{/g;
var closePattern = /\\}/g;
var commaPattern = /\\,/g;
var periodPattern = /\\\./g;
var EXPANSION_MAX = 1e5;
var EXPANSION_MAX_LENGTH = 4e6;
function numeric(str) {
  return !isNaN(str) ? parseInt(str, 10) : str.charCodeAt(0);
}
function escapeBraces(str) {
  return str.replace(slashPattern, escSlash).replace(openPattern, escOpen).replace(closePattern, escClose).replace(commaPattern, escComma).replace(periodPattern, escPeriod);
}
function unescapeBraces(str) {
  return str.replace(escSlashPattern, "\\").replace(escOpenPattern, "{").replace(escClosePattern, "}").replace(escCommaPattern, ",").replace(escPeriodPattern, ".");
}
function parseCommaParts(str) {
  if (!str) {
    return [""];
  }
  const parts = [];
  const m = balanced("{", "}", str);
  if (!m) {
    return str.split(",");
  }
  const { pre, body, post } = m;
  const p = pre.split(",");
  p[p.length - 1] += "{" + body + "}";
  const postParts = parseCommaParts(post);
  if (post.length) {
    ;
    p[p.length - 1] += postParts.shift();
    p.push.apply(p, postParts);
  }
  parts.push.apply(parts, p);
  return parts;
}
function expand(str, options = {}) {
  if (!str) {
    return [];
  }
  const { max = EXPANSION_MAX, maxLength = EXPANSION_MAX_LENGTH } = options;
  if (str.slice(0, 2) === "{}") {
    str = "\\{\\}" + str.slice(2);
  }
  return expand_(escapeBraces(str), max, maxLength, true).map(unescapeBraces);
}
function embrace(str) {
  return "{" + str + "}";
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}
function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}
function combine(acc, pre, values, max, maxLength, dropEmpties) {
  const out = [];
  let length = 0;
  for (let a = 0; a < acc.length; a++) {
    for (let v = 0; v < values.length; v++) {
      if (out.length >= max)
        return out;
      const expansion = acc[a] + pre + values[v];
      if (dropEmpties && !expansion)
        continue;
      if (length + expansion.length > maxLength)
        return out;
      out.push(expansion);
      length += expansion.length;
    }
  }
  return out;
}
function expandSequence(body, isAlphaSequence, max, maxLength) {
  const n = body.split(/\.\./);
  const N2 = [];
  if (n[0] === void 0 || n[1] === void 0) {
    return N2;
  }
  const x2 = numeric(n[0]);
  const y = numeric(n[1]);
  const width = Math.max(n[0].length, n[1].length);
  let incr = n.length === 3 && n[2] !== void 0 ? Math.max(Math.abs(numeric(n[2])), 1) : 1;
  let test = lte;
  const reverse = y < x2;
  if (reverse) {
    incr *= -1;
    test = gte;
  }
  const pad = n.some(isPadded);
  let length = 0;
  for (let i = x2; test(i, y) && N2.length < max; i += incr) {
    let c;
    if (isAlphaSequence) {
      c = String.fromCharCode(i);
      if (c === "\\") {
        c = "";
      }
    } else {
      c = String(i);
      if (pad) {
        const need = width - c.length;
        if (need > 0) {
          const z = new Array(need + 1).join("0");
          if (i < 0) {
            c = "-" + z + c.slice(1);
          } else {
            c = z + c;
          }
        }
      }
    }
    if (length + c.length > maxLength)
      break;
    N2.push(c);
    length += c.length;
  }
  return N2;
}
function expand_(str, max, maxLength, isTop) {
  let acc = [""];
  let dropEmpties = false;
  let firstGroup = true;
  for (; ; ) {
    const m = balanced("{", "}", str);
    if (!m) {
      return combine(acc, str, [""], max, maxLength, dropEmpties);
    }
    const pre = m.pre;
    if (/\$$/.test(pre)) {
      acc = combine(acc, pre + "{" + m.body + "}", [""], max, maxLength, dropEmpties && !m.post.length);
      firstGroup = false;
      if (!m.post.length)
        break;
      str = m.post;
      continue;
    }
    const isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
    const isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
    const isSequence = isNumericSequence || isAlphaSequence;
    const isOptions = m.body.indexOf(",") >= 0;
    if (!isSequence && !isOptions) {
      if (m.post.match(/,(?!,).*\}/)) {
        str = m.pre + "{" + m.body + escClose + m.post;
        isTop = true;
        continue;
      }
      return combine(acc, pre + "{" + m.body + "}" + m.post, [""], max, maxLength, dropEmpties);
    }
    if (firstGroup) {
      dropEmpties = isTop && !isSequence;
      firstGroup = false;
    }
    let values;
    if (isSequence) {
      values = expandSequence(m.body, isAlphaSequence, max, maxLength);
    } else {
      let n = parseCommaParts(m.body);
      if (n.length === 1 && n[0] !== void 0) {
        n = expand_(n[0], max, maxLength, false).map(embrace);
        if (n.length === 1) {
          acc = combine(acc, pre + n[0], [""], max, maxLength, dropEmpties && !m.post.length);
          if (!m.post.length)
            break;
          str = m.post;
          continue;
        }
      }
      let dropsEmpties = dropEmpties && !m.post.length && !pre;
      for (let d3 = 0; dropsEmpties && d3 < acc.length; d3++) {
        if (acc[d3]) {
          dropsEmpties = false;
        }
      }
      values = [];
      let valuesLength = 0;
      outer: for (let j2 = 0; j2 < n.length; j2++) {
        const expanded = expand_(n[j2], max, maxLength, false);
        for (let k2 = 0; k2 < expanded.length; k2++) {
          const v = expanded[k2];
          if (dropsEmpties && !v)
            continue;
          if (values.length >= max || valuesLength + v.length > maxLength) {
            break outer;
          }
          values.push(v);
          valuesLength += v.length;
        }
      }
    }
    acc = combine(acc, pre, values, max, maxLength, dropEmpties && !m.post.length);
    if (!m.post.length)
      break;
    str = m.post;
  }
  return acc;
}

// packages/core/node_modules/minimatch/dist/esm/assert-valid-pattern.js
var MAX_PATTERN_LENGTH = 1024 * 64;
var assertValidPattern = (pattern) => {
  if (typeof pattern !== "string") {
    throw new TypeError("invalid pattern");
  }
  if (pattern.length > MAX_PATTERN_LENGTH) {
    throw new TypeError("pattern is too long");
  }
};

// packages/core/node_modules/minimatch/dist/esm/brace-expressions.js
var posixClasses = {
  "[:alnum:]": ["\\p{L}\\p{Nl}\\p{Nd}", true],
  "[:alpha:]": ["\\p{L}\\p{Nl}", true],
  "[:ascii:]": ["\\x00-\\x7f", false],
  "[:blank:]": ["\\p{Zs}\\t", true],
  "[:cntrl:]": ["\\p{Cc}", true],
  "[:digit:]": ["\\p{Nd}", true],
  "[:graph:]": ["\\p{Z}\\p{C}", true, true],
  "[:lower:]": ["\\p{Ll}", true],
  "[:print:]": ["\\p{C}", true],
  "[:punct:]": ["\\p{P}", true],
  "[:space:]": ["\\p{Z}\\t\\r\\n\\v\\f", true],
  "[:upper:]": ["\\p{Lu}", true],
  "[:word:]": ["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}", true],
  "[:xdigit:]": ["A-Fa-f0-9", false]
};
var braceEscape = (s) => s.replace(/[[\]\\-]/g, "\\$&");
var regexpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var rangesToString = (ranges) => ranges.join("");
var parseClass = (glob2, position) => {
  const pos = position;
  if (glob2.charAt(pos) !== "[") {
    throw new Error("not in a brace expression");
  }
  const ranges = [];
  const negs = [];
  let i = pos + 1;
  let sawStart = false;
  let uflag = false;
  let escaping = false;
  let negate = false;
  let endPos = pos;
  let rangeStart = "";
  WHILE: while (i < glob2.length) {
    const c = glob2.charAt(i);
    if ((c === "!" || c === "^") && i === pos + 1) {
      negate = true;
      i++;
      continue;
    }
    if (c === "]" && sawStart && !escaping) {
      endPos = i + 1;
      break;
    }
    sawStart = true;
    if (c === "\\") {
      if (!escaping) {
        escaping = true;
        i++;
        continue;
      }
    }
    if (c === "[" && !escaping) {
      for (const [cls, [unip, u, neg]] of Object.entries(posixClasses)) {
        if (glob2.startsWith(cls, i)) {
          if (rangeStart) {
            return ["$.", false, glob2.length - pos, true];
          }
          i += cls.length;
          if (neg)
            negs.push(unip);
          else
            ranges.push(unip);
          uflag = uflag || u;
          continue WHILE;
        }
      }
    }
    escaping = false;
    if (rangeStart) {
      if (c > rangeStart) {
        ranges.push(braceEscape(rangeStart) + "-" + braceEscape(c));
      } else if (c === rangeStart) {
        ranges.push(braceEscape(c));
      }
      rangeStart = "";
      i++;
      continue;
    }
    if (glob2.startsWith("-]", i + 1)) {
      ranges.push(braceEscape(c + "-"));
      i += 2;
      continue;
    }
    if (glob2.startsWith("-", i + 1)) {
      rangeStart = c;
      i += 2;
      continue;
    }
    ranges.push(braceEscape(c));
    i++;
  }
  if (endPos < i) {
    return ["", false, 0, false];
  }
  if (!ranges.length && !negs.length) {
    return ["$.", false, glob2.length - pos, true];
  }
  if (negs.length === 0 && ranges.length === 1 && /^\\?.$/.test(ranges[0]) && !negate) {
    const r = ranges[0].length === 2 ? ranges[0].slice(-1) : ranges[0];
    return [regexpEscape(r), false, endPos - pos, false];
  }
  const sranges = "[" + (negate ? "^" : "") + rangesToString(ranges) + "]";
  const snegs = "[" + (negate ? "" : "^") + rangesToString(negs) + "]";
  const comb = ranges.length && negs.length ? "(" + sranges + "|" + snegs + ")" : ranges.length ? sranges : snegs;
  return [comb, uflag, endPos - pos, true];
};

// packages/core/node_modules/minimatch/dist/esm/unescape.js
var unescape = (s, { windowsPathsNoEscape = false, magicalBraces = true } = {}) => {
  if (magicalBraces) {
    return windowsPathsNoEscape ? s.replace(/\[([^/\\])\]/g, "$1") : s.replace(/((?!\\).|^)\[([^/\\])\]/g, "$1$2").replace(/\\([^/])/g, "$1");
  }
  return windowsPathsNoEscape ? s.replace(/\[([^/\\{}])\]/g, "$1") : s.replace(/((?!\\).|^)\[([^/\\{}])\]/g, "$1$2").replace(/\\([^/{}])/g, "$1");
};

// packages/core/node_modules/minimatch/dist/esm/ast.js
var _a2;
var types = /* @__PURE__ */ new Set(["!", "?", "+", "*", "@"]);
var isExtglobType = (c) => types.has(c);
var isExtglobAST = (c) => isExtglobType(c.type);
var adoptionMap = /* @__PURE__ */ new Map([
  ["!", ["@"]],
  ["?", ["?", "@"]],
  ["@", ["@"]],
  ["*", ["*", "+", "?", "@"]],
  ["+", ["+", "@"]]
]);
var adoptionWithSpaceMap = /* @__PURE__ */ new Map([
  ["!", ["?"]],
  ["@", ["?"]],
  ["+", ["?", "*"]]
]);
var adoptionAnyMap = /* @__PURE__ */ new Map([
  ["!", ["?", "@"]],
  ["?", ["?", "@"]],
  ["@", ["?", "@"]],
  ["*", ["*", "+", "?", "@"]],
  ["+", ["+", "@", "?", "*"]]
]);
var usurpMap = /* @__PURE__ */ new Map([
  ["!", /* @__PURE__ */ new Map([["!", "@"]])],
  [
    "?",
    /* @__PURE__ */ new Map([
      ["*", "*"],
      ["+", "*"]
    ])
  ],
  [
    "@",
    /* @__PURE__ */ new Map([
      ["!", "!"],
      ["?", "?"],
      ["@", "@"],
      ["*", "*"],
      ["+", "+"]
    ])
  ],
  [
    "+",
    /* @__PURE__ */ new Map([
      ["?", "*"],
      ["*", "*"]
    ])
  ]
]);
var startNoTraversal = "(?!(?:^|/)\\.\\.?(?:$|/))";
var startNoDot = "(?!\\.)";
var addPatternStart = /* @__PURE__ */ new Set(["[", "."]);
var justDots = /* @__PURE__ */ new Set(["..", "."]);
var reSpecials = new Set("().*{}+?[]^$\\!");
var regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var qmark = "[^/]";
var star = qmark + "*?";
var starNoEmpty = qmark + "+?";
var ID = 0;
var AST = class {
  type;
  #root;
  #hasMagic;
  #uflag = false;
  #parts = [];
  #parent;
  #parentIndex;
  #negs;
  #filledNegs = false;
  #options;
  #toString;
  // set to true if it's an extglob with no children
  // (which really means one child of '')
  #emptyExt = false;
  id = ++ID;
  get depth() {
    return (this.#parent?.depth ?? -1) + 1;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return {
      "@@type": "AST",
      id: this.id,
      type: this.type,
      root: this.#root.id,
      parent: this.#parent?.id,
      depth: this.depth,
      partsLength: this.#parts.length,
      parts: this.#parts
    };
  }
  constructor(type, parent, options = {}) {
    this.type = type;
    if (type)
      this.#hasMagic = true;
    this.#parent = parent;
    this.#root = this.#parent ? this.#parent.#root : this;
    this.#options = this.#root === this ? options : this.#root.#options;
    this.#negs = this.#root === this ? [] : this.#root.#negs;
    if (type === "!" && !this.#root.#filledNegs)
      this.#negs.push(this);
    this.#parentIndex = this.#parent ? this.#parent.#parts.length : 0;
  }
  get hasMagic() {
    if (this.#hasMagic !== void 0)
      return this.#hasMagic;
    for (const p of this.#parts) {
      if (typeof p === "string")
        continue;
      if (p.type || p.hasMagic)
        return this.#hasMagic = true;
    }
    return this.#hasMagic;
  }
  // reconstructs the pattern
  toString() {
    return this.#toString !== void 0 ? this.#toString : !this.type ? this.#toString = this.#parts.map((p) => String(p)).join("") : this.#toString = this.type + "(" + this.#parts.map((p) => String(p)).join("|") + ")";
  }
  #fillNegs() {
    if (this !== this.#root)
      throw new Error("should only call on root");
    if (this.#filledNegs)
      return this;
    this.toString();
    this.#filledNegs = true;
    let n;
    while (n = this.#negs.pop()) {
      if (n.type !== "!")
        continue;
      let p = n;
      let pp = p.#parent;
      while (pp) {
        for (let i = p.#parentIndex + 1; !pp.type && i < pp.#parts.length; i++) {
          for (const part of n.#parts) {
            if (typeof part === "string") {
              throw new Error("string part in extglob AST??");
            }
            part.copyIn(pp.#parts[i]);
          }
        }
        p = pp;
        pp = p.#parent;
      }
    }
    return this;
  }
  push(...parts) {
    for (const p of parts) {
      if (p === "")
        continue;
      if (typeof p !== "string" && !(p instanceof _a2 && p.#parent === this)) {
        throw new Error("invalid part: " + p);
      }
      this.#parts.push(p);
    }
  }
  toJSON() {
    const ret = this.type === null ? this.#parts.slice().map((p) => typeof p === "string" ? p : p.toJSON()) : [this.type, ...this.#parts.map((p) => p.toJSON())];
    if (this.isStart() && !this.type)
      ret.unshift([]);
    if (this.isEnd() && (this === this.#root || this.#root.#filledNegs && this.#parent?.type === "!")) {
      ret.push({});
    }
    return ret;
  }
  isStart() {
    if (this.#root === this)
      return true;
    if (!this.#parent?.isStart())
      return false;
    if (this.#parentIndex === 0)
      return true;
    const p = this.#parent;
    for (let i = 0; i < this.#parentIndex; i++) {
      const pp = p.#parts[i];
      if (!(pp instanceof _a2 && pp.type === "!")) {
        return false;
      }
    }
    return true;
  }
  isEnd() {
    if (this.#root === this)
      return true;
    if (this.#parent?.type === "!")
      return true;
    if (!this.#parent?.isEnd())
      return false;
    if (!this.type)
      return this.#parent?.isEnd();
    const pl = this.#parent ? this.#parent.#parts.length : 0;
    return this.#parentIndex === pl - 1;
  }
  copyIn(part) {
    if (typeof part === "string")
      this.push(part);
    else
      this.push(part.clone(this));
  }
  clone(parent) {
    const c = new _a2(this.type, parent);
    for (const p of this.#parts) {
      c.copyIn(p);
    }
    return c;
  }
  static #parseAST(str, ast, pos, opt, extDepth) {
    const maxDepth = opt.maxExtglobRecursion ?? 2;
    let escaping = false;
    let inBrace = false;
    let braceStart = -1;
    let braceNeg = false;
    if (ast.type === null) {
      let i2 = pos;
      let acc2 = "";
      while (i2 < str.length) {
        const c = str.charAt(i2++);
        if (escaping || c === "\\") {
          escaping = !escaping;
          acc2 += c;
          continue;
        }
        if (inBrace) {
          if (i2 === braceStart + 1) {
            if (c === "^" || c === "!") {
              braceNeg = true;
            }
          } else if (c === "]" && !(i2 === braceStart + 2 && braceNeg)) {
            inBrace = false;
          }
          acc2 += c;
          continue;
        } else if (c === "[") {
          inBrace = true;
          braceStart = i2;
          braceNeg = false;
          acc2 += c;
          continue;
        }
        const doRecurse = !opt.noext && isExtglobType(c) && str.charAt(i2) === "(" && extDepth <= maxDepth;
        if (doRecurse) {
          ast.push(acc2);
          acc2 = "";
          const ext2 = new _a2(c, ast);
          i2 = _a2.#parseAST(str, ext2, i2, opt, extDepth + 1);
          ast.push(ext2);
          continue;
        }
        acc2 += c;
      }
      ast.push(acc2);
      return i2;
    }
    let i = pos + 1;
    let part = new _a2(null, ast);
    const parts = [];
    let acc = "";
    while (i < str.length) {
      const c = str.charAt(i++);
      if (escaping || c === "\\") {
        escaping = !escaping;
        acc += c;
        continue;
      }
      if (inBrace) {
        if (i === braceStart + 1) {
          if (c === "^" || c === "!") {
            braceNeg = true;
          }
        } else if (c === "]" && !(i === braceStart + 2 && braceNeg)) {
          inBrace = false;
        }
        acc += c;
        continue;
      } else if (c === "[") {
        inBrace = true;
        braceStart = i;
        braceNeg = false;
        acc += c;
        continue;
      }
      const doRecurse = !opt.noext && isExtglobType(c) && str.charAt(i) === "(" && /* c8 ignore start - the maxDepth is sufficient here */
      (extDepth <= maxDepth || ast && ast.#canAdoptType(c));
      if (doRecurse) {
        const depthAdd = ast && ast.#canAdoptType(c) ? 0 : 1;
        part.push(acc);
        acc = "";
        const ext2 = new _a2(c, part);
        part.push(ext2);
        i = _a2.#parseAST(str, ext2, i, opt, extDepth + depthAdd);
        continue;
      }
      if (c === "|") {
        part.push(acc);
        acc = "";
        parts.push(part);
        part = new _a2(null, ast);
        continue;
      }
      if (c === ")") {
        if (acc === "" && ast.#parts.length === 0) {
          ast.#emptyExt = true;
        }
        part.push(acc);
        acc = "";
        ast.push(...parts, part);
        return i;
      }
      acc += c;
    }
    ast.type = null;
    ast.#hasMagic = void 0;
    ast.#parts = [str.substring(pos - 1)];
    return i;
  }
  #canAdoptWithSpace(child) {
    return this.#canAdopt(child, adoptionWithSpaceMap);
  }
  #canAdopt(child, map = adoptionMap) {
    if (!child || typeof child !== "object" || child.type !== null || child.#parts.length !== 1 || this.type === null) {
      return false;
    }
    const gc = child.#parts[0];
    if (!gc || typeof gc !== "object" || gc.type === null) {
      return false;
    }
    return this.#canAdoptType(gc.type, map);
  }
  #canAdoptType(c, map = adoptionAnyMap) {
    return !!map.get(this.type)?.includes(c);
  }
  #adoptWithSpace(child, index) {
    const gc = child.#parts[0];
    const blank = new _a2(null, gc, this.options);
    blank.#parts.push("");
    gc.push(blank);
    this.#adopt(child, index);
  }
  #adopt(child, index) {
    const gc = child.#parts[0];
    this.#parts.splice(index, 1, ...gc.#parts);
    for (const p of gc.#parts) {
      if (typeof p === "object")
        p.#parent = this;
    }
    this.#toString = void 0;
  }
  #canUsurpType(c) {
    const m = usurpMap.get(this.type);
    return !!m?.has(c);
  }
  #canUsurp(child) {
    if (!child || typeof child !== "object" || child.type !== null || child.#parts.length !== 1 || this.type === null || this.#parts.length !== 1) {
      return false;
    }
    const gc = child.#parts[0];
    if (!gc || typeof gc !== "object" || gc.type === null) {
      return false;
    }
    return this.#canUsurpType(gc.type);
  }
  #usurp(child) {
    const m = usurpMap.get(this.type);
    const gc = child.#parts[0];
    const nt = m?.get(gc.type);
    if (!nt)
      return false;
    this.#parts = gc.#parts;
    for (const p of this.#parts) {
      if (typeof p === "object") {
        p.#parent = this;
      }
    }
    this.type = nt;
    this.#toString = void 0;
    this.#emptyExt = false;
  }
  static fromGlob(pattern, options = {}) {
    const ast = new _a2(null, void 0, options);
    _a2.#parseAST(pattern, ast, 0, options, 0);
    return ast;
  }
  // returns the regular expression if there's magic, or the unescaped
  // string if not.
  toMMPattern() {
    if (this !== this.#root)
      return this.#root.toMMPattern();
    const glob2 = this.toString();
    const [re, body, hasMagic2, uflag] = this.toRegExpSource();
    const anyMagic = hasMagic2 || this.#hasMagic || this.#options.nocase && !this.#options.nocaseMagicOnly && glob2.toUpperCase() !== glob2.toLowerCase();
    if (!anyMagic) {
      return body;
    }
    const flags = (this.#options.nocase ? "i" : "") + (uflag ? "u" : "");
    return Object.assign(new RegExp(`^${re}$`, flags), {
      _src: re,
      _glob: glob2
    });
  }
  get options() {
    return this.#options;
  }
  // returns the string match, the regexp source, whether there's magic
  // in the regexp (so a regular expression is required) and whether or
  // not the uflag is needed for the regular expression (for posix classes)
  // TODO: instead of injecting the start/end at this point, just return
  // the BODY of the regexp, along with the start/end portions suitable
  // for binding the start/end in either a joined full-path makeRe context
  // (where we bind to (^|/), or a standalone matchPart context (where
  // we bind to ^, and not /).  Otherwise slashes get duped!
  //
  // In part-matching mode, the start is:
  // - if not isStart: nothing
  // - if traversal possible, but not allowed: ^(?!\.\.?$)
  // - if dots allowed or not possible: ^
  // - if dots possible and not allowed: ^(?!\.)
  // end is:
  // - if not isEnd(): nothing
  // - else: $
  //
  // In full-path matching mode, we put the slash at the START of the
  // pattern, so start is:
  // - if first pattern: same as part-matching mode
  // - if not isStart(): nothing
  // - if traversal possible, but not allowed: /(?!\.\.?(?:$|/))
  // - if dots allowed or not possible: /
  // - if dots possible and not allowed: /(?!\.)
  // end is:
  // - if last pattern, same as part-matching mode
  // - else nothing
  //
  // Always put the (?:$|/) on negated tails, though, because that has to be
  // there to bind the end of the negated pattern portion, and it's easier to
  // just stick it in now rather than try to inject it later in the middle of
  // the pattern.
  //
  // We can just always return the same end, and leave it up to the caller
  // to know whether it's going to be used joined or in parts.
  // And, if the start is adjusted slightly, can do the same there:
  // - if not isStart: nothing
  // - if traversal possible, but not allowed: (?:/|^)(?!\.\.?$)
  // - if dots allowed or not possible: (?:/|^)
  // - if dots possible and not allowed: (?:/|^)(?!\.)
  //
  // But it's better to have a simpler binding without a conditional, for
  // performance, so probably better to return both start options.
  //
  // Then the caller just ignores the end if it's not the first pattern,
  // and the start always gets applied.
  //
  // But that's always going to be $ if it's the ending pattern, or nothing,
  // so the caller can just attach $ at the end of the pattern when building.
  //
  // So the todo is:
  // - better detect what kind of start is needed
  // - return both flavors of starting pattern
  // - attach $ at the end of the pattern when creating the actual RegExp
  //
  // Ah, but wait, no, that all only applies to the root when the first pattern
  // is not an extglob. If the first pattern IS an extglob, then we need all
  // that dot prevention biz to live in the extglob portions, because eg
  // +(*|.x*) can match .xy but not .yx.
  //
  // So, return the two flavors if it's #root and the first child is not an
  // AST, otherwise leave it to the child AST to handle it, and there,
  // use the (?:^|/) style of start binding.
  //
  // Even simplified further:
  // - Since the start for a join is eg /(?!\.) and the start for a part
  // is ^(?!\.), we can just prepend (?!\.) to the pattern (either root
  // or start or whatever) and prepend ^ or / at the Regexp construction.
  toRegExpSource(allowDot) {
    const dot = allowDot ?? !!this.#options.dot;
    if (this.#root === this) {
      this.#flatten();
      this.#fillNegs();
    }
    if (!isExtglobAST(this)) {
      const noEmpty = this.isStart() && this.isEnd() && !this.#parts.some((s) => typeof s !== "string");
      const src = this.#parts.map((p) => {
        const [re, _, hasMagic2, uflag] = typeof p === "string" ? _a2.#parseGlob(p, this.#hasMagic, noEmpty) : p.toRegExpSource(allowDot);
        this.#hasMagic = this.#hasMagic || hasMagic2;
        this.#uflag = this.#uflag || uflag;
        return re;
      }).join("");
      let start2 = "";
      if (this.isStart()) {
        if (typeof this.#parts[0] === "string") {
          const dotTravAllowed = this.#parts.length === 1 && justDots.has(this.#parts[0]);
          if (!dotTravAllowed) {
            const aps = addPatternStart;
            const needNoTrav = (
              // dots are allowed, and the pattern starts with [ or .
              dot && aps.has(src.charAt(0)) || // the pattern starts with \., and then [ or .
              src.startsWith("\\.") && aps.has(src.charAt(2)) || // the pattern starts with \.\., and then [ or .
              src.startsWith("\\.\\.") && aps.has(src.charAt(4))
            );
            const needNoDot = !dot && !allowDot && aps.has(src.charAt(0));
            start2 = needNoTrav ? startNoTraversal : needNoDot ? startNoDot : "";
          }
        }
      }
      let end = "";
      if (this.isEnd() && this.#root.#filledNegs && this.#parent?.type === "!") {
        end = "(?:$|\\/)";
      }
      const final2 = start2 + src + end;
      return [
        final2,
        unescape(src),
        this.#hasMagic = !!this.#hasMagic,
        this.#uflag
      ];
    }
    const repeated = this.type === "*" || this.type === "+";
    const start = this.type === "!" ? "(?:(?!(?:" : "(?:";
    let body = this.#partsToRegExp(dot);
    if (this.isStart() && this.isEnd() && !body && this.type !== "!") {
      const s = this.toString();
      const me = this;
      me.#parts = [s];
      me.type = null;
      me.#hasMagic = void 0;
      return [s, unescape(this.toString()), false, false];
    }
    let bodyDotAllowed = !repeated || allowDot || dot || !startNoDot ? "" : this.#partsToRegExp(true);
    if (bodyDotAllowed === body) {
      bodyDotAllowed = "";
    }
    if (bodyDotAllowed) {
      body = `(?:${body})(?:${bodyDotAllowed})*?`;
    }
    let final = "";
    if (this.type === "!" && this.#emptyExt) {
      final = (this.isStart() && !dot ? startNoDot : "") + starNoEmpty;
    } else {
      const close = this.type === "!" ? (
        // !() must match something,but !(x) can match ''
        "))" + (this.isStart() && !dot && !allowDot ? startNoDot : "") + star + ")"
      ) : this.type === "@" ? ")" : this.type === "?" ? ")?" : this.type === "+" && bodyDotAllowed ? ")" : this.type === "*" && bodyDotAllowed ? `)?` : `)${this.type}`;
      final = start + body + close;
    }
    return [
      final,
      unescape(body),
      this.#hasMagic = !!this.#hasMagic,
      this.#uflag
    ];
  }
  #flatten() {
    if (!isExtglobAST(this)) {
      for (const p of this.#parts) {
        if (typeof p === "object") {
          p.#flatten();
        }
      }
    } else {
      let iterations = 0;
      let done = false;
      do {
        done = true;
        for (let i = 0; i < this.#parts.length; i++) {
          const c = this.#parts[i];
          if (typeof c === "object") {
            c.#flatten();
            if (this.#canAdopt(c)) {
              done = false;
              this.#adopt(c, i);
            } else if (this.#canAdoptWithSpace(c)) {
              done = false;
              this.#adoptWithSpace(c, i);
            } else if (this.#canUsurp(c)) {
              done = false;
              this.#usurp(c);
            }
          }
        }
      } while (!done && ++iterations < 10);
    }
    this.#toString = void 0;
  }
  #partsToRegExp(dot) {
    return this.#parts.map((p) => {
      if (typeof p === "string") {
        throw new Error("string type in extglob ast??");
      }
      const [re, _, _hasMagic, uflag] = p.toRegExpSource(dot);
      this.#uflag = this.#uflag || uflag;
      return re;
    }).filter((p) => !(this.isStart() && this.isEnd()) || !!p).join("|");
  }
  static #parseGlob(glob2, hasMagic2, noEmpty = false) {
    let escaping = false;
    let re = "";
    let uflag = false;
    let inStar = false;
    for (let i = 0; i < glob2.length; i++) {
      const c = glob2.charAt(i);
      if (escaping) {
        escaping = false;
        re += (reSpecials.has(c) ? "\\" : "") + c;
        continue;
      }
      if (c === "*") {
        if (inStar)
          continue;
        inStar = true;
        re += noEmpty && /^[*]+$/.test(glob2) ? starNoEmpty : star;
        hasMagic2 = true;
        continue;
      } else {
        inStar = false;
      }
      if (c === "\\") {
        if (i === glob2.length - 1) {
          re += "\\\\";
        } else {
          escaping = true;
        }
        continue;
      }
      if (c === "[") {
        const [src, needUflag, consumed, magic] = parseClass(glob2, i);
        if (consumed) {
          re += src;
          uflag = uflag || needUflag;
          i += consumed - 1;
          hasMagic2 = hasMagic2 || magic;
          continue;
        }
      }
      if (c === "?") {
        re += qmark;
        hasMagic2 = true;
        continue;
      }
      re += regExpEscape(c);
    }
    return [re, unescape(glob2), !!hasMagic2, uflag];
  }
};
_a2 = AST;

// packages/core/node_modules/minimatch/dist/esm/escape.js
var escape = (s, { windowsPathsNoEscape = false, magicalBraces = false } = {}) => {
  if (magicalBraces) {
    return windowsPathsNoEscape ? s.replace(/[?*()[\]{}]/g, "[$&]") : s.replace(/[?*()[\]\\{}]/g, "\\$&");
  }
  return windowsPathsNoEscape ? s.replace(/[?*()[\]]/g, "[$&]") : s.replace(/[?*()[\]\\]/g, "\\$&");
};

// packages/core/node_modules/minimatch/dist/esm/index.js
var minimatch = (p, pattern, options = {}) => {
  assertValidPattern(pattern);
  if (!options.nocomment && pattern.charAt(0) === "#") {
    return false;
  }
  return new Minimatch(pattern, options).match(p);
};
var starDotExtRE = /^\*+([^+@!?*[(]*)$/;
var starDotExtTest = (ext2) => (f) => !f.startsWith(".") && f.endsWith(ext2);
var starDotExtTestDot = (ext2) => (f) => f.endsWith(ext2);
var starDotExtTestNocase = (ext2) => {
  ext2 = ext2.toLowerCase();
  return (f) => !f.startsWith(".") && f.toLowerCase().endsWith(ext2);
};
var starDotExtTestNocaseDot = (ext2) => {
  ext2 = ext2.toLowerCase();
  return (f) => f.toLowerCase().endsWith(ext2);
};
var starDotStarRE = /^\*+\.\*+$/;
var starDotStarTest = (f) => !f.startsWith(".") && f.includes(".");
var starDotStarTestDot = (f) => f !== "." && f !== ".." && f.includes(".");
var dotStarRE = /^\.\*+$/;
var dotStarTest = (f) => f !== "." && f !== ".." && f.startsWith(".");
var starRE = /^\*+$/;
var starTest = (f) => f.length !== 0 && !f.startsWith(".");
var starTestDot = (f) => f.length !== 0 && f !== "." && f !== "..";
var qmarksRE = /^\?+([^+@!?*[(]*)?$/;
var qmarksTestNocase = ([$0, ext2 = ""]) => {
  const noext = qmarksTestNoExt([$0]);
  if (!ext2)
    return noext;
  ext2 = ext2.toLowerCase();
  return (f) => noext(f) && f.toLowerCase().endsWith(ext2);
};
var qmarksTestNocaseDot = ([$0, ext2 = ""]) => {
  const noext = qmarksTestNoExtDot([$0]);
  if (!ext2)
    return noext;
  ext2 = ext2.toLowerCase();
  return (f) => noext(f) && f.toLowerCase().endsWith(ext2);
};
var qmarksTestDot = ([$0, ext2 = ""]) => {
  const noext = qmarksTestNoExtDot([$0]);
  return !ext2 ? noext : (f) => noext(f) && f.endsWith(ext2);
};
var qmarksTest = ([$0, ext2 = ""]) => {
  const noext = qmarksTestNoExt([$0]);
  return !ext2 ? noext : (f) => noext(f) && f.endsWith(ext2);
};
var qmarksTestNoExt = ([$0]) => {
  const len = $0.length;
  return (f) => f.length === len && !f.startsWith(".");
};
var qmarksTestNoExtDot = ([$0]) => {
  const len = $0.length;
  return (f) => f.length === len && f !== "." && f !== "..";
};
var defaultPlatform = typeof process === "object" && process ? typeof process.env === "object" && process.env && process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform : "posix";
var path = {
  win32: { sep: "\\" },
  posix: { sep: "/" }
};
var sep = defaultPlatform === "win32" ? path.win32.sep : path.posix.sep;
minimatch.sep = sep;
var GLOBSTAR = Symbol("globstar **");
minimatch.GLOBSTAR = GLOBSTAR;
var qmark2 = "[^/]";
var star2 = qmark2 + "*?";
var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
var filter = (pattern, options = {}) => (p) => minimatch(p, pattern, options);
minimatch.filter = filter;
var ext = (a, b = {}) => Object.assign({}, a, b);
var defaults = (def) => {
  if (!def || typeof def !== "object" || !Object.keys(def).length) {
    return minimatch;
  }
  const orig = minimatch;
  const m = (p, pattern, options = {}) => orig(p, pattern, ext(def, options));
  return Object.assign(m, {
    Minimatch: class Minimatch extends orig.Minimatch {
      constructor(pattern, options = {}) {
        super(pattern, ext(def, options));
      }
      static defaults(options) {
        return orig.defaults(ext(def, options)).Minimatch;
      }
    },
    AST: class AST extends orig.AST {
      /* c8 ignore start */
      constructor(type, parent, options = {}) {
        super(type, parent, ext(def, options));
      }
      /* c8 ignore stop */
      static fromGlob(pattern, options = {}) {
        return orig.AST.fromGlob(pattern, ext(def, options));
      }
    },
    unescape: (s, options = {}) => orig.unescape(s, ext(def, options)),
    escape: (s, options = {}) => orig.escape(s, ext(def, options)),
    filter: (pattern, options = {}) => orig.filter(pattern, ext(def, options)),
    defaults: (options) => orig.defaults(ext(def, options)),
    makeRe: (pattern, options = {}) => orig.makeRe(pattern, ext(def, options)),
    braceExpand: (pattern, options = {}) => orig.braceExpand(pattern, ext(def, options)),
    match: (list, pattern, options = {}) => orig.match(list, pattern, ext(def, options)),
    sep: orig.sep,
    GLOBSTAR
  });
};
minimatch.defaults = defaults;
var braceExpand = (pattern, options = {}) => {
  assertValidPattern(pattern);
  if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
    return [pattern];
  }
  return expand(pattern, { max: options.braceExpandMax });
};
minimatch.braceExpand = braceExpand;
var makeRe = (pattern, options = {}) => new Minimatch(pattern, options).makeRe();
minimatch.makeRe = makeRe;
var match = (list, pattern, options = {}) => {
  const mm = new Minimatch(pattern, options);
  list = list.filter((f) => mm.match(f));
  if (mm.options.nonull && !list.length) {
    list.push(pattern);
  }
  return list;
};
minimatch.match = match;
var globMagic = /[?*]|[+@!]\(.*?\)|\[|\]/;
var regExpEscape2 = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var Minimatch = class {
  options;
  set;
  pattern;
  windowsPathsNoEscape;
  nonegate;
  negate;
  comment;
  empty;
  preserveMultipleSlashes;
  partial;
  globSet;
  globParts;
  nocase;
  isWindows;
  platform;
  windowsNoMagicRoot;
  maxGlobstarRecursion;
  regexp;
  constructor(pattern, options = {}) {
    assertValidPattern(pattern);
    options = options || {};
    this.options = options;
    this.maxGlobstarRecursion = options.maxGlobstarRecursion ?? 200;
    this.pattern = pattern;
    this.platform = options.platform || defaultPlatform;
    this.isWindows = this.platform === "win32";
    const awe = "allowWindowsEscape";
    this.windowsPathsNoEscape = !!options.windowsPathsNoEscape || options[awe] === false;
    if (this.windowsPathsNoEscape) {
      this.pattern = this.pattern.replace(/\\/g, "/");
    }
    this.preserveMultipleSlashes = !!options.preserveMultipleSlashes;
    this.regexp = null;
    this.negate = false;
    this.nonegate = !!options.nonegate;
    this.comment = false;
    this.empty = false;
    this.partial = !!options.partial;
    this.nocase = !!this.options.nocase;
    this.windowsNoMagicRoot = options.windowsNoMagicRoot !== void 0 ? options.windowsNoMagicRoot : !!(this.isWindows && this.nocase);
    this.globSet = [];
    this.globParts = [];
    this.set = [];
    this.make();
  }
  hasMagic() {
    if (this.options.magicalBraces && this.set.length > 1) {
      return true;
    }
    for (const pattern of this.set) {
      for (const part of pattern) {
        if (typeof part !== "string")
          return true;
      }
    }
    return false;
  }
  debug(..._) {
  }
  make() {
    const pattern = this.pattern;
    const options = this.options;
    if (!options.nocomment && pattern.charAt(0) === "#") {
      this.comment = true;
      return;
    }
    if (!pattern) {
      this.empty = true;
      return;
    }
    this.parseNegate();
    this.globSet = [...new Set(this.braceExpand())];
    if (options.debug) {
      this.debug = (...args) => console.error(...args);
    }
    this.debug(this.pattern, this.globSet);
    const rawGlobParts = this.globSet.map((s) => this.slashSplit(s));
    this.globParts = this.preprocess(rawGlobParts);
    this.debug(this.pattern, this.globParts);
    let set = this.globParts.map((s, _, __) => {
      if (this.isWindows && this.windowsNoMagicRoot) {
        const isUNC = s[0] === "" && s[1] === "" && (s[2] === "?" || !globMagic.test(s[2])) && !globMagic.test(s[3]);
        const isDrive = /^[a-z]:/i.test(s[0]);
        if (isUNC) {
          return [
            ...s.slice(0, 4),
            ...s.slice(4).map((ss) => this.parse(ss))
          ];
        } else if (isDrive) {
          return [s[0], ...s.slice(1).map((ss) => this.parse(ss))];
        }
      }
      return s.map((ss) => this.parse(ss));
    });
    this.debug(this.pattern, set);
    this.set = set.filter((s) => s.indexOf(false) === -1);
    if (this.isWindows) {
      for (let i = 0; i < this.set.length; i++) {
        const p = this.set[i];
        if (p[0] === "" && p[1] === "" && this.globParts[i][2] === "?" && typeof p[3] === "string" && /^[a-z]:$/i.test(p[3])) {
          p[2] = "?";
        }
      }
    }
    this.debug(this.pattern, this.set);
  }
  // various transforms to equivalent pattern sets that are
  // faster to process in a filesystem walk.  The goal is to
  // eliminate what we can, and push all ** patterns as far
  // to the right as possible, even if it increases the number
  // of patterns that we have to process.
  preprocess(globParts) {
    if (this.options.noglobstar) {
      for (const partset of globParts) {
        for (let j2 = 0; j2 < partset.length; j2++) {
          if (partset[j2] === "**") {
            partset[j2] = "*";
          }
        }
      }
    }
    const { optimizationLevel = 1 } = this.options;
    if (optimizationLevel >= 2) {
      globParts = this.firstPhasePreProcess(globParts);
      globParts = this.secondPhasePreProcess(globParts);
    } else if (optimizationLevel >= 1) {
      globParts = this.levelOneOptimize(globParts);
    } else {
      globParts = this.adjascentGlobstarOptimize(globParts);
    }
    return globParts;
  }
  // just get rid of adjascent ** portions
  adjascentGlobstarOptimize(globParts) {
    return globParts.map((parts) => {
      let gs = -1;
      while (-1 !== (gs = parts.indexOf("**", gs + 1))) {
        let i = gs;
        while (parts[i + 1] === "**") {
          i++;
        }
        if (i !== gs) {
          parts.splice(gs, i - gs);
        }
      }
      return parts;
    });
  }
  // get rid of adjascent ** and resolve .. portions
  levelOneOptimize(globParts) {
    return globParts.map((parts) => {
      parts = parts.reduce((set, part) => {
        const prev = set[set.length - 1];
        if (part === "**" && prev === "**") {
          return set;
        }
        if (part === "..") {
          if (prev && prev !== ".." && prev !== "." && prev !== "**") {
            set.pop();
            return set;
          }
        }
        set.push(part);
        return set;
      }, []);
      return parts.length === 0 ? [""] : parts;
    });
  }
  levelTwoFileOptimize(parts) {
    if (!Array.isArray(parts)) {
      parts = this.slashSplit(parts);
    }
    let didSomething = false;
    do {
      didSomething = false;
      if (!this.preserveMultipleSlashes) {
        for (let i = 1; i < parts.length - 1; i++) {
          const p = parts[i];
          if (i === 1 && p === "" && parts[0] === "")
            continue;
          if (p === "." || p === "") {
            didSomething = true;
            parts.splice(i, 1);
            i--;
          }
        }
        if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
          didSomething = true;
          parts.pop();
        }
      }
      let dd = 0;
      while (-1 !== (dd = parts.indexOf("..", dd + 1))) {
        const p = parts[dd - 1];
        if (p && p !== "." && p !== ".." && p !== "**" && !(this.isWindows && /^[a-z]:$/i.test(p))) {
          didSomething = true;
          parts.splice(dd - 1, 2);
          dd -= 2;
        }
      }
    } while (didSomething);
    return parts.length === 0 ? [""] : parts;
  }
  // First phase: single-pattern processing
  // <pre> is 1 or more portions
  // <rest> is 1 or more portions
  // <p> is any portion other than ., .., '', or **
  // <e> is . or ''
  //
  // **/.. is *brutal* for filesystem walking performance, because
  // it effectively resets the recursive walk each time it occurs,
  // and ** cannot be reduced out by a .. pattern part like a regexp
  // or most strings (other than .., ., and '') can be.
  //
  // <pre>/**/../<p>/<p>/<rest> -> {<pre>/../<p>/<p>/<rest>,<pre>/**/<p>/<p>/<rest>}
  // <pre>/<e>/<rest> -> <pre>/<rest>
  // <pre>/<p>/../<rest> -> <pre>/<rest>
  // **/**/<rest> -> **/<rest>
  //
  // **/*/<rest> -> */**/<rest> <== not valid because ** doesn't follow
  // this WOULD be allowed if ** did follow symlinks, or * didn't
  firstPhasePreProcess(globParts) {
    let didSomething = false;
    do {
      didSomething = false;
      for (let parts of globParts) {
        let gs = -1;
        while (-1 !== (gs = parts.indexOf("**", gs + 1))) {
          let gss = gs;
          while (parts[gss + 1] === "**") {
            gss++;
          }
          if (gss > gs) {
            parts.splice(gs + 1, gss - gs);
          }
          let next = parts[gs + 1];
          const p = parts[gs + 2];
          const p2 = parts[gs + 3];
          if (next !== "..")
            continue;
          if (!p || p === "." || p === ".." || !p2 || p2 === "." || p2 === "..") {
            continue;
          }
          didSomething = true;
          parts.splice(gs, 1);
          const other = parts.slice(0);
          other[gs] = "**";
          globParts.push(other);
          gs--;
        }
        if (!this.preserveMultipleSlashes) {
          for (let i = 1; i < parts.length - 1; i++) {
            const p = parts[i];
            if (i === 1 && p === "" && parts[0] === "")
              continue;
            if (p === "." || p === "") {
              didSomething = true;
              parts.splice(i, 1);
              i--;
            }
          }
          if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
            didSomething = true;
            parts.pop();
          }
        }
        let dd = 0;
        while (-1 !== (dd = parts.indexOf("..", dd + 1))) {
          const p = parts[dd - 1];
          if (p && p !== "." && p !== ".." && p !== "**") {
            didSomething = true;
            const needDot = dd === 1 && parts[dd + 1] === "**";
            const splin = needDot ? ["."] : [];
            parts.splice(dd - 1, 2, ...splin);
            if (parts.length === 0)
              parts.push("");
            dd -= 2;
          }
        }
      }
    } while (didSomething);
    return globParts;
  }
  // second phase: multi-pattern dedupes
  // {<pre>/*/<rest>,<pre>/<p>/<rest>} -> <pre>/*/<rest>
  // {<pre>/<rest>,<pre>/<rest>} -> <pre>/<rest>
  // {<pre>/**/<rest>,<pre>/<rest>} -> <pre>/**/<rest>
  //
  // {<pre>/**/<rest>,<pre>/**/<p>/<rest>} -> <pre>/**/<rest>
  // ^-- not valid because ** doens't follow symlinks
  secondPhasePreProcess(globParts) {
    for (let i = 0; i < globParts.length - 1; i++) {
      for (let j2 = i + 1; j2 < globParts.length; j2++) {
        const matched = this.partsMatch(globParts[i], globParts[j2], !this.preserveMultipleSlashes);
        if (matched) {
          globParts[i] = [];
          globParts[j2] = matched;
          break;
        }
      }
    }
    return globParts.filter((gs) => gs.length);
  }
  partsMatch(a, b, emptyGSMatch = false) {
    let ai = 0;
    let bi = 0;
    let result = [];
    let which = "";
    while (ai < a.length && bi < b.length) {
      if (a[ai] === b[bi]) {
        result.push(which === "b" ? b[bi] : a[ai]);
        ai++;
        bi++;
      } else if (emptyGSMatch && a[ai] === "**" && b[bi] === a[ai + 1]) {
        result.push(a[ai]);
        ai++;
      } else if (emptyGSMatch && b[bi] === "**" && a[ai] === b[bi + 1]) {
        result.push(b[bi]);
        bi++;
      } else if (a[ai] === "*" && b[bi] && (this.options.dot || !b[bi].startsWith(".")) && b[bi] !== "**") {
        if (which === "b")
          return false;
        which = "a";
        result.push(a[ai]);
        ai++;
        bi++;
      } else if (b[bi] === "*" && a[ai] && (this.options.dot || !a[ai].startsWith(".")) && a[ai] !== "**") {
        if (which === "a")
          return false;
        which = "b";
        result.push(b[bi]);
        ai++;
        bi++;
      } else {
        return false;
      }
    }
    return a.length === b.length && result;
  }
  parseNegate() {
    if (this.nonegate)
      return;
    const pattern = this.pattern;
    let negate = false;
    let negateOffset = 0;
    for (let i = 0; i < pattern.length && pattern.charAt(i) === "!"; i++) {
      negate = !negate;
      negateOffset++;
    }
    if (negateOffset)
      this.pattern = pattern.slice(negateOffset);
    this.negate = negate;
  }
  // set partial to true to test if, for example,
  // "/a/b" matches the start of "/*/b/*/d"
  // Partial means, if you run out of file before you run
  // out of pattern, then that's fine, as long as all
  // the parts match.
  matchOne(file, pattern, partial = false) {
    let fileStartIndex = 0;
    let patternStartIndex = 0;
    if (this.isWindows) {
      const fileDrive = typeof file[0] === "string" && /^[a-z]:$/i.test(file[0]);
      const fileUNC = !fileDrive && file[0] === "" && file[1] === "" && file[2] === "?" && /^[a-z]:$/i.test(file[3]);
      const patternDrive = typeof pattern[0] === "string" && /^[a-z]:$/i.test(pattern[0]);
      const patternUNC = !patternDrive && pattern[0] === "" && pattern[1] === "" && pattern[2] === "?" && typeof pattern[3] === "string" && /^[a-z]:$/i.test(pattern[3]);
      const fdi = fileUNC ? 3 : fileDrive ? 0 : void 0;
      const pdi = patternUNC ? 3 : patternDrive ? 0 : void 0;
      if (typeof fdi === "number" && typeof pdi === "number") {
        const [fd, pd] = [
          file[fdi],
          pattern[pdi]
        ];
        if (fd.toLowerCase() === pd.toLowerCase()) {
          pattern[pdi] = fd;
          patternStartIndex = pdi;
          fileStartIndex = fdi;
        }
      }
    }
    const { optimizationLevel = 1 } = this.options;
    if (optimizationLevel >= 2) {
      file = this.levelTwoFileOptimize(file);
    }
    if (pattern.includes(GLOBSTAR)) {
      return this.#matchGlobstar(file, pattern, partial, fileStartIndex, patternStartIndex);
    }
    return this.#matchOne(file, pattern, partial, fileStartIndex, patternStartIndex);
  }
  #matchGlobstar(file, pattern, partial, fileIndex, patternIndex) {
    const firstgs = pattern.indexOf(GLOBSTAR, patternIndex);
    const lastgs = pattern.lastIndexOf(GLOBSTAR);
    const [head, body, tail] = partial ? [
      pattern.slice(patternIndex, firstgs),
      pattern.slice(firstgs + 1),
      []
    ] : [
      pattern.slice(patternIndex, firstgs),
      pattern.slice(firstgs + 1, lastgs),
      pattern.slice(lastgs + 1)
    ];
    if (head.length) {
      const fileHead = file.slice(fileIndex, fileIndex + head.length);
      if (!this.#matchOne(fileHead, head, partial, 0, 0)) {
        return false;
      }
      fileIndex += head.length;
      patternIndex += head.length;
    }
    let fileTailMatch = 0;
    if (tail.length) {
      if (tail.length + fileIndex > file.length)
        return false;
      let tailStart = file.length - tail.length;
      if (this.#matchOne(file, tail, partial, tailStart, 0)) {
        fileTailMatch = tail.length;
      } else {
        if (file[file.length - 1] !== "" || fileIndex + tail.length === file.length) {
          return false;
        }
        tailStart--;
        if (!this.#matchOne(file, tail, partial, tailStart, 0)) {
          return false;
        }
        fileTailMatch = tail.length + 1;
      }
    }
    if (!body.length) {
      let sawSome = !!fileTailMatch;
      for (let i2 = fileIndex; i2 < file.length - fileTailMatch; i2++) {
        const f = String(file[i2]);
        sawSome = true;
        if (f === "." || f === ".." || !this.options.dot && f.startsWith(".")) {
          return false;
        }
      }
      return partial || sawSome;
    }
    const bodySegments = [[[], 0]];
    let currentBody = bodySegments[0];
    let nonGsParts = 0;
    const nonGsPartsSums = [0];
    for (const b of body) {
      if (b === GLOBSTAR) {
        nonGsPartsSums.push(nonGsParts);
        currentBody = [[], 0];
        bodySegments.push(currentBody);
      } else {
        currentBody[0].push(b);
        nonGsParts++;
      }
    }
    let i = bodySegments.length - 1;
    const fileLength = file.length - fileTailMatch;
    for (const b of bodySegments) {
      b[1] = fileLength - (nonGsPartsSums[i--] + b[0].length);
    }
    return !!this.#matchGlobStarBodySections(file, bodySegments, fileIndex, 0, partial, 0, !!fileTailMatch);
  }
  // return false for "nope, not matching"
  // return null for "not matching, cannot keep trying"
  #matchGlobStarBodySections(file, bodySegments, fileIndex, bodyIndex, partial, globStarDepth, sawTail) {
    const bs = bodySegments[bodyIndex];
    if (!bs) {
      for (let i = fileIndex; i < file.length; i++) {
        sawTail = true;
        const f = file[i];
        if (f === "." || f === ".." || !this.options.dot && f.startsWith(".")) {
          return false;
        }
      }
      return sawTail;
    }
    const [body, after] = bs;
    while (fileIndex <= after) {
      const m = this.#matchOne(file.slice(0, fileIndex + body.length), body, partial, fileIndex, 0);
      if (m && globStarDepth < this.maxGlobstarRecursion) {
        const sub = this.#matchGlobStarBodySections(file, bodySegments, fileIndex + body.length, bodyIndex + 1, partial, globStarDepth + 1, sawTail);
        if (sub !== false) {
          return sub;
        }
      }
      const f = file[fileIndex];
      if (f === "." || f === ".." || !this.options.dot && f.startsWith(".")) {
        return false;
      }
      fileIndex++;
    }
    return partial || null;
  }
  #matchOne(file, pattern, partial, fileIndex, patternIndex) {
    let fi;
    let pi;
    let pl;
    let fl;
    for (fi = fileIndex, pi = patternIndex, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
      this.debug("matchOne loop");
      let p = pattern[pi];
      let f = file[fi];
      this.debug(pattern, p, f);
      if (p === false || p === GLOBSTAR) {
        return false;
      }
      let hit;
      if (typeof p === "string") {
        hit = f === p;
        this.debug("string match", p, f, hit);
      } else {
        hit = p.test(f);
        this.debug("pattern match", p, f, hit);
      }
      if (!hit)
        return false;
    }
    if (fi === fl && pi === pl) {
      return true;
    } else if (fi === fl) {
      return partial;
    } else if (pi === pl) {
      return fi === fl - 1 && file[fi] === "";
    } else {
      throw new Error("wtf?");
    }
  }
  braceExpand() {
    return braceExpand(this.pattern, this.options);
  }
  parse(pattern) {
    assertValidPattern(pattern);
    const options = this.options;
    if (pattern === "**")
      return GLOBSTAR;
    if (pattern === "")
      return "";
    let m;
    let fastTest = null;
    if (m = pattern.match(starRE)) {
      fastTest = options.dot ? starTestDot : starTest;
    } else if (m = pattern.match(starDotExtRE)) {
      fastTest = (options.nocase ? options.dot ? starDotExtTestNocaseDot : starDotExtTestNocase : options.dot ? starDotExtTestDot : starDotExtTest)(m[1]);
    } else if (m = pattern.match(qmarksRE)) {
      fastTest = (options.nocase ? options.dot ? qmarksTestNocaseDot : qmarksTestNocase : options.dot ? qmarksTestDot : qmarksTest)(m);
    } else if (m = pattern.match(starDotStarRE)) {
      fastTest = options.dot ? starDotStarTestDot : starDotStarTest;
    } else if (m = pattern.match(dotStarRE)) {
      fastTest = dotStarTest;
    }
    const re = AST.fromGlob(pattern, this.options).toMMPattern();
    if (fastTest && typeof re === "object") {
      Reflect.defineProperty(re, "test", { value: fastTest });
    }
    return re;
  }
  makeRe() {
    if (this.regexp || this.regexp === false)
      return this.regexp;
    const set = this.set;
    if (!set.length) {
      this.regexp = false;
      return this.regexp;
    }
    const options = this.options;
    const twoStar = options.noglobstar ? star2 : options.dot ? twoStarDot : twoStarNoDot;
    const flags = new Set(options.nocase ? ["i"] : []);
    let re = set.map((pattern) => {
      const pp = pattern.map((p) => {
        if (p instanceof RegExp) {
          for (const f of p.flags.split(""))
            flags.add(f);
        }
        return typeof p === "string" ? regExpEscape2(p) : p === GLOBSTAR ? GLOBSTAR : p._src;
      });
      pp.forEach((p, i) => {
        const next = pp[i + 1];
        const prev = pp[i - 1];
        if (p !== GLOBSTAR || prev === GLOBSTAR) {
          return;
        }
        if (prev === void 0) {
          if (next !== void 0 && next !== GLOBSTAR) {
            pp[i + 1] = "(?:\\/|" + twoStar + "\\/)?" + next;
          } else {
            pp[i] = twoStar;
          }
        } else if (next === void 0) {
          pp[i - 1] = prev + "(?:\\/|\\/" + twoStar + ")?";
        } else if (next !== GLOBSTAR) {
          pp[i - 1] = prev + "(?:\\/|\\/" + twoStar + "\\/)" + next;
          pp[i + 1] = GLOBSTAR;
        }
      });
      const filtered = pp.filter((p) => p !== GLOBSTAR);
      if (this.partial && filtered.length >= 1) {
        const prefixes = [];
        for (let i = 1; i <= filtered.length; i++) {
          prefixes.push(filtered.slice(0, i).join("/"));
        }
        return "(?:" + prefixes.join("|") + ")";
      }
      return filtered.join("/");
    }).join("|");
    const [open, close] = set.length > 1 ? ["(?:", ")"] : ["", ""];
    re = "^" + open + re + close + "$";
    if (this.partial) {
      re = "^(?:\\/|" + open + re.slice(1, -1) + close + ")$";
    }
    if (this.negate)
      re = "^(?!" + re + ").+$";
    try {
      this.regexp = new RegExp(re, [...flags].join(""));
    } catch {
      this.regexp = false;
    }
    return this.regexp;
  }
  slashSplit(p) {
    if (this.preserveMultipleSlashes) {
      return p.split("/");
    } else if (this.isWindows && /^\/\/[^/]+/.test(p)) {
      return ["", ...p.split(/\/+/)];
    } else {
      return p.split(/\/+/);
    }
  }
  match(f, partial = this.partial) {
    this.debug("match", f, this.pattern);
    if (this.comment) {
      return false;
    }
    if (this.empty) {
      return f === "";
    }
    if (f === "/" && partial) {
      return true;
    }
    const options = this.options;
    if (this.isWindows) {
      f = f.split("\\").join("/");
    }
    const ff = this.slashSplit(f);
    this.debug(this.pattern, "split", ff);
    const set = this.set;
    this.debug(this.pattern, "set", set);
    let filename = ff[ff.length - 1];
    if (!filename) {
      for (let i = ff.length - 2; !filename && i >= 0; i--) {
        filename = ff[i];
      }
    }
    for (const pattern of set) {
      let file = ff;
      if (options.matchBase && pattern.length === 1) {
        file = [filename];
      }
      const hit = this.matchOne(file, pattern, partial);
      if (hit) {
        if (options.flipNegate) {
          return true;
        }
        return !this.negate;
      }
    }
    if (options.flipNegate) {
      return false;
    }
    return this.negate;
  }
  static defaults(def) {
    return minimatch.defaults(def).Minimatch;
  }
};
minimatch.AST = AST;
minimatch.Minimatch = Minimatch;
minimatch.escape = escape;
minimatch.unescape = unescape;

// packages/core/node_modules/glob/dist/esm/glob.js
import { fileURLToPath as fileURLToPath2 } from "node:url";

// packages/core/node_modules/lru-cache/dist/esm/node/index.min.js
import { tracingChannel as G2, channel as P2 } from "node:diagnostics_channel";
var S2 = P2("lru-cache:metrics");
var W2 = G2("lru-cache");
var L2 = typeof performance == "object" && performance && typeof performance.now == "function" ? performance : Date;
var R = () => S2.hasSubscribers || W2.hasSubscribers;
var U = /* @__PURE__ */ new Set();
var M2 = typeof process == "object" && process ? process : {};
var k = (d3, e, t, i) => {
  typeof M2.emitWarning == "function" ? M2.emitWarning(d3, e, t, i) : console.error(`[${t}] ${e}: ${d3}`);
};
var H = (d3) => !U.has(d3);
var T = (d3) => !!d3 && d3 === Math.floor(d3) && d3 > 0 && isFinite(d3);
var j = (d3) => T(d3) ? d3 <= Math.pow(2, 8) ? Uint8Array : d3 <= Math.pow(2, 16) ? Uint16Array : d3 <= Math.pow(2, 32) ? Uint32Array : d3 <= Number.MAX_SAFE_INTEGER ? O : null : null;
var O = class extends Array {
  constructor(e) {
    super(e), this.fill(0);
  }
};
var x = class d {
  heap;
  length;
  static #o = false;
  static create(e) {
    let t = j(e);
    if (!t) return [];
    d.#o = true;
    let i = new d(e, t);
    return d.#o = false, i;
  }
  constructor(e, t) {
    if (!d.#o) throw new TypeError("instantiate Stack using Stack.create(n)");
    this.heap = new t(e), this.length = 0;
  }
  push(e) {
    this.heap[this.length++] = e;
  }
  pop() {
    return this.heap[--this.length];
  }
};
var I2 = class d2 {
  #o;
  #c;
  #S;
  #O;
  #w;
  #M;
  #I;
  #m;
  get perf() {
    return this.#m;
  }
  ttl;
  ttlResolution;
  ttlAutopurge;
  updateAgeOnGet;
  updateAgeOnHas;
  allowStale;
  noDisposeOnSet;
  noUpdateTTL;
  maxEntrySize;
  sizeCalculation;
  noDeleteOnFetchRejection;
  noDeleteOnStaleGet;
  allowStaleOnFetchAbort;
  allowStaleOnFetchRejection;
  ignoreFetchAbort;
  backgroundFetchSize;
  #n;
  #b;
  #s;
  #i;
  #t;
  #l;
  #u;
  #a;
  #h;
  #y;
  #r;
  #_;
  #F;
  #d;
  #g;
  #T;
  #U;
  #f;
  #D;
  static unsafeExposeInternals(e) {
    return { starts: e.#F, ttls: e.#d, autopurgeTimers: e.#g, sizes: e.#_, keyMap: e.#s, keyList: e.#i, valList: e.#t, next: e.#l, prev: e.#u, get head() {
      return e.#a;
    }, get tail() {
      return e.#h;
    }, free: e.#y, isBackgroundFetch: (t) => e.#e(t), backgroundFetch: (t, i, s, n) => e.#P(t, i, s, n), moveToTail: (t) => e.#L(t), indexes: (t) => e.#A(t), rindexes: (t) => e.#z(t), isStale: (t) => e.#p(t) };
  }
  get max() {
    return this.#o;
  }
  get maxSize() {
    return this.#c;
  }
  get calculatedSize() {
    return this.#b;
  }
  get size() {
    return this.#n;
  }
  get fetchMethod() {
    return this.#M;
  }
  get memoMethod() {
    return this.#I;
  }
  get dispose() {
    return this.#S;
  }
  get onInsert() {
    return this.#O;
  }
  get disposeAfter() {
    return this.#w;
  }
  constructor(e) {
    let { max: t = 0, ttl: i, ttlResolution: s = 1, ttlAutopurge: n, updateAgeOnGet: o, updateAgeOnHas: l, allowStale: h2, dispose: r, onInsert: c, disposeAfter: m, noDisposeOnSet: _, noUpdateTTL: u, maxSize: g = 0, maxEntrySize: f = 0, sizeCalculation: y, fetchMethod: a, memoMethod: w, noDeleteOnFetchRejection: F, noDeleteOnStaleGet: b, allowStaleOnFetchRejection: p, allowStaleOnFetchAbort: A, ignoreFetchAbort: z, backgroundFetchSize: C2 = 1, perf: E } = e;
    if (this.backgroundFetchSize = C2, E !== void 0 && typeof E?.now != "function") throw new TypeError("perf option must have a now() method if specified");
    if (this.#m = E ?? L2, t !== 0 && !T(t)) throw new TypeError("max option must be a nonnegative integer");
    let v = t ? j(t) : Array;
    if (!v) throw new Error("invalid max value: " + t);
    if (this.#o = t, this.#c = g, this.maxEntrySize = f || this.#c, this.sizeCalculation = y, this.sizeCalculation) {
      if (!this.#c && !this.maxEntrySize) throw new TypeError("cannot set sizeCalculation without setting maxSize or maxEntrySize");
      if (typeof this.sizeCalculation != "function") throw new TypeError("sizeCalculation set to non-function");
    }
    if (w !== void 0 && typeof w != "function") throw new TypeError("memoMethod must be a function if defined");
    if (this.#I = w, a !== void 0 && typeof a != "function") throw new TypeError("fetchMethod must be a function if specified");
    if (this.#M = a, this.#U = !!a, this.#s = /* @__PURE__ */ new Map(), this.#i = Array.from({ length: t }).fill(void 0), this.#t = Array.from({ length: t }).fill(void 0), this.#l = new v(t), this.#u = new v(t), this.#a = 0, this.#h = 0, this.#y = x.create(t), this.#n = 0, this.#b = 0, typeof r == "function" && (this.#S = r), typeof c == "function" && (this.#O = c), typeof m == "function" ? (this.#w = m, this.#r = []) : (this.#w = void 0, this.#r = void 0), this.#T = !!this.#S, this.#D = !!this.#O, this.#f = !!this.#w, this.noDisposeOnSet = !!_, this.noUpdateTTL = !!u, this.noDeleteOnFetchRejection = !!F, this.allowStaleOnFetchRejection = !!p, this.allowStaleOnFetchAbort = !!A, this.ignoreFetchAbort = !!z, this.maxEntrySize !== 0) {
      if (this.#c !== 0 && !T(this.#c)) throw new TypeError("maxSize must be a positive integer if specified");
      if (!T(this.maxEntrySize)) throw new TypeError("maxEntrySize must be a positive integer if specified");
      this.#X();
    }
    if (this.allowStale = !!h2, this.noDeleteOnStaleGet = !!b, this.updateAgeOnGet = !!o, this.updateAgeOnHas = !!l, this.ttlResolution = T(s) || s === 0 ? s : 1, this.ttlAutopurge = !!n, this.ttl = i || 0, this.ttl) {
      if (!T(this.ttl)) throw new TypeError("ttl must be a positive integer if specified");
      this.#k();
    }
    if (this.#o === 0 && this.ttl === 0 && this.#c === 0) throw new TypeError("At least one of max, maxSize, or ttl is required");
    if (!this.ttlAutopurge && !this.#o && !this.#c) {
      let D = "LRU_CACHE_UNBOUNDED";
      H(D) && (U.add(D), k("TTL caching without ttlAutopurge, max, or maxSize can result in unbounded memory consumption.", "UnboundedCacheWarning", D, d2));
    }
  }
  getRemainingTTL(e) {
    return this.#s.has(e) ? 1 / 0 : 0;
  }
  #k() {
    let e = new O(this.#o), t = new O(this.#o);
    this.#d = e, this.#F = t;
    let i = this.ttlAutopurge ? Array.from({ length: this.#o }) : void 0;
    this.#g = i, this.#H = (h2, r, c = this.#m.now()) => {
      t[h2] = r !== 0 ? c : 0, e[h2] = r, s(h2, r);
    }, this.#R = (h2) => {
      t[h2] = e[h2] !== 0 ? this.#m.now() : 0, s(h2, e[h2]);
    };
    let s = this.ttlAutopurge ? (h2, r) => {
      if (i?.[h2] && (clearTimeout(i[h2]), i[h2] = void 0), r && r !== 0 && i) {
        let c = setTimeout(() => {
          this.#p(h2) ? (this.#E(this.#i[h2], "expire"), i[h2] = void 0) : s(h2, l(h2));
        }, r + 1);
        c.unref && c.unref(), i[h2] = c;
      }
    } : () => {
    };
    this.#v = (h2, r) => {
      if (e[r]) {
        let c = e[r], m = t[r];
        if (!c || !m) return;
        h2.ttl = c, h2.start = m, h2.now = n || o();
        let _ = h2.now - m;
        h2.remainingTTL = c - _;
      }
    };
    let n = 0, o = () => {
      let h2 = this.#m.now();
      if (this.ttlResolution > 0) {
        n = h2;
        let r = setTimeout(() => n = 0, this.ttlResolution);
        r.unref && r.unref();
      }
      return h2;
    };
    this.getRemainingTTL = (h2) => {
      let r = this.#s.get(h2);
      return r === void 0 ? 0 : l(r);
    };
    let l = (h2) => {
      let r = e[h2], c = t[h2];
      if (!r || !c) return 1 / 0;
      let m = (n || o()) - c;
      return r - m;
    };
    this.#p = (h2) => {
      let r = t[h2], c = e[h2];
      return !!c && !!r && (n || o()) - r > c;
    };
  }
  #R = () => {
  };
  #v = () => {
  };
  #H = () => {
  };
  #p = () => false;
  #X() {
    let e = new O(this.#o);
    this.#b = 0, this.#_ = e, this.#x = (t) => {
      this.#b -= e[t], e[t] = 0;
    }, this.#N = (t, i, s, n) => {
      if (!T(s)) {
        if (this.#e(i)) return this.backgroundFetchSize;
        if (n) {
          if (typeof n != "function") throw new TypeError("sizeCalculation must be a function");
          if (s = n(i, t), !T(s)) throw new TypeError("sizeCalculation return invalid (expect positive integer)");
        } else throw new TypeError("invalid size value (must be positive integer). When maxSize or maxEntrySize is used, sizeCalculation or size must be set.");
      }
      return s;
    }, this.#j = (t, i, s) => {
      if (e[t] = i, this.#c) {
        let n = this.#c - e[t];
        for (; this.#b > n; ) this.#G(true);
      }
      this.#b += e[t], s && (s.entrySize = i, s.totalCalculatedSize = this.#b);
    };
  }
  #x = (e) => {
  };
  #j = (e, t, i) => {
  };
  #N = (e, t, i, s) => {
    if (i || s) throw new TypeError("cannot set size without setting maxSize or maxEntrySize on cache");
    return 0;
  };
  *#A({ allowStale: e = this.allowStale } = {}) {
    if (this.#n) for (let t = this.#h; this.#V(t) && ((e || !this.#p(t)) && (yield t), t !== this.#a); ) t = this.#u[t];
  }
  *#z({ allowStale: e = this.allowStale } = {}) {
    if (this.#n) for (let t = this.#a; this.#V(t) && ((e || !this.#p(t)) && (yield t), t !== this.#h); ) t = this.#l[t];
  }
  #V(e) {
    return e !== void 0 && this.#s.get(this.#i[e]) === e;
  }
  *entries() {
    for (let e of this.#A()) this.#t[e] !== void 0 && this.#i[e] !== void 0 && !this.#e(this.#t[e]) && (yield [this.#i[e], this.#t[e]]);
  }
  *rentries() {
    for (let e of this.#z()) this.#t[e] !== void 0 && this.#i[e] !== void 0 && !this.#e(this.#t[e]) && (yield [this.#i[e], this.#t[e]]);
  }
  *keys() {
    for (let e of this.#A()) {
      let t = this.#i[e];
      t !== void 0 && !this.#e(this.#t[e]) && (yield t);
    }
  }
  *rkeys() {
    for (let e of this.#z()) {
      let t = this.#i[e];
      t !== void 0 && !this.#e(this.#t[e]) && (yield t);
    }
  }
  *values() {
    for (let e of this.#A()) this.#t[e] !== void 0 && !this.#e(this.#t[e]) && (yield this.#t[e]);
  }
  *rvalues() {
    for (let e of this.#z()) this.#t[e] !== void 0 && !this.#e(this.#t[e]) && (yield this.#t[e]);
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  [Symbol.toStringTag] = "LRUCache";
  find(e, t = {}) {
    for (let i of this.#A()) {
      let s = this.#t[i], n = this.#e(s) ? s.__staleWhileFetching : s;
      if (n !== void 0 && e(n, this.#i[i], this)) return this.#C(this.#i[i], t);
    }
  }
  forEach(e, t = this) {
    for (let i of this.#A()) {
      let s = this.#t[i], n = this.#e(s) ? s.__staleWhileFetching : s;
      n !== void 0 && e.call(t, n, this.#i[i], this);
    }
  }
  rforEach(e, t = this) {
    for (let i of this.#z()) {
      let s = this.#t[i], n = this.#e(s) ? s.__staleWhileFetching : s;
      n !== void 0 && e.call(t, n, this.#i[i], this);
    }
  }
  purgeStale() {
    let e = false;
    for (let t of this.#z({ allowStale: true })) this.#p(t) && (this.#E(this.#i[t], "expire"), e = true);
    return e;
  }
  info(e) {
    let t = this.#s.get(e);
    if (t === void 0) return;
    let i = this.#t[t], s = this.#e(i) ? i.__staleWhileFetching : i;
    if (s === void 0) return;
    let n = { value: s };
    if (this.#d && this.#F) {
      let o = this.#d[t], l = this.#F[t];
      if (o && l) {
        let h2 = o - (this.#m.now() - l);
        n.ttl = h2, n.start = Date.now();
      }
    }
    return this.#_ && (n.size = this.#_[t]), n;
  }
  dump() {
    let e = [];
    for (let t of this.#A({ allowStale: true })) {
      let i = this.#i[t], s = this.#t[t], n = this.#e(s) ? s.__staleWhileFetching : s;
      if (n === void 0 || i === void 0) continue;
      let o = { value: n };
      if (this.#d && this.#F) {
        o.ttl = this.#d[t];
        let l = this.#m.now() - this.#F[t];
        o.start = Math.floor(Date.now() - l);
      }
      this.#_ && (o.size = this.#_[t]), e.unshift([i, o]);
    }
    return e;
  }
  load(e) {
    this.clear();
    for (let [t, i] of e) {
      if (i.start) {
        let s = Date.now() - i.start;
        i.start = this.#m.now() - s;
      }
      this.#W(t, i.value, i);
    }
  }
  set(e, t, i = {}) {
    let { status: s = S2.hasSubscribers ? {} : void 0 } = i;
    i.status = s, s && (s.op = "set", s.key = e, t !== void 0 && (s.value = t), s.cache = this);
    let n = this.#W(e, t, i);
    return s && S2.hasSubscribers && S2.publish(s), n;
  }
  #W(e, t, i, s) {
    let { ttl: n = this.ttl, start: o, noDisposeOnSet: l = this.noDisposeOnSet, sizeCalculation: h2 = this.sizeCalculation, status: r } = i, c = this.#e(t);
    if (t === void 0) return r && (r.set = "deleted"), this.delete(e), this;
    let { noUpdateTTL: m = this.noUpdateTTL } = i;
    r && !c && (r.value = t);
    let _ = this.#N(e, t, i.size || 0, h2, r);
    if (this.maxEntrySize && _ > this.maxEntrySize) return this.#E(e, "set"), r && (r.set = "miss", r.maxEntrySizeExceeded = true), this;
    let u = this.#n === 0 ? void 0 : this.#s.get(e);
    if (u === void 0) u = this.#n === 0 ? this.#h : this.#y.length !== 0 ? this.#y.pop() : this.#n === this.#o ? this.#G(false) : this.#n, this.#i[u] = e, this.#t[u] = t, this.#s.set(e, u), this.#l[this.#h] = u, this.#u[u] = this.#h, this.#h = u, this.#n++, this.#j(u, _, r), r && (r.set = "add"), m = false, this.#D && !c && this.#O?.(t, e, "add");
    else {
      this.#L(u);
      let g = this.#t[u];
      if (t !== g) {
        if (!l) if (this.#e(g)) {
          g !== s && g.__abortController.abort(new Error("replaced"));
          let { __staleWhileFetching: f } = g;
          f !== void 0 && f !== t && (this.#T && this.#S?.(f, e, "set"), this.#f && this.#r?.push([f, e, "set"]));
        } else this.#T && this.#S?.(g, e, "set"), this.#f && this.#r?.push([g, e, "set"]);
        if (this.#x(u), this.#j(u, _, r), this.#t[u] = t, !c) {
          let f = g && this.#e(g) ? g.__staleWhileFetching : g, y = f === void 0 ? "add" : t !== f ? "replace" : "update";
          r && (r.set = y, f !== void 0 && (r.oldValue = f)), this.#D && this.onInsert?.(t, e, y);
        }
      } else c || (r && (r.set = "update"), this.#D && this.onInsert?.(t, e, "update"));
    }
    if (n !== 0 && !this.#d && this.#k(), this.#d && (m || this.#H(u, n, o), r && this.#v(r, u)), !l && this.#f && this.#r) {
      let g = this.#r, f;
      for (; f = g?.shift(); ) this.#w?.(...f);
    }
    return this;
  }
  pop() {
    try {
      for (; this.#n; ) {
        let e = this.#t[this.#a];
        if (this.#G(true), this.#e(e)) {
          if (e.__staleWhileFetching) return e.__staleWhileFetching;
        } else if (e !== void 0) return e;
      }
    } finally {
      if (this.#f && this.#r) {
        let e = this.#r, t;
        for (; t = e?.shift(); ) this.#w?.(...t);
      }
    }
  }
  #G(e) {
    let t = this.#a, i = this.#i[t], s = this.#t[t], n = this.#e(s);
    n && s.__abortController.abort(new Error("evicted"));
    let o = n ? s.__staleWhileFetching : s;
    return (this.#T || this.#f) && o !== void 0 && (this.#T && this.#S?.(o, i, "evict"), this.#f && this.#r?.push([o, i, "evict"])), this.#x(t), this.#g?.[t] && (clearTimeout(this.#g[t]), this.#g[t] = void 0), e && (this.#i[t] = void 0, this.#t[t] = void 0, this.#y.push(t)), this.#n === 1 ? (this.#a = this.#h = 0, this.#y.length = 0) : this.#a = this.#l[t], this.#s.delete(i), this.#n--, t;
  }
  has(e, t = {}) {
    let { status: i = S2.hasSubscribers ? {} : void 0 } = t;
    t.status = i, i && (i.op = "has", i.key = e, i.cache = this);
    let s = this.#Y(e, t);
    return S2.hasSubscribers && S2.publish(i), s;
  }
  #Y(e, t = {}) {
    let { updateAgeOnHas: i = this.updateAgeOnHas, status: s } = t, n = this.#s.get(e);
    if (n !== void 0) {
      let o = this.#t[n];
      if (this.#e(o) && o.__staleWhileFetching === void 0) return false;
      if (this.#p(n)) s && (s.has = "stale", this.#v(s, n));
      else return i && this.#R(n), s && (s.has = "hit", this.#v(s, n)), true;
    } else s && (s.has = "miss");
    return false;
  }
  peek(e, t = {}) {
    let { status: i = R() ? {} : void 0 } = t;
    i && (i.op = "peek", i.key = e, i.cache = this), t.status = i;
    let s = this.#J(e, t);
    return S2.hasSubscribers && S2.publish(i), s;
  }
  #J(e, t) {
    let { status: i, allowStale: s = this.allowStale } = t, n = this.#s.get(e);
    if (n === void 0 || !s && this.#p(n)) {
      i && (i.peek = n === void 0 ? "miss" : "stale");
      return;
    }
    let o = this.#t[n], l = this.#e(o) ? o.__staleWhileFetching : o;
    return i && (l !== void 0 ? (i.peek = "hit", i.value = l) : i.peek = "miss"), l;
  }
  #P(e, t, i, s) {
    let n = t === void 0 ? void 0 : this.#t[t];
    if (this.#e(n)) return n;
    let o = new AbortController(), { signal: l } = i;
    l?.addEventListener("abort", () => o.abort(l.reason), { signal: o.signal });
    let h2 = { signal: o.signal, options: i, context: s }, r = (f, y = false) => {
      let { aborted: a } = o.signal, w = i.ignoreFetchAbort && f !== void 0, F = i.ignoreFetchAbort || !!(i.allowStaleOnFetchAbort && f !== void 0);
      if (i.status && (a && !y ? (i.status.fetchAborted = true, i.status.fetchError = o.signal.reason, w && (i.status.fetchAbortIgnored = true)) : i.status.fetchResolved = true), a && !w && !y) return m(o.signal.reason, F);
      let b = u, p = this.#t[t];
      return (p === u || p === void 0 && w && y) && (f === void 0 ? b.__staleWhileFetching !== void 0 ? this.#t[t] = b.__staleWhileFetching : this.#E(e, "fetch") : (i.status && (i.status.fetchUpdated = true), this.#W(e, f, h2.options, b))), f;
    }, c = (f) => (i.status && (i.status.fetchRejected = true, i.status.fetchError = f), m(f, false)), m = (f, y) => {
      let { aborted: a } = o.signal, w = a && i.allowStaleOnFetchAbort, F = w || i.allowStaleOnFetchRejection, b = F || i.noDeleteOnFetchRejection, p = u;
      if (this.#t[t] === u && (!b || !y && p.__staleWhileFetching === void 0 ? this.#E(e, "fetch") : w || (this.#t[t] = p.__staleWhileFetching)), F) return i.status && p.__staleWhileFetching !== void 0 && (i.status.returnedStale = true), p.__staleWhileFetching;
      if (p.__returned === p) throw f;
    }, _ = (f, y) => {
      let a = this.#M?.(e, n, h2);
      o.signal.addEventListener("abort", () => {
        (!i.ignoreFetchAbort || i.allowStaleOnFetchAbort) && (f(void 0), i.allowStaleOnFetchAbort && (f = (w) => r(w, true)));
      }), a && a instanceof Promise ? a.then((w) => f(w === void 0 ? void 0 : w), y) : a !== void 0 && f(a);
    };
    i.status && (i.status.fetchDispatched = true);
    let u = new Promise(_).then(r, c), g = Object.assign(u, { __abortController: o, __staleWhileFetching: n, __returned: void 0 });
    return t === void 0 ? (this.#W(e, g, { ...h2.options, status: void 0 }), t = this.#s.get(e)) : this.#t[t] = g, g;
  }
  #e(e) {
    if (!this.#U) return false;
    let t = e;
    return !!t && t instanceof Promise && t.hasOwnProperty("__staleWhileFetching") && t.__abortController instanceof AbortController;
  }
  fetch(e, t = {}) {
    let i = W2.hasSubscribers, { status: s = R() ? {} : void 0 } = t;
    t.status = s, s && t.context && (s.context = t.context);
    let n = this.#B(e, t);
    return s && i && (s.trace = true, W2.tracePromise(() => n, s).catch(() => {
    })), n;
  }
  async #B(e, t = {}) {
    let { allowStale: i = this.allowStale, updateAgeOnGet: s = this.updateAgeOnGet, noDeleteOnStaleGet: n = this.noDeleteOnStaleGet, ttl: o = this.ttl, noDisposeOnSet: l = this.noDisposeOnSet, size: h2 = 0, sizeCalculation: r = this.sizeCalculation, noUpdateTTL: c = this.noUpdateTTL, noDeleteOnFetchRejection: m = this.noDeleteOnFetchRejection, allowStaleOnFetchRejection: _ = this.allowStaleOnFetchRejection, ignoreFetchAbort: u = this.ignoreFetchAbort, allowStaleOnFetchAbort: g = this.allowStaleOnFetchAbort, context: f, forceRefresh: y = false, status: a, signal: w } = t;
    if (a && (a.op = "fetch", a.key = e, y && (a.forceRefresh = true), a.cache = this), !this.#U) return a && (a.fetch = "get"), this.#C(e, { allowStale: i, updateAgeOnGet: s, noDeleteOnStaleGet: n, status: a });
    let F = { allowStale: i, updateAgeOnGet: s, noDeleteOnStaleGet: n, ttl: o, noDisposeOnSet: l, size: h2, sizeCalculation: r, noUpdateTTL: c, noDeleteOnFetchRejection: m, allowStaleOnFetchRejection: _, allowStaleOnFetchAbort: g, ignoreFetchAbort: u, status: a, signal: w }, b = this.#s.get(e);
    if (b === void 0) {
      a && (a.fetch = "miss");
      let p = this.#P(e, b, F, f);
      return p.__returned = p;
    } else {
      let p = this.#t[b];
      if (this.#e(p)) {
        let v = i && p.__staleWhileFetching !== void 0;
        return a && (a.fetch = "inflight", v && (a.returnedStale = true)), v ? p.__staleWhileFetching : p.__returned = p;
      }
      let A = this.#p(b);
      if (!y && !A) return a && (a.fetch = "hit"), this.#L(b), s && this.#R(b), a && this.#v(a, b), p;
      let z = this.#P(e, b, F, f), E = z.__staleWhileFetching !== void 0 && i;
      return a && (a.fetch = A ? "stale" : "refresh", E && A && (a.returnedStale = true)), E ? z.__staleWhileFetching : z.__returned = z;
    }
  }
  forceFetch(e, t = {}) {
    let i = W2.hasSubscribers, { status: s = R() ? {} : void 0 } = t;
    t.status = s, s && t.context && (s.context = t.context);
    let n = this.#K(e, t);
    return s && i && (s.trace = true, W2.tracePromise(() => n, s).catch(() => {
    })), n;
  }
  async #K(e, t = {}) {
    let i = await this.#B(e, t);
    if (i === void 0) throw new Error("fetch() returned undefined");
    return i;
  }
  memo(e, t = {}) {
    let { status: i = S2.hasSubscribers ? {} : void 0 } = t;
    t.status = i, i && (i.op = "memo", i.key = e, t.context && (i.context = t.context), i.cache = this);
    let s = this.#Q(e, t);
    return i && (i.value = s), S2.hasSubscribers && S2.publish(i), s;
  }
  #Q(e, t = {}) {
    let i = this.#I;
    if (!i) throw new Error("no memoMethod provided to constructor");
    let { context: s, status: n, forceRefresh: o, ...l } = t;
    n && o && (n.forceRefresh = true);
    let h2 = this.#C(e, l), r = o || h2 === void 0;
    if (n && (n.memo = r ? "miss" : "hit", r || (n.value = h2)), !r) return h2;
    let c = i(e, h2, { options: l, context: s });
    return n && (n.value = c), this.#W(e, c, l), c;
  }
  get(e, t = {}) {
    let { status: i = S2.hasSubscribers ? {} : void 0 } = t;
    t.status = i, i && (i.op = "get", i.key = e, i.cache = this);
    let s = this.#C(e, t);
    return i && (s !== void 0 && (i.value = s), S2.hasSubscribers && S2.publish(i)), s;
  }
  #C(e, t = {}) {
    let { allowStale: i = this.allowStale, updateAgeOnGet: s = this.updateAgeOnGet, noDeleteOnStaleGet: n = this.noDeleteOnStaleGet, status: o } = t, l = this.#s.get(e);
    if (l === void 0) {
      o && (o.get = "miss");
      return;
    }
    let h2 = this.#t[l], r = this.#e(h2);
    return o && this.#v(o, l), this.#p(l) ? r ? (o && (o.get = "stale-fetching"), i && h2.__staleWhileFetching !== void 0 ? (o && (o.returnedStale = true), h2.__staleWhileFetching) : void 0) : (n || this.#E(e, "expire"), o && (o.get = "stale"), i ? (o && (o.returnedStale = true), h2) : void 0) : (o && (o.get = r ? "fetching" : "hit"), this.#L(l), s && this.#R(l), r ? h2.__staleWhileFetching : h2);
  }
  #$(e, t) {
    this.#u[t] = e, this.#l[e] = t;
  }
  #L(e) {
    e !== this.#h && (e === this.#a ? this.#a = this.#l[e] : this.#$(this.#u[e], this.#l[e]), this.#$(this.#h, e), this.#h = e);
  }
  delete(e) {
    return this.#E(e, "delete");
  }
  #E(e, t) {
    S2.hasSubscribers && S2.publish({ op: "delete", delete: t, key: e, cache: this });
    let i = false;
    if (this.#n !== 0) {
      let s = this.#s.get(e);
      if (s !== void 0) if (this.#g?.[s] && (clearTimeout(this.#g[s]), this.#g[s] = void 0), i = true, this.#n === 1) this.#q(t);
      else {
        this.#x(s);
        let n = this.#t[s];
        if (this.#e(n) ? n.__abortController.abort(new Error("deleted")) : (this.#T || this.#f) && (this.#T && this.#S?.(n, e, t), this.#f && this.#r?.push([n, e, t])), this.#s.delete(e), this.#i[s] = void 0, this.#t[s] = void 0, s === this.#h) this.#h = this.#u[s];
        else if (s === this.#a) this.#a = this.#l[s];
        else {
          let o = this.#u[s];
          this.#l[o] = this.#l[s];
          let l = this.#l[s];
          this.#u[l] = this.#u[s];
        }
        this.#n--, this.#y.push(s);
      }
    }
    if (this.#f && this.#r?.length) {
      let s = this.#r, n;
      for (; n = s?.shift(); ) this.#w?.(...n);
    }
    return i;
  }
  clear() {
    return this.#q("delete");
  }
  #q(e) {
    for (let t of this.#z({ allowStale: true })) {
      let i = this.#t[t];
      if (this.#e(i)) i.__abortController.abort(new Error("deleted"));
      else {
        let s = this.#i[t];
        this.#T && this.#S?.(i, s, e), this.#f && this.#r?.push([i, s, e]);
      }
    }
    if (this.#s.clear(), this.#t.fill(void 0), this.#i.fill(void 0), this.#d && this.#F) {
      this.#d.fill(0), this.#F.fill(0);
      for (let t of this.#g ?? []) t !== void 0 && clearTimeout(t);
      this.#g?.fill(void 0);
    }
    if (this.#_ && this.#_.fill(0), this.#a = 0, this.#h = 0, this.#y.length = 0, this.#b = 0, this.#n = 0, this.#f && this.#r) {
      let t = this.#r, i;
      for (; i = t?.shift(); ) this.#w?.(...i);
    }
  }
};

// packages/core/node_modules/path-scurry/dist/esm/index.js
import { posix, win32 } from "node:path";
import { fileURLToPath } from "node:url";
import { lstatSync, readdir as readdirCB, readdirSync, readlinkSync, realpathSync as rps } from "fs";
import * as actualFS from "node:fs";
import { lstat, readdir, readlink, realpath } from "node:fs/promises";

// packages/core/node_modules/minipass/dist/esm/index.js
import { EventEmitter } from "node:events";
import Stream from "node:stream";
import { StringDecoder } from "node:string_decoder";
var proc = typeof process === "object" && process ? process : {
  stdout: null,
  stderr: null
};
var isStream = (s) => !!s && typeof s === "object" && (s instanceof Minipass || s instanceof Stream || isReadable(s) || isWritable(s));
var isReadable = (s) => !!s && typeof s === "object" && s instanceof EventEmitter && typeof s.pipe === "function" && // node core Writable streams have a pipe() method, but it throws
s.pipe !== Stream.Writable.prototype.pipe;
var isWritable = (s) => !!s && typeof s === "object" && s instanceof EventEmitter && typeof s.write === "function" && typeof s.end === "function";
var EOF = Symbol("EOF");
var MAYBE_EMIT_END = Symbol("maybeEmitEnd");
var EMITTED_END = Symbol("emittedEnd");
var EMITTING_END = Symbol("emittingEnd");
var EMITTED_ERROR = Symbol("emittedError");
var CLOSED = Symbol("closed");
var READ = Symbol("read");
var FLUSH = Symbol("flush");
var FLUSHCHUNK = Symbol("flushChunk");
var ENCODING = Symbol("encoding");
var DECODER = Symbol("decoder");
var FLOWING = Symbol("flowing");
var PAUSED = Symbol("paused");
var RESUME = Symbol("resume");
var BUFFER = Symbol("buffer");
var PIPES = Symbol("pipes");
var BUFFERLENGTH = Symbol("bufferLength");
var BUFFERPUSH = Symbol("bufferPush");
var BUFFERSHIFT = Symbol("bufferShift");
var OBJECTMODE = Symbol("objectMode");
var DESTROYED = Symbol("destroyed");
var ERROR = Symbol("error");
var EMITDATA = Symbol("emitData");
var EMITEND = Symbol("emitEnd");
var EMITEND2 = Symbol("emitEnd2");
var ASYNC = Symbol("async");
var ABORT = Symbol("abort");
var ABORTED = Symbol("aborted");
var SIGNAL = Symbol("signal");
var DATALISTENERS = Symbol("dataListeners");
var DISCARDED = Symbol("discarded");
var defer = (fn) => Promise.resolve().then(fn);
var nodefer = (fn) => fn();
var isEndish = (ev) => ev === "end" || ev === "finish" || ev === "prefinish";
var isArrayBufferLike = (b) => b instanceof ArrayBuffer || !!b && typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
var isArrayBufferView = (b) => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);
var Pipe = class {
  src;
  dest;
  opts;
  ondrain;
  constructor(src, dest, opts) {
    this.src = src;
    this.dest = dest;
    this.opts = opts;
    this.ondrain = () => src[RESUME]();
    this.dest.on("drain", this.ondrain);
  }
  unpipe() {
    this.dest.removeListener("drain", this.ondrain);
  }
  // only here for the prototype
  /* c8 ignore start */
  proxyErrors(_er) {
  }
  /* c8 ignore stop */
  end() {
    this.unpipe();
    if (this.opts.end)
      this.dest.end();
  }
};
var PipeProxyErrors = class extends Pipe {
  unpipe() {
    this.src.removeListener("error", this.proxyErrors);
    super.unpipe();
  }
  constructor(src, dest, opts) {
    super(src, dest, opts);
    this.proxyErrors = (er) => this.dest.emit("error", er);
    src.on("error", this.proxyErrors);
  }
};
var isObjectModeOptions = (o) => !!o.objectMode;
var isEncodingOptions = (o) => !o.objectMode && !!o.encoding && o.encoding !== "buffer";
var Minipass = class extends EventEmitter {
  [FLOWING] = false;
  [PAUSED] = false;
  [PIPES] = [];
  [BUFFER] = [];
  [OBJECTMODE];
  [ENCODING];
  [ASYNC];
  [DECODER];
  [EOF] = false;
  [EMITTED_END] = false;
  [EMITTING_END] = false;
  [CLOSED] = false;
  [EMITTED_ERROR] = null;
  [BUFFERLENGTH] = 0;
  [DESTROYED] = false;
  [SIGNAL];
  [ABORTED] = false;
  [DATALISTENERS] = 0;
  [DISCARDED] = false;
  /**
   * true if the stream can be written
   */
  writable = true;
  /**
   * true if the stream can be read
   */
  readable = true;
  /**
   * If `RType` is Buffer, then options do not need to be provided.
   * Otherwise, an options object must be provided to specify either
   * {@link Minipass.SharedOptions.objectMode} or
   * {@link Minipass.SharedOptions.encoding}, as appropriate.
   */
  constructor(...args) {
    const options = args[0] || {};
    super();
    if (options.objectMode && typeof options.encoding === "string") {
      throw new TypeError("Encoding and objectMode may not be used together");
    }
    if (isObjectModeOptions(options)) {
      this[OBJECTMODE] = true;
      this[ENCODING] = null;
    } else if (isEncodingOptions(options)) {
      this[ENCODING] = options.encoding;
      this[OBJECTMODE] = false;
    } else {
      this[OBJECTMODE] = false;
      this[ENCODING] = null;
    }
    this[ASYNC] = !!options.async;
    this[DECODER] = this[ENCODING] ? new StringDecoder(this[ENCODING]) : null;
    if (options && options.debugExposeBuffer === true) {
      Object.defineProperty(this, "buffer", { get: () => this[BUFFER] });
    }
    if (options && options.debugExposePipes === true) {
      Object.defineProperty(this, "pipes", { get: () => this[PIPES] });
    }
    const { signal } = options;
    if (signal) {
      this[SIGNAL] = signal;
      if (signal.aborted) {
        this[ABORT]();
      } else {
        signal.addEventListener("abort", () => this[ABORT]());
      }
    }
  }
  /**
   * The amount of data stored in the buffer waiting to be read.
   *
   * For Buffer strings, this will be the total byte length.
   * For string encoding streams, this will be the string character length,
   * according to JavaScript's `string.length` logic.
   * For objectMode streams, this is a count of the items waiting to be
   * emitted.
   */
  get bufferLength() {
    return this[BUFFERLENGTH];
  }
  /**
   * The `BufferEncoding` currently in use, or `null`
   */
  get encoding() {
    return this[ENCODING];
  }
  /**
   * @deprecated - This is a read only property
   */
  set encoding(_enc) {
    throw new Error("Encoding must be set at instantiation time");
  }
  /**
   * @deprecated - Encoding may only be set at instantiation time
   */
  setEncoding(_enc) {
    throw new Error("Encoding must be set at instantiation time");
  }
  /**
   * True if this is an objectMode stream
   */
  get objectMode() {
    return this[OBJECTMODE];
  }
  /**
   * @deprecated - This is a read-only property
   */
  set objectMode(_om) {
    throw new Error("objectMode must be set at instantiation time");
  }
  /**
   * true if this is an async stream
   */
  get ["async"]() {
    return this[ASYNC];
  }
  /**
   * Set to true to make this stream async.
   *
   * Once set, it cannot be unset, as this would potentially cause incorrect
   * behavior.  Ie, a sync stream can be made async, but an async stream
   * cannot be safely made sync.
   */
  set ["async"](a) {
    this[ASYNC] = this[ASYNC] || !!a;
  }
  // drop everything and get out of the flow completely
  [ABORT]() {
    this[ABORTED] = true;
    this.emit("abort", this[SIGNAL]?.reason);
    this.destroy(this[SIGNAL]?.reason);
  }
  /**
   * True if the stream has been aborted.
   */
  get aborted() {
    return this[ABORTED];
  }
  /**
   * No-op setter. Stream aborted status is set via the AbortSignal provided
   * in the constructor options.
   */
  set aborted(_) {
  }
  write(chunk, encoding, cb) {
    if (this[ABORTED])
      return false;
    if (this[EOF])
      throw new Error("write after end");
    if (this[DESTROYED]) {
      this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), { code: "ERR_STREAM_DESTROYED" }));
      return true;
    }
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = "utf8";
    }
    if (!encoding)
      encoding = "utf8";
    const fn = this[ASYNC] ? defer : nodefer;
    if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
      if (isArrayBufferView(chunk)) {
        chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
      } else if (isArrayBufferLike(chunk)) {
        chunk = Buffer.from(chunk);
      } else if (typeof chunk !== "string") {
        throw new Error("Non-contiguous data written to non-objectMode stream");
      }
    }
    if (this[OBJECTMODE]) {
      if (this[FLOWING] && this[BUFFERLENGTH] !== 0)
        this[FLUSH](true);
      if (this[FLOWING])
        this.emit("data", chunk);
      else
        this[BUFFERPUSH](chunk);
      if (this[BUFFERLENGTH] !== 0)
        this.emit("readable");
      if (cb)
        fn(cb);
      return this[FLOWING];
    }
    if (!chunk.length) {
      if (this[BUFFERLENGTH] !== 0)
        this.emit("readable");
      if (cb)
        fn(cb);
      return this[FLOWING];
    }
    if (typeof chunk === "string" && // unless it is a string already ready for us to use
    !(encoding === this[ENCODING] && !this[DECODER]?.lastNeed)) {
      chunk = Buffer.from(chunk, encoding);
    }
    if (Buffer.isBuffer(chunk) && this[ENCODING]) {
      chunk = this[DECODER].write(chunk);
    }
    if (this[FLOWING] && this[BUFFERLENGTH] !== 0)
      this[FLUSH](true);
    if (this[FLOWING])
      this.emit("data", chunk);
    else
      this[BUFFERPUSH](chunk);
    if (this[BUFFERLENGTH] !== 0)
      this.emit("readable");
    if (cb)
      fn(cb);
    return this[FLOWING];
  }
  /**
   * Low-level explicit read method.
   *
   * In objectMode, the argument is ignored, and one item is returned if
   * available.
   *
   * `n` is the number of bytes (or in the case of encoding streams,
   * characters) to consume. If `n` is not provided, then the entire buffer
   * is returned, or `null` is returned if no data is available.
   *
   * If `n` is greater that the amount of data in the internal buffer,
   * then `null` is returned.
   */
  read(n) {
    if (this[DESTROYED])
      return null;
    this[DISCARDED] = false;
    if (this[BUFFERLENGTH] === 0 || n === 0 || n && n > this[BUFFERLENGTH]) {
      this[MAYBE_EMIT_END]();
      return null;
    }
    if (this[OBJECTMODE])
      n = null;
    if (this[BUFFER].length > 1 && !this[OBJECTMODE]) {
      this[BUFFER] = [
        this[ENCODING] ? this[BUFFER].join("") : Buffer.concat(this[BUFFER], this[BUFFERLENGTH])
      ];
    }
    const ret = this[READ](n || null, this[BUFFER][0]);
    this[MAYBE_EMIT_END]();
    return ret;
  }
  [READ](n, chunk) {
    if (this[OBJECTMODE])
      this[BUFFERSHIFT]();
    else {
      const c = chunk;
      if (n === c.length || n === null)
        this[BUFFERSHIFT]();
      else if (typeof c === "string") {
        this[BUFFER][0] = c.slice(n);
        chunk = c.slice(0, n);
        this[BUFFERLENGTH] -= n;
      } else {
        this[BUFFER][0] = c.subarray(n);
        chunk = c.subarray(0, n);
        this[BUFFERLENGTH] -= n;
      }
    }
    this.emit("data", chunk);
    if (!this[BUFFER].length && !this[EOF])
      this.emit("drain");
    return chunk;
  }
  end(chunk, encoding, cb) {
    if (typeof chunk === "function") {
      cb = chunk;
      chunk = void 0;
    }
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = "utf8";
    }
    if (chunk !== void 0)
      this.write(chunk, encoding);
    if (cb)
      this.once("end", cb);
    this[EOF] = true;
    this.writable = false;
    if (this[FLOWING] || !this[PAUSED])
      this[MAYBE_EMIT_END]();
    return this;
  }
  // don't let the internal resume be overwritten
  [RESUME]() {
    if (this[DESTROYED])
      return;
    if (!this[DATALISTENERS] && !this[PIPES].length) {
      this[DISCARDED] = true;
    }
    this[PAUSED] = false;
    this[FLOWING] = true;
    this.emit("resume");
    if (this[BUFFER].length)
      this[FLUSH]();
    else if (this[EOF])
      this[MAYBE_EMIT_END]();
    else
      this.emit("drain");
  }
  /**
   * Resume the stream if it is currently in a paused state
   *
   * If called when there are no pipe destinations or `data` event listeners,
   * this will place the stream in a "discarded" state, where all data will
   * be thrown away. The discarded state is removed if a pipe destination or
   * data handler is added, if pause() is called, or if any synchronous or
   * asynchronous iteration is started.
   */
  resume() {
    return this[RESUME]();
  }
  /**
   * Pause the stream
   */
  pause() {
    this[FLOWING] = false;
    this[PAUSED] = true;
    this[DISCARDED] = false;
  }
  /**
   * true if the stream has been forcibly destroyed
   */
  get destroyed() {
    return this[DESTROYED];
  }
  /**
   * true if the stream is currently in a flowing state, meaning that
   * any writes will be immediately emitted.
   */
  get flowing() {
    return this[FLOWING];
  }
  /**
   * true if the stream is currently in a paused state
   */
  get paused() {
    return this[PAUSED];
  }
  [BUFFERPUSH](chunk) {
    if (this[OBJECTMODE])
      this[BUFFERLENGTH] += 1;
    else
      this[BUFFERLENGTH] += chunk.length;
    this[BUFFER].push(chunk);
  }
  [BUFFERSHIFT]() {
    if (this[OBJECTMODE])
      this[BUFFERLENGTH] -= 1;
    else
      this[BUFFERLENGTH] -= this[BUFFER][0].length;
    return this[BUFFER].shift();
  }
  [FLUSH](noDrain = false) {
    do {
    } while (this[FLUSHCHUNK](this[BUFFERSHIFT]()) && this[BUFFER].length);
    if (!noDrain && !this[BUFFER].length && !this[EOF])
      this.emit("drain");
  }
  [FLUSHCHUNK](chunk) {
    this.emit("data", chunk);
    return this[FLOWING];
  }
  /**
   * Pipe all data emitted by this stream into the destination provided.
   *
   * Triggers the flow of data.
   */
  pipe(dest, opts) {
    if (this[DESTROYED])
      return dest;
    this[DISCARDED] = false;
    const ended = this[EMITTED_END];
    opts = opts || {};
    if (dest === proc.stdout || dest === proc.stderr)
      opts.end = false;
    else
      opts.end = opts.end !== false;
    opts.proxyErrors = !!opts.proxyErrors;
    if (ended) {
      if (opts.end)
        dest.end();
    } else {
      this[PIPES].push(!opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts));
      if (this[ASYNC])
        defer(() => this[RESUME]());
      else
        this[RESUME]();
    }
    return dest;
  }
  /**
   * Fully unhook a piped destination stream.
   *
   * If the destination stream was the only consumer of this stream (ie,
   * there are no other piped destinations or `'data'` event listeners)
   * then the flow of data will stop until there is another consumer or
   * {@link Minipass#resume} is explicitly called.
   */
  unpipe(dest) {
    const p = this[PIPES].find((p2) => p2.dest === dest);
    if (p) {
      if (this[PIPES].length === 1) {
        if (this[FLOWING] && this[DATALISTENERS] === 0) {
          this[FLOWING] = false;
        }
        this[PIPES] = [];
      } else
        this[PIPES].splice(this[PIPES].indexOf(p), 1);
      p.unpipe();
    }
  }
  /**
   * Alias for {@link Minipass#on}
   */
  addListener(ev, handler) {
    return this.on(ev, handler);
  }
  /**
   * Mostly identical to `EventEmitter.on`, with the following
   * behavior differences to prevent data loss and unnecessary hangs:
   *
   * - Adding a 'data' event handler will trigger the flow of data
   *
   * - Adding a 'readable' event handler when there is data waiting to be read
   *   will cause 'readable' to be emitted immediately.
   *
   * - Adding an 'endish' event handler ('end', 'finish', etc.) which has
   *   already passed will cause the event to be emitted immediately and all
   *   handlers removed.
   *
   * - Adding an 'error' event handler after an error has been emitted will
   *   cause the event to be re-emitted immediately with the error previously
   *   raised.
   */
  on(ev, handler) {
    const ret = super.on(ev, handler);
    if (ev === "data") {
      this[DISCARDED] = false;
      this[DATALISTENERS]++;
      if (!this[PIPES].length && !this[FLOWING]) {
        this[RESUME]();
      }
    } else if (ev === "readable" && this[BUFFERLENGTH] !== 0) {
      super.emit("readable");
    } else if (isEndish(ev) && this[EMITTED_END]) {
      super.emit(ev);
      this.removeAllListeners(ev);
    } else if (ev === "error" && this[EMITTED_ERROR]) {
      const h2 = handler;
      if (this[ASYNC])
        defer(() => h2.call(this, this[EMITTED_ERROR]));
      else
        h2.call(this, this[EMITTED_ERROR]);
    }
    return ret;
  }
  /**
   * Alias for {@link Minipass#off}
   */
  removeListener(ev, handler) {
    return this.off(ev, handler);
  }
  /**
   * Mostly identical to `EventEmitter.off`
   *
   * If a 'data' event handler is removed, and it was the last consumer
   * (ie, there are no pipe destinations or other 'data' event listeners),
   * then the flow of data will stop until there is another consumer or
   * {@link Minipass#resume} is explicitly called.
   */
  off(ev, handler) {
    const ret = super.off(ev, handler);
    if (ev === "data") {
      this[DATALISTENERS] = this.listeners("data").length;
      if (this[DATALISTENERS] === 0 && !this[DISCARDED] && !this[PIPES].length) {
        this[FLOWING] = false;
      }
    }
    return ret;
  }
  /**
   * Mostly identical to `EventEmitter.removeAllListeners`
   *
   * If all 'data' event handlers are removed, and they were the last consumer
   * (ie, there are no pipe destinations), then the flow of data will stop
   * until there is another consumer or {@link Minipass#resume} is explicitly
   * called.
   */
  removeAllListeners(ev) {
    const ret = super.removeAllListeners(ev);
    if (ev === "data" || ev === void 0) {
      this[DATALISTENERS] = 0;
      if (!this[DISCARDED] && !this[PIPES].length) {
        this[FLOWING] = false;
      }
    }
    return ret;
  }
  /**
   * true if the 'end' event has been emitted
   */
  get emittedEnd() {
    return this[EMITTED_END];
  }
  [MAYBE_EMIT_END]() {
    if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this[BUFFER].length === 0 && this[EOF]) {
      this[EMITTING_END] = true;
      this.emit("end");
      this.emit("prefinish");
      this.emit("finish");
      if (this[CLOSED])
        this.emit("close");
      this[EMITTING_END] = false;
    }
  }
  /**
   * Mostly identical to `EventEmitter.emit`, with the following
   * behavior differences to prevent data loss and unnecessary hangs:
   *
   * If the stream has been destroyed, and the event is something other
   * than 'close' or 'error', then `false` is returned and no handlers
   * are called.
   *
   * If the event is 'end', and has already been emitted, then the event
   * is ignored. If the stream is in a paused or non-flowing state, then
   * the event will be deferred until data flow resumes. If the stream is
   * async, then handlers will be called on the next tick rather than
   * immediately.
   *
   * If the event is 'close', and 'end' has not yet been emitted, then
   * the event will be deferred until after 'end' is emitted.
   *
   * If the event is 'error', and an AbortSignal was provided for the stream,
   * and there are no listeners, then the event is ignored, matching the
   * behavior of node core streams in the presense of an AbortSignal.
   *
   * If the event is 'finish' or 'prefinish', then all listeners will be
   * removed after emitting the event, to prevent double-firing.
   */
  emit(ev, ...args) {
    const data = args[0];
    if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED]) {
      return false;
    } else if (ev === "data") {
      return !this[OBJECTMODE] && !data ? false : this[ASYNC] ? (defer(() => this[EMITDATA](data)), true) : this[EMITDATA](data);
    } else if (ev === "end") {
      return this[EMITEND]();
    } else if (ev === "close") {
      this[CLOSED] = true;
      if (!this[EMITTED_END] && !this[DESTROYED])
        return false;
      const ret2 = super.emit("close");
      this.removeAllListeners("close");
      return ret2;
    } else if (ev === "error") {
      this[EMITTED_ERROR] = data;
      super.emit(ERROR, data);
      const ret2 = !this[SIGNAL] || this.listeners("error").length ? super.emit("error", data) : false;
      this[MAYBE_EMIT_END]();
      return ret2;
    } else if (ev === "resume") {
      const ret2 = super.emit("resume");
      this[MAYBE_EMIT_END]();
      return ret2;
    } else if (ev === "finish" || ev === "prefinish") {
      const ret2 = super.emit(ev);
      this.removeAllListeners(ev);
      return ret2;
    }
    const ret = super.emit(ev, ...args);
    this[MAYBE_EMIT_END]();
    return ret;
  }
  [EMITDATA](data) {
    for (const p of this[PIPES]) {
      if (p.dest.write(data) === false)
        this.pause();
    }
    const ret = this[DISCARDED] ? false : super.emit("data", data);
    this[MAYBE_EMIT_END]();
    return ret;
  }
  [EMITEND]() {
    if (this[EMITTED_END])
      return false;
    this[EMITTED_END] = true;
    this.readable = false;
    return this[ASYNC] ? (defer(() => this[EMITEND2]()), true) : this[EMITEND2]();
  }
  [EMITEND2]() {
    if (this[DECODER]) {
      const data = this[DECODER].end();
      if (data) {
        for (const p of this[PIPES]) {
          p.dest.write(data);
        }
        if (!this[DISCARDED])
          super.emit("data", data);
      }
    }
    for (const p of this[PIPES]) {
      p.end();
    }
    const ret = super.emit("end");
    this.removeAllListeners("end");
    return ret;
  }
  /**
   * Return a Promise that resolves to an array of all emitted data once
   * the stream ends.
   */
  async collect() {
    const buf = Object.assign([], {
      dataLength: 0
    });
    if (!this[OBJECTMODE])
      buf.dataLength = 0;
    const p = this.promise();
    this.on("data", (c) => {
      buf.push(c);
      if (!this[OBJECTMODE])
        buf.dataLength += c.length;
    });
    await p;
    return buf;
  }
  /**
   * Return a Promise that resolves to the concatenation of all emitted data
   * once the stream ends.
   *
   * Not allowed on objectMode streams.
   */
  async concat() {
    if (this[OBJECTMODE]) {
      throw new Error("cannot concat in objectMode");
    }
    const buf = await this.collect();
    return this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength);
  }
  /**
   * Return a void Promise that resolves once the stream ends.
   */
  async promise() {
    return new Promise((resolve, reject) => {
      this.on(DESTROYED, () => reject(new Error("stream destroyed")));
      this.on("error", (er) => reject(er));
      this.on("end", () => resolve());
    });
  }
  /**
   * Asynchronous `for await of` iteration.
   *
   * This will continue emitting all chunks until the stream terminates.
   */
  [Symbol.asyncIterator]() {
    this[DISCARDED] = false;
    let stopped = false;
    const stop = async () => {
      this.pause();
      stopped = true;
      return { value: void 0, done: true };
    };
    const next = () => {
      if (stopped)
        return stop();
      const res = this.read();
      if (res !== null)
        return Promise.resolve({ done: false, value: res });
      if (this[EOF])
        return stop();
      let resolve;
      let reject;
      const onerr = (er) => {
        this.off("data", ondata);
        this.off("end", onend);
        this.off(DESTROYED, ondestroy);
        stop();
        reject(er);
      };
      const ondata = (value) => {
        this.off("error", onerr);
        this.off("end", onend);
        this.off(DESTROYED, ondestroy);
        this.pause();
        resolve({ value, done: !!this[EOF] });
      };
      const onend = () => {
        this.off("error", onerr);
        this.off("data", ondata);
        this.off(DESTROYED, ondestroy);
        stop();
        resolve({ done: true, value: void 0 });
      };
      const ondestroy = () => onerr(new Error("stream destroyed"));
      return new Promise((res2, rej) => {
        reject = rej;
        resolve = res2;
        this.once(DESTROYED, ondestroy);
        this.once("error", onerr);
        this.once("end", onend);
        this.once("data", ondata);
      });
    };
    return {
      next,
      throw: stop,
      return: stop,
      [Symbol.asyncIterator]() {
        return this;
      },
      [Symbol.asyncDispose]: async () => {
      }
    };
  }
  /**
   * Synchronous `for of` iteration.
   *
   * The iteration will terminate when the internal buffer runs out, even
   * if the stream has not yet terminated.
   */
  [Symbol.iterator]() {
    this[DISCARDED] = false;
    let stopped = false;
    const stop = () => {
      this.pause();
      this.off(ERROR, stop);
      this.off(DESTROYED, stop);
      this.off("end", stop);
      stopped = true;
      return { done: true, value: void 0 };
    };
    const next = () => {
      if (stopped)
        return stop();
      const value = this.read();
      return value === null ? stop() : { done: false, value };
    };
    this.once("end", stop);
    this.once(ERROR, stop);
    this.once(DESTROYED, stop);
    return {
      next,
      throw: stop,
      return: stop,
      [Symbol.iterator]() {
        return this;
      },
      [Symbol.dispose]: () => {
      }
    };
  }
  /**
   * Destroy a stream, preventing it from being used for any further purpose.
   *
   * If the stream has a `close()` method, then it will be called on
   * destruction.
   *
   * After destruction, any attempt to write data, read data, or emit most
   * events will be ignored.
   *
   * If an error argument is provided, then it will be emitted in an
   * 'error' event.
   */
  destroy(er) {
    if (this[DESTROYED]) {
      if (er)
        this.emit("error", er);
      else
        this.emit(DESTROYED);
      return this;
    }
    this[DESTROYED] = true;
    this[DISCARDED] = true;
    this[BUFFER].length = 0;
    this[BUFFERLENGTH] = 0;
    const wc = this;
    if (typeof wc.close === "function" && !this[CLOSED])
      wc.close();
    if (er)
      this.emit("error", er);
    else
      this.emit(DESTROYED);
    return this;
  }
  /**
   * Alias for {@link isStream}
   *
   * Former export location, maintained for backwards compatibility.
   *
   * @deprecated
   */
  static get isStream() {
    return isStream;
  }
};

// packages/core/node_modules/path-scurry/dist/esm/index.js
var realpathSync = rps.native;
var defaultFS = {
  lstatSync,
  readdir: readdirCB,
  readdirSync,
  readlinkSync,
  realpathSync,
  promises: {
    lstat,
    readdir,
    readlink,
    realpath
  }
};
var fsFromOption = (fsOption) => !fsOption || fsOption === defaultFS || fsOption === actualFS ? defaultFS : {
  ...defaultFS,
  ...fsOption,
  promises: {
    ...defaultFS.promises,
    ...fsOption.promises || {}
  }
};
var uncDriveRegexp = /^\\\\\?\\([a-z]:)\\?$/i;
var uncToDrive = (rootPath) => rootPath.replace(/\//g, "\\").replace(uncDriveRegexp, "$1\\");
var eitherSep = /[\\\/]/;
var UNKNOWN = 0;
var IFIFO = 1;
var IFCHR = 2;
var IFDIR = 4;
var IFBLK = 6;
var IFREG = 8;
var IFLNK = 10;
var IFSOCK = 12;
var IFMT = 15;
var IFMT_UNKNOWN = ~IFMT;
var READDIR_CALLED = 16;
var LSTAT_CALLED = 32;
var ENOTDIR = 64;
var ENOENT = 128;
var ENOREADLINK = 256;
var ENOREALPATH = 512;
var ENOCHILD = ENOTDIR | ENOENT | ENOREALPATH;
var TYPEMASK = 1023;
var entToType = (s) => s.isFile() ? IFREG : s.isDirectory() ? IFDIR : s.isSymbolicLink() ? IFLNK : s.isCharacterDevice() ? IFCHR : s.isBlockDevice() ? IFBLK : s.isSocket() ? IFSOCK : s.isFIFO() ? IFIFO : UNKNOWN;
var normalizeCache = new I2({ max: 2 ** 12 });
var normalize = (s) => {
  const c = normalizeCache.get(s);
  if (c)
    return c;
  const n = s.normalize("NFKD");
  normalizeCache.set(s, n);
  return n;
};
var normalizeNocaseCache = new I2({ max: 2 ** 12 });
var normalizeNocase = (s) => {
  const c = normalizeNocaseCache.get(s);
  if (c)
    return c;
  const n = normalize(s.toLowerCase());
  normalizeNocaseCache.set(s, n);
  return n;
};
var ResolveCache = class extends I2 {
  constructor() {
    super({ max: 256 });
  }
};
var ChildrenCache = class extends I2 {
  constructor(maxSize = 16 * 1024) {
    super({
      maxSize,
      // parent + children
      sizeCalculation: (a) => a.length + 1
    });
  }
};
var setAsCwd = Symbol("PathScurry setAsCwd");
var PathBase = class {
  /**
   * the basename of this path
   *
   * **Important**: *always* test the path name against any test string
   * usingthe {@link isNamed} method, and not by directly comparing this
   * string. Otherwise, unicode path strings that the system sees as identical
   * will not be properly treated as the same path, leading to incorrect
   * behavior and possible security issues.
   */
  name;
  /**
   * the Path entry corresponding to the path root.
   *
   * @internal
   */
  root;
  /**
   * All roots found within the current PathScurry family
   *
   * @internal
   */
  roots;
  /**
   * a reference to the parent path, or undefined in the case of root entries
   *
   * @internal
   */
  parent;
  /**
   * boolean indicating whether paths are compared case-insensitively
   * @internal
   */
  nocase;
  /**
   * boolean indicating that this path is the current working directory
   * of the PathScurry collection that contains it.
   */
  isCWD = false;
  // potential default fs override
  #fs;
  // Stats fields
  #dev;
  get dev() {
    return this.#dev;
  }
  #mode;
  get mode() {
    return this.#mode;
  }
  #nlink;
  get nlink() {
    return this.#nlink;
  }
  #uid;
  get uid() {
    return this.#uid;
  }
  #gid;
  get gid() {
    return this.#gid;
  }
  #rdev;
  get rdev() {
    return this.#rdev;
  }
  #blksize;
  get blksize() {
    return this.#blksize;
  }
  #ino;
  get ino() {
    return this.#ino;
  }
  #size;
  get size() {
    return this.#size;
  }
  #blocks;
  get blocks() {
    return this.#blocks;
  }
  #atimeMs;
  get atimeMs() {
    return this.#atimeMs;
  }
  #mtimeMs;
  get mtimeMs() {
    return this.#mtimeMs;
  }
  #ctimeMs;
  get ctimeMs() {
    return this.#ctimeMs;
  }
  #birthtimeMs;
  get birthtimeMs() {
    return this.#birthtimeMs;
  }
  #atime;
  get atime() {
    return this.#atime;
  }
  #mtime;
  get mtime() {
    return this.#mtime;
  }
  #ctime;
  get ctime() {
    return this.#ctime;
  }
  #birthtime;
  get birthtime() {
    return this.#birthtime;
  }
  #matchName;
  #depth;
  #fullpath;
  #fullpathPosix;
  #relative;
  #relativePosix;
  #type;
  #children;
  #linkTarget;
  #realpath;
  /**
   * This property is for compatibility with the Dirent class as of
   * Node v20, where Dirent['parentPath'] refers to the path of the
   * directory that was passed to readdir. For root entries, it's the path
   * to the entry itself.
   */
  get parentPath() {
    return (this.parent || this).fullpath();
  }
  /* c8 ignore start */
  /**
   * Deprecated alias for Dirent['parentPath'] Somewhat counterintuitively,
   * this property refers to the *parent* path, not the path object itself.
   *
   * @deprecated
   */
  get path() {
    return this.parentPath;
  }
  /* c8 ignore stop */
  /**
   * Do not create new Path objects directly.  They should always be accessed
   * via the PathScurry class or other methods on the Path class.
   *
   * @internal
   */
  constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
    this.name = name;
    this.#matchName = nocase ? normalizeNocase(name) : normalize(name);
    this.#type = type & TYPEMASK;
    this.nocase = nocase;
    this.roots = roots;
    this.root = root || this;
    this.#children = children;
    this.#fullpath = opts.fullpath;
    this.#relative = opts.relative;
    this.#relativePosix = opts.relativePosix;
    this.parent = opts.parent;
    if (this.parent) {
      this.#fs = this.parent.#fs;
    } else {
      this.#fs = fsFromOption(opts.fs);
    }
  }
  /**
   * Returns the depth of the Path object from its root.
   *
   * For example, a path at `/foo/bar` would have a depth of 2.
   */
  depth() {
    if (this.#depth !== void 0)
      return this.#depth;
    if (!this.parent)
      return this.#depth = 0;
    return this.#depth = this.parent.depth() + 1;
  }
  /**
   * @internal
   */
  childrenCache() {
    return this.#children;
  }
  /**
   * Get the Path object referenced by the string path, resolved from this Path
   */
  resolve(path2) {
    if (!path2) {
      return this;
    }
    const rootPath = this.getRootString(path2);
    const dir = path2.substring(rootPath.length);
    const dirParts = dir.split(this.splitSep);
    const result = rootPath ? this.getRoot(rootPath).#resolveParts(dirParts) : this.#resolveParts(dirParts);
    return result;
  }
  #resolveParts(dirParts) {
    let p = this;
    for (const part of dirParts) {
      p = p.child(part);
    }
    return p;
  }
  /**
   * Returns the cached children Path objects, if still available.  If they
   * have fallen out of the cache, then returns an empty array, and resets the
   * READDIR_CALLED bit, so that future calls to readdir() will require an fs
   * lookup.
   *
   * @internal
   */
  children() {
    const cached = this.#children.get(this);
    if (cached) {
      return cached;
    }
    const children = Object.assign([], { provisional: 0 });
    this.#children.set(this, children);
    this.#type &= ~READDIR_CALLED;
    return children;
  }
  /**
   * Resolves a path portion and returns or creates the child Path.
   *
   * Returns `this` if pathPart is `''` or `'.'`, or `parent` if pathPart is
   * `'..'`.
   *
   * This should not be called directly.  If `pathPart` contains any path
   * separators, it will lead to unsafe undefined behavior.
   *
   * Use `Path.resolve()` instead.
   *
   * @internal
   */
  child(pathPart, opts) {
    if (pathPart === "" || pathPart === ".") {
      return this;
    }
    if (pathPart === "..") {
      return this.parent || this;
    }
    const children = this.children();
    const name = this.nocase ? normalizeNocase(pathPart) : normalize(pathPart);
    for (const p of children) {
      if (p.#matchName === name) {
        return p;
      }
    }
    const s = this.parent ? this.sep : "";
    const fullpath = this.#fullpath ? this.#fullpath + s + pathPart : void 0;
    const pchild = this.newChild(pathPart, UNKNOWN, {
      ...opts,
      parent: this,
      fullpath
    });
    if (!this.canReaddir()) {
      pchild.#type |= ENOENT;
    }
    children.push(pchild);
    return pchild;
  }
  /**
   * The relative path from the cwd. If it does not share an ancestor with
   * the cwd, then this ends up being equivalent to the fullpath()
   */
  relative() {
    if (this.isCWD)
      return "";
    if (this.#relative !== void 0) {
      return this.#relative;
    }
    const name = this.name;
    const p = this.parent;
    if (!p) {
      return this.#relative = this.name;
    }
    const pv = p.relative();
    return pv + (!pv || !p.parent ? "" : this.sep) + name;
  }
  /**
   * The relative path from the cwd, using / as the path separator.
   * If it does not share an ancestor with
   * the cwd, then this ends up being equivalent to the fullpathPosix()
   * On posix systems, this is identical to relative().
   */
  relativePosix() {
    if (this.sep === "/")
      return this.relative();
    if (this.isCWD)
      return "";
    if (this.#relativePosix !== void 0)
      return this.#relativePosix;
    const name = this.name;
    const p = this.parent;
    if (!p) {
      return this.#relativePosix = this.fullpathPosix();
    }
    const pv = p.relativePosix();
    return pv + (!pv || !p.parent ? "" : "/") + name;
  }
  /**
   * The fully resolved path string for this Path entry
   */
  fullpath() {
    if (this.#fullpath !== void 0) {
      return this.#fullpath;
    }
    const name = this.name;
    const p = this.parent;
    if (!p) {
      return this.#fullpath = this.name;
    }
    const pv = p.fullpath();
    const fp = pv + (!p.parent ? "" : this.sep) + name;
    return this.#fullpath = fp;
  }
  /**
   * On platforms other than windows, this is identical to fullpath.
   *
   * On windows, this is overridden to return the forward-slash form of the
   * full UNC path.
   */
  fullpathPosix() {
    if (this.#fullpathPosix !== void 0)
      return this.#fullpathPosix;
    if (this.sep === "/")
      return this.#fullpathPosix = this.fullpath();
    if (!this.parent) {
      const p2 = this.fullpath().replace(/\\/g, "/");
      if (/^[a-z]:\//i.test(p2)) {
        return this.#fullpathPosix = `//?/${p2}`;
      } else {
        return this.#fullpathPosix = p2;
      }
    }
    const p = this.parent;
    const pfpp = p.fullpathPosix();
    const fpp = pfpp + (!pfpp || !p.parent ? "" : "/") + this.name;
    return this.#fullpathPosix = fpp;
  }
  /**
   * Is the Path of an unknown type?
   *
   * Note that we might know *something* about it if there has been a previous
   * filesystem operation, for example that it does not exist, or is not a
   * link, or whether it has child entries.
   */
  isUnknown() {
    return (this.#type & IFMT) === UNKNOWN;
  }
  isType(type) {
    return this[`is${type}`]();
  }
  getType() {
    return this.isUnknown() ? "Unknown" : this.isDirectory() ? "Directory" : this.isFile() ? "File" : this.isSymbolicLink() ? "SymbolicLink" : this.isFIFO() ? "FIFO" : this.isCharacterDevice() ? "CharacterDevice" : this.isBlockDevice() ? "BlockDevice" : (
      /* c8 ignore start */
      this.isSocket() ? "Socket" : "Unknown"
    );
  }
  /**
   * Is the Path a regular file?
   */
  isFile() {
    return (this.#type & IFMT) === IFREG;
  }
  /**
   * Is the Path a directory?
   */
  isDirectory() {
    return (this.#type & IFMT) === IFDIR;
  }
  /**
   * Is the path a character device?
   */
  isCharacterDevice() {
    return (this.#type & IFMT) === IFCHR;
  }
  /**
   * Is the path a block device?
   */
  isBlockDevice() {
    return (this.#type & IFMT) === IFBLK;
  }
  /**
   * Is the path a FIFO pipe?
   */
  isFIFO() {
    return (this.#type & IFMT) === IFIFO;
  }
  /**
   * Is the path a socket?
   */
  isSocket() {
    return (this.#type & IFMT) === IFSOCK;
  }
  /**
   * Is the path a symbolic link?
   */
  isSymbolicLink() {
    return (this.#type & IFLNK) === IFLNK;
  }
  /**
   * Return the entry if it has been subject of a successful lstat, or
   * undefined otherwise.
   *
   * Does not read the filesystem, so an undefined result *could* simply
   * mean that we haven't called lstat on it.
   */
  lstatCached() {
    return this.#type & LSTAT_CALLED ? this : void 0;
  }
  /**
   * Return the cached link target if the entry has been the subject of a
   * successful readlink, or undefined otherwise.
   *
   * Does not read the filesystem, so an undefined result *could* just mean we
   * don't have any cached data. Only use it if you are very sure that a
   * readlink() has been called at some point.
   */
  readlinkCached() {
    return this.#linkTarget;
  }
  /**
   * Returns the cached realpath target if the entry has been the subject
   * of a successful realpath, or undefined otherwise.
   *
   * Does not read the filesystem, so an undefined result *could* just mean we
   * don't have any cached data. Only use it if you are very sure that a
   * realpath() has been called at some point.
   */
  realpathCached() {
    return this.#realpath;
  }
  /**
   * Returns the cached child Path entries array if the entry has been the
   * subject of a successful readdir(), or [] otherwise.
   *
   * Does not read the filesystem, so an empty array *could* just mean we
   * don't have any cached data. Only use it if you are very sure that a
   * readdir() has been called recently enough to still be valid.
   */
  readdirCached() {
    const children = this.children();
    return children.slice(0, children.provisional);
  }
  /**
   * Return true if it's worth trying to readlink.  Ie, we don't (yet) have
   * any indication that readlink will definitely fail.
   *
   * Returns false if the path is known to not be a symlink, if a previous
   * readlink failed, or if the entry does not exist.
   */
  canReadlink() {
    if (this.#linkTarget)
      return true;
    if (!this.parent)
      return false;
    const ifmt = this.#type & IFMT;
    return !(ifmt !== UNKNOWN && ifmt !== IFLNK || this.#type & ENOREADLINK || this.#type & ENOENT);
  }
  /**
   * Return true if readdir has previously been successfully called on this
   * path, indicating that cachedReaddir() is likely valid.
   */
  calledReaddir() {
    return !!(this.#type & READDIR_CALLED);
  }
  /**
   * Returns true if the path is known to not exist. That is, a previous lstat
   * or readdir failed to verify its existence when that would have been
   * expected, or a parent entry was marked either enoent or enotdir.
   */
  isENOENT() {
    return !!(this.#type & ENOENT);
  }
  /**
   * Return true if the path is a match for the given path name.  This handles
   * case sensitivity and unicode normalization.
   *
   * Note: even on case-sensitive systems, it is **not** safe to test the
   * equality of the `.name` property to determine whether a given pathname
   * matches, due to unicode normalization mismatches.
   *
   * Always use this method instead of testing the `path.name` property
   * directly.
   */
  isNamed(n) {
    return !this.nocase ? this.#matchName === normalize(n) : this.#matchName === normalizeNocase(n);
  }
  /**
   * Return the Path object corresponding to the target of a symbolic link.
   *
   * If the Path is not a symbolic link, or if the readlink call fails for any
   * reason, `undefined` is returned.
   *
   * Result is cached, and thus may be outdated if the filesystem is mutated.
   */
  async readlink() {
    const target = this.#linkTarget;
    if (target) {
      return target;
    }
    if (!this.canReadlink()) {
      return void 0;
    }
    if (!this.parent) {
      return void 0;
    }
    try {
      const read = await this.#fs.promises.readlink(this.fullpath());
      const linkTarget = (await this.parent.realpath())?.resolve(read);
      if (linkTarget) {
        return this.#linkTarget = linkTarget;
      }
    } catch (er) {
      this.#readlinkFail(er.code);
      return void 0;
    }
  }
  /**
   * Synchronous {@link PathBase.readlink}
   */
  readlinkSync() {
    const target = this.#linkTarget;
    if (target) {
      return target;
    }
    if (!this.canReadlink()) {
      return void 0;
    }
    if (!this.parent) {
      return void 0;
    }
    try {
      const read = this.#fs.readlinkSync(this.fullpath());
      const linkTarget = this.parent.realpathSync()?.resolve(read);
      if (linkTarget) {
        return this.#linkTarget = linkTarget;
      }
    } catch (er) {
      this.#readlinkFail(er.code);
      return void 0;
    }
  }
  #readdirSuccess(children) {
    this.#type |= READDIR_CALLED;
    for (let p = children.provisional; p < children.length; p++) {
      const c = children[p];
      if (c)
        c.#markENOENT();
    }
  }
  #markENOENT() {
    if (this.#type & ENOENT)
      return;
    this.#type = (this.#type | ENOENT) & IFMT_UNKNOWN;
    this.#markChildrenENOENT();
  }
  #markChildrenENOENT() {
    const children = this.children();
    children.provisional = 0;
    for (const p of children) {
      p.#markENOENT();
    }
  }
  #markENOREALPATH() {
    this.#type |= ENOREALPATH;
    this.#markENOTDIR();
  }
  // save the information when we know the entry is not a dir
  #markENOTDIR() {
    if (this.#type & ENOTDIR)
      return;
    let t = this.#type;
    if ((t & IFMT) === IFDIR)
      t &= IFMT_UNKNOWN;
    this.#type = t | ENOTDIR;
    this.#markChildrenENOENT();
  }
  #readdirFail(code = "") {
    if (code === "ENOTDIR" || code === "EPERM") {
      this.#markENOTDIR();
    } else if (code === "ENOENT") {
      this.#markENOENT();
    } else {
      this.children().provisional = 0;
    }
  }
  #lstatFail(code = "") {
    if (code === "ENOTDIR") {
      const p = this.parent;
      p.#markENOTDIR();
    } else if (code === "ENOENT") {
      this.#markENOENT();
    }
  }
  #readlinkFail(code = "") {
    let ter = this.#type;
    ter |= ENOREADLINK;
    if (code === "ENOENT")
      ter |= ENOENT;
    if (code === "EINVAL" || code === "UNKNOWN") {
      ter &= IFMT_UNKNOWN;
    }
    this.#type = ter;
    if (code === "ENOTDIR" && this.parent) {
      this.parent.#markENOTDIR();
    }
  }
  #readdirAddChild(e, c) {
    return this.#readdirMaybePromoteChild(e, c) || this.#readdirAddNewChild(e, c);
  }
  #readdirAddNewChild(e, c) {
    const type = entToType(e);
    const child = this.newChild(e.name, type, { parent: this });
    const ifmt = child.#type & IFMT;
    if (ifmt !== IFDIR && ifmt !== IFLNK && ifmt !== UNKNOWN) {
      child.#type |= ENOTDIR;
    }
    c.unshift(child);
    c.provisional++;
    return child;
  }
  #readdirMaybePromoteChild(e, c) {
    for (let p = c.provisional; p < c.length; p++) {
      const pchild = c[p];
      const name = this.nocase ? normalizeNocase(e.name) : normalize(e.name);
      if (name !== pchild.#matchName) {
        continue;
      }
      return this.#readdirPromoteChild(e, pchild, p, c);
    }
  }
  #readdirPromoteChild(e, p, index, c) {
    const v = p.name;
    p.#type = p.#type & IFMT_UNKNOWN | entToType(e);
    if (v !== e.name)
      p.name = e.name;
    if (index !== c.provisional) {
      if (index === c.length - 1)
        c.pop();
      else
        c.splice(index, 1);
      c.unshift(p);
    }
    c.provisional++;
    return p;
  }
  /**
   * Call lstat() on this Path, and update all known information that can be
   * determined.
   *
   * Note that unlike `fs.lstat()`, the returned value does not contain some
   * information, such as `mode`, `dev`, `nlink`, and `ino`.  If that
   * information is required, you will need to call `fs.lstat` yourself.
   *
   * If the Path refers to a nonexistent file, or if the lstat call fails for
   * any reason, `undefined` is returned.  Otherwise the updated Path object is
   * returned.
   *
   * Results are cached, and thus may be out of date if the filesystem is
   * mutated.
   */
  async lstat() {
    if ((this.#type & ENOENT) === 0) {
      try {
        this.#applyStat(await this.#fs.promises.lstat(this.fullpath()));
        return this;
      } catch (er) {
        this.#lstatFail(er.code);
      }
    }
  }
  /**
   * synchronous {@link PathBase.lstat}
   */
  lstatSync() {
    if ((this.#type & ENOENT) === 0) {
      try {
        this.#applyStat(this.#fs.lstatSync(this.fullpath()));
        return this;
      } catch (er) {
        this.#lstatFail(er.code);
      }
    }
  }
  #applyStat(st) {
    const { atime, atimeMs, birthtime, birthtimeMs, blksize, blocks, ctime, ctimeMs, dev, gid, ino, mode, mtime, mtimeMs, nlink, rdev, size, uid } = st;
    this.#atime = atime;
    this.#atimeMs = atimeMs;
    this.#birthtime = birthtime;
    this.#birthtimeMs = birthtimeMs;
    this.#blksize = blksize;
    this.#blocks = blocks;
    this.#ctime = ctime;
    this.#ctimeMs = ctimeMs;
    this.#dev = dev;
    this.#gid = gid;
    this.#ino = ino;
    this.#mode = mode;
    this.#mtime = mtime;
    this.#mtimeMs = mtimeMs;
    this.#nlink = nlink;
    this.#rdev = rdev;
    this.#size = size;
    this.#uid = uid;
    const ifmt = entToType(st);
    this.#type = this.#type & IFMT_UNKNOWN | ifmt | LSTAT_CALLED;
    if (ifmt !== UNKNOWN && ifmt !== IFDIR && ifmt !== IFLNK) {
      this.#type |= ENOTDIR;
    }
  }
  #onReaddirCB = [];
  #readdirCBInFlight = false;
  #callOnReaddirCB(children) {
    this.#readdirCBInFlight = false;
    const cbs = this.#onReaddirCB.slice();
    this.#onReaddirCB.length = 0;
    cbs.forEach((cb) => cb(null, children));
  }
  /**
   * Standard node-style callback interface to get list of directory entries.
   *
   * If the Path cannot or does not contain any children, then an empty array
   * is returned.
   *
   * Results are cached, and thus may be out of date if the filesystem is
   * mutated.
   *
   * @param cb The callback called with (er, entries).  Note that the `er`
   * param is somewhat extraneous, as all readdir() errors are handled and
   * simply result in an empty set of entries being returned.
   * @param allowZalgo Boolean indicating that immediately known results should
   * *not* be deferred with `queueMicrotask`. Defaults to `false`. Release
   * zalgo at your peril, the dark pony lord is devious and unforgiving.
   */
  readdirCB(cb, allowZalgo = false) {
    if (!this.canReaddir()) {
      if (allowZalgo)
        cb(null, []);
      else
        queueMicrotask(() => cb(null, []));
      return;
    }
    const children = this.children();
    if (this.calledReaddir()) {
      const c = children.slice(0, children.provisional);
      if (allowZalgo)
        cb(null, c);
      else
        queueMicrotask(() => cb(null, c));
      return;
    }
    this.#onReaddirCB.push(cb);
    if (this.#readdirCBInFlight) {
      return;
    }
    this.#readdirCBInFlight = true;
    const fullpath = this.fullpath();
    this.#fs.readdir(fullpath, { withFileTypes: true }, (er, entries) => {
      if (er) {
        this.#readdirFail(er.code);
        children.provisional = 0;
      } else {
        for (const e of entries) {
          this.#readdirAddChild(e, children);
        }
        this.#readdirSuccess(children);
      }
      this.#callOnReaddirCB(children.slice(0, children.provisional));
      return;
    });
  }
  #asyncReaddirInFlight;
  /**
   * Return an array of known child entries.
   *
   * If the Path cannot or does not contain any children, then an empty array
   * is returned.
   *
   * Results are cached, and thus may be out of date if the filesystem is
   * mutated.
   */
  async readdir() {
    if (!this.canReaddir()) {
      return [];
    }
    const children = this.children();
    if (this.calledReaddir()) {
      return children.slice(0, children.provisional);
    }
    const fullpath = this.fullpath();
    if (this.#asyncReaddirInFlight) {
      await this.#asyncReaddirInFlight;
    } else {
      let resolve = () => {
      };
      this.#asyncReaddirInFlight = new Promise((res) => resolve = res);
      try {
        for (const e of await this.#fs.promises.readdir(fullpath, {
          withFileTypes: true
        })) {
          this.#readdirAddChild(e, children);
        }
        this.#readdirSuccess(children);
      } catch (er) {
        this.#readdirFail(er.code);
        children.provisional = 0;
      }
      this.#asyncReaddirInFlight = void 0;
      resolve();
    }
    return children.slice(0, children.provisional);
  }
  /**
   * synchronous {@link PathBase.readdir}
   */
  readdirSync() {
    if (!this.canReaddir()) {
      return [];
    }
    const children = this.children();
    if (this.calledReaddir()) {
      return children.slice(0, children.provisional);
    }
    const fullpath = this.fullpath();
    try {
      for (const e of this.#fs.readdirSync(fullpath, {
        withFileTypes: true
      })) {
        this.#readdirAddChild(e, children);
      }
      this.#readdirSuccess(children);
    } catch (er) {
      this.#readdirFail(er.code);
      children.provisional = 0;
    }
    return children.slice(0, children.provisional);
  }
  canReaddir() {
    if (this.#type & ENOCHILD)
      return false;
    const ifmt = IFMT & this.#type;
    if (!(ifmt === UNKNOWN || ifmt === IFDIR || ifmt === IFLNK)) {
      return false;
    }
    return true;
  }
  shouldWalk(dirs, walkFilter) {
    return (this.#type & IFDIR) === IFDIR && !(this.#type & ENOCHILD) && !dirs.has(this) && (!walkFilter || walkFilter(this));
  }
  /**
   * Return the Path object corresponding to path as resolved
   * by realpath(3).
   *
   * If the realpath call fails for any reason, `undefined` is returned.
   *
   * Result is cached, and thus may be outdated if the filesystem is mutated.
   * On success, returns a Path object.
   */
  async realpath() {
    if (this.#realpath)
      return this.#realpath;
    if ((ENOREALPATH | ENOREADLINK | ENOENT) & this.#type)
      return void 0;
    try {
      const rp = await this.#fs.promises.realpath(this.fullpath());
      return this.#realpath = this.resolve(rp);
    } catch (_) {
      this.#markENOREALPATH();
    }
  }
  /**
   * Synchronous {@link realpath}
   */
  realpathSync() {
    if (this.#realpath)
      return this.#realpath;
    if ((ENOREALPATH | ENOREADLINK | ENOENT) & this.#type)
      return void 0;
    try {
      const rp = this.#fs.realpathSync(this.fullpath());
      return this.#realpath = this.resolve(rp);
    } catch (_) {
      this.#markENOREALPATH();
    }
  }
  /**
   * Internal method to mark this Path object as the scurry cwd,
   * called by {@link PathScurry#chdir}
   *
   * @internal
   */
  [setAsCwd](oldCwd) {
    if (oldCwd === this)
      return;
    oldCwd.isCWD = false;
    this.isCWD = true;
    const changed = /* @__PURE__ */ new Set([]);
    let rp = [];
    let p = this;
    while (p && p.parent) {
      changed.add(p);
      p.#relative = rp.join(this.sep);
      p.#relativePosix = rp.join("/");
      p = p.parent;
      rp.push("..");
    }
    p = oldCwd;
    while (p && p.parent && !changed.has(p)) {
      p.#relative = void 0;
      p.#relativePosix = void 0;
      p = p.parent;
    }
  }
};
var PathWin32 = class _PathWin32 extends PathBase {
  /**
   * Separator for generating path strings.
   */
  sep = "\\";
  /**
   * Separator for parsing path strings.
   */
  splitSep = eitherSep;
  /**
   * Do not create new Path objects directly.  They should always be accessed
   * via the PathScurry class or other methods on the Path class.
   *
   * @internal
   */
  constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
    super(name, type, root, roots, nocase, children, opts);
  }
  /**
   * @internal
   */
  newChild(name, type = UNKNOWN, opts = {}) {
    return new _PathWin32(name, type, this.root, this.roots, this.nocase, this.childrenCache(), opts);
  }
  /**
   * @internal
   */
  getRootString(path2) {
    return win32.parse(path2).root;
  }
  /**
   * @internal
   */
  getRoot(rootPath) {
    rootPath = uncToDrive(rootPath.toUpperCase());
    if (rootPath === this.root.name) {
      return this.root;
    }
    for (const [compare, root] of Object.entries(this.roots)) {
      if (this.sameRoot(rootPath, compare)) {
        return this.roots[rootPath] = root;
      }
    }
    return this.roots[rootPath] = new PathScurryWin32(rootPath, this).root;
  }
  /**
   * @internal
   */
  sameRoot(rootPath, compare = this.root.name) {
    rootPath = rootPath.toUpperCase().replace(/\//g, "\\").replace(uncDriveRegexp, "$1\\");
    return rootPath === compare;
  }
};
var PathPosix = class _PathPosix extends PathBase {
  /**
   * separator for parsing path strings
   */
  splitSep = "/";
  /**
   * separator for generating path strings
   */
  sep = "/";
  /**
   * Do not create new Path objects directly.  They should always be accessed
   * via the PathScurry class or other methods on the Path class.
   *
   * @internal
   */
  constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
    super(name, type, root, roots, nocase, children, opts);
  }
  /**
   * @internal
   */
  getRootString(path2) {
    return path2.startsWith("/") ? "/" : "";
  }
  /**
   * @internal
   */
  getRoot(_rootPath) {
    return this.root;
  }
  /**
   * @internal
   */
  newChild(name, type = UNKNOWN, opts = {}) {
    return new _PathPosix(name, type, this.root, this.roots, this.nocase, this.childrenCache(), opts);
  }
};
var PathScurryBase = class {
  /**
   * The root Path entry for the current working directory of this Scurry
   */
  root;
  /**
   * The string path for the root of this Scurry's current working directory
   */
  rootPath;
  /**
   * A collection of all roots encountered, referenced by rootPath
   */
  roots;
  /**
   * The Path entry corresponding to this PathScurry's current working directory.
   */
  cwd;
  #resolveCache;
  #resolvePosixCache;
  #children;
  /**
   * Perform path comparisons case-insensitively.
   *
   * Defaults true on Darwin and Windows systems, false elsewhere.
   */
  nocase;
  #fs;
  /**
   * This class should not be instantiated directly.
   *
   * Use PathScurryWin32, PathScurryDarwin, PathScurryPosix, or PathScurry
   *
   * @internal
   */
  constructor(cwd = process.cwd(), pathImpl, sep2, { nocase, childrenCacheSize = 16 * 1024, fs = defaultFS } = {}) {
    this.#fs = fsFromOption(fs);
    if (cwd instanceof URL || cwd.startsWith("file://")) {
      cwd = fileURLToPath(cwd);
    }
    const cwdPath = pathImpl.resolve(cwd);
    this.roots = /* @__PURE__ */ Object.create(null);
    this.rootPath = this.parseRootPath(cwdPath);
    this.#resolveCache = new ResolveCache();
    this.#resolvePosixCache = new ResolveCache();
    this.#children = new ChildrenCache(childrenCacheSize);
    const split = cwdPath.substring(this.rootPath.length).split(sep2);
    if (split.length === 1 && !split[0]) {
      split.pop();
    }
    if (nocase === void 0) {
      throw new TypeError("must provide nocase setting to PathScurryBase ctor");
    }
    this.nocase = nocase;
    this.root = this.newRoot(this.#fs);
    this.roots[this.rootPath] = this.root;
    let prev = this.root;
    let len = split.length - 1;
    const joinSep = pathImpl.sep;
    let abs = this.rootPath;
    let sawFirst = false;
    for (const part of split) {
      const l = len--;
      prev = prev.child(part, {
        relative: new Array(l).fill("..").join(joinSep),
        relativePosix: new Array(l).fill("..").join("/"),
        fullpath: abs += (sawFirst ? "" : joinSep) + part
      });
      sawFirst = true;
    }
    this.cwd = prev;
  }
  /**
   * Get the depth of a provided path, string, or the cwd
   */
  depth(path2 = this.cwd) {
    if (typeof path2 === "string") {
      path2 = this.cwd.resolve(path2);
    }
    return path2.depth();
  }
  /**
   * Return the cache of child entries.  Exposed so subclasses can create
   * child Path objects in a platform-specific way.
   *
   * @internal
   */
  childrenCache() {
    return this.#children;
  }
  /**
   * Resolve one or more path strings to a resolved string
   *
   * Same interface as require('path').resolve.
   *
   * Much faster than path.resolve() when called multiple times for the same
   * path, because the resolved Path objects are cached.  Much slower
   * otherwise.
   */
  resolve(...paths) {
    let r = "";
    for (let i = paths.length - 1; i >= 0; i--) {
      const p = paths[i];
      if (!p || p === ".")
        continue;
      r = r ? `${p}/${r}` : p;
      if (this.isAbsolute(p)) {
        break;
      }
    }
    const cached = this.#resolveCache.get(r);
    if (cached !== void 0) {
      return cached;
    }
    const result = this.cwd.resolve(r).fullpath();
    this.#resolveCache.set(r, result);
    return result;
  }
  /**
   * Resolve one or more path strings to a resolved string, returning
   * the posix path.  Identical to .resolve() on posix systems, but on
   * windows will return a forward-slash separated UNC path.
   *
   * Same interface as require('path').resolve.
   *
   * Much faster than path.resolve() when called multiple times for the same
   * path, because the resolved Path objects are cached.  Much slower
   * otherwise.
   */
  resolvePosix(...paths) {
    let r = "";
    for (let i = paths.length - 1; i >= 0; i--) {
      const p = paths[i];
      if (!p || p === ".")
        continue;
      r = r ? `${p}/${r}` : p;
      if (this.isAbsolute(p)) {
        break;
      }
    }
    const cached = this.#resolvePosixCache.get(r);
    if (cached !== void 0) {
      return cached;
    }
    const result = this.cwd.resolve(r).fullpathPosix();
    this.#resolvePosixCache.set(r, result);
    return result;
  }
  /**
   * find the relative path from the cwd to the supplied path string or entry
   */
  relative(entry = this.cwd) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    }
    return entry.relative();
  }
  /**
   * find the relative path from the cwd to the supplied path string or
   * entry, using / as the path delimiter, even on Windows.
   */
  relativePosix(entry = this.cwd) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    }
    return entry.relativePosix();
  }
  /**
   * Return the basename for the provided string or Path object
   */
  basename(entry = this.cwd) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    }
    return entry.name;
  }
  /**
   * Return the dirname for the provided string or Path object
   */
  dirname(entry = this.cwd) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    }
    return (entry.parent || entry).fullpath();
  }
  async readdir(entry = this.cwd, opts = {
    withFileTypes: true
  }) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes } = opts;
    if (!entry.canReaddir()) {
      return [];
    } else {
      const p = await entry.readdir();
      return withFileTypes ? p : p.map((e) => e.name);
    }
  }
  readdirSync(entry = this.cwd, opts = {
    withFileTypes: true
  }) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes = true } = opts;
    if (!entry.canReaddir()) {
      return [];
    } else if (withFileTypes) {
      return entry.readdirSync();
    } else {
      return entry.readdirSync().map((e) => e.name);
    }
  }
  /**
   * Call lstat() on the string or Path object, and update all known
   * information that can be determined.
   *
   * Note that unlike `fs.lstat()`, the returned value does not contain some
   * information, such as `mode`, `dev`, `nlink`, and `ino`.  If that
   * information is required, you will need to call `fs.lstat` yourself.
   *
   * If the Path refers to a nonexistent file, or if the lstat call fails for
   * any reason, `undefined` is returned.  Otherwise the updated Path object is
   * returned.
   *
   * Results are cached, and thus may be out of date if the filesystem is
   * mutated.
   */
  async lstat(entry = this.cwd) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    }
    return entry.lstat();
  }
  /**
   * synchronous {@link PathScurryBase.lstat}
   */
  lstatSync(entry = this.cwd) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    }
    return entry.lstatSync();
  }
  async readlink(entry = this.cwd, { withFileTypes } = {
    withFileTypes: false
  }) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      withFileTypes = entry.withFileTypes;
      entry = this.cwd;
    }
    const e = await entry.readlink();
    return withFileTypes ? e : e?.fullpath();
  }
  readlinkSync(entry = this.cwd, { withFileTypes } = {
    withFileTypes: false
  }) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      withFileTypes = entry.withFileTypes;
      entry = this.cwd;
    }
    const e = entry.readlinkSync();
    return withFileTypes ? e : e?.fullpath();
  }
  async realpath(entry = this.cwd, { withFileTypes } = {
    withFileTypes: false
  }) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      withFileTypes = entry.withFileTypes;
      entry = this.cwd;
    }
    const e = await entry.realpath();
    return withFileTypes ? e : e?.fullpath();
  }
  realpathSync(entry = this.cwd, { withFileTypes } = {
    withFileTypes: false
  }) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      withFileTypes = entry.withFileTypes;
      entry = this.cwd;
    }
    const e = entry.realpathSync();
    return withFileTypes ? e : e?.fullpath();
  }
  async walk(entry = this.cwd, opts = {}) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes = true, follow = false, filter: filter2, walkFilter } = opts;
    const results = [];
    if (!filter2 || filter2(entry)) {
      results.push(withFileTypes ? entry : entry.fullpath());
    }
    const dirs = /* @__PURE__ */ new Set();
    const walk = (dir, cb) => {
      dirs.add(dir);
      dir.readdirCB((er, entries) => {
        if (er) {
          return cb(er);
        }
        let len = entries.length;
        if (!len)
          return cb();
        const next = () => {
          if (--len === 0) {
            cb();
          }
        };
        for (const e of entries) {
          if (!filter2 || filter2(e)) {
            results.push(withFileTypes ? e : e.fullpath());
          }
          if (follow && e.isSymbolicLink()) {
            e.realpath().then((r) => r?.isUnknown() ? r.lstat() : r).then((r) => r?.shouldWalk(dirs, walkFilter) ? walk(r, next) : next());
          } else {
            if (e.shouldWalk(dirs, walkFilter)) {
              walk(e, next);
            } else {
              next();
            }
          }
        }
      }, true);
    };
    const start = entry;
    return new Promise((res, rej) => {
      walk(start, (er) => {
        if (er)
          return rej(er);
        res(results);
      });
    });
  }
  walkSync(entry = this.cwd, opts = {}) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes = true, follow = false, filter: filter2, walkFilter } = opts;
    const results = [];
    if (!filter2 || filter2(entry)) {
      results.push(withFileTypes ? entry : entry.fullpath());
    }
    const dirs = /* @__PURE__ */ new Set([entry]);
    for (const dir of dirs) {
      const entries = dir.readdirSync();
      for (const e of entries) {
        if (!filter2 || filter2(e)) {
          results.push(withFileTypes ? e : e.fullpath());
        }
        let r = e;
        if (e.isSymbolicLink()) {
          if (!(follow && (r = e.realpathSync())))
            continue;
          if (r.isUnknown())
            r.lstatSync();
        }
        if (r.shouldWalk(dirs, walkFilter)) {
          dirs.add(r);
        }
      }
    }
    return results;
  }
  /**
   * Support for `for await`
   *
   * Alias for {@link PathScurryBase.iterate}
   *
   * Note: As of Node 19, this is very slow, compared to other methods of
   * walking.  Consider using {@link PathScurryBase.stream} if memory overhead
   * and backpressure are concerns, or {@link PathScurryBase.walk} if not.
   */
  [Symbol.asyncIterator]() {
    return this.iterate();
  }
  iterate(entry = this.cwd, options = {}) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      options = entry;
      entry = this.cwd;
    }
    return this.stream(entry, options)[Symbol.asyncIterator]();
  }
  /**
   * Iterating over a PathScurry performs a synchronous walk.
   *
   * Alias for {@link PathScurryBase.iterateSync}
   */
  [Symbol.iterator]() {
    return this.iterateSync();
  }
  *iterateSync(entry = this.cwd, opts = {}) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes = true, follow = false, filter: filter2, walkFilter } = opts;
    if (!filter2 || filter2(entry)) {
      yield withFileTypes ? entry : entry.fullpath();
    }
    const dirs = /* @__PURE__ */ new Set([entry]);
    for (const dir of dirs) {
      const entries = dir.readdirSync();
      for (const e of entries) {
        if (!filter2 || filter2(e)) {
          yield withFileTypes ? e : e.fullpath();
        }
        let r = e;
        if (e.isSymbolicLink()) {
          if (!(follow && (r = e.realpathSync())))
            continue;
          if (r.isUnknown())
            r.lstatSync();
        }
        if (r.shouldWalk(dirs, walkFilter)) {
          dirs.add(r);
        }
      }
    }
  }
  stream(entry = this.cwd, opts = {}) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes = true, follow = false, filter: filter2, walkFilter } = opts;
    const results = new Minipass({ objectMode: true });
    if (!filter2 || filter2(entry)) {
      results.write(withFileTypes ? entry : entry.fullpath());
    }
    const dirs = /* @__PURE__ */ new Set();
    const queue = [entry];
    let processing = 0;
    const process2 = () => {
      let paused = false;
      while (!paused) {
        const dir = queue.shift();
        if (!dir) {
          if (processing === 0)
            results.end();
          return;
        }
        processing++;
        dirs.add(dir);
        const onReaddir = (er, entries, didRealpaths = false) => {
          if (er)
            return results.emit("error", er);
          if (follow && !didRealpaths) {
            const promises = [];
            for (const e of entries) {
              if (e.isSymbolicLink()) {
                promises.push(e.realpath().then((r) => r?.isUnknown() ? r.lstat() : r));
              }
            }
            if (promises.length) {
              Promise.all(promises).then(() => onReaddir(null, entries, true));
              return;
            }
          }
          for (const e of entries) {
            if (e && (!filter2 || filter2(e))) {
              if (!results.write(withFileTypes ? e : e.fullpath())) {
                paused = true;
              }
            }
          }
          processing--;
          for (const e of entries) {
            const r = e.realpathCached() || e;
            if (r.shouldWalk(dirs, walkFilter)) {
              queue.push(r);
            }
          }
          if (paused && !results.flowing) {
            results.once("drain", process2);
          } else if (!sync2) {
            process2();
          }
        };
        let sync2 = true;
        dir.readdirCB(onReaddir, true);
        sync2 = false;
      }
    };
    process2();
    return results;
  }
  streamSync(entry = this.cwd, opts = {}) {
    if (typeof entry === "string") {
      entry = this.cwd.resolve(entry);
    } else if (!(entry instanceof PathBase)) {
      opts = entry;
      entry = this.cwd;
    }
    const { withFileTypes = true, follow = false, filter: filter2, walkFilter } = opts;
    const results = new Minipass({ objectMode: true });
    const dirs = /* @__PURE__ */ new Set();
    if (!filter2 || filter2(entry)) {
      results.write(withFileTypes ? entry : entry.fullpath());
    }
    const queue = [entry];
    let processing = 0;
    const process2 = () => {
      let paused = false;
      while (!paused) {
        const dir = queue.shift();
        if (!dir) {
          if (processing === 0)
            results.end();
          return;
        }
        processing++;
        dirs.add(dir);
        const entries = dir.readdirSync();
        for (const e of entries) {
          if (!filter2 || filter2(e)) {
            if (!results.write(withFileTypes ? e : e.fullpath())) {
              paused = true;
            }
          }
        }
        processing--;
        for (const e of entries) {
          let r = e;
          if (e.isSymbolicLink()) {
            if (!(follow && (r = e.realpathSync())))
              continue;
            if (r.isUnknown())
              r.lstatSync();
          }
          if (r.shouldWalk(dirs, walkFilter)) {
            queue.push(r);
          }
        }
      }
      if (paused && !results.flowing)
        results.once("drain", process2);
    };
    process2();
    return results;
  }
  chdir(path2 = this.cwd) {
    const oldCwd = this.cwd;
    this.cwd = typeof path2 === "string" ? this.cwd.resolve(path2) : path2;
    this.cwd[setAsCwd](oldCwd);
  }
};
var PathScurryWin32 = class extends PathScurryBase {
  /**
   * separator for generating path strings
   */
  sep = "\\";
  constructor(cwd = process.cwd(), opts = {}) {
    const { nocase = true } = opts;
    super(cwd, win32, "\\", { ...opts, nocase });
    this.nocase = nocase;
    for (let p = this.cwd; p; p = p.parent) {
      p.nocase = this.nocase;
    }
  }
  /**
   * @internal
   */
  parseRootPath(dir) {
    return win32.parse(dir).root.toUpperCase();
  }
  /**
   * @internal
   */
  newRoot(fs) {
    return new PathWin32(this.rootPath, IFDIR, void 0, this.roots, this.nocase, this.childrenCache(), { fs });
  }
  /**
   * Return true if the provided path string is an absolute path
   */
  isAbsolute(p) {
    return p.startsWith("/") || p.startsWith("\\") || /^[a-z]:(\/|\\)/i.test(p);
  }
};
var PathScurryPosix = class extends PathScurryBase {
  /**
   * separator for generating path strings
   */
  sep = "/";
  constructor(cwd = process.cwd(), opts = {}) {
    const { nocase = false } = opts;
    super(cwd, posix, "/", { ...opts, nocase });
    this.nocase = nocase;
  }
  /**
   * @internal
   */
  parseRootPath(_dir) {
    return "/";
  }
  /**
   * @internal
   */
  newRoot(fs) {
    return new PathPosix(this.rootPath, IFDIR, void 0, this.roots, this.nocase, this.childrenCache(), { fs });
  }
  /**
   * Return true if the provided path string is an absolute path
   */
  isAbsolute(p) {
    return p.startsWith("/");
  }
};
var PathScurryDarwin = class extends PathScurryPosix {
  constructor(cwd = process.cwd(), opts = {}) {
    const { nocase = true } = opts;
    super(cwd, { ...opts, nocase });
  }
};
var Path = process.platform === "win32" ? PathWin32 : PathPosix;
var PathScurry = process.platform === "win32" ? PathScurryWin32 : process.platform === "darwin" ? PathScurryDarwin : PathScurryPosix;

// packages/core/node_modules/glob/dist/esm/pattern.js
var isPatternList = (pl) => pl.length >= 1;
var isGlobList = (gl) => gl.length >= 1;
var Pattern = class _Pattern {
  #patternList;
  #globList;
  #index;
  length;
  #platform;
  #rest;
  #globString;
  #isDrive;
  #isUNC;
  #isAbsolute;
  #followGlobstar = true;
  constructor(patternList, globList, index, platform) {
    if (!isPatternList(patternList)) {
      throw new TypeError("empty pattern list");
    }
    if (!isGlobList(globList)) {
      throw new TypeError("empty glob list");
    }
    if (globList.length !== patternList.length) {
      throw new TypeError("mismatched pattern list and glob list lengths");
    }
    this.length = patternList.length;
    if (index < 0 || index >= this.length) {
      throw new TypeError("index out of range");
    }
    this.#patternList = patternList;
    this.#globList = globList;
    this.#index = index;
    this.#platform = platform;
    if (this.#index === 0) {
      if (this.isUNC()) {
        const [p0, p1, p2, p3, ...prest] = this.#patternList;
        const [g0, g1, g2, g3, ...grest] = this.#globList;
        if (prest[0] === "") {
          prest.shift();
          grest.shift();
        }
        const p = [p0, p1, p2, p3, ""].join("/");
        const g = [g0, g1, g2, g3, ""].join("/");
        this.#patternList = [p, ...prest];
        this.#globList = [g, ...grest];
        this.length = this.#patternList.length;
      } else if (this.isDrive() || this.isAbsolute()) {
        const [p1, ...prest] = this.#patternList;
        const [g1, ...grest] = this.#globList;
        if (prest[0] === "") {
          prest.shift();
          grest.shift();
        }
        const p = p1 + "/";
        const g = g1 + "/";
        this.#patternList = [p, ...prest];
        this.#globList = [g, ...grest];
        this.length = this.#patternList.length;
      }
    }
  }
  /**
   * The first entry in the parsed list of patterns
   */
  pattern() {
    return this.#patternList[this.#index];
  }
  /**
   * true of if pattern() returns a string
   */
  isString() {
    return typeof this.#patternList[this.#index] === "string";
  }
  /**
   * true of if pattern() returns GLOBSTAR
   */
  isGlobstar() {
    return this.#patternList[this.#index] === GLOBSTAR;
  }
  /**
   * true if pattern() returns a regexp
   */
  isRegExp() {
    return this.#patternList[this.#index] instanceof RegExp;
  }
  /**
   * The /-joined set of glob parts that make up this pattern
   */
  globString() {
    return this.#globString = this.#globString || (this.#index === 0 ? this.isAbsolute() ? this.#globList[0] + this.#globList.slice(1).join("/") : this.#globList.join("/") : this.#globList.slice(this.#index).join("/"));
  }
  /**
   * true if there are more pattern parts after this one
   */
  hasMore() {
    return this.length > this.#index + 1;
  }
  /**
   * The rest of the pattern after this part, or null if this is the end
   */
  rest() {
    if (this.#rest !== void 0)
      return this.#rest;
    if (!this.hasMore())
      return this.#rest = null;
    this.#rest = new _Pattern(this.#patternList, this.#globList, this.#index + 1, this.#platform);
    this.#rest.#isAbsolute = this.#isAbsolute;
    this.#rest.#isUNC = this.#isUNC;
    this.#rest.#isDrive = this.#isDrive;
    return this.#rest;
  }
  /**
   * true if the pattern represents a //unc/path/ on windows
   */
  isUNC() {
    const pl = this.#patternList;
    return this.#isUNC !== void 0 ? this.#isUNC : this.#isUNC = this.#platform === "win32" && this.#index === 0 && pl[0] === "" && pl[1] === "" && typeof pl[2] === "string" && !!pl[2] && typeof pl[3] === "string" && !!pl[3];
  }
  // pattern like C:/...
  // split = ['C:', ...]
  // XXX: would be nice to handle patterns like `c:*` to test the cwd
  // in c: for *, but I don't know of a way to even figure out what that
  // cwd is without actually chdir'ing into it?
  /**
   * True if the pattern starts with a drive letter on Windows
   */
  isDrive() {
    const pl = this.#patternList;
    return this.#isDrive !== void 0 ? this.#isDrive : this.#isDrive = this.#platform === "win32" && this.#index === 0 && this.length > 1 && typeof pl[0] === "string" && /^[a-z]:$/i.test(pl[0]);
  }
  // pattern = '/' or '/...' or '/x/...'
  // split = ['', ''] or ['', ...] or ['', 'x', ...]
  // Drive and UNC both considered absolute on windows
  /**
   * True if the pattern is rooted on an absolute path
   */
  isAbsolute() {
    const pl = this.#patternList;
    return this.#isAbsolute !== void 0 ? this.#isAbsolute : this.#isAbsolute = pl[0] === "" && pl.length > 1 || this.isDrive() || this.isUNC();
  }
  /**
   * consume the root of the pattern, and return it
   */
  root() {
    const p = this.#patternList[0];
    return typeof p === "string" && this.isAbsolute() && this.#index === 0 ? p : "";
  }
  /**
   * Check to see if the current globstar pattern is allowed to follow
   * a symbolic link.
   */
  checkFollowGlobstar() {
    return !(this.#index === 0 || !this.isGlobstar() || !this.#followGlobstar);
  }
  /**
   * Mark that the current globstar pattern is following a symbolic link
   */
  markFollowGlobstar() {
    if (this.#index === 0 || !this.isGlobstar() || !this.#followGlobstar)
      return false;
    this.#followGlobstar = false;
    return true;
  }
};

// packages/core/node_modules/glob/dist/esm/ignore.js
var defaultPlatform2 = typeof process === "object" && process && typeof process.platform === "string" ? process.platform : "linux";
var Ignore = class {
  relative;
  relativeChildren;
  absolute;
  absoluteChildren;
  platform;
  mmopts;
  constructor(ignored, { nobrace, nocase, noext, noglobstar, platform = defaultPlatform2 }) {
    this.relative = [];
    this.absolute = [];
    this.relativeChildren = [];
    this.absoluteChildren = [];
    this.platform = platform;
    this.mmopts = {
      dot: true,
      nobrace,
      nocase,
      noext,
      noglobstar,
      optimizationLevel: 2,
      platform,
      nocomment: true,
      nonegate: true
    };
    for (const ign of ignored)
      this.add(ign);
  }
  add(ign) {
    const mm = new Minimatch(ign, this.mmopts);
    for (let i = 0; i < mm.set.length; i++) {
      const parsed = mm.set[i];
      const globParts = mm.globParts[i];
      if (!parsed || !globParts) {
        throw new Error("invalid pattern object");
      }
      while (parsed[0] === "." && globParts[0] === ".") {
        parsed.shift();
        globParts.shift();
      }
      const p = new Pattern(parsed, globParts, 0, this.platform);
      const m = new Minimatch(p.globString(), this.mmopts);
      const children = globParts[globParts.length - 1] === "**";
      const absolute = p.isAbsolute();
      if (absolute)
        this.absolute.push(m);
      else
        this.relative.push(m);
      if (children) {
        if (absolute)
          this.absoluteChildren.push(m);
        else
          this.relativeChildren.push(m);
      }
    }
  }
  ignored(p) {
    const fullpath = p.fullpath();
    const fullpaths = `${fullpath}/`;
    const relative = p.relative() || ".";
    const relatives = `${relative}/`;
    for (const m of this.relative) {
      if (m.match(relative) || m.match(relatives))
        return true;
    }
    for (const m of this.absolute) {
      if (m.match(fullpath) || m.match(fullpaths))
        return true;
    }
    return false;
  }
  childrenIgnored(p) {
    const fullpath = p.fullpath() + "/";
    const relative = (p.relative() || ".") + "/";
    for (const m of this.relativeChildren) {
      if (m.match(relative))
        return true;
    }
    for (const m of this.absoluteChildren) {
      if (m.match(fullpath))
        return true;
    }
    return false;
  }
};

// packages/core/node_modules/glob/dist/esm/processor.js
var HasWalkedCache = class _HasWalkedCache {
  store;
  constructor(store = /* @__PURE__ */ new Map()) {
    this.store = store;
  }
  copy() {
    return new _HasWalkedCache(new Map(this.store));
  }
  hasWalked(target, pattern) {
    return this.store.get(target.fullpath())?.has(pattern.globString());
  }
  storeWalked(target, pattern) {
    const fullpath = target.fullpath();
    const cached = this.store.get(fullpath);
    if (cached)
      cached.add(pattern.globString());
    else
      this.store.set(fullpath, /* @__PURE__ */ new Set([pattern.globString()]));
  }
};
var MatchRecord = class {
  store = /* @__PURE__ */ new Map();
  add(target, absolute, ifDir) {
    const n = (absolute ? 2 : 0) | (ifDir ? 1 : 0);
    const current = this.store.get(target);
    this.store.set(target, current === void 0 ? n : n & current);
  }
  // match, absolute, ifdir
  entries() {
    return [...this.store.entries()].map(([path2, n]) => [
      path2,
      !!(n & 2),
      !!(n & 1)
    ]);
  }
};
var SubWalks = class {
  store = /* @__PURE__ */ new Map();
  add(target, pattern) {
    if (!target.canReaddir()) {
      return;
    }
    const subs = this.store.get(target);
    if (subs) {
      if (!subs.find((p) => p.globString() === pattern.globString())) {
        subs.push(pattern);
      }
    } else
      this.store.set(target, [pattern]);
  }
  get(target) {
    const subs = this.store.get(target);
    if (!subs) {
      throw new Error("attempting to walk unknown path");
    }
    return subs;
  }
  entries() {
    return this.keys().map((k2) => [k2, this.store.get(k2)]);
  }
  keys() {
    return [...this.store.keys()].filter((t) => t.canReaddir());
  }
};
var Processor = class _Processor {
  hasWalkedCache;
  matches = new MatchRecord();
  subwalks = new SubWalks();
  patterns;
  follow;
  dot;
  opts;
  constructor(opts, hasWalkedCache) {
    this.opts = opts;
    this.follow = !!opts.follow;
    this.dot = !!opts.dot;
    this.hasWalkedCache = hasWalkedCache ? hasWalkedCache.copy() : new HasWalkedCache();
  }
  processPatterns(target, patterns) {
    this.patterns = patterns;
    const processingSet = patterns.map((p) => [target, p]);
    for (let [t, pattern] of processingSet) {
      this.hasWalkedCache.storeWalked(t, pattern);
      const root = pattern.root();
      const absolute = pattern.isAbsolute() && this.opts.absolute !== false;
      if (root) {
        t = t.resolve(root === "/" && this.opts.root !== void 0 ? this.opts.root : root);
        const rest2 = pattern.rest();
        if (!rest2) {
          this.matches.add(t, true, false);
          continue;
        } else {
          pattern = rest2;
        }
      }
      if (t.isENOENT())
        continue;
      let p;
      let rest;
      let changed = false;
      while (typeof (p = pattern.pattern()) === "string" && (rest = pattern.rest())) {
        const c = t.resolve(p);
        t = c;
        pattern = rest;
        changed = true;
      }
      p = pattern.pattern();
      rest = pattern.rest();
      if (changed) {
        if (this.hasWalkedCache.hasWalked(t, pattern))
          continue;
        this.hasWalkedCache.storeWalked(t, pattern);
      }
      if (typeof p === "string") {
        const ifDir = p === ".." || p === "" || p === ".";
        this.matches.add(t.resolve(p), absolute, ifDir);
        continue;
      } else if (p === GLOBSTAR) {
        if (!t.isSymbolicLink() || this.follow || pattern.checkFollowGlobstar()) {
          this.subwalks.add(t, pattern);
        }
        const rp = rest?.pattern();
        const rrest = rest?.rest();
        if (!rest || (rp === "" || rp === ".") && !rrest) {
          this.matches.add(t, absolute, rp === "" || rp === ".");
        } else {
          if (rp === "..") {
            const tp = t.parent || t;
            if (!rrest)
              this.matches.add(tp, absolute, true);
            else if (!this.hasWalkedCache.hasWalked(tp, rrest)) {
              this.subwalks.add(tp, rrest);
            }
          }
        }
      } else if (p instanceof RegExp) {
        this.subwalks.add(t, pattern);
      }
    }
    return this;
  }
  subwalkTargets() {
    return this.subwalks.keys();
  }
  child() {
    return new _Processor(this.opts, this.hasWalkedCache);
  }
  // return a new Processor containing the subwalks for each
  // child entry, and a set of matches, and
  // a hasWalkedCache that's a copy of this one
  // then we're going to call
  filterEntries(parent, entries) {
    const patterns = this.subwalks.get(parent);
    const results = this.child();
    for (const e of entries) {
      for (const pattern of patterns) {
        const absolute = pattern.isAbsolute();
        const p = pattern.pattern();
        const rest = pattern.rest();
        if (p === GLOBSTAR) {
          results.testGlobstar(e, pattern, rest, absolute);
        } else if (p instanceof RegExp) {
          results.testRegExp(e, p, rest, absolute);
        } else {
          results.testString(e, p, rest, absolute);
        }
      }
    }
    return results;
  }
  testGlobstar(e, pattern, rest, absolute) {
    if (this.dot || !e.name.startsWith(".")) {
      if (!pattern.hasMore()) {
        this.matches.add(e, absolute, false);
      }
      if (e.canReaddir()) {
        if (this.follow || !e.isSymbolicLink()) {
          this.subwalks.add(e, pattern);
        } else if (e.isSymbolicLink()) {
          if (rest && pattern.checkFollowGlobstar()) {
            this.subwalks.add(e, rest);
          } else if (pattern.markFollowGlobstar()) {
            this.subwalks.add(e, pattern);
          }
        }
      }
    }
    if (rest) {
      const rp = rest.pattern();
      if (typeof rp === "string" && // dots and empty were handled already
      rp !== ".." && rp !== "" && rp !== ".") {
        this.testString(e, rp, rest.rest(), absolute);
      } else if (rp === "..") {
        const ep = e.parent || e;
        this.subwalks.add(ep, rest);
      } else if (rp instanceof RegExp) {
        this.testRegExp(e, rp, rest.rest(), absolute);
      }
    }
  }
  testRegExp(e, p, rest, absolute) {
    if (!p.test(e.name))
      return;
    if (!rest) {
      this.matches.add(e, absolute, false);
    } else {
      this.subwalks.add(e, rest);
    }
  }
  testString(e, p, rest, absolute) {
    if (!e.isNamed(p))
      return;
    if (!rest) {
      this.matches.add(e, absolute, false);
    } else {
      this.subwalks.add(e, rest);
    }
  }
};

// packages/core/node_modules/glob/dist/esm/walker.js
var makeIgnore = (ignore, opts) => typeof ignore === "string" ? new Ignore([ignore], opts) : Array.isArray(ignore) ? new Ignore(ignore, opts) : ignore;
var GlobUtil = class {
  path;
  patterns;
  opts;
  seen = /* @__PURE__ */ new Set();
  paused = false;
  aborted = false;
  #onResume = [];
  #ignore;
  #sep;
  signal;
  maxDepth;
  includeChildMatches;
  constructor(patterns, path2, opts) {
    this.patterns = patterns;
    this.path = path2;
    this.opts = opts;
    this.#sep = !opts.posix && opts.platform === "win32" ? "\\" : "/";
    this.includeChildMatches = opts.includeChildMatches !== false;
    if (opts.ignore || !this.includeChildMatches) {
      this.#ignore = makeIgnore(opts.ignore ?? [], opts);
      if (!this.includeChildMatches && typeof this.#ignore.add !== "function") {
        const m = "cannot ignore child matches, ignore lacks add() method.";
        throw new Error(m);
      }
    }
    this.maxDepth = opts.maxDepth || Infinity;
    if (opts.signal) {
      this.signal = opts.signal;
      this.signal.addEventListener("abort", () => {
        this.#onResume.length = 0;
      });
    }
  }
  #ignored(path2) {
    return this.seen.has(path2) || !!this.#ignore?.ignored?.(path2);
  }
  #childrenIgnored(path2) {
    return !!this.#ignore?.childrenIgnored?.(path2);
  }
  // backpressure mechanism
  pause() {
    this.paused = true;
  }
  resume() {
    if (this.signal?.aborted)
      return;
    this.paused = false;
    let fn = void 0;
    while (!this.paused && (fn = this.#onResume.shift())) {
      fn();
    }
  }
  onResume(fn) {
    if (this.signal?.aborted)
      return;
    if (!this.paused) {
      fn();
    } else {
      this.#onResume.push(fn);
    }
  }
  // do the requisite realpath/stat checking, and return the path
  // to add or undefined to filter it out.
  async matchCheck(e, ifDir) {
    if (ifDir && this.opts.nodir)
      return void 0;
    let rpc;
    if (this.opts.realpath) {
      rpc = e.realpathCached() || await e.realpath();
      if (!rpc)
        return void 0;
      e = rpc;
    }
    const needStat = e.isUnknown() || this.opts.stat;
    const s = needStat ? await e.lstat() : e;
    if (this.opts.follow && this.opts.nodir && s?.isSymbolicLink()) {
      const target = await s.realpath();
      if (target && (target.isUnknown() || this.opts.stat)) {
        await target.lstat();
      }
    }
    return this.matchCheckTest(s, ifDir);
  }
  matchCheckTest(e, ifDir) {
    return e && (this.maxDepth === Infinity || e.depth() <= this.maxDepth) && (!ifDir || e.canReaddir()) && (!this.opts.nodir || !e.isDirectory()) && (!this.opts.nodir || !this.opts.follow || !e.isSymbolicLink() || !e.realpathCached()?.isDirectory()) && !this.#ignored(e) ? e : void 0;
  }
  matchCheckSync(e, ifDir) {
    if (ifDir && this.opts.nodir)
      return void 0;
    let rpc;
    if (this.opts.realpath) {
      rpc = e.realpathCached() || e.realpathSync();
      if (!rpc)
        return void 0;
      e = rpc;
    }
    const needStat = e.isUnknown() || this.opts.stat;
    const s = needStat ? e.lstatSync() : e;
    if (this.opts.follow && this.opts.nodir && s?.isSymbolicLink()) {
      const target = s.realpathSync();
      if (target && (target?.isUnknown() || this.opts.stat)) {
        target.lstatSync();
      }
    }
    return this.matchCheckTest(s, ifDir);
  }
  matchFinish(e, absolute) {
    if (this.#ignored(e))
      return;
    if (!this.includeChildMatches && this.#ignore?.add) {
      const ign = `${e.relativePosix()}/**`;
      this.#ignore.add(ign);
    }
    const abs = this.opts.absolute === void 0 ? absolute : this.opts.absolute;
    this.seen.add(e);
    const mark = this.opts.mark && e.isDirectory() ? this.#sep : "";
    if (this.opts.withFileTypes) {
      this.matchEmit(e);
    } else if (abs) {
      const abs2 = this.opts.posix ? e.fullpathPosix() : e.fullpath();
      this.matchEmit(abs2 + mark);
    } else {
      const rel = this.opts.posix ? e.relativePosix() : e.relative();
      const pre = this.opts.dotRelative && !rel.startsWith(".." + this.#sep) ? "." + this.#sep : "";
      this.matchEmit(!rel ? "." + mark : pre + rel + mark);
    }
  }
  async match(e, absolute, ifDir) {
    const p = await this.matchCheck(e, ifDir);
    if (p)
      this.matchFinish(p, absolute);
  }
  matchSync(e, absolute, ifDir) {
    const p = this.matchCheckSync(e, ifDir);
    if (p)
      this.matchFinish(p, absolute);
  }
  walkCB(target, patterns, cb) {
    if (this.signal?.aborted)
      cb();
    this.walkCB2(target, patterns, new Processor(this.opts), cb);
  }
  walkCB2(target, patterns, processor, cb) {
    if (this.#childrenIgnored(target))
      return cb();
    if (this.signal?.aborted)
      cb();
    if (this.paused) {
      this.onResume(() => this.walkCB2(target, patterns, processor, cb));
      return;
    }
    processor.processPatterns(target, patterns);
    let tasks = 1;
    const next = () => {
      if (--tasks === 0)
        cb();
    };
    for (const [m, absolute, ifDir] of processor.matches.entries()) {
      if (this.#ignored(m))
        continue;
      tasks++;
      this.match(m, absolute, ifDir).then(() => next());
    }
    for (const t of processor.subwalkTargets()) {
      if (this.maxDepth !== Infinity && t.depth() >= this.maxDepth) {
        continue;
      }
      tasks++;
      const childrenCached = t.readdirCached();
      if (t.calledReaddir())
        this.walkCB3(t, childrenCached, processor, next);
      else {
        t.readdirCB((_, entries) => this.walkCB3(t, entries, processor, next), true);
      }
    }
    next();
  }
  walkCB3(target, entries, processor, cb) {
    processor = processor.filterEntries(target, entries);
    let tasks = 1;
    const next = () => {
      if (--tasks === 0)
        cb();
    };
    for (const [m, absolute, ifDir] of processor.matches.entries()) {
      if (this.#ignored(m))
        continue;
      tasks++;
      this.match(m, absolute, ifDir).then(() => next());
    }
    for (const [target2, patterns] of processor.subwalks.entries()) {
      tasks++;
      this.walkCB2(target2, patterns, processor.child(), next);
    }
    next();
  }
  walkCBSync(target, patterns, cb) {
    if (this.signal?.aborted)
      cb();
    this.walkCB2Sync(target, patterns, new Processor(this.opts), cb);
  }
  walkCB2Sync(target, patterns, processor, cb) {
    if (this.#childrenIgnored(target))
      return cb();
    if (this.signal?.aborted)
      cb();
    if (this.paused) {
      this.onResume(() => this.walkCB2Sync(target, patterns, processor, cb));
      return;
    }
    processor.processPatterns(target, patterns);
    let tasks = 1;
    const next = () => {
      if (--tasks === 0)
        cb();
    };
    for (const [m, absolute, ifDir] of processor.matches.entries()) {
      if (this.#ignored(m))
        continue;
      this.matchSync(m, absolute, ifDir);
    }
    for (const t of processor.subwalkTargets()) {
      if (this.maxDepth !== Infinity && t.depth() >= this.maxDepth) {
        continue;
      }
      tasks++;
      const children = t.readdirSync();
      this.walkCB3Sync(t, children, processor, next);
    }
    next();
  }
  walkCB3Sync(target, entries, processor, cb) {
    processor = processor.filterEntries(target, entries);
    let tasks = 1;
    const next = () => {
      if (--tasks === 0)
        cb();
    };
    for (const [m, absolute, ifDir] of processor.matches.entries()) {
      if (this.#ignored(m))
        continue;
      this.matchSync(m, absolute, ifDir);
    }
    for (const [target2, patterns] of processor.subwalks.entries()) {
      tasks++;
      this.walkCB2Sync(target2, patterns, processor.child(), next);
    }
    next();
  }
};
var GlobWalker = class extends GlobUtil {
  matches = /* @__PURE__ */ new Set();
  constructor(patterns, path2, opts) {
    super(patterns, path2, opts);
  }
  matchEmit(e) {
    this.matches.add(e);
  }
  async walk() {
    if (this.signal?.aborted)
      throw this.signal.reason;
    if (this.path.isUnknown()) {
      await this.path.lstat();
    }
    await new Promise((res, rej) => {
      this.walkCB(this.path, this.patterns, () => {
        if (this.signal?.aborted) {
          rej(this.signal.reason);
        } else {
          res(this.matches);
        }
      });
    });
    return this.matches;
  }
  walkSync() {
    if (this.signal?.aborted)
      throw this.signal.reason;
    if (this.path.isUnknown()) {
      this.path.lstatSync();
    }
    this.walkCBSync(this.path, this.patterns, () => {
      if (this.signal?.aborted)
        throw this.signal.reason;
    });
    return this.matches;
  }
};
var GlobStream = class extends GlobUtil {
  results;
  constructor(patterns, path2, opts) {
    super(patterns, path2, opts);
    this.results = new Minipass({
      signal: this.signal,
      objectMode: true
    });
    this.results.on("drain", () => this.resume());
    this.results.on("resume", () => this.resume());
  }
  matchEmit(e) {
    this.results.write(e);
    if (!this.results.flowing)
      this.pause();
  }
  stream() {
    const target = this.path;
    if (target.isUnknown()) {
      target.lstat().then(() => {
        this.walkCB(target, this.patterns, () => this.results.end());
      });
    } else {
      this.walkCB(target, this.patterns, () => this.results.end());
    }
    return this.results;
  }
  streamSync() {
    if (this.path.isUnknown()) {
      this.path.lstatSync();
    }
    this.walkCBSync(this.path, this.patterns, () => this.results.end());
    return this.results;
  }
};

// packages/core/node_modules/glob/dist/esm/glob.js
var defaultPlatform3 = typeof process === "object" && process && typeof process.platform === "string" ? process.platform : "linux";
var Glob = class {
  absolute;
  cwd;
  root;
  dot;
  dotRelative;
  follow;
  ignore;
  magicalBraces;
  mark;
  matchBase;
  maxDepth;
  nobrace;
  nocase;
  nodir;
  noext;
  noglobstar;
  pattern;
  platform;
  realpath;
  scurry;
  stat;
  signal;
  windowsPathsNoEscape;
  withFileTypes;
  includeChildMatches;
  /**
   * The options provided to the constructor.
   */
  opts;
  /**
   * An array of parsed immutable {@link Pattern} objects.
   */
  patterns;
  /**
   * All options are stored as properties on the `Glob` object.
   *
   * See {@link GlobOptions} for full options descriptions.
   *
   * Note that a previous `Glob` object can be passed as the
   * `GlobOptions` to another `Glob` instantiation to re-use settings
   * and caches with a new pattern.
   *
   * Traversal functions can be called multiple times to run the walk
   * again.
   */
  constructor(pattern, opts) {
    if (!opts)
      throw new TypeError("glob options required");
    this.withFileTypes = !!opts.withFileTypes;
    this.signal = opts.signal;
    this.follow = !!opts.follow;
    this.dot = !!opts.dot;
    this.dotRelative = !!opts.dotRelative;
    this.nodir = !!opts.nodir;
    this.mark = !!opts.mark;
    if (!opts.cwd) {
      this.cwd = "";
    } else if (opts.cwd instanceof URL || opts.cwd.startsWith("file://")) {
      opts.cwd = fileURLToPath2(opts.cwd);
    }
    this.cwd = opts.cwd || "";
    this.root = opts.root;
    this.magicalBraces = !!opts.magicalBraces;
    this.nobrace = !!opts.nobrace;
    this.noext = !!opts.noext;
    this.realpath = !!opts.realpath;
    this.absolute = opts.absolute;
    this.includeChildMatches = opts.includeChildMatches !== false;
    this.noglobstar = !!opts.noglobstar;
    this.matchBase = !!opts.matchBase;
    this.maxDepth = typeof opts.maxDepth === "number" ? opts.maxDepth : Infinity;
    this.stat = !!opts.stat;
    this.ignore = opts.ignore;
    if (this.withFileTypes && this.absolute !== void 0) {
      throw new Error("cannot set absolute and withFileTypes:true");
    }
    if (typeof pattern === "string") {
      pattern = [pattern];
    }
    this.windowsPathsNoEscape = !!opts.windowsPathsNoEscape || opts.allowWindowsEscape === false;
    if (this.windowsPathsNoEscape) {
      pattern = pattern.map((p) => p.replace(/\\/g, "/"));
    }
    if (this.matchBase) {
      if (opts.noglobstar) {
        throw new TypeError("base matching requires globstar");
      }
      pattern = pattern.map((p) => p.includes("/") ? p : `./**/${p}`);
    }
    this.pattern = pattern;
    this.platform = opts.platform || defaultPlatform3;
    this.opts = { ...opts, platform: this.platform };
    if (opts.scurry) {
      this.scurry = opts.scurry;
      if (opts.nocase !== void 0 && opts.nocase !== opts.scurry.nocase) {
        throw new Error("nocase option contradicts provided scurry option");
      }
    } else {
      const Scurry = opts.platform === "win32" ? PathScurryWin32 : opts.platform === "darwin" ? PathScurryDarwin : opts.platform ? PathScurryPosix : PathScurry;
      this.scurry = new Scurry(this.cwd, {
        nocase: opts.nocase,
        fs: opts.fs
      });
    }
    this.nocase = this.scurry.nocase;
    const nocaseMagicOnly = this.platform === "darwin" || this.platform === "win32";
    const mmo = {
      // default nocase based on platform
      ...opts,
      dot: this.dot,
      matchBase: this.matchBase,
      nobrace: this.nobrace,
      nocase: this.nocase,
      nocaseMagicOnly,
      nocomment: true,
      noext: this.noext,
      nonegate: true,
      optimizationLevel: 2,
      platform: this.platform,
      windowsPathsNoEscape: this.windowsPathsNoEscape,
      debug: !!this.opts.debug
    };
    const mms = this.pattern.map((p) => new Minimatch(p, mmo));
    const [matchSet, globParts] = mms.reduce((set, m) => {
      set[0].push(...m.set);
      set[1].push(...m.globParts);
      return set;
    }, [[], []]);
    this.patterns = matchSet.map((set, i) => {
      const g = globParts[i];
      if (!g)
        throw new Error("invalid pattern object");
      return new Pattern(set, g, 0, this.platform);
    });
  }
  async walk() {
    return [
      ...await new GlobWalker(this.patterns, this.scurry.cwd, {
        ...this.opts,
        maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
        platform: this.platform,
        nocase: this.nocase,
        includeChildMatches: this.includeChildMatches
      }).walk()
    ];
  }
  walkSync() {
    return [
      ...new GlobWalker(this.patterns, this.scurry.cwd, {
        ...this.opts,
        maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
        platform: this.platform,
        nocase: this.nocase,
        includeChildMatches: this.includeChildMatches
      }).walkSync()
    ];
  }
  stream() {
    return new GlobStream(this.patterns, this.scurry.cwd, {
      ...this.opts,
      maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
      platform: this.platform,
      nocase: this.nocase,
      includeChildMatches: this.includeChildMatches
    }).stream();
  }
  streamSync() {
    return new GlobStream(this.patterns, this.scurry.cwd, {
      ...this.opts,
      maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
      platform: this.platform,
      nocase: this.nocase,
      includeChildMatches: this.includeChildMatches
    }).streamSync();
  }
  /**
   * Default sync iteration function. Returns a Generator that
   * iterates over the results.
   */
  iterateSync() {
    return this.streamSync()[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.iterateSync();
  }
  /**
   * Default async iteration function. Returns an AsyncGenerator that
   * iterates over the results.
   */
  iterate() {
    return this.stream()[Symbol.asyncIterator]();
  }
  [Symbol.asyncIterator]() {
    return this.iterate();
  }
};

// packages/core/node_modules/glob/dist/esm/has-magic.js
var hasMagic = (pattern, options = {}) => {
  if (!Array.isArray(pattern)) {
    pattern = [pattern];
  }
  for (const p of pattern) {
    if (new Minimatch(p, options).hasMagic())
      return true;
  }
  return false;
};

// packages/core/node_modules/glob/dist/esm/index.js
function globStreamSync(pattern, options = {}) {
  return new Glob(pattern, options).streamSync();
}
function globStream(pattern, options = {}) {
  return new Glob(pattern, options).stream();
}
function globSync(pattern, options = {}) {
  return new Glob(pattern, options).walkSync();
}
async function glob_(pattern, options = {}) {
  return new Glob(pattern, options).walk();
}
function globIterateSync(pattern, options = {}) {
  return new Glob(pattern, options).iterateSync();
}
function globIterate(pattern, options = {}) {
  return new Glob(pattern, options).iterate();
}
var streamSync = globStreamSync;
var stream = Object.assign(globStream, { sync: globStreamSync });
var iterateSync = globIterateSync;
var iterate = Object.assign(globIterate, {
  sync: globIterateSync
});
var sync = Object.assign(globSync, {
  stream: globStreamSync,
  iterate: globIterateSync
});
var glob = Object.assign(glob_, {
  glob: glob_,
  globSync,
  sync,
  globStream,
  stream,
  globStreamSync,
  streamSync,
  globIterate,
  iterate,
  globIterateSync,
  iterateSync,
  Glob,
  hasMagic,
  escape,
  unescape
});
glob.glob = glob;

// packages/core/src/adapters/codex.ts
var home3 = () => process.env.HOME || process.env.USERPROFILE || ".";
var SYSTEM_INPUT_PREFIX = /^\s*(<(recommended_plugins|environment_context|agent_skills|agents_md|system_reminder|system-reminder|user_info|git_status|skill|codex_internal_context|subagent_notification|in-app-browser-context)\b|#\s*AGENTS\.md\b)/i;
var isSystemInjectedText = (text) => SYSTEM_INPUT_PREFIX.test(text);
var codexJsonlFiles = () => {
  const base = `${home3()}/.codex/sessions`;
  if (!existsSync3(base)) return [];
  return globSync("**/*.jsonl", { cwd: base, absolute: true });
};
var extractModel = (events, currentIdx) => {
  for (let i = currentIdx - 1; i >= 0; i--) {
    const e = events[i];
    if (e?.type === "turn_context") {
      const m = e.payload?.model || e.payload?.model_provider || e.payload?.session?.model;
      if (m) return String(m);
    }
  }
  return null;
};
var collectSessionModels = (events) => {
  const out = [];
  for (let i = 0; i < events.length; i++) {
    const m = extractModel(events, i + 1);
    if (m) out.push(m);
  }
  return [...new Set(out)];
};
var withResolvedModel = (msg, sessionModels) => {
  const r = resolveModel({ rawModelId: msg.modelId, agentId: "codex", sessionModels });
  return {
    ...msg,
    modelId: r.canonicalModelId,
    rawModelId: r.rawModelId,
    modelConfidence: r.confidence
  };
};
var contentPartsText = (content) => {
  if (typeof content === "string") {
    return isSystemInjectedText(content) ? null : content;
  }
  if (!Array.isArray(content)) {
    if (content && typeof content === "object" && typeof content.text === "string") {
      const t = content.text;
      return isSystemInjectedText(t) ? null : t;
    }
    return null;
  }
  const parts = [];
  for (const c of content) {
    if (!c || typeof c !== "object") continue;
    const t = c.text ?? c.value;
    if (typeof t !== "string" || !t.trim()) continue;
    if (c.type && c.type !== "input_text" && c.type !== "text" && c.type !== "output_text") continue;
    if (isSystemInjectedText(t)) continue;
    parts.push(t);
  }
  if (parts.length === 0) return null;
  return parts.join(" ");
};
var userMessage = (payload) => {
  if (!payload) return null;
  if (payload.type === "user_message") {
    const m = payload.message;
    if (typeof m === "string" && m.trim()) {
      return isSystemInjectedText(m) ? null : m;
    }
    if (m && typeof m === "object") {
      const fromObj = contentPartsText(m.content);
      if (fromObj) return fromObj;
      if (typeof m.text === "string" && m.text.trim()) {
        return isSystemInjectedText(m.text) ? null : m.text;
      }
    }
    if (typeof payload.text === "string" && payload.text.trim()) {
      return isSystemInjectedText(payload.text) ? null : payload.text;
    }
    if (typeof payload.content === "string" && payload.content.trim()) {
      return isSystemInjectedText(payload.content) ? null : payload.content;
    }
    return contentPartsText(payload.content);
  }
  if (payload.type === "message" && payload.role === "user") {
    return contentPartsText(payload.content);
  }
  if (payload.type === "message" && payload.message?.role === "user") {
    return contentPartsText(payload.message.content);
  }
  return null;
};
var normalizeKey = (s) => s.replace(/\s+/g, " ").trim();
var scanCodexFromText = (text, sourceFile) => {
  const messages = [];
  const lines = text.split(/\r?\n/).filter(Boolean);
  const events = lines.map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  }).filter(Boolean);
  const sessionModels = collectSessionModels(events);
  const primaryCounts = /* @__PURE__ */ new Map();
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e?.type !== "event_msg") continue;
    const payload = e.payload || e;
    if (payload.type !== "user_message") continue;
    const txt = userMessage(payload);
    if (!txt || typeof txt !== "string") continue;
    const key = normalizeKey(txt);
    primaryCounts.set(key, (primaryCounts.get(key) ?? 0) + 1);
    const modelId = extractModel(events, i);
    const ts = new Date(e.timestamp || payload.timestamp || Date.now()).getTime();
    messages.push(withResolvedModel({
      id: `${sourceFile}:event:${i}`,
      agentId: "codex",
      modelId,
      role: "user",
      content: txt,
      timestamp: Number.isFinite(ts) ? ts : Date.now(),
      sourceFile
    }, sessionModels));
  }
  const remainingPrimaryMirrors = new Map(primaryCounts);
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e?.type !== "response_item") continue;
    const payload = e.payload || e;
    const isUser = payload.type === "message" && payload.role === "user" || payload.type === "message" && payload.message?.role === "user";
    if (!isUser) continue;
    const txt = userMessage(payload);
    if (!txt || typeof txt !== "string") continue;
    const key = normalizeKey(txt);
    const mirrorCount = remainingPrimaryMirrors.get(key) ?? 0;
    if (mirrorCount > 0) {
      remainingPrimaryMirrors.set(key, mirrorCount - 1);
      continue;
    }
    const modelId = extractModel(events, i);
    const ts = new Date(e.timestamp || payload.timestamp || Date.now()).getTime();
    messages.push(withResolvedModel({
      id: `${sourceFile}:response:${i}`,
      agentId: "codex",
      modelId,
      role: "user",
      content: txt,
      timestamp: Number.isFinite(ts) ? ts : Date.now(),
      sourceFile
    }, sessionModels));
  }
  return messages;
};
var scanCodex = () => {
  const messages = [];
  const cache = scanCacheSlot.current;
  const files = codexJsonlFiles();
  const seen = /* @__PURE__ */ new Set();
  for (const file of files) {
    const key = `codex:${file}`;
    seen.add(key);
    if (cache) {
      const fp = fingerprintFile(file);
      if (fp) {
        const hit = cache.get(key, fp);
        if (hit) {
          messages.push(...hit);
          continue;
        }
        let content2;
        try {
          content2 = readFileSync3(file, "utf-8");
        } catch {
          continue;
        }
        const parsed = scanCodexFromText(content2, file);
        cache.set(key, fp, parsed);
        messages.push(...parsed);
        continue;
      }
    }
    let content;
    try {
      content = readFileSync3(file, "utf-8");
    } catch {
      continue;
    }
    messages.push(...scanCodexFromText(content, file));
  }
  cache?.prune("codex:", seen);
  return messages;
};

// packages/core/src/adapters/kimi.ts
import { readFileSync as readFileSync4, existsSync as existsSync4 } from "node:fs";
var home4 = () => process.env.HOME || process.env.USERPROFILE || ".";
var kimWireFiles = () => {
  const base = `${home4()}/.kimi-code/sessions`;
  if (!existsSync4(base)) return [];
  return globSync("**/agents/main/wire.jsonl", { cwd: base, absolute: true });
};
var contentText = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((c) => c.text || c.value || "").join(" ");
  if (content?.text) return content.text;
  if (content?.value) return content.value;
  return null;
};
var wireModel = (events, currentIdx) => {
  for (let i = currentIdx - 1; i >= 0; i--) {
    const e = events[i];
    if (e?.type === "model_change") return e.modelId || e.model || e.provider || null;
  }
  return null;
};
var isRealUser = (e) => {
  if (e?.type === "context.append_message" || e?.type === "message") {
    const originKind = e.message?.origin?.kind || e.origin?.kind;
    return e.message?.role === "user" && originKind === "user";
  }
  return false;
};
var scanKimiFromText = (text, sourceFile) => {
  const messages = [];
  const lines = text.split(/\r?\n/).filter(Boolean);
  const events = lines.map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  }).filter(Boolean);
  const sessionModels = [...new Set(
    events.map((_, i) => wireModel(events, i + 1)).filter((m) => Boolean(m))
  )];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (!isRealUser(e)) continue;
    const txt = contentText(e.message?.content);
    if (!txt) continue;
    const ts = typeof e.time === "number" ? e.time : new Date(e.timestamp || e.time || Date.now()).getTime();
    const raw = wireModel(events, i);
    const r = resolveModel({ rawModelId: raw, agentId: "kimi", sessionModels });
    messages.push({
      id: `${sourceFile}:${i}`,
      agentId: "kimi",
      modelId: r.canonicalModelId,
      rawModelId: r.rawModelId,
      modelConfidence: r.confidence,
      role: "user",
      content: txt,
      timestamp: Number.isFinite(ts) ? ts : Date.now(),
      sourceFile
    });
  }
  return messages;
};
var scanKimi = () => {
  const out = [];
  const cache = scanCacheSlot.current;
  const seen = /* @__PURE__ */ new Set();
  for (const file of kimWireFiles()) {
    const key = `kimi:${file}`;
    seen.add(key);
    if (cache) {
      const fp = fingerprintFile(file);
      if (fp) {
        const hit = cache.get(key, fp);
        if (hit) {
          out.push(...hit);
          continue;
        }
        let content2;
        try {
          content2 = readFileSync4(file, "utf-8");
        } catch {
          continue;
        }
        const parsed = scanKimiFromText(content2, file);
        cache.set(key, fp, parsed);
        out.push(...parsed);
        continue;
      }
    }
    let content;
    try {
      content = readFileSync4(file, "utf-8");
    } catch {
      continue;
    }
    out.push(...scanKimiFromText(content, file));
  }
  cache?.prune("kimi:", seen);
  return out;
};

// packages/core/src/adapters/piagent.ts
import { readFileSync as readFileSync5, existsSync as existsSync5 } from "node:fs";
var home5 = () => process.env.HOME || process.env.USERPROFILE || ".";
var piSessionFiles = () => {
  const base = `${home5()}/.pi/agent/sessions`;
  if (!existsSync5(base)) return [];
  return globSync("**/*.jsonl", { cwd: base, absolute: true });
};
var contentText2 = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((c) => c.text || c.value || "").join(" ");
  if (content?.text) return content.text;
  if (content?.value) return content.value;
  return null;
};
var piModel = (events, currentIdx) => {
  for (let i = currentIdx - 1; i >= 0; i--) {
    const e = events[i];
    if (e?.type === "model_change") return e.modelId || e.model || e.provider || null;
  }
  return null;
};
var scanPiAgentFromText = (text, sourceFile) => {
  const messages = [];
  const lines = text.split(/\r?\n/).filter(Boolean);
  const events = lines.map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  }).filter(Boolean);
  const sessionModels = [...new Set(
    events.map((_, i) => piModel(events, i + 1)).filter((m) => Boolean(m))
  )];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e?.type !== "message") continue;
    const role = e.message?.role;
    if (role !== "user") continue;
    const txt = contentText2(e.message?.content);
    if (!txt) continue;
    const ts = new Date(e.timestamp || Date.now()).getTime();
    const r = resolveModel({ rawModelId: piModel(events, i), agentId: "piagent", sessionModels });
    messages.push({
      id: `${sourceFile}:${i}`,
      agentId: "piagent",
      modelId: r.canonicalModelId,
      rawModelId: r.rawModelId,
      modelConfidence: r.confidence,
      role: "user",
      content: txt,
      timestamp: Number.isFinite(ts) ? ts : Date.now(),
      sourceFile
    });
  }
  return messages;
};
var scanPiAgent = () => {
  const out = [];
  const cache = scanCacheSlot.current;
  const seen = /* @__PURE__ */ new Set();
  for (const file of piSessionFiles()) {
    const key = `piagent:${file}`;
    seen.add(key);
    if (cache) {
      const fp = fingerprintFile(file);
      if (fp) {
        const hit = cache.get(key, fp);
        if (hit) {
          out.push(...hit);
          continue;
        }
        let content2;
        try {
          content2 = readFileSync5(file, "utf-8");
        } catch {
          continue;
        }
        const parsed = scanPiAgentFromText(content2, file);
        cache.set(key, fp, parsed);
        out.push(...parsed);
        continue;
      }
    }
    let content;
    try {
      content = readFileSync5(file, "utf-8");
    } catch {
      continue;
    }
    out.push(...scanPiAgentFromText(content, file));
  }
  cache?.prune("piagent:", seen);
  return out;
};

// packages/core/src/adapters/grok.ts
import { readFileSync as readFileSync6, existsSync as existsSync6 } from "node:fs";
import { dirname as dirname3, join as join3 } from "node:path";
var home6 = () => process.env.HOME || process.env.USERPROFILE || ".";
var contentText3 = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const parts = content.map((c) => typeof c === "string" ? c : c?.text || c?.value || "").filter(Boolean);
    return parts.length ? parts.join(" ") : null;
  }
  if (content && typeof content === "object" && typeof content.text === "string") {
    return content.text;
  }
  return null;
};
var hasSystemWrapper = (text) => /<(user_info|rules|agent_skills|system_reminder|system-reminder|skill|environment_context|agents_md|recommended_plugins)\b/i.test(
  text
);
var preferUserQuery = (text) => {
  const m = text.match(/<user_query>\s*([\s\S]*?)\s*<\/user_query>/i);
  if (m?.[1]?.trim()) return m[1].trim();
  if (hasSystemWrapper(text)) return "";
  return text;
};
var sessionModelId = (chatHistoryFile) => {
  try {
    const summaryPath = join3(dirname3(chatHistoryFile), "summary.json");
    if (!existsSync6(summaryPath)) return null;
    const s = JSON.parse(readFileSync6(summaryPath, "utf-8"));
    return s.current_model_id || s.model_id || s.modelId || null;
  } catch {
    return null;
  }
};
var grokChatHistoryFiles = () => {
  const base = `${home6()}/.grok/sessions`;
  if (!existsSync6(base)) return [];
  return globSync("**/chat_history.jsonl", { cwd: base, absolute: true });
};
var grokPromptHistoryFiles = () => {
  const base = `${home6()}/.grok/sessions`;
  if (!existsSync6(base)) return [];
  return globSync("**/prompt_history.jsonl", { cwd: base, absolute: true });
};
var normalizeKey2 = (s) => s.replace(/\s+/g, " ").trim();
var scanGrokFromText = (text, sourceFile, opts) => {
  const messages = [];
  const lines = text.split(/\r?\n/).filter(Boolean);
  const events = lines.map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  }).filter(Boolean);
  const modelId = opts?.modelId ?? null;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const isUser = e?.type === "user" || e?.role === "user" || e?.message?.role === "user" || e?.message?.type === "user";
    if (!isUser) continue;
    if (e.synthetic_reason || e.syntheticReason) continue;
    let raw = contentText3(e.content) ?? contentText3(e.message?.content) ?? (typeof e.prompt === "string" ? e.prompt : null);
    if (!raw) continue;
    const txt = preferUserQuery(raw);
    if (!txt.trim()) continue;
    const ts = new Date(
      e.timestamp || e.time || e.created_at || e.createdAt || Date.now()
    ).getTime();
    const rawModel = e.modelId || e.model || modelId || null;
    const r = resolveModel({ rawModelId: rawModel, agentId: "grok", sessionModels: [modelId] });
    messages.push({
      id: `${sourceFile}:${i}`,
      agentId: "grok",
      modelId: r.canonicalModelId,
      rawModelId: r.rawModelId,
      modelConfidence: r.confidence,
      role: "user",
      content: txt,
      timestamp: Number.isFinite(ts) ? ts : Date.now(),
      sourceFile
    });
  }
  return messages;
};
var scanGrokPromptHistoryFromText = (text, sourceFile, opts) => {
  const messages = [];
  const lines = text.split(/\r?\n/).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    let e;
    try {
      e = JSON.parse(lines[i]);
    } catch {
      continue;
    }
    if (e?.is_bash) continue;
    const txt = typeof e?.prompt === "string" ? e.prompt : null;
    if (!txt?.trim()) continue;
    const sessionId = typeof e.session_id === "string" ? e.session_id : "";
    const key = `${sessionId}:${normalizeKey2(txt)}`;
    const mirroredCount = opts?.mirroredCounts?.get(key) ?? 0;
    if (mirroredCount > 0) {
      opts?.mirroredCounts?.set(key, mirroredCount - 1);
      continue;
    }
    const ts = new Date(e.timestamp || Date.now()).getTime();
    const raw = opts?.modelBySession?.get(sessionId) ?? opts?.modelId ?? null;
    const r = resolveModel({ rawModelId: raw, agentId: "grok", sessionModels: [opts?.modelId] });
    messages.push({
      id: `${sourceFile}:prompt:${i}`,
      agentId: "grok",
      modelId: r.canonicalModelId,
      rawModelId: r.rawModelId,
      modelConfidence: r.confidence,
      role: "user",
      content: txt,
      timestamp: Number.isFinite(ts) ? ts : Date.now(),
      sourceFile
    });
  }
  return messages;
};
var scanGrok = () => {
  const out = [];
  const cache = scanCacheSlot.current;
  const seen = /* @__PURE__ */ new Set();
  const mirroredByProject = /* @__PURE__ */ new Map();
  const modelsByProject = /* @__PURE__ */ new Map();
  const readCached = (key, parse) => {
    seen.add(key);
    if (cache) {
      const file = key.slice(key.indexOf(":") + 1);
      const fp = fingerprintFile(file);
      if (fp) {
        const hit = cache.get(key, fp);
        if (hit) return hit;
        const parsed = parse();
        cache.set(key, fp, parsed);
        return parsed;
      }
    }
    return parse();
  };
  for (const file of grokChatHistoryFiles()) {
    const modelId = sessionModelId(file);
    const msgs = readCached(`grok:${file}`, () => {
      let content;
      try {
        content = readFileSync6(file, "utf-8");
      } catch {
        return [];
      }
      return scanGrokFromText(content, file, { modelId });
    });
    const sessionDir = dirname3(file);
    const sessionId = sessionDir.split("/").pop() || "";
    const projectDir = dirname3(sessionDir);
    let mirroredCounts = mirroredByProject.get(projectDir);
    if (!mirroredCounts) {
      mirroredCounts = /* @__PURE__ */ new Map();
      mirroredByProject.set(projectDir, mirroredCounts);
    }
    let modelBySession = modelsByProject.get(projectDir);
    if (!modelBySession) {
      modelBySession = /* @__PURE__ */ new Map();
      modelsByProject.set(projectDir, modelBySession);
    }
    modelBySession.set(sessionId, modelId);
    for (const m of msgs) {
      const key = `${sessionId}:${normalizeKey2(m.content)}`;
      mirroredCounts.set(key, (mirroredCounts.get(key) ?? 0) + 1);
      out.push(m);
    }
  }
  for (const file of grokPromptHistoryFiles()) {
    const projectDir = dirname3(file);
    out.push(...readCached(`grok:${file}`, () => {
      let content;
      try {
        content = readFileSync6(file, "utf-8");
      } catch {
        return [];
      }
      return scanGrokPromptHistoryFromText(content, file, {
        mirroredCounts: mirroredByProject.get(projectDir),
        modelBySession: modelsByProject.get(projectDir)
      });
    }));
  }
  cache?.prune("grok:", seen);
  try {
    const all = globSync("**/*.jsonl", { cwd: `${home6()}/.grok`, absolute: true });
    for (const f of all) {
      if (f.includes("/sessions/") && (f.endsWith("chat_history.jsonl") || f.endsWith("prompt_history.jsonl"))) {
        continue;
      }
      if (f.includes("/memtrace/")) continue;
      try {
        const sample = readFileSync6(f, "utf-8").slice(0, 2e3);
        if (!sample.includes('"role":"user"') && !sample.includes('"role": "user"')) continue;
        out.push(...scanGrokFromText(readFileSync6(f, "utf-8"), f));
      } catch {
      }
    }
  } catch {
  }
  return out;
};

// packages/core/src/adapters/opencode.ts
import { existsSync as existsSync7, statSync as statSync2 } from "node:fs";
var home7 = () => process.env.HOME || process.env.USERPROFILE || ".";
var openCodeDbPaths = () => {
  const candidates = [
    `${home7()}/.local/share/opencode/opencode.db`,
    `${home7()}/.opencode/opencode.db`
  ];
  return candidates.filter((p) => existsSync7(p));
};
var modelIdFromMessageData = (data) => {
  if (!data) return null;
  const m = data.model;
  if (!m) return data.modelID || data.modelId || null;
  if (typeof m === "string") return m;
  if (typeof m === "object") {
    return m.modelID || m.modelId || m.id || null;
  }
  return null;
};
var timestampFromMessage = (timeCreated, data) => {
  if (typeof timeCreated === "number" && Number.isFinite(timeCreated) && timeCreated > 0) {
    return timeCreated;
  }
  const t = data?.time?.created ?? data?.time?.updated ?? data?.timestamp;
  if (typeof t === "number" && Number.isFinite(t)) return t;
  if (typeof t === "string") {
    const n = Date.parse(t);
    if (Number.isFinite(n)) return n;
  }
  return Date.now();
};
var scanOpenCodeFromRows = (rows, sourceFile = "opencode.db", sinceMs = 0) => {
  const messages = [];
  const seen = /* @__PURE__ */ new Set();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let msg;
    let part;
    try {
      msg = typeof row.messageData === "string" ? JSON.parse(row.messageData) : row.messageData;
      part = typeof row.partData === "string" ? JSON.parse(row.partData) : row.partData;
    } catch {
      continue;
    }
    if (msg?.role !== "user") continue;
    if (part?.type !== "text") continue;
    const txt = typeof part.text === "string" ? part.text : null;
    if (!txt?.trim()) continue;
    const ts = timestampFromMessage(row.timeCreated, msg);
    if (sinceMs > 0 && ts <= sinceMs) continue;
    const key = `${row.sessionId}:${txt.replace(/\s+/g, " ").trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const raw = modelIdFromMessageData(msg);
    const r = resolveModel({ rawModelId: raw, agentId: "opencode" });
    messages.push({
      id: `${sourceFile}:${row.messageId}`,
      agentId: "opencode",
      modelId: r.canonicalModelId,
      rawModelId: r.rawModelId,
      modelConfidence: r.confidence,
      role: "user",
      content: txt,
      timestamp: ts,
      sourceFile
    });
  }
  return messages;
};
var loadDatabaseSync = () => {
  try {
    const getBuiltin = process.getBuiltinModule;
    if (typeof getBuiltin === "function") {
      const mod = getBuiltin("node:sqlite");
      if (mod?.DatabaseSync) return mod.DatabaseSync;
    }
  } catch {
  }
  return null;
};
var scanSqliteAgent = (opts) => {
  const DatabaseSync = loadDatabaseSync();
  if (!DatabaseSync) return [];
  const cache = scanCacheSlot.current;
  const cacheKey = `db:${opts.dbKey}:${opts.dbPath}`;
  let db;
  try {
    db = new DatabaseSync(opts.dbPath, { readOnly: true });
  } catch {
    return [];
  }
  try {
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name IN ('message','part')`).all();
    if (tables.length < 2) return [];
    const maxRow = db.prepare(`SELECT MAX(time_created) AS maxTc, COUNT(*) AS n FROM message`).get?.();
    const maxTc = maxRow?.maxTc ?? 0;
    let size = 0;
    let mtimeMs = 0;
    try {
      const st = statSync2(opts.dbPath);
      size = st.size;
      mtimeMs = st.mtimeMs;
    } catch {
    }
    const prior = cache?.getDb(cacheKey);
    const priorMessages = prior?.messages ?? [];
    const unchanged = prior && prior.size === size && prior.mtimeMs === mtimeMs && prior.maxTimeCreated === maxTc;
    if (unchanged) return priorMessages;
    const sinceMs = prior ? prior.maxTimeCreated : 0;
    const baseSql = `SELECT m.id AS messageId, m.session_id AS sessionId, m.time_created AS timeCreated,
                    m.data AS messageData, p.data AS partData
             FROM message m
             INNER JOIN part p ON p.message_id = m.id`;
    const rows = sinceMs > 0 ? db.prepare(`${baseSql} WHERE m.time_created > ${Math.floor(Number(sinceMs) || 0)}`).all() : db.prepare(baseSql).all();
    const fresh = opts.parseRows(rows, opts.dbPath, 0);
    const freshIds = new Set(fresh.map((m) => m.id));
    const merged = [...priorMessages.filter((m) => !freshIds.has(m.id)), ...fresh];
    cache?.setDb(cacheKey, { size, mtimeMs, maxTimeCreated: maxTc, messages: merged });
    return merged;
  } catch {
    return [];
  } finally {
    try {
      db.close();
    } catch {
    }
  }
};
var scanOpenCode = () => {
  const out = [];
  for (const path2 of openCodeDbPaths()) {
    out.push(...scanSqliteAgent({
      dbKey: "opencode",
      dbPath: path2,
      agentId: "opencode",
      parseRows: (rows, src, since) => scanOpenCodeFromRows(rows, src, since)
    }));
  }
  return out;
};

// packages/core/src/adapters/zcode.ts
import { existsSync as existsSync8 } from "node:fs";
var home8 = () => process.env.HOME || process.env.USERPROFILE || ".";
var zcodeDbPaths = () => {
  const candidates = [`${home8()}/.zcode/cli/db/db.sqlite`];
  return candidates.filter((p) => existsSync8(p));
};
var isSystemInjected = (msg, sessionId) => {
  if (msg?.synthetic === true || msg?.synthetic === 1) return true;
  const origin = msg?.semantics?.origin ?? msg?.origin?.kind ?? msg?.origin;
  if (typeof origin === "string" && /agent_runtime|system|runtime|subagent|tool/i.test(origin)) {
    return true;
  }
  const source = msg?.metadata?.source ?? msg?.semantics?.source ?? msg?.semantics?.kind;
  if (typeof source === "string" && /reminder|system|snapshot|hook|summary|plan_file|subagent|delegate/i.test(source)) {
    return true;
  }
  if (typeof sessionId === "string" && /subagent|agent_runtime/i.test(sessionId)) return true;
  const agent = msg?.agent ?? msg?.agentId ?? msg?.agent_id;
  if (typeof agent === "string" && /subagent|explore|worker/i.test(agent)) return true;
  return false;
};
var scanZcodeFromRows = (rows, sourceFile = "zcode.db", sinceMs = 0) => {
  const messages = [];
  const seen = /* @__PURE__ */ new Set();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let msg;
    let part;
    try {
      msg = typeof row.messageData === "string" ? JSON.parse(row.messageData) : row.messageData;
      part = typeof row.partData === "string" ? JSON.parse(row.partData) : row.partData;
    } catch {
      continue;
    }
    if (msg?.role !== "user") continue;
    if (part?.type !== "text") continue;
    if (isSystemInjected(msg, row.sessionId)) continue;
    const txt = typeof part.text === "string" ? part.text : null;
    if (!txt?.trim()) continue;
    const ts = timestampFromMessage(row.timeCreated, msg);
    if (sinceMs > 0 && ts <= sinceMs) continue;
    const key = `${row.sessionId}:${txt.replace(/\s+/g, " ").trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const raw = modelIdFromMessageData(msg);
    const r = resolveModel({ rawModelId: raw, agentId: "zcode" });
    messages.push({
      id: `${sourceFile}:${row.messageId}`,
      agentId: "zcode",
      modelId: r.canonicalModelId,
      rawModelId: r.rawModelId,
      modelConfidence: r.confidence,
      role: "user",
      content: txt,
      timestamp: ts,
      sourceFile
    });
  }
  return messages;
};
var scanZcode = () => {
  const out = [];
  for (const path2 of zcodeDbPaths()) {
    out.push(...scanSqliteAgent({
      dbKey: "zcode",
      dbPath: path2,
      agentId: "zcode",
      parseRows: (rows, src, since) => scanZcodeFromRows(rows, src, since)
    }));
  }
  return out;
};

// packages/core/src/device.ts
import { chmodSync, existsSync as existsSync9, mkdirSync as mkdirSync3, readFileSync as readFileSync7, renameSync as renameSync3, writeFileSync as writeFileSync3 } from "node:fs";
import { dirname as dirname4, join as join4 } from "node:path";
var DEFAULT_SERVER = "https://dumbai.spur.best";
var ADJECTIVES = ["\u51B7\u9759", "\u66B4\u8E81", "\u4F5B\u7CFB", "\u6C89\u9ED8", "\u901A\u5BB5", "\u514B\u5236", "\u6DF1\u591C"];
var NOUNS = ["\u9ED1\u5323", "\u8C03\u8BD5\u8005", "\u952E\u76D8\u4FA0", "\u65E5\u5FD7\u730E\u4EBA", "\u6A21\u578B\u9A6F\u517D\u5E08", "\u6392\u884C\u699C\u5E7D\u7075"];
var randomNickname = () => {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const b = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${a}${b}`;
};
var defaultDevicePath = () => {
  const home9 = process.env.HOME || process.env.USERPROFILE || ".";
  return join4(home9, ".idiot-ai", "device.json");
};
var isIdentity = (v) => {
  if (!v || typeof v !== "object") return false;
  const o = v;
  return typeof o.deviceId === "string" && /^[a-f0-9]{32}$/i.test(o.deviceId) && typeof o.publicKey === "string" && /^[a-f0-9]{64}$/i.test(o.publicKey) && typeof o.privateKey === "string" && /^[a-f0-9]{64}$/i.test(o.privateKey) && typeof o.nickname === "string";
};
var writeIdentity = (path2, identity) => {
  mkdirSync3(dirname4(path2), { recursive: true });
  const tempPath = `${path2}.tmp`;
  writeFileSync3(tempPath, `${JSON.stringify(identity, null, 2)}
`, { mode: 384 });
  renameSync3(tempPath, path2);
  chmodSync(path2, 384);
};
var loadOrCreateDevice = async (path2 = defaultDevicePath()) => {
  if (existsSync9(path2)) {
    try {
      const raw = JSON.parse(readFileSync7(path2, "utf-8"));
      if (isIdentity(raw)) {
        const normalized = {
          deviceId: raw.deviceId,
          publicKey: raw.publicKey,
          privateKey: raw.privateKey,
          nickname: raw.nickname || randomNickname(),
          serverUrl: typeof raw.serverUrl === "string" && raw.serverUrl ? raw.serverUrl : DEFAULT_SERVER,
          createdAt: typeof raw.createdAt === "string" ? raw.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
        };
        if (!raw.serverUrl || !raw.createdAt || !raw.updatedAt || !raw.nickname) {
          writeIdentity(path2, normalized);
        }
        return normalized;
      }
    } catch (error) {
      throw new Error(
        `Cannot load device identity at ${path2}; refusing to rotate the anonymous account. Repair or restore this file, then retry.`,
        { cause: error }
      );
    }
    throw new Error(
      `Invalid device identity at ${path2}; refusing to rotate the anonymous account. Repair or restore this file, then retry.`
    );
  }
  const keys = await generateDevice();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const identity = {
    deviceId: keys.deviceId,
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
    nickname: randomNickname(),
    serverUrl: DEFAULT_SERVER,
    createdAt: now,
    updatedAt: now
  };
  writeIdentity(path2, identity);
  return identity;
};

// packages/core/src/scan.ts
var scanAllMessages = () => [
  ...scanCodex(),
  ...scanKimi(),
  ...scanPiAgent(),
  ...scanGrok(),
  ...scanOpenCode(),
  ...scanZcode()
];
var scanAll = (now = /* @__PURE__ */ new Date(), opts = {}) => {
  const started = Date.now();
  const incremental = opts.incremental !== false;
  if (incremental) {
    scanCacheSlot.current = new ScanCache();
  }
  try {
    const messages = scanAllMessages();
    const events = eventsFromMessages(messages);
    const messageStats = messageStatsFromMessages(messages);
    const summaries = buildPeriodSummaries(events, messageStats, now);
    return {
      messages,
      events,
      messageStats,
      summaries,
      scannedAt: now.toISOString(),
      scanDurationMs: Date.now() - started
    };
  } finally {
    if (incremental) {
      scanCacheSlot.current?.flush();
      scanCacheSlot.current = null;
    }
  }
};

// packages/core/scripts/skill.ts
var MAX_PENDING_AGE_MS = 15 * 60 * 1e3;
var defaultPendingPath = () => join5(dirname5(defaultDevicePath()), "pending-upload.json");
var printJson = (value) => {
  process.stdout.write(`${JSON.stringify(value)}
`);
};
var usage = () => {
  process.stdout.write(
    [
      "Usage:",
      "  npm run skill -- scan [--pending <path>]",
      "  npm run skill -- upload [--pending <path>]",
      "",
      "scan writes an aggregate-only, signed pending snapshot. upload sends that exact snapshot."
    ].join("\n") + "\n"
  );
};
var parseArgs = () => {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    usage();
    process.exit(0);
  }
  const [rawCommand] = args;
  if (rawCommand !== "scan" && rawCommand !== "upload") {
    usage();
    throw new Error('Expected command "scan" or "upload".');
  }
  const pendingIndex = args.indexOf("--pending");
  if (pendingIndex !== -1 && !args[pendingIndex + 1]) {
    throw new Error("Expected a file path after --pending.");
  }
  return { command: rawCommand, pendingPath: pendingIndex === -1 ? defaultPendingPath() : args[pendingIndex + 1] };
};
var writePending = (path2, snapshot) => {
  mkdirSync4(dirname5(path2), { recursive: true });
  const temporaryPath = `${path2}.tmp`;
  writeFileSync4(temporaryPath, `${JSON.stringify(snapshot)}
`, { mode: 384 });
  renameSync4(temporaryPath, path2);
  chmodSync2(path2, 384);
};
var isSnapshot = (value) => {
  if (!value || typeof value !== "object") return false;
  const snapshot = value;
  return snapshot.schemaVersion === 5 && typeof snapshot.deviceId === "string" && /^[a-f0-9]{32}$/i.test(snapshot.deviceId) && typeof snapshot.signature === "string" && typeof snapshot.scannedAt === "string" && !!snapshot.periods && !!snapshot.byAgent && !!snapshot.byModel && !!snapshot.byWord && Array.isArray(snapshot.byHitForm) && Array.isArray(snapshot.byDay) && !!snapshot.modelMessages;
};
var readPending = (path2) => {
  if (!existsSync10(path2)) {
    throw new Error("No pending scan is available. Run the Skill scan first.");
  }
  let parsed;
  try {
    parsed = JSON.parse(readFileSync8(path2, "utf-8"));
  } catch (error) {
    throw new Error(`Cannot read pending scan at ${path2}. Run the Skill scan again.`, { cause: error });
  }
  if (!isSnapshot(parsed)) throw new Error("Pending scan format is invalid. Run the Skill scan again.");
  const age = Date.now() - Date.parse(parsed.scannedAt);
  if (!Number.isFinite(age) || age < 0 || age > MAX_PENDING_AGE_MS) {
    throw new Error("Pending scan expired after 15 minutes. Run the Skill again before uploading.");
  }
  return parsed;
};
var endpointFor = (serverUrl) => serverUrl.includes("/api/") ? serverUrl : `${serverUrl.replace(/\/$/, "")}/api/v1/ingest`;
var siteUrlFor = (endpoint) => new URL(endpoint).origin;
var scan = async (pendingPath) => {
  const device = await loadOrCreateDevice();
  try {
    hydrateModelCatalogFromCache();
    await pullModelCatalog({ serverUrl: device.serverUrl });
  } catch {
  }
  const result = scanAll();
  const catalogVersion = getActiveModelCatalog().version;
  const snapshot = await buildSignedUploadV5(
    device,
    result.summaries,
    result.events,
    result.messageStats,
    result.scannedAt,
    catalogVersion
  );
  writePending(pendingPath, snapshot);
  const topModel = topModelRage(result.summaries.all.byModel, { limit: 1 })[0] ?? null;
  const topWord = result.summaries.all.byHitForm[0] ? {
    text: result.summaries.all.byHitForm[0].text,
    wordId: result.summaries.all.byHitForm[0].wordId,
    count: result.summaries.all.byHitForm[0].count,
    severity: result.summaries.all.byHitForm[0].severity
  } : null;
  const provisional = Object.keys(result.summaries.all.byModel).filter((id) => id.startsWith("p:")).map((modelId) => ({
    modelId,
    score: result.summaries.all.byModel[modelId]?.score ?? 0,
    messageCount: result.summaries.all.modelMessages[modelId] ?? 0
  })).sort((a, b) => b.messageCount - a.messageCount).slice(0, 10);
  const periods = Object.fromEntries(
    PERIOD_KEYS.map((period) => {
      const value = result.summaries[period];
      return [period, { mild: value.mild, severe: value.severe, score: value.score }];
    })
  );
  printJson({
    status: "scan_ready",
    deviceId: device.deviceId,
    nickname: device.nickname,
    scannedAt: result.scannedAt,
    modelCatalogVersion: catalogVersion,
    messages: result.messages.length,
    matches: result.events.length,
    periods,
    topModel: topModel ? { modelId: topModel.modelId, rage: topModel.rage, score: topModel.score, messageCount: topModel.messageCount } : null,
    topWord,
    provisionalModels: provisional,
    pendingPath
  });
};
var upload = async (pendingPath) => {
  const snapshot = readPending(pendingPath);
  const device = await loadOrCreateDevice();
  if (device.deviceId !== snapshot.deviceId) {
    throw new Error("Pending scan belongs to another device identity. Run the Skill scan again.");
  }
  const endpoint = endpointFor(process.env.IDIOT_AI_URL || device.serverUrl || "https://dumbai.spur.best");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(snapshot)
  });
  let body;
  try {
    body = await response.json();
  } catch {
    body = { message: await response.text().catch(() => "") };
  }
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status}): ${JSON.stringify(body)}`);
  }
  rmSync(pendingPath, { force: true });
  const siteUrl = siteUrlFor(endpoint);
  printJson({
    status: "uploaded",
    scannedAt: snapshot.scannedAt,
    siteUrl,
    allPeopleUrl: `${siteUrl}/dashboard?view=all`,
    personalUrl: `${siteUrl}/dashboard?view=personal&device=${snapshot.deviceId}`,
    response: body
  });
};
var main = async () => {
  const { command, pendingPath } = parseArgs();
  if (command === "scan") await scan(pendingPath);
  else await upload(pendingPath);
};
main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  printJson({ status: "error", message });
  process.exit(1);
});
/*! Bundled license information:

@noble/ed25519/index.js:
  (*! noble-ed25519 - MIT License (c) 2019 Paul Miller (paulmillr.com) *)
*/
