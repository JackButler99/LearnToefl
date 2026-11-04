"use client";
import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from "react";
import {defaultDemoLocale,demoLocaleStorageKey,formatDemoNumber,isDemoLocale,translateDemo,type DemoLocale,type DemoValues} from "@/lib/demo-i18n";

type DemoLanguage = {
 locale:DemoLocale;
 setLocale:(locale:DemoLocale)=>void;
 t:(source:string,values?:DemoValues)=>string;
 number:(value:number,digits?:number)=>string;
};
const DemoLocaleContext=createContext<DemoLanguage|null>(null);
export function DemoLocaleProvider({children,initialLocale=defaultDemoLocale}:{children:ReactNode;initialLocale?:DemoLocale}){
 const [locale,updateLocale]=useState<DemoLocale>(initialLocale);
 useEffect(()=>{
  const previous=document.documentElement.lang;
  try{const saved=localStorage.getItem(demoLocaleStorageKey);if(isDemoLocale(saved))updateLocale(saved);}catch{/* Storage may be unavailable in private browsing. */}
  return ()=>{document.documentElement.lang=previous;};
 },[]);
 useEffect(()=>{document.documentElement.lang=locale;},[locale]);
 const value=useMemo<DemoLanguage>(()=>({locale,setLocale(next){if(!isDemoLocale(next))return;updateLocale(next);try{localStorage.setItem(demoLocaleStorageKey,next);}catch{/* Language switching still works without persistence. */}},t:(source,values)=>translateDemo(source,locale,values),number:(value,digits)=>formatDemoNumber(value,locale,digits)}),[locale]);
 return <DemoLocaleContext.Provider value={value}><div lang={locale} className="demo-locale-root">{children}</div></DemoLocaleContext.Provider>;
}
export function useDemoLocale(){const value=useContext(DemoLocaleContext);if(!value)throw new Error("Demo locale provider is missing");return value;}
export function DemoLanguageSelector(){
 const {locale,setLocale,t}=useDemoLocale();
 return <label className="demo-language"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/></svg><span>{t("Bahasa")}</span><select value={locale} onChange={event=>{if(isDemoLocale(event.target.value))setLocale(event.target.value);}} aria-label={t("Bahasa")}><option value="en" lang="en">English</option><option value="id" lang="id">Bahasa Indonesia</option></select></label>;
}
