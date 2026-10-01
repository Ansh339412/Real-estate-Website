// Visitors never see configuration details. Developers get the hint in development builds only.
export function SetupRequired() {
  return (
    <div role="alert" className="mx-auto max-w-xl p-10 text-center">
      <h1 className="text-2xl font-bold">We'll be right back</h1>
      <p className="mt-3 text-ink/70">This website is temporarily unavailable. Please try again in a little while.</p>
      {import.meta.env.DEV && (
        <p className="mt-6 rounded-lg bg-mist p-3 text-left text-sm text-ink/70">
          Developer note: set the two Supabase variables from <code>.env.example</code> in <code>.env.local</code>, then restart.
        </p>
      )}
    </div>
  );
}
