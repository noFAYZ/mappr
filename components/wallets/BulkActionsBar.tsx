import React from "react";
import { RefreshCw, Trash2, X } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onAction: (action: string) => void;
  onClear: () => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onAction,
  onClear,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold">
          {selectedCount}
        </div>
        <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          {selectedCount} wallet{selectedCount > 1 ? "s" : ""} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={() => onAction("sync")}
        >
          <RefreshCw className="h-3 w-3" />
          Sync All
        </button>

        <button
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          onClick={() => onAction("delete")}
        >
          <Trash2 className="h-3 w-3" />
          Remove All
        </button>

        <button
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          onClick={onClear}
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
