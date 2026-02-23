const fs = require('fs');
const path = require('path');

const RESOURCES_DIR = path.join(__dirname, '..', 'public', 'resources-files');
const SCRIPT_TAG = '<script src="../../resource-common.js"></script>\n</body>';

function addScriptToFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('resource-common.js')) return false;
    if (!content.includes('</body>')) return false;
    content = content.replace('</body>', SCRIPT_TAG);
    fs.writeFileSync(filePath, content);
    return true;
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    let count = 0;
    for (const f of files) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) {
            const sub = path.relative(RESOURCES_DIR, full);
            const depth = sub.split(path.sep).length;
            const prefix = depth === 2 ? '../' : depth === 1 ? '../../' : '../../../';
            // Each file is in Year-X/Subject/file.html so from there ../../resource-common.js
            count += walk(full);
        } else if (f.endsWith('.html')) {
            if (addScriptToFile(full)) count++;
        }
    }
    return count;
}

const n = walk(RESOURCES_DIR);
console.log('Added resource-common.js script to', n, 'files');
