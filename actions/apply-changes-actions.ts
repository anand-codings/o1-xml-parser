"use server";

import { applyFileChanges } from "@/lib/apply-changes";
import { parseXmlString } from "@/lib/xml-parser";

export interface FileChange {
  file_summary: string;
  file_operation: string;
  file_path: string;
  file_code?: string;
  new_file_path?: string;
}

export interface ActionSummary {
  totalFiles: number;
  [key: string]: number | FileChange[];
  changedFiles: FileChange[];
}

export async function applyChangesAction(xml: string, projectDirectory: string): Promise<ActionSummary> {
  const changes = await parseXmlString(xml);

  if (!changes || !Array.isArray(changes)) {
    throw new Error("Invalid XML format. Could not find changed_files.");
  }

  let finalDirectory = projectDirectory && projectDirectory.trim() !== ""
    ? projectDirectory.trim()
    : process.env.PROJECT_DIRECTORY;

  if (!finalDirectory) {
    throw new Error("No project directory provided and no fallback found in environment.");
  }

  // Compute summary
  const summary: ActionSummary = { 
    totalFiles: changes.length,
    changedFiles: changes.map(change => ({
      file_summary: change.file_summary,
      file_operation: change.file_operation,
      file_path: change.file_path,
      new_file_path: change.new_file_path
    }))
  };
  
  const actions = ["CREATE", "UPDATE", "DELETE", "MOVE", "DELETE_EMPTY_FOLDER"];
  actions.forEach((action) => { summary[action] = 0; });
  
  changes.forEach(change => {
    const op = change.file_operation.toUpperCase();
    summary[op] = (summary[op] as number || 0) + 1;
  });

  const normalChanges = changes.filter(change => change.file_operation.toUpperCase() !== "DELETE_EMPTY_FOLDER");
  const folderDeletionChanges = changes.filter(change => change.file_operation.toUpperCase() === "DELETE_EMPTY_FOLDER");

  // Process all normal file operations first.
  for (const file of normalChanges) {
    try {
      await applyFileChanges(file, finalDirectory);
    } catch (error: any) {
      throw new Error(`Error applying changes to file "${file.file_path}" (operation: ${file.file_operation}): ${error.message}`);
    }
  }
  
  // Process folder deletion operations at the end.
  for (const folderChange of folderDeletionChanges) {
    try {
      await applyFileChanges(folderChange, finalDirectory);
    } catch (error: any) {
      throw new Error(`Error applying folder deletion for "${folderChange.file_path}": ${error.message}`);
    }
  }
  
  return summary;
}