import React, { useState, useEffect } from "react";
import styles from "./EnquiryDetailDrawer.module.css";
import { ExtractedEnquiryFields } from "@/lib/mockData";

interface FollowUpLink {
  id: string;
  fromName: string;
  receivedAt: string;
  summary: string;
}

interface DetailedEnquiry {
  id: string;
  originalText: string;
  fromName: string;
  fromEmail: string;
  company: string;
  receivedAt: string;
  status: string;
  priority: string;
  processingStatus: string;
  serviceLine: string;
  summary: string;
  budget: string;
  timeline: string;
  isGenuine: boolean;
  isFollowUp: boolean;
  parentId: string | null;
  currentFields: string;
  originalFields: string;
  errorMessage: string | null;
  parent: FollowUpLink | null;
  followUps: FollowUpLink[];
}

interface EnquiryDetailDrawerProps {
  enquiryId: string;
  onClose: () => void;
  onUpdated: () => void;
  onSelectAnother: (id: string) => void;
  onTriggerReextract: (currentFields: ExtractedEnquiryFields, newFields: ExtractedEnquiryFields) => void;
}

export default function EnquiryDetailDrawer({
  enquiryId,
  onClose,
  onUpdated,
  onSelectAnother,
  onTriggerReextract,
}: EnquiryDetailDrawerProps) {
  const [enquiry, setEnquiry] = useState<DetailedEnquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reextracting, setReextracting] = useState(false);
  
  // Form values
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [serviceLine, setServiceLine] = useState("");
  const [summary, setSummary] = useState("");
  const [budgetRaw, setBudgetRaw] = useState("");
  const [timelineRaw, setTimelineRaw] = useState("");
  const [isGenuine, setIsGenuine] = useState(true);
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");

  const fetchEnquiryDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/enquiries/${enquiryId}`);
      if (!res.ok) throw new Error("Failed to fetch details");
      const data: DetailedEnquiry = await res.json();
      setEnquiry(data);
      
      // Parse the currentFields JSON to initialize the form
      const fields: ExtractedEnquiryFields = JSON.parse(data.currentFields || "{}");
      setCompany(fields.company || data.company || "Unknown");
      setContactName(fields.contactName || data.fromName || "Unknown");
      setContactEmail(fields.contactEmail || data.fromEmail || "n/a");
      setServiceLine(fields.serviceLine || data.serviceLine.toLowerCase() || "other");
      setSummary(fields.summary || data.summary || "");
      setBudgetRaw(fields.budgetRaw || data.budget || "");
      setTimelineRaw(fields.timelineRaw || data.timeline || "");
      setIsGenuine(fields.isGenuine !== undefined ? fields.isGenuine : data.isGenuine);
      setPriority(data.priority);
      setStatus(data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiryDetails();
  }, [enquiryId]);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    try {
      await fetch(`/api/enquiries/${enquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fieldsUpdate = {
        company,
        contactName,
        contactEmail,
        serviceLine,
        summary,
        timelineRaw,
        budgetRaw,
        isGenuine,
      };

      const res = await fetch(`/api/enquiries/${enquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priority,
          status,
          isGenuine,
          fields: fieldsUpdate,
        }),
      });

      if (!res.ok) throw new Error("Failed to save changes");
      
      onUpdated();
      // Reload details to reflect database changes
      fetchEnquiryDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReextract = async () => {
    setReextracting(true);
    try {
      const res = await fetch(`/api/enquiries/${enquiryId}/reextract`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Re-extraction failed");
      const data = await res.json();
      
      const parsedCurrent: ExtractedEnquiryFields = JSON.parse(enquiry?.currentFields || "{}");
      onTriggerReextract(parsedCurrent, data.extractedFields);
    } catch (err) {
      console.error(err);
      alert("Re-extraction failed. Please ensure GEMINI_API_KEY is configured.");
    } finally {
      setReextracting(false);
    }
  };

  const handleSplit = async () => {
    if (!confirm("Are you sure you want to split this enquiry into two projects? This will duplicate the entry and set up two separate records to manage.")) return;
    
    try {
      const res = await fetch(`/api/enquiries/${enquiryId}/split`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to split enquiry");
      const data = await res.json();
      
      onUpdated();
      onSelectAnother(data.splitId); // Automatically open the newly split project!
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className={styles.drawerLoading}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading enquiry details...</p>
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className={styles.drawerError}>
        <p>Enquiry details not found.</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  const steps = ["NEW", "CONTACTED", "QUALIFIED", "DROPPED"];

  return (
    <div className={`glass-panel ${styles.drawer}`}>
      <div className={styles.drawerHeader}>
        <div>
          <h2>Enquiry Details</h2>
          <span className={styles.dateHeader}>
            Received on {new Date(enquiry.receivedAt).toLocaleString()}
          </span>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      {/* Stepper Workflow status */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepper}>
          {steps.map((step, idx) => {
            const isActive = status === step;
            const isCompleted = steps.indexOf(status) >= idx;
            return (
              <React.Fragment key={step}>
                <button
                  className={`${styles.step} ${isActive ? styles.stepActive : ""} ${
                    isCompleted ? styles.stepCompleted : ""
                  }`}
                  onClick={() => handleStatusChange(step)}
                  type="button"
                >
                  <div className={styles.stepCircle}>{idx + 1}</div>
                  <div className={styles.stepLabel}>{step}</div>
                </button>
                {idx < steps.length - 1 && (
                  <div 
                    className={`${styles.stepConnector} ${
                      steps.indexOf(status) > idx ? styles.connectorCompleted : ""
                    }`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className={styles.drawerBody}>
        {/* Left Column: Original Email Content */}
        <div className={styles.originalPanel}>
          <div className={styles.panelTitle}>✉ Raw Inbound Message</div>
          <div className={styles.originalMeta}>
            <div><strong>From:</strong> {enquiry.fromName}</div>
            <div><strong>Email:</strong> {enquiry.fromEmail}</div>
          </div>
          <pre className={styles.rawText}>{enquiry.originalText}</pre>
          
          {/* Thread / Double submission links */}
          {enquiry.parent && (
            <div className={styles.threadBox}>
              <div className={styles.threadTitle}>🔗 Parent Enquiry (Thread)</div>
              <button 
                onClick={() => onSelectAnother(enquiry.parent!.id)}
                className={styles.threadLink}
              >
                Go to original: {enquiry.parent.fromName} ({new Date(enquiry.parent.receivedAt).toLocaleDateString()})
              </button>
            </div>
          )}
          
          {enquiry.followUps.length > 0 && (
            <div className={styles.threadBox}>
              <div className={styles.threadTitle}>🔗 Follow-up Enquiries ({enquiry.followUps.length})</div>
              <div className={styles.threadList}>
                {enquiry.followUps.map((child) => (
                  <button 
                    key={child.id}
                    onClick={() => onSelectAnother(child.id)}
                    className={styles.threadLink}
                  >
                    • Follow-up: {child.fromName} ({new Date(child.receivedAt).toLocaleDateString()})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Extracted Fields Edit Form */}
        <form className={styles.formPanel} onSubmit={handleSave}>
          <div className={styles.panelTitle}>📊 Extracted Data & Heuristics</div>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Company</label>
              <input 
                type="text" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Contact Name</label>
              <input 
                type="text" 
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Contact Email</label>
              <input 
                type="text" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Service Category</label>
              <select 
                value={serviceLine}
                onChange={(e) => setServiceLine(e.target.value)}
              >
                <option value="ai">AI</option>
                <option value="blockchain">Blockchain</option>
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
                <option value="game">Game</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>One-line Summary</label>
              <input 
                type="text" 
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Budget (Raw)</label>
              <input 
                type="text" 
                value={budgetRaw}
                onChange={(e) => setBudgetRaw(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Timeline (Raw)</label>
              <input 
                type="text" 
                value={timelineRaw}
                onChange={(e) => setTimelineRaw(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Assigned Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Genuineness</label>
              <div className={styles.checkboxWrapper}>
                <input 
                  type="checkbox" 
                  id="isGenuine"
                  checked={isGenuine}
                  onChange={(e) => setIsGenuine(e.target.checked)}
                  className={styles.formCheckbox}
                />
                <label htmlFor="isGenuine" className={styles.checkboxLabel}>
                  {isGenuine ? "✓ Genuine project request" : "✗ Spam / Non-genuine"}
                </label>
              </div>
            </div>
          </div>

          <div className={styles.drawerActions}>
            <div className={styles.actionLeft}>
              <button 
                type="button" 
                className={styles.reextractBtn}
                onClick={handleReextract}
                disabled={reextracting || saving}
              >
                {reextracting ? "Extracting..." : "🔄 Re-run AI Extraction"}
              </button>
              
              <button 
                type="button" 
                className={styles.splitBtn}
                onClick={handleSplit}
                disabled={reextracting || saving}
                title="Clones this record to manage as two separate projects"
              >
                ✂ Split Project
              </button>
            </div>

            <button 
              type="submit" 
              className={styles.saveBtn}
              disabled={saving || reextracting}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
