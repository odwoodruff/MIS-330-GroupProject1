# Pet Training Booking System

A full-stack web application for managing pet training session bookings, built with ASP.NET Core (C#), HTML, CSS, and JavaScript.

## Features

### ✅ User Management
- **User Registration**: Register as a Customer or Trainer
- **User Login**: Secure authentication system
- **User Profiles**: View and update user profile information

### ✅ Class Listing & Management
- **View Classes**: Browse all available training classes
- **Create Classes**: Trainers can create new training classes
- **Edit Classes**: Trainers can update their classes
- **Delete Classes**: Trainers can remove their classes

### ✅ Search and Filtering
- **Keyword Search**: Search classes by type, description, or trainer name
- **Sorting Options**: Sort by price, duration, type, or date
- **Filter by Trainer**: Filter classes by specific trainer
- **Price Range Filter**: Filter classes by minimum and maximum price

### ✅ Customer Booking Management
- **Create Bookings**: Book training sessions for pets
- **View Bookings**: See all your bookings with details
- **Filter Bookings**: Filter by status (Pending, Confirmed, Completed, Cancelled)
- **Cancel Bookings**: Cancel pending or confirmed bookings
- **Sort Bookings**: Sort by date or status

### ✅ Trainer Classes Management
- **Trainer Dashboard**: Dedicated dashboard for trainers
- **View My Classes**: See all classes created by the trainer
- **Manage Bookings**: View and manage bookings for trainer's classes
- **Update Booking Status**: Confirm or cancel bookings
- **Upcoming Bookings**: View upcoming scheduled sessions

## Technology Stack

- **Backend**: ASP.NET Core 8.0 (C#)
- **Database**: SQLite with Entity Framework Core
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
- **Architecture**: RESTful API with MVC pattern

## Getting Started

### Prerequisites
- .NET 8.0 SDK or later
- A web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd MIS330-GroupProject1
   ```

2. **Restore NuGet packages** (if needed)
   ```bash
   dotnet restore
   ```

3. **Build the project**
   ```bash
   dotnet build
   ```

4. **Run the application**
   ```bash
   dotnet run
   ```

5. **Access the application**
   - Open your browser and navigate to: `http://localhost:5000` or `https://localhost:5001`
   - The application will automatically create the SQLite database on first run

## Usage Guide

### For Customers

1. **Register/Login**
   - Click "Register" to create a new account
   - Select "Customer" as your role
   - Fill in your information and submit

2. **Browse Classes**
   - View all available training classes
   - Use search and filters to find specific classes
   - Click "Book Now" on any class to start booking

3. **Book a Session**
   - Navigate to "Book Session" tab
   - Enter your pet's information
   - Select a training class and date/time
   - Submit the booking

4. **Manage Bookings**
   - View all your bookings in "My Bookings" tab
   - Filter by status or sort by date
   - Cancel bookings if needed

5. **Manage Pets**
   - Add pets in "My Pets" tab
   - View all registered pets

6. **Update Profile**
   - Go to "Profile" tab
   - Update your information
   - Change password if needed

### For Trainers

1. **Register as Trainer**
   - Register with "Trainer" role
   - Provide your specialization

2. **Access Trainer Dashboard**
   - After login, you'll see "Trainer Dashboard" tab
   - View your classes and bookings

3. **Manage Classes**
   - Go to "Manage Classes" section
   - Create new training classes
   - Edit or delete existing classes

4. **Manage Bookings**
   - View all bookings for your classes
   - Confirm or cancel bookings
   - See upcoming sessions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile/{id}` - Get user profile
- `PUT /api/auth/profile/{id}` - Update user profile

### Sessions/Classes
- `GET /api/sessions` - Get all sessions (with search/filter params)
- `GET /api/sessions/{id}` - Get specific session
- `POST /api/sessions` - Create new session (Trainer only)
- `PUT /api/sessions/{id}` - Update session (Trainer only)
- `DELETE /api/sessions/{id}` - Delete session (Trainer only)
- `GET /api/sessions/trainer/{trainerId}` - Get trainer's sessions

### Bookings
- `GET /api/bookings` - Get all bookings (with filters)
- `GET /api/bookings/{id}` - Get specific booking
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/{id}` - Update booking
- `PUT /api/bookings/{id}/cancel` - Cancel booking
- `PUT /api/bookings/{id}/confirm` - Confirm booking
- `DELETE /api/bookings/{id}` - Delete booking

### Trainers
- `GET /api/trainers` - Get all trainers
- `GET /api/trainerclasses/trainer/{trainerId}` - Get trainer's classes
- `GET /api/trainerclasses/trainer/{trainerId}/bookings` - Get trainer's bookings
- `PUT /api/trainerclasses/booking/{bookingId}/status` - Update booking status

### Pets & Owners
- `GET /api/pets` - Get all pets
- `GET /api/pets/owner/{ownerId}` - Get owner's pets
- `POST /api/pets` - Create new pet
- `GET /api/owners` - Get all owners
- `POST /api/owners` - Create new owner

## Database Schema

The application uses SQLite database with the following entities:
- **Users**: User accounts (Customers, Trainers, Admins)
- **Owners**: Pet owners (linked to Users)
- **Pets**: Pet information
- **Trainers**: Trainer information (linked to Users)
- **Sessions**: Training class/session definitions
- **Bookings**: Training session bookings

## Project Structure

```
MIS330-GroupProject1/
├── Controllers/          # API Controllers
│   ├── AuthController.cs
│   ├── BookingsController.cs
│   ├── SessionsController.cs
│   ├── TrainerClassesController.cs
│   └── ...
├── Data/                # Database Context
│   └── PetTrainingDbContext.cs
├── Models/              # Data Models
│   ├── User.cs
│   ├── Owner.cs
│   ├── Pet.cs
│   ├── Trainer.cs
│   ├── Session.cs
│   └── Booking.cs
├── wwwroot/            # Frontend Files
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── Program.cs          # Application Entry Point
└── MIS330-GroupProject1.csproj
```

## Notes

- The database is automatically created on first run
- Initial seed data includes sample trainers and sessions
- Passwords are hashed using SHA256
- CORS is configured to allow frontend access
- Static files are served from wwwroot directory

## Future Enhancements

Potential improvements:
- JWT token-based authentication
- Email notifications
- Calendar view for bookings
- Payment integration
- Rating and review system
- Admin dashboard
- Advanced reporting

## License

MIT License

