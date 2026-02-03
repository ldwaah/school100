const { google } = require('googleapis');
const { Readable } = require('stream');

// Use a simpler multipart parser that works better with Netlify Functions
function parseMultipartSimple(body, boundary) {
    const parts = body.split(`--${boundary}`);
    const result = { file: null, fields: {} };
    
    for (const part of parts) {
        if (!part || part.trim() === '--' || part.trim() === '') continue;
        
        const [headers, ...bodyParts] = part.split('\r\n\r\n');
        if (!headers || !bodyParts.length) continue;
        
        const contentDisposition = headers.match(/Content-Disposition:.*name="([^"]+)"/);
        if (!contentDisposition) continue;
        
        const fieldName = contentDisposition[1];
        const bodyContent = bodyParts.join('\r\n\r\n').replace(/\r\n--$/, '').trim();
        
        // Check if it's a file
        const filenameMatch = headers.match(/filename="([^"]+)"/);
        if (filenameMatch) {
            const filename = filenameMatch[1];
            const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/);
            const contentType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';
            
            result.file = {
                buffer: Buffer.from(bodyContent, 'binary'),
                filename: filename,
                mimetype: contentType
            };
        } else {
            // It's a regular field
            result.fields[fieldName] = bodyContent;
        }
    }
    
    return result;
}

// Folder ID mapping from environment variables
const FOLDER_IDS = {
    ks3: process.env.KS3_FOLDER_ID,
    ks4: process.env.KS4_FOLDER_ID,
    resources: process.env.RESOURCES_FOLDER_ID
};

// Initialize Google Drive client
async function getDriveClient() {
    try {
        if (!process.env.GOOGLE_CREDENTIALS || !process.env.GOOGLE_TOKEN) {
            throw new Error('Google Drive credentials not configured');
        }
        
        let credentials, token;
        try {
            credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        } catch (e) {
            throw new Error(`Failed to parse GOOGLE_CREDENTIALS: ${e.message}`);
        }
        
        try {
            token = JSON.parse(process.env.GOOGLE_TOKEN);
        } catch (e) {
            throw new Error(`Failed to parse GOOGLE_TOKEN: ${e.message}`);
        }
        
        const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
        
        if (!client_id || !client_secret) {
            throw new Error('Invalid Google credentials: missing client_id or client_secret');
        }
        
        const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris?.[0] || 'http://localhost');
        oauth2Client.setCredentials(token);
        
        // Refresh token if expired (synchronously before API calls)
        if (token.expiry_date && token.expiry_date < Date.now() && token.refresh_token) {
            try {
                const { credentials: newCredentials } = await oauth2Client.refreshAccessToken();
                oauth2Client.setCredentials({ ...token, ...newCredentials });
                console.log('Token refreshed successfully');
            } catch (err) {
                console.error('Token refresh failed:', err);
                throw new Error(`Google Drive authentication failed: ${err.message}. Please check your GOOGLE_TOKEN environment variable.`);
            }
        }
        
        return google.drive({ version: 'v3', auth: oauth2Client });
    } catch (error) {
        console.error('Error initializing Google Drive client:', error);
        throw error;
    }
}

// Parse multipart form data - using simple parser instead of Busboy
function parseMultipartForm(event) {
    return new Promise((resolve, reject) => {
        try {
            const contentType = event.headers['content-type'] || event.headers['Content-Type'];
            if (!contentType || !contentType.includes('multipart/form-data')) {
                reject(new Error('Invalid content type'));
                return;
            }
            
            // Parse boundary from content-type
            const boundaryMatch = contentType.match(/boundary=([^;]+)/);
            if (!boundaryMatch) {
                reject(new Error('No boundary found in content-type'));
                return;
            }
            const boundary = boundaryMatch[1].trim();
            
            // Get body as string/buffer
            let bodyString;
            if (event.body) {
                if (event.isBase64Encoded) {
                    bodyString = Buffer.from(event.body, 'base64').toString('binary');
                } else if (typeof event.body === 'string') {
                    bodyString = event.body;
                } else if (Buffer.isBuffer(event.body)) {
                    bodyString = event.body.toString('binary');
                } else {
                    bodyString = String(event.body);
                }
            } else {
                reject(new Error('No body in request'));
                return;
            }
            
            // Use simple parser
            const result = parseMultipartSimple(bodyString, boundary);
            
            if (!result.file) {
                reject(new Error('No file was found in the request'));
                return;
            }
            
            resolve(result);
        } catch (error) {
            reject(new Error(`Failed to parse multipart form: ${error.message}`));
        }
    });
}

exports.handler = async (event, context) => {
    // Wrap everything in try-catch to ensure we always return JSON
    try {
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
        const drive = await getDriveClient();
        const fileMetadata = {
            name: newFileName,
            parents: [folderId],
            description: `Uploaded by: ${studentName}${assignmentTitle ? ` | Assignment: ${assignmentTitle}` : ''}`
        };
        
        // Convert buffer to stream for Google Drive API
        const fileBuffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
        const fileStream = Readable.from(fileBuffer);
        
        const media = {
            mimeType: file.mimetype || 'application/octet-stream',
            body: fileStream
        };
        
        let response;
        try {
            response = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id, name, webViewLink'
            });
        } catch (driveError) {
            console.error('Google Drive API error:', driveError);
            throw new Error(`Google Drive upload failed: ${driveError.message || 'Unknown error'}`);
        }
        
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
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            code: error.code
        });
        
        // Always return JSON, even on errors
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: error.message || 'An error occurred during upload',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};
