const fs = require('fs');
const path = require('path');

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
        // In Netlify, files are in the publish directory (public)
        const resourcesPath = path.join(__dirname, '..', '..', 'public', 'resources-files');
        const resources = [];
        
        // Scan all resource directories
        const subjects = ['english', 'maths', 'sport', 'trust'];
        const categories = {
            english: ['reading', 'writing', 'vocabulary-spag'],
            maths: ['practice', 'error-spotting'],
            sport: ['academic', 'assessment'],
            trust: ['employability']
        };
        
        subjects.forEach(subject => {
            categories[subject].forEach(category => {
                const categoryPath = path.join(resourcesPath, subject, category);
                
                if (fs.existsSync(categoryPath)) {
                    const files = fs.readdirSync(categoryPath);
                    
                    files.forEach(file => {
                        if (file !== '.DS_Store' && !file.startsWith('.')) {
                            const filePath = path.join(categoryPath, file);
                            const stats = fs.statSync(filePath);
                            
                            resources.push({
                                id: `${subject}-${category}-${file}`,
                                subject: subject,
                                category: category,
                                filename: `${subject}/${category}/${file}`,
                                title: file.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
                                description: '',
                                size: stats.size,
                                createdAt: stats.birthtime
                            });
                        }
                    });
                }
            });
        });
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ success: true, resources: resources })
        };
    } catch (error) {
        console.error('Error loading resources:', error);
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

