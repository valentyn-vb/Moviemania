'use client';

import { useTheme } from 'next-themes';
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';

const linkClass =
  'flex w-full items-center gap-4 border-none bg-transparent pl-8 pr-6 text-left text-muted no-underline transition-colors duration-300 hover:text-accent mb-6 pc:mb-0 pc:py-6 pc:w-[98%] pc:text-l [&_svg]:w-10';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // The markup is identical on the server and client — the `light:` variant
  // (driven by <html data-theme>, set before paint by next-themes) decides
  // which label/icon is visible. That avoids a hydration mismatch without a
  // mounted guard. resolvedTheme is only read in the click handler, which runs
  // after the theme has resolved, so the toggle direction is always correct.
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      className={linkClass}
    >
      <span className="light:hidden">Light mode</span>
      <IoSunnyOutline className="light:hidden" />
      <span className="hidden light:inline">Dark mode</span>
      <IoMoonOutline className="hidden light:block" />
    </button>
  );
}
