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

replaceFile('lib/portfolio/templates/ai-developer/components/BootSequence.tsx', [
  [/\.map\(\(line\)\s*=>/g, '.map((line, i) =>'],
  [/\.map\(line\s*=>/g, '.map((line, i) =>'],
  [/key=\{line\}/g, 'key={i}']
]);

replaceFile('lib/portfolio/templates/ai-developer/components/Stack.tsx', [
  [/\.map\(\(si\)\s*=>/g, '.map((si, i) =>'],
  [/\.map\(si\s*=>/g, '.map((si, i) =>'],
  [/key=\{si\}/g, 'key={i}']
]);

replaceFile('lib/portfolio/templates/editorial-v1/sections/Skills.tsx', [
  [/\.map\(\(s, j\)\s*=>/g, '.map((s, i) =>'], // wait, if it's already j, then key={j} is fine? But maybe it's mapping over strings and using j as the string?
  [/\.map\(\(s\)\s*=>/g, '.map((s, j) =>'],
  [/\.map\(s\s*=>/g, '.map((s, j) =>']
  // Actually, if key={j} is already there, maybe it's an index.
]);

replaceFile('lib/portfolio/templates/engineer/components/Process.tsx', [
  [/\.map\(\(t\)\s*=>/g, '.map((t, i) =>'],
  [/\.map\(t\s*=>/g, '.map((t, i) =>'],
  [/key=\{t\}/g, 'key={i}']
]);

replaceFile('lib/portfolio/templates/immersive-3d/components/Header.tsx', [
  [/\.map\(\(item\)\s*=>/g, '.map((item, i) =>'],
  [/\.map\(item\s*=>/g, '.map((item, i) =>'],
  [/key=\{item\}/g, 'key={i}']
]);

replaceFile('lib/portfolio/templates/modern-fullstack/components/Skills.tsx', [
  [/\.map\(\(si\)\s*=>/g, '.map((si, i) =>'],
  [/\.map\(si\s*=>/g, '.map((si, i) =>'],
  [/key=\{si\}/g, 'key={i}']
]);

