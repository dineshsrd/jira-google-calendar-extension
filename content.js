// Content script for JIRA pages
// This script runs on JIRA pages and can extract ticket information

console.log('JIRA to Calendar extension loaded');

// Create floating icon
function createFloatingIcon() {
    // Remove existing icon if present
    const existingIcon = document.getElementById('jira-calendar-floating-icon');
    if (existingIcon) {
        existingIcon.remove();
    }

    // Create floating icon container
    const floatingIcon = document.createElement('div');
    floatingIcon.id = 'jira-calendar-floating-icon';
    floatingIcon.innerHTML = `
        <div class="jira-calendar-icon-inner">
            <span>📅</span>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        #jira-calendar-floating-icon {
            position: fixed;
            right: 20px;
            bottom: 20px;
            transform: none;
            z-index: 10000;
            cursor: pointer;
            user-select: none;
            transition: transform 0.2s ease;
        }
        
        #jira-calendar-floating-icon:hover {
            transform: translateY(-50%) scale(1.1);
        }
        
        .jira-calendar-icon-inner {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #0052cc, #0747a6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 82, 204, 0.3);
            border: 2px solid white;
            font-size: 20px;
            color: white;
        }
        
        .jira-calendar-icon-inner:hover {
            box-shadow: 0 6px 16px rgba(0, 82, 204, 0.4);
        }
        
        #jira-calendar-floating-icon.dragging {
            cursor: grabbing;
        }
        
        #jira-calendar-floating-icon.dragging .jira-calendar-icon-inner {
            box-shadow: 0 8px 20px rgba(0, 82, 204, 0.5);
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(floatingIcon);

    // Add drag functionality
    let isDragging = false;
    let startY = 0;
    let startTop = 0;

    floatingIcon.addEventListener('mousedown', function (e) {
        if (e.target.closest('.jira-calendar-icon-inner')) {
            isDragging = true;
            startY = e.clientY;
            startTop = parseInt(window.getComputedStyle(floatingIcon).top);
            floatingIcon.classList.add('dragging');
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            const deltaY = e.clientY - startY;
            const newTop = Math.max(20, Math.min(window.innerHeight - 70, startTop + deltaY));
            floatingIcon.style.top = newTop + 'px';
            floatingIcon.style.transform = 'none';
        }
    });

    document.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            floatingIcon.classList.remove('dragging');
        }
    });

    // Add click functionality to open popup
    floatingIcon.addEventListener('click', function (e) {
        if (!isDragging) {
            openEventCreationForm();
        }
    });

    return floatingIcon;
}

// Function to open event creation form
function openEventCreationForm() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'jira-calendar-modal';
    modal.innerHTML = `
        <div class="jira-calendar-modal-overlay">
            <div class="jira-calendar-modal-content">
                <div class="jira-calendar-modal-header">
                    <h3>🎯 Create Calendar Event</h3>
                    <button class="jira-calendar-close-btn">&times;</button>
                </div>
                <div class="jira-calendar-modal-body">
                    <div class="form-group">
                        <label for="eventTitle">Event Title:</label>
                        <input type="text" id="eventTitle" placeholder="Event title" required>
                    </div>
                    <div class="form-group">
                        <label for="eventDescription">Event Description:</label>
                        <textarea id="eventDescription" placeholder="Event description" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="eventDate">Event Date:</label>
                        <input type="date" id="eventDate" required>
                    </div>
                    <div class="form-group">
                        <label for="eventTime">Event Time:</label>
                        <input type="time" id="eventTime" required>
                    </div>
                    <div class="form-group">
                        <label for="eventDuration">Duration:</label>
                        <select id="eventDuration">
                            <option value="15" selected>15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="75">1 hour 15 minutes</option>
                            <option value="90">1.5 hours</option>
                            <option value="105">1 hour 45 minutes</option>
                            <option value="120">2 hours</option>
                            <option value="150">2.5 hours</option>
                            <option value="180">3 hours</option>
                            <option value="240">4 hours</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="participants">Participants (comma-separated emails):</label>
                        <input type="text" id="participants" placeholder="email1@example.com, email2@example.com">
                    </div>
                    <div class="form-group">
                        <label for="calendarType">Calendar Type:</label>
                        <select id="calendarType">
                            <option value="google">Google Calendar</option>
                        </select>
                    </div>
                    <button type="button" id="createEventBtn" class="jira-calendar-btn">Create Calendar Event</button>
                </div>
            </div>
        </div>
    `;

    // Add modal styles
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        #jira-calendar-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10001;
        }
        
        .jira-calendar-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .jira-calendar-modal-content {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .jira-calendar-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e1e5e9;
        }
        
        .jira-calendar-modal-header h3 {
            margin: 0;
            color: #172b4d;
        }
        
        .jira-calendar-close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b778c;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .jira-calendar-close-btn:hover {
            color: #172b4d;
        }
        
        .jira-calendar-modal-body {
            padding: 20px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #172b4d;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 8px;
            border: 1px solid #dfe1e6;
            border-radius: 3px;
            font-size: 14px;
            box-sizing: border-box;
        }
        
        .form-group textarea {
            resize: vertical;
            min-height: 60px;
        }
        
        .jira-calendar-btn {
            background-color: #0052cc;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 14px;
            width: 100%;
            margin-top: 10px;
        }
        
        .jira-calendar-btn:hover {
            background-color: #0047b3;
        }
        
        .jira-calendar-btn:disabled {
            background-color: #c1c7d0;
            cursor: not-allowed;
        }
    `;

    document.head.appendChild(modalStyle);
    document.body.appendChild(modal);

    // Set default values
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    document.getElementById('eventDate').value = todayStr;

    const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
    const timeStr = nextHour.toTimeString().slice(0, 5);
    document.getElementById('eventTime').value = timeStr;

    // Extract and fill JIRA data
    const jiraData = extractJiraData();
    if (jiraData.key) {
        document.getElementById('eventTitle').value = "[Discussion]: " + jiraData.key;
    }
    if (jiraData.title) {
        let descriptionWithUrl = jiraData.title;
        if (window.location.href) {
            descriptionWithUrl = `${jiraData.title}\n\nJIRA Link: ${window.location.href}`;
        }
        document.getElementById('eventDescription').value = descriptionWithUrl;
    }

    // Add event listeners
    document.querySelector('.jira-calendar-close-btn').addEventListener('click', function () {
        modal.remove();
    });

    document.getElementById('createEventBtn').addEventListener('click', function () {
        createCalendarEvent();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Function to create calendar event
async function createCalendarEvent() {
    const createEventBtn = document.getElementById('createEventBtn');

    // Disable button and show loading
    createEventBtn.disabled = true;
    createEventBtn.textContent = 'Creating Event...';

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

        // Create Google Calendar event
        await createGoogleCalendarEvent(formData);

        // Close modal and show success
        document.getElementById('jira-calendar-modal').remove();
        showNotification('Event created successfully!', 'success');

    } catch (error) {
        console.error('Error creating calendar event:', error);
        showNotification(`Error: ${error.message}`, 'error');
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
    window.open(calendarUrl.toString(), '_blank');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `jira-calendar-notification ${type}`;
    notification.textContent = message;

    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .jira-calendar-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 10002;
            animation: slideIn 0.3s ease;
        }
        
        .jira-calendar-notification.success {
            background-color: #36b37e;
        }
        
        .jira-calendar-notification.error {
            background-color: #ff5630;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;

    document.head.appendChild(notificationStyle);
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize floating icon when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingIcon);
} else {
    createFloatingIcon();
}

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

        console.log('Extracted JIRA data:', data);
        return data;

    } catch (error) {
        console.error('Error extracting JIRA data:', error);
        return {};
    }
}

// Also expose the function globally for the popup to call
window.extractJiraData = extractJiraData; 