import { DOMParser } from "@xmldom/xmldom";

interface ParsedFileChange {
  file_summary: string;
  file_operation: string;
  file_path: string;
  file_code?: string;
  new_file_path?: string;
}

export async function parseXmlString(xmlString: string): Promise<ParsedFileChange[]> {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");

    const changedFilesNode = doc.getElementsByTagName("changed_files")[0];
    if (!changedFilesNode) {
      throw new Error("XML does not contain <changed_files> element.");
    }

    const fileNodes = changedFilesNode.getElementsByTagName("file");
    const changes: ParsedFileChange[] = [];

    for (let i = 0; i < fileNodes.length; i++) {
      const fileNode = fileNodes[i];

      const fileSummaryNode = fileNode.getElementsByTagName("file_summary")[0];
      const fileOperationNode = fileNode.getElementsByTagName("file_operation")[0];
      const filePathNode = fileNode.getElementsByTagName("file_path")[0];
      const fileCodeNode = fileNode.getElementsByTagName("file_code")[0];
      const newFilePathNode = fileNode.getElementsByTagName("new_file_path")[0];

      if (!fileOperationNode || !filePathNode) {
        throw new Error("XML file node missing required <file_operation> or <file_path> element.");
      }

      const file_summary = fileSummaryNode?.textContent?.trim() ?? "";
      const file_operation = fileOperationNode.textContent?.trim() ?? "";
      const file_path = filePathNode.textContent?.trim() ?? "";

      let file_code: string | undefined = undefined;
      if (fileCodeNode && fileCodeNode.firstChild) {
        file_code = fileCodeNode.textContent?.trim() ?? "";
      }

      let new_file_path: string | undefined = undefined;
      if (newFilePathNode && newFilePathNode.textContent) {
        new_file_path = newFilePathNode.textContent.trim();
      }

      changes.push({
        file_summary,
        file_operation,
        file_path,
        file_code,
        new_file_path,
      });
    }

    return changes;
  } catch (error: unknown) {
    console.error("Error parsing XML:", error);
    throw new Error("Error parsing XML: " + (error instanceof Error ? error.message : "Unknown error"));
  }
}