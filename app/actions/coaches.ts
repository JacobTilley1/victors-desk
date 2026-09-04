'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile, isAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

interface CoachInput {
  id?: string;
  name: string;
  nickname?: string;
  eraTitle?: string;
  tenureFrom: string;
  tenureTo?: string;
  isCurrent: boolean;
  wins?: string;
  losses?: string;
  ties?: string;
  nationalTitles?: string;
  bigTenTitles?: string;
  bowlRecord?: string;
  accolades?: string;
  portraitUrl?: string;
  summaryHtml?: string;
  isHighlight: boolean;
}

type Result = { ok: boolean; message?: string; slug?: string };

const num = (v?: string) => {
  const s = (v ?? '').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

async function freeSlug(
  supabase: ReturnType<typeof createClient>,
  name: string,
  currentId?: string
) {
  const base = slugify(name) || 'coach';
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const { data } = await supabase
      .from('history_coaches').select('id').eq('slug', candidate).maybeSingle();
    if (!data || (currentId && (data as { id: string }).id === currentId)) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function saveCoach(input: CoachInput): Promise<Result> {
  const profile = await getProfile();
  if (!isAdmin(profile)) return { ok: false, message: 'Admins only.' };

  const name = input.name.trim();
  if (name.length < 2) return { ok: false, message: 'Give the coach a name.' };

  const from = num(input.tenureFrom);
  if (!from) return { ok: false, message: 'A first season is required — it sets the order.' };

  const supabase = createClient();
  const slug = await freeSlug(supabase, name, input.id);

  const payload = {
    name,
    slug,
    nickname: input.nickname?.trim() || null,
    era_title: input.eraTitle?.trim() || null,
    tenure_from: from,
    // A current coach has no end year, whatever was typed in the box.
    tenure_to: input.isCurrent ? null : num(input.tenureTo),
    is_current: input.isCurrent,
    wins: num(input.wins),
    losses: num(input.losses),
    ties: num(input.ties) ?? 0,
    national_titles: num(input.nationalTitles) ?? 0,
    big_ten_titles: num(input.bigTenTitles) ?? 0,
    bowl_record: input.bowlRecord?.trim() || null,
    accolades: input.accolades?.trim() || null,
    portrait_url: input.portraitUrl?.trim() || null,
    summary_html: input.summaryHtml ?? '',
    is_highlight: input.isHighlight,
  };

  const { error } = input.id
    ? await supabase.from('history_coaches').update(payload).eq('id', input.id)
    : await supabase.from('history_coaches').insert(payload);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/history/coaches');
  revalidatePath(`/history/coaches/${slug}`);
  revalidatePath('/history');
  return { ok: true, slug, message: input.id ? 'Coach updated.' : 'Coach added.' };
}

export async function deleteCoach(id: string): Promise<Result> {
  const profile = await getProfile();
  if (!isAdmin(profile)) return { ok: false, message: 'Admins only.' };

  const supabase = createClient();
  const { error } = await supabase.from('history_coaches').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/history/coaches');
  return { ok: true, message: 'Coach removed.' };
}
