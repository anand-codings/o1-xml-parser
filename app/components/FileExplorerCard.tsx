// <ai_context> FileExplorerCard component for displaying a file explorer UI with selectable items and a Copy File Contents button that generates a file map and file contents output </ai_context>
"use client";

import { useState } from "react";

interface TreeNode {
  name: string;
  type: "file" | "folder";
  children?: TreeNode[];
}

interface SelectedItem {
  path: string;
  node: TreeNode;
}

const fileTree: TreeNode = {
  name: "o1-xml-parser",
  type: "folder",
  children: [
    {
      name: "actions",
      type: "folder",
      children: [
        { name: "apply-changes-actions.ts", type: "file" }
      ]
    },
    {
      name: "app",
      type: "folder",
      children: [
        { name: "globals.css", type: "file" },
        { name: "layout.tsx", type: "file" },
        { name: "page.tsx", type: "file" }
      ]
    },
    {
      name: "lib",
      type: "folder",
      children: [
        { name: "apply-changes.ts", type: "file" },
        { name: "utils.ts", type: "file" },
        { name: "xml-parser.ts", type: "file" }
      ]
    },
    { name: ".env.example", type: "file" },
    { name: ".eslintrc.json", type: "file" },
    { name: "components.json", type: "file" },
    { name: "next.config.mjs", type: "file" },
    { name: "package.json", type: "file" },
    { name: "postcss.config.mjs", type: "file" },
    { name: "README.md", type: "file" },
    { name: "tailwind.config.ts", type: "file" },
    { name: "tsconfig.json", type: "file" }
  ]
};

// Updated simulated file contents with actual file content
const simulatedFileContents: { [key: string]: string } = {
  "o1-xml-parser/.env.example": `# If no project directory is provided, this will be used as the default
PROJECT_DIRECTORY=/path/to/my/project`,
  "o1-xml-parser/.eslintrc.json": `{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "prefer-const": "off"
  }
}`,
  "o1-xml-parser/app/page.tsx": `"use server";

import { Suspense } from "react";
import { ApplyChangesForm } from "./components/ApplyChangesForm";

export default async function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplyChangesForm />
    </Suspense>
  );
}
`,
  // Other files can be added as needed.
};

const getFilesRecursively = (node: TreeNode, currentPath: string): { path: string, content: string }[] => {
  let files: { path: string, content: string }[] = [];
  if (node.type === "file") {
    files.push({ 
      path: currentPath, 
      content: simulatedFileContents[currentPath] || `No content available for ${currentPath}` 
    });
  } else if (node.type === "folder" && node.children) {
    node.children.forEach(child => {
      const childPath = currentPath ? `${currentPath}/${child.name}` : child.name;
      files = files.concat(getFilesRecursively(child, childPath));
    });
  }
  return files;
};

function getLanguageFromFilename(filename: string): string {
  if (filename.endsWith(".json")) return "json";
  if (filename.endsWith(".ts") || filename.endsWith(".tsx")) return "ts";
  if (filename.endsWith(".css")) return "css";
  if (filename.endsWith(".mjs")) return "mjs";
  if (filename.endsWith(".md")) return "md";
  if (filename.endsWith(".example")) return "example";
  return "";
}

function generateTreeStringForNode(node: TreeNode, indent: string = "", isLast: boolean = true): string {
  const pointer = isLast ? "└── " : "├── ";
  let result = indent + pointer + node.name + "\n";
  if (node.type === "folder" && node.children && node.children.length > 0) {
    const newIndent = indent + (isLast ? "    " : "│   ");
    node.children.forEach((child, index) => {
      const childIsLast = index === node.children!.length - 1;
      result += generateTreeStringForNode(child, newIndent, childIsLast);
    });
  }
  return result;
}

function generateFileMap(selectedItems: SelectedItem[]): string {
  const projectDir = "/Users/ab/Desktop/dev/o1-xml-parser";
  let mapStr = `<file_map>\n${projectDir}\n`;
  selectedItems.forEach((item, index) => {
    mapStr += generateTreeStringForNode(item.node, "", index === selectedItems.length - 1);
  });
  mapStr += `</file_map>`;
  return mapStr;
}

function generateFileContents(selectedItems: SelectedItem[]): string {
  let contentsStr = `<file_contents>\n`;
  const files: { path: string, content: string }[] = [];
  selectedItems.forEach(item => {
    if (item.node.type === "file") {
      files.push({ path: item.path, content: simulatedFileContents[item.path] || `No content available for ${item.path}` });
    } else if (item.node.type === "folder") {
      files.push(...getFilesRecursively(item.node, item.path));
    }
  });
  files.forEach(file => {
    const language = getLanguageFromFilename(file.path);
    contentsStr += `File: ${file.path}\n\`\`\`${language}\n${file.content}\n\`\`\`\n\n`;
  });
  contentsStr += `</file_contents>`;
  return contentsStr;
}

interface TreeNodeComponentProps {
  node: TreeNode;
  currentPath: string;
  selectedItems: SelectedItem[];
  onToggleSelect: (path: string, node: TreeNode) => void;
}

function TreeNodeComponent({ node, currentPath, selectedItems, onToggleSelect }: TreeNodeComponentProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.type === "folder" && node.children && node.children.length > 0;
  
  const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
  const isSelected = selectedItems.some(item => item.path === fullPath);

  return (
    <div className="ml-4">
      <div className="flex items-center space-x-2">
        {node.type === "folder" && (
          <button onClick={() => setExpanded(!expanded)} className="focus:outline-none">
            {expanded ? "📂" : "📁"}
          </button>
        )}
        {node.type === "file" && <span>📄</span>}
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => onToggleSelect(fullPath, node)}
        />
        <span>{node.name}</span>
      </div>
      {expanded && hasChildren && (
        <div className="ml-4">
          {node.children!.map((child, index) => (
            <TreeNodeComponent 
              key={index} 
              node={child} 
              currentPath={fullPath} 
              selectedItems={selectedItems} 
              onToggleSelect={onToggleSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorerCard() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [copiedOutput, setCopiedOutput] = useState<string | null>(null);

  const onToggleSelect = (path: string, node: TreeNode) => {
    setSelectedItems(prev => {
      const exists = prev.find(item => item.path === path);
      if (exists) {
        return prev.filter(item => item.path !== path);
      } else {
        return [...prev, { path, node }];
      }
    });
  };

  const handleCopy = () => {
    const fileMap = generateFileMap(selectedItems);
    const fileContents = generateFileContents(selectedItems);
    const output = `${fileMap}\n\n${fileContents}`;
    navigator.clipboard.writeText(output);
    setCopiedOutput(output);
    alert("File contents copied to clipboard!");
  };

  return (
    <div className="mt-4 p-4 border rounded shadow bg-card">
      <h2 className="text-xl font-semibold mb-2">File Explorer</h2>
      <div className="flex">
        <div className="w-1/2 border-r pr-2">
          <TreeNodeComponent 
            node={fileTree} 
            currentPath="" 
            selectedItems={selectedItems} 
            onToggleSelect={onToggleSelect} 
          />
        </div>
        <div className="w-1/2 pl-2">
          <button 
            onClick={handleCopy} 
            className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
          >
            Copy File Contents
          </button>
          {copiedOutput && (
            <pre className="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap">
              {copiedOutput}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}