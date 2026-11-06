#!/usr/bin/env python3
"""Produce public *sample-only* story narration as reviewable audio artifacts.

Never call this from a browser or add DEEPGRAM_API_KEY to Next.js env.
"""
import argparse
import json
import os
from pathlib import Path
import re
import sys
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
API = "https://api.deepgram.com/v2/speak"
ALLOWED_VOICES = ("flux-haley-en", "flux-alexis-en", "flux-kit-en")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--voice", choices=ALLOWED_VOICES, default="flux-haley-en")
    parser.add_argument("--sample", default="all", choices=("all", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"))
    parser.add_argument("--output", type=Path, default=Path("site-narration-output/narration"))
    args = parser.parse_args()
    token = os.environ.get("DEEPGRAM_API_KEY", "")
    if not token:
        sys.exit("DEEPGRAM_API_KEY secret is missing.")
    samples = json.loads((ROOT / "lib/sample-stories.json").read_text(encoding="utf-8"))
    if len(samples) != 8:
        sys.exit("Expected exactly eight fictional samples.")
    args.output.mkdir(parents=True, exist_ok=True)
    clips = {}
    selected = [story for story in samples if args.sample == "all" or story["id"] == args.sample]
    if not selected:
        sys.exit("Requested sample is unavailable.")
    for story in selected:
        story_id = story["id"]
        if not re.fullmatch(r"s[0-9]+", story_id) or story.get("sample") is not True:
            sys.exit("Refusing to send non-sample content to Deepgram.")
        narration = story["title"].strip() + ". " + story["excerpt"].strip()
        if len(narration) > 1200:
            sys.exit("Sample narration exceeds the per-story safety cap.")
        req = urllib.request.Request(
            API + "?model=" + args.voice,
            data=json.dumps({"text": narration}).encode("utf-8"),
            headers={"Authorization": "Token " + token, "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=90) as response:
                content_type = response.headers.get("Content-Type", "")
                if response.status != 200 or not content_type.startswith("audio/"):
                    sys.exit("Deepgram returned an unexpected response.")
                payload = response.read()
        except urllib.error.HTTPError as e:
            sys.exit("Deepgram request failed with HTTP %s; check model permissions and quota." % e.code)
        except urllib.error.URLError:
            sys.exit("Network error contacting Deepgram.")
        if not payload or len(payload) > 10_000_000:
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
