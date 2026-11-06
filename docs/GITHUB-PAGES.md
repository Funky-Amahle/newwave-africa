# GitHub Pages Deployment

Public URL after a successful deployment: https://funky-amahle.github.io/newwave-africa/

1. Merge the deployment pull request into main.
2. In repository Settings > Pages > Build and deployment, choose **GitHub Actions** as source.
3. In Actions, run **Deploy NewWave Africa to GitHub Pages** if it does not start automatically.
4. Check build and deployment jobs; open the URL and verify CSS, navigation, discovery, local submission and dashboard on mobile.

The workflow runs Next.js with GITHUB_PAGES=true, output: export, basePath /newwave-africa, and uploads out/. The API route is excluded from the static export and client-side categorization uses transparent keyword rules. This is NOT OpenAI classification and does not publicly publish stories. Data is saved in the visitor's local browser only. No OPENAI_API_KEY is needed or supported on GitHub Pages.

To restore server-backed AI categorization, deploy Next.js to a server-capable host and reintroduce the API client flow separately. Never put an API key in NEXT_PUBLIC_ variables or frontend source.
