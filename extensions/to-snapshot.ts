export type SuperGrokPeriod = "weekly" | "monthly" | "unknown";

export type SuperGrokSnapshot = {
  plan: string;
  percent: number;
  period: SuperGrokPeriod;
  resetAt: string | undefined;
  prepaidBalance: number | undefined;
};

const MAX_PLAN_CHARS = 128;
const MAX_BENIGN_PERCENT = 100.5;
const MAX_EXACT_F64_INTEGER = 9_007_199_254_740_991;

type Cent = { val?: unknown };
type UsagePeriod = {
  type?: unknown;
  start?: unknown;
  end?: unknown;
};
type BillingConfig = {
  creditUsagePercent?: unknown;
  credit_usage_percent?: unknown;
  currentPeriod?: UsagePeriod;
  current_period?: UsagePeriod;
  monthlyLimit?: Cent;
  monthly_limit?: Cent;
  used?: Cent;
  onDemandCap?: Cent;
  onDemandUsed?: Cent;
  prepaidBalance?: Cent;
  prepaid_balance?: Cent;
  isUnifiedBillingUser?: unknown;
  billingPeriodStart?: unknown;
  billingPeriodEnd?: unknown;
  billing_period_end?: unknown;
};
type BillingResponse = {
  config?: BillingConfig;
  subscription_tier?: unknown;
  subscriptionTier?: unknown;
};

export function toSnapshot(input: unknown): SuperGrokSnapshot {
  if (!input || typeof input !== "object") {
    throw new Error("Grok Build billing response has no config");
  }
  const resp = input as BillingResponse;
  const cfg = resp.config;
  if (!cfg || typeof cfg !== "object") {
    throw new Error("Grok Build billing response has no config");
  }

  const currentPeriod = cfg.currentPeriod ?? cfg.current_period;
  const plan = checkedPlan(
    asOptionalString(resp.subscription_tier) ??
      asOptionalString(resp.subscriptionTier),
  );
  const percent = resolveUsagePercent(cfg, currentPeriod);
  const period = resolvePeriod(cfg, currentPeriod);
  const resetAt = resolveResetAt(cfg, currentPeriod);
  const prepaid = cfg.prepaidBalance ?? cfg.prepaid_balance;
  const prepaidBalance =
    prepaid === undefined ? undefined : checkedPrepaid(centVal(prepaid));

  return { plan, percent, period, resetAt, prepaidBalance };
}

function checkedPlan(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    return "SuperGrok";
  }
  if (trimmed.length > MAX_PLAN_CHARS || /[\u0000-\u001f]/.test(trimmed)) {
    throw new Error("Grok Build subscription tier is invalid");
  }
  return trimmed;
}

function resolveUsagePercent(
  cfg: BillingConfig,
  currentPeriod: UsagePeriod | undefined,
): number {
  const raw = cfg.creditUsagePercent ?? cfg.credit_usage_percent;
  if (raw !== undefined && raw !== null) {
    if (typeof raw !== "number") {
      throw new Error(
        "Grok Build billing percentage is outside the supported range",
      );
    }
    return checkedPercent(raw);
  }

  if (currentPeriod) {
    return 0;
  }

  const used = cfg.used ? centVal(cfg.used) : undefined;
  const limit = cfg.monthlyLimit
    ? centVal(cfg.monthlyLimit)
    : cfg.monthly_limit
      ? centVal(cfg.monthly_limit)
      : undefined;
  if (used !== undefined && limit !== undefined) {
    if (limit > 0 && used >= 0) {
      return checkedPercent((used / limit) * 100);
    }
    throw new Error(
      "Grok Build legacy billing counters are negative or have a non-positive limit",
    );
  }

  if (
    cfg.billingPeriodEnd !== undefined ||
    cfg.billing_period_end !== undefined ||
    cfg.prepaidBalance !== undefined ||
    cfg.prepaid_balance !== undefined ||
    cfg.isUnifiedBillingUser !== undefined
  ) {
    return 0;
  }

  throw new Error(
    "Grok Build billing response has no usage percentage or coherent legacy counters",
  );
}

function checkedPercent(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > MAX_BENIGN_PERCENT) {
    throw new Error(
      "Grok Build billing percentage is outside the supported range",
    );
  }
  return Math.round(Math.min(100, Math.max(0, value)));
}

function resolvePeriod(
  cfg: BillingConfig,
  currentPeriod: UsagePeriod | undefined,
): SuperGrokPeriod {
  const raw = asOptionalString(currentPeriod?.type) ?? "";
  if (raw.endsWith("WEEKLY")) {
    return "weekly";
  }
  if (
    raw.endsWith("MONTHLY") ||
    (!currentPeriod &&
      (cfg.monthlyLimit !== undefined ||
        cfg.monthly_limit !== undefined ||
        cfg.used !== undefined ||
        cfg.billingPeriodEnd !== undefined ||
        cfg.billing_period_end !== undefined))
  ) {
    return "monthly";
  }
  return "unknown";
}

function resolveResetAt(
  cfg: BillingConfig,
  currentPeriod: UsagePeriod | undefined,
): string | undefined {
  if (currentPeriod) {
    return parseOptionalDatetime(currentPeriod.end, "currentPeriod.end");
  }
  return parseOptionalDatetime(
    cfg.billingPeriodEnd ?? cfg.billing_period_end,
    "billingPeriodEnd",
  );
}

function parseOptionalDatetime(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error(`Grok Build ${field} is not RFC 3339`);
  }
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) {
    throw new Error(`Grok Build ${field} is not RFC 3339`);
  }
  return new Date(ms).toISOString();
}

function checkedPrepaid(cents: number): number {
  if (!Number.isInteger(cents) || cents < 0 || cents > MAX_EXACT_F64_INTEGER) {
    throw new Error(
      "Grok Build prepaid balance is negative or too large to represent exactly",
    );
  }
  return cents / 100;
}

function centVal(cent: Cent): number {
  const raw = cent.val;
  if (raw === undefined || raw === null) {
    return 0;
  }
  if (typeof raw === "number") {
    if (!Number.isInteger(raw)) {
      throw new Error("cent val must be an exact i64 integer");
    }
    return raw;
  }
  if (typeof raw === "string") {
    if (!/^-?\d+$/.test(raw.trim())) {
      throw new Error("cent val string must be an exact i64 integer");
    }
    return Number.parseInt(raw.trim(), 10);
  }
  throw new Error("cent val must be an integer number or string");
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
