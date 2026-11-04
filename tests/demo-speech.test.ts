import test from "node:test";
import assert from "node:assert/strict";
import {setTimeout as delay} from "node:timers/promises";
import {BrowserDialogue,dialogueDefaults,splitSpeechLines,englishVoices,type DialogueState} from "../src/lib/demo-speech";
const voice=(name:string,lang="en-US")=>({name,lang,voiceURI:name,default:false,localService:true} as SpeechSynthesisVoice);
const woman=voice("Microsoft Zira"),man=voice("Microsoft David");
function fixture(){
 const spoken:SpeechSynthesisUtterance[]=[],states:DialogueState[]=[];
 const engine={speak(utterance:SpeechSynthesisUtterance){spoken.push(utterance);},cancel(){},pause(){},resume(){}};
 const controller=new BrowserDialogue(engine,text=>({text} as SpeechSynthesisUtterance),state=>states.push(state),0);
 return {controller,spoken,states};
}
test("dialogue labels are parsed and never passed to the speech utterance",async()=>{
 const {controller,spoken,states}=fixture();controller.play("Woman: Did you finish the lab report?\nMan: Almost. I still need to check the last calculation.",{woman,man});
 assert.equal(spoken.length,1);assert.equal(spoken[0].text,"Did you finish the lab report?");assert.equal(spoken[0].voice,woman);assert.equal(spoken[0].pitch,1);
 spoken[0].onend?.({} as SpeechSynthesisEvent);await delay(5);
 assert.equal(spoken.length,2);assert.equal(spoken[1].text,"Almost. I still need to check the last calculation.");assert.equal(spoken[1].voice,man);
 assert.ok(spoken.every(utterance=>!/^(Man|Woman|Speaker):/.test(utterance.text)));
 spoken[1].onend?.({} as SpeechSynthesisEvent);await delay(5);assert.equal(states.at(-1)?.status,"finished");controller.stop(false);
});
test("voice choice prefers recognized names and distinct English voices without claiming gender metadata",()=>{
 const result=dialogueDefaults([voice("Indonesian Voice","id-ID"),man,woman]);assert.equal(result.woman,woman.voiceURI);assert.equal(result.man,man.voiceURI);assert.equal(result.confidence,"named");
 const fallback=dialogueDefaults([voice("English A"),voice("English B")]);assert.notEqual(fallback.woman,fallback.man);assert.equal(fallback.confidence,"distinct");
 assert.equal(dialogueDefaults([woman]).confidence,"single");assert.equal(dialogueDefaults([]).confidence,"none");assert.equal(englishVoices([woman,voice("French","fr-FR")]).length,1);
});
test("stopping a dialogue invalidates late callbacks so a previous question cannot restart speech",async()=>{
 const {controller,spoken,states}=fixture();controller.play("Man: First question. Woman: Old reply.",{woman,man});const stale=spoken[0];
 controller.stop();controller.play("Woman: New question.",{woman,man});stale.onend?.({} as SpeechSynthesisEvent);await delay(5);
 assert.equal(spoken.length,2);assert.equal(spoken[1].text,"New question.");assert.notEqual(states.at(-1)?.status,"finished");controller.stop(false);
});
test("pause between turns waits for resume, and an engine error does not advance the queue",async()=>{
 const {controller,spoken,states}=fixture();controller.play("Woman: First turn. Man: Second turn.",{woman,man});controller.pause();spoken[0].onend?.({} as SpeechSynthesisEvent);await delay(5);assert.equal(spoken.length,1);
 controller.resume();assert.equal(spoken.length,2);assert.equal(spoken[1].voice,man);spoken[1].onerror?.({} as SpeechSynthesisErrorEvent);spoken[1].onend?.({} as SpeechSynthesisEvent);await delay(5);assert.equal(states.at(-1)?.status,"error");assert.equal(spoken.length,2);controller.stop(false);
});
test("unlabelled narration is retained and blank turns are omitted",()=>{
 assert.deepEqual(splitSpeechLines("Listen carefully. Woman: Hello. Man: Welcome."),[{speaker:"speaker",text:"Listen carefully."},{speaker:"woman",text:"Hello."},{speaker:"man",text:"Welcome."}]);
 assert.equal(splitSpeechLines("Man: Woman: Hello.").length,1);
});
