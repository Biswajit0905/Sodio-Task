import React, { useState, useRef } from "react";
import styles from "./IngestPanel.module.css";

interface IngestPanelProps {
  onIngested: (message: string) => void;
}

export default function IngestPanel({ onIngested }: IngestPanelProps) {
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [pastedText, setPastedText] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIngestText = async () => {
    if (!pastedText.trim()) return;
    setIsIngesting(true);
    setError(null);
    try {
      const res = await fetch("/api/enquiries/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pastedText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to ingest text");
      
      setPastedText("");
      onIngested(data.message || "Enquiry ingested successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsIngesting(false);
    }
  };

  const uploadFile = async (file: File) => {
    setIsIngesting(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/enquiries/ingest", {
        method: "POST",
        body: formData, // Automatically sets boundary and multipart/form-data content type
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to ingest file");
      
      onIngested(data.message || "Batch file ingested successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`glass-panel ${styles.panel}`}>
      <div className={styles.tabHeaders}>
        <button
          className={`${styles.tabBtn} ${activeTab === "file" ? styles.activeTab : ""}`}
          onClick={() => { setActiveTab("file"); setError(null); }}
        >
          📂 Upload Enquiries File
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "paste" ? styles.activeTab : ""}`}
          onClick={() => { setActiveTab("paste"); setError(null); }}
        >
          ✍ Paste Single Enquiry
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "file" ? (
          <div
            className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt"
              className={styles.fileInput}
              disabled={isIngesting}
            />
            <div className={styles.uploadIcon}>📥</div>
            <h3>Drag & drop sample-enquiries.txt here</h3>
            <p>or click to browse local files (accepts plain text format)</p>
            {isIngesting && <div className={styles.spinner}>Processing files in background...</div>}
          </div>
        ) : (
          <div className={styles.pasteArea}>
            <textarea
              className={styles.textarea}
              placeholder="Paste enquiry details here...&#10;For example:&#10;From: John Doe&#10;Email: john@example.com&#10;Received: 2026-08-12 12:00&#10;Message: Need a website for my business. Budget $10k."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              disabled={isIngesting}
              rows={8}
            />
            <div className={styles.pasteActions}>
              <button
                className={styles.ingestBtn}
                onClick={handleIngestText}
                disabled={isIngesting || !pastedText.trim()}
              >
                {isIngesting ? "Ingesting..." : "Ingest Enquiry"}
              </button>
            </div>
          </div>
        )}

        {error && <div className={styles.errorMessage}>⚠️ {error}</div>}
      </div>
    </div>
  );
}
