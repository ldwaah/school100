// Paste your authorization code below (replace YOUR_CODE_HERE)
const CODE = '4/0ASc3gC1I6ZHy-vyqhMUo_-BN0sD4MpI5q4yZ8IDrNuyUOZEdeYslvv_YXvnmBIpcgF3AXw';

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const TOKEN_PATH = path.join(__dirname, 'google-token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'google-credentials.json');

async function getToken() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    try {
        const { tokens } = await oAuth2Client.getToken(CODE);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log('\n✅ Authorization successful!');
        console.log(`   Token saved to: ${TOKEN_PATH}`);
        console.log('\n🚀 You can now start the server with: npm start\n');
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

getToken();

