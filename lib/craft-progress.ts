/** Counts authored nonblank answers; never implies storage or publication. */
export function countAnsweredSections(format:string,sections:readonly string[],notes:Record<string,string>):number {
  return sections.reduce((count,_section,index)=>count+(notes[format+':'+index]?.trim()?1:0),0);
}
