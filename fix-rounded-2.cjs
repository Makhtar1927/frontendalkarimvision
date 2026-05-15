const fs = require('fs');
const path = require('path');
function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if ((line.includes('<button') || line.includes('<input') || line.includes('<select')) && line.includes('rounded-2xl')) {
          lines[i] = line.replace(/rounded-2xl/g, 'rounded-full');
          changed = true;
        } else if (line.includes('className') && line.includes('rounded-2xl')) {
          if ((i > 0 && (lines[i-1].includes('<button') || lines[i-1].includes('<input') || lines[i-1].includes('<select'))) ||
              (i > 1 && (lines[i-2].includes('<button') || lines[i-2].includes('<input') || lines[i-2].includes('<select')))) {
            lines[i] = line.replace(/rounded-2xl/g, 'rounded-full');
            changed = true;
          }
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, lines.join('\n'));
        console.log('Updated ' + fullPath);
      }
    }
  }
}
walk('./src');
