import { AppShell } from '@/components/layout/AppShell';
import { FeedbackProvider } from '@/components/providers/FeedbackProvider';
import { FilterProvider } from '@/lib/filter-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <FilterProvider>
      <FeedbackProvider>
        <AppShell>{children}</AppShell>
      </FeedbackProvider>
    </FilterProvider>
  );
}
