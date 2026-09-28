import { ResultClient } from "@/components/result-client";
export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  return <ResultClient id={(await params).id} />;
}
