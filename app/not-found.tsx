import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative overflow-hidden bg-navy py-24 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,203,5,0.2),transparent_60%)]" />
      <div className="field-grain absolute inset-0 opacity-60" />
      <div className="container-page relative text-center">
        <p className="font-display text-[80px] font-bold leading-none text-maize">404</p>
        <h1 className="mt-3 font-display text-[28px] font-bold">Incomplete pass</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-slate-300">
          That page does not exist — or it was pulled by an editor.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Back to the home page</Link>
          <Link href="/blog" className="btn border border-white/20 bg-white/5 text-white hover:bg-white/10">
            Browse stories
          </Link>
        </div>
      </div>
    </div>
  );
}
