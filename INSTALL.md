# 🚀 Quick Installation Guide

## Step 1: Create Icons (Choose One Method)

### Method A: Using the HTML Tool (Recommended)
1. Open `create-icons.html` in your web browser
2. Right-click on each icon and "Save image as..."
3. Save as `icon16.png`, `icon48.png`, and `icon128.png`
4. Place all PNG files in the `icons/` folder

### Method B: Using SVG Files
1. Open each SVG file (`icon16.svg`, `icon48.svg`, `icon128.svg`) in a browser
2. Right-click and "Save image as..." PNG
3. Place all PNG files in the `icons/` folder

### Method C: Online Tools
1. Go to https://www.favicon.io/
2. Create a simple calendar icon
3. Download and resize to 16x16, 48x48, and 128x128
4. Save as `icon16.png`, `icon48.png`, and `icon128.png`

## Step 2: Install Extension in Chrome

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in the address bar
   - Or go to Chrome Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch (top-right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `chrome-extension` folder
   - The extension should appear in your list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "JIRA to Calendar Event Creator"
   - Click the pin icon to keep it visible

## Step 3: Test the Extension

1. **Go to a JIRA Ticket**
   - Navigate to any JIRA ticket page
   - Example: `https://your-domain.atlassian.net/browse/PROJ-123`

2. **Click the Extension Icon**
   - You should see the popup with extracted JIRA data
   - The form should be pre-filled with ticket information

3. **Create a Test Event**
   - Fill in the event details
   - Choose Google Calendar or Outlook
   - Click "Create Calendar Event"

## ✅ Success Indicators

- Extension icon appears in Chrome toolbar
- Popup opens when clicked on JIRA pages
- JIRA data is automatically extracted
- Calendar event creation works

## 🔧 Troubleshooting

### Extension Not Loading
- Make sure all files are in the `chrome-extension` folder
- Check that `manifest.json` is valid
- Ensure all PNG icons are present in `icons/` folder

### No Data Extracted
- Verify you're on a JIRA page (`*.atlassian.net`)
- Refresh the page and try again
- Check browser console for errors

### Icons Not Showing
- Ensure PNG files are named exactly: `icon16.png`, `icon48.png`, `icon128.png`
- Reload the extension after adding icons
- Check file permissions

## 📁 Final File Structure

Your `chrome-extension` folder should look like this:
```
chrome-extension/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
├── README.md
├── INSTALL.md
├── generate-icons.js
├── create-icons.html
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🎉 You're Ready!

Once installed, you can:
- Click the extension icon on any JIRA page
- Automatically extract ticket details
- Create calendar events with one click
- Add participants and customize event details

Happy scheduling! 🎯📅 