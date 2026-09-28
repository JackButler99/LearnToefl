export type Speaker = "man" | "woman" | "speaker";
export type SpeechLine = { speaker: Speaker; text: string };

const label = /(?:^|\s)(Man|Woman|Speaker):\s*/gi;
const maleName = /\b(male|alex|aaron|daniel|david|fred|george|guy|james|mark|matthew|paul|rishi|tom)\b/i;
const femaleName = /\b(female|amy|aria|emma|eva|hazel|jenny|joanna|karen|kendra|kimberly|moira|olivia|salli|samantha|susan|tessa|victoria|zira)\b/i;

export function splitSpeechLines(script: string): SpeechLine[] {
  const labels = [...script.matchAll(label)];
  if (!labels.length) return [{ speaker: "speaker", text: script.trim() }];

  const lines: SpeechLine[] = [];
  const opening = script.slice(0, labels[0].index).trim();
  if (opening) lines.push({ speaker: "speaker", text: opening });

  labels.forEach((match, index) => {
    const text = script.slice(match.index! + match[0].length, labels[index + 1]?.index ?? script.length).trim();
    if (text) lines.push({ speaker: match[1].toLowerCase() as Speaker, text });
  });
  return lines;
}

export function selectSpeechVoices(voices: SpeechSynthesisVoice[]) {
  const english = voices.filter(voice => /^en(?:[-_]|$)/i.test(voice.lang))
    .sort((a, b) => Number(/^en[-_]US$/i.test(b.lang)) - Number(/^en[-_]US$/i.test(a.lang)));
  const namedMan = english.find(voice => maleName.test(voice.name));
  const namedWoman = english.find(voice => femaleName.test(voice.name));
  const speaker = english.find(voice => voice.default) ?? english[0];
  return { man: namedMan ?? speaker, woman: namedWoman ?? speaker, speaker };
}

export function availableVoices(synthesis: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const current = synthesis.getVoices();
  if (current.length) return Promise.resolve(current);

  // Some browsers populate the voice list after the first request.
  return new Promise(resolve => {
    const timeout = window.setTimeout(() => {
      cleanup();
      resolve(synthesis.getVoices());
    }, 1000);
    const changed = () => {
      const voices = synthesis.getVoices();
      if (voices.length) { cleanup(); resolve(voices); }
    };
    function cleanup() {
      window.clearTimeout(timeout);
      synthesis.removeEventListener("voiceschanged", changed);
    }
    synthesis.addEventListener("voiceschanged", changed);
    changed();
  });
}
