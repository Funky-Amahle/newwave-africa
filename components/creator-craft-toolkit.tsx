'use client';
import {useState} from 'react';
import {VoiceToText} from './voice-to-text';
import {appendCreatorAnswer} from '../lib/creator-input';
import {countAnsweredSections} from '../lib/craft-progress';

const formats=[
  {id:'story',label:'Story & writing',audience:'Writers and oral storytellers',sections:['Working title','Who is telling this story?','The idea in one sentence','Beginning: where are we?','Turning point: what changes?','Ending: what should remain with the audience?','Language, voice and cultural context','Permissions and attribution']},
  {id:'film',label:'Film & animation',audience:'Filmmakers and animators',sections:['Working title and logline','Audience and intended feeling','Scene 1: location, action, sound','Scene 2: conflict or discovery','Scene 3: resolution','Shot list and practical production needs','Dialogue, subtitles and language choices','Credits, music and image permissions']},
  {id:'journalism',label:'Journalism',audience:'Journalists and documentarians',sections:['Reporting question','Why this matters to the community','People and perspectives to interview','Evidence and source links','What needs independent verification?','Safety, consent and potential harm','Structure: lead, context, voices, conclusion','Corrections and publication checklist']},
  {id:'music',label:'Music & audio',audience:'Musicians and podcasters',sections:['Working title and theme','Intended listeners and mood','Rhythm, instruments or sound palette','Verse, segment or episode outline','Collaborators and their contributions','Recording plan using available equipment','Mixing, captions and transcript','Sample clearance, credits and rights']},
  {id:'game',label:'Games & interactive stories',audience:'Game makers and interactive creators',sections:['Core idea and player experience','Player role and motivation','World, setting and cultural research','Main interaction or game loop','Choices and consequences','First playable scene or paper prototype','Accessibility, localization and low-bandwidth needs','Playtest feedback and creator credits']}
] as const;
type FormatId=typeof formats[number]['id'];
export function CreatorCraftToolkit({onAudio}:{onAudio?:(audio:Blob|null)=>void}){
  const [format,setFormat]=useState<FormatId>('story');
  const [notes,setNotes]=useState<Record<string,string>>({});
  const [status,setStatus]=useState('');
  const [voiceOpen,setVoiceOpen]=useState<string|null>(null);
  const active=formats.find(f=>f.id===format)!;
  const drafted=countAnsweredSections(format,active.sections,notes);
  const exportText=()=>['# '+active.label+' — creator-owned production brief','','Created with NewWave Africa Creator Craft Toolkit. Human-authored notes; no AI generation or upload.','',...active.sections.flatMap((section,index)=>['## '+(index+1)+'. '+section,notes[format+':'+index]?.trim()||'(To develop)',''])].join('\n');
  function download(){
    const blob=new Blob([exportText()],{type:'text/markdown;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='newwave-'+format+'-brief.md';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
    setStatus('Your editable Markdown brief was downloaded. Keep a backup of your notes.');
  }
  return <section className="craft-toolkit" aria-labelledby="craft-heading">
    <div className="craft-heading"><div><h3 id="craft-heading">Shape the work. Keep your voice.</h3></div><p>Five free planning canvases for African storytellers and creative teams. Develop your ideas, plan production and download a shareable brief. These tools support your craft; you make the creative decisions. Type your answers, or press Speak on any question and talk it through. Review every word before it joins your notes. No account or AI generation required.</p></div>
    <div className="craft-formats" role="group" aria-label="Choose your creative practice">{formats.map(item=><button key={item.id} type="button" className={format===item.id?'selected':''} aria-pressed={format===item.id} onClick={()=>{setFormat(item.id);setStatus('');setVoiceOpen(null)}}>{item.label}</button>)}</div>
    <div className="craft-sheet"><div className="craft-sheet-intro"><h4>{active.label}</h4><p>{active.audience} · A practical outline you can adapt, translate, and share on your terms.</p><p className="craft-progress" role="status">{drafted} of {active.sections.length} prompts drafted. Download your brief to keep your work.</p></div>
    <div className="craft-fields">{active.sections.map((section,index)=>{
      const id=format+':'+index,fieldId='craft-answer-'+format+'-'+index,panelId='craft-voice-'+format+'-'+index;
      return <div className="craft-question" key={id}>
        <div className="craft-question-heading"><label htmlFor={fieldId}><span className="craft-question-number">{String(index+1).padStart(2,'0')}</span>{section}</label><button type="button" className="craft-speak" aria-label={(voiceOpen===id?'Close voice input for ':'Speak answer to ')+section} aria-expanded={voiceOpen===id} aria-controls={panelId} onClick={()=>setVoiceOpen(voiceOpen===id?null:id)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M6 10v2a6 6 0 0 0 12 0v-2M12 18v3m-3 0h6"/></svg>{voiceOpen===id?'Close':'Speak'}</button></div>
        <textarea id={fieldId} rows={3} maxLength={5000} value={notes[id]||''} onChange={e=>setNotes(previous=>({...previous,[id]:e.target.value}))} placeholder="Type here — or press Speak and talk it through."/>
        <div id={panelId} hidden={voiceOpen!==id}>{voiceOpen===id&&<><p className="craft-voice-note">Answering: {section}. Closing this panel or choosing another question clears its session key and any unadded transcript. Copy words you want to keep first.</p><VoiceToText key={id} fields={[{id,label:section}]} onAudio={onAudio} onInsert={(_,text)=>{try{const next=appendCreatorAnswer(notes[id]||'',text);setNotes(previous=>({...previous,[id]:next}))}catch(error){return (error as Error).message}}}/></>}</div>
      </div>;
    })}</div>
    <div className="craft-actions"><button type="button" className="primary" onClick={download}>Download editable brief ↓</button><p>Notes remain in this page's memory until you refresh or leave. Download to keep them. Your work stays yours.</p></div>{status&&<p role="status" className="notice">{status}</p>}</div>
  </section>;
}
