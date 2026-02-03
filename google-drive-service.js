const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class GoogleDriveService {
    constructor() {
        this.drive = null;
        this.initialized = false;
        this.oauth2Client = null;
    }

    async initialize() {
        try {
            // Check if OAuth credentials file exists
            const credentialsPath = path.join(__dirname, 'google-credentials.json');
            const tokenPath = path.join(__dirname, 'google-token.json');
            
            if (!fs.existsSync(credentialsPath)) {
                console.log('⚠️  Google Drive credentials not found. Files will be stored locally.');
                console.log('   To enable Google Drive integration, follow the setup instructions in GOOGLE_DRIVE_SETUP.md');
                return false;
            }

            const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

            // Check if it's OAuth credentials (has client_id) or Service Account (has client_email)
            if (credentials.client_email) {
                console.log('⚠️  Service Account detected. Please use OAuth credentials instead.');
                console.log('   Follow the updated GOOGLE_DRIVE_SETUP.md instructions.');
                return false;
            }

            const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
            this.oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

            // Check if we have a token already
            if (fs.existsSync(tokenPath)) {
                let token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
                this.oauth2Client.setCredentials(token);
                
                // Check if token is expired and refresh if possible
                if (token.expiry_date && token.expiry_date < Date.now()) {
                    if (token.refresh_token) {
                        console.log('🔄 Token expired. Refreshing...');
                        try {
                            const { credentials } = await this.oauth2Client.refreshAccessToken();
                            token = {
                                ...token,
                                ...credentials,
                                expiry_date: credentials.expiry_date || (Date.now() + 3600 * 1000)
                            };
                            fs.writeFileSync(tokenPath, JSON.stringify(token, null, 2));
                            this.oauth2Client.setCredentials(token);
                            console.log('✅ Token refreshed successfully');
                        } catch (error) {
                            console.log('⚠️  Failed to refresh token. Please re-authenticate.');
                            console.log('   Run: npm run authorize');
                            return false;
                        }
                    } else {
                        console.log('⚠️  Token expired and no refresh token available. Please re-authenticate.');
                        console.log('   Run: npm run authorize');
                        return false;
                    }
                }
            } else {
                console.log('⚠️  No authentication token found.');
                console.log('   Please run: npm run authorize');
                return false;
            }

            this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
            this.initialized = true;
            
            console.log('✅ Google Drive integration enabled');
            return true;
        } catch (error) {
            console.error('❌ Error initializing Google Drive:', error.message);
            console.log('   Files will be stored locally instead.');
            return false;
        }
    }

    async getAuthUrl() {
        const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
    }

    async getToken(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        return tokens;
    }

    async uploadFile(filePath, fileName, folderId, studentName, assignmentTitle = '') {
        if (!this.initialized) {
            return { success: false, message: 'Google Drive not initialized' };
        }

        try {
            const fileMetadata = {
                name: fileName,
                parents: [folderId],
                description: `Uploaded by: ${studentName}${assignmentTitle ? ` | Assignment: ${assignmentTitle}` : ''}`
            };

            const media = {
                body: fs.createReadStream(filePath)
            };

            const response = await this.drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id, name, webViewLink'
            });

            console.log(`✅ Uploaded to Google Drive: ${fileName} (ID: ${response.data.id})`);

            return {
                success: true,
                fileId: response.data.id,
                fileName: response.data.name,
                webViewLink: response.data.webViewLink
            };
        } catch (error) {
            console.error('❌ Error uploading to Google Drive:', error.message);
            return { 
                success: false, 
                message: error.message 
            };
        }
    }

    async listFiles(folderId, maxResults = 50) {
        if (!this.initialized) {
            return { success: false, files: [] };
        }

        try {
            const response = await this.drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: 'files(id, name, mimeType, createdTime, size, webViewLink)',
                orderBy: 'createdTime desc',
                pageSize: maxResults
            });

            return {
                success: true,
                files: response.data.files || []
            };
        } catch (error) {
            console.error('❌ Error listing files from Google Drive:', error.message);
            return { 
                success: false, 
                files: [] 
            };
        }
    }

    async downloadFile(fileId, destinationPath) {
        if (!this.initialized) {
            return { success: false };
        }

        try {
            const response = await this.drive.files.get(
                { fileId: fileId, alt: 'media' },
                { responseType: 'stream' }
            );

            return new Promise((resolve, reject) => {
                const dest = fs.createWriteStream(destinationPath);
                response.data
                    .on('end', () => {
                        console.log(`✅ Downloaded from Google Drive: ${fileId}`);
                        resolve({ success: true });
                    })
                    .on('error', err => {
                        console.error('❌ Error downloading from Google Drive:', err);
                        reject({ success: false, message: err.message });
                    })
                    .pipe(dest);
            });
        } catch (error) {
            console.error('❌ Error downloading file:', error.message);
            return { success: false, message: error.message };
        }
    }

    isEnabled() {
        return this.initialized;
    }
}

module.exports = new GoogleDriveService();

