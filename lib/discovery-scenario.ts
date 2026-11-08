/** An intentionally uneven, fictional fixture for explaining ranking - not creator work or audience data. */
import type {Story} from './discovery';
const technologyTitles=[
  'A new app for the market',
  'Building a community map',
  'Code classes in the library',
  'Digital tools for local traders',
  'Engineering a solar sensor',
  'Free software for neighborhood groups',
  'Growing a school robotics club',
  'Helping students learn to code',
];
const otherStories=[
  {title:'Listening to family histories',category:'Culture & Heritage',country:'Ghana'},
  {title:'Sharing water-saving farming ideas',category:'Agriculture & Climate',country:'Namibia'},
  {title:'Teaching science after school',category:'Education & Science',country:'Rwanda'},
  {title:'Working together in community kitchens',category:'Community & Society',country:'Kenya'},
];
function example(id:string,title:string,category:string,country:string):Story {
  return {id,title,category,country,author:'Fictional scenario',language:'English',
    excerpt:'An invented example used to explain category coverage, not a real creator submission.',
    tags:['scenario'],date:'2026-11-01',sample:true};
}
export const DISCOVERY_SCENARIO_STORIES:Story[]=[
  ...technologyTitles.map((title,i)=>example('scenario-tech-'+(i+1),title,'Technology & Innovation','South Africa')),
  ...otherStories.map((story,i)=>example('scenario-other-'+(i+1),story.title,story.category,story.country)),
];
export const SCENARIO_CATEGORY_COUNT=new Set(DISCOVERY_SCENARIO_STORIES.map(s=>s.category)).size;
