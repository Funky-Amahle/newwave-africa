"""Offline structural validation fixtures are not audible-quality evidence."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/validate_site_audio.py"
spec = importlib.util.spec_from_file_location("audio_validation", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
# MPEG-2 Layer III, 48 kbps, 24 kHz: one complete 144-byte frame.
FRAME = bytes.fromhex("fff364c4") + bytes(140)


class NarrationValidationTests(unittest.TestCase):
    def make_directory(self, root, sample="all"):
        ids = module.SAMPLE_IDS if sample == "all" else (sample,)
        manifest = {"version": 1, "provider": "Deepgram Flux", "voice": "flux-haley-en",
                    "clips": {story_id: story_id + ".mp3" for story_id in ids}}
        (root / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
        for filename in manifest["clips"].values():
            (root / filename).write_bytes(FRAME)
        return manifest

    def test_all_eight_manifest_and_files(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_directory(root)
            self.assertEqual(module.validate_directory(root, "all", "flux-haley-en"), 8)

    def test_swapped_association_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            manifest = self.make_directory(root)
            manifest["clips"].update({"s1": "s2.mp3", "s2": "s1.mp3"})
            (root / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "requested stories and voice"):
                module.validate_directory(root, "all", "flux-haley-en")

    def test_missing_extra_and_corrupt_files_are_rejected(self):
        for case in ("missing", "extra", "corrupt"):
            with self.subTest(case=case), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                self.make_directory(root, "s1")
                if case == "missing":
                    (root / "s1.mp3").unlink()
                elif case == "extra":
                    (root / "s2.mp3").write_bytes(FRAME)
                else:
                    (root / "s1.mp3").write_bytes(b"not audio")
                with self.assertRaises(ValueError):
                    module.validate_directory(root, "s1", "flux-haley-en")

    def test_mp3_frames_and_optional_id3_are_accepted(self):
        self.assertEqual(module.validate_mp3(FRAME * 2), 2)
        self.assertEqual(module.validate_mp3(b"ID3\x04\x00\x00\x00\x00\x00\x00" + FRAME), 1)

    def test_truncated_or_empty_audio_is_rejected(self):
        for payload in (b"", FRAME[:-1], b"ID3", FRAME + b"x"):
            with self.subTest(size=len(payload)), self.assertRaises(ValueError):
                module.validate_mp3(payload)


if __name__ == "__main__":
    unittest.main()
