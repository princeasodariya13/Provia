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
  if (!file.includes('Certifications')) continue;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace c.url with c.credentialUrl if it's used for certificates
  content = content.replace(/c\.url/g, 'c.credentialUrl');
  content = content.replace(/cert\.url/g, 'cert.credentialUrl');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed c.url in ' + file);
  }
}
