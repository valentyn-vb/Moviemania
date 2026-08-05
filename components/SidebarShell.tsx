'use client';

import { SIDEBAR_COOKIE } from '@/lib/sidebar';
import { createContext, useContext, useState } from 'react';
import SidebarToggle from './SidebarToggle';

const SidebarContext = createContext<{
  open: boolean;
  toggle: () => void;
} | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarShell>');
  return ctx;
}

// Owns the desktop sidebar/content grid so the collapsed state can change the
// column template. The sidebar itself stays a server component and is passed
// in as a prop; it hides via the group-data variant on its own <header>.
export default function SidebarShell({
  defaultOpen,
  sidebar,
  children,
}: {
  defaultOpen: boolean;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Persisted as a cookie rather than localStorage so the server renders the
  // right column widths on first paint instead of flashing the open sidebar.
  const toggle = () => {
    const next = !open;
    setOpen(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? 'open' : 'collapsed'}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <SidebarContext.Provider value={{ open, toggle }}>
      <div
        data-sidebar={open ? 'open' : 'collapsed'}
        className={`group pc:grid pc:min-h-screen ${
          open
            ? 'pc:grid-cols-[minmax(256px,290px)_5fr]'
            : 'pc:grid-cols-[3rem_1fr]'
        }`}
      >
        {sidebar}

        {/* Slim rail standing in for the collapsed sidebar, so the reopen
            button has a fixed home instead of floating over the page. */}
        {!open && (
          <div className="sticky top-0 hidden h-screen bg-secondary py-8 pc:block">
            <SidebarToggle className="mx-auto" />
          </div>
        )}

        {children}
      </div>
    </SidebarContext.Provider>
  );
}
