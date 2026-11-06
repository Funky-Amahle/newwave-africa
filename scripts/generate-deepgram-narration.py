#!/usr/bin/env python3
"""Generate standalone NewWave hackathon narration with Deepgram Flux TTS.

No API key is accepted on the command line or written to disk.
Run: DEEPGRAM_API_KEY=... python3 scripts/generate-deepgram-narration.py
"""
import json
import os
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "video" / "narration"
OUTPUT = ROOT / "video-output" / "narration"
VOICES = {"vision": "flux-haley-en", "technical-demo": "flux-alexis-en"}
# Smaller chunks minimize request-size issues and make it easier to edit pacing.
MAX_CHARS = 1200


def chunks(text):
    blocks = [line.strip() for line in text.splitlines() if line.strip() and not line.startswith("#")]
    result = []
    current = ""
    for block in blocks:
        for sentence in block.replace("! ", "!\n").replace("? ", "?\n").replace(". ", ".\n").splitlines():
            sentence = sentence.strip()
            if not sentence:
                continue
            if len(sentence) > MAX_CHARS:
                raise ValueError("Sentence exceeds safe TTS chunk size: shorten the text")
            if len(current) + len(sentence) + 1 > MAX_CHARS:
                result.append(current)
                current = ""
            current = (current + " " + sentence).strip()
    if current:
        result.append(current)
    return result


def synthesize(api_key, voice, text):
    url = "https://api.deepgram.com/v2/speak?" + urllib.parse.urlencode({"model": voice})
    data = json.dumps({"text": text}).encode("utf-8")
    request = urllib.request.Request(
        url, data=data, method="POST",
        headers={"Authorization": "Token " + api_key, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            if not response.headers.get("Content-Type", "").startswith("audio/"):
                raise RuntimeError("Deepgram did not return audio.")
            return response.read()
    except urllib.error.HTTPError as error:
        # Avoid printing returned bodies or request headers; neither belongs in logs.
        raise RuntimeError("Deepgram audio request failed with HTTP " + str(error.code)) from None


def main():
    key = os.environ.get("DEEPGRAM_API_KEY")
    if not key:
        raise SystemExit("Missing DEEPGRAM_API_KEY environment variable.")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name, voice in VOICES.items():
        source = SOURCE / (name + ".txt")
        segments = chunks(source.read_text(encoding="utf-8"))
        for i, segment in enumerate(segments, 1):
            path = OUTPUT / (name + "-" + str(i).zfill(2) + ".mp3")
            path.write_bytes(synthesize(key, voice, segment))
            print("Created", path.relative_to(ROOT))
    print("Review narration before synchronizing it to video. These are audio segments, not finished MP4 videos.")


if __name__ == "__main__":
    main()
