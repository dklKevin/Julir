/**
 * Export Menu - Dropdown for export format selection
 */

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileCode, FileJson, ChevronDown, Loader2, Image, Share2 } from 'lucide-react';
import type { DiaryEntry } from '../../types';
import {
  exportAsPDF,
  exportAsMarkdown,
  exportAsJSON,
  exportAsText,
  exportAsJPG,
  shareAsJPG,
  canShare,
} from '../../utils/exportUtils';

interface ExportMenuProps {
  entry: DiaryEntry;
  isDark: boolean;
  compact?: boolean;
}

export function ExportMenu({ entry, isDark, compact = false }: ExportMenuProps) {
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

  const handleExport = async (format: 'pdf' | 'markdown' | 'json' | 'txt' | 'jpg' | 'share') => {
    // PDF, JPG, and Share exports are async (lazy-loaded)
    if (format === 'pdf' || format === 'jpg' || format === 'share') {
      setIsLoading(true);
      try {
        if (format === 'pdf') {
          await exportAsPDF(entry);
        } else if (format === 'share') {
          await shareAsJPG(entry);
        } else {
          await exportAsJPG(entry);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      switch (format) {
        case 'markdown':
          exportAsMarkdown(entry);
          break;
        case 'json':
          exportAsJSON(entry);
          break;
        case 'txt':
          exportAsText(entry);
          break;
      }
    }
    setIsOpen(false);
  };

  const exportOptions = [
    ...(canShare() ? [{ id: 'share' as const, label: 'Share', icon: Share2, description: 'Share as image' }] : []),
    { id: 'jpg' as const, label: 'Image', icon: Image, description: 'Save as photo' },
    { id: 'pdf' as const, label: 'PDF', icon: FileText, description: 'Formatted document' },
    { id: 'markdown' as const, label: 'Markdown', icon: FileCode, description: 'For notes apps' },
    { id: 'json' as const, label: 'JSON', icon: FileJson, description: 'Data backup' },
    { id: 'txt' as const, label: 'Text', icon: FileText, description: 'Plain text' },
  ];

  if (compact) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`p-1.5 rounded-lg transition ${
            isDark ? 'hover:bg-stone-700' : 'hover:bg-stone-200'
          } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
          title="Export entry"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        </button>

        {isOpen && (
          <div
            className={`absolute right-0 top-full mt-1 w-40 rounded-lg border shadow-lg z-50 overflow-hidden ${
              isDark ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'
            }`}
          >
            {exportOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleExport(option.id)}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition ${
                  isDark ? 'hover:bg-stone-700' : 'hover:bg-stone-100'
                }`}
              >
                <option.icon size={14} className={isDark ? 'text-stone-400' : 'text-stone-500'} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition border ${
          isDark
            ? 'bg-stone-800 border-stone-700 hover:bg-stone-700'
            : 'bg-white border-stone-200 hover:bg-stone-50'
        } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        <span>{isLoading ? 'Loading...' : 'Export'}</span>
        <ChevronDown size={14} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-1 w-48 rounded-xl border shadow-xl z-50 overflow-hidden ${
            isDark ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'
          }`}
        >
          <div className={`px-3 py-2 text-xs font-medium ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
            Export as...
          </div>
          {exportOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleExport(option.id)}
              className={`w-full px-3 py-2.5 text-left flex items-center gap-3 transition ${
                isDark ? 'hover:bg-stone-700' : 'hover:bg-stone-100'
              }`}
            >
              <option.icon size={16} className={isDark ? 'text-stone-400' : 'text-stone-500'} />
              <div>
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
