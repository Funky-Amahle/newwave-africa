#!/usr/bin/env python3
"""Check unpublished narration associations and MPEG frames, not audible quality."""
import argparse
import json
from pathlib import Path
import sys

SAMPLE_IDS = tuple("s%d" % i for i in range(1, 9))
VOICES = ("flux-haley-en", "flux-alexis-en", "flux-kit-en")
MAX_AUDIO_BYTES = 10_000_000


def validate_mp3(payload):
    """Require complete MPEG Layer III frames; a decoder/listening review is separate."""
    offset = 0
    if payload.startswith(b"ID3"):
        if len(payload) < 10 or payload[3] not in (2, 3, 4) or any(b & 128 for b in payload[6:10]):
            raise ValueError("Invalid MP3 ID3 header.")
        tag_size = sum(value << shift for value, shift in zip(payload[6:10], (21, 14, 7, 0)))
        offset = 10 + tag_size + (10 if payload[3] == 4 and payload[5] & 16 else 0)
    frames = 0
    while offset < len(payload):
        if len(payload) - offset == 128 and payload[offset:offset + 3] == b"TAG":
            break
        if offset + 4 > len(payload):
            raise ValueError("Truncated MP3 frame header.")
        header = int.from_bytes(payload[offset:offset + 4], "big")
        version = (header >> 19) & 3
        layer = (header >> 17) & 3
        bitrate_index = (header >> 12) & 15
        rate_index = (header >> 10) & 3
        if (header >> 21 != 0x7ff or version == 1 or layer != 1
                or bitrate_index in (0, 15) or rate_index == 3):
            raise ValueError("Invalid MPEG Layer III frame.")
        rates = (44100, 48000, 32000)
        rate = rates[rate_index] // ({3: 1, 2: 2, 0: 4}[version])
        bitrates = ((0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320)
                    if version == 3 else (0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160))
        frame_size = (144000 if version == 3 else 72000) * bitrates[bitrate_index] // rate
        frame_size += (header >> 9) & 1
        if offset + frame_size > len(payload):
            raise ValueError("Truncated MP3 frame.")
        offset += frame_size
        frames += 1
    if not frames:
        raise ValueError("No MP3 audio frames found.")
    return frames


def validate_directory(directory, sample, voice):
    expected = set(SAMPLE_IDS if sample == "all" else (sample,))
    manifest_path = directory / "manifest.json"
    if manifest_path.is_symlink() or not manifest_path.is_file() or manifest_path.stat().st_size > 65536:
        raise ValueError("Missing or invalid narration manifest.")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    clips = {story_id: story_id + ".mp3" for story_id in expected}
    if (not isinstance(manifest, dict) or type(manifest.get("version")) is not int
            or manifest["version"] != 1 or manifest.get("voice") != voice
            or manifest.get("provider") != "Deepgram Flux" or manifest.get("clips") != clips):
        raise ValueError("Manifest does not match the requested stories and voice.")
    if {path.name for path in directory.iterdir()} != {"manifest.json", *clips.values()}:
        raise ValueError("Narration directory contains missing or unexpected files.")
    for filename in clips.values():
        path = directory / filename
        if path.is_symlink() or not path.is_file() or not 0 < path.stat().st_size <= MAX_AUDIO_BYTES:
            raise ValueError("Missing or invalid MP3 file.")
        validate_mp3(path.read_bytes())
    return len(clips)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--directory", type=Path, default=Path("site-narration-output/narration"))
    parser.add_argument("--sample", choices=("all", *SAMPLE_IDS), required=True)
    parser.add_argument("--voice", choices=VOICES, required=True)
    args = parser.parse_args()
    try:
        count = validate_directory(args.directory, args.sample, args.voice)
    except (OSError, ValueError) as error:
        sys.exit("Narration validation failed: " + str(error))
    print("Validated", count, "unpublished story associations and MPEG frame structures.")
    print("Decoding, pronunciation and naturalness still require separate audio review.")


if __name__ == "__main__":
    main()
