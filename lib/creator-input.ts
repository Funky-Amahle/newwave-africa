import {CATEGORIES} from './discovery';
import {categorizeLocally} from './demo-categorize';

export const CREATOR_COUNTRIES = ['Algeria','Angola','Benin','Botswana','Burkina Faso','Burundi','Cabo Verde','Cameroon','Central African Republic','Chad','Comoros','Congo','Democratic Republic of the Congo','Djibouti','Egypt','Equatorial Guinea','Eritrea','Eswatini','Ethiopia','Gabon','Gambia','Ghana','Guinea','Guinea-Bissau','Ivory Coast','Kenya','Lesotho','Liberia','Libya','Madagascar','Malawi','Mali','Mauritania','Mauritius','Morocco','Mozambique','Namibia','Niger','Nigeria','Rwanda','São Tomé and Príncipe','Senegal','Seychelles','Sierra Leone','Somalia','South Africa','South Sudan','Sudan','Tanzania','Togo','Tunisia','Uganda','Zambia','Zimbabwe'] as const;
export const CREATOR_LANGUAGES = ['English','Afrikaans','Amharic','Arabic','French','Hausa','Igbo','isiXhosa','isiZulu','Kinyarwanda','Kiswahili','Portuguese','Sesotho','Setswana','Shona','Somali','Wolof','Yorùbá'] as const;

/** A reviewed answer appends without replacing the author's existing words. */
export function appendCreatorAnswer(existing:string,answer:string,limit=5000):string {
  const text=answer.trim();
  if(!text)throw new Error('Review and add some words before inserting this answer.');
  const next=existing ? existing+'\n\n'+text : text;
  if(next.length>limit)throw new Error('This answer would exceed '+limit.toLocaleString('en-US')+' characters. Shorten the transcript first.');
  return next;
}

export function resolveCreatorMetadata(input:{title:string;content:string;country:string;language:string;category:string}) {
  const country=input.country.trim(),language=input.language.trim();
  if(!country||country.length>120)throw new Error('Choose a country or enter a country name of up to 120 characters.');
  if(!language||language.length>120)throw new Error('Choose a story language or enter one of up to 120 characters.');
  if(input.category&&!(CATEGORIES as readonly string[]).includes(input.category))throw new Error('Choose a category from the list, or use the local suggestion.');
  const suggestion=categorizeLocally(input.title,input.content).category;
  return {country,language,category:input.category||suggestion};
}
