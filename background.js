// Background service worker for the Chrome extension

console.log('JIRA to Calendar extension background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Extension installed');
    } else if (details.reason === 'update') {
        console.log('Extension updated');
    }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getJiraData') {
        // This could be used for additional background processing
        sendResponse({ success: true });
    }
}); 