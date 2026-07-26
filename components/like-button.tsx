'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';
import { toggleLike } from '@/app/actions/posts';

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
  signedIn,
}: { postId: string; initialLiked: boolean; initialCount: number; signedIn: boolean }) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();

  function click() {
    if (!signedIn) {
      router.push('/login?next=' + encodeURIComponent(window.location.pathname));
      return;
    }
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    start(async () => {
      const res = await toggleLike(postId);
      if (!res.ok) {
        setLiked(!next);
        setCount((c) => c + (next ? -1 : 1));
      }
    });
  }

  return (
    <button
      onClick={click}
      className={`btn btn-sm border transition ${
        liked
          ? 'border-maize bg-maize text-navy-700'
          : 'border-[var(--line)] bg-white text-navy-700 hover:border-maize hover:bg-maize-50'
      }`}
      aria-pressed={liked}
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} className={liked ? 'fill-navy-700' : ''} />}
      {count}
    </button>
  );
}
