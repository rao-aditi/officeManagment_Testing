import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/gst_Frontend/components/layout/Navbar";
import GstModule from "../modules/gst/GstModule";
import TdsModule from "../modules/tds/TdsModule";
import TaxModule from "../modules/tax/TaxModule";

const MODULE_MAP = {
  gst: <GstModule />,
  tds: <TdsModule />,
  tax: <TaxModule />,
};

export default function ModulePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {MODULE_MAP[moduleId] ?? (
          <div className="border border-dashed border-border rounded-xl p-12 flex items-center justify-center text-muted-foreground text-sm">
            {moduleId?.toUpperCase()} module coming soon...
          </div>
        )}
      </main>
    </div>
  );
}