"use client";
// <ai_context> ChangedFilesTable component for displaying a table of changed files</ai_context>
import React from "react";
import OperationBadge from "./OperationBadge";

interface FileChange {
  file_summary: string;
  file_operation: string;
  file_path: string;
  file_code?: string;
  new_file_path?: string;
}

interface ChangedFilesTableProps {
  changedFiles: FileChange[];
  projectDirectory: string;
  openFolder: (filePath: string) => Promise<void>;
}

const getFileName = (path: string) => {
  return path.split("/").pop() || path;
};

const getDirectory = (path: string) => {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/") || "/";
};

const ChangedFilesTable: React.FC<ChangedFilesTableProps> = ({ changedFiles, projectDirectory, openFolder }) => {
  return (
    <div className="mb-4 p-4 border rounded bg-gray-100 dark:bg-gray-700">
      <h3 className="font-bold mb-2">Changed Files</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-600">
              <th className="py-2 px-3 text-left">File</th>
              <th className="py-2 px-3 text-left">Directory</th>
              <th className="py-2 px-3 text-left">Operation</th>
            </tr>
          </thead>
          <tbody>
            {changedFiles.map((file, index) => (
              <tr
                key={index}
                className={
                  index % 2 === 0
                    ? "bg-gray-50 dark:bg-gray-800"
                    : "bg-white dark:bg-gray-700"
                }
              >
                <td className="py-2 px-3 font-mono text-sm">
                  {getFileName(file.file_path)}
                </td>
                <td className="py-2 px-3 font-mono text-sm">
                  <button
                    onClick={() => openFolder(file.file_path)}
                    className="underline text-blue-600 hover:text-blue-800"
                  >
                    {getDirectory(file.file_path)}
                  </button>
                </td>
                <td className="py-2 px-3">
                  <OperationBadge operation={file.file_operation} />
                  {file.new_file_path && (
                    <span className="block text-xs text-muted-foreground">
                      → {file.new_file_path}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChangedFilesTable;