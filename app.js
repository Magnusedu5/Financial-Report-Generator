// State Management
let selectedReportType = null;
let currentYear = 2025;
let reportHistory = [];

// DOM Elements
const chips = document.querySelectorAll('.chip');
const yearValue = document.getElementById('yearValue');
const yearUp = document.getElementById('yearUp');
const yearDown = document.getElementById('yearDown');
const clientNameInput = document.getElementById('clientName');
const generateBtn = document.getElementById('generateBtn');
const reportForm = document.getElementById('reportForm');
const statusMessage = document.getElementById('statusMessage');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

// Initialize - Load history from memory
function init() {
    loadHistoryFromMemory();
    renderHistory();
}

// Report Type Selection
chips.forEach(chip => {
    chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedReportType = chip.dataset.value;
        hideStatusMessage();
    });
});

// Year Selection
yearUp.addEventListener('click', () => {
    currentYear++;
    yearValue.textContent = currentYear;
    hideStatusMessage();
});

yearDown.addEventListener('click', () => {
    if (currentYear > 2000) {
        currentYear--;
        yearValue.textContent = currentYear;
        hideStatusMessage();
    }
});

// Client Name Input
clientNameInput.addEventListener('input', () => {
    hideStatusMessage();
});

// Form Submission
reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const requestData = prepareAgentRequest();
    
    if (requestData.error) {
        showStatusMessage(requestData.error, 'error');
        return;
    }
    
    // Simulate API call
    await handleReportGeneration(requestData.data);
});

/**
 * Part 2: Core Function - Prepares and validates request data
 * Collects UI inputs, validates them, and returns JSON payload
 */
function prepareAgentRequest() {
    // Collect data from UI
    const reportType = selectedReportType;
    const year = currentYear;
    const clientName = clientNameInput.value.trim();
    
    // Validation
    if (!reportType) {
        return {
            error: 'Please select a report type',
            data: null
        };
    }
    
    if (!clientName) {
        return {
            error: 'Please enter a client name or ID',
            data: null
        };
    }
    
    if (clientName.length < 2) {
        return {
            error: 'Client name must be at least 2 characters',
            data: null
        };
    }
    
    // Return validated JSON payload
    const payload = {
        reportType: reportType,
        reportingYear: year,
        clientName: clientName,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
    };
    
    return {
        error: null,
        data: payload
    };
}

/**
 * Part 2: API/Backend Service Description
 * 
 * Service Endpoint: https://api.kokoodi.com/v1/reports/generate
 * 
 * Backend Agent's Role: The backend service receives this JSON payload and performs 
 * initial authentication, data validation, and retrieves any additional client metadata 
 * from the database. It then invokes the C#/OpenXML document generation service (Part 3) 
 * with the validated parameters, which creates the Word document and stores it in cloud 
 * storage. Finally, the agent returns a download URL and report metadata to the frontend 
 * for user access.
 */

// Simulate API Call and Report Generation
async function handleReportGeneration(data) {
    try {
        // Show loading state
        showStatusMessage('Generating report...', 'loading');
        generateBtn.disabled = true;
        
        // Simulate network delay
        await sleep(1500);
        
        // Log the payload that would be sent to backend
        console.log('Payload to be sent to backend:', JSON.stringify(data, null, 2));
        
        // Simulate successful response
        const response = {
            success: true,
            reportId: data.requestId,
            downloadUrl: `https://storage.kokoodi.com/reports/${data.requestId}.docx`,
            generatedAt: data.timestamp
        };
        
        // Add to history (Bonus Feature)
        addToHistory(data);
        
        // Show success message
        showStatusMessage('Report generated successfully!', 'success');
        
        // Reset form
        setTimeout(() => {
            resetForm();
        }, 2000);
        
    } catch (error) {
        showStatusMessage('Failed to generate report. Please try again.', 'error');
        console.error('Report generation error:', error);
    } finally {
        generateBtn.disabled = false;
    }
}

// Utility Functions
function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    if (type === 'loading') {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        statusMessage.textContent = '';
        statusMessage.appendChild(spinner);
        statusMessage.appendChild(document.createTextNode(message));
    }
}

function hideStatusMessage() {
    statusMessage.style.display = 'none';
    statusMessage.className = 'status-message';
}

function resetForm() {
    chips.forEach(c => c.classList.remove('active'));
    selectedReportType = null;
    clientNameInput.value = '';
    hideStatusMessage();
}

function generateRequestId() {
    return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Bonus Feature: Report History Management
function addToHistory(data) {
    const historyItem = {
        reportType: data.reportType,
        clientName: data.clientName,
        year: data.reportingYear,
        timestamp: data.timestamp,
        requestId: data.requestId
    };
    
    // Add to beginning of array
    reportHistory.unshift(historyItem);
    
    // Keep only last 5 reports
    if (reportHistory.length > 5) {
        reportHistory = reportHistory.slice(0, 5);
    }
    
    // Save to memory and render
    saveHistoryToMemory();
    renderHistory();
}

function renderHistory() {
    if (reportHistory.length === 0) {
        historySection.style.display = 'none';
        return;
    }
    
    historySection.style.display = 'block';
    historyList.innerHTML = '';
    
    reportHistory.forEach(item => {
        const historyItemEl = document.createElement('div');
        historyItemEl.className = 'history-item';
        historyItemEl.innerHTML = `
            <div class="history-item-type">${item.reportType}</div>
            <div class="history-item-details">
                ${item.clientName} • ${item.year} • ${formatDate(item.timestamp)}
            </div>
        `;
        
        // Click to reuse settings
        historyItemEl.addEventListener('click', () => {
            loadHistoryItem(item);
        });
        
        historyList.appendChild(historyItemEl);
    });
}

function loadHistoryItem(item) {
    // Set report type
    chips.forEach(chip => {
        if (chip.dataset.value === item.reportType) {
            chip.classList.add('active');
            selectedReportType = item.reportType;
        } else {
            chip.classList.remove('active');
        }
    });
    
    // Set year
    currentYear = item.year;
    yearValue.textContent = currentYear;
    
    // Set client name
    clientNameInput.value = item.clientName;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showStatusMessage('Settings loaded from history', 'success');
    setTimeout(hideStatusMessage, 2000);
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
}

clearHistoryBtn.addEventListener('click', () => {
    reportHistory = [];
    saveHistoryToMemory();
    renderHistory();
    showStatusMessage('History cleared', 'success');
    setTimeout(hideStatusMessage, 2000);
});

// Memory storage (replaces localStorage due to artifact limitations)
function saveHistoryToMemory() {
    // In a real implementation, this would save to localStorage
    // For this artifact, we keep it in memory during the session
}

function loadHistoryFromMemory() {
    // In a real implementation, this would load from localStorage
    // For this artifact, we start with empty history each session
}

// Initialize on page load
init();