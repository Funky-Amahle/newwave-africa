import type {Story} from './discovery';

/** A small set of African-language choices. Availability and quality are provided by Google Translate, not this app. */
export const TRANSLATION_LANGUAGES=[
  {code:'zu',label:'isiZulu'},
  {code:'xh',label:'isiXhosa'},
  {code:'af',label:'Afrikaans'},
  {code:'st',label:'Sesotho'},
  {code:'tn',label:'Setswana'},
  {code:'nso',label:'Sepedi'},
  {code:'sw',label:'Kiswahili'},
  {code:'rw',label:'Kinyarwanda'},
  {code:'am',label:'Amharic'},
  {code:'ha',label:'Hausa'},
  {code:'yo',label:'Yoruba'},
  {code:'fr',label:'French'},
  {code:'pt',label:'Portuguese'}
] as const;

/** Never put private drafts in a third-party URL. Only explicitly labelled fictional samples qualify. */
export function sampleGoogleTranslateUrl(story:Pick<Story,'sample'|'title'|'excerpt'>,target:string):string|null{
  if(story.sample!==true||!TRANSLATION_LANGUAGES.some(language=>language.code===target))return null;
  const text=story.title+'\n\n'+story.excerpt;
  if(text.length===0||text.length>1500)return null; // Avoid oversized URLs; manual copy remains an option.
  const params=new URLSearchParams({sl:'en',tl:target,text,op:'translate'});
  return 'https://translate.google.com/?'+params.toString();
}

/** Opens an empty external translator; user decides whether to paste private text there. */
export function blankGoogleTranslateUrl(target:string):string{
  const safeTarget=TRANSLATION_LANGUAGES.some(language=>language.code===target)?target:'sw';
  return 'https://translate.google.com/?'+new URLSearchParams({sl:'auto',tl:safeTarget,op:'translate'}).toString();
}

/** Current public route only; never include search parameters, fragments or local draft text. */
export function publicSitePageUrl(pathname:string):string{
  const base='https://funky-amahle.github.io/newwave-africa/';
  const route=pathname.replace(/^\/newwave-africa(?=\/|$)/,'').replace(/^\/+|\/+$/g,'');
  const safeRoutes=new Set(['','creator-studio','our-approach']);
  const valid=safeRoutes.has(route)?route:'';
  return base+(valid?valid+'/':'');
}

/** Google Translate's Websites feature opens without silently transmitting any site content. */
export function googleWebsiteTranslatorUrl(target:string):string|null{
  if(!TRANSLATION_LANGUAGES.some(language=>language.code===target))return null;
  return 'https://translate.google.com/?'+new URLSearchParams({sl:'auto',tl:target,op:'websites'}).toString();
}
