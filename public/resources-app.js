// 100% Resources JavaScript

// Resource structure and metadata
let allResources = [];

// Display title overrides (Year 11 and any broken names). Key: yearGroup/folder/filename (no path)
const RESOURCE_DISPLAY_TITLES = {
    'Year-11/English-Reading/exam_preparation_comparison.html': 'Exam Preparation: Comparative Reading',
    'Year-11/Maths-Error-Spotting/exam_preparation_error_spotting_calculat.html': 'Exam Preparation: Error Spotting – Calculations',
    'Year-11/English-Vocabulary-SPaG/exam_techniques_spag.html': 'Exam Techniques: SPaG',
    'Year-11/English-Vocabulary-SPaG/revision_vocabulary_and_spag.html': 'Revision: Vocabulary & SPaG'
};

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (t) {
        return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    });
}

/** Return display title: Title Case, colon formatting (e.g. Exam Preparation: Algebra). */
function getResourceDisplayTitle(yearGroup, subjectFolder, filename) {
    const key = yearGroup + '/' + subjectFolder + '/' + filename;
    if (RESOURCE_DISPLAY_TITLES[key]) return RESOURCE_DISPLAY_TITLES[key];
    const base = filename.replace(/\.html$/, '').replace(/^\d+_/, '');
    const parts = base.split('_').filter(Boolean).map(function (p) { return toTitleCase(p); });
    if (parts.length <= 1) return parts[0] || base;
    if (parts.length === 2) return parts[0] + ': ' + parts[1];
    return parts[0] + ' ' + parts[1] + ': ' + parts.slice(2).join(' ');
}

// Load resources on page load
document.addEventListener('DOMContentLoaded', () => {
    loadResourceCounts();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC to close resources display
        if (e.key === 'Escape') {
            const resourcesDisplay = document.getElementById('resources-display');
            if (resourcesDisplay && resourcesDisplay.style.display !== 'none') {
                closeResources();
            }
        }
    });
    
    // Add search functionality
    addSearchFunctionality();
});

function addSearchFunctionality() {
    const header = document.querySelector('header');
    if (!header) return;
    
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = 'margin-top: 1rem; max-width: 500px; margin-left: auto; margin-right: auto;';
    searchContainer.innerHTML = `
        <input type="text" id="resourceSearch" placeholder="🔍 Search resources by name..." 
               style="width: 100%; padding: 0.75rem; border: 2px solid rgba(255, 255, 255, 0.3); 
                      border-radius: 8px; background: rgba(255, 255, 255, 0.1); 
                      color: white; font-size: 1rem; backdrop-filter: blur(10px);"
               autocomplete="off">
    `;
    header.appendChild(searchContainer);
    
    const searchInput = document.getElementById('resourceSearch');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        if (searchTerm.length > 0) {
            filterResources(searchTerm);
        } else {
            // Reset to show all resources
            const resourcesList = document.getElementById('resources-list');
            if (resourcesList) {
                const yearGroup = document.getElementById('resources-title')?.textContent.replace(' Resources', '').replace(/\s+/g, '-');
                if (yearGroup) {
                    showYearGroupResources(yearGroup);
                }
            }
        }
    });
}

function filterResources(searchTerm) {
    const resourcesList = document.getElementById('resources-list');
    if (!resourcesList) return;
    
    const resourceItems = resourcesList.querySelectorAll('.resource-item');
    let foundCount = 0;
    
    resourceItems.forEach(item => {
        const resourceName = item.querySelector('h4')?.textContent.toLowerCase() || '';
        if (resourceName.includes(searchTerm)) {
            item.style.display = '';
            foundCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show message if no results
    if (foundCount === 0 && resourceItems.length > 0) {
        const noResults = document.createElement('div');
        noResults.className = 'empty-state';
        noResults.innerHTML = `<p>No resources found matching "${searchTerm}"</p>`;
        if (!resourcesList.querySelector('.no-results-message')) {
            noResults.classList.add('no-results-message');
            resourcesList.appendChild(noResults);
        }
    } else {
        const noResults = resourcesList.querySelector('.no-results-message');
        if (noResults) {
            noResults.remove();
        }
    }
}

async function loadResourceCounts() {
    try {
        // Try to load manifest directly as static file first (faster)
        let data = null;
        
        try {
            const manifestResponse = await fetch('/resources-manifest.json');
            if (manifestResponse.ok) {
                const manifest = await manifestResponse.json();
                data = { success: true, counts: manifest.counts || {} };
            }
        } catch (e) {
            console.log('Manifest not found, trying API...');
        }
        
        // Fallback to API if manifest not available
        if (!data) {
            const apiUrl = window.location.hostname === 'localhost' ? '/api/year-resources' : '/.netlify/functions/year-resources';
            const response = await fetch(apiUrl);
            data = await response.json();
        }
        
        if (data.success) {
            // Update year group counts
            document.getElementById('year7-count').textContent = `${data.counts['Year-7'] || 0} resources`;
            document.getElementById('year8-count').textContent = `${data.counts['Year-8'] || 0} resources`;
            document.getElementById('year9-count').textContent = `${data.counts['Year-9'] || 0} resources`;
            document.getElementById('year10-count').textContent = `${data.counts['Year-10'] || 0} resources`;
            document.getElementById('year11-count').textContent = `${data.counts['Year-11'] || 0} resources`;
        }
    } catch (error) {
        console.error('Error loading resource counts:', error);
    }
}

async function showYearGroupResources(yearGroup) {
    const display = document.getElementById('resources-display');
    const title = document.getElementById('resources-title');
    const list = document.getElementById('resources-list');
    
    title.textContent = yearGroup.replace(/-/g, ' ') + ' Resources';
    
    try {
        // Try to load manifest directly as static file first (faster)
        let data = null;
        
        try {
            const manifestResponse = await fetch('/resources-manifest.json');
            if (manifestResponse.ok) {
                const manifest = await manifestResponse.json();
                const subjects = manifest.resources[yearGroup] || [];
                data = { success: true, subjects };
            }
        } catch (e) {
            console.log('Manifest not found, trying API...');
        }
        
        // Fallback to API if manifest not available
        if (!data) {
            const apiUrl = window.location.hostname === 'localhost' 
                ? `/api/year-resources/${yearGroup}` 
                : `/.netlify/functions/year-resources?yearGroup=${yearGroup}`;
            const response = await fetch(apiUrl);
            data = await response.json();
        }
        
        if (data.success) {
            const yearNum = yearGroup.replace('Year-', '');
            let html = '<div class="accordion-container">';
            
            data.subjects.forEach((subject, index) => {
                const subjectId = `subject-${yearGroup}-${index}`;
                const hasResources = subject.resources.length > 0;
                
                html += `
                    <div class="accordion-item">
                        <button class="accordion-header" onclick="toggleAccordion('${subjectId}')">
                            <span class="accordion-title">
                                ${subject.name}
                                <span class="resource-badge">${subject.resources.length} resource${subject.resources.length !== 1 ? 's' : ''}</span>
                            </span>
                            <span class="accordion-icon" id="${subjectId}-icon">▼</span>
                        </button>
                        <div class="accordion-content" id="${subjectId}">
                            ${hasResources ? `
                                <div class="resources-grid">
                                    ${subject.resources.map(resource => {
                                        const resourceUrl = '/resources/files/' + yearGroup + '/' + subject.folder + '/' + resource + '?year=' + yearNum;
                                        const displayTitle = getResourceDisplayTitle(yearGroup, subject.folder, resource);
                                        return `
                                        <div class="resource-item" data-year="${yearNum}" onclick="window.open('${resourceUrl}', '_blank')">
                                            <h4>${displayTitle}</h4>
                                            <p style="font-size: 14px; color: #6b7280; margin-top: 5px;">Click to open resource</p>
                                        </div>
                                    `; }).join('')}
                                </div>
                            ` : `
                                <div class="empty-subject-state">
                                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.95rem;">
                                        No resources available yet for this subject. Resources are being prepared.
                                    </p>
                                </div>
                            `}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            list.innerHTML = html;
        }
    } catch (error) {
        list.innerHTML = `
            <div class="empty-state">
                <p>Error loading resources</p>
            </div>
        `;
    }
    
    display.style.display = 'block';
    display.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleAccordion(id) {
    const content = document.getElementById(id);
    const icon = document.getElementById(`${id}-icon`);
    const allContents = document.querySelectorAll('.accordion-content');
    const allIcons = document.querySelectorAll('.accordion-icon');
    
    // Close all other accordions
    allContents.forEach(item => {
        if (item.id !== id) {
            item.classList.remove('active');
        }
    });
    
    allIcons.forEach(item => {
        if (item.id !== `${id}-icon`) {
            item.classList.remove('rotated');
        }
    });
    
    // Toggle current accordion
    content.classList.toggle('active');
    icon.classList.toggle('rotated');
}

function closeResources() {
    const display = document.getElementById('resources-display');
    display.style.display = 'none';
    // Clear search
    const searchInput = document.getElementById('resourceSearch');
    if (searchInput) {
        searchInput.value = '';
    }
}

