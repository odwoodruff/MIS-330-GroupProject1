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
            // Map to expected property names for compatibility
            currentUser.id = currentUser.CustomerId || currentUser.customerId;
            currentUser.firstName = currentUser.CustFName || currentUser.custFName;
            currentUser.lastName = currentUser.CustLName || currentUser.custLName;
            currentUser.email = currentUser.CustEmail || currentUser.custEmail;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMainApp();
            closeAuthModal();
            showMessage('Login successful!', 'success');
        } else {
            showMessage('Invalid email or password', 'error');
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
                custFName: document.getElementById('reg-firstname').value,
                custLName: document.getElementById('reg-lastname').value,
                custEmail: document.getElementById('reg-email').value,
                custPhoneNum: document.getElementById('reg-phone').value,
                address: document.getElementById('reg-address').value,
                password: document.getElementById('reg-password').value
            })
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            // Map to expected property names for compatibility
            currentUser.id = currentUser.CustomerId || currentUser.customerId;
            currentUser.firstName = currentUser.CustFName || currentUser.custFName;
            currentUser.lastName = currentUser.CustLName || currentUser.custLName;
            currentUser.email = currentUser.CustEmail || currentUser.custEmail;
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

async function showMainApp() {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('main-tabs').style.display = 'flex';
    document.getElementById('user-info').style.display = 'block';
    const firstName = currentUser.firstName || currentUser.CustFName || currentUser.custFName || '';
    const lastName = currentUser.lastName || currentUser.CustLName || currentUser.custLName || '';
    document.getElementById('user-name').textContent = `${firstName} ${lastName} (Customer)`;
    
    // Check if user is a trainer
    try {
        const trainersResponse = await fetch(`${API_BASE_URL}/trainers`);
        const trainers = await trainersResponse.json();
        const trainer = trainers.find(t => (t.employeeId || t.EmployeeId) === (currentUser.employeeId || currentUser.EmployeeId || currentUser.id));
        if (trainer) {
            document.getElementById('trainer-tab').style.display = 'block';
            currentUser.employeeId = trainer.employeeId || trainer.EmployeeId;
        }
    } catch (error) {
        console.error('Error checking trainer status:', error);
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
            option.value = session.classId || session.ClassId;
            const duration = session.endTime && session.startTime 
                ? Math.round((new Date('2000-01-01T' + session.endTime) - new Date('2000-01-01T' + session.startTime)) / 60000)
                : 60;
            option.textContent = `${session.className || session.ClassName} - $${session.price} (${duration} min)`;
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
            
            classesList.innerHTML = sessions.map(session => {
                const trainer = session.trainer?.employee || session.Trainer?.Employee || {};
                const className = session.className || session.ClassName;
                const description = session.description || session.Description;
                const price = session.price || session.Price;
                const startTime = session.startTime || session.StartTime;
                const endTime = session.endTime || session.EndTime;
                const duration = startTime && endTime 
                    ? Math.round((new Date('2000-01-01T' + endTime) - new Date('2000-01-01T' + startTime)) / 60000)
                    : 60;
                const classId = session.classId || session.ClassId;
                
                return `
                <div class="class-card">
                    <h3>${className}</h3>
                    <p><strong>Trainer:</strong> ${trainer.empFName || trainer.EmpFName || ''} ${trainer.empLName || trainer.EmpLName || ''}</p>
                    <p><strong>Description:</strong> ${description}</p>
                    <p><strong>Type:</strong> ${session.classType || session.ClassType}</p>
                    <p><strong>Difficulty:</strong> ${session.difficultyLevel || session.DifficultyLevel}</p>
                    <p><strong>Date:</strong> ${new Date(session.date || session.Date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
                    <p><strong>Price:</strong> $${price}</p>
                    <p><strong>Duration:</strong> ${duration} minutes</p>
                    <button onclick="bookSession(${classId})" class="btn-primary" style="margin-top: 10px;">Book Now</button>
                </div>
            `;
            }).join('');
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
            trainerSelect.innerHTML = '<option value="">All Trainers</option>';
            trainers.forEach(trainer => {
                const option = document.createElement('option');
                const employee = trainer.employee || trainer.Employee || {};
                option.value = trainer.employeeId || trainer.EmployeeId;
                const firstName = employee.empFName || employee.EmpFName || '';
                const lastName = employee.empLName || employee.EmpLName || '';
                option.textContent = `${firstName} ${lastName}`;
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
        const trainer = session.trainer?.employee || session.Trainer?.Employee || {};
        const duration = session.endTime && session.startTime 
            ? Math.round((new Date('2000-01-01T' + session.endTime) - new Date('2000-01-01T' + session.startTime)) / 60000)
            : 60;
        sessionInfo.innerHTML = `
            <p><strong>Trainer:</strong> ${trainer.empFName || trainer.EmpFName || ''} ${trainer.empLName || trainer.EmpLName || ''}</p>
            <p><strong>Description:</strong> ${session.description || session.Description}</p>
            <p><strong>Price:</strong> $${session.price || session.Price}</p>
            <p><strong>Duration:</strong> ${duration} minutes</p>
            <p><strong>Date:</strong> ${new Date(session.date || session.Date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${session.startTime || session.StartTime} - ${session.endTime || session.EndTime}</p>
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
            petFullName: document.getElementById('pet-name').value,
            species: document.getElementById('pet-species').value,
            breed: document.getElementById('pet-breed').value || 'Unknown',
            gender: 'M', // Default, could add to form
            birthDate: new Date().toISOString().split('T')[0], // Calculate from age if needed
            customerId: currentUser.id
        };
        
        let petId;
        const existingPets = await fetch(`${API_BASE_URL}/pets/owner/${currentUser.id}`).then(r => r.json());
        const existingPet = existingPets.find(p => (p.petFullName || p.PetFullName) === petData.petFullName);
        
        if (existingPet) {
            petId = existingPet.petId || existingPet.PetId;
        } else {
            const petResponse = await fetch(`${API_BASE_URL}/pets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(petData)
            });
            const pet = await petResponse.json();
            petId = pet.petId || pet.PetId;
        }
        
        // Create booking
        const bookingData = {
            petId: petId,
            classId: parseInt(document.getElementById('session-type').value),
            bookingDate: new Date().toISOString().split('T')[0],
            status: 'Pending',
            paymentMethod: 'Credit Card' // Default, could add to form
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
            
            bookingsList.innerHTML = bookings.map(booking => {
                const pet = booking.pet || booking.Pet || {};
                const classItem = booking.class || booking.Class || {};
                const trainer = classItem.trainer?.employee || classItem.Trainer?.Employee || {};
                const classDate = classItem.date || classItem.Date;
                const startTime = classItem.startTime || classItem.StartTime;
                const endTime = classItem.endTime || classItem.EndTime;
                const duration = startTime && endTime 
                    ? Math.round((new Date('2000-01-01T' + endTime) - new Date('2000-01-01T' + startTime)) / 60000)
                    : 60;
                const bookingId = booking.bookingId || booking.BookingId;
                
                return `
                <div class="booking-card">
                    <h3>${pet.petFullName || pet.PetFullName} - ${classItem.className || classItem.ClassName}</h3>
                    <p><strong>Trainer:</strong> ${trainer.empFName || trainer.EmpFName || ''} ${trainer.empLName || trainer.EmpLName || ''}</p>
                    <p><strong>Date:</strong> ${new Date(classDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
                    <p><strong>Price:</strong> $${classItem.price || classItem.Price}</p>
                    <p><strong>Duration:</strong> ${duration} minutes</p>
                    <p><strong>Payment Method:</strong> ${booking.paymentMethod || booking.PaymentMethod}</p>
                    <span class="status-badge status-${(booking.status || booking.Status || '').toLowerCase()}">${booking.status || booking.Status}</span>
                    ${(booking.status || booking.Status) === 'Pending' || (booking.status || booking.Status) === 'Confirmed' ? 
                        `<button onclick="cancelBooking(${bookingId})" class="btn-danger" style="margin-top: 10px;">Cancel Booking</button>` : ''}
                </div>
            `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
        // Use the cancel endpoint
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            showMessage('Booking cancelled successfully', 'success');
            loadBookings();
        } else {
            const errorData = await response.json().catch(() => ({}));
            showMessage(errorData.message || 'Failed to cancel booking', 'error');
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
            
            petsList.innerHTML = pets.map(pet => {
                const petName = pet.petFullName || pet.PetFullName;
                const species = pet.species || pet.Species;
                const breed = pet.breed || pet.Breed;
                const gender = pet.gender || pet.Gender;
                const birthDate = pet.birthDate || pet.BirthDate;
                const age = birthDate ? Math.floor((new Date() - new Date(birthDate)) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
                
                return `
                <div class="pet-card">
                    <h3>${petName}</h3>
                    <p><strong>Species:</strong> ${species}</p>
                    <p><strong>Breed:</strong> ${breed}</p>
                    <p><strong>Gender:</strong> ${gender}</p>
                    <p><strong>Age:</strong> ${age} years</p>
                </div>
            `;
            }).join('');
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
        // Calculate birthDate from age if needed
        if (!petData.birthDate && petData.age) {
            const birthYear = new Date().getFullYear() - petData.age;
            petData.birthDate = `${birthYear}-01-01`;
        }
        
        const response = await fetch(`${API_BASE_URL}/pets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                petFullName: petData.name,
                species: petData.species,
                breed: petData.breed || 'Unknown',
                gender: petData.gender || 'M',
                birthDate: petData.birthDate || new Date().toISOString().split('T')[0],
                customerId: petData.customerId
            })
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
        
        document.getElementById('profile-firstname').value = user.custFName || user.CustFName || '';
        document.getElementById('profile-lastname').value = user.custLName || user.CustLName || '';
        document.getElementById('profile-email').value = user.custEmail || user.CustEmail || '';
        document.getElementById('profile-phone').value = user.custPhoneNum || user.CustPhoneNum || '';
        document.getElementById('profile-address').value = user.address || user.Address || '';
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
                custFName: document.getElementById('profile-firstname').value,
                custLName: document.getElementById('profile-lastname').value,
                custEmail: document.getElementById('profile-email').value,
                custPhoneNum: document.getElementById('profile-phone').value,
                address: document.getElementById('profile-address').value,
                password: document.getElementById('profile-password').value || null
            })
        });
        
        if (response.ok) {
            showMessage('Profile updated successfully', 'success');
            // Reload user data
            const profileResponse = await fetch(`${API_BASE_URL}/auth/profile/${currentUser.id}`);
            const data = await profileResponse.json();
            const updatedUser = data.user;
            currentUser = { 
                ...currentUser, 
                ...updatedUser,
                id: updatedUser.CustomerId || updatedUser.customerId || currentUser.id,
                firstName: updatedUser.CustFName || updatedUser.custFName || currentUser.firstName,
                lastName: updatedUser.CustLName || updatedUser.custLName || currentUser.lastName,
                email: updatedUser.CustEmail || updatedUser.custEmail || currentUser.email
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            document.getElementById('user-name').textContent = `${currentUser.firstName} ${currentUser.lastName} (Customer)`;
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
    
    // Find and activate the correct button
    const buttons = document.querySelectorAll('.trainer-tab-btn');
    if (tab === 'my-classes') {
        buttons[0]?.classList.add('active');
    } else if (tab === 'bookings') {
        buttons[1]?.classList.add('active');
    } else if (tab === 'manage-classes') {
        buttons[2]?.classList.add('active');
    }
    
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    if (tab === 'my-classes') {
        loadTrainerClasses();
    } else if (tab === 'bookings') {
        loadTrainerBookings();
    }
}

async function loadTrainerClasses() {
    if (!currentUser) return;
    
    // Check if user is a trainer by checking if they have an employeeId that matches a trainer
    try {
        // First, try to get trainer info for the current user
        const trainersResponse = await fetch(`${API_BASE_URL}/trainers`);
        const trainers = await trainersResponse.json();
        const trainer = trainers.find(t => (t.employeeId || t.EmployeeId) === (currentUser.employeeId || currentUser.EmployeeId || currentUser.id));
        
        if (!trainer) {
            console.log('User is not a trainer');
            return;
        }
        
        const trainerId = trainer.employeeId || trainer.EmployeeId || currentUser.id;
        const response = await fetch(`${API_BASE_URL}/trainerclasses/trainer/${trainerId}`);
        const classes = await response.json();
        
        const list = document.getElementById('trainer-classes-list');
        if (list) {
            if (classes.length === 0) {
                list.innerHTML = '<div class="empty-state">No classes found</div>';
                return;
            }
            
            list.innerHTML = classes.map(session => {
                const classId = session.classId || session.ClassId;
                const className = session.className || session.ClassName;
                const description = session.description || session.Description;
                const price = session.price || session.Price;
                const startTime = session.startTime || session.StartTime;
                const endTime = session.endTime || session.EndTime;
                const duration = startTime && endTime 
                    ? Math.round((new Date('2000-01-01T' + endTime) - new Date('2000-01-01T' + startTime)) / 60000)
                    : 60;
                
                return `
                <div class="class-card">
                    <h3>${className}</h3>
                    <p><strong>Description:</strong> ${description}</p>
                    <p><strong>Price:</strong> $${price}</p>
                    <p><strong>Duration:</strong> ${duration} minutes</p>
                    <p><strong>Bookings:</strong> ${session.bookings?.length || session.Bookings?.length || 0}</p>
                    <button onclick="editClass(${classId})" class="btn-secondary" style="margin-top: 10px;">Edit</button>
                    <button onclick="deleteClass(${classId})" class="btn-danger" style="margin-top: 10px;">Delete</button>
                </div>
            `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading trainer classes:', error);
    }
}

async function loadTrainerBookings() {
    if (!currentUser) return;
    
    try {
        // Check if user is a trainer
        const trainersResponse = await fetch(`${API_BASE_URL}/trainers`);
        const trainers = await trainersResponse.json();
        const trainer = trainers.find(t => (t.employeeId || t.EmployeeId) === (currentUser.employeeId || currentUser.EmployeeId || currentUser.id));
        
        if (!trainer) {
            console.log('User is not a trainer');
            return;
        }
        
        const trainerId = trainer.employeeId || trainer.EmployeeId || currentUser.id;
        const response = await fetch(`${API_BASE_URL}/trainerclasses/trainer/${trainerId}/bookings/upcoming`);
        const bookings = await response.json();
        
        const list = document.getElementById('trainer-bookings-list');
        if (list) {
            if (bookings.length === 0) {
                list.innerHTML = '<div class="empty-state">No upcoming bookings</div>';
                return;
            }
            
            list.innerHTML = bookings.map(booking => {
                const pet = booking.pet || booking.Pet || {};
                const classItem = booking.class || booking.Class || {};
                const customer = pet.customer || pet.Customer || {};
                const bookingId = booking.bookingId || booking.BookingId;
                const status = booking.status || booking.Status || 'Pending';
                const classDate = classItem.date || classItem.Date;
                const startTime = classItem.startTime || classItem.StartTime;
                const endTime = classItem.endTime || classItem.EndTime;
                
                return `
                <div class="booking-card">
                    <h3>${pet.petFullName || pet.PetFullName} - ${classItem.className || classItem.ClassName}</h3>
                    <p><strong>Customer:</strong> ${customer.custFName || customer.CustFName || ''} ${customer.custLName || customer.CustLName || ''}</p>
                    <p><strong>Date:</strong> ${new Date(classDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${status.toLowerCase()}">${status}</span></p>
                    ${status === 'Pending' ? 
                        `<button onclick="confirmBooking(${bookingId})" class="btn-primary" style="margin-top: 10px;">Confirm</button>` : ''}
                    <button onclick="updateBookingStatus(${bookingId}, 'Cancelled')" class="btn-danger" style="margin-top: 10px;">Cancel</button>
                </div>
            `;
            }).join('');
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
        
        document.getElementById('class-id').value = session.classId || session.ClassId;
        document.getElementById('class-name').value = session.className || session.ClassName;
        document.getElementById('class-type').value = session.classType || session.ClassType || 'Group';
        document.getElementById('class-difficulty').value = session.difficultyLevel || session.DifficultyLevel || 'Beginner';
        document.getElementById('class-price').value = session.price || session.Price;
        document.getElementById('class-date').value = session.date ? new Date(session.date || session.Date).toISOString().split('T')[0] : '';
        document.getElementById('class-start-time').value = session.startTime || session.StartTime || '10:00';
        document.getElementById('class-end-time').value = session.endTime || session.EndTime || '11:00';
        document.getElementById('class-location').value = session.location || session.Location || '';
        document.getElementById('class-capacity').value = session.capacity || session.Capacity || 10;
        document.getElementById('class-description').value = session.description || session.Description;
        
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
    
    if (!currentUser) {
        showMessage('You must be logged in to create classes', 'error');
        return;
    }
    
    try {
        // Check if user is a trainer
        const trainersResponse = await fetch(`${API_BASE_URL}/trainers`);
        const trainers = await trainersResponse.json();
        const trainer = trainers.find(t => (t.employeeId || t.EmployeeId) === (currentUser.employeeId || currentUser.EmployeeId || currentUser.id));
        
        if (!trainer) {
            showMessage('You must be a trainer to create classes', 'error');
            return;
        }
        
        const trainerId = trainer.employeeId || trainer.EmployeeId || currentUser.id;
        const classId = document.getElementById('class-id').value;
        
        // Get time values and convert to TimeSpan format (HH:mm:ss)
        const startTimeInput = document.getElementById('class-start-time').value;
        const endTimeInput = document.getElementById('class-end-time').value;
        const startTime = startTimeInput ? startTimeInput + ':00' : '10:00:00';
        const endTime = endTimeInput ? endTimeInput + ':00' : '11:00:00';
        
        const classData = {
            classId: classId ? parseInt(classId) : 0,
            className: document.getElementById('class-name').value,
            description: document.getElementById('class-description').value,
            classType: document.getElementById('class-type').value,
            difficultyLevel: document.getElementById('class-difficulty').value,
            date: document.getElementById('class-date').value || new Date().toISOString().split('T')[0],
            price: parseFloat(document.getElementById('class-price').value),
            location: document.getElementById('class-location').value,
            capacity: parseInt(document.getElementById('class-capacity').value),
            startTime: startTime,
            endTime: endTime,
            employeeId: trainerId
        };
        
        const url = classData.classId > 0 
            ? `${API_BASE_URL}/sessions/${classData.classId}`
            : `${API_BASE_URL}/sessions`;
        
        const method = classData.classId > 0 ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(classData)
        });
        
        if (response.ok) {
            showMessage('Class saved successfully', 'success');
            resetClassForm();
            loadTrainerClasses();
            showTrainerTab('my-classes');
        } else {
            const errorData = await response.json().catch(() => ({}));
            showMessage(errorData.message || 'Failed to save class', 'error');
        }
    } catch (error) {
        console.error('Error saving class:', error);
        showMessage('Error saving class', 'error');
    }
}

function resetClassForm() {
    document.getElementById('class-form').reset();
    document.getElementById('class-id').value = '';
    // Set default values
    document.getElementById('class-type').value = 'Group';
    document.getElementById('class-difficulty').value = 'Beginner';
    document.getElementById('class-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('class-start-time').value = '10:00';
    document.getElementById('class-end-time').value = '11:00';
    document.getElementById('class-capacity').value = '10';
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
