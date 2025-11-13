// public/js/doctor/doctor-patients.js
// JavaScript for Doctor - Patient List page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializePage();
});

// Initialize page functionality
function initializePage() {
    setupEventListeners();
    loadPatientData(); // Load patient data from API
}

// Set up all event listeners
function setupEventListeners() {
    // Search button functionality
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // Search input - trigger search on Enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleSearch();
            }
        });
    }

    // Sort filter change
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', handleSortChange);
    }
}

// Handle search functionality
function handleSearch() {
    const searchTerm = document.getElementById('searchInput')?.value.trim() || '';
    loadPatientData({ search: searchTerm });
}

// Handle sort changes
function handleSortChange() {
    const sort = document.getElementById('sortFilter')?.value || 'name';
    loadPatientData({ sort: sort });
}

// Load patient data from API
async function loadPatientData(filters = {}) {
    try {
        // Build query parameters
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.sort) params.append('sort', filters.sort);
        params.append('page', filters.page || 1);
        params.append('limit', filters.limit || 10);

        const response = await fetch(`/api/doctor/patients?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load patient data: ${response.status}`);
        }

        const data = await response.json();
        renderPatientTable(data.patients);
        renderPagination(data.pagination);
    } catch (error) {
        console.error('Error loading patient data:', error);
        displayErrorMessage('Failed to load patient data. Please try again.');
    }
}

// Render patient table with data
function renderPatientTable(patients) {
    const tableBody = document.getElementById('patientTableBody');
    if (!tableBody) {
        console.error('Patient table body element not found');
        return;
    }

    if (!patients || patients.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No patients found.</td></tr>';
        return;
    }

    // Clear the table
    tableBody.innerHTML = '';

    // Add each patient as a table row
    patients.forEach(patient => {
        const row = document.createElement('tr');

        // Format the last visit date
        const lastVisitDate = formatDate(patient.lastVisitDate);

        row.innerHTML = `
            <td>${escapeHtml(patient.name)}</td>
            <td>${escapeHtml(patient.id)}</td>
            <td>${escapeHtml(patient.studentId) || 'N/A'}</td>
            <td>${lastVisitDate}</td>
            <td><span class="status-badge ${patient.status.toLowerCase()}">${escapeHtml(patient.status)}</span></td>
            <td><button class="submit-btn view-btn" data-patient-id="${patient.patientId}">View Records</button></td>
        `;

        // Add event listener to the view records button
        const viewBtn = row.querySelector('.view-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                viewPatientDetails(patient.patientId, patient.name);
            });
        }

        tableBody.appendChild(row);
    });
}

// Render pagination controls
function renderPagination(pagination) {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) {
        console.error('Pagination container element not found');
        return;
    }

    if (!pagination || pagination.totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '<div class="pagination">';

    // Previous button
    if (pagination.currentPage > 1) {
        paginationHTML += `<button class="submit-btn page-btn" data-page="${pagination.currentPage - 1}">← Prev</button>`;
    }

    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === pagination.currentPage) {
            paginationHTML += `<button class="submit-btn page-btn active" data-page="${i}">${i}</button>`;
        } else {
            paginationHTML += `<button class="submit-btn page-btn" data-page="${i}">${i}</button>`;
        }
    }

    // Next button
    if (pagination.currentPage < pagination.totalPages) {
        paginationHTML += `<button class="submit-btn page-btn" data-page="${pagination.currentPage + 1}">Next →</button>`;
    }

    paginationHTML += '</div>';

    paginationContainer.innerHTML = paginationHTML;

    // Add event listeners to page buttons
    const pageButtons = document.querySelectorAll('.page-btn');
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const page = parseInt(this.getAttribute('data-page'));
            loadPatientData({ page: page });
        });
    });
}

// View patient details function
function viewPatientDetails(patientId, patientName) {
    // Fetch all records for this patient and display them in a modal
    fetch(`/api/doctor/patient/${patientId}/records`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch patient records: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Fetch treatments for the same patient to associate with records
        fetch(`/api/doctor/patient/${patientId}/treatments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(treatmentResponse => {
            if (!treatmentResponse.ok) {
                console.error(`Failed to fetch patient treatments: ${treatmentResponse.status}`);
                return { treatments: [] }; // Return empty treatments array if fetch fails
            }
            return treatmentResponse.json();
        })
        .then(treatmentData => {
            displayPatientRecordsModal(patientId, patientName, data.records, treatmentData.treatments || []);
        })
        .catch(error => {
            console.error('Error fetching patient treatments:', error);
            // Display records even if treatments couldn't be fetched
            displayPatientRecordsModal(patientId, patientName, data.records, []);
        });
    })
    .catch(error => {
        console.error('Error fetching patient records:', error);
        displayErrorMessage(`Failed to load records for ${patientName}. Please try again.`);
    });
}

// Display patient records in a modal
function displayPatientRecordsModal(patientId, patientName, records, treatments) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    // Group treatments by record ID for easier access
    const treatmentsByRecord = {};
    if (treatments && treatments.length > 0) {
        treatments.forEach(treatment => {
            if (!treatmentsByRecord[treatment.recordId]) {
                treatmentsByRecord[treatment.recordId] = [];
            }
            treatmentsByRecord[treatment.recordId].push(treatment);
        });
    }

    // Format records for display, with treatments under each record
    const recordsHTML = records && records.length > 0
        ? records.map(record => {
            const recordTreatments = treatmentsByRecord[record.recordId] || [];
            const hasTreatments = recordTreatments.length > 0;
            
            let treatmentsHTML = '';
            if (hasTreatments) {
                treatmentsHTML = `
                    <div class="treatments-section" id="treatments-${record.recordId}" style="display: none; margin-top: 15px; padding: 10px; background-color: #f0f8ff; border-radius: 4px;">
                        <h5 style="margin-top: 0; margin-bottom: 10px; color: #2980b9;">Treatments:</h5>
                        ${recordTreatments.map(treatment => `
                            <div style="border-bottom: 1px solid #eee; padding: 5px 0;">
                                <p style="margin: 5px 0;"><strong>Treatment:</strong> ${escapeHtml(treatment.treatmentName)}</p>
                                <p style="margin: 5px 0;"><strong>Details:</strong> ${escapeHtml(treatment.details) || 'N/A'}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            return `
                <div class="record-item" style="
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 15px;
                    background-color: #f9f9f9;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h4 style="
                                margin-top: 0;
                                margin-bottom: 10px;
                                color: #333;
                                border-bottom: 1px solid #eee;
                                padding-bottom: 5px;
                            ">Record ID: ${record.recordId} - Record from ${formatDate(record.recordDate)}</h4>
                            <p><strong>Recorded by:</strong> ${escapeHtml(record.recordedBy || 'Unknown')}</p>
                        </div>
                        ${hasTreatments ? 
                            `<button class="toggle-treatments-btn submit-btn" data-record-id="${record.recordId}" style="
                                align-self: flex-start;
                                margin-left: 10px;
                                padding: 6px 12px;
                                font-size: 12px;
                            ">${hasTreatments ? 'View Treatments' : 'No Treatments'}</button>` 
                            : 
                            `<span style="color: #999; margin-left: 10px; padding: 6px 12px; font-size: 12px;">No Treatments</span>`
                        }
                    </div>
                    <div class="record-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                        <p><strong>Sleep:</strong> ${record.sleepHours || 'N/A'} hours</p>
                        <p><strong>Study:</strong> ${record.studyHours || 'N/A'} hours</p>
                        <p><strong>Exercise:</strong> ${record.exerciseMinutes || 'N/A'} minutes</p>
                        <p><strong>Mood:</strong> ${escapeHtml(record.mood) || 'N/A'}</p>
                        <p><strong>Heart Rate:</strong> ${record.heartRate || 'N/A'} bpm</p>
                        <p><strong>Temperature:</strong> ${record.temperature || 'N/A'}°F</p>
                        <p><strong>Pulse:</strong> ${record.pulse || 'N/A'} bpm</p>
                        <p><strong>Complaint:</strong> ${escapeHtml(record.complaint) || 'N/A'}</p>
                        <p><strong>Follow-up Date:</strong> ${record.followUpDate ? formatDate(record.followUpDate) : 'N/A'}</p>
                        <p><strong>Referral To:</strong> ${escapeHtml(record.referralTo) || 'N/A'}</p>
                        <p><strong>Program Code:</strong> ${escapeHtml(record.programCode) || 'N/A'}</p>
                        <p><strong>Comments:</strong> ${escapeHtml(record.comments) || 'N/A'}</p>
                    </div>
                    ${treatmentsHTML}
                </div>
            `;
        }).join('')
        : '<p>No records found for this patient.</p>';

    // Create modal content
    modal.innerHTML = `
        <div class="modal-content" style="
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            width: 80%;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2>Records for ${escapeHtml(patientName)} (ID: ${patientId})</h2>
                <button id="closeModal" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 5px;
                ">&times;</button>
            </div>
            <div id="recordsContainer">
                ${recordsHTML}
            </div>
        </div>
    `;

    // Add modal to document
    document.body.appendChild(modal);

    // Add event listeners to toggle treatment visibility
    document.querySelectorAll('.toggle-treatments-btn').forEach(button => {
        button.addEventListener('click', function() {
            const recordId = this.getAttribute('data-record-id');
            const treatmentsSection = document.getElementById(`treatments-${recordId}`);
            if (treatmentsSection) {
                const isVisible = treatmentsSection.style.display !== 'none';
                treatmentsSection.style.display = isVisible ? 'none' : 'block';
                this.textContent = isVisible ? 'View Treatments' : 'Hide Treatments';
            }
        });
    });

    // Add event listener to close modal
    const closeBtn = document.getElementById('closeModal');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });

    // Close modal when clicking outside the content
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
    if (typeof text !== 'string') {
        return text;
    }
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}



// Display error message
function displayErrorMessage(message) {
    // Create a temporary error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        margin: 10px 0;
        text-align: center;
    `;

    // Insert after the form-section
    const formSection = document.querySelector('.form-section');
    if (formSection) {
        formSection.parentNode.insertBefore(errorDiv, formSection.nextSibling);

        // Remove the error message after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}