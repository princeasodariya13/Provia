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
let totalErrors = 0;

for (const file of allTsx) {
  let content = fs.readFileSync(file, 'utf8');

  const badKeys = content.match(/key=\{([a-zA-Z0-9_]+\.(name|title|id|url|company|institution|category)|[a-zA-Z0-9_]+)\}/g);
  
  if (badKeys) {
     const reallyBadKeys = badKeys.filter(k => 
       !k.includes('{i}') && 
       !k.includes('{idx}') && 
       !k.includes('{index}') && 
       !k.includes('{ti}') && 
       !k.includes('{imgIdx}') && 
       !k.includes('{step}') && 
       !k.includes('{word}') && 
       !k.includes('{ci}') && 
       !k.includes('{theme}') && 
       !k.includes('{stat.label}') && 
       !k.includes('{item.title}') && 
       !k.includes('{feature}') && 
       !k.includes('{milestone.year}')
     );
     if (reallyBadKeys.length > 0) {
        console.log(file, reallyBadKeys);
        totalErrors += reallyBadKeys.length;
     }
  }
}
console.log('Total potential bad keys:', totalErrors);
