// Modal management
let currentKeyStage = null;

function openUploadModal(keyStage) {
    currentKeyStage = keyStage;
    document.getElementById('keyStage').value = keyStage;
    document.getElementById('uploadModal').classList.add('active');
    
    // Update modal title based on key stage
    const modalTitle = document.querySelector('#uploadModal .modal-header h2');
    modalTitle.textContent = keyStage === 'ks3' ? 'Upload KS3 Work' : 'Upload KS4 Work';
    
    // Reset form
    document.getElementById('uploadForm').reset();
    document.getElementById('filePreview').style.display = 'none';
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('uploadResult').style.display = 'none';
    
    // Load form draft
    loadFormDraft();
    
    // Show upload history
    showUploadHistory(keyStage);
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('active');
    currentKeyStage = null;
}

function viewResources() {
    document.getElementById('resourcesModal').classList.add('active');
    loadResources();
}

function closeResourcesModal() {
    document.getElementById('resourcesModal').classList.remove('active');
}

// Close modals when clicking outside
document.getElementById('uploadModal').addEventListener('click', (e) => {
    if (e.target.id === 'uploadModal') {
        closeUploadModal();
    }
});

document.getElementById('resourcesModal').addEventListener('click', (e) => {
    if (e.target.id === 'resourcesModal') {
        closeResourcesModal();
    }
});

// File input handling
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');

fileInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
});

// Drag and drop functionality
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file) {
        handleFileSelect(file);
        // Update the file input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
    }
});

function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
        'pdf': '📄',
        'doc': '📝', 'docx': '📝',
        'ppt': '📊', 'pptx': '📊',
        'xls': '📈', 'xlsx': '📈',
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
        'txt': '📃',
        'html': '🌐',
        'zip': '📦', 'rar': '📦'
    };
    return icons[ext] || '📎';
}

function handleFileSelect(file) {
    if (!file) return;
    
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    fileName.innerHTML = `${getFileIcon(file.name)} ${file.name}`;
    fileSize.textContent = formatFileSize(file.size);
    filePreview.style.display = 'block';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Form submission
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const studentName = document.getElementById('studentName').value;
    const assignmentTitle = document.getElementById('assignmentTitle').value;
    const file = fileInput.files[0];
    const keyStage = document.getElementById('keyStage').value;
    
    if (!file) {
        showUploadResult('Please select a file to upload.', false);
        return;
    }
    
    if (!studentName.trim()) {
        showUploadResult('Please enter your name.', false);
        return;
    }
    
    formData.append('file', file);
    formData.append('studentName', studentName);
    formData.append('keyStage', keyStage);
    if (assignmentTitle) {
        formData.append('assignmentTitle', assignmentTitle);
    }
    
    // Show progress
    const progressContainer = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressContainer.style.display = 'block';
    document.getElementById('uploadResult').style.display = 'none';
    
    try {
        // Use Netlify Function if available, otherwise fallback to Express route
        const uploadUrl = window.location.hostname === 'localhost' ? '/upload' : '/.netlify/functions/upload';
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        progressContainer.style.display = 'none';
        
        if (result.success) {
            let successMessage = `✓ File uploaded successfully! Your work has been submitted.`;
            if (result.webViewLink) {
                successMessage += ` <a href="${result.webViewLink}" target="_blank" style="color: #3b82f6; text-decoration: underline; margin-left: 0.5rem;">View in Google Drive →</a>`;
            }
            showUploadResult(successMessage, true);
            
            // Save to upload history
            saveUploadHistory({
                filename: result.filename || file.name,
                studentName: studentName,
                assignmentTitle: assignmentTitle || 'No title',
                keyStage: keyStage,
                timestamp: new Date().toISOString(),
                webViewLink: result.webViewLink
            });
            
            // Reset form after successful upload
            setTimeout(() => {
                document.getElementById('uploadForm').reset();
                document.getElementById('filePreview').style.display = 'none';
                document.getElementById('uploadResult').style.display = 'none';
            }, 5000);
        } else {
            showUploadResult(`✗ Upload failed: ${result.message}`, false);
        }
    } catch (error) {
        progressContainer.style.display = 'none';
        showUploadResult(`✗ Upload failed: ${error.message}`, false);
    }
});

function showUploadResult(message, success) {
    const resultDiv = document.getElementById('uploadResult');
    resultDiv.innerHTML = message;
    resultDiv.className = 'upload-result ' + (success ? 'success' : 'error');
    resultDiv.style.display = 'block';
}

// Upload history management
function saveUploadHistory(upload) {
    try {
        const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
        history.unshift(upload);
        // Keep only last 20 uploads
        if (history.length > 20) {
            history.pop();
        }
        localStorage.setItem('uploadHistory', JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save upload history:', e);
    }
}

function getUploadHistory() {
    try {
        return JSON.parse(localStorage.getItem('uploadHistory') || '[]');
    } catch (e) {
        return [];
    }
}

// Auto-save form data
function autoSaveForm() {
    const formData = {
        studentName: document.getElementById('studentName').value,
        assignmentTitle: document.getElementById('assignmentTitle').value,
        keyStage: document.getElementById('keyStage').value
    };
    localStorage.setItem('uploadFormDraft', JSON.stringify(formData));
}

function loadFormDraft() {
    try {
        const draft = JSON.parse(localStorage.getItem('uploadFormDraft') || '{}');
        if (draft.studentName) {
            document.getElementById('studentName').value = draft.studentName;
        }
        if (draft.assignmentTitle) {
            document.getElementById('assignmentTitle').value = draft.assignmentTitle;
        }
    } catch (e) {
        // Ignore errors
    }
}

function showUploadHistory(keyStage) {
    const history = getUploadHistory();
    const filteredHistory = history.filter(upload => upload.keyStage === keyStage).slice(0, 5);
    const historyContainer = document.getElementById('uploadHistory');
    const historyList = document.getElementById('historyList');
    
    if (filteredHistory.length > 0) {
        historyContainer.style.display = 'block';
        historyList.innerHTML = filteredHistory.map(upload => {
            const date = new Date(upload.timestamp);
            return `
                <div style="padding: 0.5rem; background: rgba(255, 255, 255, 0.05); border-radius: 4px; margin-bottom: 0.5rem; font-size: 0.875rem; color: rgba(255, 255, 255, 0.8);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${upload.filename}</span>
                        ${upload.webViewLink ? `<a href="${upload.webViewLink}" target="_blank" style="color: #60a5fa; text-decoration: none;">View →</a>` : ''}
                    </div>
                    <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.6); margin-top: 0.25rem;">
                        ${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            `;
        }).join('');
    } else {
        historyContainer.style.display = 'none';
    }
}

// Add auto-save listeners
document.addEventListener('DOMContentLoaded', () => {
    const studentNameInput = document.getElementById('studentName');
    const assignmentTitleInput = document.getElementById('assignmentTitle');
    
    if (studentNameInput) {
        studentNameInput.addEventListener('input', autoSaveForm);
    }
    if (assignmentTitleInput) {
        assignmentTitleInput.addEventListener('input', autoSaveForm);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close modals
    if (e.key === 'Escape') {
        const uploadModal = document.getElementById('uploadModal');
        const resourcesModal = document.getElementById('resourcesModal');
        if (uploadModal && uploadModal.classList.contains('active')) {
            closeUploadModal();
        }
        if (resourcesModal && resourcesModal.classList.contains('active')) {
            closeResourcesModal();
        }
    }
});

// Load resources
async function loadResources() {
    const resourcesList = document.getElementById('resourcesList');
    resourcesList.innerHTML = '<p class="loading-text">Loading resources...</p>';
    
    try {
        const response = await fetch('/files/resources');
        const data = await response.json();
        
        if (data.files && data.files.length > 0) {
            resourcesList.innerHTML = data.files.map(file => `
                <div class="resource-item">
                    <div class="resource-info">
                        <div class="resource-name">${file.filename}</div>
                        <div class="resource-meta">
                            ${formatFileSize(file.size)} • 
                            Uploaded ${new Date(file.uploadedAt).toLocaleDateString('en-GB')}
                        </div>
                    </div>
                    <a href="/download/resources/${file.filename}" 
                       class="btn btn-secondary" 
                       style="width: auto; padding: 0.5rem 1rem; font-size: 0.875rem;"
                       download>
                        Download
                    </a>
                </div>
            `).join('');
        } else {
            resourcesList.innerHTML = '<p class="loading-text">No resources available yet.</p>';
        }
    } catch (error) {
        resourcesList.innerHTML = '<p class="loading-text">Error loading resources.</p>';
    }
}


