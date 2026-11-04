"use client";
import { useEffect,useId,useRef,type ReactNode } from "react";
export function UiDialog({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean}){
  const ref=useRef<HTMLDialogElement>(null),heading=useId();
  useEffect(()=>{const dialog=ref.current;const previous=document.activeElement as HTMLElement|null;dialog?.showModal();return()=>{dialog?.close();previous?.focus();};},[]);
  return <dialog ref={ref} aria-labelledby={heading} className={`ui-dialog ${wide?"wide":""}`} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="dialog-surface"><header className="dialog-heading"><h2 id={heading}>{title}</h2><button type="button" className="icon-button" aria-label="Tutup dialog" onClick={onClose}>×</button></header>{children}</div></dialog>;
}
export function ConfirmDialog({title,description,confirmLabel,onConfirm,onClose,danger=false,busy=false}:{title:string;description:string;confirmLabel:string;onConfirm:()=>void;onClose:()=>void;danger?:boolean;busy?:boolean}){
  return <UiDialog title={title} onClose={()=>{if(!busy)onClose();}}><p className="dialog-description">{description}</p><div className="dialog-actions"><button type="button" className="button ghost" disabled={busy} onClick={onClose}>Kembali</button><button type="button" className={`button ${danger?"danger":"primary"}`} disabled={busy} onClick={onConfirm}>{busy?"Memproses…":confirmLabel}</button></div></UiDialog>;
}
