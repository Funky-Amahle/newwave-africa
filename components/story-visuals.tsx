'use client';
import {useEffect,useId,useRef,useState} from 'react';
import styles from './creator-studio.module.css';
const visuals=[{id:'clay',name:'Clay tide'},{id:'forest',name:'Forest current'},{id:'ocean',name:'Ocean after dark'}];
export function StoryVisuals({audio}:{audio:Blob|null}){
  const titleId=useId();const [visual,setVisual]=useState('clay');const [upload,setUpload]=useState('');const [uploadExtension,setUploadExtension]=useState('');const [description,setDescription]=useState('');
  const [audioUrl,setAudioUrl]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(false);
  const current=useRef('');const version=useRef(0);
  const base=process.env.NEXT_PUBLIC_SITE_BASE_PATH||'';
  useEffect(()=>{if(!audio){setAudioUrl('');return}const url=URL.createObjectURL(audio);setAudioUrl(url);return()=>URL.revokeObjectURL(url)},[audio]);
  useEffect(()=>()=>{version.current++;if(current.current)URL.revokeObjectURL(current.current)},[]);
  const src=upload||base+'/story-visuals/'+visual+'.svg';
  async function choose(file:File){
    const ticket=++version.current;setLoading(false);setError('');
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||!file.size||file.size>5_000_000){setError('Choose a JPG, PNG or WebP image up to 5 MB.');return}
    setLoading(true);const url=URL.createObjectURL(file);
    try{
      const image=new Image();image.src=url;await image.decode();
      if(image.naturalWidth*image.naturalHeight>20_000_000||image.naturalWidth>8000||image.naturalHeight>8000)throw new Error('Choose an image under 20 megapixels and 8,000 pixels per side.');
      if(ticket!==version.current){URL.revokeObjectURL(url);return}
      if(current.current)URL.revokeObjectURL(current.current);current.current=url;setUpload(url);setUploadExtension(({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp'} as Record<string,string>)[file.type]);setDescription('');
    }catch(e){URL.revokeObjectURL(url);if(ticket===version.current)setError(e instanceof Error?e.message:'The image could not be opened.')}
    finally{if(ticket===version.current)setLoading(false)}
  }
  return <section id="studio-visual" tabIndex={-1} className={styles.panel} aria-labelledby={titleId}>
    <div className={styles.headingRow}><h3 id={titleId}>Give your voice a setting</h3><span>Optional visual companion</span></div>
    <p>Add your own image or choose original wave artwork. Preview it with your recording and download each asset to use in your own production.</p>
    <div className={styles.swatches} role="group" aria-label="Original background visuals">{visuals.map(item=><button key={item.id} type="button" className={styles.swatch} aria-pressed={!upload&&visual===item.id} onClick={()=>{version.current++;setLoading(false);if(current.current)URL.revokeObjectURL(current.current);current.current='';setUpload('');setUploadExtension('');setVisual(item.id);setDescription('');setError('')}}><img src={base+'/story-visuals/'+item.id+'.svg'} alt=""/><span>{item.name}</span></button>)}</div>
    <label>Upload a visual you own or have permission to use<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void choose(file)}}/></label>
    <div className={styles.stage} aria-busy={loading}><img src={src} alt={description}/><div className={styles.stageAudio}>{audioUrl?<><p>Your recording with the selected visual</p><audio controls src={audioUrl} aria-label="Audio and background visual preview"/></>:<p>Record or upload an answer to preview audio with this visual.</p>}</div></div>
    <label>Visual description (optional)<input maxLength={500} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe what the visual adds to your story"/></label>
    <div className={styles.actions}><a className={styles.download} href={src} download={upload?'newwave-visual.'+uploadExtension:'newwave-'+visual+'.svg'}>Download visual</a>{audioUrl&&<a className={styles.download} href={audioUrl} download={'newwave-audio.'+(audio?.type.includes('mp4')?'m4a':audio?.type.includes('mpeg')?'mp3':audio?.type.includes('wav')?'wav':audio?.type.includes('ogg')?'ogg':'webm')}>Download audio</a>}{upload&&<button type="button" onClick={()=>{version.current++;setLoading(false);if(current.current)URL.revokeObjectURL(current.current);current.current='';setUpload('');setUploadExtension('');setDescription('')}}>Remove uploaded visual</button>}</div>
    <p>Original backgrounds are abstract artwork, not photographs of a place or community. Uploaded images and recordings stay in this tab. Downloads are separate files, not a rendered video, and are not included in saved text drafts.</p>
    {loading&&<p role="status">Opening your visual…</p>}{error&&<p role="alert" className={styles.message}>{error}</p>}
  </section>;
}
