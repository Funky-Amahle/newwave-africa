// One manifest request per base path and page load, including missing manifests.
const manifests = new Map<string, Promise<Record<string, string>>>();

export function loadNarrationClips(basePath: string): Promise<Record<string, string>> {
  let result = manifests.get(basePath);
  if (!result) {
    result = fetch(basePath + '/narration/manifest.json')
      .then(response => response.ok ? response.json() : null)
      .then((value: unknown) => {
        const clips: Record<string, string> = {};
        if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 ||
            !('clips' in value) || !value.clips || typeof value.clips !== 'object') return clips;
        for (const [id, filename] of Object.entries(value.clips)) {
          if (/^s[1-8]$/.test(id) && filename === id + '.mp3') {
            clips[id] = basePath + '/narration/' + filename;
          }
        }
        return clips;
      }).catch(() => ({}));
    manifests.set(basePath, result);
  }
  return result;
}

let current: {owner: object; stop: () => void} | null = null;

export function claimNarration(owner: object, stop: () => void) {
  if (current && current.owner !== owner) current.stop();
  current = {owner, stop};
}

export function releaseNarration(owner: object) {
  if (current?.owner === owner) current = null;
}
