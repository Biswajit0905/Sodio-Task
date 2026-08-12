export interface RawEnquiry {
  fromName: string;
  fromEmail: string;
  receivedAt: Date;
  message: string;
  rawBlock: string;
}

/**
 * Splits a file containing multiple enquiries separated by a line of dashes.
 * Discards header text or non-enquiry sections.
 */
export function splitEnquiriesFile(content: string): string[] {
  // Split by lines that consist of 10 or more dashes
  const blocks = content.split(/^-{10,}\s*$/m);
  
  return blocks
    .map(block => block.trim())
    .filter(block => {
      // Validate that this is a real enquiry block and not a header or empty space
      const hasFrom = block.toLowerCase().includes('from:');
      const hasMessage = block.toLowerCase().includes('message:');
      return hasFrom && hasMessage;
    });
}

/**
 * Parses a single raw enquiry text block into structured fields.
 */
export function parseSingleEnquiry(block: string): RawEnquiry {
  const lines = block.split('\n');
  
  let fromName = '';
  let fromEmail = '';
  let receivedStr = '';
  let messageLines: string[] = [];
  let isReadingMessage = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (isReadingMessage) {
      messageLines.push(line); // Preserve original formatting/indentation inside message
      continue;
    }

    if (trimmedLine.toLowerCase().startsWith('from:')) {
      fromName = line.substring(line.indexOf(':') + 1).trim();
    } else if (trimmedLine.toLowerCase().startsWith('email:')) {
      fromEmail = line.substring(line.indexOf(':') + 1).trim();
    } else if (trimmedLine.toLowerCase().startsWith('received:')) {
      receivedStr = line.substring(line.indexOf(':') + 1).trim();
    } else if (trimmedLine.toLowerCase().startsWith('message:')) {
      isReadingMessage = true;
      // If there is message text on the same line as "Message:", capture it
      const sameLineContent = line.substring(line.indexOf(':') + 1).trim();
      if (sameLineContent) {
        messageLines.push(sameLineContent);
      }
    }
  }

  // Combine message lines and trim
  const message = messageLines.join('\n').trim();

  // Parse received date safely
  let receivedAt = new Date();
  if (receivedStr) {
    // Format "2026-07-14 09:22" into "2026-07-14T09:22:00" for robust parsing across JS engines
    const isoFormat = receivedStr.replace(' ', 'T');
    const parsedDate = new Date(isoFormat.includes('T') && !isoFormat.includes(':') ? `${isoFormat}:00` : isoFormat);
    if (!isNaN(parsedDate.getTime())) {
      receivedAt = parsedDate;
    }
  }

  return {
    fromName: fromName || 'Unknown',
    fromEmail: fromEmail || 'n/a',
    receivedAt,
    message,
    rawBlock: block
  };
}
