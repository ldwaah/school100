const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(__dirname, 'google-token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'google-credentials.json');

async function authorize() {
    // Load client secrets
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        console.log('\n❌ Error: google-credentials.json not found!');
        console.log('   Please download OAuth credentials from Google Cloud Console.');
        console.log('   See GOOGLE_DRIVE_SETUP.md for instructions.\n');
        process.exit(1);
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    
    // Check if it's OAuth credentials
    if (credentials.client_email) {
        console.log('\n❌ Error: You have Service Account credentials, but we need OAuth credentials.');
        console.log('   Please follow the updated setup instructions in GOOGLE_DRIVE_SETUP.md\n');
        process.exit(1);
    }

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Generate auth url
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('\n🔐 Google Drive Authorization\n');
    console.log('Step 1: Open this URL in your browser:\n');
    console.log(authUrl);
    console.log('\nStep 2: Sign in with your Google account');
    console.log('Step 3: Click "Allow" to grant permissions');
    console.log('Step 4: Copy the authorization code from the browser\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Paste the authorization code here: ', async (code) => {
        rl.close();
        
        try {
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);

            // Store the token
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
            console.log('\n✅ Authorization successful!');
            console.log(`   Token saved to: ${TOKEN_PATH}`);
            console.log('\n🚀 You can now start the server with: npm start\n');
        } catch (error) {
            console.error('\n❌ Error retrieving access token:', error.message);
            console.log('   Please try again.\n');
            process.exit(1);
        }
    });
}

authorize();




