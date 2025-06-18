# JIRA to Calendar Event Creator

A Chrome extension that helps you create calendar events from JIRA tickets. It automatically extracts the ticket title and description, and allows you to create events in Google Calendar or Outlook Calendar.

## Features

- 🎯 **Automatic JIRA Data Extraction**: Extracts ticket key, title, and description from JIRA pages
- 📝 **Smart Description Mapping**: Uses JIRA issue summary as the event description automatically
- ⏰ **15-Minute Time Intervals**: Precise time selection with 15-minute intervals (12:00, 12:15, 12:30, 12:45, etc.)
- 📅 **Multiple Calendar Support**: Works with Google Calendar and Outlook Calendar
- 👥 **Participant Management**: Add multiple participants via email addresses
- ⏱️ **Flexible Duration**: Choose from 15 minutes to 4 hours with 15-minute increments
- 🎨 **Clean UI**: Modern, user-friendly interface
- 🔒 **Personal Use**: Designed for individual use, not for distribution

## Installation

### For Personal Use (Developer Mode)

1. **Download the Extension Files**
   - Download all files from the `chrome-extension` folder
   - Keep the folder structure intact

2. **Open Chrome Extensions Page**
   - Open Chrome and go to `chrome://extensions/`
   - Or navigate to: Chrome Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `chrome-extension` folder containing all the extension files
   - The extension should now appear in your extensions list

5. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "JIRA to Calendar Event Creator" and click the pin icon

## Usage

1. **Navigate to a JIRA Ticket**
   - Go to any JIRA ticket page (e.g., `https://your-domain.atlassian.net/browse/PROJ-123`)

2. **Open the Extension**
   - Click the extension icon in your Chrome toolbar
   - Or right-click on the page and select "Create Calendar Event from JIRA"

3. **Review Extracted Data**
   - The extension will automatically extract and display:
     - Ticket Key (e.g., PROJ-123)
     - Ticket Title
     - Ticket Summary (used as event description)

4. **Configure Event Details**
   - **Event Title**: Pre-filled with JIRA title (can be modified)
   - **Event Description**: Pre-filled with JIRA summary (can be modified)
   - **Date & Time**: Set your preferred date and time with 15-minute precision
   - **Duration**: Choose from 15 minutes to 4 hours with 15-minute increments
   - **Participants**: Add email addresses (comma-separated)
   - **Calendar Type**: Choose Google Calendar or Outlook Calendar

5. **Create the Event**
   - Click "Create Calendar Event"
   - A new tab will open with your calendar service
   - The event details will be pre-filled
   - Review and save the event

## Key Features Explained

### 🎯 Smart Data Mapping
- **JIRA Title** → **Event Title**: The main ticket title becomes the calendar event title
- **JIRA Summary** → **Event Description**: The ticket's detailed summary/description becomes the event description
- **Automatic Pre-filling**: Both fields are automatically populated and can be edited

### ⏰ 15-Minute Time Precision
- **Time Selection**: Dropdown with 15-minute intervals (12:00, 12:15, 12:30, 12:45, etc.)
- **Smart Default**: Automatically sets to current time + 1 hour, rounded to nearest 15 minutes
- **24-Hour Coverage**: Available times from 12:00 AM to 11:45 PM

### ⏱️ Flexible Duration Options
- **15 minutes** - Quick meetings
- **30 minutes** - Standard meetings
- **45 minutes** - Extended discussions
- **1 hour** - Default selection
- **1 hour 15 minutes** - Extended meetings
- **1.5 hours** - Workshops
- **1 hour 45 minutes** - Long discussions
- **2 hours** - Training sessions
- **2.5 hours** - Extended workshops
- **3 hours** - Half-day sessions
- **4 hours** - Full sessions

## Supported JIRA Elements

The extension automatically detects and extracts:

- **Ticket Key**: From breadcrumbs and issue links
- **Title**: From the main heading and summary fields
- **Summary/Description**: From the description field and content areas

## Calendar Integration

### Google Calendar
- Opens Google Calendar with pre-filled event details
- Supports participants via email addresses
- Uses Google Calendar's URL parameters for seamless integration

### Outlook Calendar
- Opens Outlook Calendar with pre-filled event details
- Supports participants via email addresses
- Uses Outlook's deep linking for calendar events

## Troubleshooting

### Extension Not Working on JIRA Pages
- Make sure you're on a JIRA page (URL contains `atlassian.net`)
- Refresh the page and try again
- Check the browser console for any error messages

### Data Not Extracting Properly
- The extension uses multiple selectors to find JIRA elements
- If your JIRA instance has custom styling, some elements might not be detected
- Try refreshing the page or navigating to a different ticket

### Calendar Event Not Creating
- Ensure you're logged into your Google/Outlook account
- Check that the date and time are valid
- Verify email addresses are in the correct format

### Time Not Showing Correctly
- The extension rounds to the nearest 15-minute interval
- If you need a specific time, manually select it from the dropdown
- The default time is current time + 1 hour, rounded to nearest 15 minutes

## File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── content.js            # Content script for JIRA pages
├── background.js         # Background service worker
├── README.md             # This file
└── icons/                # Extension icons (create your own)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Customization

### Adding Icons
Create your own icon files in the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

### Modifying Selectors
If the extension doesn't work with your JIRA instance, you can modify the selectors in `content.js` to match your JIRA's HTML structure.

### Changing Default Values
You can modify the default duration or calendar type in `popup.js`:
```javascript
// Default duration (in minutes)
document.getElementById('eventDuration').value = '60';

// Default calendar type
document.getElementById('calendarType').value = 'google';
```

## Security Notes

- This extension only runs on JIRA pages (`*.atlassian.net`)
- No data is stored or transmitted to external servers
- All processing happens locally in your browser
- Calendar integration uses official deep linking URLs

## Support

This is a personal-use extension. For issues or improvements:
1. Check the browser console for error messages
2. Verify you're on a supported JIRA page
3. Ensure all required fields are filled in the form
4. Test with different JIRA tickets

## License

This extension is for personal use only. Please do not distribute or publish without proper authorization. 