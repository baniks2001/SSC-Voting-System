-- Student Voting System Database Schema
-- Run this SQL script in your MySQL/phpMyAdmin to create the database

CREATE DATABASE IF NOT EXISTS student_voting_system;
USE student_voting_system;

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'auditor', 'poll_monitor') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    is_active BOOLEAN DEFAULT true,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Voters table
CREATE TABLE IF NOT EXISTS voters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year_level INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    password VARCHAR(255) NOT NULL,
    has_voted BOOLEAN DEFAULT false,
    vote_hash VARCHAR(255) NULL,
    voted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_course_year_section (course, year_level, section),
    INDEX idx_has_voted (has_voted)
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    party VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NULL,
    vote_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    INDEX idx_position (position),
    INDEX idx_party (party)
);

-- Votes table (Blockchain records)
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    block_hash VARCHAR(255) UNIQUE NOT NULL,
    previous_hash VARCHAR(255) NOT NULL,
    voter_id INT NOT NULL,
    vote_data TEXT NOT NULL,
    nonce INT NOT NULL,
    timestamp BIGINT NOT NULL,
    merkle_root VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voter_id) REFERENCES voters(id) ON DELETE CASCADE,
    INDEX idx_block_hash (block_hash),
    INDEX idx_voter_id (voter_id),
    INDEX idx_timestamp (timestamp)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    user_type ENUM('admin', 'voter', 'system') NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_type (user_type),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Poll settings table
CREATE TABLE IF NOT EXISTS poll_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    is_active BOOLEAN DEFAULT false,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    is_paused BOOLEAN DEFAULT false,
    paused_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default poll settings
INSERT INTO poll_settings (is_active, is_paused) VALUES (true, false);

-- Sample candidates (you can remove these and add through the admin interface)
INSERT INTO candidates (name, party, position, image_url) VALUES
('John Doe', 'Unity Party', 'President', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'),
('Jane Smith', 'Progress Alliance', 'President', 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'),
('Mike Johnson', 'Student First', 'Vice President', 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'),
('Sarah Wilson', 'Future Leaders', 'Vice President', 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop');

-- Sample voters (you can remove these and add through the admin interface)
INSERT INTO voters (student_id, full_name, course, year_level, section, password) VALUES
('2021-001', 'Alice Brown', 'Computer Science', 3, 'A', '$2b$10$rBOyOiqJxnPm5gQQsWKyNOmyDjHj4lGAhEt8w.Vm5LhUnYUQrFaqi'),
('2021-002', 'Bob Davis', 'Information Technology', 2, 'B', '$2b$10$rBOyOiqJxnPm5gQQsWKyNOmyDjHj4lGAhEt8w.Vm5LhUnYUQrFaqi'),
('2021-003', 'Carol White', 'Computer Engineering', 4, 'A', '$2b$10$rBOyOiqJxnPm5gQQsWKyNOmyDjHj4lGAhEt8w.Vm5LhUnYUQrFaqi');

-- Default password for sample voters is "voter123"

COMMIT;