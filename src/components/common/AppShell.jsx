import React, { useState } from 'react';
import { LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import Logo from '../ui/Logo';

const NavList = ({ sections, activeId, onSelect }) => {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Workspace navigation">
      <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Clinical Modules
      </div>
      {sections.map((section) => {
        const Icon = section.icon;
        const active = section.id === activeId;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            aria-current={active ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs font-semibold transition-all ${
              active
                ? 'bg-teal-50/80 text-teal-900 border-l-2 border-teal-700 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent'
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-teal-700' : 'text-slate-400'}`} />
            <span className="truncate">{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const UserFooter = ({ user, roleLabel, onSignOut }) => {
  return (
    <div className="border-t border-slate-200 bg-slate-50/50 p-3">
      {user && (
        <div className="mb-3 rounded-md border border-slate-200 bg-white p-2.5 shadow-2xs">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate text-xs font-semibold text-slate-900">{user.name || 'Clinical User'}</p>
            <ShieldCheck className="h-3.5 w-3.5 text-teal-700 shrink-0" />
          </div>
          <p className="truncate text-[11px] font-medium text-slate-500">{user.email || roleLabel}</p>
        </div>
      )}
      <button type="button" onClick={onSignOut} className="btn-secondary w-full text-xs">
        <LogOut className="h-3.5 w-3.5" />
        Sign out workspace
      </button>
    </div>
  );
};

const AppShell = ({ sections, activeId, onSelect, user, roleLabel, onSignOut, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (id) => {
    onSelect(id);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
          <Logo subtitle={roleLabel || "Clinical Workspace"} />
        </div>
        <NavList sections={sections} activeId={activeId} onSelect={handleSelect} />
        <UserFooter user={user} roleLabel={roleLabel} onSignOut={onSignOut} />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Logo subtitle={roleLabel} />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-lg">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
              <Logo subtitle={roleLabel} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavList sections={sections} activeId={activeId} onSelect={handleSelect} />
            <UserFooter user={user} roleLabel={roleLabel} onSignOut={onSignOut} />
          </div>
        </div>
      )}

      {/* Content area */}
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
};

export default AppShell;