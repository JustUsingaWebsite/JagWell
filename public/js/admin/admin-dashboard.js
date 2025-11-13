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
        // For now, we'll use the doctor endpoint that lists patients
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

        row.innerHTML = `
            <td>${escapeHtml(patient.name)}</td>
            <td>${escapeHtml(patient.studentId) || 'N/A'}</td>
            <td><span class="status-badge ${patient.status.toLowerCase()}">${escapeHtml(patient.status)}</span></td>
            <td>${patient.age || 'N/A'}</td>
            <td>
                <button class="submit-btn" onclick="editPatient(${patient.patientId})" style="margin-right: 5px;">Edit</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to edit a patient
async function editPatient(patientId) {
    try {
        // Fetch existing patient data
        // This would need a dedicated endpoint to get a single patient's data
        // For now, we'll simulate a modal to edit patient data
        
        const modal = createEditPatientModal(patientId);
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error preparing patient edit:', error);
        alert('Failed to prepare patient edit form.');
    }
}

// Function to create edit patient modal
function createEditPatientModal(patientId) {
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

    modal.innerHTML = `
        <div class="modal-content" style="
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            width: 80%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2>Edit Patient</h2>
                <button id="closeEditPatientModal" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 5px;
                ">&times;</button>
            </div>
            
            <form id="editPatientForm">
                <input type="hidden" id="editPatientId" value="${patientId}">
                
                <div class="form-group">
                    <label for="editPatientName">Patient Name</label>
                    <input type="text" id="editPatientName" placeholder="Patient Name">
                </div>
                
                <div class="form-group">
                    <label for="editPatientStudentId">Student ID</label>
                    <input type="text" id="editPatientStudentId" placeholder="Student ID">
                </div>
                
                <div class="flex-row">
                    <div class="form-group">
                        <label for="editPatientAge">Age</label>
                        <input type="number" id="editPatientAge" min="0" max="120">
                    </div>
                    <div class="form-group">
                        <label for="editPatientDOB">Date of Birth</label>
                        <input type="date" id="editPatientDOB">
                    </div>
                </div>
                
                <div class="flex-row">
                    <div class="form-group">
                        <label for="editPatientSex">Sex</label>
                        <select id="editPatientSex">
                            <option value="">-- Select --</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editPatientStatus">Status</label>
                        <select id="editPatientStatus">
                            <option value="Student">Student</option>
                            <option value="Staff">Staff</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editPatientEthnicity">Ethnicity</label>
                    <input type="text" id="editPatientEthnicity" placeholder="Ethnicity">
                </div>
                
                <div class="form-group">
                    <label for="editPatientPhone">Phone</label>
                    <input type="tel" id="editPatientPhone" placeholder="Phone Number">
                </div>
                
                <div class="form-group">
                    <label for="editPatientBloodType">Blood Type</label>
                    <select id="editPatientBloodType">
                        <option value="">-- Select --</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button type="submit" class="submit-btn">Save Changes</button>
                    <button type="button" id="cancelEditPatient" class="submit-btn" style="background-color: #95a5a6;">Cancel</button>
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

    // This would need to fetch and populate the existing patient data
    // For now, we'll leave the fields empty

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
        // This would need a new API endpoint for admin to list all records
        // For now, we'll simulate by not loading anything
        
        const tableBody = document.getElementById('recordsTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="5">Records loading functionality will be implemented via API endpoint.</td></tr>';
        }
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

        row.innerHTML = `
            <td>${treatment.T_ID}</td>
            <td>${escapeHtml(treatment.T_Description)}</td>
            <td>
                <button class="submit-btn" onclick="editTreatment(${treatment.T_ID})" style="margin-right: 5px;">Edit</button>
                <button class="submit-btn" style="background-color: #e74c3c;" onclick="deleteTreatment(${treatment.T_ID}, '${escapeHtml(treatment.T_Description)}')">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to edit a treatment
async function editTreatment(treatmentId) {
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

        const treatmentData = await response.json();
        
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

    modal.innerHTML = `
        <div class="modal-content" style="
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            width: 80%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2>Edit Treatment: #${treatment.T_ID}</h2>
                <button id="closeEditTreatmentModal" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 5px;
                ">&times;</button>
            </div>
            
            <form id="editTreatmentForm">
                <input type="hidden" id="editTreatmentId" value="${treatment.T_ID}">
                
                <div class="form-group">
                    <label for="editTreatmentDescription">Treatment Description</label>
                    <textarea id="editTreatmentDescription" rows="3" class="medium-textarea">${escapeHtml(treatment.T_Description)}</textarea>
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button type="submit" class="submit-btn">Save Changes</button>
                    <button type="button" id="cancelEditTreatment" class="submit-btn" style="background-color: #95a5a6;">Cancel</button>
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

        row.innerHTML = `
            <td>${escapeHtml(user.U_Username)}</td>
            <td><span class="status-badge ${user.U_Role.toLowerCase()}">${escapeHtml(user.U_Role)}</span></td>
            <td>${escapeHtml(user.U_FirstName) || 'N/A'}</td>
            <td>${escapeHtml(user.U_LastName) || 'N/A'}</td>
            <td>${escapeHtml(user.U_Email) || 'N/A'}</td>
            <td>
                <button class="submit-btn" onclick="editUser(${user.U_ID})" style="margin-right: 5px;">Edit</button>
                <button class="submit-btn" style="background-color: #e74c3c;" onclick="deleteUser(${user.U_ID}, '${escapeHtml(user.U_Username)}')">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to edit a user
async function editUser(userId) {
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

        const userData = await response.json();
        
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

    modal.innerHTML = `
        <div class="modal-content" style="
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            width: 80%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2>Edit User: ${escapeHtml(userData.U_Username)}</h2>
                <button id="closeEditUserModal" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 5px;
                ">&times;</button>
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
                
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button type="submit" class="submit-btn">Save Changes</button>
                    <button type="button" id="cancelEditUser" class="submit-btn" style="background-color: #95a5a6;">Cancel</button>
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