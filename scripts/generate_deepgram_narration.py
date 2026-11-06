#!/usr/bin/env python3
"""Generate a review-only MP3 narration using Deepgram Flux batch TTS."""
import argparse
import json
import os
from pathlib import Path
import re
import sys
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = {
    "vision": ROOT / "docs/video/narration/vision.txt",
    "technical": ROOT / "docs/video/narration/technical.txt",
}
VOICES = {"flux-haley-en", "flux-alexis-en", "flux-kit-en"}
API_URL = "https://api.deepgram.com/v2/speak"


def chunks(text, limit=1200):
    """Split on sentence boundaries while respecting request text limits."""
    sentences = re.split(r"(?<=[.!?])\s+", " ".join(text.split()))
    parts = []
    current = ""
    for sentence in sentences:
        while len(sentence) > limit:
            if current:
                parts.append(current)
                current = ""
            cut = sentence.rfind(" ", 0, limit + 1)
            if cut <= 0:
                cut = limit
            parts.append(sentence[:cut].strip())
            sentence = sentence[cut:].strip()
        if not sentence:
            continue
        candidate = (current + " " + sentence).strip()
        if len(candidate) > limit and current:
            parts.append(current)
            current = sentence
        else:
            current = candidate
    if current:
        parts.append(current)
    return parts


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", required=True, choices=sorted(SCRIPTS))
    parser.add_argument("--voice", default="flux-haley-en", choices=sorted(VOICES))
    parser.add_argument("--output-dir", default="narration-output")
    args = parser.parse_args()

    key = os.environ.get("DEEPGRAM_API_KEY")
    if not key:
        sys.exit("DEEPGRAM_API_KEY is missing. Configure the GitHub Actions secret.")
    text = SCRIPTS[args.video].read_text(encoding="utf-8").strip()
    if not text:
        sys.exit("Narration text is empty.")
    destination = Path(args.output_dir)
    destination.mkdir(parents=True, exist_ok=True)
    parts = chunks(text)
    written = []
    # Each MP3 is an independent valid recording. Editors can place them in order
    # without any system ffmpeg installation or risky binary MP3 concatenation.
    for idx, part in enumerate(parts, start=1):
        req = urllib.request.Request(
            API_URL + "?model=" + args.voice,
            data=json.dumps({"text": part}).encode("utf-8"),
            headers={"Authorization": "Token " + key, "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=90) as response:
                if response.status != 200 or not response.headers.get("Content-Type", "").startswith("audio/"):
                    sys.exit("Deepgram returned an unexpected response.")
                audio = response.read()
        except urllib.error.HTTPError as error:
            sys.exit("Deepgram narration failed (HTTP %s). Check key permissions, quota and model." % error.code)
        except urllib.error.URLError:
            sys.exit("Unable to connect to Deepgram.")
        if not audio or len(audio) > 10_000_000:
            sys.exit("Deepgram returned an invalid audio segment.")
        name = "%s-%s-%02d.mp3" % (args.video, args.voice, idx)
        (destination / name).write_bytes(audio)
        written.append({"file": name, "text": part})
        print("Narration segment %d/%d generated" % (idx, len(parts)))
    (destination / "segments.json").write_text(
        json.dumps({"video": args.video, "voice": args.voice, "segments": written}, indent=2) + "\n",
        encoding="utf-8",
    )
    print("Generated", len(written), "independent MP3 segments for video editor import.")



if __name__ == "__main__":
    main()
