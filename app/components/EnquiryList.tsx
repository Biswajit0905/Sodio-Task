import React from "react";
import styles from "./EnquiryList.module.css";

interface EnquiryListItem {
  id: string;
  fromName: string;
  fromEmail: string;
  company: string;
  receivedAt: string | Date;
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
}

interface EnquiryListProps {
  enquiries: EnquiryListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  // Filters state from parent
  filters: {
    search: string;
    serviceLine: string;
    priority: string;
    status: string;
    isGenuine: string;
    sortBy: string;
    sortOrder: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    search: string;
    serviceLine: string;
    priority: string;
    status: string;
    isGenuine: string;
    sortBy: string;
    sortOrder: string;
  }>>;
}

export default function EnquiryList({
  enquiries,
  selectedId,
  onSelect,
  filters,
  setFilters,
}: EnquiryListProps) {
  
  const handleSort = (field: string) => {
    setFilters((prev) => {
      const isSameField = prev.sortBy === field;
      const newOrder = isSameField && prev.sortOrder === "desc" ? "asc" : "desc";
      return {
        ...prev,
        sortBy: field,
        sortOrder: newOrder,
      };
    });
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "HIGH": return styles.priorityHigh;
      case "MEDIUM": return styles.priorityMedium;
      case "LOW": return styles.priorityLow;
      default: return "";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "NEW": return styles.statusNew;
      case "CONTACTED": return styles.statusContacted;
      case "QUALIFIED": return styles.statusQualified;
      case "DROPPED": return styles.statusDropped;
      default: return "";
    }
  };

  const getServiceClass = (service: string) => {
    switch (service.toLowerCase()) {
      case "ai": return styles.serviceAI;
      case "blockchain": return styles.serviceBlockchain;
      case "web": return styles.serviceWeb;
      case "mobile": return styles.serviceMobile;
      case "game": return styles.serviceGame;
      default: return styles.serviceOther;
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Unknown";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className={`glass-panel ${styles.container}`}>
      {/* Filtering and Search Controls */}
      <div className={styles.controlsRow}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search by company, name, email, or message content..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label>Service</label>
            <select
              value={filters.serviceLine}
              onChange={(e) => setFilters((prev) => ({ ...prev, serviceLine: e.target.value }))}
            >
              <option value="ALL">All Services</option>
              <option value="AI">AI</option>
              <option value="BLOCKCHAIN">Blockchain</option>
              <option value="WEB">Web</option>
              <option value="MOBILE">Mobile</option>
              <option value="GAME">Game</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Type</label>
            <select
              value={filters.isGenuine}
              onChange={(e) => setFilters((prev) => ({ ...prev, isGenuine: e.target.value }))}
            >
              <option value="ALL">All Enquiries</option>
              <option value="true">Genuine Enquiries</option>
              <option value="false">Spam / Non-genuine</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table view */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort("priority")} className={styles.sortableHeader}>
                Priority {filters.sortBy === "priority" ? (filters.sortOrder === "desc" ? "▼" : "▲") : ""}
              </th>
              <th>Service</th>
              <th>Contact / Company</th>
              <th>Summary</th>
              <th>Budget</th>
              <th>Timeline</th>
              <th onClick={() => handleSort("receivedAt")} className={styles.sortableHeader}>
                Date Received {filters.sortBy === "receivedAt" ? (filters.sortOrder === "desc" ? "▼" : "▲") : ""}
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.noDataCell}>
                  No matching enquiries found. Try modifying your search or filters.
                </td>
              </tr>
            ) : (
              enquiries.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`${styles.row} ${selectedId === item.id ? styles.selectedRow : ""} ${
                    item.processingStatus === "PENDING" || item.processingStatus === "PROCESSING" 
                      ? styles.processingRow 
                      : ""
                  }`}
                >
                  <td>
                    {item.processingStatus === "PENDING" || item.processingStatus === "PROCESSING" ? (
                      <span className={styles.processingDot}>⏳</span>
                    ) : (
                      <span className={`${styles.badge} ${getPriorityClass(item.priority)}`}>
                        {item.priority}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${getServiceClass(item.serviceLine)}`}>
                      {item.serviceLine}
                    </span>
                  </td>
                  <td>
                    <div className={styles.contactDetails}>
                      <span className={styles.contactName}>{item.fromName}</span>
                      <span className={styles.contactEmail}>{item.fromEmail}</span>
                      {item.company && item.company !== "Unknown" && (
                        <span className={styles.companyName}>🏢 {item.company}</span>
                      )}
                      {item.isFollowUp && (
                        <span className={styles.followUpBadge} title="Prior enquiry logged from this sender within 7 days">
                          🔗 Follow-up
                        </span>
                      )}
                      {!item.isGenuine && (
                        <span className={styles.spamIndicator} title="Classified as marketing, recruiting, or non-commercial request">
                          🚫 Spam/Non-genuine
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.summaryText}>{item.summary || "Extracting details..."}</div>
                  </td>
                  <td className={styles.budgetValue}>{item.budget || "TBD"}</td>
                  <td className={styles.timelineValue}>{item.timeline || "TBD"}</td>
                  <td className={styles.dateValue}>{formatDate(item.receivedAt)}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
