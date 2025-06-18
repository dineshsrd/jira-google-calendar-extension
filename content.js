// Content script for JIRA pages
// This script runs on JIRA pages and can extract ticket information

console.log('JIRA to Calendar extension loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractJiraData') {
        const jiraData = extractJiraData();
        sendResponse(jiraData);
    }
});

// Function to extract JIRA ticket information
function extractJiraData() {
    try {
        const data = {};

        // Extract ticket key
        const keySelectors = [
            '[data-testid="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"]',
            '.issue-link',
            '[data-testid="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"] span',
            '.aui-breadcrumb-current',
            '.issue-key',
            '[data-testid="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"] a',
            '[data-testid="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"] .issue-link',
            '.aui-breadcrumb-current .issue-link'
        ];

        for (const selector of keySelectors) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.textContent.trim();
                // Look for JIRA key pattern (e.g., PROJ-123)
                const keyMatch = text.match(/[A-Z]+-\d+/);
                if (keyMatch) {
                    data.key = keyMatch[0];
                    break;
                }
            }
        }

        // Extract ticket title
        const titleSelectors = [
            '[data-testid="issue.views.issue-base.foundation.summary.heading"]',
            'h1[data-testid="issue.views.issue-base.foundation.summary.heading"]',
            '.issue-summary',
            'h1',
            '[data-testid="issue.views.issue-base.foundation.summary.heading"] h1',
            '.summary',
            '[data-testid="issue.views.issue-base.foundation.summary.heading"] span',
            '[data-testid="issue.views.issue-base.foundation.summary.heading"] .ak-renderer-document',
            '.issue-summary .ak-renderer-document'
        ];

        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.textContent.trim();
                if (text && text.length > 0) {
                    data.title = text;
                    break;
                }
            }
        }

        // Extract ticket description/summary with comprehensive selectors
        const descriptionSelectors = [
            // Primary selectors for JIRA Cloud
            '[data-testid="issue.views.issue-base.foundation.description.description"]',
            '[data-testid="issue.views.issue-base.foundation.description.description"] .ak-renderer-document',
            '[data-testid="issue.views.issue-base.foundation.description.description"] p',
            '[data-testid="issue.views.issue-base.foundation.description.description"] div',

            // Alternative selectors
            '.description',
            '.description .ak-renderer-document',
            '.description p',
            '.description div',
            '.issue-description',
            '.issue-description .ak-renderer-document',
            '.issue-description p',
            '.issue-description div',

            // More specific selectors
            '[data-testid="issue.views.issue-base.foundation.description.description"] [data-testid="ak-renderer-document"]',
            '.description [data-testid="ak-renderer-document"]',
            '.issue-description [data-testid="ak-renderer-document"]',

            // Legacy selectors
            '.field-body .ak-renderer-document',
            '.field-body p',
            '.field-body div',

            // Generic content selectors
            '[data-testid="ak-renderer-document"]',
            '.ak-renderer-document',
            '.ak-renderer-document p',
            '.ak-renderer-document div'
        ];

        for (const selector of descriptionSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.innerText || element.textContent;
                if (text && text.trim().length > 0) {
                    data.summary = text.trim();
                    break;
                }
            }
            // Also try to get text from child elements
            const childElements = element ? element.querySelectorAll('p, div, span') : [];
            for (const child of childElements) {
                const childText = child.innerText || child.textContent;
                if (childText && childText.trim().length > 10) { // Minimum length to avoid noise
                    data.summary = childText.trim();
                    break;
                }
            }
            if (data.summary) break;
        }

        // If still no description found, try alternative methods
        if (!data.summary) {
            // Try to get description from any field that might contain it
            const possibleDescriptionFields = [
                '[data-testid="issue.views.issue-base.foundation.description.description"]',
                '.description',
                '.issue-description',
                '.field-body',
                '[data-testid="ak-renderer-document"]',
                '.ak-renderer-document'
            ];

            for (const fieldSelector of possibleDescriptionFields) {
                const field = document.querySelector(fieldSelector);
                if (field) {
                    const fieldText = field.innerText || field.textContent;
                    if (fieldText && fieldText.trim().length > 10) {
                        data.summary = fieldText.trim();
                        break;
                    }
                }
            }
        }

        // If still no summary, try to get it from the page content
        if (!data.summary) {
            // Look for any text that might be a description
            const allTextElements = document.querySelectorAll('p, div, span');
            for (const element of allTextElements) {
                const text = element.innerText || element.textContent;
                if (text && text.trim().length > 20 && text.trim().length < 1000) {
                    // Skip if it contains the key or title (to avoid duplicates)
                    if (data.key && text.includes(data.key)) continue;
                    if (data.title && text.includes(data.title)) continue;

                    // Check if it looks like a description (not just navigation or UI text)
                    if (!text.includes('Home') && !text.includes('Projects') && !text.includes('Issues')) {
                        data.summary = text.trim();
                        break;
                    }
                }
            }
        }

        // Clean up the data
        if (data.key) {
            data.key = data.key.replace(/[^\w-]/g, ''); // Remove special characters except dash
        }

        if (data.title) {
            data.title = data.title.replace(/\s+/g, ' ').trim(); // Normalize whitespace
            // Remove the key from title if it's included
            if (data.key && data.title.includes(data.key)) {
                data.title = data.title.replace(data.key, '').trim();
            }
        }

        if (data.summary) {
            data.summary = data.summary.replace(/\s+/g, ' ').trim(); // Normalize whitespace
            // Limit summary length
            if (data.summary.length > 500) {
                data.summary = data.summary.substring(0, 500) + '...';
            }
        }

        // Add URL for reference
        data.url = window.location.href;

        console.log('Extracted JIRA data:', data);
        return data;

    } catch (error) {
        console.error('Error extracting JIRA data:', error);
        return {};
    }
}

// Also expose the function globally for the popup to call
window.extractJiraData = extractJiraData; 