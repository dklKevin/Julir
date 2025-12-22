/**
 * History Panel - Journal entries with search & calendar view
 */

import { useState, useCallback } from 'react';
import {
  X,
  BookOpen,
  Search,
  List,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  PenTool,
  Edit2,
  Trash2,
  Flame,
  Pin,
  PinOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getMoodIds, getMood, getMoodColors } from '../../constants';
import { getMonthName, getDayNames, formatDateKey, isToday, isFutureDate } from '../../utils/calendarUtils';
import { haptic } from '../../utils';
import { ExportMenu } from '../common/ExportMenu';
import { BulkExportMenu } from '../common/BulkExportMenu';

export function HistoryPanel() {
  const {
    showHistory,
    setShowHistory,
    savedEntries,
    filteredEntries,
    searchQuery,
    setSearchQuery,
    historyViewMode,
    setHistoryViewMode,
    moodFilter,
    setMoodFilter,
    showFilters,
    setShowFilters,
    calendarYear,
    calendarMonth,
    calendarDays,
    selectedCalendarDate,
    setSelectedCalendarDate,
    selectedDateEntries,
    entriesByDate,
    currentStreak,
    handlePrevMonth,
    handleNextMonth,
    handleCalendarDayClick,
    handleGoToToday,
    clearSearchAndFilters,
    setDiaryEntry,
    setEditingId,
    setSelectedMood,
    deleteEntry,
    togglePinEntry,
    colors,
    isDark,
  } = useApp();

  // Track entries that are currently animating
  const [animatingEntryId, setAnimatingEntryId] = useState<string | null>(null);

  // Handle pin with animation - must be before early return
  const handlePinWithAnimation = useCallback((entryId: string, isCurrentlyPinned: boolean) => {
    haptic(isCurrentlyPinned ? 'light' : 'success');

    if (isCurrentlyPinned) {
      // Unpinning - just do it immediately, no fancy animation needed
      togglePinEntry(entryId);
      return;
    }

    // Pinning - animate slide up first
    setAnimatingEntryId(entryId);

    // Wait for animation to complete (350ms), then reorder
    setTimeout(() => {
      togglePinEntry(entryId);
      setAnimatingEntryId(null);
    }, 350);
  }, [togglePinEntry]);

  if (!showHistory) return null;

  const handleClose = () => {
    haptic('light');
    setShowHistory(false);
    clearSearchAndFilters();
  };

  const handleEditEntry = (entry: typeof savedEntries[0]) => {
    haptic('selection');
    setDiaryEntry(entry.content);
    setEditingId(entry.id);
    setSelectedMood(entry.mood || null);
    setShowHistory(false);
    clearSearchAndFilters();
  };

  const handleDeleteEntry = (id: string) => {
    haptic('warning');
    deleteEntry(id);
  };

  // Sort entries with pinned first, then by date
  const sortedEntries = (entries: typeof savedEntries) => {
    return [...entries].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const displayEntries = sortedEntries(
    searchQuery || moodFilter !== 'all' ? filteredEntries : savedEntries
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div
        className={`relative w-full max-w-md h-full flex flex-col shadow-2xl ${
          isDark ? 'bg-stone-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex-shrink-0"
          style={{ borderColor: isDark ? '#44403c' : '#e7e5e4' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen size={20} className={colors.accent} />
              <h2 className="text-xl font-serif font-bold">Journal</h2>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {savedEntries.length}
              </span>
              {currentStreak > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    currentStreak >= 7
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                      : currentStreak >= 3
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                  title={`${currentStreak} day streak!`}
                >
                  <Flame size={12} />
                  {currentStreak}
                </span>
              )}
            </div>
            <button type="button" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-stone-500' : 'text-stone-400'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className={`w-full pl-9 pr-9 py-2 rounded-xl text-sm outline-none transition ${
                isDark
                  ? 'bg-stone-800 text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-stone-700'
                  : 'bg-stone-100 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-stone-200'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* View Toggle & Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setHistoryViewMode('list')}
                className={`p-2 rounded-lg transition ${
                  historyViewMode === 'list'
                    ? `${colors.accentBg} text-white`
                    : isDark
                    ? 'hover:bg-stone-800 text-stone-400'
                    : 'hover:bg-stone-100 text-stone-500'
                }`}
                title="List view"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setHistoryViewMode('calendar')}
                className={`p-2 rounded-lg transition ${
                  historyViewMode === 'calendar'
                    ? `${colors.accentBg} text-white`
                    : isDark
                    ? 'hover:bg-stone-800 text-stone-400'
                    : 'hover:bg-stone-100 text-stone-500'
                }`}
                title="Calendar view"
              >
                <Calendar size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition flex items-center gap-1 ${
                  moodFilter !== 'all'
                    ? `${colors.soft} ${colors.accent}`
                    : isDark
                    ? 'hover:bg-stone-800 text-stone-400'
                    : 'hover:bg-stone-100 text-stone-500'
                }`}
                title="Filter by mood"
              >
                <Filter size={16} />
                {moodFilter !== 'all' && (
                  <span className="text-xs">{getMood(moodFilter).emoji}</span>
                )}
              </button>
            </div>
          </div>

          {/* Mood Filter Dropdown */}
          {showFilters && (
            <div
              className={`mt-3 p-3 rounded-xl border ${
                isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Filter by mood
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMoodFilter('all');
                    setShowFilters(false);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs transition ${
                    moodFilter === 'all'
                      ? `${colors.accentBg} text-white`
                      : isDark
                      ? 'bg-stone-700 hover:bg-stone-600'
                      : 'bg-stone-200 hover:bg-stone-300'
                  }`}
                >
                  All
                </button>
                {getMoodIds().map((moodId) => {
                  const mood = getMood(moodId);
                  const mColors = getMoodColors(moodId, isDark);
                  const isActive = moodFilter === moodId;
                  return (
                    <button
                      key={moodId}
                      type="button"
                      onClick={() => {
                        setMoodFilter(moodId);
                        setShowFilters(false);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs transition ${
                        isActive
                          ? `${mColors.soft} ${mColors.text}`
                          : isDark
                          ? 'bg-stone-700 hover:bg-stone-600'
                          : 'bg-stone-200 hover:bg-stone-300'
                      }`}
                    >
                      {mood.emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {savedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              {/* Decorative illustration */}
              <div className={`relative mb-6`}>
                <div className={`w-20 h-20 rounded-2xl ${colors.soft} flex items-center justify-center`}>
                  <BookOpen size={32} className={`${colors.accent} opacity-60`} />
                </div>
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full ${colors.accentBg} flex items-center justify-center`}>
                  <PenTool size={14} className="text-white" />
                </div>
              </div>

              <h3 className={`text-lg font-serif font-bold mb-2 ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>
                Your journal awaits
              </h3>
              <p className={`text-sm text-center max-w-[240px] mb-6 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                Start your first conversation and capture your thoughts. Each entry becomes part of your personal story.
              </p>

              {/* Tips */}
              <div className={`w-full max-w-xs space-y-2`}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-stone-800/50' : 'bg-stone-50'}`}>
                  <span className="text-lg">🎙️</span>
                  <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    Use voice or text to share your thoughts
                  </span>
                </div>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-stone-800/50' : 'bg-stone-50'}`}>
                  <span className="text-lg">✨</span>
                  <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    Your companion will help you reflect
                  </span>
                </div>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-stone-800/50' : 'bg-stone-50'}`}>
                  <span className="text-lg">📖</span>
                  <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    Entries are saved here for you to revisit
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className={`mt-6 px-6 py-2.5 rounded-xl font-medium text-sm text-white ${colors.accentBg} hover:opacity-90 transition tap-scale`}
              >
                Start Writing
              </button>
            </div>
          ) : historyViewMode === 'list' ? (
            /* List View */
            <div className="space-y-3">
              {displayEntries.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                  <Search size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No matching entries</p>
                  <button
                    type="button"
                    onClick={clearSearchAndFilters}
                    className={`mt-2 text-xs ${colors.accent} hover:underline`}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                displayEntries.map((entry) => {
                  const entryMood = entry.mood ? getMood(entry.mood) : null;
                  const entryMoodColors = entry.mood ? getMoodColors(entry.mood, isDark) : null;
                  const isAnimating = animatingEntryId === entry.id;

                  return (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-xl border hover:shadow-md ${
                        entry.isPinned
                          ? isDark
                            ? 'bg-amber-900/20 border-amber-700/50'
                            : 'bg-amber-50 border-amber-200'
                          : isDark
                          ? 'bg-stone-800 border-stone-700'
                          : 'bg-stone-50 border-stone-200'
                      } ${
                        isAnimating
                          ? 'animate-slide-up'
                          : 'transition-all duration-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {entry.isPinned && (
                            <Pin size={12} className="text-amber-500" />
                          )}
                          <p
                            className={`text-xs font-medium ${
                              isDark ? 'text-stone-500' : 'text-stone-400'
                            }`}
                          >
                            {entry.date}
                          </p>
                          {entryMood && entryMoodColors && (
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-md ${entryMoodColors.soft} ${entryMoodColors.text}`}
                              title={entryMood.label}
                            >
                              {entryMood.emoji}
                            </span>
                          )}
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex gap-1">
                              {entry.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    isDark ? 'bg-stone-700 text-stone-400' : 'bg-stone-200 text-stone-500'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                              {entry.tags.length > 2 && (
                                <span className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                                  +{entry.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handlePinWithAnimation(entry.id, !!entry.isPinned)}
                            disabled={isAnimating}
                            className={`p-1.5 rounded-lg transition ${
                              entry.isPinned
                                ? 'text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                                : isDark
                                ? 'hover:bg-stone-700'
                                : 'hover:bg-stone-200'
                            } ${isAnimating ? 'opacity-50' : ''}`}
                            title={entry.isPinned ? 'Unpin entry' : 'Pin entry'}
                          >
                            {entry.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditEntry(entry)}
                            className={`p-1.5 rounded-lg transition ${
                              isDark ? 'hover:bg-stone-700' : 'hover:bg-stone-200'
                            }`}
                            title="Edit entry"
                          >
                            <Edit2 size={14} />
                          </button>
                          <ExportMenu entry={entry} isDark={isDark} compact />
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry(entry.id)}
                            aria-label="Delete entry"
                            className="p-1.5 rounded-lg hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 btn-press focus-ring"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p
                        className={`text-sm line-clamp-3 font-serif ${
                          isDark ? 'text-stone-300' : 'text-stone-600'
                        }`}
                      >
                        {entry.content.split('\n').slice(2).join(' ').substring(0, 150)}...
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Calendar View */
            <div>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className={`p-2 rounded-lg transition ${
                    isDark ? 'hover:bg-stone-800' : 'hover:bg-stone-100'
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="text-center">
                  <h3 className="font-serif font-bold">
                    {getMonthName(calendarMonth)} {calendarYear}
                  </h3>
                  <button
                    type="button"
                    onClick={handleGoToToday}
                    className={`text-xs ${colors.accent} hover:underline`}
                  >
                    Today
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className={`p-2 rounded-lg transition ${
                    isDark ? 'hover:bg-stone-800' : 'hover:bg-stone-100'
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Day headers */}
                {getDayNames().map((day) => (
                  <div
                    key={day}
                    className={`text-center text-xs font-medium py-2 ${
                      isDark ? 'text-stone-500' : 'text-stone-400'
                    }`}
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const dateKey = formatDateKey(calendarYear, calendarMonth, day);
                  const dayEntries = entriesByDate.get(dateKey) || [];
                  const hasEntries = dayEntries.length > 0;
                  const isTodayDate = isToday(calendarYear, calendarMonth, day);
                  const isSelected = selectedCalendarDate === dateKey;
                  const isFuture = isFutureDate(calendarYear, calendarMonth, day);

                  const primaryMood =
                    hasEntries && dayEntries[0].mood ? getMood(dayEntries[0].mood) : null;

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={!hasEntries}
                      onClick={() => handleCalendarDayClick(day)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition relative ${
                        isSelected
                          ? `${colors.accentBg} text-white`
                          : isTodayDate
                          ? `ring-2 ${colors.border.replace('border-', 'ring-')} ${
                              hasEntries ? 'cursor-pointer' : ''
                            }`
                          : hasEntries
                          ? `cursor-pointer ${isDark ? 'hover:bg-stone-800' : 'hover:bg-stone-100'}`
                          : isFuture
                          ? `${isDark ? 'text-stone-700' : 'text-stone-300'}`
                          : `${isDark ? 'text-stone-600' : 'text-stone-400'}`
                      }`}
                    >
                      <span>{day}</span>
                      {hasEntries && !isSelected && (
                        <div className="flex gap-0.5 mt-0.5">
                          {primaryMood ? (
                            <span className="text-[10px]">{primaryMood.emoji}</span>
                          ) : (
                            <div className={`w-1.5 h-1.5 rounded-full ${colors.accentBg}`} />
                          )}
                          {dayEntries.length > 1 && (
                            <span
                              className={`text-[8px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}
                            >
                              +{dayEntries.length - 1}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Date Entries */}
              {selectedCalendarDate && selectedDateEntries.length > 0 && (
                <div
                  className={`mt-4 p-3 rounded-xl border ${
                    isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4
                      className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-600'}`}
                    >
                      {selectedCalendarDate}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarDate(null)}
                      className={`text-xs ${
                        isDark ? 'text-stone-500 hover:text-stone-400' : 'text-stone-400 hover:text-stone-500'
                      }`}
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedDateEntries.map((entry) => {
                      const entryMood = entry.mood ? getMood(entry.mood) : null;
                      const entryMoodColors = entry.mood ? getMoodColors(entry.mood, isDark) : null;
                      return (
                        <div
                          key={entry.id}
                          className={`p-3 rounded-lg ${isDark ? 'bg-stone-900' : 'bg-white'}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            {entryMood && entryMoodColors && (
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded-md ${entryMoodColors.soft} ${entryMoodColors.text}`}
                              >
                                {entryMood.emoji} {entryMood.label}
                              </span>
                            )}
                            <div className="flex gap-1 ml-auto">
                              <button
                                type="button"
                                onClick={() => handleEditEntry(entry)}
                                className={`p-1 rounded transition ${
                                  isDark ? 'hover:bg-stone-700' : 'hover:bg-stone-200'
                                }`}
                              >
                                <Edit2 size={12} />
                              </button>
                              <ExportMenu entry={entry} isDark={isDark} compact />
                            </div>
                          </div>
                          <p
                            className={`text-xs line-clamp-2 font-serif ${
                              isDark ? 'text-stone-400' : 'text-stone-500'
                            }`}
                          >
                            {entry.content.split('\n').slice(2).join(' ').substring(0, 100)}...
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Bulk Export */}
        {savedEntries.length > 0 && (
          <div
            className={`p-4 border-t flex-shrink-0 ${
              isDark ? 'border-stone-800' : 'border-stone-200'
            }`}
          >
            <BulkExportMenu entries={savedEntries} isDark={isDark} colors={colors} />
          </div>
        )}
      </div>
    </div>
  );
}
