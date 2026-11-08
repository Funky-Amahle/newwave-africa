'use client';
import {useState} from 'react';
import type {FormEvent} from 'react';
import {CreatorCraftToolkit} from './creator-craft-toolkit';
import {CreatorVoicePicker} from './creator-voice-picker';
import {DEFAULT_CREATOR_VOICE} from '../lib/creator-voices';
import {StoryVisuals} from './story-visuals';
import {VoiceToText} from './voice-to-text';
import {SectionHeading,Arrow} from './experience';
import {CREATOR_COUNTRIES,CREATOR_LANGUAGES,resolveCreatorMetadata} from '../lib/creator-input';
import {CATEGORIES,STORY_KEY,prependDraft} from '../lib/discovery';
import type {Story} from '../lib/discovery';
import styles from './experience.module.css';

/** Shared creator composition: the Base44 visual layout with the local-first tools. */
export function useCreatorDraft(onSaved:(stories:Story[])=>void){
  const [narrationVoice,setNarrationVoice]=useState<string>(DEFAULT_CREATOR_VOICE);
  const [title,setTitle]=useState('');
  const [content,setContent]=useState('');
  const [storyAudio,setStoryAudio]=useState<Blob|null>(null);
  const [author,setAuthor]=useState('');
  const [country,setCountry]=useState('South Africa');
  const [category,setCategory]=useState('');
  const [language,setLanguage]=useState('English');
  const [rightsConfirmed,setRightsConfirmed]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  function publish(event:FormEvent){
    event.preventDefault();
    if(!rightsConfirmed){setMessage('Confirm authorship or permission before saving.');return}
    if(title.trim().length<3||content.trim().length<20||!country.trim()){setMessage('Add a title, country and at least 20 characters of story text.');return}
    setBusy(true);setMessage('');
    try {
      const metadata=resolveCreatorMetadata({title,content,country,language,category});
      const story:Story={id:globalThis.crypto?.randomUUID?.()||String(Date.now()),title:title.trim(),excerpt:content.trim(),author:author.trim()||'Anonymous creator',...metadata,tags:[],date:new Date().toISOString().slice(0,10)};
      const next=prependDraft(localStorage.getItem(STORY_KEY),story);
      localStorage.setItem(STORY_KEY,JSON.stringify(next));onSaved(next);
      setTitle('');setContent('');setRightsConfirmed(false);
      setMessage('Saved in this browser only. '+(category?'Your chosen category: ':'Suggested category: ')+story.category+'. '+(category?'You can find your draft in discovery.':'Local keyword rules, not AI.'));
    }catch(error){setMessage(error instanceof SyntaxError?'Saved draft data could not be read safely. It has not been overwritten. Copy your new text somewhere safe.':error instanceof Error?error.message:'Unable to save in browser storage. Copy your text somewhere safe before leaving this page.')}
    finally{setBusy(false)}
  }
  return {narrationVoice,setNarrationVoice,title,setTitle,content,setContent,storyAudio,setStoryAudio,author,setAuthor,country,setCountry,category,setCategory,language,setLanguage,rightsConfirmed,setRightsConfirmed,busy,message,publish};
}

export function CreatorStudio({draft}:{draft:ReturnType<typeof useCreatorDraft>}){
  const {narrationVoice,setNarrationVoice,title,setTitle,content,setContent,storyAudio,setStoryAudio,author,setAuthor,country,setCountry,category,setCategory,language,setLanguage,rightsConfirmed,setRightsConfirmed,busy,message,publish}=draft;
  return <section className={styles.studio} aria-label="Creator studio">
          <SectionHeading title="Your words. Your next chapter" description="Build a story from what you know. Use a planning canvas, speak an answer, or bring a visual into the process. You make the creative decisions; nothing is automatically published."/>
          <nav className={styles.studioWayfinding} aria-label="Creator studio tools"><a href="#studio-plan">Plan your work <Arrow/></a><a href="#studio-narration">Choose a voice <Arrow/></a><a href="#studio-visual">Choose a visual <Arrow/></a><a href="#studio-draft">Save a written draft <Arrow/></a></nav>
          <div className={styles.studioColumns}>
          <div className={styles.studioWork} id="studio-plan" tabIndex={-1}>
          <CreatorCraftToolkit onAudio={setStoryAudio}/>
          <div id="studio-draft" tabIndex={-1}><SectionHeading title="Share your story" description="Write from experience, answer by voice, and review your draft before saving. Your words stay yours."/>
          <div className={styles.creatorFrame}><form className="creator" onSubmit={publish}>
            <label>Working title<input required minLength={3} maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} placeholder="A title that earns the first line"/></label>
            <div className="formrow"><label>Your credit<input maxLength={180} value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Name or anonymous"/></label><MetadataChoice label="Country" customLabel="Country name" choices={CREATOR_COUNTRIES} value={country} onChange={setCountry}/></div>
            <div className="formrow"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option value="">Suggest category on save</option>{CATEGORIES.map(item=><option key={item} value={item}>{item}</option>)}</select></label><MetadataChoice label="Language" customLabel="Story language" choices={CREATOR_LANGUAGES} value={language} onChange={setLanguage}/></div>
            <p className="note">Choose the language of your written story. Speech-to-text currently supports English only.</p>
            <label>Your story<textarea required minLength={20} maxLength={5000} rows={8} value={content} onChange={e=>setContent(e.target.value)} placeholder="Write an original story about an experience, idea or community..."/></label>
            <div className="draft-preview"><span className="draft-label">Draft preview</span><h3>{title.trim()||'Your story begins here'}</h3><p>{content.trim()?content.trim().slice(0,220)+(content.trim().length>220?'...':''):'Your words will appear here as you write.'}</p><small>{author.trim()||'Anonymous creator'} / {country}</small></div>
            <VoiceToText fields={[{id:'title',label:'What is your story called?'},{id:'author',label:'Who is telling this story?'},{id:'country',label:'Where does your story come from?'},{id:'content',label:'What happened, and why does it matter to you?'}]} onAudio={setStoryAudio} onInsert={(id,text)=>{const values:Record<string,string>={title,author,country,content};const limits:Record<string,number>={title:180,author:180,country:120,content:5000};const next=[values[id],text].filter(Boolean).join(id==='content'?'\n\n':' ');if(next.length>limits[id])return 'This answer is too long for the selected field. Shorten the transcript first.';if(id==='title')setTitle(next);else if(id==='author')setAuthor(next);else if(id==='country')setCountry(next);else setContent(next)}}/>
            <label className="rights-check"><input type="checkbox" checked={rightsConfirmed} onChange={e=>setRightsConfirmed(e.target.checked)} required/><span>This is my original story or I have permission to use it. I understand this saves a draft only in this browser.</span></label>
            <p className="note">There are no accounts or public publishing. Category suggestions use local keyword rules, not AI. Written drafts and visuals are not sent to OpenAI or Deepgram. Only audio you explicitly submit for transcription is sent to Deepgram. Download recordings and visuals separately; they are not included in the saved text draft.</p>
            <button className="primary" type="submit" disabled={busy}>{busy?'Saving...':'Save written draft locally'}</button>{message&&<p className="notice" role="status">{message}</p>}
          </form></div></div>
          </div>
          <aside className={styles.studioMedia} id="studio-visual" tabIndex={-1} aria-label="Voice and visual companion"><CreatorVoicePicker voice={narrationVoice} onChange={setNarrationVoice} title={title} content={content}/><StoryVisuals audio={storyAudio}/><p className={styles.studioPrivacy}>A setting for your voice. Choose original artwork or an image you have permission to use. Media stays in this tab; download each asset to keep it.</p></aside>
          </div>

  </section>;
}

/** Native choices with a free entry for diaspora locations and other languages. */
function MetadataChoice({label,customLabel,choices,value,onChange}:{label:string;customLabel:string;choices:readonly string[];value:string;onChange:(value:string)=>void}) {
  const custom=!choices.includes(value);
  return <div className="metadata-choice"><label>{label}<select value={custom?'__other':value} onChange={e=>onChange(e.target.value==='__other'?'':e.target.value)}>{choices.map(item=><option key={item} value={item}>{item}</option>)}<option value="__other">Other / enter your own</option></select></label>{custom&&<label>{customLabel}<input required maxLength={120} value={value} onChange={e=>onChange(e.target.value)} placeholder={'Enter '+label.toLowerCase()}/></label>}</div>;
}
