"use client";
import {useDemoLocale} from "./demo-locale";
import type {ReactNode} from "react";
import type {DemoSection} from "@/lib/demo-data";
export function Heading({eyebrow,title,children}:{eyebrow:string;title:string;children?:ReactNode}){
 const {t}=useDemoLocale();
 return <div className="demo-heading"><span className="eyebrow">{t(eyebrow)}</span><h1>{t(title)}</h1>{children&&<p>{children}</p>}</div>;
}
export function DemoPanel({title,caption,children,action}:{title:string;caption?:string;children:ReactNode;action?:ReactNode}){
 const {t}=useDemoLocale();
 return <section className="demo-panel"><div className="demo-panel-head"><div><h2>{t(title)}</h2>{caption&&<p>{t(caption)}</p>}</div>{action}</div>{children}</section>;
}
export function Metrics({items}:{items:{label:string;value:string|number;note:string}[]}){
 const {t}=useDemoLocale();
 return <div className="demo-metrics">{items.map((item,index)=><article key={t(item.label)}><div><small>{t(item.label)}</small><span className="studio-metric-glyph" aria-hidden="true">{["↗","◉","✦","⌁"][index%4]}</span></div><strong>{typeof item.value==="string"?t(item.value):item.value}</strong><span>{t(item.note)}</span><svg className="studio-metric-spark" viewBox="0 0 120 24" aria-hidden="true"><path d={index%2?"M1 20 19 16 34 18 49 8 64 12 80 6 95 9 119 2":"M1 21 18 19 31 12 46 17 61 10 78 13 94 4 119 1"}/></svg></article>)}</div>;
}
export function SectionArtwork({section,compact=false}:{section:DemoSection|"mixed";compact?:boolean}){
 const {t}=useDemoLocale();
 return <div className={`studio-section-art ${section} ${compact?"compact":""}`} aria-hidden="true"><div className="studio-art-grid"/>{section==="listening"?<><div className="studio-art-disc">♫</div><div className="studio-art-wave">{[18,30,48,34,65,44,80,52,28,58,40,22,48,65,33].map((height,index)=><i style={{height:height+"%"}} key={index}/>)}</div><span className="studio-art-caption">{t("HEAR THE DIFFERENCE")}</span></>:section==="structure"?<><span className="studio-art-bracket">[</span><div className="studio-art-type"><span>Aa</span><i/><i/><i/></div><span className="studio-art-bracket right">]</span><span className="studio-art-caption">{t("FIND THE PATTERN")}</span></>:section==="reading"?<><div className="studio-art-book"><svg viewBox="0 0 180 130"><path d="M20 24c28-9 48-7 70 7 23-14 45-16 70-7v89c-28-8-48-5-70 8-23-13-45-16-70-8Z"/><path d="M90 31v90M35 43c15-3 28-2 40 5M35 58c15-3 28-2 40 5M35 73c15-3 28-2 40 5M105 48c12-7 25-8 40-5M105 63c12-7 25-8 40-5M105 78c12-7 25-8 40-5"/></svg></div><span className="studio-art-caption">{t("READ BETWEEN THE LINES")}</span></>:<><div className="studio-art-orbits"><i/><i/><i/><span>✦</span></div><span className="studio-art-caption">{t("CONNECT IT ALL")}</span></>}</div>;
}
