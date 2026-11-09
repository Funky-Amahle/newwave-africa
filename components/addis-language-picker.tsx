'use client';

import {useEffect,useId,useRef,useState} from 'react';
import type {KeyboardEvent} from 'react';
import {ADDIS_LANGUAGES} from '../lib/addis-languages';
import styles from './creator-studio.module.css';

type Props={value:string;onChange:(language:string)=>void;disabled?:boolean};

/** Screenshot-inspired Addis language menu, independent of the private API's availability. */
export function AddisLanguagePicker({value,onChange,disabled=false}:Props){
  const id=useId();
  const [open,setOpen]=useState(false);
  const [focused,setFocused]=useState(0);
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const options=useRef<Array<HTMLButtonElement|null>>([]);
  const selectedIndex=Math.max(0,ADDIS_LANGUAGES.findIndex(item=>item.code===value));
  const selected=ADDIS_LANGUAGES[selectedIndex];

  function show(index=selectedIndex){
    if(disabled)return;
    setFocused(index);
    setOpen(true);
  }
  function close(restoreFocus=false){
    setOpen(false);
    if(restoreFocus)trigger.current?.focus();
  }
  function choose(next:string){
    if(next!==value)onChange(next);
    close(true);
  }

  useEffect(()=>{
    if(open)options.current[focused]?.focus();
  },[open,focused]);
  useEffect(()=>{
    if(disabled)setOpen(false);
  },[disabled]);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{
      if(!root.current?.contains(event.target as Node))close();
    };
    const escape=(event:globalThis.KeyboardEvent)=>{
      if(event.key==='Escape'){
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener('pointerdown',outside);
    document.addEventListener('keydown',escape);
    return()=>{
      document.removeEventListener('pointerdown',outside);
      document.removeEventListener('keydown',escape);
    };
  },[open]);

  function keyDown(event:KeyboardEvent<HTMLDivElement>){
    let next:number|undefined;
    if(event.key==='ArrowDown')next=(focused+1)%ADDIS_LANGUAGES.length;
    if(event.key==='ArrowUp')next=(focused-1+ADDIS_LANGUAGES.length)%ADDIS_LANGUAGES.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=ADDIS_LANGUAGES.length-1;
    if(next!==undefined){
      event.preventDefault();setFocused(next);
    }else if(event.key==='Escape'){
      event.preventDefault();event.stopPropagation();close(true);
    }else if(event.key==='Tab'){
      close();
    }else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){
      const start=(focused+1)%ADDIS_LANGUAGES.length;
      const sequence=[...ADDIS_LANGUAGES.slice(start),...ADDIS_LANGUAGES.slice(0,start)];
      const nextItem=sequence.find(item=>item.name.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()));
      if(nextItem){
        event.preventDefault();
        setFocused(ADDIS_LANGUAGES.findIndex(item=>item.code===nextItem.code));
      }
    }
  }

  return <div className={styles.addisLanguagePicker} ref={root}>
    <span id={id+'-label'} className={styles.voicePickerLabel}>Language</span>
    <button ref={trigger} type="button" className={styles.addisLanguageTrigger}
      disabled={disabled} aria-haspopup="listbox" aria-expanded={open}
      aria-controls={id+'-options'} aria-labelledby={id+'-label '+id+'-value'}
      onClick={()=>open?close():show()}
      onKeyDown={event=>{
        if(event.key==='ArrowDown'||event.key==='ArrowUp'||event.key==='Home'||event.key==='End'){
          event.preventDefault();
          show(event.key==='Home'?0:event.key==='End'?ADDIS_LANGUAGES.length-1:event.key==='ArrowUp'?(selectedIndex-1+ADDIS_LANGUAGES.length)%ADDIS_LANGUAGES.length:selectedIndex);
        }
      }}>
      <span id={id+'-value'}>{selected.name}</span>
      <span className={styles.addisLanguageChevron} aria-hidden="true">⌄</span>
    </button>
    {open&&<div id={id+'-options'} role="listbox" aria-labelledby={id+'-label'}
      className={styles.addisLanguageMenu} onKeyDown={keyDown}>
      {ADDIS_LANGUAGES.map((item,index)=><button
        key={item.code} ref={element=>{options.current[index]=element;}}
        type="button" role="option" aria-selected={value===item.code}
        tabIndex={index===focused?0:-1}
        className={styles.addisLanguageOption+(value===item.code?' '+styles.addisLanguageOptionSelected:'')}
        onFocus={()=>setFocused(index)}
        onClick={()=>choose(item.code)}>
        <span className={styles.addisLanguageCheck} aria-hidden="true">{value===item.code?'✓':''}</span>
        <span>{item.name}</span>
      </button>)}
    </div>}
  </div>;
}
