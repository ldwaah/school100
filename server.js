require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const googleDriveService = require('./google-drive-service');

const app = express();
const PORT = process.env.PORT || 3000;

// Folder ID mapping
const FOLDER_IDS = {
    ks3: process.env.KS3_FOLDER_ID,
    ks4: process.env.KS4_FOLDER_ID,
    resources: process.env.RESOURCES_FOLDER_ID
};

// Base directory for local file storage (uploads).
// - Normal `npm start`: defaults to ./uploads (next to this file)
// - Electron builds should set UPLOAD_BASE_DIR to a writable directory (e.g. Electron userData)
const UPLOAD_BASE_DIR = process.env.UPLOAD_BASE_DIR || path.join(__dirname, 'uploads');

// Create upload directories if they don't exist
const uploadDirs = [
    path.join(UPLOAD_BASE_DIR, 'ks3'),
    path.join(UPLOAD_BASE_DIR, 'ks4'),
    path.join(UPLOAD_BASE_DIR, 'resources')
];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const keyStage = req.body.keyStage || 'ks3';
        const uploadPath = path.join(UPLOAD_BASE_DIR, keyStage);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate filename: timestamp-studentname-originalname
        const studentName = req.body.studentName || 'anonymous';
        const sanitizedName = studentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_');
        cb(null, `${timestamp}-${sanitizedName}-${basename}${ext}`);
    }
});

// File filter to accept common file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Please upload images, PDFs, or Office documents.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Serve resources files
app.use('/resources/files', express.static(path.join(__dirname, 'public', 'resources-files')));

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: 'No file uploaded' 
        });
    }

    const keyStage = req.body.keyStage || 'ks3';
    const studentName = req.body.studentName || 'anonymous';
    const assignmentTitle = req.body.assignmentTitle || '';
    
    // If Google Drive is enabled, upload there
    if (googleDriveService.isEnabled()) {
        const folderId = FOLDER_IDS[keyStage];
        
        if (!folderId) {
            return res.status(500).json({
                success: false,
                message: `No Google Drive folder configured for ${keyStage}`
            });
        }

        try {
            // Create a descriptive filename with student name
            const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const sanitizedName = studentName.replace(/[^a-z0-9]/gi, '_');
            const sanitizedTitle = assignmentTitle ? assignmentTitle.replace(/[^a-z0-9]/gi, '_') : '';
            const ext = path.extname(req.file.originalname);
            const baseName = path.basename(req.file.originalname, ext);
            
            // Format: Date_StudentName_AssignmentTitle_OriginalName.ext
            let newFileName = `${timestamp}_${sanitizedName}`;
            if (sanitizedTitle) {
                newFileName += `_${sanitizedTitle}`;
            }
            newFileName += `_${baseName}${ext}`;
            
            const result = await googleDriveService.uploadFile(
                req.file.path,
                newFileName,
                folderId,
                studentName,
                assignmentTitle
            );

            // Delete local file after successful upload to Google Drive
            if (result.success) {
                fs.unlinkSync(req.file.path);
                
                return res.json({
                    success: true,
                    message: 'File uploaded successfully to Google Drive!',
                    filename: result.fileName,
                    keyStage: keyStage,
                    studentName: studentName,
                    driveFileId: result.fileId,
                    webViewLink: result.webViewLink
                });
            } else {
                // If Drive upload fails, keep local file
                return res.json({
                    success: true,
                    message: 'File uploaded locally (Google Drive upload failed)',
                    filename: req.file.filename,
                    keyStage: keyStage,
                    studentName: studentName,
                    warning: result.message
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            return res.json({
                success: true,
                message: 'File uploaded locally (Google Drive unavailable)',
                filename: req.file.filename,
                keyStage: keyStage,
                studentName: studentName
            });
        }
    } else {
        // Google Drive not enabled, use local storage
        res.json({
            success: true,
            message: 'File uploaded successfully!',
            filename: req.file.filename,
            keyStage: req.body.keyStage,
            studentName: req.body.studentName
        });
    }
});

// Get list of uploaded files for a key stage
app.get('/files/:keyStage', async (req, res) => {
    const keyStage = req.params.keyStage;
    
    // Try Google Drive first if enabled
    if (googleDriveService.isEnabled()) {
        const folderId = FOLDER_IDS[keyStage];
        
        if (folderId) {
            const result = await googleDriveService.listFiles(folderId);
            
            if (result.success) {
                const fileDetails = result.files.map(file => ({
                    filename: file.name,
                    size: parseInt(file.size) || 0,
                    uploadedAt: file.createdTime,
                    webViewLink: file.webViewLink,
                    driveFileId: file.id
                }));
                
                return res.json({ files: fileDetails, source: 'google-drive' });
            }
        }
    }
    
    // Fallback to local storage
    const uploadPath = path.join(UPLOAD_BASE_DIR, keyStage);
    
    if (!fs.existsSync(uploadPath)) {
        return res.json({ files: [], source: 'local' });
    }

    fs.readdir(uploadPath, (err, files) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Error reading files' 
            });
        }

        const fileDetails = files.map(filename => {
            const stats = fs.statSync(path.join(uploadPath, filename));
            return {
                filename,
                size: stats.size,
                uploadedAt: stats.mtime
            };
        });

        res.json({ files: fileDetails, source: 'local' });
    });
});

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

// Download a file
app.get('/download/:keyStage/:filename', (req, res) => {
    const { keyStage, filename } = req.params;
    const filePath = path.join(UPLOAD_BASE_DIR, keyStage, filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
            success: false, 
            message: 'File not found' 
        });
    }

    res.download(filePath);
});

// Error handling
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File is too large. Maximum size is 50MB.'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        message: error.message || 'An error occurred during upload.'
    });
});

async function startServer(options = {}) {
    const port = typeof options.port === 'number' ? options.port : (process.env.PORT ? Number(process.env.PORT) : PORT);
    const quiet = Boolean(options.quiet);

    await googleDriveService.initialize();

    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            const actualPort = server.address()?.port;

            if (!quiet) {
                console.log(`\n🚀 School100 server running on http://localhost:${actualPort}`);
                console.log(`\n📁 Local upload directories:`);
                uploadDirs.forEach(dir => console.log(`   - ${dir}`));

                if (googleDriveService.isEnabled()) {
                    console.log(`\n☁️  Google Drive Integration: ENABLED`);
                    console.log(`   Files will automatically sync to your Google Drive folders`);
                } else {
                    console.log(`\n📝 Google Drive Integration: DISABLED`);
                    console.log(`   Files will be stored locally`);
                    console.log(`   See GOOGLE_DRIVE_SETUP.md for setup instructions`);
                }
                console.log('');
            }

            resolve({ app, server, port: actualPort });
        });

        server.on('error', (err) => reject(err));
    });
}

module.exports = { app, startServer, UPLOAD_BASE_DIR };

// If run directly: start the server normally (keeps existing behaviour for `npm start`)
if (require.main === module) {
    startServer().catch((err) => {
        console.error('❌ Failed to start server:', err);
        process.exitCode = 1;
    });
}

