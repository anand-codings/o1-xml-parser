"use client";
// <ai_context> SummaryDisplay component for displaying summary of changes</ai_context>
import React from "react";

interface FileChange {
  file_summary: string;
  file_operation: string;
  file_path: string;
  file_code?: string;
  new_file_path?: string;
}

interface Summary {
  totalFiles: number;
  changedFiles: FileChange[];
  [key: string]: number | FileChange[];
}

interface SummaryDisplayProps {
  summary: Summary;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary }) => {
  return (
    <div className="mb-4 p-4 border rounded bg-gray-100 dark:bg-gray-700">
      <h3 className="font-bold mb-2">Summary</h3>
      <p className="mb-2">Total Files: {summary.totalFiles}</p>
      <ul className="list-disc list-inside">
        {Object.entries(summary)
          .filter(([key]) => key !== "totalFiles" && key !== "changedFiles")
          .map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default SummaryDisplay;