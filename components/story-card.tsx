'use client';
import {useEffect,useRef,useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';

export type StoryPreview={id:string;title:string;excerpt:string;category:string;country:string;author:string;sample?:boolean;language?:string};
type AudioManifest={version:number;clips:Record<string,string>};

export function StoryCard({story,index}:{story:StoryPreview;index:number}){
const [status,setStatus]=useState<'idle'|'speaking'|'paused'>('idle');
const [supported,setSupported]=useState(false);
const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
const [voiceId,setVoiceId]=useState('');
const [clip,setClip]=useState('');
const [audioError,setAudioError]=useState('');
const [playbackMode,setPlaybackMode]=useState<'browser'|'studio'>('browser');
const reduced=useReducedMotion();
const utterance=useRef<SpeechSynthesisUtterance|null>(null);
const audio=useRef<HTMLAudioElement|null>(null);
const basePath=typeof window!=='undefined' && window.location.pathname.startsWith('/newwave-africa')?'/newwave-africa':'';

useEffect(()=>{
 const ok='speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
 setSupported(ok);
 if(!ok)return;
 const update=()=>{const list=window.speechSynthesis.getVoices();setVoices(list);setVoiceId(old=>old||list.find(v=>v.lang.toLowerCase().startsWith('en'))?.voiceURI||'')};
 update();window.speechSynthesis.addEventListener?.('voiceschanged',update);
 return ()=>{window.speechSynthesis.removeEventListener?.('voiceschanged',update);if(utterance.current){window.speechSynthesis.cancel();utterance.current=null}};
},[]);
useEffect(()=>{
 if(!story.sample)return;
 const controller=new AbortController();
 fetch(basePath+'/narration/manifest.json',{signal:controller.signal,cache:'no-store'}).then(r=>{if(!r.ok)throw Error('No generated narration published');return r.json()}).then((v:AudioManifest)=>{
 const path=v?.clips?.[story.id];
 if(v.version===1 && typeof path==='string' && /^s[0-9]+\.mp3$/.test(path))setClip(basePath+'/narration/'+path);
 }).catch(()=>{});
 return ()=>controller.abort();
},[story.id,story.sample,basePath]);

function stop(){
 audio.current?.pause();
 if(audio.current)audio.current.currentTime=0;
 if(supported)window.speechSynthesis.cancel();
 utterance.current=null;
 setStatus('idle');
}
function playBrowser(){
 if(!supported){setAudioError('No browser narration available.');return;}
 const u=new SpeechSynthesisUtterance(story.title+'. '+story.excerpt);
 const selected=voices.find(v=>v.voiceURI===voiceId);
 if(selected){u.voice=selected;u.lang=selected.lang}else{u.lang='en-US'}
 u.rate=.95;
 u.onend=()=>{utterance.current=null;setStatus('idle')};
 u.onerror=()=>{utterance.current=null;setStatus('idle');setAudioError('Browser narration failed.')};
 utterance.current=u;setPlaybackMode('browser');
 window.speechSynthesis.speak(u);setStatus('speaking');
}
function play(){
 setAudioError('');
 if(status==='speaking'){
  if(playbackMode==='studio')audio.current?.pause();else window.speechSynthesis.pause();
  setStatus('paused');return;
 }
 if(status==='paused'){
  if(playbackMode==='studio')void audio.current?.play().catch(()=>{setAudioError('Narration playback failed.');setStatus('idle')});
  else window.speechSynthesis.resume();
  setStatus('speaking');return;
 }
 stop();
 if(clip && audio.current){
  setPlaybackMode('studio');
  void audio.current.play().then(()=>setStatus('speaking')).catch(()=>{setClip('');playBrowser()});
 }else playBrowser();
}
return <motion.article initial={reduced?false:{opacity:0,y:18}} whileInView={reduced?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.4,delay:Math.min(index,4)*.045}} className="story">
 <div className="story-index"><span>STORY {String(index+1).padStart(2,'0')} / NEW WAVE</span><span>{story.country}</span></div>
 <div className="story-art" aria-hidden="true"><span>{String(index+1).padStart(2,'0')}</span><i/><b className="art-label">THE NEW WAVE / STORIES</b></div>
 <span className="category">{story.category}</span><h3>{story.title}</h3><p>{story.excerpt}</p>
 <div className="story-audio" role="group" aria-label={'Listen to '+story.title}>
 {clip&&<audio ref={audio} src={clip} preload="none" onEnded={()=>setStatus('idle')} onError={()=>{setClip('');setAudioError('Recorded narration unavailable; using browser voice if supported.');if(playbackMode==='studio'&&status==='speaking')playBrowser()}} aria-label={'Generated narration for '+story.title}/>}
 <button type="button" disabled={!supported&&!clip} onClick={play} aria-label={status==='speaking'?'Pause narration':status==='paused'?'Resume narration':'Listen to story'}>{status==='speaking'?'Pause':status==='paused'?'Resume':'Listen'} <span aria-hidden="true">{status==='speaking'?'Ⅱ':'▶'}</span></button>
 {status!=='idle'&&<button type="button" onClick={stop} aria-label="Stop narration">Stop ■</button>}
 {supported&&!clip&&<label className="voice-select-label">Voice <select aria-label={'Narration voice for '+story.title} value={voiceId} onChange={e=>{stop();setVoiceId(e.target.value)}}><option value="">System default (English requested)</option>{voices.map(v=><option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}</select></label>}
 <span className="voice-caption">{clip?'Pre-generated Deepgram narration for fictional sample; browser fallback when unavailable.':supported?'Choose an installed voice; language and accent depend on your device':'Voice unavailable in this browser'}</span>
 {audioError&&<span role="status" className="voice-caption">{audioError}</span>}
 </div><div className="story-bottom"><span>By {story.author}{story.language?' · '+story.language:''}</span>{story.sample&&<span className="sample">Fictional sample</span>}</div>
 </motion.article>
}
