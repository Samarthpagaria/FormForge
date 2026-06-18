const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\HP\\Desktop\\Projects\\FormForge\\apps\\web\\components\\form-renderer\\modes';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  
  // Replace `field.type === "text" || field.type === "text"` with `field.type === "text"`
  content = content.replace(/field\.type === "text" \|\| field\.type === "text"/g, 'field.type === "text"');
  // Also `currentField?.type === "text" || currentField?.type === "text"`
  content = content.replace(/currentField\?\.type === "text" \|\| currentField\?\.type === "text"/g, 'currentField?.type === "text"');
  
  // Replace `field.type === "textarea" || field.type === "textarea"`
  content = content.replace(/field\.type === "textarea" \|\| field\.type === "textarea"/g, 'field.type === "textarea"');
  content = content.replace(/currentField\?\.type === "textarea" \|\| currentField\?\.type === "textarea"/g, 'currentField?.type === "textarea"');

  fs.writeFileSync(p, content);
});

console.log("Done deduplicating");
