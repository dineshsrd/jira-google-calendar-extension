# JIRA & Bitbucket Chrome Extension

A Chrome extension to streamline your workflow with JIRA and Bitbucket. Create calendar events from JIRA tickets, and quickly copy Bitbucket PR summaries for sharing.

---

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [JIRA Ticket Workflow](#jira-ticket-workflow)
  - [Bitbucket PR Workflow](#bitbucket-pr-workflow)
- [Automated Release (GitHub Actions)](#automated-release-github-actions)
- [Troubleshooting](#troubleshooting)
- [Customization](#customization)
- [File Structure](#file-structure)
- [Security Notes](#security-notes)
- [Support](#support)
- [License](#license)

---

## Features

- 🎯 **JIRA Integration**: Extracts ticket key, title, and description from JIRA pages
- 📅 **Calendar Event Creation**: Create Google/Outlook calendar events from JIRA tickets
- 🪄 **Bitbucket PR Floating Button**: Floating button on Bitbucket PR pages for quick summary sharing
- 📋 **Copy PR Summary**: Modal to edit a custom message and copy PR info for Slack or email
- 📝 **Robust Extraction**: Smart selectors for both JIRA and Bitbucket to handle most layouts
- ⏰ **15-Minute Time Intervals**: Precise time selection for events
- 👥 **Participant Management**: Add multiple participants via email
- ⏱️ **Flexible Duration**: Choose from 15 minutes to 4 hours
- 🎨 **Modern UI**: Clean, user-friendly interface
- 🤖 **Automated Release**: GitHub Actions workflow to pack and release the extension

---

## Installation

### For Personal Use (Developer Mode)

1. **Download the Extension Files**
   - Download all files from the repository
   - Keep the folder structure intact

2. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/`
   - Or: Chrome Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch (top-right corner)

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the extension folder
   - The extension should now appear in your extensions list

5. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find the extension and click the pin icon

---

## Usage

### JIRA Ticket Workflow
1. **Navigate to a JIRA Ticket**
   - Example: `https://your-domain.atlassian.net/browse/PROJ-123`
2. **Open the Extension**
   - Click the extension icon in your Chrome toolbar
3. **Review & Configure**
   - The extension extracts ticket key, title, and summary
   - Configure event details (date, time, duration, participants, calendar type)
4. **Create the Event**
   - Click "Create Calendar Event"
   - A new tab opens with your calendar service, pre-filled with event details

### Bitbucket PR Workflow
1. **Navigate to a Bitbucket PR**
   - Example: `https://bitbucket.org/<workspace>/<repo>/pull-requests/<id>`
2. **Use the Floating Button**
   - Click the floating 🔗 button on the right side of the page
3. **Edit and Copy**
   - Edit the custom message if needed
   - Review the PR title and description
   - Click "Copy to Clipboard" to copy a summary like:
     ```
     @teamx Can someone please review and merge the below PR?

     Summary: ESM-5419 created PO v2 tables

     PR Link: https://bitbucket.org/atlassian/python-bitbucket/pull-requests/1
     ```

---

## Automated Release (GitHub Actions)

This repo includes a GitHub Actions workflow to automatically pack and release the extension as a zip file on every version tag push.

### How it works
- On every push to a tag like `v1.0.0`, the workflow zips up all extension files and creates a GitHub Release with the zip attached.

### How to trigger a release
1. Commit and push all your changes.
2. Tag a release and push the tag:
   ```sh
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. The workflow will run and create a release with `chrome-extension.zip` attached.

---

## Troubleshooting

- **Extension Not Working on JIRA/Bitbucket Pages**
  - Make sure you're on a supported page (JIRA: `atlassian.net`, Bitbucket: PR page)
  - Refresh the page and try again
  - Check the browser console for any error messages
- **Data Not Extracting Properly**
  - The extension uses multiple selectors to find elements
  - If your instance has custom styling, some elements might not be detected
  - Try refreshing the page or navigating to a different ticket/PR
- **Calendar Event Not Creating**
  - Ensure you're logged into your Google/Outlook account
  - Check that the date and time are valid
  - Verify email addresses are in the correct format
- **GitHub Release Fails**
  - Ensure your workflow permissions are set to "Read and write"
  - If using a fork, use a Personal Access Token (PAT) with `repo` and `workflow` scopes

---

## Customization

- **Icons**: Place your own icon files in the `icons/` folder (`icon16.png`, `icon48.png`, `icon128.png`)
- **JIRA Selectors**: Modify selectors in `content.js` if your JIRA instance uses custom HTML
- **Bitbucket Selectors**: Modify selectors in `bitbucket-pr.js` if your Bitbucket PR layout is different
- **Default Values**: Change default duration or calendar type in `popup.js`:
  ```js
  document.getElementById('eventDuration').value = '60';
  document.getElementById('calendarType').value = 'google';
  ```

---

## File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── content.js            # Content script for JIRA pages
├── bitbucket-pr.js       # Content script for Bitbucket PR pages
├── background.js         # Background service worker
├── README.md             # This file
├── INSTALL.md            # Installation instructions
├── SUMMARY.md            # Feature summary
├── generate-icons.js     # Icon generation helper
└── icons/                # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Security Notes

- This extension only runs on JIRA and Bitbucket PR pages
- No data is stored or transmitted to external servers
- All processing happens locally in your browser
- Calendar integration uses official deep linking URLs

---

## Support

This is a personal-use extension. For issues or improvements:
1. Check the browser console for error messages
2. Verify you're on a supported JIRA or Bitbucket PR page
3. Ensure all required fields are filled in the form
4. Test with different tickets/PRs

---

## License

This extension is for personal use only. Please do not distribute or publish without proper authorization. 