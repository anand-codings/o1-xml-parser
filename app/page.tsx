"use server";

import { Suspense } from "react";
import { ApplyChangesForm } from "./components/ApplyChangesForm";
import dynamic from "next/dynamic";

const FileExplorerCard = dynamic(() => import('./components/FileExplorerCard'), { ssr: false });

export default async function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplyChangesForm />
      <FileExplorerCard />
    </Suspense>
  );
}