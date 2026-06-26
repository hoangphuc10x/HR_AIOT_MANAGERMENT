import CommonLayout from '@/components/common/layout/layout';

export default function DepartmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CommonLayout>{children}</CommonLayout>;
}
