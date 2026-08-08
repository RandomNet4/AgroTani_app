const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'prisma', 'seed.ts');
let content = fs.readFileSync(seedPath, 'utf8');

let lines = content.split('\n');
let newLines = [];
let inObject = false;
let currentObjectLines = [];
let hasPermintaanGudang = false;
let objectBraces = 0;

for (let line of lines) {
  // If we are not in an object and we see "  {"
  if (!inObject && line.match(/^  \{$/)) {
    inObject = true;
    currentObjectLines = [line];
    hasPermintaanGudang = false;
    objectBraces = 1;
  } else if (inObject) {
    currentObjectLines.push(line);
    
    // Check if line contains "Permintaan Gudang"
    if (line.includes('Permintaan Gudang')) {
      hasPermintaanGudang = true;
    }
    
    // Track braces to handle nested objects inside the top-level object
    // For every { increase, for every } decrease
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    objectBraces += openBraces - closeBraces;
    
    // If braces hit 0, we've closed the main object
    if (objectBraces === 0) {
      inObject = false;
      if (!hasPermintaanGudang) {
        newLines.push(...currentObjectLines);
      }
    }
  } else {
    newLines.push(line);
  }
}

fs.writeFileSync(seedPath, newLines.join('\n'), 'utf8');
console.log('Successfully cleaned seed.ts from Permintaan Gudang data.');
