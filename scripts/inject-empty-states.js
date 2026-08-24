const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'lib', 'portfolio', 'templates');

function processTemplate(folder) {
  const componentsDir = path.join(templatesDir, folder, 'components');
  if (!fs.existsSync(componentsDir)) return;

  const files = fs.readdirSync(componentsDir);
  files.forEach(file => {
    if (!file.endsWith('.tsx') && !file.endsWith('.jsx')) return;
    
    let filePath = path.join(componentsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let modified = false;

    // Check for the previously injected statements
    const expRegex = /if \(\!experience \|\| experience\.length === 0\) return null;/g;
    const projRegex = /if \(\!projects \|\| projects\.length === 0\) return null;/g;
    const skillsRegex = /if \(\(\!skills \|\| skills\.length === 0\) && \(\!stack \|\| stack\.length === 0\)\) return null;/g;
    const eduRegex = /if \(\!education \|\| education\.length === 0\) return null;/g;
    const certRegex = /if \(\!certifications \|\| certifications\.length === 0\) return null;/g;

    const replaceWithState = (type) => 'if (true) {\\n' +
    '  const isMissing = ' + (type === 'skills' ? '(!skills || skills.length === 0) && (!stack || stack.length === 0)' : '(!' + type + ' || ' + type + '.length === 0)') + ';\\n' +
    '  if (isMissing) {\\n' +
    '    return (\\n' +
    '      <section className="py-24 px-6 md:px-12 w-full max-w-7xl mx-auto opacity-80">\\n' +
    '        <EmptyState type="' + (type === 'certifications' ? 'certifications' : type) + '" />\\n' +
    '      </section>\\n' +
    '    );\\n' +
    '  }\\n' +
    '}';

    if (content.match(expRegex)) {
      content = content.replace(expRegex, replaceWithState('experience'));
      modified = true;
    }
    if (content.match(projRegex)) {
      content = content.replace(projRegex, replaceWithState('projects'));
      modified = true;
    }
    if (content.match(skillsRegex)) {
      content = content.replace(skillsRegex, replaceWithState('skills'));
      modified = true;
    }
    if (content.match(eduRegex)) {
      content = content.replace(eduRegex, replaceWithState('education'));
      modified = true;
    }
    if (content.match(certRegex)) {
      content = content.replace(certRegex, replaceWithState('certifications'));
      modified = true;
    }

    if (modified) {
      // Inject import if not exists
      if (!content.includes('EmptyState')) {
        // Find last import
        const lines = content.split('\\n');
        let lastImportIdx = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            lastImportIdx = i;
          }
        }
        if (lastImportIdx !== -1) {
          lines.splice(lastImportIdx + 1, 0, 'import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";');
        } else {
          lines.unshift('import { EmptyState } from "@/lib/portfolio/templates/shared/EmptyState";');
        }
        content = lines.join('\\n');
      }
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + folder + '/' + file);
    }
  });
}

const templates = fs.readdirSync(templatesDir);
templates.forEach(t => {
  const stat = fs.statSync(path.join(templatesDir, t));
  if (stat.isDirectory() && t !== 'shared' && t !== 'utils') {
    processTemplate(t);
  }
});
console.log('Injected Empty States');
