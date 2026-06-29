import { useNavigate } from "react-router-dom";
import { Badge } from "@/gst_Frontend/components/ui/badge";
import { Button } from "@/gst_Frontend/components/ui/button";
import { Card, CardContent } from "@/gst_Frontend/components/ui/card";
import { ShoppingCart, RefreshCw } from "lucide-react";
import { cn } from "@/gst_Frontend/lib/utils";

const SOFTWARE_TILES = [
  {
    id: "tax",
    label: "Tax",
    description: "Income Tax Filing",
    icon: "⚡",
    color: "from-amber-500/20 to-amber-600/10",
    accent: "text-amber-500",
    ring: "ring-amber-500/30",
    status: "buy",
  },
  {
    id: "tds",
    label: "TDS",
    description: "TDS Returns",
    icon: "📋",
    color: "from-rose-500/20 to-rose-600/10",
    accent: "text-rose-500",
    ring: "ring-rose-500/30",
    status: "renewal",
  },
  {
    id: "gst",
    label: "GST",
    description: "GST Returns",
    icon: "🛒",
    color: "from-blue-500/20 to-blue-600/10",
    accent: "text-blue-500",
    ring: "ring-blue-500/30",
    status: "buy",
  },
  {
    id: "roc",
    label: "ROC",
    description: "Company Filings",
    icon: "🏛️",
    color: "from-violet-500/20 to-violet-600/10",
    accent: "text-violet-500",
    ring: "ring-violet-500/30",
    status: "buy",
  },
  {
    id: "bal",
    label: "Bal",
    description: "Balance Sheet",
    icon: "📊",
    color: "from-sky-500/20 to-sky-600/10",
    accent: "text-sky-500",
    ring: "ring-sky-500/30",
    status: "buy",
  },
  {
    id: "pay",
    label: "Pay",
    description: "Payroll",
    icon: "💰",
    color: "from-emerald-500/20 to-emerald-600/10",
    accent: "text-emerald-500",
    ring: "ring-emerald-500/30",
    status: "buy",
  },
  {
    id: "dms",
    label: "DMS",
    description: "Document Mgmt",
    icon: "📁",
    color: "from-orange-500/20 to-orange-600/10",
    accent: "text-orange-500",
    ring: "ring-orange-500/30",
    status: "buy",
  },
  {
    id: "xbrl",
    label: "XBRL",
    description: "XBRL Filing",
    icon: "🔗",
    color: "from-cyan-500/20 to-cyan-600/10",
    accent: "text-cyan-500",
    ring: "ring-cyan-500/30",
    status: "buy",
  },
  {
    id: "cma",
    label: "CMA",
    description: "CMA Data",
    icon: "📈",
    color: "from-yellow-500/20 to-yellow-600/10",
    accent: "text-yellow-500",
    ring: "ring-yellow-500/30",
    status: "buy",
  },
  {
    id: "sft",
    label: "SFT",
    description: "SFT Reports",
    icon: "📝",
    color: "from-indigo-500/20 to-indigo-600/10",
    accent: "text-indigo-500",
    ring: "ring-indigo-500/30",
    status: "active",
  },
  {
    id: "bill",
    label: "Bill",
    description: "Billing & Invoicing",
    icon: "🧾",
    color: "from-teal-500/20 to-teal-600/10",
    accent: "text-teal-500",
    ring: "ring-teal-500/30",
    status: "buy",
  },
  {
    id: "chk",
    label: "CHK",
    description: "Checklist",
    icon: "✅",
    color: "from-lime-500/20 to-lime-600/10",
    accent: "text-lime-500",
    ring: "ring-lime-500/30",
    status: "active",
  },
  {
    id: "vat",
    label: "VAT",
    description: "VAT Returns",
    icon: "🏷️",
    color: "from-fuchsia-500/20 to-fuchsia-600/10",
    accent: "text-fuchsia-500",
    ring: "ring-fuchsia-500/30",
    status: "active",
  },
  {
    id: "serve",
    label: "Serve",
    description: "Service Tax",
    icon: "⚙️",
    color: "from-red-500/20 to-red-600/10",
    accent: "text-red-500",
    ring: "ring-red-500/30",
    status: "active",
  },
  {
    id: "space",
    label: "Space",
    description: "Cloud Storage",
    icon: "☁️",
    color: "from-blue-400/20 to-blue-500/10",
    accent: "text-blue-400",
    ring: "ring-blue-400/30",
    status: "buy",
  },
  {
    id: "26as",
    label: "26AS",
    description: "Form 26AS",
    icon: "📄",
    color: "from-green-500/20 to-green-600/10",
    accent: "text-green-500",
    ring: "ring-green-500/30",
    status: "active",
  },
  {
    id: "brs",
    label: "BRS",
    description: "Bank Reconciliation",
    icon: "🏦",
    color: "from-slate-500/20 to-slate-600/10",
    accent: "text-slate-400",
    ring: "ring-slate-400/30",
    status: "active",
  },
];

function StatusBadge({ status }) {
  if (status === "renewal") {
    return (
      <Badge
        variant="outline"
        className="text-[9px] h-4 px-1.5 bg-rose-50 text-rose-600 border-rose-200 gap-1 font-medium"
      >
        <RefreshCw className="w-2 h-2" />
        Renewal Due
      </Badge>
    );
  }
  if (status === "buy") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-5 text-[9px] px-2 gap-1 border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
      >
        <ShoppingCart className="w-2.5 h-2.5" />
        Buy
      </Button>
    );
  }
  return null;
}

function SoftwareTile({ tile }) {
  const navigate = useNavigate();
  const isActive = tile.status === "active";

  return (
    <Card
      onClick={() => navigate(`/module/${tile.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/software/${tile.id}`);
        }
      }}
      className={cn(
        "group relative overflow-hidden cursor-pointer border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        isActive
          ? "border-border bg-card hover:border-primary/40"
          : "border-border bg-card hover:border-border"
      )}
    >
      {/* Gradient background layer */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          tile.color
        )}
      />

      <CardContent className="relative p-4 flex flex-col items-center gap-2.5">
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-xl ring-1 transition-all duration-200 bg-muted group-hover:scale-110",
            tile.ring
          )}
        >
          {tile.icon}
        </div>

        {/* Label & description */}
        <div className="text-center">
          <p className={cn("text-sm font-semibold leading-tight", tile.accent)}>
            {tile.label}
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 hidden sm:block">
            {tile.description}
          </p>
        </div>

        {/* Status badge */}
        <StatusBadge status={tile.status} />
      </CardContent>
    </Card>
  );
}

export function SoftwaresGrid() {
  return (
    <section className="w-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Software's</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {SOFTWARE_TILES.length} modules available
          </p>
        </div>
        <Badge variant="secondary" className="text-xs font-medium">
          FX: 4.8 (11)
        </Badge>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {SOFTWARE_TILES.map((tile) => (
          <SoftwareTile key={tile.id} tile={tile} />
        ))}
      </div>
    </section>
  );
}