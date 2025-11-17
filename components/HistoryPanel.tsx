"use client";

import { History } from "lucide-react";

interface HistoryPanelProps {
  history: string[];
}

export default function HistoryPanel({ history }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div>
        <div className="text-gray-400 text-xl mb-2 flex items-center gap-2">
          <History />
          <p>History</p>
        </div>
        <div className="text-gray-500">No Jokes yet.</div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-semibold mb-2">History</h4>
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
        {history.map((h, i) => (
          <div key={i} className="p-2">
            {h}
          </div>
        ))}
      </div>
    </div>
  );
}
