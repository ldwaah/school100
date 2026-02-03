#!/bin/bash

echo "🔍 Checking School100 folder for Netlify upload..."
echo ""

# Check for resources-files
if [ -d "public/resources-files" ]; then
    SIZE=$(du -sh public/resources-files | cut -f1)
    echo "✅ resources-files folder found ($SIZE)"
    
    # Count files
    FILE_COUNT=$(find public/resources-files -name "*.html" | wc -l | tr -d ' ')
    echo "   📄 Contains $FILE_COUNT HTML files"
else
    echo "❌ resources-files folder NOT FOUND!"
fi

# Check for manifest
if [ -f "public/resources-manifest.json" ]; then
    echo "✅ resources-manifest.json found"
else
    echo "❌ resources-manifest.json NOT FOUND!"
    echo "   Run: npm run generate-manifest"
fi

# Check for netlify config
if [ -f "netlify.toml" ]; then
    echo "✅ netlify.toml found"
else
    echo "❌ netlify.toml NOT FOUND!"
fi

# Check for functions
if [ -d "netlify/functions" ]; then
    FUNC_COUNT=$(ls netlify/functions/*.js 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ netlify/functions found ($FUNC_COUNT functions)"
else
    echo "❌ netlify/functions folder NOT FOUND!"
fi

echo ""
echo "📦 Ready to upload? Make sure all items show ✅"

