export function getClientIp(req: Request): string {
  // In Vercel and many modern PAAS environments, x-real-ip is set reliably.
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // cf-connecting-ip if behind Cloudflare
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // Fallback to x-forwarded-for
  // Note: if not behind a trusted proxy, x-forwarded-for can be spoofed.
  // Vercel guarantees x-forwarded-for contains the client IP.
  // We take the first IP in the list.
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    const clientIp = ips[0]?.trim();
    if (clientIp) return clientIp;
  }

  return "127.0.0.1";
}
