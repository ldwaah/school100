require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Serve resources files
app.use('/resources/files', express.static(path.join(__dirname, 'public', 'resources-files')));


// API endpoint to get resources list
app.get('/api/resources', (req, res) => {
    const resourcesPath = path.join(__dirname, 'public', 'resources-files');
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
    
    res.json({ success: true, resources: resources });
});

// Get year group resource counts
app.get('/api/year-resources', (req, res) => {
    const resourcesPath = path.join(__dirname, 'public', 'resources-files');
    const yearGroups = ['Year-7', 'Year-8', 'Year-9', 'Year-10', 'Year-11'];
    const counts = {};
    
    yearGroups.forEach(yearGroup => {
        const yearPath = path.join(resourcesPath, yearGroup);
        let count = 0;
        
        if (fs.existsSync(yearPath)) {
            const subjects = fs.readdirSync(yearPath);
            subjects.forEach(subject => {
                const subjectPath = path.join(yearPath, subject);
                if (fs.statSync(subjectPath).isDirectory()) {
                    const files = fs.readdirSync(subjectPath).filter(f => 
                        !f.startsWith('.') && f.endsWith('.html')
                    );
                    count += files.length;
                }
            });
        }
        
        counts[yearGroup] = count;
    });
    
    res.json({ success: true, counts });
});

// Get resources for a specific year group
app.get('/api/year-resources/:yearGroup', (req, res) => {
    const { yearGroup } = req.params;
    const resourcesPath = path.join(__dirname, 'public', 'resources-files', yearGroup);
    
    // Define all expected subjects in order
    const allSubjects = [
        { folder: 'English-Reading', name: 'English - Reading' },
        { folder: 'English-Writing', name: 'English - Writing' },
        { folder: 'English-Vocabulary-SPaG', name: 'English - Vocabulary & SPaG' },
        { folder: 'Maths-Practice', name: 'Maths - Practice' },
        { folder: 'Maths-Error-Spotting', name: 'Maths - Error Spotting' },
        { folder: 'Sport-Academic', name: 'Sport - Academic' },
        { folder: 'Sport-Assessment', name: 'Sport - Assessment & Analysis' },
        { folder: 'Kings-Trust-Employability', name: "King's Trust - Employability" }
    ];
    
    // Build subjects list with resources (or empty arrays)
    const subjects = allSubjects.map(subject => {
        const subjectPath = path.join(resourcesPath, subject.folder);
        let files = [];
        
        if (fs.existsSync(subjectPath)) {
            files = fs.readdirSync(subjectPath).filter(f => 
                !f.startsWith('.') && f.endsWith('.html')
            );
        }
        
        return {
            name: subject.name,
            folder: subject.folder,
            resources: files
        };
    });
    
    res.json({ success: true, subjects });
});


// Error handling
app.use((error, req, res, next) => {
    res.status(500).json({
        success: false,
        message: error.message || 'An error occurred.'
    });
});

async function startServer(options = {}) {
    const port = typeof options.port === 'number' ? options.port : (process.env.PORT ? Number(process.env.PORT) : PORT);
    const quiet = Boolean(options.quiet);

    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            const actualPort = server.address()?.port;

            if (!quiet) {
                console.log(`\n🚀 School100 server running on http://localhost:${actualPort}`);
                console.log(`\n📚 Resources-only mode - Upload functionality removed`);
                console.log('');
            }

            resolve({ app, server, port: actualPort });
        });

        server.on('error', (err) => reject(err));
    });
}

module.exports = { app, startServer };

// If run directly: start the server normally (keeps existing behaviour for `npm start`)
if (require.main === module) {
    startServer().catch((err) => {
        console.error('❌ Failed to start server:', err);
        process.exitCode = 1;
    });
}

