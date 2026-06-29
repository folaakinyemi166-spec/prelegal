"use client";

import { useAuth } from "@/contexts/AuthContext";

interface Props {
  onMyDocuments?: () => void;
  onNewDocument?: () => void;
  showBackToCatalog?: boolean;
  onBackToCatalog?: () => void;
}

export function AppHeader({ onMyDocuments, onNewDocument, showBackToCatalog, onBackToCatalog }: Props) {
  const { user, signOut } = useAuth();

  return (
    <header className="print:hidden bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        {showBackToCatalog && onBackToCatalog && (
          <button
            onClick={onBackToCatalog}
            className="text-xs text-gray-400 hover:text-brand-primary transition-colors mr-1"
            aria-label="Back to catalog"
          >
            ← Back
          </button>
        )}
        <div>
          <span className="text-lg font-bold text-brand-navy">PreLegal</span>
          <span className="hidden sm:inline ml-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            AI Legal Builder
          </span>
        </div>
      </div>

      <nav className="flex items-center gap-3">
        {onNewDocument && (
          <button
            onClick={onNewDocument}
            className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            New document
          </button>
        )}
        {onMyDocuments && (
          <button
            onClick={onMyDocuments}
            className="text-xs font-medium text-brand-primary hover:opacity-80 px-3 py-1.5 rounded-lg border border-brand-primary border-opacity-30 hover:bg-blue-50 transition-colors"
          >
            My Documents
          </button>
        )}
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
            <span className="hidden sm:block text-xs text-gray-500 max-w-[160px] truncate">{user.email}</span>
            <button
              onClick={signOut}
              className="text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
