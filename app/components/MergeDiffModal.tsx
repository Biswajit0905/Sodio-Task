import React, { useState } from "react";
import styles from "./MergeDiffModal.module.css";
import { ExtractedEnquiryFields } from "@/lib/mockData";

interface MergeDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFields: ExtractedEnquiryFields;
  newFields: ExtractedEnquiryFields;
  onApply: (mergedFields: ExtractedEnquiryFields) => void;
}

export default function MergeDiffModal({
  isOpen,
  onClose,
  currentFields,
  newFields,
  onApply,
}: MergeDiffModalProps) {
  // State tracking which newly extracted fields should overwrite current ones
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(() => {
    const diffs: Record<string, boolean> = {};
    // Detect which fields are actually different, and default them to false (do NOT overwrite human corrections by default!)
    // This is a very safe design decision. The user must explicitly check them to overwrite.
    Object.keys(newFields).forEach((key) => {
      const currentVal = String(currentFields[key as keyof ExtractedEnquiryFields]);
      const newVal = String(newFields[key as keyof ExtractedEnquiryFields]);
      if (currentVal !== newVal) {
        diffs[key] = false; // Default: do NOT overwrite (protect human corrections)
      }
    });
    return diffs;
  });

  if (!isOpen) return null;

  const fieldsToCompare = [
    { key: "company", label: "Company" },
    { key: "contactName", label: "Contact Name" },
    { key: "contactEmail", label: "Contact Email" },
    { key: "serviceLine", label: "Service Line" },
    { key: "budgetRaw", label: "Budget (Raw)" },
    { key: "timelineRaw", label: "Timeline (Raw)" },
    { key: "summary", label: "Summary" },
    { key: "isGenuine", label: "Genuine Enquiry" },
  ];

  const handleToggle = (key: string) => {
    setSelectedFields((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = (val: boolean) => {
    const updated: Record<string, boolean> = {};
    Object.keys(selectedFields).forEach((key) => {
      updated[key] = val;
    });
    setSelectedFields(updated);
  };

  const handleConfirm = () => {
    // Construct the merged fields object
    const merged = { ...currentFields };
    Object.keys(newFields).forEach((key) => {
      // Overwrite only if selected by the user
      if (selectedFields[key]) {
        // @ts-ignore
        merged[key] = newFields[key];
      }
    });
    onApply(merged);
  };

  return (
    <div className={styles.overlay}>
      <div className={`glass-panel ${styles.modal}`}>
        <div className={styles.modalHeader}>
          <h2>Compare & Merge Extracted Fields</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.desc}>
            We re-ran the AI extraction. Below is a comparison against your current saved data.
            <strong> Human corrections are protected.</strong> Check any field below if you want to overwrite it with the newly extracted value.
          </p>

          <div className={styles.bulkActions}>
            <button className={styles.actionLink} onClick={() => handleSelectAll(true)}>
              ✓ Select All New Values
            </button>
            <span className={styles.divider}>|</span>
            <button className={styles.actionLink} onClick={() => handleSelectAll(false)}>
              ✗ Keep All Current Values
            </button>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "40px" }}>Apply</th>
                <th>Field</th>
                <th>Current Value (Saved)</th>
                <th>Newly Extracted (AI)</th>
              </tr>
            </thead>
            <tbody>
              {fieldsToCompare.map(({ key, label }) => {
                const currentVal = String(currentFields[key as keyof ExtractedEnquiryFields] ?? "");
                const newVal = String(newFields[key as keyof ExtractedEnquiryFields] ?? "");
                const isDifferent = currentVal !== newVal;
                
                return (
                  <tr 
                    key={key} 
                    className={`${styles.row} ${isDifferent ? styles.diffRow : ""}`}
                  >
                    <td>
                      {isDifferent ? (
                        <input
                          type="checkbox"
                          checked={selectedFields[key] || false}
                          onChange={() => handleToggle(key)}
                          className={styles.checkbox}
                        />
                      ) : (
                        <span className={styles.matchCheck}>✓</span>
                      )}
                    </td>
                    <td className={styles.fieldName}>{label}</td>
                    <td className={isDifferent ? styles.currentValCell : ""}>
                      {key === "isGenuine" ? (currentVal === "true" ? "Genuine" : "Spam/Non-genuine") : currentVal}
                    </td>
                    <td className={isDifferent ? styles.newValCell : ""}>
                      {key === "isGenuine" ? (newVal === "true" ? "Genuine" : "Spam/Non-genuine") : newVal}
                      {isDifferent && !selectedFields[key] && (
                        <span className={styles.ignoredBadge}>Pending approval</span>
                      )}
                      {isDifferent && selectedFields[key] && (
                        <span className={styles.acceptedBadge}>To overwrite</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.applyBtn} onClick={handleConfirm}>
            Apply Selected Changes
          </button>
        </div>
      </div>
    </div>
  );
}
