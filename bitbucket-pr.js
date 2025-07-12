// Bitbucket PR Floating Button Content Script
(function () {
    // Helper: Check if current page is a Bitbucket PR page
    function isBitbucketPRPage() {
        // Example: https://bitbucket.org/<workspace>/<repo>/pull-requests/<id>
        return /^https:\/\/bitbucket\.org\/.+\/.+\/pull\-requests\/[0-9]+/.test(window.location.href);
    }

    // Helper: Extract PR info from Bitbucket PR page
    function extractPRInfo() {
        let prTitle = '';
        let prDescription = '';
        // Bitbucket Cloud selectors (as of 2024)
        const titleEl = document.querySelector('[data-qa="pr-title"]') || document.querySelector('h1[data-qa="pull-request-title"]') || document.querySelector('h1');
        if (titleEl) prTitle = titleEl.textContent.trim();
        // Try multiple selectors for description
        let descEl =
            document.querySelector('[data-qa="pr-description"]') ||
            document.querySelector('.pull-request-description') ||
            document.querySelector('[data-qa="pull-request-description-content"]') ||
            document.querySelector('section[data-qa="pull-request-description"]') ||
            document.querySelector('.css-1p4va6y') ||
            document.querySelector('.markdown-body') ||
            document.querySelector('.sc-gzVnrw'); // fallback for styled-components
        if (descEl && descEl.textContent.trim().length > 0) {
            prDescription = descEl.textContent.trim();
        } else {
            // Fallback: try to get the first large text block under the PR title
            if (titleEl) {
                let next = titleEl.parentElement;
                while (next && next.nextElementSibling) {
                    next = next.nextElementSibling;
                    if (next && next.textContent && next.textContent.trim().length > 20) {
                        prDescription = next.textContent.trim();
                        break;
                    }
                }
            }
        }
        return {
            url: window.location.href,
            title: prTitle,
            description: prDescription
        };
    }

    // Helper: Remove existing button/modal if present
    function removeExisting() {
        const btn = document.getElementById('bitbucket-pr-floating-btn');
        if (btn) btn.remove();
        const modal = document.getElementById('bitbucket-pr-modal');
        if (modal) modal.remove();
        const style = document.getElementById('bitbucket-pr-style');
        if (style) style.remove();
    }

    // Create floating button
    function createFloatingButton() {
        removeExisting();
        const btn = document.createElement('div');
        btn.id = 'bitbucket-pr-floating-btn';
        btn.innerHTML = '<span>🔗</span>';
        btn.title = 'Copy PR info';
        document.body.appendChild(btn);
        // Style
        const style = document.createElement('style');
        style.id = 'bitbucket-pr-style';
        style.textContent = `
            #bitbucket-pr-floating-btn {
                position: fixed;
                right: 20px;
                bottom: 20px;
                transform: none;
                z-index: 10000;
                background: linear-gradient(135deg, #2684FF, #0052CC);
                color: white;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 0 4px 12px rgba(38, 132, 255, 0.3);
                border: 2px solid white;
                cursor: pointer;
                user-select: none;
                transition: transform 0.2s ease;
            }
            #bitbucket-pr-floating-btn:hover {
                transform: translateY(-50%) scale(1.1);
            }
            #bitbucket-pr-floating-btn.dragging {
                cursor: grabbing;
            }
            #bitbucket-pr-modal {
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0,0,0,0.4);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .bitbucket-pr-modal-content {
                background: #fff;
                border-radius: 8px;
                max-width: 420px;
                width: 90vw;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                padding: 24px 20px 20px 20px;
                position: relative;
            }
            .bitbucket-pr-modal-content h3 {
                margin-top: 0;
                color: #0052CC;
                font-size: 20px;
            }
            .bitbucket-pr-close-btn {
                position: absolute;
                top: 12px;
                right: 16px;
                background: none;
                border: none;
                font-size: 24px;
                color: #6b778c;
                cursor: pointer;
            }
            .bitbucket-pr-close-btn:hover {
                color: #0052CC;
            }
            .bitbucket-pr-summary {
                background: #f4f5f7;
                border-left: 3px solid #2684FF;
                padding: 10px;
                border-radius: 3px;
                margin-bottom: 15px;
                font-size: 14px;
                word-break: break-word;
            }
            .bitbucket-pr-copy-btn {
                background: #2684FF;
                color: white;
                border: none;
                border-radius: 3px;
                padding: 10px 20px;
                font-size: 15px;
                cursor: pointer;
                width: 100%;
                margin-top: 10px;
            }
            .bitbucket-pr-copy-btn:hover {
                background: #0052CC;
            }
            .bitbucket-pr-copied {
                color: #36b37e;
                font-size: 14px;
                margin-top: 8px;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
        // Drag functionality
        let isDragging = false;
        let startY = 0;
        let startTop = 0;
        btn.addEventListener('mousedown', function (e) {
            isDragging = true;
            startY = e.clientY;
            startTop = parseInt(window.getComputedStyle(btn).top);
            btn.classList.add('dragging');
            e.preventDefault();
        });
        document.addEventListener('mousemove', function (e) {
            if (isDragging) {
                const deltaY = e.clientY - startY;
                const newTop = Math.max(20, Math.min(window.innerHeight - 70, startTop + deltaY));
                btn.style.top = newTop + 'px';
                btn.style.transform = 'none';
            }
        });
        document.addEventListener('mouseup', function () {
            if (isDragging) {
                isDragging = false;
                btn.classList.remove('dragging');
            }
        });
        // Click handler (only if not dragging)
        btn.addEventListener('click', function (e) {
            if (!isDragging) {
                openPRModal();
            }
        });
    }

    // Modal
    function openPRModal() {
        // Only remove the modal if it exists, not the button or style
        const existingModal = document.getElementById('bitbucket-pr-modal');
        if (existingModal) existingModal.remove();
        const pr = extractPRInfo();
        const modal = document.createElement('div');
        modal.id = 'bitbucket-pr-modal';
        modal.innerHTML = `
            <div class="bitbucket-pr-modal-content">
                <button class="bitbucket-pr-close-btn" title="Close">&times;</button>
                <h3>Bitbucket PR Info</h3>
                <div class="bitbucket-pr-summary" id="bitbucket-pr-summary-block">
                    <div style="margin-bottom: 15px;">
                        <strong>Custom Message:</strong><br>
                        <input type="text" id="custom-message" value="@teamx Can someone please review and merge the below PR?" style="width: 100%; max-width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #ddd; border-radius: 3px; margin-top: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Summary:</strong><br/>
                        <strong>${pr.title || 'N/A'}</strong><br/>
                        ${pr.description || 'N/A'}
                    </div>
                    <div>
                        <strong>PR Link:</strong><br>
                        ${pr.url ? `<a href="${pr.url}" target="_blank">${pr.url}</a>` : 'N/A'}
                    </div>
                </div>
                <button class="bitbucket-pr-copy-btn">Copy to Clipboard</button>
                <button class="bitbucket-pr-schedule-btn" style="background:#36b37e; color:white; border:none; border-radius:3px; padding:10px 20px; font-size:15px; cursor:pointer; width:100%; margin-top:10px;">Schedule Meeting</button>
                <div class="bitbucket-pr-copied" style="display:none;">Copied!</div>
            </div>
        `;
        document.body.appendChild(modal);
        // Close
        modal.querySelector('.bitbucket-pr-close-btn').onclick = () => {
            modal.remove();
            createFloatingButton();
        };
        // Copy to clipboard
        modal.querySelector('.bitbucket-pr-copy-btn').onclick = () => {
            const customMessage = document.getElementById('custom-message').value;
            // PR Link at the end, only show Summary
            const text = `${customMessage}\n\nSummary: ${pr.title || 'N/A'}\n\nPR Link: ${pr.url}`;
            navigator.clipboard.writeText(text).then(() => {
                const copied = modal.querySelector('.bitbucket-pr-copied');
                copied.style.display = 'block';
                setTimeout(() => { copied.style.display = 'none'; }, 1500);
            });
        };
        // Schedule Meeting button
        modal.querySelector('.bitbucket-pr-schedule-btn').onclick = () => {
            modal.remove();
            openScheduleMeetingModal(pr);
        };
        // Close modal on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                createFloatingButton();
            }
        };
    }

    // Schedule Meeting Modal
    function openScheduleMeetingModal(pr) {
        // Remove any existing modal
        const existingModal = document.getElementById('bitbucket-pr-modal');
        if (existingModal) existingModal.remove();
        const modal = document.createElement('div');
        modal.id = 'bitbucket-pr-modal';
        // Default values
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
        const timeStr = nextHour.toTimeString().slice(0, 5);
        modal.innerHTML = `
            <div class="bitbucket-pr-modal-content">
                <button class="bitbucket-pr-close-btn" title="Close">&times;</button>
                <h3>Schedule Meeting for PR</h3>
                <div class="form-group">
                    <label for="eventType">Event Type:</label>
                    <select id="eventType">
                        <option value="meeting">Meeting</option>
                        <option value="focus">Focus Time</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="eventTitle">Event Title:</label>
                    <input type="text" id="eventTitle" value="[Discussion]: ${pr.title || ''}" required>
                </div>
                <div class="form-group">
                    <label for="eventDescription">Event Description:</label>
                    <textarea id="eventDescription" required>${pr.description ? pr.description + '\n\nPR Link: ' + pr.url : 'PR Link: ' + pr.url}</textarea>
                </div>
                <div class="form-group">
                    <label for="eventDate">Event Date:</label>
                    <input type="date" id="eventDate" value="${todayStr}" required>
                </div>
                <div class="form-group">
                    <label for="eventTime">Event Time:</label>
                    <input type="time" id="eventTime" value="${timeStr}" required>
                </div>
                <div class="form-group">
                    <label for="eventDuration">Duration:</label>
                    <select id="eventDuration">
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60" selected>1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                    </select>
                </div>
                <div class="form-group" id="participantsGroup">
                    <label for="participants">Participants (comma-separated emails):</label>
                    <input type="text" id="participants" placeholder="email1@example.com, email2@example.com">
                </div>
                <div class="form-group">
                    <label for="calendarType">Calendar Type:</label>
                    <select id="calendarType">
                        <option value="google">Google Calendar</option>
                        <option value="outlook">Outlook Calendar</option>
                    </select>
                </div>
                <button type="button" id="createEventBtn" class="bitbucket-pr-copy-btn" style="background:#0052CC;">Create Calendar Event</button>
            </div>
        `;
        document.body.appendChild(modal);
        // Close
        modal.querySelector('.bitbucket-pr-close-btn').onclick = () => {
            modal.remove();
            createFloatingButton();
        };
        // Handle event type changes
        modal.querySelector('#eventType').addEventListener('change', function () {
            handleEventTypeChange(pr);
        });
        // Create Event
        modal.querySelector('#createEventBtn').onclick = async () => {
            const formData = {
                title: document.getElementById('eventTitle').value,
                description: document.getElementById('eventDescription').value,
                date: document.getElementById('eventDate').value,
                time: document.getElementById('eventTime').value,
                duration: parseInt(document.getElementById('eventDuration').value),
                participants: document.getElementById('eventType').value === 'focus' ? '' : document.getElementById('participants').value,
                calendarType: document.getElementById('calendarType').value
            };
            if (!formData.title || !formData.description || !formData.date || !formData.time) {
                alert('Please fill in all required fields');
                return;
            }
            if (formData.calendarType === 'google') {
                createGoogleCalendarEvent(formData);
            } else if (formData.calendarType === 'outlook') {
                createOutlookCalendarEvent(formData);
            }
            modal.remove();
            createFloatingButton();
        };
        // Close modal on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                createFloatingButton();
            }
        };
    }

    function handleEventTypeChange(pr) {
        const eventType = document.getElementById('eventType').value;
        const participantsGroup = document.getElementById('participantsGroup');
        const eventTitle = document.getElementById('eventTitle');

        if (eventType === 'focus') {
            // Hide participants for focus time
            participantsGroup.style.display = 'none';

            // Update title to use PR title
            if (pr.title) {
                eventTitle.value = `🎯 Focusing on: ${pr.title}`;
            }
        } else {
            // Show participants for meetings
            participantsGroup.style.display = 'block';

            // Update title to use PR title
            if (pr.title) {
                eventTitle.value = "[Discussion]: " + pr.title;
            }
        }
    }

    function createGoogleCalendarEvent(formData) {
        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60 * 1000);
        const startDate = startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const calendarUrl = new URL('https://calendar.google.com/calendar/render');
        calendarUrl.searchParams.set('action', 'TEMPLATE');
        calendarUrl.searchParams.set('text', formData.title);
        calendarUrl.searchParams.set('dates', `${startDate}/${endDate}`);
        calendarUrl.searchParams.set('details', formData.description);
        if (formData.participants && formData.participants.trim()) {
            const emails = formData.participants.split(',').map(email => email.trim()).filter(email => email);
            if (emails.length > 0) {
                calendarUrl.searchParams.set('add', emails.join(','));
            }
        }
        window.open(calendarUrl.toString(), '_blank');
    }

    function createOutlookCalendarEvent(formData) {
        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60 * 1000);
        const startDate = startDateTime.toISOString();
        const endDate = endDateTime.toISOString();
        const calendarUrl = new URL('https://outlook.office.com/calendar/0/deeplink/compose');
        calendarUrl.searchParams.set('subject', formData.title);
        calendarUrl.searchParams.set('startdt', startDate);
        calendarUrl.searchParams.set('enddt', endDate);
        calendarUrl.searchParams.set('body', formData.description);
        if (formData.participants && formData.participants.trim()) {
            const emails = formData.participants.split(',').map(email => email.trim()).filter(email => email);
            if (emails.length > 0) {
                calendarUrl.searchParams.set('to', emails.join(','));
            }
        }
        window.open(calendarUrl.toString(), '_blank');
    }

    // Observe for SPA navigation (Bitbucket is SPA)
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(() => {
                if (isBitbucketPRPage()) {
                    createFloatingButton();
                } else {
                    removeExisting();
                }
            }, 500);
        }
    }).observe(document.body, { childList: true, subtree: true });

    // Initial load
    if (isBitbucketPRPage()) {
        createFloatingButton();
    }
})(); 