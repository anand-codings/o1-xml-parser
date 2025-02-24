import { promises as fs } from "fs";
import { dirname, join } from "path";

interface FileChange {
  file_summary: string;
  file_operation: string;
  file_path: string;
  file_code?: string;
  new_file_path?: string;
}

export async function applyFileChanges(change: FileChange, projectDirectory: string) {
  const { file_operation, file_path, file_code } = change;
  const fullPath = join(projectDirectory, file_path);

  switch (file_operation.toUpperCase()) {
    case "CREATE":
      if (!file_code) {
        throw new Error(`No file_code provided for CREATE operation on ${file_path}`);
      }
      await ensureDirectoryExists(dirname(fullPath));
      await fs.writeFile(fullPath, file_code, "utf-8");
      break;

    case "UPDATE":
      if (!file_code) {
        throw new Error(`No file_code provided for UPDATE operation on ${file_path}`);
      }
      await ensureDirectoryExists(dirname(fullPath));
      await fs.writeFile(fullPath, file_code, "utf-8");
      break;

    case "DELETE":
      await fs.rm(fullPath, { force: true });
      break;

    case "MOVE":
      if (!change.new_file_path) {
        throw new Error(`No new_file_path provided for MOVE operation on ${file_path}`);
      }
      const destinationFullPath = join(projectDirectory, change.new_file_path);
      await ensureDirectoryExists(dirname(destinationFullPath));
      await fs.rename(fullPath, destinationFullPath);
      break;

    case "DELETE_EMPTY_FOLDER":
      {
        const folderPath = join(projectDirectory, file_path);
        await deleteEmptyFolder(folderPath);
      }
      break;

    default:
      throw new Error(`Unknown file_operation "${file_operation}" for file: "${file_path}"`);
  }
}

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error: any) {
    if (error.code !== "EEXIST") {
      console.error(`Error creating directory ${dir}:`, error);
      throw new Error(`Failed to create directory "${dir}": ${error.message}`);
    }
  }
}

async function deleteEmptyFolder(folderPath: string) {
  try {
    const stats = await fs.stat(folderPath);
    if (!stats.isDirectory()) {
      return;
    }
    const files = await fs.readdir(folderPath);
    if (files.length === 0) {
      await fs.rmdir(folderPath);
    }
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return;
    }
    console.error(`Error deleting empty folder ${folderPath}:`, error);
    throw new Error(`Failed to delete empty folder "${folderPath}": ${error.message}`);
  }
}