"use client";
// <ai_context> OperationBadge component extracted for displaying file operation badges</ai_context>
import React from "react";

interface OperationBadgeProps {
  operation: string;
}

const OperationBadge: React.FC<OperationBadgeProps> = ({ operation }) => {
  const colors: Record<string, string> = {
    CREATE: "bg-green-500 text-white",
    UPDATE: "bg-blue-500 text-white",
    DELETE: "bg-red-500 text-white",
    MOVE: "bg-yellow-500 text-black",
    DELETE_EMPTY_FOLDER: "bg-orange-500 text-white",
    DEFAULT: "bg-gray-500 text-white"
  };

  const op = operation.toUpperCase();
  const badgeClass = colors[op] || colors.DEFAULT;

  return (
    <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${badgeClass}`}>
      {op}
    </span>
  );
};

export default OperationBadge;