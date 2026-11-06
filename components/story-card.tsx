'use client';
import {useEffect,useRef,useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';
export type StoryPreview={id:string;title:string;excerpt:string;category:string;country:string;author:string;sample?:boolean;language?:string};
export function StoryCard({story,index}:{story:StoryPreview;index:number}){
const [status,setStatus]=useState<'idle'|'speaking'|'paused'>('idle');
const [supported,setSupported]=useState(false);
const reduced=useReducedMotion();
const utterance=useRef<SpeechSynthesisUtterance|null>(null);
useEffect(()=>{setSupported('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);return ()=>{if(utterance.current){window.speechSynthesis.cancel();utterance.current=null}}},[]);
function stop(){window.speechSynthesis.cancel();utterance.current=null;setStatus('idle')}
function play(){if(!supported)return;if(status==='speaking'){window.speechSynthesis.pause();setStatus('paused');return}if(status==='paused'){window.speechSynthesis.resume();setStatus('speaking');return}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(story.title+'. '+story.excerpt);u.lang='en';u.rate=.95;u.onend=()=>{utterance.current=null;setStatus('idle')};u.onerror=()=>{utterance.current=null;setStatus('idle')};utterance.current=u;window.speechSynthesis.speak(u);setStatus('speaking')}
return <motion.article initial={reduced?false:{opacity:0,y:18}} whileInView={reduced?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.4,delay:Math.min(index,4)*.045}} className="story"><div className="story-index"><span>{String(index+1).padStart(2,'0')} / EDITION 001</span><span>{story.country}</span></div><span className="category">{story.category}</span><h3>{story.title}</h3><p>{story.excerpt}</p><div className="story-audio" role="group" aria-label={'Listen to '+story.title}><button type="button" disabled={!supported} onClick={play} aria-label={status==='speaking'?'Pause narration':status==='paused'?'Resume narration':'Listen to story'}>{status==='speaking'?'Pause':status==='paused'?'Resume':'Listen'} <span aria-hidden="true">{status==='speaking'?'Ⅱ':'▶'}</span></button>{status!=='idle'&&<button type="button" onClick={stop} aria-label="Stop narration">Stop ■</button>}<span className="voice-caption">{supported?'Browser voice · availability varies':'Voice unavailable in this browser'}</span></div><div className="story-bottom"><span>By {story.author}</span>{story.sample&&<span className="sample">Fictional sample</span>}</div></motion.article>
}
