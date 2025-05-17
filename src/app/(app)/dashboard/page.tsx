import { Metadata } from 'next';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard | MeetLY',
  description: 'Dashboard overview and appointment scheduling',
};

export default function DashboardPage() {
  return <DashboardContent />;
} 