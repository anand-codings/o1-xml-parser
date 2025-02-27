"use server";

import { Suspense } from "react";
import { ApplyChangesForm } from "./components/ApplyChangesForm";

export default async function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplyChangesForm />
    </Suspense>
  );
}