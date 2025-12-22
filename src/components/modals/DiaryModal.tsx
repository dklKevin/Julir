/**
 * Diary Entry Modal - View and edit diary entries
 */

import { useMemo } from 'react';
import { X, PenTool, Save, SmilePlus, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getMoodIds, getMood, getMoodColors } from '../../constants';
import { ExportMenu } from '../common/ExportMenu';
import type { DiaryEntry } from '../../types';
import { generateId } from '../../utils';

export function DiaryModal() {
  const {
    diaryEntry,
    setDiaryEntry,
    editingId,
    setEditingId,
    selectedMood,
    setSelectedMood,
    selectedCharacter,
    selectedSummaryStyle,
    saveEntry,
    colors,
    isDark,
    isWrappingUpRef,
  } = useApp();

  // Calculate word and character count
  const stats = useMemo(() => {
    if (!diaryEntry) return { words: 0, chars: 0 };
    const words = diaryEntry.trim().split(/\s+/).filter(Boolean).length;
    const chars = diaryEntry.length;
    return { words, chars };
  }, [diaryEntry]);

  if (!diaryEntry) return null;

  const handleClose = () => {
    setDiaryEntry(null);
    setEditingId(null);
    setSelectedMood(null);
    isWrappingUpRef.current = false;
  };

  // Create a temporary entry object for export (before saving)
  const tempEntry: DiaryEntry = {
    id: editingId || generateId(),
    date: new Date().toLocaleDateString(),
    title: diaryEntry.split('\n')[0] || 'Untitled Entry',
    content: diaryEntry,
    mood: selectedMood || undefined,
    characterId: selectedCharacter,
    summaryStyleId: selectedSummaryStyle,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-lg h-[85vh] flex flex-col rounded-3xl shadow-2xl relative overflow-hidden ${
          isDark ? 'bg-stone-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${colors.border} ${colors.soft}`}>
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 opacity-50 hover:opacity-100"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${colors.accentBg} text-white`}>
              <PenTool size={18} />
            </div>
            <div className="flex-1">
              <h2 className={`text-xl font-serif font-bold ${colors.accent}`}>
                {editingId ? 'Edit Entry' : 'Your Entry'}
              </h2>
              <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                <span>Edit before saving</span>
                <span className="flex items-center gap-1">
                  <FileText size={10} />
                  {stats.words} words
                </span>
              </div>
            </div>
            {/* Export button in header */}
            <div className="mr-8">
              <ExportMenu entry={tempEntry} isDark={isDark} />
            </div>
          </div>
        </div>

        {/* Editor */}
        <textarea
          value={diaryEntry}
          onChange={(e) => setDiaryEntry(e.target.value)}
          className={`flex-1 w-full p-6 font-serif text-lg leading-loose resize-none outline-none ${
            isDark ? 'bg-stone-900 text-stone-100' : 'bg-white text-stone-700'
          }`}
          style={{ lineHeight: '2' }}
        />

        {/* Mood Selector */}
        <div className={`px-4 py-3 border-t ${colors.border}`}>
          <div className="flex items-center gap-2 mb-2">
            <SmilePlus size={14} className={isDark ? 'text-stone-400' : 'text-stone-500'} />
            <span className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              How are you feeling?
            </span>
            {selectedMood && (
              <button
                type="button"
                onClick={() => setSelectedMood(null)}
                className={`ml-auto text-xs ${
                  isDark ? 'text-stone-500 hover:text-stone-400' : 'text-stone-400 hover:text-stone-500'
                }`}
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {getMoodIds().map((moodId) => {
              const mood = getMood(moodId);
              const moodColors = getMoodColors(moodId, isDark);
              const isSelected = selectedMood === moodId;
              return (
                <button
                  key={moodId}
                  type="button"
                  onClick={() => setSelectedMood(isSelected ? null : moodId)}
                  title={mood.description}
                  className={`px-2 py-1 rounded-lg text-sm transition-all ${
                    isSelected
                      ? `${moodColors.soft} ${moodColors.text} ring-2 ring-offset-1 ${
                          isDark ? 'ring-offset-stone-900' : 'ring-offset-white'
                        } ${moodColors.border.replace('border-', 'ring-')}`
                      : `${isDark ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200'}`
                  }`}
                >
                  <span className="mr-1">{mood.emoji}</span>
                  <span className={isSelected ? '' : 'hidden sm:inline'}>{mood.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className={`p-4 border-t ${colors.border} flex gap-3`}>
          <button
            type="button"
            onClick={saveEntry}
            className={`flex-1 py-3 rounded-xl font-medium text-white transition flex items-center justify-center gap-2 ${colors.accentBg} hover:opacity-90`}
          >
            <Save size={18} />
            {editingId ? 'Update' : 'Save Entry'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className={`px-6 py-3 rounded-xl font-medium transition border ${
              isDark ? 'border-stone-700 hover:bg-stone-800' : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
