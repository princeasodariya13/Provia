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

    // Simple heuristic: if it destructures variables from useTemplateData(), we inject a check.
    if (content.includes('useTemplateData()') && content.includes('return (')) {
      const isExperience = file.toLowerCase().includes('experience');
      const isProjects = file.toLowerCase().includes('projects');
      const isSkills = file.toLowerCase().includes('skills');
      const isEducation = file.toLowerCase().includes('education');
      const isCertifications = file.toLowerCase().includes('cert');
      
      let check = '';
      if (isExperience) check = 'if (!experience || experience.length === 0) return null;';
      else if (isProjects) check = 'if (!projects || projects.length === 0) return null;';
      else if (isSkills) check = 'if ((!skills || skills.length === 0) && (!stack || stack.length === 0)) return null;';
      else if (isEducation) check = 'if (!education || education.length === 0) return null;';
      else if (isCertifications) check = 'if (!certifications || certifications.length === 0) return null;';
      
      if (check && !content.includes(check)) {
        content = content.replace(/return \(/, check + '\n  return (');
        fs.writeFileSync(filePath, content);
      }
    }
  });
}

const templates = fs.readdirSync(templatesDir);
templates.forEach(t => {
  const stat = fs.statSync(path.join(templatesDir, t));
  if (stat.isDirectory()) {
    processTemplate(t);
  }
});
console.log('Injected conditional rendering');
