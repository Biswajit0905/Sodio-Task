import React from "react";
import styles from "./ProgressBar.module.css";

interface EnquiryProgressItem {
  id: string;
  fromName: string;
  fromEmail: string;
  processingStatus: string;
  errorMessage: string | null;
}

interface ProgressBarProps {
  items: EnquiryProgressItem[];
  onRetry: (id: string) => void;
}

export default function ProgressBar({ items, onRetry }: ProgressBarProps) {
  // Filter items in the current active batch (either currently processing or just finished in this session)
  const activeItems = items.filter(
    (item) => 
      item.processingStatus === "PENDING" || 
      item.processingStatus === "PROCESSING" || 
      (item.processingStatus === "FAILED" && item.errorMessage !== null)
  );

  const pendingCount = items.filter((item) => item.processingStatus === "PENDING").length;
  const processingCount = items.filter((item) => item.processingStatus === "PROCESSING").length;
  const failedCount = items.filter((item) => item.processingStatus === "FAILED").length;
  
  // To compute total, we look at active work: pending + processing + failed.
  // We want to show progress if there is active parsing going on.
  const isRunning = pendingCount > 0 || processingCount > 0;
  const hasFailures = failedCount > 0;

  if (!isRunning && !hasFailures) {
    return null;
  }

  // Calculate percentage of processing. Let's assume a session-based active batch size.
  // If we just loaded, we can look at the total pending + processing + completed + failed.
  const completedCount = items.filter((item) => item.processingStatus === "COMPLETED").length;
  const totalActive = pendingCount + processingCount + failedCount + (isRunning ? completedCount : 0);
  
  const progressPercent = totalActive > 0 
    ? Math.round(((completedCount + failedCount) / totalActive) * 100)
    : 0;

  return (
    <div className={`glass-panel ${styles.container}`}>
      {isRunning ? (
        <div className={styles.activeSection}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <span className={styles.pulseDot}></span>
              <h3>Processing Enquiries ({pendingCount + processingCount} left)</h3>
            </div>
            <span className={styles.percentage}>{progressPercent}%</span>
          </div>
          
          <div className={styles.barTrack}>
            <div 
              className={styles.barFill} 
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            ></div>
          </div>
          
          <p className={styles.statusText}>
            Parsing structured fields using AI. Concurrency limit active (3 tasks max). 
            {processingCount > 0 && ` Currently extracting ${processingCount} items...`}
          </p>
        </div>
      ) : null}

      {hasFailures ? (
        <div className={styles.failureSection}>
          <h4>⚠️ Extraction Failures ({failedCount})</h4>
          <p className={styles.failureDesc}>
            Some enquiries failed to extract. You can retry processing them or manually edit their fields.
          </p>
          <div className={styles.failureList}>
            {items
              .filter((item) => item.processingStatus === "FAILED")
              .map((item) => (
                <div key={item.id} className={styles.failureItem}>
                  <div className={styles.failureInfo}>
                    <span className={styles.sender}>
                      {item.fromName} ({item.fromEmail})
                    </span>
                    <span className={styles.errorMsg}>
                      Reason: {item.errorMessage || "Unknown extraction error"}
                    </span>
                  </div>
                  <button 
                    className={styles.retryBtn}
                    onClick={() => onRetry(item.id)}
                  >
                    🔄 Retry
                  </button>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
