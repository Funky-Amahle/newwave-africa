import type {Story} from './discovery';

/** Portable integrity record, not an identity credential or blockchain proof. */
export const CREATOR_PASSPORT_SCHEMA = 'newwave-creator-passport/v1' as const;
export const WRITTEN_DRAFT_SCHEMA = 'newwave-written-draft/v1' as const;

export type UnsignedCreatorPassport = {
  schema: typeof CREATOR_PASSPORT_SCHEMA;
  proofStatus: 'unsigned';
  scope: 'browser-local-written-draft';
  hash: {
    algorithm: 'SHA-256';
    canonicalization: typeof WRITTEN_DRAFT_SCHEMA;
    value: string;
  };
  story: Pick<Story, 'id'|'title'|'author'|'country'|'category'|'language'|'date'>;
  generatedAtDeviceTime: string;
  signature: null;
  blockchainAnchor: null;
  notice: string;
};

/** Explicit order and UTF-8 encoding are part of the v1 verification contract.
 * Story text is hashed, but never copied into the downloaded passport. */
export function canonicalWrittenDraft(story: Story): string {
  return JSON.stringify({
    schema: WRITTEN_DRAFT_SCHEMA,
    id: story.id,
    title: story.title,
    text: story.excerpt,
    author: story.author,
    country: story.country,
    category: story.category,
    language: story.language,
    date: story.date,
  });
}

export async function sha256WrittenDraft(story: Story): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('SHA-256 is unavailable. Use a secure HTTPS or localhost browser.');
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(canonicalWrittenDraft(story)));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function createUnsignedCreatorPassport(story: Story): Promise<UnsignedCreatorPassport> {
  const value = await sha256WrittenDraft(story);
  return {
    schema: CREATOR_PASSPORT_SCHEMA,
    proofStatus: 'unsigned',
    scope: 'browser-local-written-draft',
    hash: {algorithm: 'SHA-256', canonicalization: WRITTEN_DRAFT_SCHEMA, value},
    story: {
      id: story.id, title: story.title, author: story.author,
      country: story.country, category: story.category, language: story.language, date: story.date,
    },
    generatedAtDeviceTime: new Date().toISOString(),
    signature: null,
    blockchainAnchor: null,
    notice: 'Unsigned integrity fingerprint only. Creator identity, ownership, trusted time and permissions are not verified. No audio, image or video is included.',
  };
}

/** Recompute from the actual saved written draft, not untrusted claims in the file.
 * Matching hashes establish only byte-equivalent v1 records, not authorship. */
export async function verifyUnsignedCreatorPassport(story: Story, input: unknown): Promise<boolean> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const p = input as Partial<UnsignedCreatorPassport>;
  if (p.schema !== CREATOR_PASSPORT_SCHEMA || p.proofStatus !== 'unsigned' ||
      p.scope !== 'browser-local-written-draft' || p.signature !== null ||
      p.blockchainAnchor !== null || !p.hash ||
      p.hash.algorithm !== 'SHA-256' ||
      p.hash.canonicalization !== WRITTEN_DRAFT_SCHEMA ||
      !/^[a-f0-9]{64}$/.test(p.hash.value)) return false;
  const s = p.story;
  if (!s || s.id !== story.id || s.title !== story.title ||
      s.author !== story.author || s.country !== story.country ||
      s.category !== story.category || s.language !== story.language ||
      s.date !== story.date) return false;
  return p.hash.value === await sha256WrittenDraft(story);
}
