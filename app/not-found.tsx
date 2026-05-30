import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      icon="SearchX"
      title="This listing walked off campus"
      body="The page you are looking for does not exist or has been removed."
      action={<Link href="/" className="rounded-full bg-ocean px-5 py-3 text-sm font-semibold text-white">Back to marketplace</Link>}
    />
  );
}
