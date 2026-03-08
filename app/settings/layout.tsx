import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
