import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh w-screen items-center justify-center bg-gradient-to-br from-[#D9E4FF] via-[#EBDDFB] to-[#FCE6DF] p-4">
      <div className="w-full max-w-md rounded-[28px] border border-white/90 bg-white/65 p-7 text-center shadow-xl backdrop-blur-2xl">
        <h1 className="font-serif text-3xl font-semibold tracking-[0.2em] text-slate-800">
          AETHERIA
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          This pocket of sky has drifted away.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex min-h-[42px] items-center justify-center rounded-full border border-white bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-2 text-xs font-medium text-white shadow-md transition hover:brightness-105"
        >
          Return to Canvas
        </Link>
      </div>
    </main>
  );
}
