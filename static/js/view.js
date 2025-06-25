// Global variables
let currentTheme = localStorage.getItem('theme') || 'light';
let currentZine = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    bindEventListeners();
    loadZines();
});

// Theme Management
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggle();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeToggle();
}

function updateThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    themeToggle.title = `Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`;
}

// Event Listeners
function bindEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Help button
    document.getElementById('helpBtn').addEventListener('click', showHelp);
    
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', loadZines);
    
    // Modal close buttons
    document.getElementById('closeModal').addEventListener('click', closeModal);
    
    // Modal actions
    document.getElementById('exportModalBtn').addEventListener('click', exportCurrentZine);
    document.getElementById('deleteModalBtn').addEventListener('click', deleteCurrentZine);
    
    // Modal click outside to close
    document.getElementById('viewModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            closeModal();
        }
        
        // R to refresh
        if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            loadZines();
        }
    });
}

// Load and Display Zines
async function loadZines() {
    const container = document.getElementById('zinesContainer');
    const noZines = document.getElementById('noZines');
    const refreshBtn = document.getElementById('refreshBtn');
    
    try {
        refreshBtn.disabled = true;
        container.innerHTML = '<div class="loading">Loading zines...</div>';
        noZines.style.display = 'none';
        
        const response = await fetch('/zines');
        const zines = await response.json();
        
        if (!response.ok) {
            throw new Error(zines.error || 'Failed to load zines');
        }
        
        if (zines.length === 0) {
            container.innerHTML = '';
            noZines.style.display = 'block';
        } else {
            displayZines(zines);
            noZines.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Load error:', error);
        container.innerHTML = `<div class="loading" style="color: var(--accent-danger);">Error loading zines: ${error.message}</div>`;
        showMessage('Failed to load zines. Please try again.', 'error');
    } finally {
        refreshBtn.disabled = false;
    }
}

function displayZines(zines) {
    const container = document.getElementById('zinesContainer');
    
    const zinesHtml = zines.map(zine => `
        <div class="zine-card" data-zine-id="${zine.id}">
            <h3>${escapeHtml(zine.title)}</h3>
            <div class="zine-meta">
                Created: ${formatDate(zine.created_at)}
            </div>
            <div class="zine-preview">
                ${escapeHtml(zine.preview)}
            </div>
            <div class="zine-actions">
                <button class="btn btn-primary view-btn" onclick="viewZine('${zine.id}')">
                    👁️ View
                </button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = zinesHtml;
}

// View Zine Modal
async function viewZine(zineId) {
    try {
        const response = await fetch(`/zine/${zineId}`);
        const zine = await response.json();
        
        if (!response.ok) {
            throw new Error(zine.error || 'Failed to load zine');
        }
        
        currentZine = zine;
        
        // Update modal content
        document.getElementById('modalTitle').textContent = zine.title;
        document.getElementById('modalContent').innerHTML = `
            <div class="zine-meta" style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
                <strong>Created:</strong> ${formatDate(zine.created_at)}<br>
                <strong>Last Updated:</strong> ${formatDate(zine.updated_at)}
            </div>
            <div class="preview-content">
                ${marked.parse(zine.content)}
            </div>
        `;
        
        // Show modal
        document.getElementById('viewModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('View error:', error);
        showMessage('Failed to load zine. Please try again.', 'error');
    }
}

function closeModal() {
    document.getElementById('viewModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentZine = null;
}

// Export Current Zine
function exportCurrentZine() {
    if (!currentZine) {
        showMessage('No zine selected', 'error');
        return;
    }
    
    const exportBtn = document.getElementById('exportModalBtn');
    const originalText = exportBtn.innerHTML;
    
    try {
        exportBtn.disabled = true;
        exportBtn.innerHTML = '📄 Exporting...';
        
        // Create HTML content for PDF
        const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6;">
                <h1 style="color: #007bff; margin-bottom: 2rem; text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 1rem;">${currentZine.title}</h1>
                <div style="margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem; color: #666; font-size: 0.9rem;">
                    Created: ${formatDate(currentZine.created_at)}<br>
                    Last Updated: ${formatDate(currentZine.updated_at)}
                </div>
                <div style="color: #333;">${marked.parse(currentZine.content)}</div>
                <div style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 0.9rem;">
                    Generated by ZEINS - Digital Zine Creator
                </div>
            </div>
        `;
        
        // PDF options
        const options = {
            margin: 1,
            filename: `${currentZine.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        // Generate PDF
        html2pdf().set(options).from(htmlContent).save().then(() => {
            showMessage('PDF exported successfully!', 'success');
        }).catch((error) => {
            console.error('Export error:', error);
            showMessage('Failed to export PDF. Please try again.', 'error');
        });
        
    } catch (error) {
        console.error('Export error:', error);
        showMessage('Failed to export PDF. Please try again.', 'error');
    } finally {
        exportBtn.disabled = false;
        exportBtn.innerHTML = originalText;
    }
}

// Delete Current Zine
async function deleteCurrentZine() {
    if (!currentZine) {
        showMessage('No zine selected', 'error');
        return;
    }
    
    const confirmed = confirm(`Are you sure you want to delete "${currentZine.title}"? This action cannot be undone.`);
    if (!confirmed) {
        return;
    }
    
    const deleteBtn = document.getElementById('deleteModalBtn');
    const originalText = deleteBtn.innerHTML;
    
    try {
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '🗑️ Deleting...';
        
        const response = await fetch(`/delete/${currentZine.id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Zine deleted successfully!', 'success');
            closeModal();
            loadZines(); // Refresh the list
        } else {
            throw new Error(data.error || 'Failed to delete zine');
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        showMessage('Failed to delete zine. Please try again.', 'error');
    } finally {
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = originalText;
    }
}

// Message System
function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    messageContainer.appendChild(messageElement);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, 5000);
    
    // Click to dismiss
    messageElement.addEventListener('click', () => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    });
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Help Modal
function showHelp() {
    const helpContent = `
        <div class="user-guide-content">
            <div class="welcome-section">
                <p class="welcome-text">Manage and explore your saved zines with ease!</p>
            </div>
            
            <div class="guide-section">
                <h4>📚 Managing Zines</h4>
                <div class="guide-steps">
                    <div class="step">
                        <span class="step-number">1</span>
                        <div class="step-content">
                            <strong>View Zines</strong>
                            <p>Click on any zine card to read the full content in a modal window.</p>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">2</span>
                        <div class="step-content">
                            <strong>Export to PDF</strong>
                            <p>Click the "Export PDF" button in the zine modal to download as PDF.</p>
                        </div>
                    </div>
                    <div class="step">
                        <span class="step-number">3</span>
                        <div class="step-content">
                            <strong>Delete Zines</strong>
                            <p>Use the delete button to remove zines you no longer need.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="guide-section">
                <h4>⌨️ Keyboard Shortcuts</h4>
                <div class="shortcuts">
                    <div class="shortcut">
                        <kbd>Esc</kbd>
                        <span>Close modals</span>
                    </div>
                    <div class="shortcut">
                        <kbd>R</kbd>
                        <span>Refresh zines list</span>
                    </div>
                </div>
            </div>
            
            <div class="guide-footer">
                <p>💡 <strong>Tip:</strong> Click outside any modal to close it quickly!</p>
                <button onclick="closeModal(); showMessage('Happy zining!', 'info');" class="btn btn-primary">🎉 Got it!</button>
            </div>
        </div>
    `;
    
    // Create and show help modal
    const helpModal = document.createElement('div');
    helpModal.id = 'helpModal';
    helpModal.className = 'modal';
    helpModal.style.display = 'block';
    helpModal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h3>📚 Zines Management Guide</h3>
                <button onclick="closeHelpModal()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                ${helpContent}
            </div>
        </div>
    `;
    
    document.body.appendChild(helpModal);
    document.body.style.overflow = 'hidden';
    
    // Click outside to close
    helpModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeHelpModal();
        }
    });
}

function closeHelpModal() {
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.remove();
        document.body.style.overflow = 'auto';
    }
}
