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

  // Pattern: animate={inView ? "show" : "hidden"} -> whileInView="show" viewport={{ once: true, margin: "-40px" }}
  content = content.replace(/animate=\{([a-zA-Z0-9_]+)\s*\?\s*"show"\s*:\s*"hidden"\}/g, 'whileInView="show" viewport={{ once: true, margin: "-40px" }}');
  
  // Pattern: animate={inView ? "visible" : "hidden"} -> whileInView="visible" viewport={{ once: true, margin: "-40px" }}
  content = content.replace(/animate=\{([a-zA-Z0-9_]+)\s*\?\s*"visible"\s*:\s*"hidden"\}/g, 'whileInView="visible" viewport={{ once: true, margin: "-40px" }}');

  // Find things like animate={inView ? { opacity: 1, y: 0 } : {}} -> whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
  content = content.replace(/animate=\{([a-zA-Z0-9_]+)\s*\?\s*(\{[^}]+\})\s*:\s*(?:\{\s*\}|"hidden")\}/g, 'whileInView={$2} viewport={{ once: true, margin: "-40px" }}');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed inView in ' + file);
  }
}
