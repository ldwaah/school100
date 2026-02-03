#!/usr/bin/env node

/**
 * Quick deployment readiness test
 * Run this before deploying to Netlify to catch common issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing deployment readiness...\n');

let errors = [];
let warnings = [];

// Check 1: netlify.toml exists
console.log('✓ Checking netlify.toml...');
if (!fs.existsSync('netlify.toml')) {
    errors.push('❌ netlify.toml is missing!');
} else {
    console.log('  ✓ netlify.toml found');
}

// Check 2: Functions directory exists
console.log('\n✓ Checking Netlify functions...');
const functionsDir = path.join('netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
    errors.push('❌ netlify/functions directory is missing!');
} else {
    console.log('  ✓ Functions directory found');
    const functions = fs.readdirSync(functionsDir).filter(f => f.endsWith('.js'));
    console.log(`  ✓ Found ${functions.length} function(s): ${functions.join(', ')}`);
}

// Check 3: Public directory exists
console.log('\n✓ Checking public directory...');
if (!fs.existsSync('public')) {
    errors.push('❌ public directory is missing!');
} else {
    console.log('  ✓ Public directory found');
    
    // Check key files
    const requiredFiles = ['index.html', 'app.js', 'styles.css'];
    requiredFiles.forEach(file => {
        if (fs.existsSync(path.join('public', file))) {
            console.log(`  ✓ ${file} found`);
        } else {
            warnings.push(`⚠️  ${file} is missing (may be optional)`);
        }
    });
}

// Check 4: Resources manifest
console.log('\n✓ Checking resources manifest...');
const manifestPath = path.join('public', 'resources-manifest.json');
if (fs.existsSync(manifestPath)) {
    console.log('  ✓ resources-manifest.json found');
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const totalResources = Object.values(manifest.counts || {}).reduce((a, b) => a + b, 0);
        console.log(`  ✓ Manifest contains ${totalResources} resources`);
    } catch (e) {
        warnings.push('⚠️  resources-manifest.json exists but is invalid JSON');
    }
} else {
    warnings.push('⚠️  resources-manifest.json not found (will be generated during build)');
}

// Check 5: Package.json dependencies
console.log('\n✓ Checking dependencies...');
if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['googleapis', 'busboy'];
    requiredDeps.forEach(dep => {
        if (pkg.dependencies && pkg.dependencies[dep]) {
            console.log(`  ✓ ${dep} is in dependencies`);
        } else {
            errors.push(`❌ ${dep} is missing from dependencies!`);
        }
    });
}

// Check 6: Build command
console.log('\n✓ Checking build configuration...');
if (fs.existsSync('netlify.toml')) {
    const toml = fs.readFileSync('netlify.toml', 'utf8');
    if (toml.includes('npm install')) {
        console.log('  ✓ Build command includes npm install');
    } else {
        warnings.push('⚠️  Build command may not install dependencies');
    }
    if (toml.includes('generate-manifest')) {
        console.log('  ✓ Build command includes manifest generation');
    }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 SUMMARY\n');

if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed! Ready to deploy.\n');
    console.log('Next steps:');
    console.log('1. Set environment variables in Netlify dashboard');
    console.log('2. Deploy via Git or drag & drop');
    console.log('3. Check deployment logs if issues occur\n');
    process.exit(0);
} else {
    if (errors.length > 0) {
        console.log('❌ ERRORS (must fix before deployment):');
        errors.forEach(err => console.log(`  ${err}`));
        console.log('');
    }
    
    if (warnings.length > 0) {
        console.log('⚠️  WARNINGS (may cause issues):');
        warnings.forEach(warn => console.log(`  ${warn}`));
        console.log('');
    }
    
    if (errors.length > 0) {
        console.log('❌ Deployment not ready. Please fix errors above.\n');
        process.exit(1);
    } else {
        console.log('⚠️  Deployment may work, but review warnings above.\n');
        process.exit(0);
    }
}

