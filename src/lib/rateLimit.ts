import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

export type RateLimitConfig = {
  requests: number;
  window: "1 s" | "10 s" | "1 m" | "10 m" | "1 h";
  key: string;
};

const limiterMap = new Map<string, Ratelimit>();

export function getRateLimiter(key: string, config: RateLimitConfig) {
  if (!limiterMap.has(key)) {
    limiterMap.set(
      key,
      new Ratelimit({
        redis: kv,
        limiter: Ratelimit.slidingWindow(config.requests, config.window),
        prefix: key,
      })
    );
  }
  return limiterMap.get(key)!;
}

export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : request.ip ?? "127.0.0.1";

  const limiter = getRateLimiter(config.key, config);
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  const headers = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };

  if (!success) {
    return { success: false as const, headers };
  }

  return { success: true as const, headers };
}