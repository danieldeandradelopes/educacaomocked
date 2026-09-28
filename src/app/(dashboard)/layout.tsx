import { AppShell } from '@/components/layout/AppShell';
import { FilterProvider } from '@/lib/filter-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <FilterProvider>
      <AppShell>{children}</AppShell>
    </FilterProvider>
  );
}
