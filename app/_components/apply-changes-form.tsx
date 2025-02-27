"use client";
import { applyChangesAction } from "@/actions/apply-changes-actions";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    // Load saved directories from localStorage on mount (ensure window is defined)
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
    try {
      const summaryData = await applyChangesAction(xml, projectDirectory.trim());
      setXml("");
      setSuccessMessage("Changes applied successfully");
      setSummary(summaryData);

      // Save project directory if not already saved and if provided
      const trimmedDir = projectDirectory.trim();
      if (trimmedDir && !savedDirectories.includes(trimmedDir)) {
        const newSaved = [...savedDirectories, trimmedDir];
        setSavedDirectories(newSaved);
        localStorage.setItem("savedProjectDirectories", JSON.stringify(newSaved));
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred while applying changes.");
    }
  };

  // Helper function to get the file name from the path
  const getFileName = (path: string) => {
    return path.split("/").pop() || path;
  };

  // Helper function to get the directory from the path
  const getDirectory = (path: string) => {
    const parts = path.split("/");
    parts.pop(); // Remove the file name
    return parts.join("/") || "/";
  };

  // Helper function to open the folder in Finder on MacOS via API call
  const openFolder = async (filePath: string) => {
    const directory = getDirectory(filePath);
    let baseDir = projectDirectory.trim();
    if (baseDir.endsWith("/")) {
      baseDir = baseDir.slice(0, -1);
    }
    const fullFolderPath = `${baseDir}/${directory}`;
    try {
      const res = await fetch('/api/open-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folderPath: fullFolderPath })
      });
      if (!res.ok) {
        console.error('Failed to open folder');
      }
    } catch (err) {
      console.error('Error opening folder', err);
    }
  };

  // Helper function to get color for the operation
  const getOperationColor = (operation: string) => {
    switch (operation.toUpperCase()) {
      case "CREATE":
        return "text-green-400";
      case "UPDATE":
        return "text-blue-400";
      case "DELETE":
        return "text-red-400";
      case "MOVE":
        return "text-yellow-400";
      case "DELETE_EMPTY_FOLDER":
        return "text-orange-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto p-4 flex flex-col gap-4">
      {errorMessage && <div className="text-red-400">{errorMessage}</div>}
      {successMessage && <div className="text-green-400">{successMessage}</div>}
      {savedDirectories.length > 0 && (
        <div className="flex flex-col">
          <label className="mb-2 font-bold">Saved Project Directories:</label>
          <select
            className="border bg-secondary text-secondary-foreground p-2 w-full rounded-md"
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
      <div className="flex flex-col">
        <label className="mb-2 font-bold">Project Directory:</label>
        <input
          className="border bg-secondary text-secondary-foreground p-2 w-full rounded-md"
          type="text"
          value={projectDirectory}
          onChange={(e) => setProjectDirectory(e.target.value)}
          placeholder="e.g. /Users/myusername/projects/o1-xml-parser"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-2 font-bold">Paste XML here:</label>
        <textarea
          className="border bg-secondary text-secondary-foreground p-2 h-64 w-full rounded-md"
          value={xml}
          onChange={(e) => setXml(e.target.value)}
          placeholder="Paste the <code_changes>...</code_changes> XML here"
        />
      </div>
      <button
        className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors"
        onClick={handleApply}
      >
        Apply
      </button>
      {summary && (
        <div className="mt-4 p-4 border rounded-md">
          <h3 className="font-bold mb-2">Summary</h3>
          <p>Total Files: {summary.totalFiles}</p>
          <ul>
            {Object.entries(summary)
              .filter(([key]) => key !== "totalFiles" && key !== "changedFiles")
              .map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
          </ul>
        </div>
      )}
      
      {summary?.changedFiles && summary.changedFiles.length > 0 && (
        <div className="mt-4 p-4 border rounded-md">
          <h3 className="font-bold mb-2">Changed Files</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-secondary/50 rounded-md">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-3 text-left">File</th>
                  <th className="py-2 px-3 text-left">Directory</th>
                  <th className="py-2 px-3 text-left">Operation</th>
                </tr>
              </thead>
              <tbody>
                {summary.changedFiles.map((file, index) => (
                  <tr 
                    key={index} 
                    className={index % 2 === 0 ? "bg-secondary/30" : ""}
                  >
                    <td className="py-2 px-3 font-mono text-sm">{getFileName(file.file_path)}</td>
                    <td className="py-2 px-3 font-mono text-sm">
                      <button onClick={() => openFolder(file.file_path)} className="underline text-blue-600">
                        {getDirectory(file.file_path)}
                      </button>
                    </td>
                    <td className={`py-2 px-3 font-medium ${getOperationColor(file.file_operation)}`}>
                      {file.file_operation.toUpperCase()}
                      {file.new_file_path && (
                        <span className="block text-xs text-muted-foreground">→ {file.new_file_path}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}