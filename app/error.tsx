"use client";

import { EmptyState } from "@/components/shared/empty-state";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <EmptyState
      icon="RotateCcw"
      title="Something needs a refresh"
      body="CollegeCart hit a temporary issue while loading this view."
      actionLabel="Try again"
      onAction={reset}
    />
  );
}
