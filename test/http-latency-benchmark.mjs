import { performance } from "node:perf_hooks";

const args = process.argv.slice(2);

function readArg(name, fallback) {
  const prefix = `--${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function readHeaderArgs() {
  return args
    .filter((arg) => arg.startsWith("--header="))
    .map((arg) => arg.slice("--header=".length))
    .map((raw) => {
      const separator = raw.indexOf(":");
      if (separator === -1) {
        throw new Error(`Header khong hop le: ${raw}`);
      }
      const key = raw.slice(0, separator).trim();
      const value = raw.slice(separator + 1).trim();
      return [key, value];
    });
}

function percentile(sortedValues, p) {
  if (!sortedValues.length) return 0;
  const index = Math.ceil((p / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value) {
  return Number(value.toFixed(2));
}

const url = readArg("url");
if (!url) {
  console.error("Thieu tham so --url=http://...");
  process.exit(1);
}

const method = readArg("method", "GET").toUpperCase();
const totalRequests = Number(readArg("requests", "200"));
const concurrency = Number(readArg("concurrency", "20"));
const warmupRequests = Number(readArg("warmup", "20"));
const timeoutMs = Number(readArg("timeout", "15000"));
const body = readArg("body");

if (!Number.isFinite(totalRequests) || totalRequests <= 0) {
  throw new Error("--requests phai > 0");
}

if (!Number.isFinite(concurrency) || concurrency <= 0) {
  throw new Error("--concurrency phai > 0");
}

const headers = Object.fromEntries(readHeaderArgs());

async function fetchOnce() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });
    await response.text();
    return {
      ok: response.ok,
      status: response.status,
      durationMs: performance.now() - startedAt,
    };
  } catch (error) {
    return {
      ok: false,
      status: error?.name === "AbortError" ? "TIMEOUT" : "ERROR",
      durationMs: performance.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function warmup() {
  for (let i = 0; i < warmupRequests; i += 1) {
    await fetchOnce();
  }
}

async function main() {
  console.log(`Benchmark ${method} ${url}`);
  console.log(
    `Cau hinh: requests=${totalRequests}, concurrency=${concurrency}, warmup=${warmupRequests}, timeoutMs=${timeoutMs}`
  );

  await warmup();

  let nextRequest = 0;
  const durations = [];
  const statusCounts = new Map();
  let successCount = 0;
  let failureCount = 0;
  const startedAt = performance.now();

  async function worker() {
    while (true) {
      const current = nextRequest;
      nextRequest += 1;
      if (current >= totalRequests) {
        return;
      }

      const result = await fetchOnce();
      durations.push(result.durationMs);
      statusCounts.set(
        String(result.status),
        (statusCounts.get(String(result.status)) ?? 0) + 1
      );

      if (result.ok) {
        successCount += 1;
      } else {
        failureCount += 1;
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, totalRequests) }, () => worker())
  );

  const totalDurationMs = performance.now() - startedAt;
  const sorted = [...durations].sort((a, b) => a - b);
  const requestsPerSecond = totalRequests / (totalDurationMs / 1000);

  const summary = {
    url,
    method,
    totalRequests,
    concurrency,
    warmupRequests,
    successCount,
    failureCount,
    totalDurationMs: round(totalDurationMs),
    requestsPerSecond: round(requestsPerSecond),
    latencyMs: {
      min: round(sorted[0] ?? 0),
      avg: round(average(sorted)),
      p50: round(percentile(sorted, 50)),
      p90: round(percentile(sorted, 90)),
      p95: round(percentile(sorted, 95)),
      p99: round(percentile(sorted, 99)),
      max: round(sorted[sorted.length - 1] ?? 0),
    },
    statusCounts: Object.fromEntries(
      [...statusCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    ),
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
