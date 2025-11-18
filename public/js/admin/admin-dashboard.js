// public/js/admin/admin-dashboard.js
// JavaScript for Admin Dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializePage();
});

// Initialize page functionality
function initializePage() {
    setupEventListeners();
    loadUsers();     // Load users for user management
    loadPatients();  // Load patients
    loadRecords();   // Load wellness records
    loadTreatments(); // Load treatments
}

// Set up all event listeners
function setupEventListeners() {
    // Tab switching functionality
    setupTabSwitching();

    // Form submission handling
    setupFormSubmissions();

    // Search button functionality
    setupSearchFunctionality();
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
    // Create User Form submission
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) {
        createUserForm.addEventListener('submit', handleCreateUserSubmit);
    }
}

// Handle create user form submission
async function handleCreateUserSubmit(event) {
    event.preventDefault();

    const formData = {
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        role: document.getElementById('newRole').value,
        firstName: document.getElementById('newFirstName').value,
        lastName: document.getElementById('newLastName').value,
        email: document.getElementById('newEmail').value
    };

    try {
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('User created successfully!');
            createUserForm.reset();
            loadUsers(); // Refresh the users list
        } else {
            alert(`Error: ${result.error || 'Failed to create user'}`);
        }
    } catch (error) {
        console.error('Error creating user:', error);
        alert('An error occurred while creating the user.');
    }
}

// Set up search functionality
function setupSearchFunctionality() {
    // User search
    const userSearchBtn = document.getElementById('userSearchBtn');
    if (userSearchBtn) {
        userSearchBtn.addEventListener('click', function() {
            const searchTerm = document.getElementById('userSearch').value;
            loadUsers(searchTerm);
        });
    }

    // Patient search
    const patientSearchBtn = document.getElementById('patientSearchBtn');
    if (patientSearchBtn) {
        patientSearchBtn.addEventListener('click', function() {
            const searchTerm = document.getElementById('patientSearch').value;
            loadPatients(searchTerm);
        });
    }

    // Record search
    const recordSearchBtn = document.getElementById('recordSearchBtn');
    if (recordSearchBtn) {
        recordSearchBtn.addEventListener('click', function() {
            const searchTerm = document.getElementById('recordSearch').value;
            loadRecords(searchTerm);
        });
    }

    // Treatment search
    const treatmentSearchBtn = document.getElementById('treatmentSearchBtn');
    if (treatmentSearchBtn) {
        treatmentSearchBtn.addEventListener('click', function() {
            const searchTerm = document.getElementById('treatmentSearch').value;
            loadTreatments(searchTerm);
        });
    }
}

// Load users from the API
async function loadUsers(searchTerm = '') {
    try {
        const response = await fetch(`/api/admin/users?search=${encodeURIComponent(searchTerm)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load users: ${response.status}`);
        }

        const data = await response.json();
        renderUsersTable(data.users);
    } catch (error) {
        console.error('Error loading users:', error);
        displayErrorMessage('Failed to load users. Please try again.');
    }
}

// Load patients from the API
async function loadPatients(searchTerm = '') {
    try {
        // Use the doctor endpoint that lists patients since it's the existing one available
        let url = '/api/doctor/patients';
        if (searchTerm) {
            url += `?search=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load patients: ${response.status}`);
        }

        const data = await response.json();
        renderPatientsTable(data.patients);
    } catch (error) {
        console.error('Error loading patients:', error);
        displayErrorMessage('Failed to load patients. Please try again.');
    }
}

// Render patients table with data
function renderPatientsTable(patients) {
    const tableBody = document.getElementById('patientsTableBody');
    if (!tableBody) {
        console.error('Patients table body element not found');
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

        // Create and populate table cells
        const nameCell = document.createElement('td');
        nameCell.textContent = escapeHtml(patient.name);

        const studentIdCell = document.createElement('td');
        studentIdCell.textContent = escapeHtml(patient.studentId) || 'N/A';

        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge ${patient.status.toLowerCase()}`;
        statusBadge.textContent = escapeHtml(patient.status);
        statusCell.appendChild(statusBadge);

        const ageCell = document.createElement('td');
        ageCell.textContent = patient.age || 'N/A';

        const actionsCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.className = 'submit-btn';
        editButton.textContent = 'Edit';
        editButton.style.marginRight = '5px';
        editButton.dataset.patientId = patient.patientId;

        // Attach event listener directly to the button
        editButton.addEventListener('click', function() {
            const patientId = parseInt(this.dataset.patientId);
            if (isNaN(patientId) || patientId <= 0) {
                console.error('Invalid patient ID:', this.dataset.patientId);
                alert('Invalid patient ID provided for editing.');
                return;
            }
            editPatient(patientId);
        });

        actionsCell.appendChild(editButton);
        row.appendChild(nameCell);
        row.appendChild(studentIdCell);
        row.appendChild(statusCell);
        row.appendChild(ageCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
}

// Function to edit a patient
async function editPatient(patientId) {
    // Validate patientId before proceeding
    if (!patientId || patientId <= 0) {
        console.error('Invalid patient ID provided for editing:', patientId);
        alert('Invalid patient ID provided for editing.');
        return;
    }

    try {
        // Fetch existing patient data from the server
        const response = await fetch(`/api/admin/patients/${patientId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get patient: ${response.status}`);
        }

        const result = await response.json();
        const patientData = result.patient;  // The patient data is nested in the result

        // Create a modal with edit form pre-populated with patient data
        const modal = createEditPatientModal(patientData);
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error fetching patient for editing:', error);
        alert('Failed to fetch patient data for editing.');
    }
}

// Function to create edit patient modal
function createEditPatientModal(patientData) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Patient: #${patientData.P_ID}</h2>
                <button id="closeEditPatientModal" class="close-modal-btn">&times;</button>
            </div>

            <form id="editPatientForm">
                <input type="hidden" id="editPatientId" value="${patientData.P_ID}">

                <div class="form-group">
                    <label for="editPatientName">Patient Name</label>
                    <input type="text" id="editPatientName" value="${escapeHtml(patientData.P_Name) || ''}">
                </div>

                <div class="form-group">
                    <label for="editPatientStudentId">Student ID</label>
                    <input type="text" id="editPatientStudentId" value="${escapeHtml(patientData.P_StudentId) || ''}">
                </div>

                <div class="flex-row">
                    <div class="form-group">
                        <label for="editPatientAge">Age</label>
                        <input type="number" id="editPatientAge" value="${patientData.P_Age || ''}" min="0" max="120">
                    </div>
                    <div class="form-group">
                        <label for="editPatientDOB">Date of Birth</label>
                        <input type="date" id="editPatientDOB" value="${patientData.P_DOB || ''}">
                    </div>
                </div>

                <div class="flex-row">
                    <div class="form-group">
                        <label for="editPatientSex">Sex</label>
                        <select id="editPatientSex">
                            <option value="">-- Select --</option>
                            <option value="Male" ${patientData.P_Sex === 'Male' ? 'selected' : ''}>Male</option>
                            <option value="Female" ${patientData.P_Sex === 'Female' ? 'selected' : ''}>Female</option>
                            <option value="Other" ${patientData.P_Sex === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editPatientStatus">Status</label>
                        <select id="editPatientStatus">
                            <option value="Student" ${patientData.P_Status === 'Student' ? 'selected' : ''}>Student</option>
                            <option value="Staff" ${patientData.P_Status === 'Staff' ? 'selected' : ''}>Staff</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="editPatientEthnicity">Ethnicity</label>
                    <input type="text" id="editPatientEthnicity" value="${escapeHtml(patientData.P_Ethnicity) || ''}">
                </div>

                <div class="form-group">
                    <label for="editPatientPhone">Phone</label>
                    <input type="tel" id="editPatientPhone" value="${escapeHtml(patientData.P_Phone) || ''}">
                </div>

                <div class="form-group">
                    <label for="editPatientBloodType">Blood Type</label>
                    <select id="editPatientBloodType">
                        <option value="">-- Select --</option>
                        <option value="A+" ${patientData.P_BloodType === 'A+' ? 'selected' : ''}>A+</option>
                        <option value="A-" ${patientData.P_BloodType === 'A-' ? 'selected' : ''}>A-</option>
                        <option value="B+" ${patientData.P_BloodType === 'B+' ? 'selected' : ''}>B+</option>
                        <option value="B-" ${patientData.P_BloodType === 'B-' ? 'selected' : ''}>B-</option>
                        <option value="AB+" ${patientData.P_BloodType === 'AB+' ? 'selected' : ''}>AB+</option>
                        <option value="AB-" ${patientData.P_BloodType === 'AB-' ? 'selected' : ''}>AB-</option>
                        <option value="O+" ${patientData.P_BloodType === 'O+' ? 'selected' : ''}>O+</option>
                        <option value="O-" ${patientData.P_BloodType === 'O-' ? 'selected' : ''}>O-</option>
                    </select>
                </div>

                <div class="form-actions">
                    <button type="submit" class="submit-btn">Save Changes</button>
                    <button type="button" id="cancelEditPatient" class="submit-btn cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;

    // Add event listeners to the modal elements
    const editPatientForm = modal.querySelector('#editPatientForm');
    editPatientForm.addEventListener('submit', handleEditPatientSubmit);

    const closeBtn = modal.querySelector('#closeEditPatientModal');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });

    const cancelBtn = modal.querySelector('#cancelEditPatient');
    cancelBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });

    return modal;
}

// Handle edit patient form submission
async function handleEditPatientSubmit(event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('editPatientName').value,
        studentId: document.getElementById('editPatientStudentId').value,
        age: document.getElementById('editPatientAge').value,
        dob: document.getElementById('editPatientDOB').value,
        sex: document.getElementById('editPatientSex').value,
        status: document.getElementById('editPatientStatus').value,
        ethnicity: document.getElementById('editPatientEthnicity').value,
        phone: document.getElementById('editPatientPhone').value,
        bloodType: document.getElementById('editPatientBloodType').value
    };

    const patientId = parseInt(document.getElementById('editPatientId').value);

    try {
        const response = await fetch(`/api/admin/patients/${patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Patient updated successfully!');
            document.body.removeChild(document.querySelector('.modal'));
            loadPatients(); // Refresh the patients list
        } else {
            alert(`Error: ${result.error || 'Failed to update patient'}`);
        }
    } catch (error) {
        console.error('Error updating patient:', error);
        alert('An error occurred while updating the patient.');
    }
}

// Load wellness records from the API
async function loadRecords(searchTerm = '') {
    try {
        const response = await fetch(`/api/admin/wellness?search=${encodeURIComponent(searchTerm)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load records: ${response.status}`);
        }

        const data = await response.json();
        renderRecordsTable(data.records);
    } catch (error) {
        console.error('Error loading records:', error);
        displayErrorMessage('Failed to load records. Please try again.');
    }
}

// Load treatments from the API
async function loadTreatments(searchTerm = '') {
    try {
        const response = await fetch('/api/doctor/treatments', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load treatments: ${response.status}`);
        }

        const data = await response.json();
        renderTreatmentsTable(data.treatments);
    } catch (error) {
        console.error('Error loading treatments:', error);
        displayErrorMessage('Failed to load treatments. Please try again.');
    }
}

// Render treatments table with data
function renderTreatmentsTable(treatments) {
    const tableBody = document.getElementById('treatmentsTableBody');
    if (!tableBody) {
        console.error('Treatments table body element not found');
        return;
    }

    if (!treatments || treatments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3">No treatments found.</td></tr>';
        return;
    }

    // Clear the table
    tableBody.innerHTML = '';

    // Add each treatment as a table row
    treatments.forEach(treatment => {
        const row = document.createElement('tr');

        // Create and populate table cells
        const idCell = document.createElement('td');
        idCell.textContent = treatment.T_ID;

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = escapeHtml(treatment.T_Description);

        const actionsCell = document.createElement('td');

        // Create edit button
        const editButton = document.createElement('button');
        editButton.className = 'submit-btn';
        editButton.textContent = 'Edit';
        editButton.style.marginRight = '5px';
        editButton.dataset.treatmentId = treatment.T_ID;

        // Attach event listener directly to the edit button
        editButton.addEventListener('click', function() {
            const treatmentId = parseInt(this.dataset.treatmentId);
            if (isNaN(treatmentId) || treatmentId <= 0) {
                console.error('Invalid treatment ID:', this.dataset.treatmentId);
                alert('Invalid treatment ID provided for editing.');
                return;
            }
            editTreatment(treatmentId);
        });

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'submit-btn';
        deleteButton.textContent = 'Delete';
        deleteButton.style.backgroundColor = '#e74c3c';
        deleteButton.dataset.treatmentId = treatment.T_ID;
        deleteButton.dataset.treatmentDesc = escapeHtml(treatment.T_Description);

        // Attach event listener directly to the delete button
        deleteButton.addEventListener('click', function() {
            const treatmentId = parseInt(this.dataset.treatmentId);
            if (isNaN(treatmentId) || treatmentId <= 0) {
                console.error('Invalid treatment ID:', this.dataset.treatmentId);
                alert('Invalid treatment ID provided for deletion.');
                return;
            }
            deleteTreatment(treatmentId, this.dataset.treatmentDesc);
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(idCell);
        row.appendChild(descriptionCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
}

// Function to edit a treatment
async function editTreatment(treatmentId) {
    // Validate treatmentId before making the API call
    if (!treatmentId || treatmentId <= 0) {
        console.error('Invalid treatment ID provided for editing:', treatmentId);
        alert('Invalid treatment ID provided for editing.');
        return;
    }

    try {
        // Fetch current treatment data
        const response = await fetch(`/api/admin/treatments/${treatmentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get treatment: ${response.status}`);
        }

        const result = await response.json();
        const treatmentData = result.treatment; // The treatment data is nested in the result

        // Create a modal with edit form
        const modal = createEditTreatmentModal(treatmentData);
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error fetching treatment for editing:', error);
        alert('Failed to fetch treatment data for editing.');
    }
}

// Function to delete a treatment
async function deleteTreatment(treatmentId, description) {
    if (!confirm(`Are you sure you want to delete treatment "${description}"? This can only be done if the treatment is not referenced by any wellness records.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/treatments/${treatmentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            alert('Treatment deleted successfully!');
            loadTreatments(); // Refresh the treatments list
        } else {
            alert(`Error: ${result.error || 'Failed to delete treatment'}`);
        }
    } catch (error) {
        console.error('Error deleting treatment:', error);
        alert('An error occurred while deleting the treatment.');
    }
}

// Function to create edit treatment modal
function createEditTreatmentModal(treatment) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Treatment: #${treatment.T_ID}</h2>
                <button id="closeEditTreatmentModal" class="close-modal-btn">&times;</button>
            </div>

            <form id="editTreatmentForm">
                <input type="hidden" id="editTreatmentId" value="${treatment.T_ID}">

                <div class="form-group">
                    <label for="editTreatmentDescription">Treatment Description</label>
                    <textarea id="editTreatmentDescription" rows="3" class="medium-textarea">${escapeHtml(treatment.T_Description)}</textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="submit-btn">Save Changes</button>
                    <button type="button" id="cancelEditTreatment" class="submit-btn cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;

    // Add event listeners to the modal elements
    const editTreatmentForm = modal.querySelector('#editTreatmentForm');
    editTreatmentForm.addEventListener('submit', handleEditTreatmentSubmit);

    const closeBtn = modal.querySelector('#closeEditTreatmentModal');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });

    const cancelBtn = modal.querySelector('#cancelEditTreatment');
    cancelBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });

    return modal;
}

// Handle edit treatment form submission
async function handleEditTreatmentSubmit(event) {
    event.preventDefault();

    const formData = {
        description: document.getElementById('editTreatmentDescription').value
    };

    const treatmentId = parseInt(document.getElementById('editTreatmentId').value);

    try {
        const response = await fetch(`/api/admin/treatments/${treatmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Treatment updated successfully!');
            document.body.removeChild(document.querySelector('.modal'));
            loadTreatments(); // Refresh the treatments list
        } else {
            alert(`Error: ${result.error || 'Failed to update treatment'}`);
        }
    } catch (error) {
        console.error('Error updating treatment:', error);
        alert('An error occurred while updating the treatment.');
    }
}

// Render users table with data
function renderUsersTable(users) {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) {
        console.error('Users table body element not found');
        return;
    }

    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
        return;
    }

    // Clear the table
    tableBody.innerHTML = '';

    // Add each user as a table row
    users.forEach(user => {
        const row = document.createElement('tr');

        // Create and populate table cells
        const usernameCell = document.createElement('td');
        usernameCell.textContent = escapeHtml(user.U_Username);

        const roleCell = document.createElement('td');
        const roleBadge = document.createElement('span');
        roleBadge.className = `status-badge ${user.U_Role.toLowerCase()}`;
        roleBadge.textContent = escapeHtml(user.U_Role);
        roleCell.appendChild(roleBadge);

        const firstNameCell = document.createElement('td');
        firstNameCell.textContent = escapeHtml(user.U_FirstName) || 'N/A';

        const lastNameCell = document.createElement('td');
        lastNameCell.textContent = escapeHtml(user.U_LastName) || 'N/A';

        const emailCell = document.createElement('td');
        emailCell.textContent = escapeHtml(user.U_Email) || 'N/A';

        const actionsCell = document.createElement('td');

        // Create edit button
        const editButton = document.createElement('button');
        editButton.className = 'submit-btn';
        editButton.textContent = 'Edit';
        editButton.style.marginRight = '5px';
        editButton.dataset.userId = user.U_ID;

        // Attach event listener directly to the edit button
        editButton.addEventListener('click', function() {
            const userId = parseInt(this.dataset.userId);
            if (isNaN(userId) || userId <= 0) {
                console.error('Invalid user ID:', this.dataset.userId);
                alert('Invalid user ID provided for editing.');
                return;
            }
            editUser(userId);
        });

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'submit-btn';
        deleteButton.textContent = 'Delete';
        deleteButton.style.backgroundColor = '#e74c3c';
        deleteButton.dataset.userId = user.U_ID;
        deleteButton.dataset.username = escapeHtml(user.U_Username);

        // Attach event listener directly to the delete button
        deleteButton.addEventListener('click', function() {
            const userId = parseInt(this.dataset.userId);
            if (isNaN(userId) || userId <= 0) {
                console.error('Invalid user ID:', this.dataset.userId);
                alert('Invalid user ID provided for deletion.');
                return;
            }
            deleteUser(userId, this.dataset.username);
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(usernameCell);
        row.appendChild(roleCell);
        row.appendChild(firstNameCell);
        row.appendChild(lastNameCell);
        row.appendChild(emailCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
}

// Render wellness records table with data
function renderRecordsTable(records) {
    const tableBody = document.getElementById('recordsTableBody');
    if (!tableBody) {
        console.error('Records table body element not found');
        return;
    }

    if (!records || records.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No wellness records found.</td></tr>';
        return;
    }

    // Clear the table
    tableBody.innerHTML = '';

    // Add each record as a table row
    records.forEach(record => {
        const row = document.createElement('tr');

        // Create and populate table cells
        const idCell = document.createElement('td');
        idCell.textContent = record.Record_ID;

        const patientNameCell = document.createElement('td');
        patientNameCell.textContent = escapeHtml(record.PatientName);

        const dateCell = document.createElement('td');
        // Format the date to a more readable format
        const formattedDate = new Date(record.Record_Date).toLocaleString();
        dateCell.textContent = formattedDate;

        const recordedByCell = document.createElement('td');
        recordedByCell.textContent = escapeHtml(record.RecordedBy);

        const actionsCell = document.createElement('td');

        // Create edit button
        const editButton = document.createElement('button');
        editButton.className = 'submit-btn';
        editButton.textContent = 'Edit';
        editButton.style.marginRight = '5px';
        editButton.dataset.recordId = record.Record_ID;

        // Attach event listener directly to the edit button
        editButton.addEventListener('click', function() {
            const recordId = parseInt(this.dataset.recordId);
            if (isNaN(recordId) || recordId <= 0) {
                console.error('Invalid record ID:', this.dataset.recordId);
                alert('Invalid record ID provided for editing.');
                return;
            }
            editWellnessRecord(recordId);
        });

        actionsCell.appendChild(editButton);
        row.appendChild(idCell);
        row.appendChild(patientNameCell);
        row.appendChild(dateCell);
        row.appendChild(recordedByCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
}

// Function to edit a user
async function editUser(userId) {
    // Validate userId before making the API call
    if (!userId || userId <= 0) {
        console.error('Invalid user ID provided for editing:', userId);
        alert('Invalid user ID provided for editing.');
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get user: ${response.status}`);
        }

        const result = await response.json();
        const userData = result.user;  // The user data is nested in the result

        // Create a modal with edit form
        const modal = createEditUserModal(userData);
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error fetching user for editing:', error);
        alert('Failed to fetch user data for editing.');
    }
}

// Function to delete a user
async function deleteUser(userId, username) {
    if (!confirm(`Are you sure you want to delete user "${username}"? All wellness records associated with this user will be reassigned to the system user (ID 0).`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            alert('User deleted successfully!');
            loadUsers(); // Refresh the users list
        } else {
            alert(`Error: ${result.error || 'Failed to delete user'}`);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('An error occurred while deleting the user.');
    }
}

// Function to create edit user modal
function createEditUserModal(userData) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit User: ${escapeHtml(userData.U_Username)}</h2>
                <button id="closeEditUserModal" class="close-modal-btn">&times;</button>
            </div>

            <form id="editUserForm">
                <input type="hidden" id="editUserId" value="${userData.U_ID}">

                <div class="form-group">
                    <label for="editUsername">Username</label>
                    <input type="text" id="editUsername" value="${escapeHtml(userData.U_Username)}">
                </div>

                <div class="form-group">
                    <label for="editRole">Role</label>
                    <select id="editRole">
                        <option value="Admin" ${userData.U_Role === 'Admin' ? 'selected' : ''}>Admin</option>
                        <option value="Doctor" ${userData.U_Role === 'Doctor' ? 'selected' : ''}>Doctor</option>
                        <option value="Student" ${userData.U_Role === 'Student' ? 'selected' : ''}>Student</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="editFirstName">First Name</label>
                    <input type="text" id="editFirstName" value="${escapeHtml(userData.U_FirstName) || ''}">
                </div>

                <div class="form-group">
                    <label for="editLastName">Last Name</label>
                    <input type="text" id="editLastName" value="${escapeHtml(userData.U_LastName) || ''}">
                </div>

                <div class="form-group">
                    <label for="editEmail">Email</label>
                    <input type="email" id="editEmail" value="${escapeHtml(userData.U_Email) || ''}">
                </div>

                <div class="form-actions">
                    <button type="submit" class="submit-btn">Save Changes</button>
                    <button type="button" id="cancelEditUser" class="submit-btn cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;

    // Add event listeners to the modal elements
    const editUserForm = modal.querySelector('#editUserForm');
    editUserForm.addEventListener('submit', handleEditUserSubmit);

    const closeBtn = modal.querySelector('#closeEditUserModal');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });

    const cancelBtn = modal.querySelector('#cancelEditUser');
    cancelBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });

    return modal;
}

// Handle edit user form submission
async function handleEditUserSubmit(event) {
    event.preventDefault();

    const formData = {
        username: document.getElementById('editUsername').value,
        role: document.getElementById('editRole').value,
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        email: document.getElementById('editEmail').value
    };

    const userId = parseInt(document.getElementById('editUserId').value);

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('User updated successfully!');
            document.body.removeChild(document.querySelector('.modal'));
            loadUsers(); // Refresh the users list
        } else {
            alert(`Error: ${result.error || 'Failed to update user'}`);
        }
    } catch (error) {
        console.error('Error updating user:', error);
        alert('An error occurred while updating the user.');
    }
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

// Function to edit a wellness record
async function editWellnessRecord(recordId) {
    // Validate recordId before proceeding - ensure it's a valid positive integer
    const parsedRecordId = parseInt(recordId, 10);
    if (isNaN(parsedRecordId) || parsedRecordId <= 0 || !Number.isInteger(parsedRecordId)) {
        console.error('Invalid record ID provided for editing:', recordId, 'Parsed as:', parsedRecordId);
        alert(`Invalid record ID provided for editing: ${recordId}`);
        return;
    }

    try {
        // Fetch existing record data from the server
        const response = await fetch(`/api/admin/wellness/${parsedRecordId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.error('Wellness record not found:', parsedRecordId);
                alert(`Wellness record with ID ${parsedRecordId} not found.`);
            } else if (response.status === 403) {
                console.error('Access denied when fetching wellness record:', parsedRecordId);
                alert('Access denied. Please check your permissions.');
            } else {
                throw new Error(`Failed to get wellness record: ${response.status} - ${response.statusText}`);
            }
            return;
        }

        const result = await response.json();

        const recordData = result.record;  // The record data is nested in the result
        if (!recordData) {
            console.error('No record data found in API response');
            alert('No record data found in API response.');
            return;
        }

        // Create a modal with edit form pre-populated with record data
        createEditWellnessRecordModal(recordData);
    } catch (error) {
        console.error('Error fetching wellness record for editing:', error);
        if (error.message.includes('Failed to fetch')) {
            alert('Failed to connect to the server. Please check your network connection.');
        } else {
            alert(`Failed to fetch wellness record data for editing: ${error.message}`);
        }
    }
}

// Function to create edit wellness record modal
function createEditWellnessRecordModal(recordData) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Wellness Record: #${recordData.Record_ID}</h2>
                <button id="closeEditWellnessRecordModal" class="close-modal-btn">&times;</button>
            </div>

            <form id="editWellnessRecordForm">
                <input type="hidden" id="editRecordId" value="${recordData.Record_ID}">

                <div class="flex-row">
                    <div class="form-group">
                        <label for="editRecordDate">Date</label>
                        <input type="datetime-local" id="editRecordDate" value="">
                    </div>
                    <div class="form-group">
                        <label for="editSleepHours">Sleep Hours</label>
                        <input type="number" id="editSleepHours" step="0.1" min="0" max="24" value="${recordData.Sleep_Hours || ''}">
                    </div>
                </div>

                <div class="flex-row">
                    <div class="form-group">
                        <label for="editStudyHours">Study Hours</label>
                        <input type="number" id="editStudyHours" step="0.1" min="0" value="${recordData.Study_Hours || ''}">
                    </div>
                    <div class="form-group">
                        <label for="editExerciseMinutes">Exercise Minutes</label>
                        <input type="number" id="editExerciseMinutes" min="0" value="${recordData.Exercise_Minutes || ''}">
                    </div>
                </div>

                <div class="flex-row">
                    <div class="form-group">
                        <label for="editMood">Mood</label>
                        <input type="text" id="editMood" value="${escapeHtml(recordData.Mood) || ''}">
                    </div>
                    <div class="form-group">
                        <label for="editHeartRate">Heart Rate</label>
                        <input type="number" id="editHeartRate" min="0" value="${recordData.Heart_Rate || ''}">
                    </div>
                </div>

                <div class="flex-row">
                    <div class="form-group">
                        <label for="editTemperature">Temperature</label>
                        <input type="number" id="editTemperature" step="0.1" min="0" value="${recordData.Temperature || ''}">
                    </div>
                    <div class="form-group">
                        <label for="editPulse">Pulse</label>
                        <input type="number" id="editPulse" min="0" value="${recordData.Pulse || ''}">
                    </div>
                </div>

                <div class="form-group">
                    <label for="editComplaint">Complaint</label>
                    <input type="text" id="editComplaint" value="${escapeHtml(recordData.Complaint) || ''}">
                </div>

                <div class="flex-row">
                    <div class="form-group">
                        <label for="editFollowUpDate">Follow Up Date</label>
                        <input type="date" id="editFollowUpDate" value="${recordData.Follow_Up_Date || ''}">
                    </div>
                    <div class="form-group">
                        <label for="editReferralTo">Referral To</label>
                        <input type="text" id="editReferralTo" value="${escapeHtml(recordData.Referral_To || '') || ''}">
                    </div>
                </div>

                <div class="flex-row">
                    <div class="form-group">
                        <label for="editProgramCode">Program Code</label>
                        <input type="text" id="editProgramCode" value="${escapeHtml(recordData.Program_Code || '') || ''}">
                    </div>
                    <div class="form-group">
                        <label for="editPatientId">Patient ID</label>
                        <input type="number" id="editPatientId" readonly value="${recordData.P_ID || ''}">
                    </div>
                </div>

                <div class="form-group">
                    <label for="editComments">Comments</label>
                    <textarea id="editComments" rows="3">${escapeHtml(recordData.Comments) || ''}</textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="submit-btn">Save Changes</button>
                    <button type="button" id="cancelEditWellnessRecord" class="submit-btn cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;

    // Add event listeners to the modal elements
    const editWellnessRecordForm = modal.querySelector('#editWellnessRecordForm');
    editWellnessRecordForm.addEventListener('submit', handleEditWellnessRecordSubmit);

    const closeBtn = modal.querySelector('#closeEditWellnessRecordModal');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });

    const cancelBtn = modal.querySelector('#cancelEditWellnessRecord');
    cancelBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });

    // Add the modal to the document before setting date value
    document.body.appendChild(modal);

    // Format date to work with datetime-local input
    if (recordData.Record_Date) {
        const date = new Date(recordData.Record_Date);
        // Format to 'YYYY-MM-DDTHH:mm' for datetime-local input
        const formattedDate = date.toISOString().slice(0, 16);
        const dateElement = document.getElementById('editRecordDate');
        if (dateElement) {
            dateElement.value = formattedDate;
        }
    }

    return modal;
}

// Handle edit wellness record form submission
async function handleEditWellnessRecordSubmit(event) {
    event.preventDefault();

    const formData = {
        date: document.getElementById('editRecordDate').value,
        sleepHours: parseFloat(document.getElementById('editSleepHours').value) || null,
        studyHours: parseFloat(document.getElementById('editStudyHours').value) || null,
        exerciseMinutes: parseInt(document.getElementById('editExerciseMinutes').value) || null,
        mood: document.getElementById('editMood').value || null,
        heartRate: parseFloat(document.getElementById('editHeartRate').value) || null,
        temperature: parseFloat(document.getElementById('editTemperature').value) || null,
        pulse: parseInt(document.getElementById('editPulse').value) || null,
        complaint: document.getElementById('editComplaint').value || null,
        followUpDate: document.getElementById('editFollowUpDate').value || null,
        referralTo: document.getElementById('editReferralTo').value || null,
        programCode: document.getElementById('editProgramCode').value || null,
        comments: document.getElementById('editComments').value || null
    };

    const recordId = parseInt(document.getElementById('editRecordId').value);

    try {
        const response = await fetch(`/api/admin/wellness/${recordId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Wellness record updated successfully!');
            document.body.removeChild(document.querySelector('.modal'));
            loadRecords(); // Refresh the records list
        } else {
            alert(`Error: ${result.error || 'Failed to update wellness record'}`);
        }
    } catch (error) {
        console.error('Error updating wellness record:', error);
        alert('An error occurred while updating the wellness record.');
    }
}

// Display error message
function displayErrorMessage(message) {
    // Create a temporary error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

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