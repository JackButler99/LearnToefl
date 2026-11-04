import type {Metadata} from "next";
import {DemoApp} from "@/components/demo/demo-app";
import type {DemoRole,DemoView} from "@/lib/demo-data";
export const metadata:Metadata={title:"Interactive product demo — ITP Practice Lab",description:"Explore learner, instructor, and admin experiences in an interactive portfolio demo. No sign-in required."};
export default async function DemoPage({searchParams}:{searchParams:Promise<{role?:string;view?:string}>}){
 const params=await searchParams;
 const role:DemoRole=params.role==="admin"||params.role==="instructor"?params.role:"student";
 const view:DemoView=["overview","catalog","bank","classes","analytics","experiments"].includes(params.view??"")?params.view as DemoView:"overview";
 return <DemoApp initialRole={role} initialView={view}/>;
}
