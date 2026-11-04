import { AssessmentClient } from "@/components/assessment-client";
export default async function Assessment({params}:{params:Promise<{id:string}>}){return <AssessmentClient id={(await params).id}/>;}
