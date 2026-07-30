import 'server-only';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

/**
 * Read-only access to Google Analytics 4 via a service account.
 *
 * The property ID and service account email aren't secret, so they have
 * defaults. The private key IS secret and must come from the environment —
 * without it every function here returns empty data and the UI explains why,
 * rather than the page crashing.
 */
const PROPERTY_ID = process.env.GA4_PROPERTY_ID || '547789591';
const CLIENT_EMAIL =
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
  'victorsdesk-analytics@victors-desk.iam.gserviceaccount.com';

// Vercel stores multi-line values with literal \n, so restore real newlines.
const PRIVATE_KEY = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');

export const analyticsConfigured = Boolean(PRIVATE_KEY);

let cached: BetaAnalyticsDataClient | null = null;

function client() {
  if (!analyticsConfigured) return null;
  if (!cached) {
    cached = new BetaAnalyticsDataClient({
      credentials: { client_email: CLIENT_EMAIL, private_key: PRIVATE_KEY },
    });
  }
  return cached;
}

export type Range = 'today' | '7d' | '28d' | '90d';

export const RANGES: { key: Range; label: string; startDate: string; byHour: boolean }[] = [
  { key: 'today', label: 'Today',        startDate: 'today',       byHour: true },
  { key: '7d',    label: 'Last 7 days',  startDate: '7daysAgo',    byHour: false },
  { key: '28d',   label: 'Last 28 days', startDate: '28daysAgo',   byHour: false },
  { key: '90d',   label: 'Last 90 days', startDate: '90daysAgo',   byHour: false },
];

export interface PathStat {
  path: string;
  slug: string | null;
  views: number;
  sessions: number;
  avgSeconds: number;
}

export interface TimePoint {
  label: string;
  views: number;
}

const slugFromPath = (path: string) => {
  const m = path.match(/^\/blog\/([^/?#]+)/);
  return m ? m[1] : null;
};

/** Views, sessions and engagement time per URL for the given window. */
export async function getPathStats(range: Range): Promise<PathStat[]> {
  const c = client();
  if (!c) return [];
  const cfg = RANGES.find((r) => r.key === range) ?? RANGES[1];

  const [res] = await c.runReport({
    property: `properties/${PROPERTY_ID}`,
    dateRanges: [{ startDate: cfg.startDate, endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'sessions' },
      { name: 'userEngagementDuration' },
    ],
    limit: 500,
  });

  return (res.rows ?? []).map((row) => {
    const path = row.dimensionValues?.[0]?.value ?? '';
    const views = Number(row.metricValues?.[0]?.value ?? 0);
    const sessions = Number(row.metricValues?.[1]?.value ?? 0);
    const engagement = Number(row.metricValues?.[2]?.value ?? 0);
    return {
      path,
      slug: slugFromPath(path),
      views,
      sessions,
      avgSeconds: views > 0 ? Math.round(engagement / views) : 0,
    };
  });
}

/** A time series for the whole site — hourly for today, daily otherwise. */
export async function getTimeSeries(range: Range): Promise<TimePoint[]> {
  const c = client();
  if (!c) return [];
  const cfg = RANGES.find((r) => r.key === range) ?? RANGES[1];

  const [res] = await c.runReport({
    property: `properties/${PROPERTY_ID}`,
    dateRanges: [{ startDate: cfg.startDate, endDate: 'today' }],
    dimensions: [{ name: cfg.byHour ? 'dateHour' : 'date' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ dimension: { dimensionName: cfg.byHour ? 'dateHour' : 'date' } }],
    limit: 200,
  });

  return (res.rows ?? []).map((row) => {
    const raw = row.dimensionValues?.[0]?.value ?? '';
    const views = Number(row.metricValues?.[0]?.value ?? 0);

    // dateHour is YYYYMMDDHH, date is YYYYMMDD.
    if (raw.length === 10) {
      const hour = Number(raw.slice(8, 10));
      const suffix = hour < 12 ? 'am' : 'pm';
      const display = hour % 12 === 0 ? 12 : hour % 12;
      return { label: `${display}${suffix}`, views };
    }
    const month = Number(raw.slice(4, 6));
    const day = Number(raw.slice(6, 8));
    return { label: `${month}/${day}`, views };
  });
}

/** Totals for the window: site-wide views, sessions and users. */
export async function getTotals(range: Range) {
  const c = client();
  if (!c) return { views: 0, sessions: 0, users: 0 };
  const cfg = RANGES.find((r) => r.key === range) ?? RANGES[1];

  const [res] = await c.runReport({
    property: `properties/${PROPERTY_ID}`,
    dateRanges: [{ startDate: cfg.startDate, endDate: 'today' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }, { name: 'totalUsers' }],
  });

  const row = res.rows?.[0];
  return {
    views: Number(row?.metricValues?.[0]?.value ?? 0),
    sessions: Number(row?.metricValues?.[1]?.value ?? 0),
    users: Number(row?.metricValues?.[2]?.value ?? 0),
  };
}
