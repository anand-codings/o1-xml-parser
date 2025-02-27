"use client";
// <ai_context> ApplyChangesForm component - main form for applying XML changes</ai_context>
import { applyChangesAction } from "@/actions/apply-changes-actions";
import { useEffect, useState } from "react";
import SummaryDisplay from "./SummaryDisplay";
import ChangedFilesTable from "./ChangedFilesTable";

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

export function ApplyChangesForm() {
  const [xml, setXml] = useState<string>("");
  const [projectDirectory, setProjectDirectory] = useState<string>("");
  const [savedDirectories, setSavedDirectories] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("savedProjectDirectories");
      if (stored) {
        try {
          setSavedDirectories(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing saved project directories from localStorage", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [successMessage]);

  const handleDirectorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProjectDirectory(e.target.value);
  };

  const handleApply = async () => {
    setErrorMessage("");
    setSummary(null);
    if (!xml.trim()) {
      setErrorMessage("Please paste XML before applying changes.");
      return;
    }
    setIsLoading(true);
    try {
      const summaryData = await applyChangesAction(xml, projectDirectory.trim());
      setXml("");
      setSuccessMessage("Changes applied successfully");
      setSummary(summaryData);

      const trimmedDir = projectDirectory.trim();
      if (trimmedDir && !savedDirectories.includes(trimmedDir)) {
        const newSaved = [...savedDirectories, trimmedDir];
        setSavedDirectories(newSaved);
        localStorage.setItem("savedProjectDirectories", JSON.stringify(newSaved));
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred while applying changes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setXml("");
    setSummary(null);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const openFolder = async (filePath: string) => {
    const parts = filePath.split("/");
    parts.pop();
    const directory = parts.join("/") || "/";
    let baseDir = projectDirectory.trim();
    if (baseDir.endsWith("/")) {
      baseDir = baseDir.slice(0, -1);
    }
    const fullFolderPath = `${baseDir}/${directory}`;
    try {
      const res = await fetch("/api/open-folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ folderPath: fullFolderPath })
      });
      if (!res.ok) {
        console.error("Failed to open folder");
      }
    } catch (err) {
      console.error("Error opening folder", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">O1 XML Parser</h2>
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          {successMessage}
        </div>
      )}
      {savedDirectories.length > 0 && (
        <div className="mb-4">
          <label className="block font-bold mb-2">Saved Project Directories:</label>
          <select
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
            value={projectDirectory}
            onChange={handleDirectorySelect}
          >
            <option value="">Select a saved directory</option>
            {savedDirectories.map((dir, index) => (
              <option key={index} value={dir}>
                {dir}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-4">
        <label className="block font-bold mb-2">Project Directory:</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          value={projectDirectory}
          onChange={(e) => setProjectDirectory(e.target.value)}
          placeholder="e.g. /Users/myusername/projects/o1-xml-parser"
        />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Paste XML here:</label>
        <textarea
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary h-64"
          value={xml}
          onChange={(e) => setXml(e.target.value)}
          placeholder="Paste the <code_changes>...</code_changes> XML here"
        />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <button
          className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded shadow hover:bg-primary/90 transition-colors disabled:opacity-70"
          onClick={handleApply}
          disabled={isLoading}
        >
          {isLoading ? "Applying..." : "Apply"}
        </button>
        <button
          className="py-2 px-4 rounded shadow bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
      {summary && <SummaryDisplay summary={summary} />}
      {summary?.changedFiles && summary.changedFiles.length > 0 && (
        <ChangedFilesTable changedFiles={summary.changedFiles} projectDirectory={projectDirectory} openFolder={openFolder} />
      )}
    </div>
  );
}