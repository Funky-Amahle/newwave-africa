"""Offline tests for the Deepgram video narration partitioner."""
import ast
import contextlib
import importlib.util
import io
import json
import os
import pathlib
import tempfile
import unittest
from unittest import mock

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

    def test_no_external_process_dependency(self):
        tree = ast.parse(SCRIPT.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                self.assertNotIn("subprocess", [item.name.split(".")[0] for item in node.names])
            elif isinstance(node, ast.ImportFrom):
                self.assertNotEqual((node.module or "").split(".")[0], "subprocess")
            elif isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                if isinstance(node.func.value, ast.Name) and node.func.value.id == "os":
                    self.assertFalse(node.func.attr.startswith(("spawn", "exec")))
                    self.assertNotIn(node.func.attr, {"system", "popen"})

    def test_generation_keeps_secret_out_of_logs_and_artifacts(self):
        secret = "dummy-offline-key-not-a-real-credential"
        payload = b"ID3-offline-audio-fixture"
        output = io.StringIO()
        response = mock.MagicMock()
        response.__enter__.return_value = response
        response.status = 200
        response.headers = {"Content-Type": "audio/mpeg"}
        response.read.return_value = payload
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            script = root / "narration.txt"
            script.write_text("A fictional story. Another sentence!", encoding="utf-8")
            destination = root / "output"
            with mock.patch.dict(os.environ, {"DEEPGRAM_API_KEY": secret}, clear=True), \
                 mock.patch("sys.argv", [str(SCRIPT), "--video", "vision", "--output-dir", str(destination)]), \
                 mock.patch.object(module, "SCRIPTS", {"vision": script}), \
                 mock.patch.object(module.urllib.request, "urlopen", return_value=response) as request, \
                 contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
                module.main()
            self.assertEqual(request.call_count, 1)
            sent = request.call_args.args[0]
            self.assertEqual(sent.get_header("Authorization"), "Token " + secret)
            self.assertEqual(json.loads(sent.data), {"text": script.read_text(encoding="utf-8")})
            manifest = json.loads((destination / "segments.json").read_text(encoding="utf-8"))
            self.assertEqual(manifest["segments"], [{"file": "vision-flux-haley-en-01.mp3", "text": script.read_text(encoding="utf-8")}])
            self.assertEqual((destination / manifest["segments"][0]["file"]).read_bytes(), payload)
            self.assertNotIn(secret, output.getvalue())
            for artifact in destination.iterdir():
                self.assertNotIn(secret.encode(), artifact.read_bytes())


if __name__ == "__main__":
    unittest.main()
