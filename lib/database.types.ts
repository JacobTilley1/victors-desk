export type Role = 'reader' | 'author' | 'admin';
export type AuthorStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type PostStatus = 'draft' | 'pending' | 'published' | 'rejected';
export type Team =
  | 'football' | 'basketball' | 'hockey' | 'baseball'
  | 'olympic' | 'recruiting' | 'bigten' | 'problue' | 'opinion';

export interface Profile {
  id: string;
  email: string | null;
  display_name: string;
  avatar_url: string | null;
  google_avatar_url: string | null;
  bio: string | null;
  role: Role;
  author_status: AuthorStatus;
  author_pitch: string | null;
  is_banned: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  content_json: unknown;
  cover_image_url: string | null;
  team: Team;
  status: PostStatus;
  review_note: string | null;
  reviewed_by: string | null;
  read_minutes: number;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  is_hidden: boolean;
  created_at: string;
}

export interface ForumCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  accent: string;
  sort_order: number;
}

export interface ForumThread {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_hidden: boolean;
  reply_count: number;
  view_count: number;
  last_activity_at: string;
  created_at: string;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  author_id: string;
  body: string;
  is_hidden: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: 'comment' | 'thread' | 'reply';
  target_id: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  created_at: string;
}

/** Post joined with its author profile. */
export type PostWithAuthor = Post & { author: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null };
export type CommentWithAuthor = Comment & { author: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'role'> | null };
export type ThreadWithMeta = ForumThread & {
  author: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'role'> | null;
  category?: Pick<ForumCategory, 'id' | 'name' | 'slug' | 'accent'> | null;
};
export type ReplyWithAuthor = ForumReply & {
  author: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'role'> | null;
};

export type League = 'nfl' | 'nba';
export type ProStatus = 'active' | 'retired';

export interface ProPlayer {
  id: string;
  slug: string;
  name: string;
  league: League;
  position: string | null;
  pro_team: string | null;
  jersey_number: string | null;
  status: ProStatus;
  michigan_years: string | null;
  michigan_note: string | null;
  draft_year: number | null;
  draft_round: number | null;
  draft_pick: number | null;
  drafted_by: string | null;
  accolades: string | null;
  headshot_url: string | null;
  bio_html: string;
  is_highlight: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type HistoryKind = 'season' | 'rivalry';

export interface HistoryPage {
  id: string;
  slug: string;
  kind: HistoryKind;
  title: string;
  subtitle: string | null;
  intro_html: string;
  hero_image_url: string | null;
  kicker: string | null;
  all_time_wins: number | null;
  all_time_losses: number | null;
  all_time_ties: number | null;
  all_time_note: string | null;
  span_label: string | null;
  sort_order: number;
  updated_at: string;
}

export interface HistoryEntry {
  id: string;
  page_id: string;
  year: number;
  title: string | null;
  record: string | null;
  result: 'W' | 'L' | 'T' | null;
  points_for: number | null;
  points_against: number | null;
  opponent: string | null;
  venue: string | null;
  coach: string | null;
  postseason: string | null;
  summary_html: string;
  is_highlight: boolean;
  created_at: string;
  updated_at: string;
}
