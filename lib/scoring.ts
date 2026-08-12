import { ExtractedEnquiryFields } from "./mockData";

export type PriorityLevel = "HIGH" | "MEDIUM" | "LOW";

/**
 * Computes the priority score (HIGH/MEDIUM/LOW) for a parsed enquiry.
 * This runs locally in code and is NOT decided by the LLM.
 * 
 * Rules:
 * 1. LOW priority if:
 *    - The enquiry is not genuine (spam, hiring, capstone, bounce, injection).
 *    - The budget is explicitly $0 (student help, pro-bono advice requests).
 * 2. HIGH priority if:
 *    - The enquiry is genuine AND:
 *      - Normalized maximum budget is >= $50,000 USD.
 *      - OR the enquiry is highly urgent (ASAP/today, normalized start is 0 months) AND the budget is substantial (>= $10,000 USD or flexible/TBD).
 * 3. MEDIUM priority if:
 *    - It is a genuine enquiry that does not meet the High criteria (e.g. moderate budget, flexible timeline, or new client exploratory requests).
 */
export function calculatePriority(fields: ExtractedEnquiryFields): PriorityLevel {
  // Rule 1: Non-genuine or zero-budget requests are automatically LOW priority
  if (!fields.isGenuine) {
    return "LOW";
  }
  
  if (fields.budgetMinUSD === 0 && fields.budgetMaxUSD === 0) {
    return "LOW";
  }

  // Extract variables
  const isUrgent = fields.timelineNormalizedMonths === 0 || 
                   fields.timelineRaw.toLowerCase().includes('asap') || 
                   fields.timelineRaw.toLowerCase().includes('today') ||
                   fields.timelineRaw.toLowerCase().includes('down');
                   
  const hasHighBudget = fields.budgetMaxUSD >= 50000;
  const hasSubstantialBudget = fields.budgetMinUSD >= 10000 || fields.budgetMinUSD === -1; // -1 means flexible/TBD

  // Rule 2: HIGH priority conditions
  if (hasHighBudget) {
    return "HIGH";
  }
  
  if (isUrgent && hasSubstantialBudget) {
    return "HIGH";
  }

  // Rule 3: All other genuine enquiries are MEDIUM priority
  return "MEDIUM";
}
