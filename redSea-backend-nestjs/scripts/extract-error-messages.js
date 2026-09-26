const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (p.endsWith('.ts')) files.push(p);
  }
  return files;
}

const msgs = new Set();
const re = /throw new \w+Exception\(\s*[`'"]([^`'"]+)[`'"]/g;

for (const file of walk(path.join(__dirname, '../src'))) {
  const s = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = re.exec(s))) {
    msgs.add(m[1]);
  }
}

console.log(JSON.stringify([...msgs].sort(), null, 2));
console.error('count', msgs.size);
