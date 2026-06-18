const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\HP\\Desktop\\Projects\\FormForge\\apps\\web\\components\\form-renderer\\modes';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/"short_text"/g, '"text"');
  content = content.replace(/"long_text"/g, '"textarea"');
  content = content.replace(/"dropdown"/g, '"select"');
  fs.writeFileSync(p, content);
});

console.log("Done replacing in modes");
