import React from "react";
import styles from "./Header.module.css";

interface HeaderProps {
  stats: {
    total: number;
    pending: number;
    highPriority: number;
    genuineCount: number;
    spamCount: number;
  };
}

export default function Header({ stats }: HeaderProps) {
  const genuinePercent = stats.total > 0 
    ? Math.round((stats.genuineCount / (stats.genuineCount + stats.spamCount || 1)) * 100)
    : 100;

  return (
    <header className={styles.header}>
      <div className={styles.titleArea}>
        <div className={styles.logoBadge}>S</div>
        <div>
          <h1 className={styles.title}>Sodio Triage Console</h1>
          <p className={styles.subtitle}>AI-Assisted Inbound Enquiry Triage Dashboard</p>
        </div>
      </div>
      
      <div className={styles.statsGrid}>
        <div className="glass-panel hover-scale styles_statCard__XYZ">
          <div className={styles.statLabel}>Total Enquiries</div>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statFooter}>Received to date</div>
        </div>
        
        <div className="glass-panel hover-scale styles_statCard__XYZ">
          <div className={styles.statLabel}>Queue Status</div>
          <div className={`${styles.statValue} ${stats.pending > 0 ? styles.activeQueue : ""}`}>
            {stats.pending}
          </div>
          <div className={styles.statFooter}>
            {stats.pending > 0 ? "⚡ Processing extractions..." : "✓ Queue idle"}
          </div>
        </div>
        
        <div className="glass-panel hover-scale styles_statCard__XYZ">
          <div className={styles.statLabel}>High Priority</div>
          <div className={`${styles.statValue} ${styles.highVal}`}>
            {stats.highPriority}
          </div>
          <div className={styles.statFooter}>Require immediate response</div>
        </div>
        
        <div className="glass-panel hover-scale styles_statCard__XYZ">
          <div className={styles.statLabel}>Genuineness Ratio</div>
          <div className={styles.statValue}>{genuinePercent}%</div>
          <div className={styles.statFooter}>
            {stats.genuineCount} genuine / {stats.spamCount} spam
          </div>
        </div>
      </div>
    </header>
  );
}
