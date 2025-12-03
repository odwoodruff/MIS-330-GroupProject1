const API_BASE_URL = '/api';
let currentUser = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    const dateInput = document.getElementById('session-datetime');
    if (dateInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        dateInput.min = now.toISOString().slice(0, 16);
    }
});

// Authentication Functions
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        showMainApp();
    } else {
        showAuthModal();
    }
}

function showAuthModal() {
    document.getElementById('auth-modal').style.display = 'block';
    document.getElementById('main-tabs').style.display = 'none';
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
}

function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

function showAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.auth-tab').classList.add('active');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('register-form').classList.add('active');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('login-username').value,
                password: document.getElementById('login-password').value
            })
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMainApp();
            closeAuthModal();
            showMessage('Login successful!', 'success');
        } else {
            showMessage('Invalid username or password', 'error');
        }
    } catch (error) {
        showMessage('Login failed. Please try again.', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('reg-username').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-password').value,
                firstName: document.getElementById('reg-firstname').value,
                lastName: document.getElementById('reg-lastname').value,
                phone: document.getElementById('reg-phone').value,
                role: document.getElementById('reg-role').value,
                specialization: document.getElementById('reg-specialization').value
            })
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMainApp();
            closeAuthModal();
            showMessage('Registration successful!', 'success');
        } else {
            let errorMessage = 'Registration failed';
            try {
                const error = await response.json();
                errorMessage = error.message || error.title || JSON.stringify(error);
            } catch (e) {
                errorMessage = `Registration failed: ${response.status} ${response.statusText}`;
            }
            console.error('Registration error:', errorMessage);
            showMessage(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Registration exception:', error);
        showMessage(`Registration failed: ${error.message}`, 'error');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showAuthModal();
    showMessage('Logged out successfully', 'success');
}

function showMainApp() {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('main-tabs').style.display = 'flex';
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('user-name').textContent = `${currentUser.firstName} ${currentUser.lastName} (${currentUser.role})`;
    
    if (currentUser.role === 'Trainer') {
        document.getElementById('trainer-tab').style.display = 'block';
    }
    
    showTab('classes');
    loadInitialData();
}

function toggleSpecialization() {
    const role = document.getElementById('reg-role').value;
    document.getElementById('specialization-group').style.display = role === 'Trainer' ? 'block' : 'none';
}

// Tab Navigation
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const tab = document.getElementById(`${tabName}-tab`);
    if (tab) {
        tab.classList.add('active');
    }
    
    event?.target?.classList.add('active');
    
    if (tabName === 'classes') {
        filterClasses();
    } else if (tabName === 'bookings') {
        loadBookings();
    } else if (tabName === 'pets') {
        loadPets();
    } else if (tabName === 'profile') {
        loadProfile();
    } else if (tabName === 'trainer') {
        showTrainerTab('my-classes');
    }
}

// Load Initial Data
function loadInitialData() {
    loadSessions();
    loadTrainers();
    if (currentUser) {
        loadBookings();
        loadPets();
    }
}

// Classes/Sessions Management
async function loadSessions() {
    try {
        const response = await fetch(`${API_BASE_URL}/sessions`);
        const sessions = await response.json();
        
        const sessionSelect = document.getElementById('session-type');
        if (sessionSelect) {
            sessionSelect.innerHTML = '<option value="">Select a session...</option>';
            sessions.forEach(session => {
                const option = document.createElement('option');
                option.value = session.id;
                option.textContent = `${session.type} - $${session.price} (${session.durationMinutes} min)`;
                option.dataset.session = JSON.stringify(session);
                sessionSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

async function filterClasses() {
    try {
        const search = document.getElementById('class-search')?.value || '';
        const sortParts = (document.getElementById('class-sort')?.value || 'id-asc').split('-');
        const sortBy = sortParts[0];
        const sortOrder = sortParts[1];
        const trainerId = document.getElementById('class-trainer')?.value || '';
        const minPrice = document.getElementById('min-price')?.value || '';
        const maxPrice = document.getElementById('max-price')?.value || '';

        let url = `${API_BASE_URL}/sessions?`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (sortBy) url += `sortBy=${sortBy}&`;
        if (sortOrder) url += `sortOrder=${sortOrder}&`;
        if (trainerId) url += `trainerId=${trainerId}&`;
        if (minPrice) url += `minPrice=${minPrice}&`;
        if (maxPrice) url += `maxPrice=${maxPrice}&`;

        const response = await fetch(url);
        const sessions = await response.json();
        
        const classesList = document.getElementById('classes-list');
        if (classesList) {
            if (sessions.length === 0) {
                classesList.innerHTML = '<div class="empty-state">No classes found</div>';
                return;
            }
            
            classesList.innerHTML = sessions.map(session => `
                <div class="class-card">
                    <h3>${session.type}</h3>
                    <p><strong>Trainer:</strong> ${session.trainer.firstName} ${session.trainer.lastName}</p>
                    <p><strong>Description:</strong> ${session.description}</p>
                    <p><strong>Price:</strong> $${session.price}</p>
                    <p><strong>Duration:</strong> ${session.durationMinutes} minutes</p>
                    <button onclick="bookSession(${session.id})" class="btn-primary" style="margin-top: 10px;">Book Now</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error filtering classes:', error);
    }
}

async function loadTrainers() {
    try {
        const response = await fetch(`${API_BASE_URL}/trainers`);
        const trainers = await response.json();
        
        const trainerSelect = document.getElementById('class-trainer');
        if (trainerSelect) {
            trainers.forEach(trainer => {
                const option = document.createElement('option');
                option.value = trainer.id;
                option.textContent = `${trainer.firstName} ${trainer.lastName}`;
                trainerSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading trainers:', error);
    }
}

function updateSessionDetails() {
    const sessionSelect = document.getElementById('session-type');
    const sessionInfo = document.getElementById('session-info');
    if (!sessionSelect || !sessionInfo) return;
    
    const selectedOption = sessionSelect.options[sessionSelect.selectedIndex];
    
    if (selectedOption.value) {
        const session = JSON.parse(selectedOption.dataset.session);
        sessionInfo.innerHTML = `
            <p><strong>Trainer:</strong> ${session.trainer.firstName} ${session.trainer.lastName}</p>
            <p><strong>Description:</strong> ${session.description}</p>
            <p><strong>Price:</strong> $${session.price}</p>
            <p><strong>Duration:</strong> ${session.durationMinutes} minutes</p>
        `;
        sessionInfo.classList.add('active');
    } else {
        sessionInfo.classList.remove('active');
    }
}

function bookSession(sessionId) {
    showTab('booking');
    document.getElementById('session-type').value = sessionId;
    updateSessionDetails();
}

// Booking Management
document.getElementById('booking-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser || !currentUser.id) {
        showMessage('Please register as a customer first', 'error');
        return;
    }
    
    try {
        // Create pet if needed
        const petData = {
            name: document.getElementById('pet-name').value,
            species: document.getElementById('pet-species').value,
            breed: document.getElementById('pet-breed').value || 'Unknown',
            age: parseInt(document.getElementById('pet-age').value) || 0,
            customerId: currentUser.id
        };
        
        let petId;
        const existingPets = await fetch(`${API_BASE_URL}/pets/owner/${currentUser.id}`).then(r => r.json());
        const existingPet = existingPets.find(p => p.name === petData.name);
        
        if (existingPet) {
            petId = existingPet.id;
        } else {
            const petResponse = await fetch(`${API_BASE_URL}/pets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(petData)
            });
            const pet = await petResponse.json();
            petId = pet.id;
        }
        
        // Create booking
        const bookingData = {
            customerId: currentUser.id,
            petId: petId,
            classId: parseInt(document.getElementById('session-type').value),
            sessionDateTime: new Date(document.getElementById('session-datetime').value).toISOString(),
            status: 'Pending',
            notes: document.getElementById('booking-notes').value || ''
        };
        
        const bookingResponse = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        
        if (bookingResponse.ok) {
            showMessage('Booking created successfully!', 'success');
            document.getElementById('booking-form').reset();
            document.getElementById('session-info').classList.remove('active');
            loadBookings();
            loadPets();
        } else {
            throw new Error('Failed to create booking');
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        showMessage('Error creating booking. Please try again.', 'error');
    }
});

async function loadBookings() {
    if (!currentUser || !currentUser.id) return;
    
    try {
        const statusFilter = document.getElementById('booking-status-filter')?.value || '';
        const sortParts = (document.getElementById('booking-sort')?.value || 'date-desc').split('-');
        const sortBy = sortParts[0];
        const sortOrder = sortParts[1];
        
        let url = `${API_BASE_URL}/bookings?customerId=${currentUser.id}`;
        if (statusFilter) url += `&status=${statusFilter}`;
        url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        
        const response = await fetch(url);
        const bookings = await response.json();
        
        const bookingsList = document.getElementById('bookings-list');
        if (bookingsList) {
            if (bookings.length === 0) {
                bookingsList.innerHTML = '<div class="empty-state">No bookings found</div>';
                return;
            }
            
            bookingsList.innerHTML = bookings.map(booking => `
                <div class="booking-card">
                    <h3>${booking.pet.name} - ${booking.class.type}</h3>
                    <p><strong>Trainer:</strong> ${booking.class.trainer.firstName} ${booking.class.trainer.lastName}</p>
                    <p><strong>Date & Time:</strong> ${formatDateTime(booking.sessionDateTime)}</p>
                    <p><strong>Price:</strong> $${booking.class.price}</p>
                    <p><strong>Duration:</strong> ${booking.class.durationMinutes} minutes</p>
                    ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
                    <span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span>
                    ${booking.status === 'Pending' || booking.status === 'Confirmed' ? 
                        `<button onclick="cancelBooking(${booking.id})" class="btn-danger" style="margin-top: 10px;">Cancel Booking</button>` : ''}
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            showMessage('Booking cancelled successfully', 'success');
            loadBookings();
        } else {
            showMessage('Failed to cancel booking', 'error');
        }
    } catch (error) {
        showMessage('Error cancelling booking', 'error');
    }
}

// Pet Management
async function loadPets() {
    if (!currentUser || !currentUser.id) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/pets/owner/${currentUser.id}`);
        const pets = await response.json();
        
        const petsList = document.getElementById('pets-list');
        if (petsList) {
            if (pets.length === 0) {
                petsList.innerHTML = '<div class="empty-state">No pets registered</div>';
                return;
            }
            
            petsList.innerHTML = pets.map(pet => `
                <div class="pet-card">
                    <h3>${pet.name}</h3>
                    <p><strong>Species:</strong> ${pet.species}</p>
                    <p><strong>Breed:</strong> ${pet.breed}</p>
                    <p><strong>Age:</strong> ${pet.age} years</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading pets:', error);
    }
}

function showAddPetForm() {
    // Simple implementation - could be enhanced with a modal
    const petName = prompt('Enter pet name:');
    if (!petName) return;
    
    const petSpecies = prompt('Enter species (Dog/Cat/Other):');
    if (!petSpecies) return;
    
    addPet({
        name: petName,
        species: petSpecies,
        breed: prompt('Enter breed (optional):') || 'Unknown',
        age: parseInt(prompt('Enter age:') || '0'),
        customerId: currentUser.id
    });
}

async function addPet(petData) {
    try {
        const response = await fetch(`${API_BASE_URL}/pets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(petData)
        });
        
        if (response.ok) {
            showMessage('Pet added successfully', 'success');
            loadPets();
        } else {
            showMessage('Failed to add pet', 'error');
        }
    } catch (error) {
        showMessage('Error adding pet', 'error');
    }
}

// Profile Management
async function loadProfile() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile/${currentUser.id}`);
        const data = await response.json();
        const user = data.user;
        
        document.getElementById('profile-firstname').value = user.firstName;
        document.getElementById('profile-lastname').value = user.lastName;
        document.getElementById('profile-email').value = user.email;
        document.getElementById('profile-phone').value = user.phone || '';
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function updateProfile(event) {
    event.preventDefault();
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: document.getElementById('profile-firstname').value,
                lastName: document.getElementById('profile-lastname').value,
                email: document.getElementById('profile-email').value,
                phone: document.getElementById('profile-phone').value,
                password: document.getElementById('profile-password').value || null
            })
        });
        
        if (response.ok) {
            showMessage('Profile updated successfully', 'success');
            // Reload user data
            const profileResponse = await fetch(`${API_BASE_URL}/auth/profile/${currentUser.id}`);
            const data = await profileResponse.json();
            currentUser = { ...currentUser, ...data.user };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            document.getElementById('user-name').textContent = `${currentUser.firstName} ${currentUser.lastName} (${currentUser.role})`;
        } else {
            showMessage('Failed to update profile', 'error');
        }
    } catch (error) {
        showMessage('Error updating profile', 'error');
    }
}

// Trainer Dashboard
function showTrainerTab(tab) {
    document.querySelectorAll('.trainer-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.trainer-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    if (tab === 'my-classes') {
        loadTrainerClasses();
    } else if (tab === 'bookings') {
        loadTrainerBookings();
    }
}

async function loadTrainerClasses() {
    if (!currentUser || (!currentUser.TrainerId && !currentUser.trainerId)) return;
    
    try {
        const trainerId = currentUser.TrainerId || currentUser.trainerId;
        const response = await fetch(`${API_BASE_URL}/trainerclasses/trainer/${trainerId}`);
        const classes = await response.json();
        
        const list = document.getElementById('trainer-classes-list');
        if (list) {
            if (classes.length === 0) {
                list.innerHTML = '<div class="empty-state">No classes found</div>';
                return;
            }
            
            list.innerHTML = classes.map(session => `
                <div class="class-card">
                    <h3>${session.type}</h3>
                    <p><strong>Description:</strong> ${session.description}</p>
                    <p><strong>Price:</strong> $${session.price}</p>
                    <p><strong>Duration:</strong> ${session.durationMinutes} minutes</p>
                    <p><strong>Bookings:</strong> ${session.bookings?.length || 0}</p>
                    <button onclick="editClass(${session.id})" class="btn-secondary" style="margin-top: 10px;">Edit</button>
                    <button onclick="deleteClass(${session.id})" class="btn-danger" style="margin-top: 10px;">Delete</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading trainer classes:', error);
    }
}

async function loadTrainerBookings() {
    if (!currentUser || (!currentUser.TrainerId && !currentUser.trainerId)) return;
    
    try {
        const trainerId = currentUser.TrainerId || currentUser.trainerId;
        const response = await fetch(`${API_BASE_URL}/trainerclasses/trainer/${trainerId}/bookings/upcoming`);
        const bookings = await response.json();
        
        const list = document.getElementById('trainer-bookings-list');
        if (list) {
            if (bookings.length === 0) {
                list.innerHTML = '<div class="empty-state">No upcoming bookings</div>';
                return;
            }
            
            list.innerHTML = bookings.map(booking => `
                <div class="booking-card">
                    <h3>${booking.pet.name} - ${booking.class.type}</h3>
                    <p><strong>Customer:</strong> ${booking.customer.firstName} ${booking.customer.lastName}</p>
                    <p><strong>Date & Time:</strong> ${formatDateTime(booking.sessionDateTime)}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></p>
                    ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
                    ${booking.status === 'Pending' ? 
                        `<button onclick="confirmBooking(${booking.id})" class="btn-primary" style="margin-top: 10px;">Confirm</button>` : ''}
                    <button onclick="updateBookingStatus(${booking.id}, 'Cancelled')" class="btn-danger" style="margin-top: 10px;">Cancel</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading trainer bookings:', error);
    }
}

async function confirmBooking(bookingId) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/confirm`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            showMessage('Booking confirmed', 'success');
            loadTrainerBookings();
        }
    } catch (error) {
        showMessage('Error confirming booking', 'error');
    }
}

async function updateBookingStatus(bookingId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/trainerclasses/booking/${bookingId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showMessage('Booking status updated', 'success');
            loadTrainerBookings();
        }
    } catch (error) {
        showMessage('Error updating booking status', 'error');
    }
}

async function editClass(classId) {
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/${classId}`);
        const session = await response.json();
        
        document.getElementById('class-id').value = session.id;
        document.getElementById('class-type').value = session.type;
        document.getElementById('class-price').value = session.price;
        document.getElementById('class-duration').value = session.durationMinutes;
        document.getElementById('class-description').value = session.description;
        
        showTrainerTab('manage-classes');
        document.querySelectorAll('.trainer-tab-btn')[2].classList.add('active');
    } catch (error) {
        showMessage('Error loading class', 'error');
    }
}

async function deleteClass(classId) {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/${classId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage('Class deleted successfully', 'success');
            loadTrainerClasses();
        }
    } catch (error) {
        showMessage('Error deleting class', 'error');
    }
}

async function saveClass(event) {
    event.preventDefault();
    
    if (!currentUser || (!currentUser.TrainerId && !currentUser.trainerId)) {
        showMessage('You must be a trainer to create classes', 'error');
        return;
    }
    
    try {
        const trainerId = currentUser.TrainerId || currentUser.trainerId;
        const classData = {
            id: document.getElementById('class-id').value ? parseInt(document.getElementById('class-id').value) : 0,
            type: document.getElementById('class-type').value,
            description: document.getElementById('class-description').value,
            price: parseFloat(document.getElementById('class-price').value),
            durationMinutes: parseInt(document.getElementById('class-duration').value),
            trainerId: trainerId
        };
        
        const url = classData.id > 0 
            ? `${API_BASE_URL}/sessions/${classData.id}`
            : `${API_BASE_URL}/sessions`;
        
        const method = classData.id > 0 ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classData)
        });
        
        if (response.ok) {
            showMessage('Class saved successfully', 'success');
            resetClassForm();
            loadTrainerClasses();
        } else {
            showMessage('Failed to save class', 'error');
        }
    } catch (error) {
        showMessage('Error saving class', 'error');
    }
}

function resetClassForm() {
    document.getElementById('class-form').reset();
    document.getElementById('class-id').value = '';
}

// Utility Functions
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    setTimeout(() => {
        messageDiv.classList.remove('success', 'error');
    }, 5000);
}
