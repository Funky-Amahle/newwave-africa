/** Pure, deterministic discovery helpers. No network, model calls, or creator uploads. */
export const CATEGORIES = [
  'Technology & Innovation', 'Business & Entrepreneurship', 'Culture & Heritage',
  'Agriculture & Climate', 'Education & Science', 'Arts & Entertainment',
  'Sports & Gaming', 'Community & Society',
] as const;

export type Story = {
  id: string; title: string; excerpt: string; category: string; country: string;
  author: string; language: string; tags: string[]; date: string; sample?: boolean;
};
export type DiscoveryOptions = {
  query: string; interest: string; diversity: number; savedOnly: boolean; saved: string[];
};
export const STORY_KEY = 'newwave-local-stories-v1';
export const SAVED_KEY = 'newwave-reading-list-v1';

/** Stored data is untrusted. Invalid entries must not break the discovery UI. */
export function parseStories(raw: string | null): Story[] {
  try {
    const data: unknown = JSON.parse(raw || '[]');
    if (!Array.isArray(data)) return [];
    const seen = new Set<string>();
    return data.filter((item): item is Story => {
      if (!item || typeof item !== 'object') return false;
      const s = item as Record<string, unknown>;
      if (!['id','title','excerpt','category','country','author','language','date']
        .every(key => typeof s[key] === 'string')) return false;
      if (!s.id || /^s[1-8]$/.test(s.id as string) || seen.has(s.id as string)) return false;
      if (!(CATEGORIES as readonly string[]).includes(s.category as string)) return false;
      if ((s.title as string).length > 180 || (s.excerpt as string).length > 5000) return false;
      if (!Array.isArray(s.tags) || !s.tags.every(tag => typeof tag === 'string')) return false;
      seen.add(s.id as string);
      return true;
    }).slice(0, 100).map(s => ({...s, sample: false}));
  } catch { return []; }
}

/** Prepare a save without dropping older/invalid entries or another tab's drafts. */
export function prependDraft(raw: string | null, story: Story): Story[] {
  const data: unknown = JSON.parse(raw || '[]');
  if (!Array.isArray(data)) throw new Error('Saved draft data needs review. Copy your new text somewhere safe; existing data has not been overwritten.');
  if (data.length >= 100) throw new Error('This browser has reached the 100-draft limit. Copy your new text somewhere safe; existing drafts have not been removed.');
  const current = parseStories(raw);
  if (current.length !== data.length) throw new Error('Some saved draft data needs review. Existing data has not been overwritten. Copy your new text somewhere safe.');
  if (current.some(s => s.id === story.id) || parseStories(JSON.stringify([story])).length !== 1) throw new Error('Unable to validate this draft. Your existing stories have not been changed.');
  return [story, ...current];
}

export function parseSaved(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw || '[]');
    return Array.isArray(value)
      ? [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length < 200))].slice(0, 200)
      : [];
  } catch { return []; }
}

export function toggleSaved(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id].slice(-200);
}

export function getDiscovery(stories: Story[], options: DiscoveryOptions) {
  const counts = Object.fromEntries(CATEGORIES.map(c => [c, stories.filter(s => s.category === c).length]));
  const query = options.query.trim().toLowerCase();
  const saved = new Set(options.saved);
  const candidates = stories.filter(s =>
    (!options.savedOnly || saved.has(s.id)) &&
    [s.title, s.excerpt, s.country, s.category, ...s.tags].join(' ').toLowerCase().includes(query));
  const relevance = (s: Story) => options.interest === 'All categories' ? .65 : s.category === options.interest ? 1 : .35;
  const weight = Number.isFinite(options.diversity) ? Math.min(100, Math.max(0, options.diversity)) / 100 : .6;
  const baseline = [...candidates].sort((a,b) => relevance(b)-relevance(a) || a.title.localeCompare(b.title));
  const score = (s: Story) => (1-weight)*relevance(s) + weight*(.3*relevance(s) + .7/(counts[s.category] || 1));
  const ranked = [...candidates].sort((a,b) => score(b)-score(a) || a.title.localeCompare(b.title));
  // Compare the same population and window, independent of "show more" presentation state.
  const windowSize = Math.min(8, candidates.length);
  const distinct = (items: Story[]) => new Set(items.map(s => s.category)).size;
  return {ranked, counts, windowSize, baselineCoverage: distinct(baseline.slice(0,windowSize)),
    diverseCoverage: distinct(ranked.slice(0,windowSize))};
}
