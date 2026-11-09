/** Verified against ElevenLabs v4 documentation, 2026-11-10. */
export const ELEVENLABS_LANGUAGES = [
  {code:'en',name:'English'}, {code:'af',name:'Afrikaans'}, {code:'zu',name:'isiZulu'},
  {code:'am',name:'Amharic'}, {code:'sw',name:'Swahili'}, {code:'ha',name:'Hausa'},
  {code:'ar',name:'Arabic'}, {code:'fr',name:'French'}, {code:'pt',name:'Portuguese'},
  {code:'so',name:'Somali'}, {code:'ln',name:'Lingala'}, {code:'sn',name:'Shona'},
  {code:'wo',name:'Wolof'}, {code:'lg',name:'Luganda'}, {code:'ff',name:'Fula (Pulaar)'},
  {code:'kam',name:'Kamba'},
] as const;
export const ELEVENLABS_VOICES = [
  {id:'EXAVITQu4vr4xnSDxMaL',name:'Sarah'}, {id:'JBFqnCBsd6RMkjVDRZzb',name:'George'},
  {id:'FGY2WhTYpPnrIDTdsKH5',name:'Laura'}, {id:'IKne3meq5aSn9XLyUdCD',name:'Charlie'},
  {id:'Xb7hH8MSUJpSbSDYk0k2',name:'Alice'},
] as const;
export const ELEVENLABS_MAX_TEXT=5000;
/** Fixed synthetic previews; these do not send a creator's story or make paid requests. */
export const ELEVENLABS_SAMPLES:Readonly<Record<string,{voice:string;file:string;text:string}>>={
  am:{voice:'Sarah',file:'am.mp3',text:'ሰላም፣ ወደ ኒውዌቭ አፍሪካ እንኳን በደህና መጡ።'},
  sw:{voice:'George',file:'sw.mp3',text:'Habari! Karibu NewWave Africa. Asanteni kwa kuwa nasi.'},
  ha:{voice:'Laura',file:'ha.mp3',text:'Sannu! Barka da zuwa NewWave Africa. Mun gode da kasancewa tare da mu.'},
  af:{voice:'Charlie',file:'af.mp3',text:'Hallo! Welkom by NewWave Africa. Dankie dat julle hier is.'},
  zu:{voice:'Alice',file:'zu.mp3',text:'Sanibonani! Siyakwamukela ku-NewWave Africa. Siyabonga ngokuba nathi.'},
  fr:{voice:'Sarah',file:'fr.mp3',text:'Bonjour et bienvenue sur NewWave Africa. Chaque histoire compte.'},
  ar:{voice:'George',file:'ar.mp3',text:'مرحباً بكم في نيو ويف أفريقيا. لكل قصة قيمة.'},
  pt:{voice:'Laura',file:'pt.mp3',text:'Olá e bem-vindos à NewWave Africa. Cada história tem valor.'},
  so:{voice:'Charlie',file:'so.mp3',text:'Ku soo dhowaada NewWave Africa. Sheeko kasta waa muhiim.'},
  ln:{voice:'Alice',file:'ln.mp3',text:'Boyei bolamu na NewWave Africa. Lisolo nyonso ezali na ntina.'},
  sn:{voice:'Sarah',file:'sn.mp3',text:'Mauya kuNewWave Africa. Nyaya yega yega yakakosha.'},
};

export function elevenLabsBrief(language:string,voiceId:string,title:string,text:string){
  const lang=ELEVENLABS_LANGUAGES.find(item=>item.code===language),voice=ELEVENLABS_VOICES.find(item=>item.id===voiceId);
  if(!lang||!voice)throw new Error('Choose a listed language and voice.');
  if(!text.trim())throw new Error('Write your story first.');
  return ['NewWave Africa — multilingual narration brief',title.trim()||'Untitled story','',
    `Language: ${lang.name}`,`Voice: ${voice.name}`,`Provider: ElevenLabs`,`Model: eleven_v4`,'',
    'The story must already be written in the chosen language. This brief is not generated audio. Check language, pacing and pronunciation before sharing.','','Story text',text].join('\n');
}
