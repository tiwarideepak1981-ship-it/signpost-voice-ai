import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leadsStore } from "@/store/leadsStore";
import type { Lead, LeadStatus } from "@/types";
import {
  Bot,
  Building2,
  ChevronDown,
  ChevronUp,
  Download,
  Flame,
  Linkedin,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Snowflake,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProspectRecord {
  id: string;
  name: string;
  designation: string;
  company: string;
  industry: string;
  country: string;
  state: string;
  city: string;
  phone: string;
  email: string;
  linkedinUrl: string;
  connectionDegree: "1st" | "2nd" | "3rd";
  aiStatus: LeadStatus;
  followers: number;
}

// ─── Deterministic AI Status ──────────────────────────────────────────────────

function inferStatus(designation: string, industry: string): LeadStatus {
  const d = designation.toLowerCase();
  const i = industry.toLowerCase();
  const hotD = [
    "ceo",
    "cto",
    "cfo",
    "founder",
    "director",
    "vp",
    "president",
    "owner",
    "md",
    "partner",
    "chief",
  ];
  const hotI = [
    "technology",
    "finance",
    "healthcare",
    "saas",
    "fintech",
    "software",
    "ai",
    "cloud",
  ];
  const warmD = [
    "manager",
    "head",
    "lead",
    "senior",
    "sr.",
    "principal",
    "architect",
    "specialist",
    "consultant",
  ];
  if (hotD.some((h) => d.includes(h)) && hotI.some((h) => i.includes(h)))
    return "hot";
  if (hotD.some((h) => d.includes(h))) return "warm";
  if (warmD.some((h) => d.includes(h))) return "warm";
  return "cold";
}

// ─── Sample Prospect Data ─────────────────────────────────────────────────────

const PROSPECT_DATA: ProspectRecord[] = [
  {
    id: "lp1",
    name: "Aarav Mehta",
    designation: "CEO",
    company: "NexaTech India",
    industry: "Technology",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    phone: "+91-98765-00001",
    email: "aarav.m@nexatech.in",
    linkedinUrl: "https://linkedin.com/in/aarav-mehta",
    connectionDegree: "2nd",
    aiStatus: inferStatus("CEO", "Technology"),
    followers: 4820,
  },
  {
    id: "lp2",
    name: "Priya Sharma",
    designation: "Director of Sales",
    company: "HealthBridge India",
    industry: "Healthcare",
    country: "India",
    state: "Maharashtra",
    city: "Pune",
    phone: "+91-98765-00002",
    email: "priya.s@healthbridge.in",
    linkedinUrl: "https://linkedin.com/in/priya-sharma",
    connectionDegree: "2nd",
    aiStatus: inferStatus("Director of Sales", "Healthcare"),
    followers: 3210,
  },
  {
    id: "lp3",
    name: "Vikram Nair",
    designation: "VP Engineering",
    company: "CloudShift Technologies",
    industry: "SaaS",
    country: "India",
    state: "Karnataka",
    city: "Bangalore",
    phone: "+91-98765-00003",
    email: "v.nair@cloudshift.io",
    linkedinUrl: "https://linkedin.com/in/vikram-nair",
    connectionDegree: "3rd",
    aiStatus: inferStatus("VP Engineering", "SaaS"),
    followers: 6400,
  },
  {
    id: "lp4",
    name: "Sarah Chen",
    designation: "CEO",
    company: "NexaTech Solutions",
    industry: "Technology",
    country: "USA",
    state: "California",
    city: "San Francisco",
    phone: "+1-555-0192",
    email: "sarah.chen@nexatech.io",
    linkedinUrl: "https://linkedin.com/in/sarah-chen",
    connectionDegree: "1st",
    aiStatus: inferStatus("CEO", "Technology"),
    followers: 12300,
  },
  {
    id: "lp5",
    name: "Marcus Webb",
    designation: "CFO",
    company: "FinVault Corp",
    industry: "Finance",
    country: "USA",
    state: "New York",
    city: "New York City",
    phone: "+1-555-0234",
    email: "marcus.webb@finvault.com",
    linkedinUrl: "https://linkedin.com/in/marcus-webb",
    connectionDegree: "2nd",
    aiStatus: inferStatus("CFO", "Finance"),
    followers: 5890,
  },
  {
    id: "lp6",
    name: "Lisa Hoffman",
    designation: "VP Sales",
    company: "PharmaNet GmbH",
    industry: "Pharma",
    country: "Germany",
    state: "Berlin",
    city: "Berlin",
    phone: "+49-30-12345678",
    email: "l.hoffman@pharmanet.de",
    linkedinUrl: "https://linkedin.com/in/lisa-hoffman",
    connectionDegree: "3rd",
    aiStatus: inferStatus("VP Sales", "Pharma"),
    followers: 2180,
  },
  {
    id: "lp7",
    name: "David Kim",
    designation: "Founder",
    company: "AI Forward",
    industry: "AI",
    country: "South Korea",
    state: "Seoul",
    city: "Gangnam",
    phone: "+82-10-1234-5678",
    email: "d.kim@aiforward.co",
    linkedinUrl: "https://linkedin.com/in/david-kim",
    connectionDegree: "2nd",
    aiStatus: inferStatus("Founder", "AI"),
    followers: 9740,
  },
  {
    id: "lp8",
    name: "Ana Rodrigues",
    designation: "Marketing Manager",
    company: "Mercado Digital",
    industry: "E-commerce",
    country: "Brazil",
    state: "São Paulo",
    city: "São Paulo",
    phone: "+55-11-91234-5678",
    email: "a.rodrigues@mercado.br",
    linkedinUrl: "https://linkedin.com/in/ana-rodrigues",
    connectionDegree: "3rd",
    aiStatus: inferStatus("Marketing Manager", "E-commerce"),
    followers: 1560,
  },
  {
    id: "lp9",
    name: "James Okafor",
    designation: "Business Development",
    company: "TechBridge Nigeria",
    industry: "Technology",
    country: "Nigeria",
    state: "Lagos",
    city: "Victoria Island",
    phone: "+234-803-456-7890",
    email: "j.okafor@techbridge.ng",
    linkedinUrl: "https://linkedin.com/in/james-okafor",
    connectionDegree: "3rd",
    aiStatus: inferStatus("Business Development", "Technology"),
    followers: 3340,
  },
  {
    id: "lp10",
    name: "Rajesh Kapoor",
    designation: "CTO",
    company: "FintechFlow",
    industry: "Fintech",
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    phone: "+91-98765-00010",
    email: "r.kapoor@fintechflow.in",
    linkedinUrl: "https://linkedin.com/in/rajesh-kapoor",
    connectionDegree: "2nd",
    aiStatus: inferStatus("CTO", "Fintech"),
    followers: 8120,
  },
  {
    id: "lp11",
    name: "Sophie Martin",
    designation: "Head of Growth",
    company: "ScaleUp SaaS",
    industry: "SaaS",
    country: "France",
    state: "Île-de-France",
    city: "Paris",
    phone: "+33-1-23456789",
    email: "s.martin@scaleup.fr",
    linkedinUrl: "https://linkedin.com/in/sophie-martin",
    connectionDegree: "2nd",
    aiStatus: inferStatus("Head of Growth", "SaaS"),
    followers: 4230,
  },
  {
    id: "lp12",
    name: "Anita Desai",
    designation: "Senior Manager Operations",
    company: "MedCare Solutions",
    industry: "Healthcare",
    country: "India",
    state: "Gujarat",
    city: "Ahmedabad",
    phone: "+91-98765-00012",
    email: "a.desai@medcare.in",
    linkedinUrl: "https://linkedin.com/in/anita-desai",
    connectionDegree: "3rd",
    aiStatus: inferStatus("Senior Manager", "Healthcare"),
    followers: 1890,
  },
  {
    id: "lp13",
    name: "Hiroshi Tanaka",
    designation: "Director",
    company: "TechVision Japan",
    industry: "Technology",
    country: "Japan",
    state: "Tokyo",
    city: "Shibuya",
    phone: "+81-3-1234-5678",
    email: "h.tanaka@techvision.jp",
    linkedinUrl: "https://linkedin.com/in/hiroshi-tanaka",
    connectionDegree: "3rd",
    aiStatus: inferStatus("Director", "Technology"),
    followers: 5670,
  },
  {
    id: "lp14",
    name: "Meera Krishnan",
    designation: "VP Product",
    company: "SaaSify Labs",
    industry: "SaaS",
    country: "India",
    state: "Tamil Nadu",
    city: "Chennai",
    phone: "+91-98765-00014",
    email: "m.krishnan@saasify.io",
    linkedinUrl: "https://linkedin.com/in/meera-krishnan",
    connectionDegree: "1st",
    aiStatus: inferStatus("VP Product", "SaaS"),
    followers: 7290,
  },
  {
    id: "lp15",
    name: "Carlos Rivera",
    designation: "Founder & CEO",
    company: "LatamTech",
    industry: "Technology",
    country: "Mexico",
    state: "Jalisco",
    city: "Guadalajara",
    phone: "+52-33-1234-5678",
    email: "c.rivera@latamtech.mx",
    linkedinUrl: "https://linkedin.com/in/carlos-rivera",
    connectionDegree: "2nd",
    aiStatus: inferStatus("Founder & CEO", "Technology"),
    followers: 6120,
  },
  {
    id: "lp16",
    name: "Neha Gupta",
    designation: "Account Executive",
    company: "SalesForce India",
    industry: "SaaS",
    country: "India",
    state: "Haryana",
    city: "Gurgaon",
    phone: "+91-98765-00016",
    email: "n.gupta@sfind.in",
    linkedinUrl: "https://linkedin.com/in/neha-gupta",
    connectionDegree: "2nd",
    aiStatus: inferStatus("Account Executive", "SaaS"),
    followers: 2340,
  },
  {
    id: "lp17",
    name: "Tom Bradley",
    designation: "Senior Manager",
    company: "CloudShift Ltd",
    industry: "SaaS",
    country: "UK",
    state: "England",
    city: "London",
    phone: "+44-7911-123456",
    email: "t.bradley@cloudshift.io",
    linkedinUrl: "https://linkedin.com/in/tom-bradley",
    connectionDegree: "2nd",
    aiStatus: inferStatus("Senior Manager", "SaaS"),
    followers: 3100,
  },
  {
    id: "lp18",
    name: "Sunita Patel",
    designation: "Chief Operating Officer",
    company: "DigiMed Health",
    industry: "Healthcare",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    phone: "+91-98765-00018",
    email: "s.patel@digimed.in",
    linkedinUrl: "https://linkedin.com/in/sunita-patel",
    connectionDegree: "1st",
    aiStatus: inferStatus("Chief Operating Officer", "Healthcare"),
    followers: 5540,
  },
  {
    id: "lp19",
    name: "Arun Bose",
    designation: "Business Development Manager",
    company: "EdTechPro",
    industry: "EdTech",
    country: "India",
    state: "West Bengal",
    city: "Kolkata",
    phone: "+91-98765-00019",
    email: "a.bose@edtechpro.in",
    linkedinUrl: "https://linkedin.com/in/arun-bose",
    connectionDegree: "3rd",
    aiStatus: inferStatus("Business Development Manager", "EdTech"),
    followers: 1230,
  },
  {
    id: "lp20",
    name: "Elena Popov",
    designation: "Head of Sales",
    company: "EcoTech Europe",
    industry: "CleanTech",
    country: "Netherlands",
    state: "North Holland",
    city: "Amsterdam",
    phone: "+31-20-1234567",
    email: "e.popov@ecotech.eu",
    linkedinUrl: "https://linkedin.com/in/elena-popov",
    connectionDegree: "2nd",
    aiStatus: inferStatus("Head of Sales", "CleanTech"),
    followers: 4080,
  },
];

const COUNTRIES = [...new Set(PROSPECT_DATA.map((p) => p.country))].sort();
const INDUSTRIES = [...new Set(PROSPECT_DATA.map((p) => p.industry))].sort();

function StatusBadge({ status }: { status: LeadStatus }) {
  if (status === "hot")
    return (
      <span className="badge-hot">
        <Flame className="w-3 h-3" />
        Hot
      </span>
    );
  if (status === "warm")
    return (
      <span className="badge-warm">
        <Zap className="w-3 h-3" />
        Warm
      </span>
    );
  return (
    <span className="badge-cold">
      <Snowflake className="w-3 h-3" />
      Cold
    </span>
  );
}

function DegreeTag({ degree }: { degree: ProspectRecord["connectionDegree"] }) {
  const colors: Record<string, string> = {
    "1st": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "2nd": "bg-primary/10 text-primary border-primary/20",
    "3rd": "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${colors[degree]}`}
    >
      {degree}
    </span>
  );
}

interface SearchFilters {
  name: string;
  company: string;
  designation: string;
  industry: string;
  country: string;
  state: string;
  city: string;
}

const EMPTY_FILTERS: SearchFilters = {
  name: "",
  company: "",
  designation: "",
  industry: "",
  country: "",
  state: "",
  city: "",
};

export default function ProspectFinderPage() {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [committed, setCommitted] = useState<SearchFilters | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<keyof ProspectRecord>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const setFilter = (key: keyof SearchFilters, val: string) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setCommitted({ ...filters });
      setLoading(false);
    }, 800);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setCommitted(null);
    setSelectedIds(new Set());
  };

  const results = useMemo(() => {
    if (!committed) return [];
    const c = committed;
    return PROSPECT_DATA.filter((p) => {
      if (c.name && !p.name.toLowerCase().includes(c.name.toLowerCase()))
        return false;
      if (
        c.company &&
        !p.company.toLowerCase().includes(c.company.toLowerCase())
      )
        return false;
      if (
        c.designation &&
        !p.designation.toLowerCase().includes(c.designation.toLowerCase())
      )
        return false;
      if (c.industry && c.industry !== "all" && p.industry !== c.industry)
        return false;
      if (c.country && c.country !== "all" && p.country !== c.country)
        return false;
      if (c.state && !p.state.toLowerCase().includes(c.state.toLowerCase()))
        return false;
      if (c.city && !p.city.toLowerCase().includes(c.city.toLowerCase()))
        return false;
      return true;
    }).sort((a, b) => {
      const av = String(a[sortField]);
      const bv = String(b[sortField]);
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [committed, sortField, sortDir]);

  const hasFilters = Object.values(filters).some((v) => v && v !== "all");

  const toggleSort = (field: keyof ProspectRecord) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: keyof ProspectRecord }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-0.5" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-0.5" />
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === results.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(results.map((r) => r.id)));
  };

  const prospectToLead = (p: ProspectRecord): Lead => ({
    id: `prospect-${p.id}-${Date.now()}`,
    name: p.name,
    phone: p.phone,
    email: p.email,
    company: p.company,
    status: p.aiStatus,
    intent: "Cold Calling",
    score: p.aiStatus === "hot" ? 85 : p.aiStatus === "warm" ? 60 : 35,
    lastContact: new Date().toISOString().split("T")[0],
    followUpDate: new Date(Date.now() + 7 * 86400000)
      .toISOString()
      .split("T")[0],
    assignedAgent: "Unassigned",
    campaignSource: "Prospect Finder",
    notes: `Found via Prospect Finder. Designation: ${p.designation}. Industry: ${p.industry}.`,
    callCount: 0,
    location: [p.city, p.state, p.country].filter(Boolean).join(", "),
    country: p.country,
    state: p.state,
    city: p.city,
    designation: p.designation,
    industry: p.industry,
  });

  const handleAddToLeads = () => {
    const toAdd = results.filter((r) => selectedIds.has(r.id));
    leadsStore.addLeads(toAdd.map(prospectToLead));
    setAddedIds((prev) => new Set([...prev, ...toAdd.map((r) => r.id)]));
    setSelectedIds(new Set());
  };

  const exportCSV = () => {
    const rows = results.filter(
      (r) => selectedIds.size === 0 || selectedIds.has(r.id),
    );
    const headers =
      "Name,Email,Phone,Company,Designation,Industry,Country,State,City";
    const lines = rows.map(
      (r) =>
        `"${r.name}","${r.email}","${r.phone}","${r.company}","${r.designation}","${r.industry}","${r.country}","${r.state}","${r.city}"`,
    );
    const csv = [headers, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prospects.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats for display
  const hotCount = results.filter((r) => r.aiStatus === "hot").length;
  const warmCount = results.filter((r) => r.aiStatus === "warm").length;

  return (
    <div
      className="flex flex-col h-full bg-background"
      data-ocid="prospect-finder-page"
    >
      {/* Page Header */}
      <div className="px-5 py-3.5 border-b border-border bg-card flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Linkedin className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground font-display tracking-tight leading-none">
              Prospect Finder
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Search LinkedIn-style contacts for cold calling outreach
            </p>
          </div>
        </div>
        {committed && results.length > 0 && (
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <Button
                type="button"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={handleAddToLeads}
                data-ocid="add-to-leads-btn"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Add {selectedIds.size} to Leads
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={exportCSV}
              data-ocid="export-prospects-btn"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search Form */}
        <div
          className="px-5 pt-4 pb-3 border-b border-border bg-card/40"
          data-ocid="prospect-search-form"
        >
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-widest">
              Search Criteria
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              (all fields optional — leave blank to match broadly)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {/* Country */}
            <div className="space-y-1">
              <label htmlFor="pf-country" className="filter-label">
                Country
              </label>
              <Select
                value={filters.country || "all"}
                onValueChange={(v) =>
                  setFilter("country", v === "all" ? "" : v)
                }
              >
                <SelectTrigger
                  id="pf-country"
                  className="h-7 text-xs"
                  data-ocid="pf-country"
                >
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All Countries
                  </SelectItem>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State */}
            <div className="space-y-1">
              <label htmlFor="pf-state" className="filter-label">
                State / Province
              </label>
              <Input
                id="pf-state"
                value={filters.state}
                onChange={(e) => setFilter("state", e.target.value)}
                placeholder="e.g. Maharashtra"
                className="h-7 text-xs text-foreground"
                data-ocid="pf-state"
              />
            </div>

            {/* City */}
            <div className="space-y-1">
              <label htmlFor="pf-city" className="filter-label">
                City
              </label>
              <Input
                id="pf-city"
                value={filters.city}
                onChange={(e) => setFilter("city", e.target.value)}
                placeholder="e.g. Mumbai"
                className="h-7 text-xs text-foreground"
                data-ocid="pf-city"
              />
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label htmlFor="pf-company" className="filter-label">
                Company
              </label>
              <Input
                id="pf-company"
                value={filters.company}
                onChange={(e) => setFilter("company", e.target.value)}
                placeholder="e.g. TechCorp"
                className="h-7 text-xs text-foreground"
                data-ocid="pf-company"
              />
            </div>

            {/* Designation */}
            <div className="space-y-1">
              <label htmlFor="pf-designation" className="filter-label">
                Designation
              </label>
              <Input
                id="pf-designation"
                value={filters.designation}
                onChange={(e) => setFilter("designation", e.target.value)}
                placeholder="e.g. CEO, VP"
                className="h-7 text-xs text-foreground"
                data-ocid="pf-designation"
              />
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label htmlFor="pf-name" className="filter-label">
                Name
              </label>
              <Input
                id="pf-name"
                value={filters.name}
                onChange={(e) => setFilter("name", e.target.value)}
                placeholder="e.g. Priya"
                className="h-7 text-xs text-foreground"
                data-ocid="pf-name"
              />
            </div>

            {/* Industry */}
            <div className="space-y-1">
              <label htmlFor="pf-industry" className="filter-label">
                Industry
              </label>
              <Select
                value={filters.industry || "all"}
                onValueChange={(v) =>
                  setFilter("industry", v === "all" ? "" : v)
                }
              >
                <SelectTrigger
                  id="pf-industry"
                  className="h-7 text-xs"
                  data-ocid="pf-industry"
                >
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All Industries
                  </SelectItem>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i} className="text-xs">
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="btn-import flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              data-ocid="pf-search-btn"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              {loading ? "Searching LinkedIn..." : "Find Prospects"}
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="btn-cancel flex items-center gap-2"
                data-ocid="pf-reset-btn"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
            <div className="flex items-center gap-1.5 ml-auto text-xs text-muted-foreground">
              <Bot className="w-3.5 h-3.5 text-primary" />
              AI auto-suggests Hot / Warm / Cold status based on role &amp;
              industry
            </div>
          </div>
        </div>

        {/* Results */}
        {!committed && !loading && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4"
            data-ocid="pf-empty-state"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Linkedin className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-foreground font-display mb-1">
                Find Cold Calling Prospects
              </div>
              <div className="text-sm text-muted-foreground max-w-md">
                Use the filters above to search by Country, State, City,
                Company, Designation, Name, or Industry. Results include
                AI-suggested lead status for smarter outreach.
              </div>
            </div>
            <div className="flex items-center gap-6 mt-2">
              {[
                {
                  icon: Flame,
                  label: "Hot leads",
                  desc: "C-suite in Tech/Finance/Healthcare",
                },
                {
                  icon: Zap,
                  label: "Warm leads",
                  desc: "Managers & Senior roles",
                },
                {
                  icon: Snowflake,
                  label: "Cold leads",
                  desc: "All other roles",
                },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="text-center">
                  <Icon className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <div className="text-xs font-semibold text-foreground">
                    {label}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3"
            data-ocid="pf-loading-state"
          >
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <div className="text-sm font-medium text-foreground">
              Searching LinkedIn profiles…
            </div>
            <div className="text-xs text-muted-foreground">
              Applying AI status scoring to results
            </div>
          </div>
        )}

        {committed && !loading && (
          <div className="px-5 py-3" data-ocid="pf-results">
            {/* Result summary */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-bold text-foreground">
                  {results.length}
                </span>
                <span className="text-muted-foreground">prospects found</span>
              </div>
              {results.length > 0 && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="badge-hot py-0.5">
                      <Flame className="w-3 h-3" />
                      {hotCount} Hot
                    </span>
                    <span className="badge-warm py-0.5">
                      <Zap className="w-3 h-3" />
                      {warmCount} Warm
                    </span>
                    <span className="badge-cold py-0.5">
                      <Snowflake className="w-3 h-3" />
                      {results.length - hotCount - warmCount} Cold
                    </span>
                  </div>
                  {selectedIds.size > 0 && (
                    <span className="text-xs text-primary font-semibold ml-auto">
                      {selectedIds.size} selected
                    </span>
                  )}
                </>
              )}
            </div>

            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Search className="w-8 h-8 text-muted-foreground/40" />
                <div className="text-sm font-medium text-muted-foreground">
                  No prospects match your criteria
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-primary hover:underline"
                  data-ocid="pf-no-results-reset"
                >
                  Try broader filters
                </button>
              </div>
            ) : (
              <div className="border border-border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="contact-table w-full">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="px-3 py-2 text-left w-8">
                          <input
                            type="checkbox"
                            className="filter-checkbox w-3.5 h-3.5"
                            checked={
                              selectedIds.size === results.length &&
                              results.length > 0
                            }
                            onChange={toggleAll}
                            aria-label="Select all prospects"
                            data-ocid="pf-select-all"
                          />
                        </th>
                        <th className="px-2 py-2 text-left">
                          <button
                            type="button"
                            onClick={() => toggleSort("name")}
                            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                          >
                            Name <SortIcon field="name" />
                          </button>
                        </th>
                        <th className="px-2 py-2 text-left">
                          <button
                            type="button"
                            onClick={() => toggleSort("designation")}
                            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                          >
                            Designation <SortIcon field="designation" />
                          </button>
                        </th>
                        <th className="px-2 py-2 text-left">
                          <button
                            type="button"
                            onClick={() => toggleSort("company")}
                            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground hidden md:table-cell"
                          >
                            Company <SortIcon field="company" />
                          </button>
                        </th>
                        <th className="px-2 py-2 text-left hidden lg:table-cell">
                          <button
                            type="button"
                            onClick={() => toggleSort("industry")}
                            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                          >
                            Industry <SortIcon field="industry" />
                          </button>
                        </th>
                        <th className="px-2 py-2 text-left hidden lg:table-cell">
                          <button
                            type="button"
                            onClick={() => toggleSort("city")}
                            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
                          >
                            Location <SortIcon field="city" />
                          </button>
                        </th>
                        <th className="px-2 py-2 text-left hidden xl:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          AI Status
                        </th>
                        <th className="px-2 py-2 text-left hidden md:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Connect
                        </th>
                        <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((prospect) => {
                        const isAdded = addedIds.has(prospect.id);
                        const isSelected = selectedIds.has(prospect.id);
                        return (
                          <tr
                            key={prospect.id}
                            className={`contact-row ${isSelected ? "bg-primary/5" : ""}`}
                            data-ocid={`prospect-row-${prospect.id}`}
                          >
                            <td className="contact-cell px-3">
                              <input
                                type="checkbox"
                                className="filter-checkbox w-3.5 h-3.5"
                                checked={isSelected}
                                onChange={() => toggleSelect(prospect.id)}
                                aria-label={`Select ${prospect.name}`}
                                data-ocid={`pf-checkbox-${prospect.id}`}
                              />
                            </td>
                            <td className="contact-cell">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-primary">
                                  {prospect.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-foreground truncate max-w-28">
                                    {prospect.name}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {prospect.followers.toLocaleString()}{" "}
                                    followers
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="contact-cell">
                              <span className="text-xs text-foreground truncate max-w-32 block">
                                {prospect.designation}
                              </span>
                            </td>
                            <td className="contact-cell hidden md:table-cell">
                              <div className="flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs text-foreground truncate max-w-28">
                                  {prospect.company}
                                </span>
                              </div>
                            </td>
                            <td className="contact-cell hidden lg:table-cell">
                              <span className="text-xs text-muted-foreground">
                                {prospect.industry}
                              </span>
                            </td>
                            <td className="contact-cell hidden lg:table-cell">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {prospect.city}, {prospect.country}
                                </span>
                              </div>
                            </td>
                            <td className="contact-cell hidden xl:table-cell">
                              <span className="text-xs font-mono text-foreground">
                                {prospect.phone}
                              </span>
                            </td>
                            <td className="contact-cell">
                              <StatusBadge status={prospect.aiStatus} />
                            </td>
                            <td className="contact-cell hidden md:table-cell">
                              <DegreeTag degree={prospect.connectionDegree} />
                            </td>
                            <td className="contact-cell text-right">
                              <div className="flex items-center justify-end gap-1">
                                <a
                                  href={prospect.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                                  aria-label="View LinkedIn profile"
                                  data-ocid={`pf-linkedin-${prospect.id}`}
                                >
                                  <Linkedin className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  type="button"
                                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                  aria-label="Call prospect"
                                  data-ocid={`pf-call-${prospect.id}`}
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={isAdded}
                                  onClick={() => {
                                    leadsStore.addLeads([
                                      prospectToLead(prospect),
                                    ]);
                                    setAddedIds(
                                      (prev) => new Set([...prev, prospect.id]),
                                    );
                                  }}
                                  className="px-2 py-0.5 rounded text-[10px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-default bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 whitespace-nowrap"
                                  aria-label={
                                    isAdded ? "Added to leads" : "Add to leads"
                                  }
                                  data-ocid={`pf-add-lead-${prospect.id}`}
                                >
                                  {isAdded ? "✓ Added" : "+ Lead"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
