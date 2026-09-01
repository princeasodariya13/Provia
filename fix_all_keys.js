const fs = require('fs');
const path = require('path');

function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findTsxFiles(filePath, fileList);
    } else if (filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allTsx = findTsxFiles('./lib/portfolio/templates');

for (const file of allTsx) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Add index 'i' to maps that only have one argument
  content = content.replace(/\.map\(\s*([a-zA-Z0-9_]+)\s*=>/g, '.map(($1, i) =>');
  content = content.replace(/\.map\(\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*=>/g, '.map(($1, i) =>');

  // Replace bad keys with i
  content = content.replace(/key=\{[a-zA-Z0-9_]+\.title\}/g, 'key={i}');
  content = content.replace(/key=\{[a-zA-Z0-9_]+\.name\}/g, 'key={i}');
  content = content.replace(/key=\{[a-zA-Z0-9_]+\.url\}/g, 'key={i}');
  content = content.replace(/key=\{p\.title\}/g, 'key={i}');
  
  if (file.includes('immersive-3d')) {
     content = content.replace(/key=\{s\}/g, 'key={i}');
     content = content.replace(/key=\{t\}/g, 'key={i}');
  }
  
  if (file.includes('madhukar')) {
     content = content.replace(/key=\{item\}/g, 'key={i}');
     content = content.replace(/key=\{t\}/g, 'key={i}');
  }

  if (file.includes('modern')) {
     content = content.replace(/key=\{group\}/g, 'key={i}');
     content = content.replace(/key=\{s\}/g, 'key={i}');
  }
  
  if (file.includes('motion-engineer')) {
     content = content.replace(/key=\{c\.title\}/g, 'key={i}');
  }
  
  if (file.includes('premium-v1')) {
     content = content.replace(/key=\{si\}/g, 'key={i}');
     content = content.replace(/key=\{gi\}/g, 'key={i}');
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed bad keys in ' + file);
  }
}
