// Global variables
let simplemde;
let currentTheme = localStorage.getItem('theme') || 'light';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeEditor();
    bindEventListeners();
    checkFirstTimeUser();
    updateFooterYear();
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

// Editor Management
function initializeEditor() {
    const toolbar = [
        'bold', 'italic', 'heading', '|',
        'quote', 'unordered-list', 'ordered-list', '|',
        'link', 'image', '|',
        'preview', 'side-by-side', 'fullscreen', '|',
        'guide'
    ];

    simplemde = new SimpleMDE({
        element: document.getElementById('editor'),
        placeholder: 'Write your zine content in Markdown...',
        spellChecker: false,
        toolbar: toolbar,
        status: ['autosave', 'lines', 'words', 'cursor'],
        autosave: {
            enabled: true,
            uniqueId: "zeins_editor",
            delay: 1000,
        },
        renderingConfig: {
            singleLineBreaks: false,
            codeSyntaxHighlighting: true,
        }
    });

    // Load any saved draft
    loadDraft();
}

function loadDraft() {
    const draftTitle = localStorage.getItem('zeins_draft_title');
    const draftContent = localStorage.getItem('zeins_draft_content');
    
    if (draftTitle) {
        document.getElementById('zineTitle').value = draftTitle;
    }
    
    if (draftContent && !simplemde.value()) {
        simplemde.value(draftContent);
    }
}

function saveDraft() {
    const title = document.getElementById('zineTitle').value;
    const content = simplemde.value();
    
    localStorage.setItem('zeins_draft_title', title);
    localStorage.setItem('zeins_draft_content', content);
}

function clearDraft() {
    localStorage.removeItem('zeins_draft_title');
    localStorage.removeItem('zeins_draft_content');
}

// Event Listeners
function bindEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Help button
    document.getElementById('helpBtn').addEventListener('click', showUserGuide);
    
    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveZine);
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportToPDF);
    
    // Preview button
    document.getElementById('previewBtn').addEventListener('click', showPreview);
    
    // Close preview modal
    document.getElementById('closePreview').addEventListener('click', closePreview);
    
    // Close user guide modal
    document.getElementById('closeUserGuide').addEventListener('click', closeUserGuide);
    
    // Start creating button
    document.getElementById('startCreating').addEventListener('click', function() {
        closeUserGuide();
        // Focus on the title input to start creating
        setTimeout(() => {
            document.getElementById('zineTitle').focus();
        }, 300);
    });
    
    // Auto-save draft
    document.getElementById('zineTitle').addEventListener('input', saveDraft);
    
    // Modal click outside to close
    document.getElementById('previewModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closePreview();
        }
    });
    
    // User guide modal click outside to close
    document.getElementById('userGuideModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeUserGuide();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveZine();
        }
        
        // Ctrl/Cmd + P to export
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            exportToPDF();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closePreview();
            closeUserGuide();
        }
    });
}

// Save Zine
async function saveZine() {
    const title = document.getElementById('zineTitle').value.trim();
    const content = simplemde.value().trim();
    
    if (!title) {
        showMessage('Please enter a title for your zine', 'error');
        document.getElementById('zineTitle').focus();
        return;
    }
    
    if (!content) {
        showMessage('Please add some content to your zine', 'error');
        simplemde.codemirror.focus();
        return;
    }
    
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;
    
    try {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '💾 Saving...';
        
        const response = await fetch('/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Zine saved successfully!', 'success');
            clearDraft(); // Clear the draft after successful save
        } else {
            throw new Error(data.error || 'Failed to save zine');
        }
        
    } catch (error) {
        console.error('Save error:', error);
        showMessage(error.message || 'Failed to save zine. Please try again.', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

// Export to PDF
function exportToPDF() {
    const title = document.getElementById('zineTitle').value.trim() || 'Untitled Zine';
    const content = simplemde.value().trim();
    
    if (!content) {
        showMessage('Please add some content before exporting', 'error');
        return;
    }
    
    const exportBtn = document.getElementById('exportBtn');
    const originalText = exportBtn.innerHTML;
    
    try {
        exportBtn.disabled = true;
        exportBtn.innerHTML = '📄 Exporting...';
        
        // Create HTML content for PDF
        const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6;">
                <h1 style="color: #007bff; margin-bottom: 2rem; text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 1rem;">${title}</h1>
                <div style="color: #333;">${marked.parse(content)}</div>
                <div style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 0.9rem;">
                    Generated by ZEINS - Digital Zine Creator
                </div>
            </div>
        `;
        
        // PDF options
        const options = {
            margin: 1,
            filename: `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
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

// Preview Modal
function showPreview() {
    const title = document.getElementById('zineTitle').value.trim() || 'Untitled Zine';
    const content = simplemde.value().trim();
    
    if (!content) {
        showMessage('No content to preview', 'error');
        return;
    }
    
    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = `
        <h1 style="color: var(--accent-primary); margin-bottom: 2rem; text-align: center; border-bottom: 2px solid var(--accent-primary); padding-bottom: 1rem;">${title}</h1>
        ${marked.parse(content)}
    `;
    
    document.getElementById('previewModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// User Guide Modal
function showUserGuide() {
    document.getElementById('userGuideModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeUserGuide() {
    document.getElementById('userGuideModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// First Time User Check
function checkFirstTimeUser() {
    const hasVisited = localStorage.getItem('zeins_has_visited');
    
    if (!hasVisited) {
        // Show user guide after a short delay for better UX
        setTimeout(() => {
            showUserGuide();
            localStorage.setItem('zeins_has_visited', 'true');
        }, 1000);
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

// Update footer year dynamically
function updateFooterYear() {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }
}
