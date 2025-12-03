-- SQL Script to create all required tables for Pet Training Booking System
-- Run this in MySQL Workbench on your 'pets' database

USE pets;

-- Drop tables if they exist (optional - remove if you want to keep existing data)
-- DROP TABLE IF EXISTS Bookings;
-- DROP TABLE IF EXISTS Sessions;
-- DROP TABLE IF EXISTS Pets;
-- DROP TABLE IF EXISTS Owners;
-- DROP TABLE IF EXISTS Trainers;
-- DROP TABLE IF EXISTS Users;

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(255) NOT NULL UNIQUE,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'Customer',
    FirstName VARCHAR(255) NOT NULL,
    LastName VARCHAR(255) NOT NULL,
    Phone VARCHAR(50),
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    OwnerId INT NULL,
    TrainerId INT NULL,
    INDEX IX_Users_Username (Username),
    INDEX IX_Users_Email (Email),
    INDEX IX_Users_OwnerId (OwnerId),
    INDEX IX_Users_TrainerId (TrainerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Owners table
CREATE TABLE IF NOT EXISTS Owners (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(255) NOT NULL,
    LastName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Phone VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Pets table
CREATE TABLE IF NOT EXISTS Pets (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Species VARCHAR(100) NOT NULL,
    Breed VARCHAR(255),
    Age INT NOT NULL DEFAULT 0,
    OwnerId INT NOT NULL,
    FOREIGN KEY (OwnerId) REFERENCES Owners(Id) ON DELETE CASCADE,
    INDEX IX_Pets_OwnerId (OwnerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Trainers table
CREATE TABLE IF NOT EXISTS Trainers (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(255) NOT NULL,
    LastName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Phone VARCHAR(50) NOT NULL,
    Specialization VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Sessions table
CREATE TABLE IF NOT EXISTS Sessions (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Type VARCHAR(255) NOT NULL,
    Description TEXT,
    Price DECIMAL(10, 2) NOT NULL,
    DurationMinutes INT NOT NULL,
    TrainerId INT NOT NULL,
    FOREIGN KEY (TrainerId) REFERENCES Trainers(Id) ON DELETE CASCADE,
    INDEX IX_Sessions_TrainerId (TrainerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Bookings table
CREATE TABLE IF NOT EXISTS Bookings (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    BookingDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    SessionDateTime DATETIME NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    Notes TEXT,
    OwnerId INT NOT NULL,
    PetId INT NOT NULL,
    SessionId INT NOT NULL,
    FOREIGN KEY (OwnerId) REFERENCES Owners(Id) ON DELETE CASCADE,
    FOREIGN KEY (PetId) REFERENCES Pets(Id) ON DELETE CASCADE,
    FOREIGN KEY (SessionId) REFERENCES Sessions(Id) ON DELETE CASCADE,
    INDEX IX_Bookings_OwnerId (OwnerId),
    INDEX IX_Bookings_PetId (PetId),
    INDEX IX_Bookings_SessionId (SessionId),
    INDEX IX_Bookings_Status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert seed data for Trainers
INSERT IGNORE INTO Trainers (Id, FirstName, LastName, Email, Phone, Specialization) VALUES
(1, 'Sarah', 'Johnson', 'sarah@petraining.com', '555-0101', 'Basic Obedience'),
(2, 'Mike', 'Chen', 'mike@petraining.com', '555-0102', 'Advanced Training'),
(3, 'Emily', 'Rodriguez', 'emily@petraining.com', '555-0103', 'Behavioral Issues');

-- Insert seed data for Sessions
INSERT IGNORE INTO Sessions (Id, Type, Description, Price, DurationMinutes, TrainerId) VALUES
(1, 'Basic Obedience', 'Fundamental commands and leash training', 75.00, 60, 1),
(2, 'Advanced Training', 'Complex commands and agility training', 100.00, 90, 2),
(3, 'Behavioral Consultation', 'Addressing behavioral issues and problem solving', 120.00, 90, 3),
(4, 'Puppy Training', 'Early socialization and basic commands', 65.00, 45, 1);

-- Verify tables were created
SELECT 'Tables created successfully!' AS Status;
SHOW TABLES;

