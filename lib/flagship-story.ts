import type {Story} from './discovery';

/** Original fictional editorial sample. No real person, interview, language or testimony is represented. */
export const FLAGSHIP_STORY_ID = 's3';

export type FlagshipStory = Readonly<{
  deck: string;
  paragraphs: readonly string[];
  editorialNote: string;
}>;

const flagshipStory: FlagshipStory = {
  deck: "When Lindiwe asks to record her grandmother's memories, she learns that preserving a story begins with listening — and with knowing which parts not to share.",
  paragraphs: [
  "Every Sunday, the peach tree made a moving patch of shade across Gogo Nomsa's front step. Lindiwe knew where to sit: close enough to hear the soft parts, far enough from the kettle to avoid being sent back inside. The same stories came around often, but never in quite the same words.",
  "Her favourite was the one about a missed bus. At seventeen, Nomsa had set out for an interview with a borrowed pair of shoes and a folded paper address. Rain delayed the buses. By the time she got home, she had missed the chance. Her mother did not ask about the interview; she asked whether her daughter had eaten.",
  "At first Lindiwe thought it was a story about bad luck. Then Nomsa always added a new detail: a woman who shared half a bread roll at the stop, a driver who promised to return, the seamstress who later offered her a different kind of work. The ending kept changing because Nomsa was never trying to teach a single lesson.",
  "When Lindiwe accepted a job in another city, she worried that the little afternoons would vanish into phone calls and holidays. She set her mobile on the table and reached for the record button. Nomsa caught her hand before it touched the screen. 'Ask me first,' she said. 'And ask what I want you to keep.'",
  "They made rules together. Nomsa could stop at any time. Names belonging to other people would stay out unless those people agreed. Nothing would be posted where strangers could hear it just because a recording existed. They tried again the following Sunday, this time with Nomsa telling Lindiwe when to begin.",
  "The first file was imperfect. A chair scraped. The kettle whistled. Halfway through, Nomsa forgot the address on the folded paper and laughed at herself. Lindiwe offered to start over, but Nomsa shook her head. 'Leave the laugh. That part is mine.'",
  "That evening Lindiwe typed what she had heard. She made every sentence tidy, removed the pauses and changed a familiar phrase into something grander. When she read it back, Nomsa frowned. 'I didn't say I was brave. I said I was frightened and I went anyway.' They revised the page together, leaving a little space for uncertainty.",
  "On the third recording, Nomsa told a story Lindiwe had never heard. At the end, she asked her granddaughter to switch off the phone. Some memories, she explained, were for the people who were sitting there. Lindiwe did not argue. She deleted that take while her grandmother watched, and they returned to the tea growing cold between them.",
  "Before Lindiwe left, Nomsa chose one short passage to share with the family. They wrote the title and her name at the top, added the date, and kept the unedited recording safely on Lindiwe's phone. The rest would wait until another Sunday, another telling, or perhaps never. A story was not a thing to collect. It was a relationship to look after."
],
  editorialNote: 'An original fictional demonstration story set in South Africa. The characters and events are invented; this is not a verified interview or a published creator submission.'
};

/** Protects browser-local drafts from acquiring a fictional story body by ID collision. */
export function getFlagshipStory(story: Pick<Story,'id'|'sample'>): FlagshipStory | null {
  return story.sample===true && story.id===FLAGSHIP_STORY_ID ? flagshipStory : null;
}

/** Reading estimate is a guide for prose only, not an audio-duration claim. */
export function estimatedReadingMinutes(paragraphs: readonly string[]): number {
  const words=paragraphs.join(' ').trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1,Math.ceil(words/200));
}
