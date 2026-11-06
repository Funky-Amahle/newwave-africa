#!/usr/bin/env python3
"""Produce public *sample-only* story narration as reviewable audio artifacts.

Never call this from a browser or add DEEPGRAM_API_KEY to Next.js env.
"""
import argparse
import json
import os
from pathlib import Path
import sys
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
API = "https://api.deepgram.com/v2/speak"
ALLOWED_VOICES = ("flux-haley-en", "flux-alexis-en", "flux-kit-en")
SAMPLE_IDS = tuple("s%d" % i for i in range(1, 9))
MAX_AUDIO_BYTES = 10_000_000


def select_narrations(samples, sample):
    """Validate the entire selection before any paid provider request."""
    if not isinstance(samples, list) or len(samples) != len(SAMPLE_IDS):
        raise ValueError("Expected exactly eight fictional samples.")
    if any(not isinstance(story, dict) for story in samples):
        raise ValueError("Every fictional sample must be a story object.")
    ids = [story.get("id") for story in samples]
    if any(not isinstance(story_id, str) for story_id in ids) or set(ids) != set(SAMPLE_IDS):
        raise ValueError("Expected unique sample IDs s1 through s8.")
    selected = [story for story in samples if sample == "all" or story["id"] == sample]
    if not selected:
        raise ValueError("Requested sample is unavailable.")
    narrations = []
    for story in selected:
        if story.get("sample") is not True:
            raise ValueError("Refusing to send non-sample content to Deepgram.")
        if any(not isinstance(story.get(field), str) or not story[field].strip()
               for field in ("title", "excerpt")):
            raise ValueError("Sample title and excerpt must be non-empty text.")
        narration = story["title"].strip() + ". " + story["excerpt"].strip()
        if len(narration) > 1200:
            raise ValueError("Sample narration exceeds the per-story safety cap.")
        narrations.append((story["id"], narration))
    return narrations


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--voice", choices=ALLOWED_VOICES, default="flux-haley-en")
    parser.add_argument("--sample", default="all", choices=("all", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"))
    parser.add_argument("--output", type=Path, default=Path("site-narration-output/narration"))
    args = parser.parse_args()
    token = os.environ.get("DEEPGRAM_API_KEY", "")
    if not token:
        sys.exit("DEEPGRAM_API_KEY secret is missing.")
    try:
        samples = json.loads((ROOT / "lib/sample-stories.json").read_text(encoding="utf-8"))
        narrations = select_narrations(samples, args.sample)
    except (ValueError, OSError) as error:
        sys.exit(str(error))
    args.output.mkdir(parents=True, exist_ok=True)
    clips = {}
    for story_id, narration in narrations:
        req = urllib.request.Request(
            API + "?model=" + args.voice + "&encoding=mp3",
            data=json.dumps({"text": narration}).encode("utf-8"),
            headers={"Authorization": "Token " + token, "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=90) as response:
                content_type = response.headers.get("Content-Type", "")
                if response.status != 200 or content_type.split(";", 1)[0].lower() not in ("audio/mpeg", "audio/mp3"):
                    sys.exit("Deepgram returned an unexpected response.")
                payload = response.read(MAX_AUDIO_BYTES + 1)
        except urllib.error.HTTPError as e:
            sys.exit("Deepgram request failed with HTTP %s; check model permissions and quota." % e.code)
        except urllib.error.URLError:
            sys.exit("Network error contacting Deepgram.")
        if not payload or len(payload) > MAX_AUDIO_BYTES:
            sys.exit("Unexpected audio size; refusing output.")
        name = story_id + ".mp3"
        (args.output / name).write_bytes(payload)
        clips[story_id] = name
        print("Generated sample audio for", story_id)
    (args.output / "manifest.json").write_text(
        json.dumps({"version": 1, "provider": "Deepgram Flux", "voice": args.voice, "clips": clips}, indent=2) + "\n",
        encoding="utf-8",
    )
    print("Generated", len(clips), "sample audio clips for review (not deployed).")


if __name__ == "__main__":
    main()
