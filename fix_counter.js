const fs = require('fs');

const files = [
  './lib/portfolio/templates/motion-engineer/components/AnimatedCounter.tsx',
  './lib/portfolio/templates/engineer/components/AnimatedCounter.tsx',
  './lib/portfolio/templates/ai-developer/components/AnimatedCounter.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace:
  // const isInView = useInView(ref, { once: true, margin: "-40px" });
  content = content.replace(/const isInView = useInView\(ref[^\)]+\);/, 'const isInView = true;');
  
  fs.writeFileSync(file, content);
  console.log('Fixed AnimatedCounter in ' + file);
}
