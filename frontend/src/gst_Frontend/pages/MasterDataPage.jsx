
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/gst_Frontend/components/layout/Navbar";
import { Sidebar } from "@/gst_Frontend/components/layout/Sidebar";
import MasterDataModule from "../modules/master-data/MasterDataModule";

export default function MasterDataPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 px-6 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <MasterDataModule />
        </main>
      </div>
    </div>
  );
}