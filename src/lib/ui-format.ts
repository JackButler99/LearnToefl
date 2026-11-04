export const STATE_LABELS:Record<string,string>={draft:"Draft",review:"Menunggu review",published:"Terbit",retired:"Ditarik",archived:"Diarsipkan",public:"Publik",private:"Privat"};
export function durationLabel(seconds:number){
  if(seconds===0)return "Tanpa timer";
  if(seconds<60)return `${seconds} detik`;
  const minutes=Math.floor(seconds/60),rest=seconds%60;
  return rest?`${minutes} menit ${rest} detik`:`${minutes} menit`;
}
export function minutesToSeconds(value:string){const n=Number(value);if(!value.trim()||!Number.isFinite(n)||n<0||n>240)throw Error("Durasi harus antara 0 dan 240 menit.");const seconds=Math.round(n*60);if(Math.abs(seconds-n*60)>.00001)throw Error("Durasi harus berupa jumlah detik utuh.");return seconds;}
export function safeSlug(value:string){let slug=value.trim().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");if(!/^[a-z]/.test(slug))slug="latihan-"+slug;return slug.slice(0,40).replace(/-$/g,"");}
