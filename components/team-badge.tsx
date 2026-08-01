import { TEAM_LABEL } from '@/lib/constants';
import type { Team } from '@/lib/database.types';

const STYLES: Record<Team, string> = {
  football:   'bg-maize text-navy-700',
  basketball: 'bg-navy text-maize',
  hockey:     'bg-navy-100 text-navy-700',
  baseball:   'bg-emerald-100 text-emerald-800',
  olympic:    'bg-slate-200 text-slate-700',
  recruiting: 'bg-maize-100 text-navy-700',
  bigten:     'bg-indigo-100 text-indigo-800',
  opinion:    'bg-rose-100 text-rose-800',
};

export default function TeamBadge({ team, className = '' }: { team: Team; className?: string }) {
  return (
    <span className={`chip uppercase tracking-[0.09em] ${STYLES[team] ?? STYLES.football} ${className}`}>
      {TEAM_LABEL[team] ?? team}
    </span>
  );
}
