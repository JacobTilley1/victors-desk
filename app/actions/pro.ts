'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile, isAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import type { League, ProStatus } from '@/lib/database.types';

interface PlayerInput {
  id?: string;
  name: string;
  league: League;
  position?: string;
  proTeam?: string;
  jerseyNumber?: string;
  status: ProStatus;
  michiganYears?: string;
  michiganNote?: string;
  draftYear?: string;
  draftRound?: string;
  draftPick?: string;
  draftedBy?: string;
  accolades?: string;
  headshotUrl?: string;
  bioHtml?: string;
  isHighlight: boolean;
}

type Result = { ok: boolean; message?: string; slug?: string };

const num = (v?: string) => {
  const n = Number((v ?? '').trim());
  return Number.isFinite(n) && v?.trim() ? n : null;
};

/** A free slug from the player's name, with a numeric suffix only on collision. */
async function freeSlug(
  supabase: ReturnType<typeof createClient>,
  name: string,
  currentId?: string
) {
  const base = slugify(name) || 'player';
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const { data } = await supabase
      .from('pro_players').select('id').eq('slug', candidate).maybeSingle();
    if (!data || (currentId && (data as { id: string }).id === currentId)) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function saveProPlayer(input: PlayerInput): Promise<Result> {
  const profile = await getProfile();
  if (!isAdmin(profile)) return { ok: false, message: 'Admins only.' };

  const name = input.name.trim();
  if (name.length < 2) return { ok: false, message: 'Give the player a name.' };

  const supabase = createClient();
  const slug = await freeSlug(supabase, name, input.id);

  const payload = {
    name,
    slug,
    league: input.league,
    position: input.position?.trim() || null,
    pro_team: input.proTeam?.trim() || null,
    jersey_number: input.jerseyNumber?.trim() || null,
    status: input.status,
    michigan_years: input.michiganYears?.trim() || null,
    michigan_note: input.michiganNote?.trim() || null,
    draft_year: num(input.draftYear),
    draft_round: num(input.draftRound),
    draft_pick: num(input.draftPick),
    drafted_by: input.draftedBy?.trim() || null,
    accolades: input.accolades?.trim() || null,
    headshot_url: input.headshotUrl?.trim() || null,
    bio_html: input.bioHtml ?? '',
    is_highlight: input.isHighlight,
  };

  const { error } = input.id
    ? await supabase.from('pro_players').update(payload).eq('id', input.id)
    : await supabase.from('pro_players').insert(payload);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/pro');
  revalidatePath(`/pro/${slug}`);
  return { ok: true, slug, message: input.id ? 'Player updated.' : 'Player added.' };
}

export async function deleteProPlayer(id: string): Promise<Result> {
  const profile = await getProfile();
  if (!isAdmin(profile)) return { ok: false, message: 'Admins only.' };

  const supabase = createClient();
  const { error } = await supabase.from('pro_players').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/pro');
  return { ok: true, message: 'Player removed.' };
}
