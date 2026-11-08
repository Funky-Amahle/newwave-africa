// Verified against https://developers.deepgram.com/docs/flux-tts/voices on 2026-11-08.
export const CREATOR_VOICES = [
  {id:'flux-hannah-en',name:'Hannah',accent:'American',presentation:'feminine'},
  {id:'flux-kit-en',name:'Kit',accent:'British',presentation:'masculine'},
  {id:'flux-alexis-en',name:'Alexis',accent:'American',presentation:'feminine'},
  {id:'flux-cliff-en',name:'Cliff',accent:'American',presentation:'masculine'},
  {id:'flux-sienna-en',name:'Sienna',accent:'American',presentation:'feminine'},
  {id:'flux-cole-en',name:'Cole',accent:'American',presentation:'masculine'},
  {id:'flux-colin-en',name:'Colin',accent:'British',presentation:'masculine'},
  {id:'flux-gemma-en',name:'Gemma',accent:'British',presentation:'feminine'},
  {id:'flux-haley-en',name:'Haley',accent:'American',presentation:'feminine'},
  {id:'flux-heather-en',name:'Heather',accent:'American',presentation:'feminine'},
  {id:'flux-miles-en',name:'Miles',accent:'American',presentation:'masculine'},
  {id:'flux-sean-en',name:'Sean',accent:'British',presentation:'masculine'},
  {id:'flux-bree-en',name:'Bree',accent:'American',presentation:'feminine'},
  {id:'flux-brittany-en',name:'Brittany',accent:'American',presentation:'feminine'},
  {id:'flux-brooke-en',name:'Brooke',accent:'American',presentation:'feminine'},
  {id:'flux-bruce-en',name:'Bruce',accent:'American',presentation:'masculine'},
  {id:'flux-conor-en',name:'Conor',accent:'British',presentation:'masculine'},
  {id:'flux-donovan-en',name:'Donovan',accent:'American',presentation:'masculine'},
  {id:'flux-drew-en',name:'Drew',accent:'American',presentation:'masculine'},
  {id:'flux-elise-en',name:'Elise',accent:'American',presentation:'feminine'},
  {id:'flux-jack-en',name:'Jack',accent:'British',presentation:'masculine'},
  {id:'flux-kai-en',name:'Kai',accent:'Singaporean',presentation:'masculine'},
  {id:'flux-kelsey-en',name:'Kelsey',accent:'American',presentation:'feminine'},
  {id:'flux-maeve-en',name:'Maeve',accent:'Irish',presentation:'feminine'},
  {id:'flux-marcelo-en',name:'Marcelo',accent:'Filipino',presentation:'masculine'},
  {id:'flux-marcus-en',name:'Marcus',accent:'American',presentation:'masculine'},
  {id:'flux-meena-en',name:'Meena',accent:'Indian',presentation:'feminine'},
  {id:'flux-meghan-en',name:'Meghan',accent:'American',presentation:'feminine'},
  {id:'flux-naveen-en',name:'Naveen',accent:'Indian',presentation:'masculine'},
  {id:'flux-paige-en',name:'Paige',accent:'American',presentation:'feminine'},
  {id:'flux-priya-en',name:'Priya',accent:'Indian',presentation:'feminine'},
  {id:'flux-rufus-en',name:'Rufus',accent:'British',presentation:'masculine'},
  {id:'flux-sharon-en',name:'Sharon',accent:'Australian',presentation:'feminine'},
  {id:'flux-tanner-en',name:'Tanner',accent:'British',presentation:'masculine'},
  {id:'flux-wade-en',name:'Wade',accent:'American',presentation:'masculine'},
  {id:'flux-wes-en',name:'Wes',accent:'American',presentation:'masculine'},
] as const;
export const DEFAULT_CREATOR_VOICE = 'flux-haley-en';
export function narrationBrief(model:string,title:string,content:string){
  const voice=CREATOR_VOICES.find(item=>item.id===model);
  if(!voice)throw new Error('Choose a listed Deepgram voice.');
  if(!content.trim())throw new Error('Write your story before downloading a narration brief.');
  return ['NewWave Africa — narration brief',title.trim()||'Untitled story','',`Voice: ${voice.name} — ${voice.accent} ${voice.presentation}`,`Model: ${voice.id}`,'Language: English','Provider: Deepgram Flux TTS','Endpoint: /v2/speak','','This is a production brief, not generated audio. Review pronunciation and pacing before sharing a recording.','','Story text',content].join('\n');
}
