/**
 * Push every URL in the sitemap to IndexNow.
 *
 *   npm run indexnow
 *
 * IndexNow is a push protocol: instead of waiting to be crawled, you tell the
 * search engine a URL exists. One call to the shared endpoint notifies Bing,
 * Yandex, Naver and Seznam at once, up to 10,000 URLs per request.
 *
 * IMPORTANT — this does nothing for Google. Google evaluated IndexNow after it
 * launched in 2021 and never adopted it. Google indexing is driven by crawl
 * budget and internal links, which is what the "From the archive" rail on
 * article pages is for. This script is for the Bing side of the house, which
 * is also what feeds Copilot and DuckDuckGo.
 *
 * The key file must stay reachable at:
 *   https://www.victorsdesk.com/803cea82ef6890d490f37f2ad9762595.txt
 * That's how the engines verify you own the domain. It lives in /public.
 */

const KEY = '803cea82ef6890d490f37f2ad9762595';
const HOST = 'www.victorsdesk.com';
const SITEMAP = `https://${HOST}/sitemap.xml`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH = 10000; // IndexNow's documented maximum per request

async function readSitemap() {
  const res = await fetch(SITEMAP, { headers: { 'user-agent': 'victorsdesk-indexnow' } });
  if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status} ${res.statusText}`);
  const xml = await res.text();

  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => u.startsWith(`https://${HOST}`));

  return [...new Set(urls)];
}

async function submit(urlList) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList,
    }),
  });

  // 200 = accepted, 202 = accepted but key still being validated. Both fine.
  return { status: res.status, body: await res.text().catch(() => '') };
}

async function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));

  const urls = only.length ? only : await readSitemap();
  if (!urls.length) {
    console.log('No URLs found. Is the sitemap live?');
    return;
  }

  console.log(`Submitting ${urls.length} URL${urls.length === 1 ? '' : 's'} to IndexNow…`);

  for (let i = 0; i < urls.length; i += BATCH) {
    const chunk = urls.slice(i, i + BATCH);
    const { status, body } = await submit(chunk);

    if (status === 200 || status === 202) {
      console.log(`  ✓ ${chunk.length} accepted (HTTP ${status})`);
    } else if (status === 403) {
      console.error(`  ✗ HTTP 403 — key file not found or wrong.`);
      console.error(`    Check https://${HOST}/${KEY}.txt loads and contains exactly:\n    ${KEY}`);
      process.exitCode = 1;
    } else if (status === 422) {
      console.error(`  ✗ HTTP 422 — URLs did not match host ${HOST}.`);
      process.exitCode = 1;
    } else if (status === 429) {
      console.error(`  ✗ HTTP 429 — rate limited. Wait a while before retrying.`);
      process.exitCode = 1;
    } else {
      console.error(`  ✗ HTTP ${status} ${body.slice(0, 200)}`);
      process.exitCode = 1;
    }
  }

  console.log('\nDone. Bing typically reflects this within a day or two;');
  console.log('check Bing Webmaster Tools → URL Submission for the record.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
