'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {claimNarration,loadNarrationClips,releaseNarration} from '../lib/narration';

export type StoryPreview={id:string;title:string;excerpt:string;category:string;country:string;author:string;sample?:boolean;language?:string};
type PlaybackStatus='idle'|'loading'|'speaking'|'paused';

export function StoryCard({story,index}:{story:StoryPreview;index:number}){
const [status,setStatus]=useState<PlaybackStatus>('idle');
const [supported,setSupported]=useState(false);
const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
const [voiceId,setVoiceId]=useState('');
const [clip,setClip]=useState('');
const [audioError,setAudioError]=useState('');
const playbackMode=useRef<'browser'|'studio'>('browser');
const statusRef=useRef<PlaybackStatus>('idle');
const mounted=useRef(false);
const sequence=useRef(0);
const owner=useRef({});
const reduced=useReducedMotion();
const utterance=useRef<SpeechSynthesisUtterance|null>(null);
const audio=useRef<HTMLAudioElement|null>(null);
const activePlayer=useRef<HTMLAudioElement|null>(null);
const basePath=typeof window!=='undefined' && window.location.pathname.startsWith('/newwave-africa')?'/newwave-africa':'';

const updateStatus=useCallback((next:PlaybackStatus)=>{statusRef.current=next;if(mounted.current)setStatus(next)},[]);
const stop=useCallback(()=>{
 sequence.current++;
 const player=activePlayer.current;
 activePlayer.current=null;
 player?.pause();
 if(player){try{player.currentTime=0}catch{/* A detached or unloaded element may not be seekable. */}}
 const speaking=utterance.current;
 utterance.current=null;
 if(speaking){speaking.onend=null;speaking.onerror=null;window.speechSynthesis.cancel()}
 releaseNarration(owner.current);
 updateStatus('idle');
},[updateStatus]);
useEffect(()=>{
 mounted.current=true;
 return ()=>{mounted.current=false;stop()};
},[stop]);
useEffect(()=>{
 const ok='speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
 setSupported(ok);
 if(!ok)return;
 const update=()=>{const list=window.speechSynthesis.getVoices();setVoices(list);setVoiceId(old=>old||list.find(v=>v.lang.toLowerCase().startsWith('en'))?.voiceURI||'')};
 update();window.speechSynthesis.addEventListener?.('voiceschanged',update);
 return ()=>{window.speechSynthesis.removeEventListener?.('voiceschanged',update)};
},[]);
useEffect(()=>{
 let active=true;
 setClip('');
 if(story.sample)void loadNarrationClips(basePath).then(clips=>{if(active)setClip(clips[story.id]||'')});
 return ()=>{active=false};
},[story.id,story.sample,basePath]);

function playBrowser(ticket:number){
 if(!mounted.current||sequence.current!==ticket)return;
 playbackMode.current='browser';
 if(!supported){setAudioError('No browser narration available.');releaseNarration(owner.current);updateStatus('idle');return;}
 const u=new SpeechSynthesisUtterance(story.title+'. '+story.excerpt);
 const selected=voices.find(v=>v.voiceURI===voiceId);
 if(selected){u.voice=selected;u.lang=selected.lang}else{u.lang='en-US'}
 u.rate=.95;
 const finish=(failed:boolean)=>{
  if(!mounted.current||sequence.current!==ticket||utterance.current!==u)return;
  utterance.current=null;releaseNarration(owner.current);updateStatus('idle');
  if(failed)setAudioError('Browser narration failed.');
 };
 u.onend=()=>finish(false);u.onerror=()=>finish(true);
 utterance.current=u;
 updateStatus('speaking');
 try{window.speechSynthesis.resume();window.speechSynthesis.speak(u)}catch{finish(true)}
}
function fallback(ticket:number){
 if(!mounted.current||sequence.current!==ticket||playbackMode.current!=='studio')return;
 activePlayer.current?.pause();
 activePlayer.current=null;
 setClip('');
 setAudioError(supported?'Recorded narration unavailable. Using your browser voice.':'Recorded narration unavailable; no browser voice is supported.');
 playBrowser(ticket);
}
function playRecorded(ticket:number){
 const player=audio.current;
 if(!player){playBrowser(ticket);return;}
 activePlayer.current=player;
 playbackMode.current='studio';updateStatus('loading');
 void player.play().then(()=>{
  if(mounted.current&&sequence.current===ticket&&playbackMode.current==='studio'&&statusRef.current==='loading')updateStatus('speaking');
 }).catch(()=>fallback(ticket));
}
function play(){
 if(statusRef.current==='loading')return;
 setAudioError('');
 if(statusRef.current==='speaking'){
  if(playbackMode.current==='studio')audio.current?.pause();else window.speechSynthesis.pause();
  updateStatus('paused');return;
 }
 if(statusRef.current==='paused'){
  if(playbackMode.current==='studio')playRecorded(sequence.current);
  else{window.speechSynthesis.resume();updateStatus('speaking')}
  return;
 }
 stop();
 claimNarration(owner.current,stop);
 const ticket=sequence.current;
 if(clip)playRecorded(ticket);else playBrowser(ticket);
}
return <motion.article initial={reduced?false:{opacity:0,y:18}} whileInView={reduced?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.4,delay:Math.min(index,4)*.045}} className="story">
 <div className="story-index"><span>STORY {String(index+1).padStart(2,'0')} / NEW WAVE</span><span>{story.country}</span></div>
 <div className="story-art" aria-hidden="true"><span>{String(index+1).padStart(2,'0')}</span><i/><b className="art-label">THE NEW WAVE / STORIES</b></div>
 <span className="category">{story.category}</span><h3>{story.title}</h3><p>{story.excerpt}</p>
 <div className="story-audio" role="group" aria-label={'Listen to '+story.title}>
 {clip&&<audio ref={audio} src={clip} preload="none" onEnded={event=>{if(playbackMode.current==='studio'&&activePlayer.current===event.currentTarget){activePlayer.current=null;sequence.current++;releaseNarration(owner.current);updateStatus('idle')}}} onError={()=>{if(playbackMode.current==='studio'&&statusRef.current!=='idle')fallback(sequence.current);else{setClip('');setAudioError('Recorded narration unavailable; browser voice remains available when supported.')}}} aria-label={'Generated narration for '+story.title}/>}
 <button type="button" disabled={status==='loading'||(!supported&&!clip)} onClick={play} aria-label={status==='loading'?'Loading narration':status==='speaking'?'Pause narration':status==='paused'?'Resume narration':'Listen to story'}>{status==='loading'?'Loading…':status==='speaking'?'Pause':status==='paused'?'Resume':'Listen'} <span aria-hidden="true">{status==='speaking'?'Ⅱ':'▶'}</span></button>
 {status!=='idle'&&<button type="button" onClick={stop} aria-label="Stop narration">Stop ■</button>}
 {supported&&!clip&&<label className="voice-select-label">Voice <select aria-label={'Narration voice for '+story.title} value={voiceId} onChange={e=>{stop();setVoiceId(e.target.value)}}><option value="">System default (English requested)</option>{voices.map(v=><option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}</select></label>}
 <span className="voice-caption">{clip?'Pre-generated Deepgram narration for fictional sample; browser fallback when unavailable.':supported?'Choose an installed voice; language and accent depend on your device':'Voice unavailable in this browser'}</span>
 {audioError&&<span role="status" className="voice-caption">{audioError}</span>}
 </div><div className="story-bottom"><span>By {story.author}{story.language?' · '+story.language:''}</span>{story.sample&&<span className="sample">Fictional sample</span>}</div>
 </motion.article>
}
