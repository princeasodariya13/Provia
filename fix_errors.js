const fs = require('fs');

function replaceFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  let original = content;
  for (const [from, to] of replacements) {
    content = content.replace(from, to);
  }
  if (content !== original) {
    fs.writeFileSync(path, content);
    console.log('Fixed', path);
  }
}

// 1. ai-developer Stack.tsx
replaceFile('lib/portfolio/templates/ai-developer/components/Stack.tsx', [
  [/(group\.items\.map\(\(skill: string, si: number\) => \([\s\S]*?)key=\{i\}/g, '$1key={si}']
]);

// 2. immersive-3d Skills.tsx
let imm3d = fs.readFileSync('lib/portfolio/templates/immersive-3d/components/Skills.tsx', 'utf8');
imm3d = imm3d.replace(/map\(\(s, j\)([\s\S]*?)key=\{i\}/g, 'map((s, j)$1key={j}');
fs.writeFileSync('lib/portfolio/templates/immersive-3d/components/Skills.tsx', imm3d);

// 3. modern-fullstack Skills.tsx
let mfs = fs.readFileSync('lib/portfolio/templates/modern-fullstack/components/Skills.tsx', 'utf8');
mfs = mfs.replace(/items\.map\(\(si, i\)/g, 'items.map((skillItem, itemIndex)');
mfs = mfs.replace(/key=\{i\}\s*className="flex items-center gap-3/g, 'key={itemIndex}\nclassName="flex items-center gap-3');
fs.writeFileSync('lib/portfolio/templates/modern-fullstack/components/Skills.tsx', mfs);

// 4. premium-v1 Skills.tsx
replaceFile('lib/portfolio/templates/premium-v1/sections/Skills.tsx', [
  [/<SkillGroup key=\{i\} group=\{group\} groupIndex=\{gi\} \/>/g, '<SkillGroup key={gi} group={group} groupIndex={gi} />'],
  [/<motion\.div key=\{i\} variants=\{item\}/g, '<motion.div key={si} variants={item}']
]);

// 5. modern Header.tsx
replaceFile('lib/portfolio/templates/modern/components/Header.tsx', [
  [/\.map\(\(s: any\) => \(/g, '.map((s: any, i: number) => (']
]);

console.log("Done");
