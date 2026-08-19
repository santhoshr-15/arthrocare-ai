import React, { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import Logo from '../ui/Logo';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

const NavList = ({ sections, activeId, onSelect }) => {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5" aria-label="Workspace navigation">
      <p className="px-3 pb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Clinical Modules
      </p>
      {sections.map((section) => {
        const Icon = section.icon;
        const active = section.id === activeId;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            aria-current={active ? 'page' : undefined}
            className={`nav-item ${active ? 'nav-item-active' : ''}`}
          >
            <Icon className="nav-item-icon" aria-hidden="true" />
            <span className="truncate">{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const UserFooter = ({ user, roleLabel, onSignOut }) => {
  return (
    <div className="border-t border-slate-100 p-4">
      {user && (
        <div className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-xs font-bold text-white shadow-md shadow-primary-600/20">
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-900">{user.name || 'Clinical User'}</p>
            <p className="truncate text-[11px] text-slate-400">{user.email || roleLabel}</p>
          </div>
        </div>
      )}
      <button type="button" onClick={onSignOut} className="btn-secondary w-full text-sm">
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
};

const SidebarContent = ({ sections, activeId, onSelect, user, roleLabel, onSignOut }) => (
  <>
    <div className="flex h-[72px] shrink-0 items-center border-b border-slate-100 px-5">
      <Logo subtitle={roleLabel || 'Clinical Workspace'} />
    </div>
    <NavList sections={sections} activeId={activeId} onSelect={onSelect} />
    <UserFooter user={user} roleLabel={roleLabel} onSignOut={onSignOut} />
  </>
);

const AppShell = ({ sections, activeId, onSelect, user, roleLabel, onSignOut, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (id) => {
    onSelect(id);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f8fb] lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-100 bg-white shadow-sm lg:flex">
        <SidebarContent
          sections={sections}
          activeId={activeId}
          onSelect={handleSelect}
          user={user}
          roleLabel={roleLabel}
          onSignOut={onSignOut}
        />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-100/80 bg-white/80 px-4 backdrop-blur-xl lg:hidden">
        <Logo subtitle={roleLabel} />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl shadow-slate-900/20">
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-100 px-5">
              <Logo subtitle={roleLabel} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarContent
              sections={sections}
              activeId={activeId}
              onSelect={handleSelect}
              user={user}
              roleLabel={roleLabel}
              onSignOut={onSignOut}
            />
          </div>
        </div>
      )}

      {/* Content area */}
      <main className="min-h-screen">
        <div className="page-wrap px-5 py-6 sm:px-8 lg:px-10 lg:py-8">{children}</div>
      </main>
    </div>
  );
};

export default AppShell;
