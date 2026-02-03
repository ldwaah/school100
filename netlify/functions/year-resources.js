const fs = require('fs');
const path = require('path');

// Load manifest (generated at build time)
function loadManifest() {
    try {
        // Try multiple possible paths for Netlify
        const possiblePaths = [
            path.join(__dirname, '..', '..', 'public', 'resources-manifest.json'),
            path.join(process.cwd(), 'public', 'resources-manifest.json'),
            path.join('/opt', 'buildhome', 'repo', 'public', 'resources-manifest.json')
        ];
        
        for (const manifestPath of possiblePaths) {
            if (fs.existsSync(manifestPath)) {
                return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            }
        }
        
        // Fallback: return empty manifest
        return { counts: {}, resources: {} };
    } catch (error) {
        console.error('Error loading manifest:', error);
        return { counts: {}, resources: {} };
    }
}

exports.handler = async (event, context) => {
    // Handle CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            body: ''
        };
    }
    
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ success: false, message: 'Method not allowed' })
        };
    }
    
    try {
        const manifest = loadManifest();
        const yearGroup = event.queryStringParameters?.yearGroup || event.pathParameters?.yearGroup;
        
        // If no year group specified, return counts for all years
        if (!yearGroup) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ success: true, counts: manifest.counts || {} })
            };
        }
        
        // Get resources for specific year group
        const subjects = manifest.resources[yearGroup] || [];
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ success: true, subjects })
        };
    } catch (error) {
        console.error('Error loading year resources:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: error.message || 'Error loading resources'
            })
        };
    }
};

