'use client';
import {useState} from 'react';
import type {FormEvent} from 'react';
import {CreatorCraftToolkit} from './creator-craft-toolkit';
import {CreatorVoicePicker} from './creator-voice-picker';
import {AddisCreatorAudio} from './addis-creator-audio';
import {ElevenLabsCreatorAudio} from './elevenlabs-creator-audio';
import {DEFAULT_CREATOR_VOICE} from '../lib/creator-voices';
import {StoryVisuals} from './story-visuals';
import {VoiceToText} from './voice-to-text';
import {SectionHeading,Arrow} from './experience';
import {CREATOR_COUNTRIES,CREATOR_LANGUAGES,resolveCreatorMetadata} from '../lib/creator-input';
import {CATEGORIES,STORY_KEY,prependDraft,parseStories} from '../lib/discovery';
import type {Story} from '../lib/discovery';
import {createUnsignedCreatorPassport,verifyUnsignedCreatorPassport} from '../lib/creator-passport';
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
  const [lastSavedStory,setLastSavedStory]=useState<Story|null>(null);
  const [passportBusy,setPassportBusy]=useState(false);
  const [passportMessage,setPassportMessage]=useState('');
  async function downloadPassport(){
    if(!lastSavedStory || passportBusy)return;
    setPassportBusy(true);setPassportMessage('');
    try{
      const saved=parseSavedCreatorStory(lastSavedStory.id);
      if(!saved)throw new Error('Saved draft is unavailable or has changed. No passport was generated.');
      const proof=await createUnsignedCreatorPassport(saved);
      const file=new Blob([JSON.stringify(proof,null,2)+'\\n'],{type:'application/json'});
      const url=URL.createObjectURL(file);
      const link=document.createElement('a');
      link.href=url;link.download='newwave-creator-passport-'+saved.id.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,64)+'.json';
      document.body.append(link);link.click();link.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),30_000);
      setPassportMessage('Unsigned integrity passport downloaded. It is not a digital signature or legal proof of ownership.');
    }catch(error){setPassportMessage(error instanceof Error?error.message:'Unable to download passport.');}
    finally{setPassportBusy(false)}
  }
  async function verifyPassport(file:File){
    if(!lastSavedStory || passportBusy)return;
    setPassportBusy(true);setPassportMessage('');
    try{
      if(file.size>32768)throw new Error('Passport must be 32 KB or smaller.');
      const saved=parseSavedCreatorStory(lastSavedStory.id);
      if(!saved)throw new Error('The saved draft is not available for verification.');
      const proof:unknown=JSON.parse(await file.text());
      const matches=await verifyUnsignedCreatorPassport(saved,proof);
      setPassportMessage(matches?'MATCH: This unsigned fingerprint matches the saved written draft in this browser. Identity and ownership remain unverified.':'NO MATCH: The passport does not match this saved draft or uses an unsupported format.');
    }catch(error){setPassportMessage(error instanceof Error?error.message:'Passport verification failed.');}
    finally{setPassportBusy(false)}
  }
  function parseSavedCreatorStory(id:string):Story|undefined{
    const value=parseStories(localStorage.getItem(STORY_KEY));
    return value.find(item=>item.id===id);
  }
  function publish(event:FormEvent){
    event.preventDefault();
    if(!rightsConfirmed){setMessage('Confirm authorship or permission before saving.');return}
    if(title.trim().length<3||content.trim().length<20||!country.trim()){setMessage('Add a title, country and at least 20 characters of story text.');return}
    setBusy(true);setMessage('');
    try {
      const metadata=resolveCreatorMetadata({title,content,country,language,category});
      const story:Story={id:globalThis.crypto?.randomUUID?.()||String(Date.now()),title:title.trim(),excerpt:content.trim(),author:author.trim()||'Anonymous creator',...metadata,tags:[],date:new Date().toISOString().slice(0,10)};
      const next=prependDraft(localStorage.getItem(STORY_KEY),story);
      localStorage.setItem(STORY_KEY,JSON.stringify(next));onSaved(next);setLastSavedStory(story);setPassportMessage('');
      setTitle('');setContent('');setRightsConfirmed(false);
      setMessage('Saved in this browser only. '+(category?'Your chosen category: ':'Suggested category: ')+story.category+'. '+(category?'You can find your draft in discovery.':'Local keyword rules, not AI.'));
    }catch(error){setMessage(error instanceof SyntaxError?'Saved draft data could not be read safely. It has not been overwritten. Copy your new text somewhere safe.':error instanceof Error?error.message:'Unable to save in browser storage. Copy your text somewhere safe before leaving this page.')}
    finally{setBusy(false)}
  }
  return {narrationVoice,setNarrationVoice,title,setTitle,content,setContent,storyAudio,setStoryAudio,author,setAuthor,country,setCountry,category,setCategory,language,setLanguage,rightsConfirmed,setRightsConfirmed,busy,message,publish,lastSavedStory,passportBusy,passportMessage,downloadPassport,verifyPassport};
}

export function CreatorStudio({draft}:{draft:ReturnType<typeof useCreatorDraft>}){
  const [narrationProvider,setNarrationProvider]=useState<'deepgram'|'addis'|'elevenlabs'>('deepgram');
  const {narrationVoice,setNarrationVoice,title,setTitle,content,setContent,storyAudio,setStoryAudio,author,setAuthor,country,setCountry,category,setCategory,language,setLanguage,rightsConfirmed,setRightsConfirmed,busy,message,publish,lastSavedStory,passportBusy,passportMessage,downloadPassport,verifyPassport}=draft;
  return <section className={styles.studio} aria-label="Creator studio">
          <SectionHeading title="Your words. Your next chapter" description="Build a story from what you know. Use a planning canvas, speak an answer, or bring a visual into the process. You make the creative decisions; nothing is automatically published."/>
          <section className={styles.creatorJourney} aria-labelledby="creator-journey-heading">
            <h3 id="creator-journey-heading">One idea. Four practical steps.</h3>
            <p>Follow this optional route from an original idea to a private draft. Nothing here is publicly published, and recording or transcription is optional.</p>
            <ol>
              <li><a href="#studio-plan"><span aria-hidden="true">01</span><strong>Plan your idea</strong><small>Pick a creative canvas and keep an editable brief.</small></a></li>
              <li><a href="#studio-draft"><span aria-hidden="true">02</span><strong>Write &amp; preview</strong><small>Shape your own story and see it before saving.</small></a></li>
              <li><a href="#studio-voice-answer"><span aria-hidden="true">03</span><strong>Record &amp; review</strong><small>Optional audio, with consent and editable transcription.</small></a></li>
              <li><a href="#studio-rights"><span aria-hidden="true">04</span><strong>Check rights &amp; save</strong><small>Confirm permission, then save to this browser only.</small></a></li>
            </ol>
          </section>
          <nav className={styles.studioWayfinding} aria-label="Optional creator tools"><a href="#studio-narration">Explore narration voices <Arrow/></a><a href="#studio-visual">Pair a visual <Arrow/></a></nav>
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
            <div id="studio-voice-answer" tabIndex={-1}><VoiceToText fields={[{id:'title',label:'What is your story called?'},{id:'author',label:'Who is telling this story?'},{id:'country',label:'Where does your story come from?'},{id:'content',label:'What happened, and why does it matter to you?'}]} onAudio={setStoryAudio} onInsert={(id,text)=>{const values:Record<string,string>={title,author,country,content};const limits:Record<string,number>={title:180,author:180,country:120,content:5000};const next=[values[id],text].filter(Boolean).join(id==='content'?'\n\n':' ');if(next.length>limits[id])return 'This answer is too long for the selected field. Shorten the transcript first.';if(id==='title')setTitle(next);else if(id==='author')setAuthor(next);else if(id==='country')setCountry(next);else setContent(next)}}/></div>
            <label id="studio-rights" tabIndex={-1} className="rights-check"><input type="checkbox" checked={rightsConfirmed} onChange={e=>setRightsConfirmed(e.target.checked)} required/><span>This is my original story or I have permission to use it. I understand this saves a draft only in this browser.</span></label>
            <p className="note">There are no accounts or public publishing. Category suggestions use local keyword rules, not AI. Written drafts are saved locally; visuals are not sent. Audio is sent to the transcription service only with your consent. Written text is sent to the selected narration provider only after separate consent; African-language narration requires a private server pilot. Download recordings and visuals separately; they are not included in the saved text draft.</p>
            <button className="primary" type="submit" disabled={busy}>{busy?'Saving...':'Save written draft locally'}</button>{message&&<p className="notice" role="status">{message}</p>}
            {lastSavedStory&&<section aria-label="Creator Verification Passport" className={styles.creatorPassport}>
              <h3>Creator Verification Passport</h3>
              <p>For your most recently saved written draft: <strong>{lastSavedStory.title}</strong>. Generate a local SHA-256 fingerprint or check a downloaded passport against the saved version in this browser. The file excludes story text, audio and images.</p>
              <p><strong>Unsigned:</strong> not a digital signature, verified identity, reliable timestamp, copyright registration or blockchain record. Anyone with the draft can generate an identical fingerprint.</p>
              <div className={styles.creatorPassportActions}>
                <button type="button" onClick={downloadPassport} disabled={passportBusy}>Download unsigned passport (.json)</button>
                <label>Verify passport against saved draft
                  <input type="file" accept=".json,application/json" disabled={passportBusy} onChange={e=>{const file=e.currentTarget.files?.[0];if(file)void verifyPassport(file);e.currentTarget.value='';}}/>
                </label>
              </div>
              {passportMessage&&<p role="status" className="notice">{passportMessage}</p>}
            </section>}
          </form></div></div>
          </div>
          <aside className={styles.studioMedia} aria-label="Voice and visual companion">
            <div className={styles.voiceProviderChoice} role="group" aria-label="Narration provider">
              <p>Choose a narration provider</p>
              <div>
                <button type="button" aria-pressed={narrationProvider==='deepgram'} onClick={()=>setNarrationProvider('deepgram')}>English</button>
                <button type="button" aria-pressed={narrationProvider==='addis'} onClick={()=>setNarrationProvider('addis')}>African languages</button>
                <button type="button" aria-pressed={narrationProvider==='elevenlabs'} onClick={()=>setNarrationProvider('elevenlabs')}>Multilingual</button>
              </div>
              <small>English is the default. Provider selection does not submit your writing.</small>
            </div>
            {narrationProvider==='deepgram'
              ? <CreatorVoicePicker voice={narrationVoice} onChange={setNarrationVoice} title={title} content={content}/>
              : narrationProvider==='addis'?<AddisCreatorAudio content={content}/>
              : <ElevenLabsCreatorAudio key={content+'\u0000'+language} title={title} content={content} storyLanguage={language}/>}
            <StoryVisuals audio={storyAudio}/><p className={styles.studioPrivacy}>A setting for your voice. Choose original artwork or an image you have permission to use. Media stays in this tab; download each asset to keep it.</p></aside>
          </div>

  </section>;
}

/** Native choices with a free entry for diaspora locations and other languages. */
function MetadataChoice({label,customLabel,choices,value,onChange}:{label:string;customLabel:string;choices:readonly string[];value:string;onChange:(value:string)=>void}) {
  const custom=!choices.includes(value);
  return <div className="metadata-choice"><label>{label}<select value={custom?'__other':value} onChange={e=>onChange(e.target.value==='__other'?'':e.target.value)}>{choices.map(item=><option key={item} value={item}>{item}</option>)}<option value="__other">Other / enter your own</option></select></label>{custom&&<label>{customLabel}<input required maxLength={120} value={value} onChange={e=>onChange(e.target.value)} placeholder={'Enter '+label.toLowerCase()}/></label>}</div>;
}
