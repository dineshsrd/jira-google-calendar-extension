document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('eventForm');
    const createEventBtn = document.getElementById('createEventBtn');
    const statusDiv = document.getElementById('status');
    const ticketInfoDiv = document.getElementById('ticketInfo');

    // Set default date to today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    document.getElementById('eventDate').value = todayStr;

    // Set default time to current time + 1 hour
    const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
    const timeStr = nextHour.toTimeString().slice(0, 5);
    document.getElementById('eventTime').value = timeStr;

    // Extract JIRA ticket information when popup opens
    extractJiraTicketInfo();

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        createCalendarEvent();
    });

    async function extractJiraTicketInfo() {
        try {
            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Check if we're on a JIRA page
            if (tab.url && tab.url.includes('atlassian.net')) {
                console.log('Extracting JIRA data from:', tab.url);

                // Execute content script to extract JIRA data
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: extractJiraData
                });

                if (results && results[0] && results[0].result) {
                    const jiraData = results[0].result;
                    console.log('Extracted JIRA data:', jiraData);

                    // Display ticket info
                    document.getElementById('ticketKey').textContent = jiraData.key || 'N/A';
                    document.getElementById('ticketTitle').textContent = jiraData.title || 'N/A';
                    document.getElementById('ticketSummary').textContent = jiraData.summary || 'N/A';
                    ticketInfoDiv.style.display = 'block';

                    // Pre-fill form with JIRA data
                    // Use JIRA ID as event title (as requested)
                    if (jiraData.key) {
                        console.log('Setting event title to:', jiraData.key);
                        document.getElementById('eventTitle').value = jiraData.key;
                    }
                    // Use JIRA title as event description (as requested)
                    if (jiraData.title) {
                        console.log('Setting event description to:', jiraData.title);
                        document.getElementById('eventDescription').value = jiraData.title;
                    } else {
                        console.log('No JIRA title found');
                    }
                } else {
                    console.log('No JIRA data extracted');
                }
            } else {
                console.log('Not on a JIRA page:', tab.url);
            }
        } catch (error) {
            console.error('Error extracting JIRA data:', error);
        }
    }

    async function createCalendarEvent() {
        const createEventBtn = document.getElementById('createEventBtn');
        const statusDiv = document.getElementById('status');

        // Disable button and show loading
        createEventBtn.disabled = true;
        createEventBtn.textContent = 'Creating Event...';
        hideStatus();

        try {
            const formData = {
                title: document.getElementById('eventTitle').value,
                description: document.getElementById('eventDescription').value,
                date: document.getElementById('eventDate').value,
                time: document.getElementById('eventTime').value,
                duration: parseInt(document.getElementById('eventDuration').value),
                participants: document.getElementById('participants').value,
                calendarType: document.getElementById('calendarType').value
            };

            // Validate form data
            if (!formData.title || !formData.description || !formData.date || !formData.time) {
                throw new Error('Please fill in all required fields');
            }

            // Create calendar event based on type
            if (formData.calendarType === 'google') {
                await createGoogleCalendarEvent(formData);
            } else if (formData.calendarType === 'outlook') {
                await createOutlookCalendarEvent(formData);
            }

            showStatus('Event created successfully!', 'success');
            form.reset();

            // Reset default values
            document.getElementById('eventDate').value = todayStr;
            document.getElementById('eventTime').value = timeStr;

        } catch (error) {
            console.error('Error creating calendar event:', error);
            showStatus(`Error: ${error.message}`, 'error');
        } finally {
            // Re-enable button
            createEventBtn.disabled = false;
            createEventBtn.textContent = 'Create Calendar Event';
        }
    }

    async function createGoogleCalendarEvent(formData) {
        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60 * 1000);

        // Format dates for Google Calendar
        const startDate = startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        // Create Google Calendar URL
        const calendarUrl = new URL('https://calendar.google.com/calendar/render');
        calendarUrl.searchParams.set('action', 'TEMPLATE');
        calendarUrl.searchParams.set('text', formData.title);
        calendarUrl.searchParams.set('dates', `${startDate}/${endDate}`);
        calendarUrl.searchParams.set('details', formData.description);

        if (formData.participants) {
            const emails = formData.participants.split(',').map(email => email.trim()).filter(email => email);
            if (emails.length > 0) {
                calendarUrl.searchParams.set('add', emails.join(','));
            }
        }

        // Open Google Calendar in new tab
        await chrome.tabs.create({ url: calendarUrl.toString() });
    }

    async function createOutlookCalendarEvent(formData) {
        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60 * 1000);

        // Format dates for Outlook Calendar
        const startDate = startDateTime.toISOString();
        const endDate = endDateTime.toISOString();

        // Create Outlook Calendar URL
        const calendarUrl = new URL('https://outlook.office.com/calendar/0/deeplink/compose');
        calendarUrl.searchParams.set('subject', formData.title);
        calendarUrl.searchParams.set('startdt', startDate);
        calendarUrl.searchParams.set('enddt', endDate);
        calendarUrl.searchParams.set('body', formData.description);

        if (formData.participants) {
            const emails = formData.participants.split(',').map(email => email.trim()).filter(email => email);
            if (emails.length > 0) {
                calendarUrl.searchParams.set('to', emails.join(','));
            }
        }

        // Open Outlook Calendar in new tab
        await chrome.tabs.create({ url: calendarUrl.toString() });
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
    }

    function hideStatus() {
        statusDiv.style.display = 'none';
    }
});

// Function to extract JIRA data (will be executed in content script context)
function extractJiraData() {
    try {
        // Try different selectors for JIRA ticket information
        const selectors = {
            // JIRA Cloud selectors
            key: [
                '[data-testid="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"]',
                '.issue-link',
                '[data-testid="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"] span',
                '.aui-breadcrumb-current'
            ],
            title: [
                '[data-testid="issue.views.issue-base.foundation.summary.heading"]',
                'h1[data-testid="issue.views.issue-base.foundation.summary.heading"]',
                '.issue-summary',
                'h1',
                '[data-testid="issue.views.issue-base.foundation.summary.heading"] h1'
            ],
            summary: [
                '[data-testid="issue.views.issue-base.foundation.description.description"]',
                '.description',
                '[data-testid="issue.views.issue-base.foundation.description.description"] .ak-renderer-document',
                '.description .ak-renderer-document'
            ]
        };

        const data = {};

        // Extract key
        for (const selector of selectors.key) {
            const element = document.querySelector(selector);
            if (element) {
                data.key = element.textContent.trim();
                break;
            }
        }

        // Extract title
        for (const selector of selectors.title) {
            const element = document.querySelector(selector);
            if (element) {
                data.title = element.textContent.trim();
                break;
            }
        }

        // Extract summary/description
        for (const selector of selectors.summary) {
            const element = document.querySelector(selector);
            if (element) {
                data.summary = element.textContent.trim();
                break;
            }
        }

        // If no summary found, try to get it from the description field
        if (!data.summary) {
            const descriptionField = document.querySelector('[data-testid="issue.views.issue-base.foundation.description.description"]');
            if (descriptionField) {
                const descriptionText = descriptionField.innerText || descriptionField.textContent;
                if (descriptionText) {
                    data.summary = descriptionText.trim();
                }
            }
        }

        // Clean up the data
        if (data.key) {
            data.key = data.key.replace(/[^\w-]/g, ''); // Remove special characters except dash
        }

        if (data.title) {
            data.title = data.title.replace(/\s+/g, ' ').trim(); // Normalize whitespace
        }

        if (data.summary) {
            data.summary = data.summary.replace(/\s+/g, ' ').trim(); // Normalize whitespace
            // Limit summary length
            if (data.summary.length > 500) {
                data.summary = data.summary.substring(0, 500) + '...';
            }
        }

        return data;
    } catch (error) {
        console.error('Error extracting JIRA data:', error);
        return {};
    }
} 