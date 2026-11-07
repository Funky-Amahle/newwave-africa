'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import type {ReactNode} from 'react';
import {useCreatorDraft} from './creator-studio';
import {parseStories,STORY_KEY} from '../lib/discovery';
import type {Story} from '../lib/discovery';

function useStateModel(){
  const [added,setAdded]=useState<Story[]>([]);
  const creator=useCreatorDraft(setAdded);
  useEffect(()=>{try{setAdded(parseStories(localStorage.getItem(STORY_KEY)))}catch{/* Saving reports storage errors without discarding the current writing. */}},[]);
  return {added,creator};
}
const SiteContext=createContext<ReturnType<typeof useStateModel>|null>(null);
export function SiteStateProvider({children}:{children:ReactNode}){
  const state=useStateModel();
  return <SiteContext.Provider value={state}>{children}</SiteContext.Provider>;
}
export function useSiteState(){
  const state=useContext(SiteContext);
  if(!state)throw new Error('Site state requires SiteStateProvider');
  return state;
}
