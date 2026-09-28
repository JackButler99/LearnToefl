import { ExamClient } from "@/components/exam-client";
export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  return <ExamClient id={(await params).id} />;
}
