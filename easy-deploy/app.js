// Simple JavaScript for Reflect Web App
// This makes the app work without any complex setup

// Check if user is logged in when page loads
window.onload = function () {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showMainApp();
    }
    loadEntries();
};

// Handle PIN input
const pinInput = document.getElementById('pin-input');
pinInput.addEventListener('input', function (e) {
    const pin = e.target.value;

    // Update the dots to show how many numbers typed
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById(`pin${i}`);
        if (i <= pin.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    }

    // Check if PIN is correct (demo PIN: 1234)
    if (pin.length === 4) {
        if (pin === '1234') {
            localStorage.setItem('isLoggedIn', 'true');
            showMainApp();
        } else {
            alert('Wrong PIN! Try 1234');
            e.target.value = '';
            document.querySelectorAll('.pin-dot').forEach(dot => dot.classList.remove('filled'));
        }
    }
});

// Show main app after login
function showMainApp() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('main-app').classList.add('active');
}

// Switch between Journal, Chat, and Settings
function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    // Show selected view
    if (viewName === 'journal') {
        document.getElementById('journal-view').classList.add('active');
        document.getElementById('screen-title').textContent = 'My Journal';
        document.querySelectorAll('.nav-item')[0].classList.add('active');
    } else if (viewName === 'chat') {
        document.getElementById('chat-view').classList.add('active');
        document.getElementById('screen-title').textContent = 'AI Chat';
        document.querySelectorAll('.nav-item')[1].classList.add('active');
    } else if (viewName === 'settings') {
        document.getElementById('settings-view').classList.add('active');
        document.getElementById('screen-title').textContent = 'Settings';
        document.querySelectorAll('.nav-item')[2].classList.add('active');
    }
}

// Show/hide menu
function toggleMenu() {
    const menu = document.getElementById('menu-dropdown');
    menu.classList.toggle('active');
}

// Logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    location.reload();
}

// Show new entry form
function showNewEntry() {
    document.getElementById('new-entry-modal').classList.add('active');
}

// Close new entry form
function closeNewEntry() {
    document.getElementById('new-entry-modal').classList.remove('active');
    // Clear the form
    document.getElementById('entry-title').value = '';
    document.getElementById('entry-content').value = '';
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
}

// Handle mood selection
let selectedMood = '';
document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        selectedMood = this.dataset.mood;
    });
});

// Save journal entry
function saveEntry() {
    const title = document.getElementById('entry-title').value;
    const content = document.getElementById('entry-content').value;

    if (!title || !content) {
        alert('Please fill in both title and content!');
        return;
    }

    // Create entry object
    const entry = {
        id: Date.now(),
        title: title,
        content: content,
        mood: selectedMood || '😐',
        date: new Date().toISOString()
    };

    // Get existing entries or create empty array
    let entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');

    // Add new entry at the beginning
    entries.unshift(entry);

    // Save back to localStorage
    localStorage.setItem('journalEntries', JSON.stringify(entries));

    // Close modal and refresh list
    closeNewEntry();
    loadEntries();

    // Show success message
    showToast('Entry saved successfully!');
}

// Load and display journal entries
function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const entriesList = document.getElementById('entries-list');

    if (entries.length === 0) {
        entriesList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-book" style="font-size: 48px; margin-bottom: 20px;"></i>
                <p>No entries yet. Tap the + button to create your first entry!</p>
            </div>
        `;
        return;
    }

    entriesList.innerHTML = entries.map(entry => `
        <div class="entry-card" onclick="viewEntry(${entry.id})">
            <div class="entry-header">
                <span class="entry-date">${formatDate(entry.date)}</span>
                <span class="entry-mood">${entry.mood}</span>
            </div>
            <div class="entry-title">${entry.title}</div>
            <div class="entry-preview">${entry.content}</div>
        </div>
    `).join('');
}

// Format date nicely
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// View full entry (for now just alert)
function viewEntry(id) {
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const entry = entries.find(e => e.id === id);
    if (entry) {
        alert(`${entry.title}\n\n${entry.content}\n\nMood: ${entry.mood}`);
    }
}

// Search entries
document.getElementById('search-input').addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');

    const filtered = entries.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm) ||
        entry.content.toLowerCase().includes(searchTerm)
    );

    const entriesList = document.getElementById('entries-list');
    if (filtered.length === 0) {
        entriesList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No entries found</p>';
    } else {
        entriesList.innerHTML = filtered.map(entry => `
            <div class="entry-card" onclick="viewEntry(${entry.id})">
                <div class="entry-header">
                    <span class="entry-date">${formatDate(entry.date)}</span>
                    <span class="entry-mood">${entry.mood}</span>
                </div>
                <div class="entry-title">${entry.title}</div>
                <div class="entry-preview">${entry.content}</div>
            </div>
        `).join('');
    }
});

// AI Chat functionality
let chatHistory = [];

// Send message in chat
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addMessage(message, 'user');

    // Clear input
    input.value = '';

    // Simulate AI response after a short delay
    setTimeout(() => {
        const response = getAIResponse(message);
        addMessage(response, 'ai');
    }, 1000);
}

// Add message to chat
function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${sender === 'ai' ? 'robot' : 'user'}"></i>
        </div>
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Save to history
    chatHistory.push({ text, sender, time: new Date() });
}

// Simple AI responses (in real app, this would use actual AI)
function getAIResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Simple responses based on keywords
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! How are you feeling today? I'm here to listen and help you reflect on your thoughts.";
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
        return "I hear that you're feeling down. It's okay to have these feelings. Would you like to talk about what's been on your mind?";
    } else if (lowerMessage.includes('angry') || lowerMessage.includes('mad')) {
        return "It sounds like you're experiencing some strong emotions. Taking time to acknowledge anger is healthy. What situation triggered these feelings?";
    } else if (lowerMessage.includes('happy') || lowerMessage.includes('good')) {
        return "That's wonderful to hear! Celebrating positive moments is important. What's been bringing you joy lately?";
    } else if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
        return "Anxiety can be challenging. Remember to take deep breaths. What specific worries are on your mind right now?";
    } else if (lowerMessage.includes('help')) {
        return "I'm here to help you reflect and process your thoughts. You can tell me about your day, your feelings, or anything on your mind. What would you like to explore?";
    } else {
        const responses = [
            "That's interesting. Can you tell me more about that?",
            "I understand. How does that make you feel?",
            "Thank you for sharing. What thoughts come up when you reflect on this?",
            "I hear you. What would you like to explore about this further?",
            "That's a valid perspective. What do you think led to these thoughts?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Handle Enter key in chat
document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Export data
function exportData() {
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `reflect-journal-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showToast('Journal exported successfully!');
}

// Clear all data
function clearData() {
    if (confirm('Are you sure? This will delete all your journal entries and cannot be undone!')) {
        localStorage.removeItem('journalEntries');
        localStorage.removeItem('isLoggedIn');
        location.reload();
    }
}

// Show toast notification
function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        z-index: 1000;
        animation: slideUp 0.3s ease-out;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Close menu when clicking outside
document.addEventListener('click', function (e) {
    const menu = document.getElementById('menu-dropdown');
    const menuBtn = document.querySelector('.menu-btn');

    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
        menu.classList.remove('active');
    }
});
