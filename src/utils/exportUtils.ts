/**
 * Export Utilities
 * Functions for exporting diary entries in various formats.
 *
 * Note: jsPDF is lazy-loaded to reduce initial bundle size (~400KB savings).
 */

import type { DiaryEntry, MoodId } from '../types';
import { MOODS, CHARACTERS } from '../constants';

// Lazy-load jsPDF only when needed (saves ~400KB from initial bundle)
const loadJsPDF = async () => {
  const { jsPDF } = await import('jspdf');
  return jsPDF;
};

// Lazy-load html2canvas for image exports
const loadHtml2Canvas = async () => {
  const html2canvas = await import('html2canvas');
  return html2canvas.default;
};

// ============================================================================
// TYPES
// ============================================================================

export type ExportFormat = 'pdf' | 'markdown' | 'json' | 'txt' | 'jpg';

interface ExportOptions {
  includeMetadata?: boolean;
  includeMood?: boolean;
  includeCharacter?: boolean;
  paperSize?: 'a4' | 'letter';
}

const defaultOptions: ExportOptions = {
  includeMetadata: true,
  includeMood: true,
  includeCharacter: true,
  paperSize: 'a4',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sanitize filename for safe file saving
 */
const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')
    .substring(0, 100);
};

/**
 * Get mood label and emoji
 */
const getMoodInfo = (moodId?: MoodId): { emoji: string; label: string } | null => {
  if (!moodId || !MOODS[moodId]) return null;
  return { emoji: MOODS[moodId].emoji, label: MOODS[moodId].label };
};

/**
 * Get character name
 */
const getCharacterName = (characterId?: string): string | null => {
  if (!characterId) return null;
  const char = CHARACTERS[characterId as keyof typeof CHARACTERS];
  return char ? char.name : null;
};

/**
 * Download a file
 */
const downloadFile = (content: string | Blob, filename: string, mimeType: string): void => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ============================================================================
// MARKDOWN EXPORT
// ============================================================================

/**
 * Convert a single entry to Markdown format
 */
export const entryToMarkdown = (entry: DiaryEntry, options: ExportOptions = defaultOptions): string => {
  const lines: string[] = [];
  const title = entry.content.split('\n')[0] || 'Untitled Entry';

  // Title
  lines.push(`# ${title}`);
  lines.push('');

  // Metadata section
  if (options.includeMetadata) {
    lines.push('---');
    lines.push(`**Date:** ${entry.date}`);

    if (options.includeMood && entry.mood) {
      const mood = getMoodInfo(entry.mood);
      if (mood) {
        lines.push(`**Mood:** ${mood.emoji} ${mood.label}`);
      }
    }

    if (options.includeCharacter && entry.characterId) {
      const charName = getCharacterName(entry.characterId);
      if (charName) {
        lines.push(`**Companion:** ${charName}`);
      }
    }

    lines.push('---');
    lines.push('');
  }

  // Content (skip the title line if it's the same)
  const contentLines = entry.content.split('\n');
  const contentStart = contentLines[0] === title ? 1 : 0;
  lines.push(contentLines.slice(contentStart).join('\n').trim());
  lines.push('');

  return lines.join('\n');
};

/**
 * Export a single entry as Markdown
 */
export const exportAsMarkdown = (entry: DiaryEntry, options: ExportOptions = defaultOptions): void => {
  const markdown = entryToMarkdown(entry, options);
  const filename = sanitizeFilename(`diary_${entry.date.replace(/\//g, '-')}.md`);
  downloadFile(markdown, filename, 'text/markdown');
};

/**
 * Export multiple entries as a single Markdown file
 */
export const exportAllAsMarkdown = (entries: DiaryEntry[], options: ExportOptions = defaultOptions): void => {
  if (entries.length === 0) return;

  const lines: string[] = [];

  // Header
  lines.push('# My Julir Journal');
  lines.push('');
  lines.push(`*Exported on ${new Date().toLocaleDateString()}*`);
  lines.push('');
  lines.push(`**Total Entries:** ${entries.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Add each entry
  sortedEntries.forEach((entry, index) => {
    lines.push(entryToMarkdown(entry, options));
    if (index < sortedEntries.length - 1) {
      lines.push('---');
      lines.push('');
    }
  });

  const markdown = lines.join('\n');
  const filename = `julir_journal_${new Date().toISOString().split('T')[0]}.md`;
  downloadFile(markdown, filename, 'text/markdown');
};

// ============================================================================
// JSON EXPORT
// ============================================================================

/**
 * Export a single entry as JSON
 */
export const exportAsJSON = (entry: DiaryEntry): void => {
  const json = JSON.stringify(entry, null, 2);
  const filename = sanitizeFilename(`diary_${entry.date.replace(/\//g, '-')}.json`);
  downloadFile(json, filename, 'application/json');
};

/**
 * Export multiple entries as JSON
 */
export const exportAllAsJSON = (entries: DiaryEntry[]): void => {
  if (entries.length === 0) return;

  const exportData = {
    exportedAt: new Date().toISOString(),
    totalEntries: entries.length,
    entries: entries,
  };

  const json = JSON.stringify(exportData, null, 2);
  const filename = `julir_journal_${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(json, filename, 'application/json');
};

// ============================================================================
// PDF EXPORT
// ============================================================================

/**
 * Export a single entry as PDF
 * Note: This function is async because jsPDF is lazy-loaded
 */
export const exportAsPDF = async (entry: DiaryEntry, options: ExportOptions = defaultOptions): Promise<void> => {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: options.paperSize || 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [0, 0, 0]): void => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.5;

    lines.forEach((line: string) => {
      // Check if we need a new page
      if (yPos + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    });
  };

  // Add decorative header line
  doc.setDrawColor(180, 120, 90);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
  yPos += 5;

  // Title
  const title = entry.content.split('\n')[0] || 'Untitled Entry';
  addText(title, 18, true, [60, 40, 30]);
  yPos += 5;

  // Metadata
  if (options.includeMetadata) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);

    let metaLine = entry.date;

    if (options.includeMood && entry.mood) {
      const mood = getMoodInfo(entry.mood);
      if (mood) {
        metaLine += `  |  ${mood.label}`;
      }
    }

    if (options.includeCharacter && entry.characterId) {
      const charName = getCharacterName(entry.characterId);
      if (charName) {
        metaLine += `  |  ${charName}`;
      }
    }

    doc.text(metaLine, margin, yPos);
    yPos += 10;
  }

  // Decorative divider
  doc.setDrawColor(200, 180, 160);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, margin + 40, yPos);
  yPos += 10;

  // Content
  const contentLines = entry.content.split('\n');
  const contentStart = contentLines[0] === title ? 1 : 0;
  const content = contentLines.slice(contentStart).join('\n').trim();

  addText(content, 11, false, [50, 50, 50]);

  // Footer
  yPos = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Created with Julir - Your Voice Diary Companion', margin, yPos);
  doc.text(new Date().toLocaleDateString(), pageWidth - margin - 20, yPos);

  // Save
  const filename = sanitizeFilename(`diary_${entry.date.replace(/\//g, '-')}.pdf`);
  doc.save(filename);
};

/**
 * Export multiple entries as a single PDF
 * Note: This function is async because jsPDF is lazy-loaded
 */
export const exportAllAsPDF = async (entries: DiaryEntry[], options: ExportOptions = defaultOptions): Promise<void> => {
  if (entries.length === 0) return;

  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: options.paperSize || 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [0, 0, 0]): number => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.5;

    lines.forEach((line: string) => {
      if (yPos + lineHeight > pageHeight - margin - 10) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    });

    return yPos;
  };

  // Cover page
  yPos = pageHeight / 3;
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 40, 30);
  doc.text('My Julir Journal', pageWidth / 2, yPos, { align: 'center' });

  yPos += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`${entries.length} Entries`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 10;
  doc.text(`Exported on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });

  // Decorative line
  yPos += 20;
  doc.setDrawColor(180, 120, 90);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 30, yPos, pageWidth / 2 + 30, yPos);

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Add each entry
  sortedEntries.forEach((entry, index) => {
    doc.addPage();
    yPos = margin;

    // Page number
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`${index + 1} of ${entries.length}`, pageWidth - margin, pageHeight - 10, { align: 'right' });

    // Header line
    doc.setDrawColor(180, 120, 90);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Title
    const title = entry.content.split('\n')[0] || 'Untitled Entry';
    addText(title, 16, true, [60, 40, 30]);
    yPos += 3;

    // Metadata
    if (options.includeMetadata) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);

      let metaLine = entry.date;

      if (options.includeMood && entry.mood) {
        const mood = getMoodInfo(entry.mood);
        if (mood) {
          metaLine += `  |  ${mood.label}`;
        }
      }

      if (options.includeCharacter && entry.characterId) {
        const charName = getCharacterName(entry.characterId);
        if (charName) {
          metaLine += `  |  ${charName}`;
        }
      }

      doc.text(metaLine, margin, yPos);
      yPos += 8;
    }

    // Divider
    doc.setDrawColor(220, 210, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, margin + 30, yPos);
    yPos += 8;

    // Content
    const contentLines = entry.content.split('\n');
    const contentStart = contentLines[0] === title ? 1 : 0;
    const content = contentLines.slice(contentStart).join('\n').trim();

    addText(content, 11, false, [50, 50, 50]);
  });

  // Footer on last page
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Created with Julir - Your Voice Diary Companion', margin, pageHeight - 10);

  // Save
  const filename = `julir_journal_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

// ============================================================================
// TEXT EXPORT (plain text)
// ============================================================================

/**
 * Export a single entry as plain text
 */
export const exportAsText = (entry: DiaryEntry): void => {
  const blob = new Blob([entry.content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `diary_${entry.date.replace(/\//g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export multiple entries as plain text
 */
export const exportAllAsText = (entries: DiaryEntry[]): void => {
  if (entries.length === 0) return;

  const lines: string[] = [];

  lines.push('MY JULIR JOURNAL');
  lines.push('================');
  lines.push(`Exported on ${new Date().toLocaleDateString()}`);
  lines.push(`Total Entries: ${entries.length}`);
  lines.push('');
  lines.push('');

  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  sortedEntries.forEach((entry, index) => {
    lines.push('─'.repeat(50));
    lines.push(`Date: ${entry.date}`);
    if (entry.mood) {
      const mood = getMoodInfo(entry.mood);
      if (mood) {
        lines.push(`Mood: ${mood.label}`);
      }
    }
    lines.push('─'.repeat(50));
    lines.push('');
    lines.push(entry.content);
    lines.push('');
    if (index < sortedEntries.length - 1) {
      lines.push('');
    }
  });

  const text = lines.join('\n');
  const filename = `julir_journal_${new Date().toISOString().split('T')[0]}.txt`;
  downloadFile(text, filename, 'text/plain');
};

// ============================================================================
// JPG/IMAGE EXPORT
// ============================================================================

/**
 * Create a styled HTML element for rendering as image
 */
const createEntryCard = (entry: DiaryEntry, options: ExportOptions = defaultOptions): HTMLDivElement => {
  const container = document.createElement('div');
  container.style.cssText = `
    width: 600px;
    padding: 40px;
    background: linear-gradient(135deg, #fef7ed 0%, #fdf4e8 50%, #fef3e2 100%);
    font-family: 'Georgia', serif;
    color: #44403c;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  `;

  const title = entry.content.split('\n')[0] || 'Untitled Entry';
  const contentLines = entry.content.split('\n');
  const contentStart = contentLines[0] === title ? 1 : 0;
  const content = contentLines.slice(contentStart).join('\n').trim();

  // Header with decorative line
  const header = document.createElement('div');
  header.style.cssText = `
    border-bottom: 2px solid #d6bcab;
    padding-bottom: 16px;
    margin-bottom: 20px;
  `;

  // Title
  const titleEl = document.createElement('h1');
  titleEl.textContent = title;
  titleEl.style.cssText = `
    font-size: 24px;
    font-weight: bold;
    color: #78350f;
    margin: 0 0 8px 0;
    line-height: 1.3;
  `;
  header.appendChild(titleEl);

  // Metadata line
  if (options.includeMetadata) {
    const meta = document.createElement('div');
    meta.style.cssText = `
      font-size: 14px;
      color: #78716c;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    `;

    const dateSpan = document.createElement('span');
    dateSpan.textContent = entry.date;
    meta.appendChild(dateSpan);

    if (options.includeMood && entry.mood) {
      const mood = getMoodInfo(entry.mood);
      if (mood) {
        const moodSpan = document.createElement('span');
        moodSpan.textContent = `${mood.emoji} ${mood.label}`;
        meta.appendChild(moodSpan);
      }
    }

    if (options.includeCharacter && entry.characterId) {
      const charName = getCharacterName(entry.characterId);
      if (charName) {
        const charSpan = document.createElement('span');
        charSpan.textContent = `with ${charName}`;
        meta.appendChild(charSpan);
      }
    }

    header.appendChild(meta);
  }

  container.appendChild(header);

  // Content
  const contentEl = document.createElement('div');
  contentEl.style.cssText = `
    font-size: 16px;
    line-height: 1.8;
    white-space: pre-wrap;
    color: #57534e;
  `;
  contentEl.textContent = content;
  container.appendChild(contentEl);

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e7e5e4;
    font-size: 11px;
    color: #a8a29e;
    display: flex;
    justify-content: space-between;
  `;

  const brand = document.createElement('span');
  brand.textContent = 'Created with Julir';
  footer.appendChild(brand);

  const exportDate = document.createElement('span');
  exportDate.textContent = new Date().toLocaleDateString();
  footer.appendChild(exportDate);

  container.appendChild(footer);

  return container;
};

/**
 * Export a single entry as JPG image
 * Note: This function is async because html2canvas is lazy-loaded
 */
export const exportAsJPG = async (entry: DiaryEntry, options: ExportOptions = defaultOptions): Promise<void> => {
  const html2canvas = await loadHtml2Canvas();

  // Create styled card
  const card = createEntryCard(entry, options);

  // Temporarily add to DOM (required for html2canvas)
  card.style.position = 'absolute';
  card.style.left = '-9999px';
  card.style.top = '0';
  document.body.appendChild(card);

  try {
    // Render to canvas
    const canvas = await html2canvas(card, {
      scale: 2, // Higher quality
      backgroundColor: null,
      logging: false,
    });

    // Convert to JPG blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = sanitizeFilename(`diary_${entry.date.replace(/\//g, '-')}.jpg`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      },
      'image/jpeg',
      0.92 // Quality
    );
  } finally {
    // Cleanup
    document.body.removeChild(card);
  }
};

/**
 * Export multiple entries as individual JPG images (downloads as zip-like sequence)
 * Note: This function is async because html2canvas is lazy-loaded
 */
export const exportAllAsJPG = async (entries: DiaryEntry[], options: ExportOptions = defaultOptions): Promise<void> => {
  if (entries.length === 0) return;

  const html2canvas = await loadHtml2Canvas();

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Export each entry with a small delay to prevent browser issues
  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];
    const card = createEntryCard(entry, options);

    // Add page number badge
    const badge = document.createElement('div');
    badge.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(120, 53, 15, 0.1);
      color: #78350f;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 12px;
      font-family: system-ui, sans-serif;
    `;
    badge.textContent = `${i + 1} of ${sortedEntries.length}`;
    card.style.position = 'relative';
    card.appendChild(badge);

    // Temporarily add to DOM
    card.style.position = 'absolute';
    card.style.left = '-9999px';
    card.style.top = '0';
    document.body.appendChild(card);

    try {
      const canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      });

      // Convert to JPG and download
      await new Promise<void>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = sanitizeFilename(`diary_${String(i + 1).padStart(3, '0')}_${entry.date.replace(/\//g, '-')}.jpg`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
            resolve();
          },
          'image/jpeg',
          0.92
        );
      });

      // Small delay between downloads
      if (i < sortedEntries.length - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    } finally {
      document.body.removeChild(card);
    }
  }
};

// ============================================================================
// SHARE FUNCTIONALITY
// ============================================================================

/**
 * Check if Web Share API is supported
 */
export const canShare = (): boolean => {
  return typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare;
};

/**
 * Share a single entry as JPG image using Web Share API
 * Falls back to download if sharing is not supported
 */
export const shareAsJPG = async (entry: DiaryEntry, options: ExportOptions = defaultOptions): Promise<void> => {
  const html2canvas = await loadHtml2Canvas();

  // Create styled card
  const card = createEntryCard(entry, options);

  // Temporarily add to DOM
  card.style.position = 'absolute';
  card.style.left = '-9999px';
  card.style.top = '0';
  document.body.appendChild(card);

  try {
    // Render to canvas
    const canvas = await html2canvas(card, {
      scale: 2,
      backgroundColor: null,
      logging: false,
    });

    // Convert to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.92);
    });

    if (!blob) {
      throw new Error('Failed to create image');
    }

    const filename = sanitizeFilename(`diary_${entry.date.replace(/\//g, '-')}.jpg`);
    const file = new File([blob], filename, { type: 'image/jpeg' });

    // Check if we can share files
    if (canShare() && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'My Julir Journal Entry',
        text: `Journal entry from ${entry.date}`,
      });
    } else {
      // Fallback to download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } finally {
    document.body.removeChild(card);
  }
};
