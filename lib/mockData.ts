export interface ExtractedEnquiryFields {
  company: string;
  contactName: string;
  contactEmail: string;
  serviceLine: 'ai' | 'blockchain' | 'web' | 'mobile' | 'game' | 'other';
  budgetRaw: string;
  budgetMinUSD: number;
  budgetMaxUSD: number;
  budgetCurrency: string;
  timelineRaw: string;
  timelineNormalizedMonths: number;
  summary: string;
  isGenuine: boolean;
  hasMultipleProjects: boolean;
  notes: string;
}

export const mockEnquiryExtractions: Record<string, ExtractedEnquiryFields> = {
  "r.whitfield@northgate-logistics.co.uk_09:22": {
    company: "Northgate Logistics",
    contactName: "Rachel Whitfield",
    contactEmail: "r.whitfield@northgate-logistics.co.uk",
    serviceLine: "web",
    budgetRaw: "around £40,000",
    budgetMinUSD: 52000,
    budgetMaxUSD: 52000,
    budgetCurrency: "GBP",
    timelineRaw: "start in September",
    timelineNormalizedMonths: 1,
    summary: "Internal PDF parser tool for supplier invoices",
    isGenuine: true,
    hasMultipleProjects: false,
    notes: "Mid-sized logistics firm. Standard project request."
  },
  "deniz@zora-protocol.xyz_11:40": {
    company: "Zora Protocol",
    contactName: "Deniz",
    contactEmail: "deniz@zora-protocol.xyz",
    serviceLine: "blockchain",
    budgetRaw: "flexible",
    budgetMinUSD: -1,
    budgetMaxUSD: -1,
    budgetCurrency: "TBD",
    timelineRaw: "flexible",
    timelineNormalizedMonths: -1,
    summary: "Token launch on Base with smart contracts and staking dashboard",
    isGenuine: true,
    hasMultipleProjects: false,
    notes: "Base network development request."
  },
  "r.whitfield@northgate-logistics.co.uk_14:05": {
    company: "Northgate Logistics",
    contactName: "Rachel W",
    contactEmail: "r.whitfield@northgate-logistics.co.uk",
    serviceLine: "web",
    budgetRaw: "flexible",
    budgetMinUSD: -1,
    budgetMaxUSD: -1,
    budgetCurrency: "TBD",
    timelineRaw: "flexible",
    timelineNormalizedMonths: -1,
    summary: "Follow-up: open to hosted solution for supplier document extraction",
    isGenuine: true,
    hasMultipleProjects: false,
    notes: "Follow-up to previous invoice parser request. Same project."
  },
  "outreach@rankfirst-seo.biz_15:11": {
    company: "RankFirst SEO",
    contactName: "Growth Team",
    contactEmail: "outreach@rankfirst-seo.biz",
    serviceLine: "other",
    budgetRaw: "$299/month",
    budgetMinUSD: 299,
    budgetMaxUSD: 299,
    budgetCurrency: "USD",
    timelineRaw: "monthly",
    timelineNormalizedMonths: -1,
    summary: "Digital marketing and SEO rankings pitch",
    isGenuine: false,
    hasMultipleProjects: false,
    notes: "Spam digital marketing outreach."
  },
  "m.santana@clinicavera.es_08:03": {
    company: "Clínica Vera",
    contactName: "Miguel Santana",
    contactEmail: "m.santana@clinicavera.es",
    serviceLine: "mobile",
    budgetRaw: "25.000 €",
    budgetMinUSD: 27000,
    budgetMaxUSD: 27000,
    budgetCurrency: "EUR",
    timelineRaw: "approximate start",
    timelineNormalizedMonths: -1,
    summary: "Mobile app for private clinic bookings and results",
    isGenuine: true,
    hasMultipleProjects: false,
    notes: "Spanish enquiry from private healthcare provider."
  },
  "contact@qa-test-mail.io_08:44": {
    company: "system",
    contactName: "Unknown",
    contactEmail: "contact@qa-test-mail.io",
    serviceLine: "other",
    budgetRaw: "10000000 USD",
    budgetMinUSD: -1,
    budgetMaxUSD: -1,
    budgetCurrency: "TBD",
    timelineRaw: "n/a",
    timelineNormalizedMonths: -1,
    summary: "Prompt injection security test message",
    isGenuine: false,
    hasMultipleProjects: false,
    notes: "Flagged as prompt injection security test. Safe parsing applied."
  },
  "ankit@vedanshgroup.in_12:19": {
    company: "Vedansh Group",
    contactName: "Ankit Bahl",
    contactEmail: "ankit@vedanshgroup.in",
    serviceLine: "web",
    budgetRaw: "Roughly 35-40 lakhs",
    budgetMinUSD: 42000,
    budgetMaxUSD: 48000,
    budgetCurrency: "INR",
    timelineRaw: "before Diwali",
    timelineNormalizedMonths: 3,
    summary: "B2B marketplace with escrow payments",
    isGenuine: true,
    hasMultipleProjects: false,
    notes: "Wants launch before Diwali. Budget 35-40 lakhs INR."
  },
  "tokafor@meridian-cap.com_16:50": {
    company: "Meridian Capital",
    contactName: "T. Okafor",
    contactEmail: "tokafor@meridian-cap.com",
    serviceLine: "web",
    budgetRaw: "20-30k",
    budgetMinUSD: 20000,
    budgetMaxUSD: 30000,
    budgetCurrency: "USD",
    timelineRaw: "Three months",
    timelineNormalizedMonths: 3,
    summary: "Data pipeline and dashboard development",
    isGenuine: true,
    hasMultipleProjects: false,
    notes: "Standard pipeline/analytics request."
  },
  "jbdesigns91@gmail.com_02:14": {
    company: "Unknown",
    contactName: "Unknown",
    contactEmail: "jbdesigns91@gmail.com",
    serviceLine: "other",
    budgetRaw: "n/a",
    budgetMinUSD: -1,
    budgetMaxUSD: -1,
    budgetCurrency: "TBD",
    timelineRaw: "n/a",
    timelineNormalizedMonths: -1,
    summary: "Call request without project details",
    isGenuine: false,
    hasMultipleProjects: false,
    notes: "Low quality spammy text message."
  },
  "priya@lumenhealth.io_09:30": {
    company: "Lumen Health",
    contactName: "Priya Ramanathan",
    contactEmail: "priya@lumenhealth.io",
    serviceLine: "ai",
    budgetRaw: "between $60k and $90k",
    budgetMinUSD: 60000,
    budgetMaxUSD: 90000,
    budgetCurrency: "USD",
    timelineRaw: "6 weeks / Q1",
    timelineNormalizedMonths: 1,
    summary: "Patient chatbot and legacy React admin panel migration",
    isGenuine: true,
    hasMultipleProjects: true,
    notes: "Two separate projects: chatbot (urgent) and admin panel migration (Q1)."
  },
  "hiring@stackforge-recruiting.com_10:02": {
    company: "StackForge Recruiting",
    contactName: "Talent Acquisition",
    contactEmail: "hiring@stackforge-recruiting.com",
    serviceLine: "other",
    budgetRaw: "n/a",
    budgetMinUSD: -1,
    budgetMaxUSD: -1,
    budgetCurrency: "TBD",
    timelineRaw: "n/a",
    timelineNormalizedMonths: -1,
    summary: "Recruitment outreach offering blockchain developers",
    isGenuine: false,
    hasMultipleProjects: false,
    notes: "Staffing agency business development spam."
  },
  "sam.delaney@brightpath.edu_13:47": {
    company: "Brightpath University",
    contactName: "Sam Delaney",
    contactEmail: "sam.delaney@brightpath.edu",
    serviceLine: "blockchain",
    budgetRaw: "no budget",
    budgetMinUSD: 0,
    budgetMaxUSD: 0,
    budgetCurrency: "USD",
    timelineRaw: "capstone project",
    timelineNormalizedMonths: -1,
    summary: "Student capstone project about NFT ticketing (code review help)",
    isGenuine: false,
    hasMultipleProjects: false,
    notes: "Student assistance request with no commercial budget."
  },
  "ops@harrowgate-estates.co.uk_07:55": {
    company: "Harrowgate Estates",
    contactName: "Operations",
    contactEmail: "ops@harrowgate-estates.co.uk",
    serviceLine: "web",
    budgetRaw: "pay whatever it takes",
    budgetMinUSD: 10000, // Implied initial minimum budget
    budgetMaxUSD: -1,
    budgetCurrency: "GBP",
    timelineRaw: "ASAP today",
    timelineNormalizedMonths: 0,
    summary: "Urgent takeover and repair of broken tenant portal (Node/AWS)",
    isGenuine: true,
    hasMultipleProjects: false,
    notes: "Urgent downtime support request. Emergency rates apply."
  },
  "k.meier@bergwald-gmbh.de_11:12": {
    company: "Bergwald GmbH",
    contactName: "Klara Meier",
    contactEmail: "k.meier@bergwald-gmbh.de",
    serviceLine: "game",
    budgetRaw: "significant",
    budgetMinUSD: 50000, // Significant budget interpreted as 50k+
    budgetMaxUSD: -1,
    budgetCurrency: "EUR",
    timelineRaw: "Q1 next year",
    timelineNormalizedMonths: 5,
    summary: "Brand campaign casual mobile game for iOS & Android",
    isGenuine: true,
    hasMultipleProjects: false,
    notes: "Branded casual game campaign."
  },
  "fontaine@luckystar-gaming.cw_15:38": {
    company: "LuckyStar Gaming",
    contactName: "D. Fontaine",
    contactEmail: "fontaine@luckystar-gaming.cw",
    serviceLine: "game",
    budgetRaw: "$80k",
    budgetMinUSD: 80000,
    budgetMaxUSD: 80000,
    budgetCurrency: "USD",
    timelineRaw: "next week",
    timelineNormalizedMonths: 0,
    summary: "Crypto deposits and dice game integration for online casino",
    isGenuine: true,
    hasMultipleProjects: false,
    notes: "Curaçao licensed casino platform extension."
  },
  "marcus@fieldmark.co_08:20": {
    company: "Fieldmark",
    contactName: "Marcus Bell",
    contactEmail: "marcus@fieldmark.co",
    serviceLine: "ai",
    budgetRaw: "no idea",
    budgetMinUSD: -1,
    budgetMaxUSD: -1,
    budgetCurrency: "TBD",
    timelineRaw: "flexible",
    timelineNormalizedMonths: -1,
    summary: "AI demand forecasting module for existing inventory app",
    isGenuine: true,
    hasMultipleProjects: false,
    notes: "Existing client requesting add-on module."
  },
  "n/a_09:01": {
    company: "Unknown",
    contactName: "Vish",
    contactEmail: "n/a",
    serviceLine: "ai",
    budgetRaw: "n/a",
    budgetMinUSD: -1,
    budgetMaxUSD: -1,
    budgetCurrency: "TBD",
    timelineRaw: "immediate",
    timelineNormalizedMonths: 0,
    summary: "AI customer support agents with voice integration",
    isGenuine: true,
    hasMultipleProjects: false,
    notes: "Customer support automation inquiry."
  },
  "e.vance@vancearchitects.com_14:33": {
    company: "Vance Architects",
    contactName: "Eleanor Vance",
    contactEmail: "e.vance@vancearchitects.com",
    serviceLine: "web",
    budgetRaw: "region of four hundred thousand pounds",
    budgetMinUSD: 520000,
    budgetMaxUSD: 520000,
    budgetCurrency: "GBP",
    timelineRaw: "eighteen months",
    timelineNormalizedMonths: 18,
    summary: "Bespoke project management platform for architectural workflows",
    isGenuine: true,
    hasMultipleProjects: false,
    notes: "Large enterprise system development."
  },
  "y.tanaka@shibuya-labs.jp_03:15": {
    company: "Shibuya Labs",
    contactName: "Yuki Tanaka",
    contactEmail: "y.tanaka@shibuya-labs.jp",
    serviceLine: "ai",
    budgetRaw: "TBD",
    budgetMinUSD: -1,
    budgetMaxUSD: -1,
    budgetCurrency: "TBD",
    timelineRaw: "flexible",
    timelineNormalizedMonths: -1,
    summary: "AI model fine-tuning on internal documentation",
    isGenuine: true,
    hasMultipleProjects: false,
    notes: "Internal documentation fine-tuning query."
  },
  "no-reply@bounce-handler.net_06:00": {
    company: "bounce-handler.net",
    contactName: "Admin",
    contactEmail: "no-reply@bounce-handler.net",
    serviceLine: "other",
    budgetRaw: "n/a",
    budgetMinUSD: -1,
    budgetMaxUSD: -1,
    budgetCurrency: "TBD",
    timelineRaw: "n/a",
    timelineNormalizedMonths: -1,
    summary: "Email delivery status notification bounce",
    isGenuine: false,
    hasMultipleProjects: false,
    notes: "Automated mailer daemon bounce message."
  }
};

/**
 * Tries to find a matching mock extraction for an enquiry based on email and time string.
 */
export function getMockExtraction(email: string, receivedAtStr: string): ExtractedEnquiryFields | null {
  // Format receivedAtStr (e.g. "2026-07-14 09:22" or ISO string) to match keys
  let timeStr = "";
  if (receivedAtStr.includes('T')) {
    // ISO string "2026-07-14T09:22:00.000Z" -> "09:22"
    const timePart = receivedAtStr.split('T')[1];
    timeStr = timePart.substring(0, 5);
  } else {
    // String "2026-07-14 09:22" -> "09:22"
    const parts = receivedAtStr.trim().split(' ');
    if (parts.length > 1) {
      timeStr = parts[1].substring(0, 5);
    }
  }
  
  const key = `${email}_${timeStr}`;
  return mockEnquiryExtractions[key] || null;
}
