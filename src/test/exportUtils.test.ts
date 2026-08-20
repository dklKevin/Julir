import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiaryEntry } from '../types';

const pdfMocks = vi.hoisted(() => {
  const save = vi.fn();
  const text = vi.fn();
  const line = vi.fn();
  const addPage = vi.fn();
  const splitTextToSize = vi.fn((value: string) => [value]);
  const setFontSize = vi.fn();
  const setFont = vi.fn();
  const setTextColor = vi.fn();
  const setDrawColor = vi.fn();
  const setLineWidth = vi.fn();

  class MockJsPDF {
    internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } };
    save = save;
    text = text;
    line = line;
    addPage = addPage;
    splitTextToSize = splitTextToSize;
    setFontSize = setFontSize;
    setFont = setFont;
    setTextColor = setTextColor;
    setDrawColor = setDrawColor;
    setLineWidth = setLineWidth;
  }

  return {
    save,
    text,
    line,
    addPage,
    splitTextToSize,
    MockJsPDF,
  };
});

const canvasMocks = vi.hoisted(() => {
  const html2canvas = vi.fn(async () => ({
    toBlob: (cb: (blob: Blob | null) => void) => {
      cb(new Blob(['image'], { type: 'image/jpeg' }));
    },
  }));
  return { html2canvas };
});

vi.mock('jspdf', () => ({
  jsPDF: pdfMocks.MockJsPDF,
}));

vi.mock('html2canvas', () => ({
  default: canvasMocks.html2canvas,
}));

import {
  canShare,
  entryToMarkdown,
  exportAllAsJPG,
  exportAllAsJSON,
  exportAllAsMarkdown,
  exportAllAsPDF,
  exportAllAsText,
  exportAsJPG,
  exportAsJSON,
  exportAsMarkdown,
  exportAsPDF,
  exportAsText,
  shareAsJPG,
} from '../utils/exportUtils';

const sampleEntry: DiaryEntry = {
  id: '1',
  date: '8/20/2026',
  title: 'A quiet day',
  content: 'A quiet day\nI walked and thought about the week.',
  mood: 'peaceful',
  characterId: 'julir',
};

const untitledEntry: DiaryEntry = {
  id: '2',
  date: '8/19/2026',
  title: '',
  content: '',
};

const downloadNames: string[] = [];
const originalAnchorClick = HTMLAnchorElement.prototype.click;

function lastDownloadFilename(): string {
  return downloadNames[downloadNames.length - 1] ?? '';
}

describe('exportUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    downloadNames.length = 0;
    document.body.innerHTML = '';
    HTMLAnchorElement.prototype.click = function click() {
      downloadNames.push(this.download);
    };
  });

  afterEach(() => {
    HTMLAnchorElement.prototype.click = originalAnchorClick;
    document.body.innerHTML = '';
  });

  describe('entryToMarkdown', () => {
    it('includes title, mood, and companion metadata', () => {
      const markdown = entryToMarkdown(sampleEntry);
      expect(markdown).toContain('# A quiet day');
      expect(markdown).toContain('**Date:** 8/20/2026');
      expect(markdown).toContain('Peaceful');
      expect(markdown).toContain('Julir');
      expect(markdown).toContain('I walked and thought about the week.');
    });

    it('can omit metadata and handle untitled entries', () => {
      const markdown = entryToMarkdown(untitledEntry, { includeMetadata: false });
      expect(markdown).toContain('# Untitled Entry');
      expect(markdown).not.toContain('**Date:**');
    });
  });

  describe('file downloads', () => {
    it('exports markdown, json, and text for a single entry', () => {
      exportAsMarkdown(sampleEntry);
      expect(lastDownloadFilename()).toMatch(/diary_.*\.md$/);

      exportAsJSON(sampleEntry);
      expect(lastDownloadFilename()).toMatch(/diary_.*\.json$/);

      exportAsText(sampleEntry);
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('exports collections and no-ops on empty lists', () => {
      exportAllAsMarkdown([]);
      exportAllAsJSON([]);
      exportAllAsText([]);
      expect(document.querySelectorAll('a')).toHaveLength(0);

      exportAllAsMarkdown([sampleEntry, untitledEntry]);
      expect(lastDownloadFilename()).toMatch(/julir_journal_.*\.md$/);

      exportAllAsJSON([sampleEntry]);
      expect(lastDownloadFilename()).toMatch(/julir_journal_.*\.json$/);

      exportAllAsText([sampleEntry, untitledEntry]);
      expect(lastDownloadFilename()).toMatch(/julir_journal_.*\.txt$/);
    });
  });

  describe('pdf and image exports', () => {
    it('builds a single-entry and multi-entry PDF', async () => {
      await exportAsPDF(sampleEntry);
      expect(pdfMocks.save).toHaveBeenCalled();

      await exportAllAsPDF([]);
      expect(pdfMocks.save).toHaveBeenCalledTimes(1);

      await exportAllAsPDF([sampleEntry, untitledEntry]);
      expect(pdfMocks.save).toHaveBeenCalledTimes(2);
      expect(pdfMocks.addPage).toHaveBeenCalled();
    });

    it('renders JPG exports and falls back when share is unavailable', async () => {
      await exportAsJPG(sampleEntry);
      expect(canvasMocks.html2canvas).toHaveBeenCalled();

      await exportAllAsJPG([]);
      await exportAllAsJPG([sampleEntry]);
      expect(canvasMocks.html2canvas).toHaveBeenCalledTimes(2);

      expect(canShare()).toBe(false);
      await shareAsJPG(sampleEntry);
      expect(canvasMocks.html2canvas).toHaveBeenCalledTimes(3);
    });
  });
});
