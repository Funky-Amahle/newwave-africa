"""One-time, review-only Haley narration for the two requested submission videos."""
import argparse
import json
import os
from pathlib import Path
import re
import sys
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--video', choices=('vision', 'technical'), required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    args = parser.parse_args()
    key = os.environ.get('DEEPGRAM_API_KEY', '')
    if not key:
        sys.exit('DEEPGRAM_API_KEY is missing.')
    text = (ROOT / 'docs/video/narration' / (args.video + '.txt')).read_text(encoding='utf-8')
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n', text.strip()) if p.strip()]
    if not 1 <= len(paragraphs) <= 16 or any(len(p) > 1200 for p in paragraphs):
        sys.exit('Narration must contain 1-16 sections of at most 1200 characters each.')
    args.output_dir.mkdir(parents=True, exist_ok=True)
    segments = []
    for index, paragraph in enumerate(paragraphs, start=1):
        request = urllib.request.Request(
            'https://api.deepgram.com/v2/speak?model=flux-haley-en&encoding=mp3',
            data=json.dumps({'text': paragraph}).encode(),
            headers={'Authorization': 'Token ' + key, 'Content-Type': 'application/json'}, method='POST')
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                if response.status != 200 or response.headers.get('Content-Type', '').split(';')[0].lower() not in ('audio/mpeg', 'audio/mp3'):
                    sys.exit('Unexpected narration response.')
                payload = response.read(10_000_001)
        except urllib.error.HTTPError as error:
            sys.exit('Narration request failed with HTTP %s.' % error.code)
        except urllib.error.URLError:
            sys.exit('Narration network request failed.')
        if not 0 < len(payload) <= 10_000_000:
            sys.exit('Narration response exceeded output bounds or was empty.')
        filename = '%s-haley-%02d.mp3' % (args.video, index)
        (args.output_dir / filename).write_bytes(payload)
        segments.append({'section': index, 'file': filename, 'text': paragraph})
        print('Generated section %d of %d.' % (index, len(paragraphs)))
    (args.output_dir / 'segments.json').write_text(json.dumps({
        'video': args.video, 'voice': 'flux-haley-en', 'segments': segments}, indent=2) + '\n')
    print('Review-only narration complete. No publishing or deployment performed.')


if __name__ == '__main__':
    main()
