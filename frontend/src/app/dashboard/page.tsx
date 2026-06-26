import DashboardContent, {
  DashboardSkeleton,
} from '@/components/dashboard/DashboardContent';
import React, { Suspense } from 'react';

export default async function DashboardPage() {
  return (
    <>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
