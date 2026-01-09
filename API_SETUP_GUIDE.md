# API Setup Guide

This guide will walk you through setting up free API credentials for Spotify and YouTube integration in Zenner.

---

## Spotify Web API Setup

The Spotify Web API allows you to search the entire Spotify catalog and save your favorite albums, playlists, and tracks. This is completely **free** and takes about 3-5 minutes to set up.

### Prerequisites
- A Spotify account (free or premium)
- A web browser

### Step-by-Step Instructions

#### 1. Access the Spotify Developer Dashboard
- Open your browser and navigate to: **https://developer.spotify.com/dashboard**
- Click **"Log in"** in the top right corner
- Sign in with your Spotify account credentials

#### 2. Create a New App
- Once logged in, click the green **"Create app"** button
- Fill in the application details:
  - **App name**: `Zenner Pomodoro` (or any name you prefer)
  - **App description**: `Personal productivity timer with music integration`
  - **Website**: Leave blank or enter your personal website
  - **Redirect URI**: `http://localhost:3000/callback` ⚠️ **IMPORTANT - Copy this exactly**
- Check the boxes to agree to Spotify's Terms of Service and Design Guidelines
- Click **"Save"**

#### 3. Get Your Credentials
- You'll be redirected to your app's dashboard
- Click on **"Settings"** in the top right
- You'll see two important fields:
  - **Client ID**: A long string like `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
  - **Client Secret**: Click **"View client secret"** to reveal it
- **Copy both** of these values - you'll need them in Zenner

#### 4. Configure in Zenner
- Open Zenner → Settings → Integrations → Spotify
- Click **"Set Up Spotify API"**
- Paste your **Client ID** into the first field
- Paste your **Client Secret** into the second field
- Click **"Authorize with Spotify"**
- A browser window will open asking you to authorize the app
- Click **"Agree"** to grant permissions
- You'll be redirected to a page that shows a URL like: `http://localhost:3000/callback?code=AQD...`
- **Copy the entire code** after `code=` (everything after the equals sign until the next `&` or end of URL)
- Paste this code into Zenner and click **"Complete Setup"**

#### 5. You're Done!
You can now search Spotify and save favorites directly in Zenner.

---

## YouTube Data API v3 Setup

The YouTube Data API allows you to search YouTube videos and save favorites. This is **free** with a generous quota of 10,000 units per day (approximately 100 searches).

### Prerequisites
- A Google account
- A web browser

### Step-by-Step Instructions

#### 1. Access Google Cloud Console
- Open your browser and navigate to: **https://console.cloud.google.com**
- Sign in with your Google account

#### 2. Create a New Project
- Click the project dropdown in the top navigation bar (it might say "Select a project")
- Click **"New Project"** in the top right of the dialog
- Enter project details:
  - **Project name**: `Zenner`
  - **Location**: Leave as default ("No organization")
- Click **"Create"**
- Wait a few seconds for the project to be created

#### 3. Enable YouTube Data API v3
- In the left sidebar, navigate to: **APIs & Services** → **Library**
- In the search bar, type: `YouTube Data API v3`
- Click on **"YouTube Data API v3"** from the results
- Click the blue **"Enable"** button
- Wait for the API to be enabled (takes 5-10 seconds)

#### 4. Create API Credentials
- In the left sidebar, go to: **APIs & Services** → **Credentials**
- Click **"+ Create Credentials"** at the top
- Select **"API key"** from the dropdown
- Your API key will be generated and displayed
- **Copy the API key** - it will look like: `AIzaSyD1234567890abcdefghijklmnop`

#### 5. (Optional) Restrict Your API Key
For security, you can restrict your API key:
- Click the **Edit** (pencil) icon next to your newly created key
- Under "API restrictions":
  - Select **"Restrict key"**
  - Choose **"YouTube Data API v3"** from the list
- Click **"Save"**

#### 6. Configure in Zenner
- Open Zenner → Settings → Integrations → YouTube (or Music section)
- Click **"Set Up YouTube API"**
- Paste your API key
- Click **"Save"**

#### 7. You're Done!
You can now search YouTube videos and save favorites directly in Zenner.

---

## Troubleshooting

### Spotify Issues

**"Invalid redirect URI" error:**
- Make sure you entered `http://localhost:3000/callback` exactly as shown (including `http://`, not `https://`)
- Check for typos or extra spaces
- The redirect URI in the Spotify dashboard must match exactly

**"Invalid client" error:**
- Double-check that you copied the entire Client ID and Client Secret
- Make sure there are no extra spaces at the beginning or end
- Try creating a new app in the Spotify dashboard

**Authorization expires:**
- Spotify access tokens expire after 1 hour
- Zenner automatically handles token refresh using your refresh token
- If you see persistent auth errors, try logging out and re-authorizing

### YouTube Issues

**"API key invalid" error:**
- Verify you copied the entire API key
- Check that YouTube Data API v3 is enabled for your project
- If you restricted the key, make sure YouTube Data API v3 is in the allowed list

**"Quota exceeded" error:**
- You've hit the daily limit of 10,000 units
- Each search costs approximately 100 units
- Quota resets at midnight Pacific Time
- For personal use, this is typically more than enough

**Videos won't play:**
- Some videos may have embedding disabled by the uploader
- Age-restricted videos require authentication through YouTube directly
- Some content may be region-restricted

---

## Privacy & Security

### What Data is Stored?

**Spotify:**
- Your access token and refresh token (stored locally in browser)
- Your saved favorites (stored locally in browser)
- No data is sent to external servers except Spotify's official API

**YouTube:**
- Your API key (stored locally in browser)
- Your saved favorites (stored locally in browser)
- No data is sent to external servers except Google's official API

### Is This Safe?

- Both APIs use industry-standard OAuth 2.0 or API key authentication
- Your credentials are stored only on your local machine
- API keys can be revoked at any time from the respective dashboards
- No third-party services have access to your credentials
- Zenner is open-source - you can verify the code yourself

### Revoking Access

**Spotify:**
1. Go to: https://www.spotify.com/account/apps/
2. Find "Zenner Pomodoro" (or whatever you named your app)
3. Click "Remove Access"

**YouTube:**
1. Go to: https://console.cloud.google.com
2. Select your project
3. Navigate to APIs & Services → Credentials
4. Delete the API key

---

## Cost & Limits

### Spotify Web API
- **Cost**: FREE forever
- **Rate Limit**: Generous (thousands of requests per day)
- **Quota**: No daily limit for personal use
- **Commercial Use**: Free for non-commercial apps

### YouTube Data API v3
- **Cost**: FREE forever
- **Daily Quota**: 10,000 units (resets at midnight Pacific Time)
- **Cost per Search**: ~100 units (approximately 100 searches/day)
- **Cost per Video Details**: ~1 unit
- **Commercial Use**: Free for non-commercial apps
- **Increasing Quota**: Can request increase if needed (rarely necessary for personal use)

---

## Need Help?

If you encounter issues not covered in this guide:

1. Check the official documentation:
   - Spotify: https://developer.spotify.com/documentation/web-api
   - YouTube: https://developers.google.com/youtube/v3

2. Verify your credentials are correct and haven't been revoked

3. Check the browser console for detailed error messages

4. Try creating new credentials and re-authorizing

---

**Last Updated**: January 2026
