import CopilotSidebar from '@/components/CopilotSidebar';

export default function DashboardLayout({ children }) {
  return (
    <>
      <div className="min-h-screen">
        {children}
      </div>
      <CopilotSidebar />
    </>
  );
}
