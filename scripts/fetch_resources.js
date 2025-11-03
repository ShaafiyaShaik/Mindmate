const http = require('http');
const port = process.env.PORT || 3001;
const urls = [
  `http://localhost:${port}/resources/res_meditation_guide`,
  `http://localhost:${port}/resources/res_breathing_exercises`,
  `http://localhost:${port}/resources/res_focus_tips`
];

(async function() {
  for (const u of urls) {
    console.log('\nFetching', u);
    await new Promise(resolve => {
      http.get(u, res => {
        let data = '';
        res.on('data', c => data += c.toString());
        res.on('end', () => {
          console.log('Status:', res.statusCode, 'Length:', data.length);
          const hasAI = data.includes('AI Overview') || data.includes('AI Overview') || data.includes('AI Overview'.toLowerCase());
          console.log('Contains AI Overview marker?', hasAI);
          const snippet = data.slice(0, 1200);
          console.log('Snippet:\n', snippet);
          resolve();
        });
      }).on('error', e => {
        console.error('Request error:', e.message);
        resolve();
      });
    });
    // wait a second between requests
    await new Promise(r => setTimeout(r, 1000));
  }
})();
