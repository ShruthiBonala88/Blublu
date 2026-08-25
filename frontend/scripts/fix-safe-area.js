const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('SafeAreaView')) {
        let changed = false;
        
        // Remove SafeAreaView from react-native imports
        const rnImportMatch = content.match(/import\s*\{([^}]*)\}\s*from\s*['"]react-native['"]/);
        if (rnImportMatch && rnImportMatch[1].includes('SafeAreaView')) {
          const items = rnImportMatch[1]
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0 && s !== 'SafeAreaView');
          
          let replacement = '';
          if (items.length > 0) {
            replacement = `import {\n  ${items.join(',\n  ')},\n} from 'react-native'`;
          }
          
          content = content.replace(rnImportMatch[0], replacement);
          changed = true;
        }

        // Add SafeAreaView from react-native-safe-area-context
        const safeAreaMatch = content.match(/import\s*\{([^}]*)\}\s*from\s*['"]react-native-safe-area-context['"]/);
        if (safeAreaMatch) {
          if (!safeAreaMatch[1].includes('SafeAreaView')) {
            const items = safeAreaMatch[1]
              .split(',')
              .map(s => s.trim())
              .filter(s => s.length > 0);
            items.unshift('SafeAreaView');
            const safeReplacement = `import { ${items.join(', ')} } from 'react-native-safe-area-context'`;
            content = content.replace(safeAreaMatch[0], safeReplacement);
            changed = true;
          }
        } else if (changed) {
          content = `import { SafeAreaView } from 'react-native-safe-area-context';\n` + content;
        }

        if (changed) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log('Fixed:', entry.name);
        }
      }
    }
  }
}

const srcDir = path.join(__dirname, '..', 'src');
processDir(srcDir);
console.log('Done migrating SafeAreaView imports!');
