const fs = require('fs');

const filesToUpdate = [
  './lib/portfolio/templates/immersive-3d/components/Skills.tsx',
  './lib/portfolio/templates/immersive-3d/components/Projects.tsx',
  './lib/portfolio/templates/madhukar/components/Projects.tsx',
  './lib/portfolio/templates/madhukar/components/Skills.tsx',
  './lib/portfolio/templates/ai-v1/sections/Skills.tsx',
  './lib/portfolio/templates/modern-fullstack/components/Certifications.tsx'
];

for (const file of filesToUpdate) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Immersive-3D Skills
  content = content.replace(/g\.skills\.map\(\(s\)\s*=>\s*\(\s*<motion\.div\s*key=\{s\}/g, 'g.skills.map((s, idx) => (\n                      <motion.div\n                        key={idx}');
  
  // Immersive-3D Projects
  content = content.replace(/p\.tags\.map\(\(t\)\s*=>\s*\(\s*<span\s*key=\{t\}/g, 'p.tags.map((t, idx) => (\n                      <span key={idx}');

  // Madhukar Projects
  content = content.replace(/project\.tags\.map\(\(t\)\s*=>\s*\(\s*<span\s*key=\{t\}/g, 'project.tags.map((t, idx) => (\n                      <span\n                        key={idx}');

  // Madhukar Skills
  content = content.replace(/category\.items\.map\(\(item\)\s*=>\s*\(\s*<div\s*key=\{item\}/g, 'category.items.map((item, idx) => (\n                    <div\n                      key={idx}');

  // AI-v1 Skills
  content = content.replace(/group\.technologies\.map\(\(tech\)\s*=>\s*\(\s*<motion\.div\s*key=\{tech\}/g, 'group.technologies.map((tech, idx) => (\n                    <motion.div\n                      key={idx}');

  // Modern-Fullstack Certifications
  content = content.replace(/certifications\.map\(\(c,\s*i\)\s*=>\s*\(\s*<motion\.div\s*key=\{c\.name\}/g, 'certifications.map((c, i) => (\n          <motion.div\n            key={i}');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed keys in ' + file);
  }
}
