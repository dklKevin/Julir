/**
 * Insights Panel - Mood tracking statistics and analytics
 */

import {
  X,
  BarChart3,
  BookOpen,
  Flame,
  TrendingUp,
  Heart,
  Clock,
  SmilePlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getMoodIds, getMood, getMoodColors } from '../../constants';

export function InsightsPanel() {
  const { showInsights, setShowInsights, savedEntries, moodStats, colors, isDark } = useApp();

  if (!showInsights) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setShowInsights(false)}
      />
      <div
        className={`relative w-full max-w-md h-full overflow-y-auto p-6 shadow-2xl ${
          isDark ? 'bg-stone-900' : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 size={20} className={colors.accent} />
            <h2 className="text-xl font-serif font-bold">Insights</h2>
          </div>
          <button type="button" onClick={() => setShowInsights(false)}>
            <X size={20} />
          </button>
        </div>

        {savedEntries.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
            <BarChart3 size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Start journaling to see insights</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Streak Stats */}
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-stone-800/50 border-stone-700' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Flame size={16} className="text-orange-500" />
                <span className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                  Journaling Streak
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-3xl font-bold ${colors.accent}`}>{moodStats.currentStreak}</p>
                  <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Current streak
                  </p>
                </div>
                <div>
                  <p className={`text-3xl font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                    {moodStats.longestStreak}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    Longest streak
                  </p>
                </div>
              </div>
            </div>

            {/* Total Entries */}
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-stone-800/50 border-stone-700' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className={colors.accent} />
                <span className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                  Total Entries
                </span>
              </div>
              <p className={`text-3xl font-bold ${colors.accent}`}>{moodStats.totalEntries}</p>
              <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                {moodStats.entriesWithMood} with mood tracked
              </p>
            </div>

            {/* Mood Distribution */}
            {moodStats.entriesWithMood > 0 && (
              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-stone-800/50 border-stone-700' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className={colors.accent} />
                  <span className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                    Mood Balance
                  </span>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        Positive
                      </span>
                      <span
                        className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}
                      >
                        {moodStats.positivePercentage}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-stone-700' : 'bg-stone-200'}`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                        style={{ width: `${moodStats.positivePercentage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Neutral
                      </span>
                      <span
                        className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}
                      >
                        {moodStats.neutralPercentage}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-stone-700' : 'bg-stone-200'}`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-slate-400 to-slate-500 transition-all duration-500"
                        style={{ width: `${moodStats.neutralPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-xs ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                        Challenging
                      </span>
                      <span
                        className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}
                      >
                        {moodStats.challengingPercentage}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-stone-700' : 'bg-stone-200'}`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500"
                        style={{ width: `${moodStats.challengingPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Most Frequent Mood */}
            {moodStats.mostFrequentMood && (
              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-stone-800/50 border-stone-700' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Heart size={16} className={colors.accent} />
                  <span className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                    Most Common Mood
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getMood(moodStats.mostFrequentMood).emoji}</span>
                  <div>
                    <p className={`font-bold ${colors.accent}`}>
                      {getMood(moodStats.mostFrequentMood).label}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                      {moodStats.moodCounts[moodStats.mostFrequentMood]} times
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Mood Timeline */}
            {moodStats.recentMoods.length > 0 && (
              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-stone-800/50 border-stone-700' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className={colors.accent} />
                  <span className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                    Recent Moods
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {moodStats.recentMoods.map((item, idx) => {
                    const mood = getMood(item.mood);
                    const mColors = getMoodColors(item.mood, isDark);
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col items-center p-2 rounded-lg ${mColors.soft}`}
                        title={`${item.date}: ${mood.label}`}
                      >
                        <span className="text-xl">{mood.emoji}</span>
                        <span
                          className={`text-[10px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}
                        >
                          {item.date.split('/').slice(0, 2).join('/')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mood Breakdown */}
            {moodStats.entriesWithMood > 0 && (
              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-stone-800/50 border-stone-700' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <SmilePlus size={16} className={colors.accent} />
                  <span className={`text-sm font-medium ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                    All Moods
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getMoodIds()
                    .filter((id) => moodStats.moodCounts[id] > 0)
                    .sort((a, b) => moodStats.moodCounts[b] - moodStats.moodCounts[a])
                    .map((moodId) => {
                      const mood = getMood(moodId);
                      const mColors = getMoodColors(moodId, isDark);
                      return (
                        <div
                          key={moodId}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${mColors.soft}`}
                        >
                          <span>{mood.emoji}</span>
                          <span className={`text-sm ${mColors.text}`}>
                            {moodStats.moodCounts[moodId]}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
