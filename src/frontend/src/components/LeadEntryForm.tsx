import type { Lead } from "@/types";
import { buildLeadFromFormData } from "@/utils/leadBuilder";
import type { LeadFormData } from "@/utils/leadBuilder";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LeadEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  prefill?: Partial<LeadFormData>;
  title?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const REGIONS = [
  "North",
  "East",
  "West",
  "South",
  "ROM",
  "Trading",
  "Agency",
] as const;

const EH_MAP: Record<string, string> = {
  North: "North India EH",
  East: "East India EH",
  West: "West India EH",
  South: "South India EH",
  ROM: "Rest of Market EH",
  Trading: "Trading Desk EH",
  Agency: "Agency Head EH",
};

function emptyForm(): LeadFormData {
  return {
    source: "",
    channel: "",
    clientContactPerson: "",
    clientMobileNumber: "",
    clientEmailId: "",
    clientCompanyName: "",
    category: "",
    headOffice: "",
    requirements: "",
    duration: "",
    budget: "",
    reportingManager: "",
    salesperson: "",
    remarks: "",
    detailsRequestedViaWhatsApp: false,
    enquiryForwardedThrough: "",
    typeOfInquiry: "",
    connectedStatus: "",
    stage: "",
    campaignLocation: "",
    region: "",
    ehRegion: "",
    revenueDisplayAmount: "",
  };
}

// ─── Field sub-components (no state, pure display) ────────────────────────────

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        color: "#d1d5db",
        fontSize: "0.75rem",
        fontWeight: 500,
        marginBottom: "0.25rem",
      }}
    >
      {children}
      {required && (
        <span style={{ color: "#f87171", marginLeft: "0.1rem" }}>*</span>
      )}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#1f2937",
  border: "1px solid #4b5563",
  color: "#ffffff",
  borderRadius: "0.375rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.8rem",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "auto",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "5rem",
  resize: "vertical",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadEntryForm({
  isOpen,
  onClose,
  onSave,
  prefill,
  title = "Add New Lead",
}: LeadEntryFormProps) {
  const [formData, setFormData] = useState<LeadFormData>(() => ({
    ...emptyForm(),
    ...(prefill ?? {}),
  }));

  const [errors, setErrors] = useState<{ name?: string; region?: string }>({});
  const [saved, setSaved] = useState(false);

  // Use a ref to hold latest prefill so the effect has a stable dep (isOpen only)
  const prefillRef = useRef(prefill);
  prefillRef.current = prefill;

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...emptyForm(), ...(prefillRef.current ?? {}) });
      setErrors({});
      setSaved(false);
    }
  }, [isOpen]);

  const handleChange = (field: keyof LeadFormData, value: string | boolean) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-suggest EH Region from Region
      if (field === "region" && typeof value === "string") {
        next.ehRegion = EH_MAP[value] ?? "";
      }
      return next;
    });
  };

  function validate(): boolean {
    const newErrors: { name?: string; region?: string } = {};
    if (!formData.clientContactPerson.trim()) {
      newErrors.name = "Client Contact Person is required";
    }
    if (!formData.region.trim()) {
      newErrors.region = "Region is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const lead = buildLeadFromFormData(formData);
    onSave(lead);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  }

  if (!isOpen) return null;

  return (
    // Outer wrapper: full screen overlay, flex center. onClick here closes modal.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      data-ocid="lead-form.dialog"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Backdrop — purely visual, pointer-events: none so it NEVER intercepts clicks */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          pointerEvents: "none",
        }}
      />

      {/* Form container — stops click propagation to wrapper (closes modal on outside click), pointer-events: auto */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        data-ocid="lead-form.modal"
        style={{
          position: "relative",
          zIndex: 1,
          pointerEvents: "auto",
          width: "100%",
          maxWidth: "900px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#111827",
          border: "1px solid #374151",
          borderRadius: "0.75rem",
          boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid #374151",
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                color: "#f9fafb",
                fontSize: "0.9rem",
                fontWeight: 700,
                margin: 0,
              }}
            >
              {title}
            </h2>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "0.7rem",
                margin: "0.2rem 0 0 0",
              }}
            >
              Fields marked <span style={{ color: "#f87171" }}>*</span> are
              required
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-ocid="lead-form.close_button"
            aria-label="Close form"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              padding: "0.4rem",
              borderRadius: "0.375rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#1f2937";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "transparent";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            {/* 1. Source */}
            <div>
              <FieldLabel htmlFor="lf-source">Source</FieldLabel>
              <select
                id="lf-source"
                value={formData.source}
                onChange={(e) => handleChange("source", e.target.value)}
                style={selectStyle}
                data-ocid="lead-form.source.select"
              >
                <option value="">Select source…</option>
                {[
                  "Inbound Call",
                  "Outbound Call",
                  "Email",
                  "WhatsApp",
                  "LinkedIn",
                  "Referral",
                  "Website",
                  "Walk-in",
                  "Other",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Channel */}
            <div>
              <FieldLabel htmlFor="lf-channel">Channel</FieldLabel>
              <select
                id="lf-channel"
                value={formData.channel}
                onChange={(e) => handleChange("channel", e.target.value)}
                style={selectStyle}
                data-ocid="lead-form.channel.select"
              >
                <option value="">Select channel…</option>
                {[
                  "Phone",
                  "WhatsApp",
                  "Email",
                  "LinkedIn",
                  "Website",
                  "In-Person",
                  "Other",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Client Contact Person (required) */}
            <div>
              <FieldLabel htmlFor="lf-name" required>
                Client Contact Person
              </FieldLabel>
              <input
                id="lf-name"
                type="text"
                value={formData.clientContactPerson}
                onChange={(e) =>
                  handleChange("clientContactPerson", e.target.value)
                }
                placeholder="Full name"
                style={{
                  ...inputStyle,
                  borderColor: errors.name ? "#f87171" : "#4b5563",
                }}
                data-ocid="lead-form.name.input"
              />
              {errors.name && (
                <p
                  style={{
                    color: "#f87171",
                    fontSize: "0.7rem",
                    marginTop: "0.25rem",
                  }}
                  data-ocid="lead-form.name.field_error"
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* 4. Client Mobile Number */}
            <div>
              <FieldLabel htmlFor="lf-phone">Client Mobile Number</FieldLabel>
              <input
                id="lf-phone"
                type="tel"
                value={formData.clientMobileNumber}
                onChange={(e) =>
                  handleChange("clientMobileNumber", e.target.value)
                }
                placeholder="+91 XXXXX XXXXX"
                style={inputStyle}
                data-ocid="lead-form.phone.input"
              />
            </div>

            {/* 5. Client Email ID */}
            <div>
              <FieldLabel htmlFor="lf-email">Client Email ID</FieldLabel>
              <input
                id="lf-email"
                type="email"
                value={formData.clientEmailId}
                onChange={(e) => handleChange("clientEmailId", e.target.value)}
                placeholder="email@company.com"
                style={inputStyle}
                data-ocid="lead-form.email.input"
              />
            </div>

            {/* 6. Client Company Name */}
            <div>
              <FieldLabel htmlFor="lf-company">Client Company Name</FieldLabel>
              <input
                id="lf-company"
                type="text"
                value={formData.clientCompanyName}
                onChange={(e) =>
                  handleChange("clientCompanyName", e.target.value)
                }
                placeholder="Company name"
                style={inputStyle}
                data-ocid="lead-form.company.input"
              />
            </div>

            {/* 7. Category */}
            <div>
              <FieldLabel htmlFor="lf-category">Category</FieldLabel>
              <select
                id="lf-category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                style={selectStyle}
                data-ocid="lead-form.category.select"
              >
                <option value="">Select category…</option>
                {[
                  "Agency",
                  "Brand",
                  "Media Owner",
                  "Trading Desk",
                  "Government",
                  "SME",
                  "Other",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* 8. Head Office */}
            <div>
              <FieldLabel htmlFor="lf-headoffice">Head Office</FieldLabel>
              <input
                id="lf-headoffice"
                type="text"
                value={formData.headOffice}
                onChange={(e) => handleChange("headOffice", e.target.value)}
                placeholder="City / office location"
                style={inputStyle}
                data-ocid="lead-form.headoffice.input"
              />
            </div>

            {/* 9. Requirements (full width) */}
            <div style={{ gridColumn: "1 / -1" }}>
              <FieldLabel htmlFor="lf-requirements">Requirements</FieldLabel>
              <textarea
                id="lf-requirements"
                value={formData.requirements}
                onChange={(e) => handleChange("requirements", e.target.value)}
                placeholder="Describe the client's requirements…"
                style={textareaStyle}
                data-ocid="lead-form.requirements.textarea"
              />
            </div>

            {/* 10. Duration */}
            <div>
              <FieldLabel htmlFor="lf-duration">Duration</FieldLabel>
              <input
                id="lf-duration"
                type="text"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                placeholder="e.g. 3 months"
                style={inputStyle}
                data-ocid="lead-form.duration.input"
              />
            </div>

            {/* 11. Budget */}
            <div>
              <FieldLabel htmlFor="lf-budget">Budget</FieldLabel>
              <input
                id="lf-budget"
                type="text"
                value={formData.budget}
                onChange={(e) => handleChange("budget", e.target.value)}
                placeholder="e.g. ₹5,00,000"
                style={inputStyle}
                data-ocid="lead-form.budget.input"
              />
            </div>

            {/* 12. Reporting Manager */}
            <div>
              <FieldLabel htmlFor="lf-rm">Reporting Manager</FieldLabel>
              <input
                id="lf-rm"
                type="text"
                value={formData.reportingManager}
                onChange={(e) =>
                  handleChange("reportingManager", e.target.value)
                }
                placeholder="Manager name"
                style={inputStyle}
                data-ocid="lead-form.reporting_manager.input"
              />
            </div>

            {/* 13. Salesperson */}
            <div>
              <FieldLabel htmlFor="lf-sales">Salesperson</FieldLabel>
              <input
                id="lf-sales"
                type="text"
                value={formData.salesperson}
                onChange={(e) => handleChange("salesperson", e.target.value)}
                placeholder="Salesperson name"
                style={inputStyle}
                data-ocid="lead-form.salesperson.input"
              />
            </div>

            {/* 14. Remarks (full width) */}
            <div style={{ gridColumn: "1 / -1" }}>
              <FieldLabel htmlFor="lf-remarks">Remarks</FieldLabel>
              <textarea
                id="lf-remarks"
                value={formData.remarks}
                onChange={(e) => handleChange("remarks", e.target.value)}
                placeholder="Any additional notes or remarks…"
                style={{ ...textareaStyle, minHeight: "4rem" }}
                data-ocid="lead-form.remarks.textarea"
              />
            </div>

            {/* 15. Details Requested via WhatsApp (full width) */}
            <div style={{ gridColumn: "1 / -1" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.625rem 0.75rem",
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                }}
              >
                <label
                  htmlFor="lf-wa-details"
                  style={{
                    color: "#e5e7eb",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Details Requested via WhatsApp
                </label>
                <input
                  id="lf-wa-details"
                  type="checkbox"
                  checked={formData.detailsRequestedViaWhatsApp}
                  onChange={(e) =>
                    handleChange(
                      "detailsRequestedViaWhatsApp",
                      e.target.checked,
                    )
                  }
                  style={{
                    width: "1.1rem",
                    height: "1.1rem",
                    cursor: "pointer",
                    accentColor: "#6366f1",
                  }}
                  data-ocid="lead-form.wa_details.checkbox"
                />
              </div>
            </div>

            {/* 16. Enquiry Forwarded Through */}
            <div>
              <FieldLabel htmlFor="lf-eft">
                Enquiry Forwarded Through
              </FieldLabel>
              <input
                id="lf-eft"
                type="text"
                value={formData.enquiryForwardedThrough}
                onChange={(e) =>
                  handleChange("enquiryForwardedThrough", e.target.value)
                }
                placeholder="e.g. WhatsApp / Email"
                style={inputStyle}
                data-ocid="lead-form.enquiry_forwarded.input"
              />
            </div>

            {/* 17. Type of Inquiry */}
            <div>
              <FieldLabel htmlFor="lf-toi">Type of Inquiry</FieldLabel>
              <select
                id="lf-toi"
                value={formData.typeOfInquiry}
                onChange={(e) => handleChange("typeOfInquiry", e.target.value)}
                style={selectStyle}
                data-ocid="lead-form.type_of_inquiry.select"
              >
                <option value="">Select type…</option>
                {[
                  "New Business",
                  "Upsell",
                  "Renewal",
                  "Partnership",
                  "Other",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* 18. Connected Status */}
            <div>
              <FieldLabel htmlFor="lf-cs">Connected Status</FieldLabel>
              <select
                id="lf-cs"
                value={formData.connectedStatus}
                onChange={(e) =>
                  handleChange("connectedStatus", e.target.value)
                }
                style={selectStyle}
                data-ocid="lead-form.connected_status.select"
              >
                <option value="">Select status…</option>
                {[
                  "Connected",
                  "Not Connected",
                  "Callback Requested",
                  "Voicemail Left",
                  "Busy",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* 19. Stage */}
            <div>
              <FieldLabel htmlFor="lf-stage">Stage</FieldLabel>
              <select
                id="lf-stage"
                value={formData.stage}
                onChange={(e) => handleChange("stage", e.target.value)}
                style={selectStyle}
                data-ocid="lead-form.stage.select"
              >
                <option value="">Select stage…</option>
                {[
                  "New Lead",
                  "Contacted",
                  "Qualified",
                  "Proposal Sent",
                  "Negotiation",
                  "Won",
                  "Lost",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* 20. Campaign Location */}
            <div>
              <FieldLabel htmlFor="lf-cloc">Campaign Location</FieldLabel>
              <input
                id="lf-cloc"
                type="text"
                value={formData.campaignLocation}
                onChange={(e) =>
                  handleChange("campaignLocation", e.target.value)
                }
                placeholder="City / location"
                style={inputStyle}
                data-ocid="lead-form.campaign_location.input"
              />
            </div>

            {/* 21. Region (required) */}
            <div>
              <FieldLabel htmlFor="lf-region" required>
                Region
              </FieldLabel>
              <select
                id="lf-region"
                value={formData.region}
                onChange={(e) => handleChange("region", e.target.value)}
                style={{
                  ...selectStyle,
                  borderColor: errors.region ? "#f87171" : "#4b5563",
                }}
                data-ocid="lead-form.region.select"
              >
                <option value="">Select region…</option>
                {REGIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              {errors.region && (
                <p
                  style={{
                    color: "#f87171",
                    fontSize: "0.7rem",
                    marginTop: "0.25rem",
                  }}
                  data-ocid="lead-form.region.field_error"
                >
                  {errors.region}
                </p>
              )}
            </div>

            {/* 22. EH Region */}
            <div>
              <FieldLabel htmlFor="lf-ehregion">EH Region</FieldLabel>
              <input
                id="lf-ehregion"
                type="text"
                value={formData.ehRegion}
                onChange={(e) => handleChange("ehRegion", e.target.value)}
                placeholder="Auto-filled from Region"
                style={inputStyle}
                data-ocid="lead-form.eh_region.input"
              />
            </div>

            {/* 23. Revenue (Display Amount) */}
            <div style={{ gridColumn: "1 / -1" }}>
              <FieldLabel htmlFor="lf-revenue">
                Revenue (Display Amount)
              </FieldLabel>
              <input
                id="lf-revenue"
                type="text"
                value={formData.revenueDisplayAmount}
                onChange={(e) =>
                  handleChange("revenueDisplayAmount", e.target.value)
                }
                placeholder="e.g. ₹10,00,000"
                style={inputStyle}
                data-ocid="lead-form.revenue.input"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.5rem",
            padding: "0.875rem 1.5rem",
            borderTop: "1px solid #374151",
            flexShrink: 0,
          }}
        >
          {saved && (
            <span
              style={{
                color: "#34d399",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginRight: "auto",
              }}
              data-ocid="lead-form.success_state"
            >
              ✓ Lead saved!
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            data-ocid="lead-form.cancel_button"
            style={{
              padding: "0.45rem 1rem",
              borderRadius: "0.375rem",
              border: "1px solid #4b5563",
              backgroundColor: "transparent",
              color: "#d1d5db",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            data-ocid="lead-form.submit_button"
            style={{
              padding: "0.45rem 1.25rem",
              borderRadius: "0.375rem",
              border: "none",
              backgroundColor: "#4f46e5",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            Save Lead
          </button>
        </div>
      </div>
    </div>
  );
}
