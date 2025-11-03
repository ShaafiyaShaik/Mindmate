const http = require('http');
const urls = [
  'http://localhost:3000/resources/res_meditation_guide',
  'http://localhost:3000/resources/res_breathing_exercises',
  'http://localhost:3000/resources/res_focus_tips'
];

urls.forEach(u => {
  http.get(u, res => {
    console.log(u, res.statusCode);
    let data = '';
    res.on('data', c => data += c.toString());
    res.on('end', () => {
      console.log('length', data.length);
      console.log(data.slice(0, 300));
    });
  }).on('error', e => console.error('error', e.message));
});
