const fs = require('fs');
const dir = './lib/portfolio/templates/premium-v1/sections/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(dir + file, 'utf8');
  let original = content;

  // Replace animate={inView ? { opacity: 1, x: 0 } : {}} with whileInView={{ ... }} viewport={{ once: true, margin: "-80px" }}
  content = content.replace(/animate=\{inView \? (\{[^}]+\}) : \{\}\}/g, 'whileInView={$1} viewport={{ once: true, margin: "-80px" }}');
  
  if (content !== original) {
    fs.writeFileSync(dir + file, content);
    console.log('Updated ' + file);
  }
}
