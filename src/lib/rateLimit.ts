interface State { hits: number[]; blockedUntil: number }

/**
 * Browser-side brake for repeated attempts. It slows casual abuse and gives honest feedback,
 * but it can be bypassed, so the real limits live in Supabase Auth settings and the database triggers.
 */
export function createLimiter(name: string, max: number, windowMs: number, blockMs: number) {
  const key = `hk_rl_${name}`;
  const load = (): State => {
    try {
      const s = JSON.parse(sessionStorage.getItem(key) ?? '') as State;
      return { hits: Array.isArray(s.hits) ? s.hits : [], blockedUntil: Number(s.blockedUntil) || 0 };
    } catch {
      return { hits: [], blockedUntil: 0 };
    }
  };
  const save = (s: State) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(s));
    } catch {
      /* storage unavailable */
    }
  };
  return {
    retryAfterSeconds: (): number => Math.max(0, Math.ceil((load().blockedUntil - Date.now()) / 1000)),
    record(): void {
      const now = Date.now();
      const s = load();
      s.hits = s.hits.filter((t) => now - t < windowMs);
      s.hits.push(now);
      if (s.hits.length >= max) {
        s.blockedUntil = now + blockMs;
        s.hits = [];
      }
      save(s);
    },
    reset: (): void => save({ hits: [], blockedUntil: 0 }),
  };
}

export const signInLimiter = createLimiter('signin', 5, 10 * 60_000, 60_000);
export const signUpLimiter = createLimiter('signup', 5, 60 * 60_000, 5 * 60_000);
