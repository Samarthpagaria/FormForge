import { DashboardNavbar } from "@/components/dashboard-navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#F8F7F4] dark:bg-zinc-950 text-[#1a1a1a] dark:text-zinc-50">
      <DashboardNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
