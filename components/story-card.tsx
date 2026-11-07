'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {motion} from 'motion/react';
import {useQuietMotion} from './experience';
import {StoryArtwork,NarrationVisual} from './story-artwork';
import {createRecordedNarration,loadNarrationClips} from '../lib/narration';
import type {PlaybackState} from '../lib/narration';
import styles from './story-narration.module.css';

export type StoryPreview={id:string;title:string;excerpt:string;category:string;country:string;author:string;sample?:boolean;language?:string};

export function StoryCard({story,index}:{story:StoryPreview;index:number}){
  const [playback,setPlayback]=useState<PlaybackState>({status:'idle',error:''});
  const [clip,setClip]=useState('');
  const [checked,setChecked]=useState(false);
  const player=useRef<ReturnType<typeof createRecordedNarration>|null>(null);
  const audio=useRef<HTMLAudioElement|null>(null);
  const captionId=useId();
  const reduced=useQuietMotion();
  const basePath=typeof window!=='undefined' && window.location.pathname.startsWith('/newwave-africa')?'/newwave-africa':'';

  useEffect(()=>{
    const controller=createRecordedNarration(setPlayback);
    player.current=controller;
    return ()=>{controller.dispose();player.current=null};
  },[]);
  useEffect(()=>{
    let active=true;
    player.current?.stop();
    setClip('');
    setChecked(false);
    if(story.sample){
      void loadNarrationClips(basePath).then(clips=>{
        if(active){setClip(clips[story.id]||'');setChecked(true)}
      });
    }else setChecked(true);
    return ()=>{active=false;player.current?.stop()};
  },[story.id,story.sample,basePath]);

  const {status,error}=playback;
  const buttonText=!checked?'Checking narration...':!clip?'Narration unavailable':status==='loading'?'Loading narration...':status==='speaking'?'Pause':status==='paused'?'Resume':'Listen';
  const caption=error || (!checked?'Checking for a recorded story.':clip?'Deepgram-generated recording. No browser voice fallback.':'Narration unavailable. You can still read this story.');

  return <motion.article initial={reduced?false:{opacity:0,y:18}} whileInView={reduced?undefined:{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.4,delay:Math.min(index,4)*.045}} className="story">
    <div className="story-index"><span>STORY {String(index+1).padStart(2,'0')} / NEW WAVE</span><span>{story.country}</span></div>
    <div className="story-art"><StoryArtwork key={story.id} category={story.category} quiet={reduced}/></div>
    <span className="category">{story.category}</span><h3>{story.title}</h3><p>{story.excerpt}</p>
    {clip&&<audio hidden ref={audio} src={clip} preload="none" onEnded={e=>player.current?.ended(e.currentTarget)} onError={e=>player.current?.failed(e.currentTarget)}/>}
    <div className={'story-audio '+styles.actions} role="group" aria-label={'Listen to '+story.title} data-narration-source={clip?'recording':'none'}>
      <div className={styles.buttons}>
        {clip&&<NarrationVisual playing={status==='speaking'} quiet={reduced}/>}
        <button type="button" disabled={!clip||status==='loading'} onClick={()=>player.current?.toggle(audio.current)} aria-describedby={captionId} aria-label={buttonText+' - '+story.title}>{buttonText}</button>
        {status!=='idle'&&<button type="button" onClick={()=>player.current?.stop()} aria-label={'Stop narration - '+story.title}>Stop</button>}
      </div>
      <span id={captionId} role="status" aria-live="polite" className="voice-caption">{caption}</span>
    </div>
    <div className="story-bottom"><span>By {story.author}{story.language?' \u00b7 '+story.language:''}</span>{story.sample&&<span className="sample">Fictional sample</span>}</div>
  </motion.article>;
}
