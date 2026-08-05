// Shared by app/layout.tsx (reads the initial state on the server) and
// SidebarShell (writes it on toggle). Kept out of the 'use client' component:
// values imported from a client module into server code arrive as client
// reference stubs, not the value itself.
// Prefixed because cookies are shared across ports on localhost — a bare
// `sidebar` would collide with other apps running on the same host.
export const SIDEBAR_COOKIE = 'mm_sidebar';
