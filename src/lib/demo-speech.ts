import {splitSpeechLines} from "./listening-speech";
export {splitSpeechLines};
type VoiceInfo=Pick<SpeechSynthesisVoice,"voiceURI"|"name"|"lang"|"default">;
const female=/\b(female|zira|samantha|victoria|karen|moira|tessa|susan|hazel|aria|jenny|joanna|emma|ava|allison|serena|fiona)\b/i;
const male=/\b(male|david|mark|daniel|alex|aaron|fred|george|guy|james|matthew|paul|tom|rishi|ryan|andrew|brian)\b/i;
export function englishVoices<T extends VoiceInfo>(voices:T[]):T[]{return voices.filter(voice=>/^en(?:[-_]|$)/i.test(voice.lang)).sort((a,b)=>Number(/^en[-_]US$/i.test(b.lang))-Number(/^en[-_]US$/i.test(a.lang))||a.name.localeCompare(b.name));}
/** SpeechSynthesisVoice exposes no gender field. Recognize known names, then prefer distinct voices. */
export function dialogueDefaults(voices:VoiceInfo[]){
 const available=englishVoices(voices),knownWoman=available.find(voice=>female.test(voice.name)),knownMan=available.find(voice=>male.test(voice.name));
 const woman=knownWoman??available.find(voice=>voice.voiceURI!==knownMan?.voiceURI)??available[0];
 const man=knownMan??available.find(voice=>voice.voiceURI!==woman?.voiceURI)??available[0];
 return {woman:woman?.voiceURI??"",man:man?.voiceURI??"",confidence:!available.length?"none":woman?.voiceURI===man?.voiceURI?"single":knownWoman&&knownMan?"named":"distinct"};
}
export type DialogueState={status:"idle"|"playing"|"paused"|"finished"|"error";activeLine:number|null;error?:string};
type Engine=Pick<SpeechSynthesis,"speak"|"cancel"|"pause"|"resume">;
export class BrowserDialogue {
 private generation=0;
 private timer:ReturnType<typeof setTimeout>|undefined;
 private utterance:SpeechSynthesisUtterance|undefined;
 private state:DialogueState={status:"idle",activeLine:null};
 private pending:(()=>void)|undefined;
 constructor(private engine:Engine,private create:(text:string)=>SpeechSynthesisUtterance,private change:(state:DialogueState)=>void,private gapMs=260){}
 private emit(state:DialogueState){this.state=state;this.change(state);}
 play(script:string,voices:{woman:SpeechSynthesisVoice;man:SpeechSynthesisVoice},rate=.92){
  this.stop(false);const generation=this.generation,lines=splitSpeechLines(script);
  const next=(index:number)=>{
   if(generation!==this.generation)return;
   if(this.state.status==="paused"){this.pending=()=>next(index);return;}
   if(index>=lines.length){this.utterance=undefined;this.emit({status:"finished",activeLine:null});return;}
   const line=lines[index],utterance=this.create(line.text);this.utterance=utterance;
   const voice=voices[line.speaker==="man"?"man":"woman"];
   utterance.voice=voice;utterance.lang=voice.lang||"en-US";utterance.rate=rate;utterance.pitch=1;utterance.volume=1;
   let ended=false;
   utterance.onstart=()=>{if(generation===this.generation)this.emit({status:this.state.status==="paused"?"paused":"playing",activeLine:index});};
   utterance.onend=()=>{if(generation!==this.generation||ended)return;ended=true;this.timer=setTimeout(()=>next(index+1),this.gapMs);};
   utterance.onerror=()=>{if(generation!==this.generation)return;ended=true;this.generation++;if(this.timer)clearTimeout(this.timer);this.utterance=undefined;this.engine.cancel();this.emit({status:"error",activeLine:null,error:"Suara tidak dapat diputar. Coba suara lain di Pengaturan suara atau baca transkrip."});};
   this.emit({status:"playing",activeLine:index});this.engine.speak(utterance);
  };
  this.emit({status:"playing",activeLine:null});next(0);
 }
 pause(){if(this.state.status!=="playing")return;this.engine.pause();this.emit({...this.state,status:"paused"});}
 resume(){if(this.state.status!=="paused")return;this.engine.resume();this.emit({...this.state,status:"playing"});const pending=this.pending;this.pending=undefined;pending?.();}
 stop(notify=true){this.generation++;if(this.timer)clearTimeout(this.timer);this.timer=undefined;this.pending=undefined;this.utterance=undefined;this.state={status:"idle",activeLine:null};this.engine.cancel();if(notify)this.change(this.state);}
}
