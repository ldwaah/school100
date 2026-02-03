const { google } = require('googleapis');
const Busboy = require('busboy');
const { Readable } = require('stream');

// Folder ID mapping from environment variables
const FOLDER_IDS = {
    ks3: process.env.KS3_FOLDER_ID,
    ks4: process.env.KS4_FOLDER_ID,
    resources: process.env.RESOURCES_FOLDER_ID
};

// Initialize Google Drive client
function getDriveClient() {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const token = JSON.parse(process.env.GOOGLE_TOKEN);
    
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oauth2Client.setCredentials(token);
    
    // Refresh token if expired
    if (token.expiry_date && token.expiry_date < Date.now() && token.refresh_token) {
        oauth2Client.refreshAccessToken().then(({ credentials: newCredentials }) => {
            // Note: In production, you'd want to update the stored token
            oauth2Client.setCredentials({ ...token, ...newCredentials });
        }).catch(err => {
            console.error('Token refresh failed:', err);
        });
    }
    
    return google.drive({ version: 'v3', auth: oauth2Client });
}

// Parse multipart form data
function parseMultipartForm(event) {
    return new Promise((resolve, reject) => {
        const contentType = event.headers['content-type'] || event.headers['Content-Type'];
        if (!contentType || !contentType.includes('multipart/form-data')) {
            reject(new Error('Invalid content type'));
            return;
        }
        
        const busboy = Busboy({ headers: { 'content-type': contentType } });
        const result = {
            file: null,
            fields: {}
        };
        
        let fileProcessed = false;
        
        busboy.on('file', (fieldname, file, info) => {
            const { filename, encoding, mimeType } = info;
            const chunks = [];
            
            file.on('data', (chunk) => {
                chunks.push(chunk);
            });
            
            file.on('end', () => {
                result.file = {
                    buffer: Buffer.concat(chunks),
                    filename: filename || 'upload',
                    mimetype: mimeType || 'application/octet-stream'
                };
                fileProcessed = true;
            });
            
            file.on('error', (err) => {
                reject(new Error(`File stream error: ${err.message}`));
            });
        });
        
        busboy.on('field', (fieldname, value, info) => {
            result.fields[fieldname] = value;
        });
        
        busboy.on('finish', () => {
            if (!fileProcessed && !result.file) {
                reject(new Error('No file was processed'));
                return;
            }
            resolve(result);
        });
        
        busboy.on('error', (err) => {
            reject(new Error(`Busboy error: ${err.message}`));
        });
        
        // Convert body to buffer - handle different encodings
        let body;
        if (event.body) {
            if (event.isBase64Encoded) {
                body = Buffer.from(event.body, 'base64');
            } else if (typeof event.body === 'string') {
                body = Buffer.from(event.body, 'binary');
            } else if (Buffer.isBuffer(event.body)) {
                body = event.body;
            } else {
                body = Buffer.from(JSON.stringify(event.body), 'utf8');
            }
        } else {
            reject(new Error('No body in request'));
            return;
        }
        
        // Write body to busboy
        busboy.write(body);
        busboy.end();
    });
}

exports.handler = async (event, context) => {
    // Handle CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }
    
    if (event.httpMethod !== 'POST') {
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
        // Check if Google Drive is configured
        if (!process.env.GOOGLE_CREDENTIALS || !process.env.GOOGLE_TOKEN) {
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Google Drive not configured. Please set up environment variables.'
                })
            };
        }
        
        // Parse form data
        const { file, fields } = await parseMultipartForm(event);
        
        if (!file) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ success: false, message: 'No file uploaded' })
            };
        }
        
        const keyStage = fields.keyStage || 'ks3';
        const studentName = fields.studentName || 'anonymous';
        const assignmentTitle = fields.assignmentTitle || '';
        const folderId = FOLDER_IDS[keyStage];
        
        if (!folderId) {
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    success: false,
                    message: `No Google Drive folder configured for ${keyStage}`
                })
            };
        }
        
        // Create descriptive filename
        const timestamp = new Date().toISOString().split('T')[0];
        const sanitizedName = studentName.replace(/[^a-z0-9]/gi, '_');
        const sanitizedTitle = assignmentTitle ? assignmentTitle.replace(/[^a-z0-9]/gi, '_') : '';
        const ext = file.filename.split('.').pop();
        const baseName = file.filename.replace(/\.[^/.]+$/, '');
        
        let newFileName = `${timestamp}_${sanitizedName}`;
        if (sanitizedTitle) {
            newFileName += `_${sanitizedTitle}`;
        }
        newFileName += `_${baseName}.${ext}`;
        
        // Upload to Google Drive
        const drive = getDriveClient();
        const fileMetadata = {
            name: newFileName,
            parents: [folderId],
            description: `Uploaded by: ${studentName}${assignmentTitle ? ` | Assignment: ${assignmentTitle}` : ''}`
        };
        
        // Convert buffer to stream for Google Drive API (it expects a stream)
        const fileBuffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
        const fileStream = Readable.from(fileBuffer);
        
        const media = {
            mimeType: file.mimetype || 'application/octet-stream',
            body: fileStream
        };
        
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink'
        });
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                message: 'File uploaded successfully to Google Drive!',
                filename: response.data.name,
                keyStage: keyStage,
                studentName: studentName,
                driveFileId: response.data.id,
                webViewLink: response.data.webViewLink
            })
        };
    } catch (error) {
        console.error('Upload error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: error.message || 'An error occurred during upload'
            })
        };
    }
};

