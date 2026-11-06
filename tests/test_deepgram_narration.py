"""Offline tests for the Deepgram video narration partitioner."""
import importlib.util
import pathlib
import unittest

SCRIPT = pathlib.Path(__file__).resolve().parents[1] / "scripts/generate_deepgram_narration.py"
spec = importlib.util.spec_from_file_location("deepgram_narration", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class NarrationChunksTests(unittest.TestCase):
    def test_no_empty_segments(self):
        self.assertEqual(module.chunks(""), [])
        self.assertEqual(module.chunks("  Hello.   World! "), ["Hello. World!"])

    def test_segments_respect_limit(self):
        text = "This is a short sentence. " * 200
        pieces = module.chunks(text, limit=120)
        self.assertGreater(len(pieces), 1)
        self.assertTrue(all(0 < len(part) <= 120 for part in pieces))
        self.assertEqual(" ".join(pieces), " ".join(text.split()))

    def test_long_unbroken_word(self):
        pieces = module.chunks("x" * 300, limit=100)
        self.assertEqual([len(p) for p in pieces], [100, 100, 100])

    def test_no_secret_in_outputs(self):
        content = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn("print(key)", content)
        self.assertNotIn("ffmpeg", content)


if __name__ == "__main__":
    unittest.main()
