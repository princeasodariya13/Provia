const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'lib', 'portfolio', 'templates');
const dirs = fs.readdirSync(templatesDir).filter(d => fs.statSync(path.join(templatesDir, d)).isDirectory());

dirs.forEach(dir => {
  const stylePath = path.join(templatesDir, dir, 'style.css');
  if (!fs.existsSync(stylePath)) return;

  let content = fs.readFileSync(stylePath, 'utf8');
  const index = content.indexOf('/* --- Auto-generated Theme Override --- */');
  if (index !== -1) {
    fs.writeFileSync(stylePath, content.substring(0, index).trim() + '\n');
    console.log(`Reverted ${dir}/style.css`);
  }
});
