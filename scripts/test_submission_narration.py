import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest import mock

SPEC = importlib.util.spec_from_file_location('submission', Path(__file__).with_name('generate_submission_narration.py'))
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)
NARRATION = Path(__file__).parent / 'narration'
if not NARRATION.is_dir():
    NARRATION = MODULE.ROOT / 'docs/video/narration'


class SubmissionNarrationTests(unittest.TestCase):
    def test_both_fixed_scripts_produce_twelve_associated_secret_free_sections(self):
        for video in ('vision', 'technical'):
            with self.subTest(video=video), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                source = root / 'docs/video/narration'
                source.mkdir(parents=True)
                text = (NARRATION / (video + '.txt')).read_text()
                (source / (video + '.txt')).write_text(text)
                destination = root / 'audio'
                response = mock.MagicMock()
                response.__enter__.return_value = response
                response.status = 200
                response.headers = {'Content-Type': 'audio/mpeg'}
                response.read.return_value = b'ID3-offline-fixture'
                output = io.StringIO()
                with mock.patch.dict(os.environ, {'DEEPGRAM_API_KEY': 'dummy-secret'}, clear=True), \
                     mock.patch('sys.argv', ['submission', '--video', video, '--output-dir', str(destination)]), \
                     mock.patch.object(MODULE, 'ROOT', root), \
                     mock.patch.object(MODULE.urllib.request, 'urlopen', return_value=response) as calls, \
                     contextlib.redirect_stdout(output):
                    MODULE.main()
                paragraphs = text.strip().split('\n\n')
                self.assertEqual(calls.call_count, 12)
                self.assertEqual([json.loads(call.args[0].data)['text'] for call in calls.call_args_list], paragraphs)
                self.assertTrue(all(call.args[0].full_url == 'https://api.deepgram.com/v2/speak?model=flux-haley-en&encoding=mp3' for call in calls.call_args_list))
                self.assertTrue(all(call.args[0].get_header('Authorization') == 'Token dummy-secret' for call in calls.call_args_list))
                response.read.assert_called_with(10_000_001)
                manifest = json.loads((destination / 'segments.json').read_text())
                self.assertEqual(manifest['voice'], 'flux-haley-en')
                self.assertEqual(manifest['video'], video)
                self.assertEqual([s['text'] for s in manifest['segments']], paragraphs)
                for section in manifest['segments']:
                    self.assertEqual((destination / section['file']).read_bytes(), b'ID3-offline-fixture')
                self.assertNotIn('dummy-secret', output.getvalue())
                for artifact in destination.iterdir():
                    self.assertNotIn(b'dummy-secret', artifact.read_bytes())

    def test_missing_key_fails_before_requests(self):
        with mock.patch.dict(os.environ, {}, clear=True), \
             mock.patch('sys.argv', ['submission', '--video', 'vision', '--output-dir', 'unused']), \
             mock.patch.object(MODULE.urllib.request, 'urlopen') as request:
            with self.assertRaises(SystemExit): MODULE.main()
            request.assert_not_called()

    def test_oversized_late_section_fails_before_requests(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'docs/video/narration'
            source.mkdir(parents=True)
            (source / 'vision.txt').write_text('Valid first section.\n\n' + 'x' * 1201)
            with mock.patch.dict(os.environ, {'DEEPGRAM_API_KEY':'dummy-secret'}, clear=True), \
                 mock.patch('sys.argv', ['submission', '--video', 'vision', '--output-dir', str(root / 'audio')]), \
                 mock.patch.object(MODULE, 'ROOT', root), \
                 mock.patch.object(MODULE.urllib.request, 'urlopen') as request:
                with self.assertRaises(SystemExit): MODULE.main()
                request.assert_not_called()


if __name__ == '__main__':
    unittest.main()
