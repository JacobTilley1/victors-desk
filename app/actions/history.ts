'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile, isAdmin } from '@/lib/auth';

async function requireAdmin() {
  const profile = await getProfile();
  return isAdmin(profile) ? profile! : null;
}

export async function updateHistoryPage(input: {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  kicker: string;
  introHtml: string;
}) {
  if (!(await requireAdmin())) return { ok: false, message: 'Admins only.' };
  if (input.title.trim().length < 3) return { ok: false, message: 'Give the page a title.' };

  const supabase = createClient();
  const { error } = await supabase
    .from('history_pages')
    .update({
      title: input.title.trim(),
      subtitle: input.subtitle.trim() || null,
      kicker: input.kicker.trim() || null,
      intro_html: input.introHtml,
    })
    .eq('id', input.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/history');
  revalidatePath(`/history/${input.slug}`);
  return { ok: true, message: 'Page saved.' };
}

export async function saveHistoryEntry(input: {
  id?: string;
  pageId: string;
  slug: string;
  year: number;
  title: string;
  record: string;
  result: 'W' | 'L' | 'T' | '';
  pointsFor: string;
  pointsAgainst: string;
  opponent: string;
  venue: string;
  coach: string;
  summaryHtml: string;
  isHighlight: boolean;
}) {
  if (!(await requireAdmin())) return { ok: false, message: 'Admins only.' };
  if (!Number.isInteger(input.year) || input.year < 1879 || input.year > 2100) {
    return { ok: false, message: 'Enter a valid year.' };
  }

  const num = (v: string) => (v.trim() === '' ? null : Number(v));

  const payload = {
    page_id: input.pageId,
    year: input.year,
    title: input.title.trim() || null,
    record: input.record.trim() || null,
    result: input.result || null,
    points_for: num(input.pointsFor),
    points_against: num(input.pointsAgainst),
    opponent: input.opponent.trim() || null,
    venue: input.venue.trim() || null,
    coach: input.coach.trim() || null,
    summary_html: input.summaryHtml,
    is_highlight: input.isHighlight,
  };

  const supabase = createClient();
  const { error } = input.id
    ? await supabase.from('history_entries').update(payload).eq('id', input.id)
    : await supabase.from('history_entries').insert(payload);

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/history/${input.slug}`);
  return { ok: true, message: input.id ? 'Entry updated.' : 'Entry added.' };
}

export async function deleteHistoryEntry(id: string, slug: string) {
  if (!(await requireAdmin())) return { ok: false, message: 'Admins only.' };

  const supabase = createClient();
  const { error } = await supabase.from('history_entries').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };

  revalidatePath(`/history/${slug}`);
  return { ok: true, message: 'Entry deleted.' };
}
