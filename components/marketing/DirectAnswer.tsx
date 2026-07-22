interface DirectAnswerProps {
  children: React.ReactNode;
}

// A short, extractable answer immediately under the H1 — the single
// paragraph an AI answer engine (or a skimming reader) is most likely to
// quote. Visually distinct from the narrative paragraph that follows it,
// never a duplicate of it.
export function DirectAnswer({ children }: DirectAnswerProps) {
  return (
    <p className="mt-6 max-w-prose rounded-lg bg-teal-50/60 px-4 py-3 text-teal-950 dark:bg-teal-950/40 dark:text-teal-50">
      {children}
    </p>
  );
}
