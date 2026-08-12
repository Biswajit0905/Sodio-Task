"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import IngestPanel from "./components/IngestPanel";
import ProgressBar from "./components/ProgressBar";
import EnquiryList from "./components/EnquiryList";
import EnquiryDetailDrawer from "./components/EnquiryDetailDrawer";
import MergeDiffModal from "./components/MergeDiffModal";
import { ExtractedEnquiryFields } from "@/lib/mockData";
import styles from "./page.module.css";

interface EnquiryItem {
  id: string;
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
  errorMessage: string | null;
  currentFields: string;
}

export default function Home() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Diff Merge Modal State
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [diffCurrentFields, setDiffCurrentFields] = useState<ExtractedEnquiryFields | null>(null);
  const [diffNewFields, setDiffNewFields] = useState<ExtractedEnquiryFields | null>(null);

  // Filters State
  const [filters, setFilters] = useState({
    search: "",
    serviceLine: "ALL",
    priority: "ALL",
    status: "ALL",
    isGenuine: "ALL",
    sortBy: "receivedAt",
    sortOrder: "desc",
  });

  // Success/Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch Enquiries from API
  const fetchEnquiries = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        serviceLine: filters.serviceLine,
        priority: filters.priority,
        status: filters.status,
        isGenuine: filters.isGenuine,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        q: filters.search,
      });

      const res = await fetch(`/api/enquiries?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch enquiries");
      const data: EnquiryItem[] = await res.json();
      setEnquiries(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [filters]);

  // Initial fetch and fetch when filters change
  useEffect(() => {
    fetchEnquiries(true);
  }, [fetchEnquiries]);

  // Poll for status updates if there are pending or processing items in the database
  useEffect(() => {
    const hasActiveQueue = enquiries.some(
      (item) => item.processingStatus === "PENDING" || item.processingStatus === "PROCESSING"
    );

    if (!hasActiveQueue) return;

    // Poll every 1.5 seconds during active batch processing
    const interval = setInterval(() => {
      fetchEnquiries(false);
    }, 1500);

    return () => clearInterval(interval);
  }, [enquiries, fetchEnquiries]);

  const handleIngested = (msg: string) => {
    showToast(msg);
    fetchEnquiries(false);
  };

  const handleRetryExtraction = async (id: string) => {
    try {
      // Set to processing locally first
      setEnquiries((prev) =>
        prev.map((item) =>
          item.id === id 
            ? { ...item, processingStatus: "PROCESSING", errorMessage: null } 
            : item
        )
      );

      const res = await fetch(`/api/enquiries/${id}/reextract`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Retry failed");
      const data = await res.json();

      // Update database with newly extracted fields directly (safe because this is a retry from a failed state, no human edits exist yet!)
      await fetch(`/api/enquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processingStatus: "COMPLETED",
          fields: data.extractedFields,
        }),
      });

      showToast("Enquiry successfully extracted!");
      fetchEnquiries(false);
      
      // Refresh details drawer if it was opened for this id
      if (selectedId === id) {
        setSelectedId(null);
        setTimeout(() => setSelectedId(id), 10);
      }
    } catch (err: any) {
      console.error(err);
      // Revert to failed state with error message
      setEnquiries((prev) =>
        prev.map((item) =>
          item.id === id 
            ? { ...item, processingStatus: "FAILED", errorMessage: err.message || "Retry failed" } 
            : item
        )
      );
      showToast(`Retry failed: ${err.message || "Unknown error"}`);
    }
  };

  const triggerMergeDiff = (current: ExtractedEnquiryFields, extracted: ExtractedEnquiryFields) => {
    setDiffCurrentFields(current);
    setDiffNewFields(extracted);
    setDiffModalOpen(true);
  };

  const handleApplyMerge = async (mergedFields: ExtractedEnquiryFields) => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/enquiries/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: mergedFields,
        }),
      });

      if (!res.ok) throw new Error("Failed to merge fields");
      
      setDiffModalOpen(false);
      showToast("AI extraction merged successfully.");
      
      // Reload lists and detail drawer
      fetchEnquiries(false);
      // Hack to reload child details drawer by retriggering mount
      const tempId = selectedId;
      setSelectedId(null);
      setTimeout(() => setSelectedId(tempId), 50);
    } catch (err: any) {
      console.error(err);
      alert(`Merge failed: ${err.message}`);
    }
  };

  // Compute stats based on all enquiries (pre-filter)
  const computeStats = () => {
    const total = enquiries.length;
    const pending = enquiries.filter(
      (item) => item.processingStatus === "PENDING" || item.processingStatus === "PROCESSING"
    ).length;
    const highPriority = enquiries.filter(
      (item) => item.isGenuine && item.priority === "HIGH" && item.processingStatus === "COMPLETED"
    ).length;
    const genuineCount = enquiries.filter((item) => item.isGenuine && item.processingStatus === "COMPLETED").length;
    const spamCount = enquiries.filter((item) => !item.isGenuine && item.processingStatus === "COMPLETED").length;

    return { total, pending, highPriority, genuineCount, spamCount };
  };

  const stats = computeStats();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* Header Section */}
        <Header stats={stats} />

        {/* Live processing progress bar */}
        <ProgressBar items={enquiries} onRetry={handleRetryExtraction} />

        {/* Main Dashboard Layout */}
        <div className={styles.dashboardGrid}>
          {/* Main List Console */}
          <div className={styles.mainConsole}>
            {/* Ingest panel area */}
            <IngestPanel onIngested={handleIngested} />

            {/* List area */}
            {loading ? (
              <div className={styles.listLoading}>
                <div className={styles.spinner}></div>
                <p>Retrieving triaged database entries...</p>
              </div>
            ) : (
              <EnquiryList
                enquiries={enquiries}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
                filters={filters}
                setFilters={setFilters}
              />
            )}
          </div>

          {/* Sliding Side Detail Panel / Drawer */}
          {selectedId && (
            <div className={styles.drawerColumn}>
              <EnquiryDetailDrawer
                enquiryId={selectedId}
                onClose={() => setSelectedId(null)}
                onUpdated={() => fetchEnquiries(false)}
                onSelectAnother={(id) => setSelectedId(id)}
                onTriggerReextract={triggerMergeDiff}
              />
            </div>
          )}
        </div>
      </div>

      {/* Merge Diff Comparison Modal */}
      {diffModalOpen && diffCurrentFields && diffNewFields && (
        <MergeDiffModal
          isOpen={diffModalOpen}
          onClose={() => setDiffModalOpen(false)}
          currentFields={diffCurrentFields}
          newFields={diffNewFields}
          onApply={handleApplyMerge}
        />
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className={styles.toast}>
          <span>💡</span> {toastMessage}
        </div>
      )}
    </div>
  );
}
