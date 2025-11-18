// public/js/doctor/doctor-logging.js
// JavaScript for Doctor - Logging page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializePage();
});

// Initialize page functionality
function initializePage() {
    setupEventListeners();
    loadDropdownData();
    setDoctorIdFromServer();

    // Set current date and time as default for the date field
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const now = new Date();
        // Format to 'YYYY-MM-DDTHH:mm' for datetime-local input using local time
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
        dateInput.value = formattedDate;
    }

    // Check if we're on mobile and collapse sections by default
    if (window.innerWidth <= 768) {
        collapseAllSections();
    }

    // Add event listeners to section titles for collapsible functionality
    addSectionCollapseEventListeners();
}

// Add event listeners to section titles for collapsible functionality
function addSectionCollapseEventListeners() {
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.addEventListener('click', function() {
            toggleCollapse(this);
        });
    });
}

// Collapse all sections (useful for mobile view)
function collapseAllSections() {
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        if (!title.classList.contains('collapsed')) {
            toggleCollapse(title);
        }
    });
}

// Expand all sections
function expandAllSections() {
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        if (title.classList.contains('collapsed')) {
            toggleCollapse(title);
        }
    });
}

// Set up all event listeners
function setupEventListeners() {
    // Tab switching functionality
    setupTabSwitching();

    // Form submission handling
    setupFormSubmissions();

    // Add event listener to patient dropdown to populate records dropdown
    const patientIdSelect = document.getElementById('patientId');
    if (patientIdSelect) {
        patientIdSelect.addEventListener('change', function() {
            loadPatientRecords(this.value);
        });
    }

    // Add resize event listener to handle mobile/desktop view changes
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            collapseAllSections();
        } else {
            expandAllSections();
        }
    });
}

// Set up tab switching functionality
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and content
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
}

// Set up form submission handling
function setupFormSubmissions() {
    // New Patient Form submission
    const newPatientForm = document.getElementById('newPatientForm');
    if (newPatientForm) {
        newPatientForm.addEventListener('submit', handleNewPatientSubmit);
    }

    // Wellness Record Form submission
    const wellnessRecordForm = document.getElementById('wellnessRecordForm');
    if (wellnessRecordForm) {
        wellnessRecordForm.addEventListener('submit', handleWellnessRecordSubmit);
    }

    // Treatment Form submission
    const treatmentForm = document.getElementById('treatmentForm');
    if (treatmentForm) {
        treatmentForm.addEventListener('submit', handleTreatmentSubmit);
    }

    // Record Treatment Form submission
    const recordTreatmentForm = document.getElementById('recordTreatmentForm');
    if (recordTreatmentForm) {
        recordTreatmentForm.addEventListener('submit', handleRecordTreatmentSubmit);
    }
}

// Handle new patient form submission
async function handleNewPatientSubmit(event) {
    event.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('patientEmail').value,
        phone: document.getElementById('patientPhone').value,
        studentId: document.getElementById('studentId').value,
        age: document.getElementById('age').value,
        dob: document.getElementById('dob').value,
        sex: document.getElementById('sex').value,
        ethnicity: document.getElementById('ethnicity').value,
        bloodType: document.getElementById('bloodType').value,
        status: document.getElementById('status').value
    };

    try {
        const response = await fetch('/api/doctor/patients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Patient registered successfully!');
            window.location.reload()
        } else {
            alert(`Error: ${result.error || 'Failed to register patient'}`);
        }
    } catch (error) {
        console.error('Error registering patient:', error);
        alert('An error occurred while registering the patient.');
    }
}

// Handle wellness record form submission
async function handleWellnessRecordSubmit(event) {
    event.preventDefault();
    
    const formData = {
        patientId: document.getElementById('patientId').value,
        date: document.getElementById('date').value || new Date().toISOString().slice(0, 16),
        heartRate: document.getElementById('heartRate').value,
        temperature: document.getElementById('temperature').value,
        pulse: document.getElementById('pulse').value,
        bloodPressure: document.getElementById('bloodPressure').value,
        sleepHours: document.getElementById('sleepHours').value,
        studyHours: document.getElementById('studyHours').value,
        exerciseMinutes: document.getElementById('exerciseMinutes').value,
        mood: document.getElementById('mood').value,
        complaint: document.getElementById('complaint').value,
        followUpDate: document.getElementById('followUpDate').value,
        referralTo: document.getElementById('referralTo').value,
        programCode: document.getElementById('programCode').value,
        comments: document.getElementById('comments').value
    };

    try {
        const response = await fetch('/api/doctor/wellness', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Wellness record logged successfully!');
            wellnessRecordForm.reset();
        } else {
            alert(`Error: ${result.error || 'Failed to log wellness record'}`);
        }
    } catch (error) {
        console.error('Error logging wellness record:', error);
        alert('An error occurred while logging the wellness record.');
    }
}

// Handle treatment form submission
async function handleTreatmentSubmit(event) {
    event.preventDefault();
    
    const formData = {
        description: document.getElementById('treatmentDescription').value,
        category: document.getElementById('treatmentCategory').value
    };

    try {
        const response = await fetch('/api/doctor/treatments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Treatment added successfully!');
            treatmentForm.reset();
        } else {
            alert(`Error: ${result.error || 'Failed to add treatment'}`);
        }
    } catch (error) {
        console.error('Error adding treatment:', error);
        alert('An error occurred while adding the treatment.');
    }
}

// Handle record treatment form submission
async function handleRecordTreatmentSubmit(event) {
    event.preventDefault();
    
    const formData = {
        recordId: document.getElementById('recordId').value,
        treatmentId: document.getElementById('treatmentId').value,
        details: document.getElementById('treatmentDetails').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value
    };

    try {
        const response = await fetch('/api/doctor/record-treatments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Treatment applied to record successfully!');
            recordTreatmentForm.reset();
        } else {
            alert(`Error: ${result.error || 'Failed to apply treatment to record'}`);
        }
    } catch (error) {
        console.error('Error applying treatment to record:', error);
        alert('An error occurred while applying the treatment to the record.');
    }
}

// Load dropdown data for forms
async function loadDropdownData() {
    try {
        // Load patients for patient selection
        const patientsResponse = await fetch('/api/doctor/patients/dropdown');
        if (patientsResponse.ok) {
            const patientsData = await patientsResponse.json();
            populatePatientDropdown(patientsData.patients);
        }

        // Load treatments for treatment selection
        const treatmentsResponse = await fetch('/api/doctor/treatments');
        if (treatmentsResponse.ok) {
            const treatmentsData = await treatmentsResponse.json();
            populateTreatmentDropdown(treatmentsData.treatments);
        }
    } catch (error) {
        console.error('Error loading dropdown data:', error);
    }
}

// Populate patient dropdown
function populatePatientDropdown(patients) {
    const patientIdSelect = document.getElementById('patientId');
    if (!patientIdSelect) return;
    
    patientIdSelect.innerHTML = '<option value="">-- Select Patient --</option>';
    
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.P_ID;
        const displayName = patient.P_StudentId ? 
            `${patient.P_Name} (ID: ${patient.P_ID}, Student ID: ${patient.P_StudentId})` : 
            `${patient.P_Name} (ID: ${patient.P_ID})`;
        option.textContent = displayName;
        patientIdSelect.appendChild(option);
    });
}

// Populate treatment dropdown
function populateTreatmentDropdown(treatments) {
    const treatmentIdSelect = document.getElementById('treatmentId');
    if (!treatmentIdSelect) return;
    
    treatmentIdSelect.innerHTML = '<option value="">-- Select Treatment --</option>';
    
    treatments.forEach(treatment => {
        const option = document.createElement('option');
        option.value = treatment.T_ID;
        option.textContent = treatment.T_Description;
        treatmentIdSelect.appendChild(option);
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

// Load patient records for the records dropdown
async function loadPatientRecords(patientId) {
    if (!patientId) {
        // Clear the records dropdown if no patient is selected
        const recordIdSelect = document.getElementById('recordId');
        if (recordIdSelect) {
            recordIdSelect.innerHTML = '<option value="">-- Select Record --</option>';
        }
        return;
    }
    
    try {
        const response = await fetch(`/api/doctor/patient/${patientId}/records`);
        if (response.ok) {
            const data = await response.json();
            populateRecordsDropdown(data.records);
        } else {
            console.error('Failed to load patient records:', response.status);
        }
    } catch (error) {
        console.error('Error loading patient records:', error);
    }
}

// Populate records dropdown
function populateRecordsDropdown(records) {
    const recordIdSelect = document.getElementById('recordId');
    if (!recordIdSelect) return;

    recordIdSelect.innerHTML = '<option value="">-- Select Record --</option>';

    records.forEach(record => {
        const option = document.createElement('option');
        // Format the date for display
        const recordDate = record.recordDate ? new Date(record.recordDate).toLocaleDateString() : 'Unknown Date';
        const complaint = record.complaint || 'No complaint';
        option.value = record.recordId;
        option.textContent = `Record #${record.recordId} (${recordDate}) - ${complaint}`;
        recordIdSelect.appendChild(option);
    });
}

// Toggle collapse/expand for form sections
function toggleCollapse(element) {
    const sectionTitle = element;
    const collapseIcon = sectionTitle.querySelector('.collapse-icon');
    const collapseContent = sectionTitle.nextElementSibling;

    sectionTitle.classList.toggle('collapsed');
    collapseContent.classList.toggle('collapsed');
}

// Function to get user ID from server using authenticated endpoint
async function setDoctorIdFromServer() {
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            // Set the doctor ID in the form field
            const doctorIdField = document.getElementById('doctorId');
            if (doctorIdField) {
                doctorIdField.value = userData.id;
            }
        } else {
            console.error('Failed to fetch user data:', response.status);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}