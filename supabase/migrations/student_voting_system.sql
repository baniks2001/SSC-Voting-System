-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 29, 2025 at 10:12 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student_voting_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('admin','auditor','poll_monitor') DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `email`, `password`, `full_name`, `role`, `created_at`, `updated_at`, `created_by`, `is_active`) VALUES
(1, 'servandoytio@gmail.com', '$2a$10$Q41qOjEvvn/jjSJ2GfzCt.tcFwCcVHHHWFkO.2cjmvR.LZPCX1ocW', 'Servando Tio', 'admin', '2025-09-23 07:42:40', '2025-09-23 07:42:40', 0, 1),
(3, 'monitor@voting.edu', '$2a$10$dHN42/gcmEJ6C3g7C3QuCOyY/0jXvrFm3czcyiXqwCi5NAGDWl3Hu', 'Poll Monitoring Account', 'poll_monitor', '2025-09-25 01:31:41', '2025-09-26 12:56:17', 0, 1),
(4, 'audit@voting.edu', '$2a$10$JChMAxbpRRLWVMj4TB0s1eOeIIr42.s4X7hOvcIfD.2no6Rk6MlmG', 'Audit Account', 'auditor', '2025-09-26 12:46:53', '2025-09-26 12:46:53', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_type` enum('admin','voter','system') NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `user_type`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(37, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 08:04:50'),
(38, 0, 'admin', 'EXPORT_VOTERS', 'Exported voter data', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 08:08:28'),
(39, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Joshua Tan', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 08:22:16'),
(40, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2025-001', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 08:23:03'),
(41, 0, 'admin', 'EXPORT_VOTERS', 'Exported voter data', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 08:24:44'),
(42, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-23 10:48:02'),
(43, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '2025-09-23 11:01:53'),
(44, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '2025-09-23 11:02:07'),
(45, 0, 'admin', 'PAUSE_POLL', 'Poll status updated', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '2025-09-23 11:02:30'),
(46, 0, 'admin', 'START_POLL', 'Poll status updated', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '2025-09-23 11:02:32'),
(47, 1, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '2025-09-23 11:02:49'),
(48, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '2025-09-23 11:06:05'),
(49, 1, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '2025-09-23 11:07:24'),
(50, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 02:41:53'),
(51, 0, 'admin', 'EXPORT_VOTERS', 'Exported voter data', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 02:58:29'),
(52, 0, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 5', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 03:05:45'),
(53, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2025-002', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 03:17:58'),
(54, 0, 'admin', 'EXPORT_VOTERS', 'Exported voter data', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 03:17:59'),
(55, 0, 'admin', 'PAUSE_POLL', 'Poll status updated', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 03:23:10'),
(56, 0, 'admin', 'STOP_POLL', 'Poll status updated', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 03:23:15'),
(57, 0, 'admin', 'START_POLL', 'Poll status updated', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 03:23:28'),
(58, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2025-008', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 09:39:08'),
(59, 0, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 7', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 09:58:49'),
(60, 0, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 6', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 09:58:51'),
(61, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2025-001', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 10:22:16'),
(62, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2025-002', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 10:22:35'),
(63, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2025-003', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 10:23:09'),
(64, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 10:41:59'),
(65, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 10:42:12'),
(66, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2025-010', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 10:54:16'),
(67, 0, 'admin', 'CREATE_ADMIN', 'Created admin: Monitor@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 10:56:34'),
(68, 2, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '2025-09-24 10:57:08'),
(69, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-24 11:08:13'),
(70, 2, 'admin', 'LOGIN_FAILED', 'Invalid password', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:28:57'),
(71, 2, 'admin', 'LOGIN_FAILED', 'Invalid password', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:29:07'),
(72, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: SuperAdmin@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:29:26'),
(73, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: SuperAdmin@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:29:32'),
(74, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: SuperAdmin@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:29:47'),
(75, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:29:54'),
(76, 0, 'admin', 'UPDATE_ADMIN', 'Updated admin ID: 2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:30:05'),
(77, 2, 'admin', 'LOGIN_FAILED', 'Invalid password', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:30:18'),
(78, 2, 'admin', 'LOGIN_FAILED', 'Invalid password', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:30:48'),
(79, 2, 'admin', 'LOGIN_FAILED', 'Invalid password', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:30:50'),
(80, 2, 'admin', 'LOGIN_FAILED', 'Invalid password', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:30:54'),
(81, 2, 'admin', 'LOGIN_FAILED', 'Invalid password', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:30:56'),
(82, 2, 'admin', 'LOGIN_FAILED', 'Invalid password', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:30:59'),
(83, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:31:11'),
(84, 0, 'admin', 'DELETE_ADMIN', 'Deleted admin ID: 2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:31:15'),
(85, 0, 'admin', 'CREATE_ADMIN', 'Created admin: monitor@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:31:41'),
(86, 3, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:31:55'),
(87, 3, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:32:23'),
(88, 3, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:36:46'),
(89, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 01:51:14'),
(90, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: SuperAdmin@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-25 02:46:53'),
(91, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '2025-09-25 02:58:38'),
(92, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 08:02:48'),
(93, 0, 'admin', 'UPDATE_ADMIN', 'Updated admin ID: 3', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 08:27:01'),
(94, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: pollmonito@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 08:27:15'),
(95, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 08:27:34'),
(96, 3, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 08:27:54'),
(97, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 12:40:09'),
(98, 0, 'admin', 'CREATE_ADMIN', 'Created admin: audit@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 12:46:53'),
(99, 4, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 12:47:08'),
(100, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 12:47:33'),
(101, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 12:55:28'),
(102, 3, 'admin', 'LOGIN_FAILED', 'Invalid password', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 12:55:44'),
(103, 3, 'admin', 'LOGIN_FAILED', 'Invalid password', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 12:55:51'),
(104, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 12:56:08'),
(105, 0, 'admin', 'UPDATE_ADMIN', 'Updated admin ID: 3', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 12:56:17'),
(106, 3, 'admin', 'LOGIN_FAILED', 'Invalid password', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 12:56:28'),
(107, 3, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 12:56:32'),
(108, 3, 'admin', 'PAUSE_POLL', 'Poll status updated', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 12:56:35'),
(109, 3, 'admin', 'START_POLL', 'Poll status updated', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 12:56:36'),
(110, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 13:11:11'),
(111, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 13:11:14'),
(112, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 13:11:18'),
(113, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 13:11:33'),
(114, 0, 'admin', 'PAUSE_POLL', 'Poll status updated', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 13:11:43'),
(115, 0, 'admin', 'UPDATE_CANDIDATE', 'Updated candidate ID: 5', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 13:14:34'),
(116, 0, 'admin', 'UPDATE_CANDIDATE', 'Updated candidate ID: 5', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 13:14:55'),
(117, 0, 'admin', 'UPDATE_CANDIDATE', 'Updated candidate ID: 5', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 13:15:05'),
(118, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-26 14:00:40'),
(119, 3, 'admin', 'LOGIN_FAILED', 'Invalid password', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 12:52:13'),
(120, 3, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 12:52:43'),
(121, 3, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 12:53:07'),
(122, 3, 'admin', 'START_POLL', 'Poll status updated', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 12:53:10'),
(123, 3, 'admin', 'PAUSE_POLL', 'Poll status updated', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 12:53:11'),
(124, 3, 'admin', 'START_POLL', 'Poll status updated', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 12:53:11'),
(125, 3, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 13:00:30'),
(126, 3, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 13:00:42'),
(127, 3, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-28 13:02:50'),
(128, 8, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-26 07:11:08'),
(129, 8, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast on Ethereum blockchain. TX: 0x5554667a59265b9eae17e3060e66cebd3f4dbf3197fed3153aea91483c1f764c (Node: node1)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:25:08'),
(130, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:44:30'),
(131, 8, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:45:15'),
(132, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:50:37'),
(133, 10, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:50:58'),
(134, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:54:43'),
(135, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-0203', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:55:13'),
(136, 12, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:55:35'),
(137, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:56:46'),
(138, 1, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Royal Hanz Caca', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:57:05'),
(139, 1, 'admin', 'CREATE_CANDIDATE', 'Created candidate: June Lian Jazel Tampos', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:57:22'),
(140, 1, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Mharlou Escobido', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:57:42'),
(141, 11, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:58:28'),
(142, 11, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast on Ethereum blockchain. TX: 0xdb6d7d7c172dc31e4af4114cc640b9ccde520353906973a650b183c13726828d (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:58:39'),
(143, 11, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast on Ethereum blockchain. TX: 0xe398bda5c74a9b542d59877a15041c2ba35b8de982a14ec63f857be2a0dc1df8 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 06:58:39'),
(144, 10, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 07:43:53'),
(145, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x848203a0b20b3f537644e7fd5c2836636750413c17ac8320b5b6d4887e82629a (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 07:44:01'),
(146, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x461a13cefe28304197daaf15f8c73db8c6828cb7f422a51c559e9a14fc9f8dbd (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 07:44:01'),
(147, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 07:44:37'),
(148, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 07:44:41'),
(149, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 07:44:42'),
(150, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 07:44:42'),
(151, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 07:44:42'),
(152, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 07:44:42'),
(153, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 07:44:43'),
(154, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 07:54:29'),
(155, 1, 'admin', 'PAUSE_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 08:05:33'),
(156, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 08:05:33'),
(157, 9, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 08:13:06'),
(158, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xc15124520b221723b4edd1807f19a5b56e23059b7b8ce678df072b94c46fdd91 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 08:13:11'),
(159, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x0e2e2e5ff755ea3e4e6b72b494647805f00a3ac8d1b89c938bc613d892dc94cf (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 08:13:11'),
(160, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 08:13:23'),
(161, 1, 'admin', 'PAUSE_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 08:35:55'),
(162, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 08:35:57'),
(163, 12, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 08:59:08'),
(164, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 08:59:14'),
(165, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 12', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 08:59:21'),
(166, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-203', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 08:59:46'),
(167, 13, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 08:59:54'),
(168, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:00:01'),
(169, 10, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:01:10'),
(170, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x70654f311b6a2e92ccca398fff42528a30a4574a219f6ea64c5364daa3a623b8 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:01:14'),
(171, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x43fbdd24608b993df5dbd96395e3004f19adc7f328f3350c6d6e1113a5607bf4 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:01:14'),
(172, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:01:23'),
(173, 10, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:06:45'),
(174, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xc120931de202fa843baed3b8a9cf94625d88160b032fd62ef1233bcb7156a99f (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:06:49'),
(175, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xd102900d675f76562f58c77105348c63f42e99ee90fcc91c6a91b70211153652 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:06:49'),
(176, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: superadmin@voting.edu', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:06:55'),
(177, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:06:57'),
(178, 10, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:07:18'),
(179, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:07:46'),
(180, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 13', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:09:19'),
(181, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:09:20'),
(182, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 9', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:09:22');

-- --------------------------------------------------------

--
-- Table structure for table `candidates`
--

CREATE TABLE `candidates` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `party` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `vote_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `candidates`
--

INSERT INTO `candidates` (`id`, `name`, `party`, `position`, `image_url`, `vote_count`, `created_at`, `updated_at`, `is_active`) VALUES
(5, 'Joshua Tan', 'MGA GWAPO GENGGENG', 'President', NULL, 3, '2025-09-23 08:22:16', '2025-10-29 06:58:39', 1),
(6, 'Royal Hanz Caca', 'Lets Go serrr', 'Vice President', NULL, 2, '2025-10-29 06:57:05', '2025-10-29 06:58:39', 1),
(7, 'June Lian Jazel Tampos', 'WOWERSS', 'Vice President', NULL, 0, '2025-10-29 06:57:22', '2025-10-29 06:57:22', 1),
(8, 'Mharlou Escobido', 'MGA GWAPO GENGGENG', 'Vice President', NULL, 0, '2025-10-29 06:57:42', '2025-10-29 06:57:42', 1);

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name`, `code`, `is_active`, `created_at`, `updated_at`) VALUES
(43, 'BS in Information Technology', 'BSIT', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(44, 'BS in Office Administration', 'BSOA', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(45, 'BS in Accountancy', 'BSA', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(46, 'BS in Office Management Accounting', 'BSMA', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(47, 'Bachelor of Technology and Livelihood Education - Home Economics', 'BTLED-HE', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(48, 'Bachelor of Technology and Livelihood Education - Industrial Arts', 'BTLED-IA', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(49, 'BS in Entrepreneurship - Social Entrepreneurship', 'BSE-SE', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(50, 'BS in Entrepreneurship - Culinary Arts', 'BSE-CA', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(51, 'BS in Entrepreneurship - Hospitality Management', 'BSE-HM', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(52, 'Bachelor of Secondary Education - Biological Science ', 'BSED-BS', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(53, 'Bachelor of Secondary Education - English ', 'BSED-ENG', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(54, 'Bachelor of Secondary Education - Filipino ', 'BSED-FIL', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(55, 'Bachelor of Secondary Education - Mathematics ', 'BSED-MATH', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(56, 'Bachelor of Industrial Technology - Automotive Technology', 'BSINDU-AT', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(57, 'Bachelor of Industrial Technology - Electrical Technology', 'BSINDU-ELECTRICALTECH', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(58, 'Bachelor of Industrial Technology - Electronics Technology', 'BSINDU-ET', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09');

-- --------------------------------------------------------

--
-- Table structure for table `poll_settings`
--

CREATE TABLE `poll_settings` (
  `id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `is_paused` tinyint(1) DEFAULT 0,
  `paused_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `poll_settings`
--

INSERT INTO `poll_settings` (`id`, `is_active`, `start_time`, `end_time`, `is_paused`, `paused_at`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, 0, NULL, '2025-09-22 00:44:28', '2025-10-29 08:35:57');

-- --------------------------------------------------------

--
-- Table structure for table `voters`
--

CREATE TABLE `voters` (
  `id` int(11) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `course` varchar(100) NOT NULL,
  `year_level` int(11) NOT NULL,
  `section` varchar(10) NOT NULL,
  `password` varchar(255) NOT NULL,
  `has_voted` tinyint(1) DEFAULT 0,
  `vote_hash` varchar(255) DEFAULT NULL,
  `voted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_type` (`user_type`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `candidates`
--
ALTER TABLE `candidates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_position` (`position`),
  ADD KEY `idx_party` (`party`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `poll_settings`
--
ALTER TABLE `poll_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `voters`
--
ALTER TABLE `voters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_course_year_section` (`course`,`year_level`,`section`),
  ADD KEY `idx_has_voted` (`has_voted`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=183;

--
-- AUTO_INCREMENT for table `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `poll_settings`
--
ALTER TABLE `poll_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `voters`
--
ALTER TABLE `voters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
