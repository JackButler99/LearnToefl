import * as React from "react";
import { parseReadingPassage, referencesPassageLocation } from "@/lib/reading-passage";

export function ReadingPassage({text,prompt="",headingLevel=2}:{text:string;prompt?:string;headingLevel?:2|3}) {
  const passage=parseReadingPassage(text,referencesPassageLocation(prompt));
  if(!passage.paragraphs.length)return null;
  const Heading=headingLevel===3?"h3":"h2";
  return <section className="reading-passage" lang="en" aria-label={passage.title?`Reading passage: ${passage.title}`:"Reading passage"}>
    <header className="reading-passage-heading"><span>Reading passage</span>{passage.title&&<Heading className="reading-passage-title">{passage.title}</Heading>}</header>
    <div className="reading-passage-body">{passage.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div>
    {passage.source&&<footer className="reading-passage-source"><span>Source note</span><p>{passage.source}</p></footer>}
  </section>;
}
