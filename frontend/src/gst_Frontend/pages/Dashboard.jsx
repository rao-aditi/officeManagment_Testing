import { SoftwaresGrid } from "@/gst_Frontend/components/dashboard/SoftwaresGrid";
import { Navbar } from "@/gst_Frontend/components/layout/Navbar";
import { Sidebar } from "@/gst_Frontend/components/layout/Sidebar";


export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
          <SoftwaresGrid />
        </main>
      </div>
    </div>
  );
}