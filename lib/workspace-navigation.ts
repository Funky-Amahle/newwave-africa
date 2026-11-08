/** Stable hash destinations for the static Pages and optional server builds. */
export type Workspace = 'discover' | 'create' | 'impact';
const routes:Record<Workspace,string> = {
  discover:'#discover',
  create:'#creator-studio',
  impact:'#discovery-insights'
};
export function workspaceHash(section:Workspace):string { return routes[section]; }
/** Unrelated fragments such as #top and the #workspace skip link are ignored. */
export function workspaceFromHash(fragment:string):Workspace|null {
  switch(fragment.trim().toLowerCase()){
    case '#discover': return 'discover';
    case '#creator-studio':
    case '#studio-plan':
    case '#studio-visual':
    case '#studio-draft':
    case '#studio-voice-answer':
    case '#studio-rights': return 'create';
    case '#discovery-insights': return 'impact';
    default: return null;
  }
}
