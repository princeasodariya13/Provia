const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.tsx')) results.push(file);
  });
  return results;
}

const files = walk('C:/Users/Prince/Desktop/Provia/Provia/my-app/lib/portfolio/templates');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<EmptyState') && !content.includes('EmptyState } from')) {
    content = content.replace(/(import .*?;)/, `$1\nimport { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";`);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added EmptyState to', file);
  }
});
