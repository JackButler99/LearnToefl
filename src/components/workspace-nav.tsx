"use client";
import Link from "next/link";
import { useRef,useState } from "react";
import { WorkspaceIcon } from "./workspace-icon";
export type NavGroup={title:string;links:{href:string;label:string;key:string}[]};
export function WorkspaceNav({groups,active}:{groups:NavGroup[];active:string}){
  const [open,setOpen]=useState(false),toggle=useRef<HTMLButtonElement>(null);
  return <div className="workspace-navigation" data-open={open}><button ref={toggle} type="button" className="workspace-menu-toggle" aria-expanded={open} aria-controls="workspace-navigation" onClick={()=>setOpen(v=>!v)}><span>{open?"Tutup menu":"Menu navigasi"}</span><WorkspaceIcon name={open?"close":"menu"}/></button><nav id="workspace-navigation" aria-label="Navigasi workspace" onKeyDown={e=>{if(e.key==="Escape"){setOpen(false);toggle.current?.focus();}}}>{groups.map(group=><div className="nav-group" key={group.title}><p>{group.title}</p>{group.links.map(link=><Link key={link.key} href={link.href} aria-current={active===link.key?"page":undefined} className={active===link.key?"active":""} onClick={()=>setOpen(false)}><WorkspaceIcon name={link.key}/><span className="workspace-nav-label">{link.label}</span>{active===link.key&&<span className="nav-current" aria-hidden="true"/>}</Link>)}</div>)}</nav></div>;
}
