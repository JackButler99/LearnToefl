import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { parseReadingPassage,referencesPassageLocation } from "../src/lib/reading-passage";

const napoleon = "Napoleon Bonaparte\n\nNapoleon Bonaparte (15 August 1769 – 5 May 1821) was a French military and political leader who rose to prominence during the French Revolution and led several successful campaigns during the Revolutionary Wars. Napoleon dominated European and global affairs for more than a decade while leading France against a series of coalitions in the Napoleonic Wars. He won most of these wars and the vast majority of his battles, building a large empire that ruled over continental Europe before its final collapse in 1815. Napoleon Bonaparte was born in Corsica to a relatively modest family from the minor nobility. When the Revolution broke out in 1789, he was serving as an artillery officer in the French army. He attempted to capitalize quickly on the new political situation by returning to Corsica in hopes of starting a political career. After that venture failed, he came back to the military and rose rapidly through the ranks, ending up as commander of the Army of Italy after saving the governing Directory by suppressing a revolt from royalist insurgents. At age 26, he began his first military campaign against the Austrians and their Italian allies, scoring a series of decisive victories, conquering the Italian Peninsula in a year, and becoming a national hero. In 1798, he led a military expedition to Egypt that served as a springboard to political power. He engineered a coup in November 1799 and became First Consul of the Republic. His rising ambition inspired him to go further, and in 1804 he became the first Emperor of the French. Intractable differences with the British meant that the French were facing a Third Coalition by 1805. Napoleon shattered this coalition with decisive victories in the Ulm Campaign and a historic triumph over Russia and Austria at the Battle of Austerlitz, which led to the elimination of the thousand year-old Holy Roman Empire. In 1806, the Fourth Coalition took up arms against him because Prussia became worried about growing French influence on the continent. Napoleon quickly knocked out Prussia at the battles of Jena and Auerstedt, then marched the Grand Army deep into Eastern Europe and annihilated the Russians in June 1807 at the Battle of Friedland. France then forced the defeated nations of the Fourth Coalition to sign the Treaties of Tilsit in July 1807, bringing an uneasy peace to the continent. Passage adapted from Wikipedia";
const normalize=(s:string)=>s.replace(/\s+/g," ").trim();

test("reviewed Napoleon gets four topic paragraphs with every source token preserved",()=>{
 const result=parseReadingPassage(napoleon);
 assert.equal(result.title,"Napoleon Bonaparte");assert.equal(result.source,"Passage adapted from Wikipedia");
 assert.equal(result.paragraphs.length,4);assert.equal(result.reviewedLayout,true);
 assert.match(result.paragraphs[1],/^Napoleon Bonaparte was born in Corsica/);
 assert.match(result.paragraphs[2],/^In 1798/);assert.match(result.paragraphs[3],/^Intractable differences/);
 assert.equal(normalize([result.title,...result.paragraphs,result.source].join(" ")),normalize(napoleon));
});
test("a changed or unknown passage gets no inferred sentence-count paragraph breaks",()=>{
 const changed=parseReadingPassage(napoleon.replace("modest family","small family"));
 assert.equal(changed.reviewedLayout,false);assert.equal(changed.paragraphs.length,1);
 const unknown=parseReadingPassage("A new subject\n\nOne idea. Another sentence. A third. A fourth. A fifth. A sixth.");
 assert.equal(unknown.paragraphs.length,1);assert.equal(unknown.reviewedLayout,false);
});
test("existing paragraphs and single newlines inside them are preserved",()=>{
 const result=parseReadingPassage("A short title\r\n\r\nFirst paragraph.\r\nA continued line.\r\n\r\nSecond paragraph.");
 assert.equal(result.title,"A short title");assert.deepEqual(result.paragraphs,["First paragraph.\nA continued line.","Second paragraph."]);
 assert.equal(result.reviewedLayout,false);
 const original=parseReadingPassage(napoleon),withBreaks=[original.title,original.paragraphs.slice(0,2).join(" "),original.paragraphs.slice(2).join(" "),original.source].join("\n\n");
 assert.equal(parseReadingPassage(withBreaks).paragraphs.length,2);
});
test("only an explicit terminal citation is separated; ordinary sentences remain text",()=>{
 const result=parseReadingPassage("A short title\n\nA complete sentence. Passage adapted from Wikipedia");
 assert.deepEqual(result.paragraphs,["A complete sentence."]);assert.equal(result.source,"Passage adapted from Wikipedia");
 const ordinary="The note says Passage adapted from Wikipedia";
 assert.equal(parseReadingPassage(ordinary).source,"");assert.deepEqual(parseReadingPassage(ordinary).paragraphs,[ordinary]);
 const onlyNote="Passage adapted from Wikipedia";assert.deepEqual(parseReadingPassage(onlyNote).paragraphs,[onlyNote]);
});
test("location-dependent questions retain the original structure",()=>{
 for(const prompt of ["What does paragraph 2 suggest?","Which paragraph mentions this?","The phrase in lines 3–5 refers to what?","What does the last line suggest?","Apa gagasan utama paragraf kedua?","Apa arti kata pada baris 3?"])assert.equal(referencesPassageLocation(prompt),true);
 assert.equal(referencesPassageLocation("What is the main idea?"),false);
 const result=parseReadingPassage(napoleon,true);assert.deepEqual(result.paragraphs,[napoleon]);assert.equal(result.title,"");assert.equal(result.source,"");
});
test("blank input is safe and a sentence-like first paragraph is not promoted to a title",()=>{
 assert.deepEqual(parseReadingPassage("  "),{title:"",paragraphs:[],source:"",reviewedLayout:false});
 const result=parseReadingPassage("This is a whole sentence.\n\nA different paragraph.");assert.equal(result.title,"");assert.equal(result.paragraphs.length,2);
});
test("component renders semantic English text and escapes HTML instead of executing source markup",()=>{
 // Render in a separate default React runtime: the main suite uses react-server for DB modules.
 const text='Example title\n\n<script>alert("x")</script> is literal text.\n\nPassage adapted from <img src=x onerror=alert(1)>';
 const script=`import {createElement} from 'react';import {renderToStaticMarkup} from 'react-dom/server';import * as module from './src/components/reading-passage.tsx';const {ReadingPassage}=module.default??module;console.log(JSON.stringify({html:renderToStaticMarkup(createElement(ReadingPassage,{text:${JSON.stringify(text)}})),empty:renderToStaticMarkup(createElement(ReadingPassage,{text:''}))}));`;
 const result=spawnSync(process.execPath,["--import=tsx","--input-type=module","-e",script],{encoding:"utf8"});
 assert.equal(result.status,0,result.stderr);const {html,empty}=JSON.parse(result.stdout);
 assert.match(html,/lang="en"/);assert.match(html,/<h2 class="reading-passage-title">Example title<\/h2>/);
 assert.ok(html.includes("&lt;script&gt;")&&html.includes("&lt;img"));assert.ok(!html.includes("<script>")&&!html.includes("<img src="));
 assert.equal(empty,"");
});
