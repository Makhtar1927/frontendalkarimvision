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
      
      // We will look for className="..." containing rounded-2xl and replace it with rounded-full
      // but only if it's on a button, input, or select element.
      // A simpler regex: find <button ... rounded-2xl ...>
      // Because regex on HTML can be tricky, let's just globally replace rounded-2xl with rounded-full
      // inside className="..." ONLY if the line contains <button, <input, or <select
      
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if ((line.includes('<button') || line.includes('<input') || line.includes('<select') || line.includes('className=')) && line.includes('rounded-2xl')) {
          // If the line has 'rounded-2xl', we might want to change it. 
          // Wait, 'className' could be on a separate line from '<button'.
          // Let's just find and replace rounded-2xl globally in these files if we know they are mostly buttons/inputs.
          // BUT wait, cards shouldn't be rounded-full! Cards use rounded-2xl.
        }
      }
    }
  }
}
