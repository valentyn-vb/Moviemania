// Pure-CSS spinner (replaces react-loader-spinner). No client JS, so it works
// inside server-rendered loading.tsx fallbacks too.
export default function Loader() {
  return (
    <div className="flex justify-center pt-8" role="status" aria-label="Loading">
      <div className="h-[150px] w-[150px] animate-spin rounded-full border-8 border-accent-soft border-t-accent" />
    </div>
  );
}
