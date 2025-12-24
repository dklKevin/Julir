/**
 * Delete Data Modal
 * Required for App Store compliance (Account Deletion Requirement)
 * Allows users to delete all their data from the app.
 */

import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { haptic } from '../../utils';

interface DeleteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export function DeleteDataModal({ isOpen, onClose, onConfirmDelete }: DeleteDataModalProps) {
  const { isDark } = useApp();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const canDelete = confirmText.toLowerCase() === 'delete';

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    haptic('warning');

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    onConfirmDelete();
    setIsDeleting(false);
    setConfirmText('');
    onClose();
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-title"
      aria-describedby="delete-description"
    >
      <div
        className={`relative w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-stone-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle size={20} />
            <h2 id="delete-title" className="text-lg font-semibold">
              Delete All Data
            </h2>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-stone-800' : 'hover:bg-stone-100'
            }`}
            aria-label="Cancel deletion"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p
            id="delete-description"
            className={`text-sm mb-4 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}
          >
            This will permanently delete:
          </p>

          <ul className={`text-sm space-y-2 mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              All your diary entries
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Your profile and name
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              All settings and preferences
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Saved API keys
            </li>
          </ul>

          <div className={`p-3 rounded-xl mb-4 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <p className="text-red-500 text-xs font-medium">
              This action cannot be undone. All your data will be permanently removed from this device.
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="mb-4">
            <label
              htmlFor="confirm-delete"
              className={`block text-xs font-medium mb-2 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}
            >
              Type "DELETE" to confirm:
            </label>
            <input
              id="confirm-delete"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              className={`w-full p-3 rounded-xl border outline-none transition-all text-sm font-mono ${
                isDark
                  ? 'bg-stone-800 border-stone-700 focus:border-red-500'
                  : 'bg-white border-stone-200 focus:border-red-500'
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-colors ${
                isDark
                  ? 'bg-stone-800 hover:bg-stone-700'
                  : 'bg-stone-100 hover:bg-stone-200'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={!canDelete || isDeleting}
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                canDelete
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              } ${isDeleting ? 'opacity-75' : ''}`}
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {isDeleting ? 'Deleting...' : 'Delete All'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
