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

export type PlaybackStatus = 'idle' | 'loading' | 'speaking' | 'paused';
export type PlaybackState = {status: PlaybackStatus; error: string};
type RecordedPlayer = Pick<HTMLMediaElement, 'play' | 'pause' | 'currentTime'>;

// Recorded files only: a missing or failed recording must never synthesize speech.
export function createRecordedNarration(onChange: (state: PlaybackState) => void) {
  const owner = {};
  let player: RecordedPlayer | null = null;
  let state: PlaybackState = {status: 'idle', error: ''};
  let revision = 0;
  let disposed = false;
  const emit = (status: PlaybackStatus, error = '') => {
    state = {status, error};
    if (!disposed) onChange(state);
  };
  const stop = () => {
    revision++;
    const previous = player;
    player = null;
    if (previous) {
      previous.pause();
      try { previous.currentTime = 0; } catch { /* Unloaded media may not be seekable. */ }
    }
    releaseNarration(owner);
    emit('idle');
  };
  const failed = (source: RecordedPlayer) => {
    if (disposed || player !== source) return;
    stop();
    emit('idle', 'Recording could not be played. Try again or read the story.');
  };
  const toggle = (source: RecordedPlayer | null) => {
    if (disposed || state.status === 'loading') return;
    if (!source) {
      stop();
      emit('idle', 'Narration unavailable. You can still read this story.');
      return;
    }
    if (state.status === 'speaking' && player === source) {
      source.pause();
      emit('paused');
      return;
    }
    if (state.status !== 'paused' || player !== source) {
      stop();
      claimNarration(owner, stop);
      player = source;
    }
    const ticket = ++revision;
    emit('loading');
    try {
      void source.play().then(() => {
        if (!disposed && revision === ticket && player === source) emit('speaking');
      }).catch(() => {
        if (!disposed && revision === ticket) failed(source);
      });
    } catch {
      if (revision === ticket) failed(source);
    }
  };
  return {
    toggle, stop, failed,
    ended(source: RecordedPlayer) {
      if (disposed || player !== source) return;
      revision++;
      player = null;
      releaseNarration(owner);
      emit('idle');
    },
    dispose() {
      disposed = true;
      stop();
    },
  };
}
