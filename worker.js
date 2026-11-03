// Raw URL of the error page on GitHub (use the self-contained cloudflare.html).
const PAGE_URL = "https://raw.githubusercontent.com/RAB-Media/502-Error/refs/heads/main/cloudflare.html"

async function errorPage() {
  let html = "<h1>502 - Site Offline</h1>";
  try {
    // Cached at Cloudflare's edge for 5 minutes so GitHub isn't hit on every error.
    const res = await fetch(PAGE_URL, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (res.ok) html = await res.text();
  } catch (err) {}
  return new Response(html, { status: 502, headers: { "content-type": "text/html;charset=UTF-8" } });
}

export default {
  async fetch(request) {
    let response;
    try {
      response = await fetch(request);
    } catch (err) {
      // Tunnel or origin completely unreachable (connection refused, DNS failure, etc.)
      return errorPage();
    }
    // Show the error page for any 5xx server error:
    // 500, 502, 503, 504 (origin errors) and 521-524, 530 (Cloudflare origin-down errors)
    return response.status >= 500 ? errorPage() : response;
  },
};
