'use client';

import React from 'react';
import { Flag, Pause, Play, FileText } from 'lucide-react';

interface QuizActionsProps {
  isFlagged: boolean;
  isPaused: boolean;
  onToggleFlag: () => void;
  onTogglePause: () => void;
  onShowSummary: () => void;
}

export function QuizActions({
  isFlagged,
  isPaused,
  onToggleFlag,
  onTogglePause,
  onShowSummary,
}: QuizActionsProps) {
  return (
    <div className="flex gap-3 mb-6">
      <button
        onClick={onToggleFlag}
        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
          isFlagged
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        <Flag className="w-4 h-4" />
        {isFlagged ? 'Unflag' : 'Flag for Review'}
      </button>
      <button
        onClick={onTogglePause}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        {isPaused ? 'Resume' : 'Pause'}
      </button>
      <div className="ml-auto">
        <button
          onClick={onShowSummary}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Quiz Summary
        </button>
      </div>
    </div>
  );
}
