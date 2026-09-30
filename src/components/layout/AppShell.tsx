'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/navigation';
import { FilterBar } from '@/components/ui/FilterBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="bg-atmosphere" aria-hidden />
      <div className="relative flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[var(--color-navy)] text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Navegação principal"
        >
          <div className="border-b border-white/10 px-5 py-5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/70">
              Gestão Educacional
            </p>
            <p className="mt-2 text-xl leading-snug font-semibold tracking-tight">
              Secretaria Municipal de Educação
            </p>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const childActive = item.children?.some(
                  (child) => child.href && pathname.startsWith(child.href),
                );
                const active =
                  item.href === '/'
                    ? pathname === '/'
                    : Boolean(
                        (item.href && pathname.startsWith(item.href)) || childActive,
                      );
                const base =
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

                if (item.children?.length) {
                  return (
                    <li key={item.id}>
                      <div className={`${base} text-white/70`}>
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="flex-1 text-left font-medium">{item.label}</span>
                      </div>
                      <ul className="ml-7 mt-1 space-y-1 border-l border-white/10 pl-3">
                        {item.children.map((child) => {
                          if (!child.href) {
                            return (
                              <li key={child.id} className="py-1 text-xs text-white/40">
                                {child.label}
                              </li>
                            );
                          }
                          const childIsActive =
                            pathname === child.href ||
                            Boolean(child.href && pathname.startsWith(`${child.href}/`));
                          return (
                            <li key={child.id}>
                              <Link
                                href={child.href}
                                onClick={() => setOpen(false)}
                                className={`block min-h-8 rounded-lg px-2 py-1.5 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                                  childIsActive
                                    ? 'bg-[var(--color-primary)]/35 font-semibold text-white'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                                aria-current={childIsActive ? 'page' : undefined}
                              >
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                }

                if (item.comingSoon || !item.href) {
                  return (
                    <li key={item.id}>
                      <div
                        className={`${base} cursor-not-allowed text-white/45`}
                        aria-disabled="true"
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="flex-1 text-left">{item.label}</span>
                        <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white/70">
                          Em breve
                        </span>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`${base} ${
                        active
                          ? 'bg-[var(--color-primary)]/35 font-semibold text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <p className="border-t border-white/10 px-5 py-4 text-xs text-white/55">
            Ambiente de demonstração · validação com a Dirigente
          </p>
        </aside>

        {open && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-navy)] lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? 'Fechar navegação' : 'Abrir navegação'}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--color-navy)]">
                  Dashboard Executivo da Rede
                </p>
                <p className="truncate text-xs text-[var(--color-muted)]">
                  Visão gerencial para tomada de decisão
                </p>
              </div>
            </div>
            <div className="px-4 pb-4 sm:px-6">
              <FilterBar />
            </div>
          </header>
          <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
