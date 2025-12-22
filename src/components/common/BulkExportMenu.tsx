/**
 * Bulk Export Menu - Export all entries at once
 */

import { useState, useRef, useEffect } from 'react';
import { FileText, FileCode, FileJson, Archive, ChevronDown, Loader2, Image } from 'lucide-react';
import type { DiaryEntry } from '../../types';
import {
  exportAllAsPDF,
  exportAllAsMarkdown,
  exportAllAsJSON,
  exportAllAsText,
  exportAllAsJPG,
} from '../../utils/exportUtils';

interface BulkExportMenuProps {
  entries: DiaryEntry[];
  isDark: boolean;
  colors: { accent: string; accentBg: string };
}

export function BulkExportMenu({ entries, isDark, colors }: BulkExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleExport = async (format: 'pdf' | 'markdown' | 'json' | 'txt' | 'jpg') => {
    // PDF and JPG exports are async (lazy-loaded)
    if (format === 'pdf' || format === 'jpg') {
      setIsLoading(true);
      try {
        if (format === 'pdf') {
          await exportAllAsPDF(entries);
        } else {
          await exportAllAsJPG(entries);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      switch (format) {
        case 'markdown':
          exportAllAsMarkdown(entries);
          break;
        case 'json':
          exportAllAsJSON(entries);
          break;
        case 'txt':
          exportAllAsText(entries);
          break;
      }
    }
    setIsOpen(false);
  };

  const exportOptions = [
    { id: 'jpg', label: 'Images', icon: Image, description: 'Individual photos for each entry' },
    { id: 'pdf', label: 'PDF', icon: FileText, description: 'Complete journal book' },
    { id: 'markdown', label: 'Markdown', icon: FileCode, description: 'For Obsidian, Notion, etc.' },
    { id: 'json', label: 'JSON', icon: FileJson, description: 'Full data backup' },
    { id: 'txt', label: 'Text', icon: FileText, description: 'Simple text file' },
  ] as const;

  if (entries.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`w-full px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition border ${
          isDark
            ? 'bg-stone-800 border-stone-700 hover:bg-stone-700'
            : 'bg-white border-stone-200 hover:bg-stone-50'
        } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Archive size={16} className={colors.accent} />}
        <span>{isLoading ? 'Preparing PDF...' : `Export All (${entries.length})`}</span>
        <ChevronDown size={14} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 bottom-full mb-2 rounded-xl border shadow-xl z-50 overflow-hidden ${
            isDark ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'
          }`}
        >
          <div className={`px-4 py-2 border-b ${isDark ? 'border-stone-700' : 'border-stone-200'}`}>
            <div className="text-xs font-medium text-stone-500">Export all entries as...</div>
          </div>
          {exportOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleExport(option.id)}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 transition ${
                isDark ? 'hover:bg-stone-700' : 'hover:bg-stone-100'
              }`}
            >
              <option.icon size={18} className={colors.accent} />
              <div className="flex-1">
                <div className="text-sm font-medium">{option.label}</div>
                <div className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
