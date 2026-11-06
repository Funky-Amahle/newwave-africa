"""Offline contract tests; all provider responses are mocked, never audible QA."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest import mock

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/generate_site_audio.py"
spec = importlib.util.spec_from_file_location("site_audio", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SiteAudioSmokeTests(unittest.TestCase):
    def run_generation(self, sample="s1", invalid=None, key="dummy-offline-key"):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "lib").mkdir()
            stories = [{"id": "s%d" % i, "sample": True, "title": "Fictional sample %d" % i,
                        "excerpt": "An invented story for an offline contract test."} for i in range(1, 9)]
            if invalid:
                stories[0].update(invalid)
            (root / "lib/sample-stories.json").write_text(json.dumps(stories), encoding="utf-8")
            destination = root / "output"
            response = mock.MagicMock()
            response.__enter__.return_value = response
            response.status = 200
            response.headers = {"Content-Type": "audio/mpeg"}
            response.read.return_value = b"ID3-offline-fixture-not-playable-audio"
            output = io.StringIO()
            with mock.patch.dict(os.environ, {"DEEPGRAM_API_KEY": key}, clear=True), \
                 mock.patch("sys.argv", [str(SCRIPT), "--sample", sample, "--output", str(destination)]), \
                 mock.patch.object(module, "ROOT", root), \
                 mock.patch.object(module.urllib.request, "urlopen", return_value=response) as request, \
                 contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
                error = None
                try:
                    module.main()
                except SystemExit as exc:
                    error = str(exc)
            artifacts = {p.name: p.read_bytes() for p in destination.glob("*")}
            return request.call_args_list, artifacts, output.getvalue(), error, stories

    def test_one_story_uses_only_fixed_sample_and_keeps_key_private(self):
        calls, files, output, error, stories = self.run_generation()
        self.assertIsNone(error)
        self.assertEqual(len(calls), 1)
        request = calls[0].args[0]
        self.assertEqual(request.full_url, "https://api.deepgram.com/v2/speak?model=flux-haley-en")
        self.assertEqual(request.get_method(), "POST")
        self.assertEqual(request.get_header("Authorization"), "Token dummy-offline-key")
        self.assertEqual(json.loads(request.data), {"text": stories[0]["title"] + ". " + stories[0]["excerpt"]})
        manifest = json.loads(files["manifest.json"])
        self.assertEqual(manifest["version"], 1)
        self.assertEqual(manifest["clips"], {"s1": "s1.mp3"})
        self.assertEqual(set(files), {"s1.mp3", "manifest.json"})
        self.assertNotIn("dummy-offline-key", output)
        for content in files.values():
            self.assertNotIn(b"dummy-offline-key", content)

    def test_eight_story_contract_without_provider_calls(self):
        calls, files, _, error, stories = self.run_generation(sample="all")
        self.assertIsNone(error)
        self.assertEqual(len(calls), 8)
        self.assertEqual([json.loads(call.args[0].data) for call in calls],
                         [{"text": story["title"] + ". " + story["excerpt"]} for story in stories])
        clips = json.loads(files["manifest.json"])["clips"]
        self.assertEqual(clips, {"s%d" % i: "s%d.mp3" % i for i in range(1, 9)})
        self.assertEqual(set(files), set(clips.values()) | {"manifest.json"})

    def test_missing_key_fails_before_network(self):
        calls, files, _, error, _ = self.run_generation(key="")
        self.assertEqual(calls, [])
        self.assertEqual(files, {})
        self.assertIn("secret is missing", error)

    def test_nonfictional_content_is_not_sent(self):
        calls, files, _, error, _ = self.run_generation(invalid={"sample": False})
        self.assertEqual(calls, [])
        self.assertEqual(files, {})
        self.assertIn("Refusing to send non-sample", error)

    def test_oversized_sample_is_not_sent(self):
        calls, files, _, error, _ = self.run_generation(invalid={"excerpt": "x" * 1201})
        self.assertEqual(calls, [])
        self.assertEqual(files, {})
        self.assertIn("safety cap", error)


if __name__ == "__main__":
    unittest.main()
