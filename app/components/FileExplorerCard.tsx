// <ai_context> FileExplorerCard component for displaying a file explorer UI </ai_context>
"use client";

import { useState } from "react";

interface TreeNode {
  name: string;
  type: "file" | "folder";
  children?: TreeNode[];
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

function TreeNodeComponent({ node }: { node: TreeNode }) {
  const [expanded, setExpanded] = useState(false);
  
  const hasChildren = node.type === "folder" && node.children && node.children.length > 0;
  
  return (
    <div className="ml-4">
      <div
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {node.type === "folder" ? (expanded ? "📂" : "📁") : "📄"} {node.name}
      </div>
      {expanded && hasChildren && (
        <div className="ml-4">
          {node.children!.map((child, index) => (
            <TreeNodeComponent key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorerCard() {
  return (
    <div className="mt-4 p-4 border rounded shadow bg-card">
      <h2 className="text-xl font-semibold mb-2">File Explorer</h2>
      <div>
        <TreeNodeComponent node={fileTree} />
      </div>
    </div>
  );
}