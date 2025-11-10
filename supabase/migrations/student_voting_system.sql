-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 10, 2025 at 10:15 AM
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
(3, 'monitor@voting.edu', '$2a$10$T4dsGnunL8e4mTCtbs807OcrfsfUSW9AVshzkqagsDfAnM0Ub4asC', 'Poll Monitoring Account', 'poll_monitor', '2025-09-25 01:31:41', '2025-11-10 08:40:10', 0, 1),
(4, 'audit@voting.edu', '$2a$10$mrwt.kDrRoUUAVqzuW.vb..zWeU02GATCnmqU5YBAMBNhoxbyIE12', 'Audit Account', 'auditor', '2025-09-26 12:46:53', '2025-11-10 08:39:31', 0, 1);

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
(182, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 9', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 09:09:22'),
(183, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:45:03'),
(184, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:45:36'),
(185, 14, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:46:08'),
(186, 14, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:46:22'),
(187, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x47a6641750a2d62717f924f5bda52a7091dace29666f98315361516c7d1f715f (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:46:32'),
(188, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x041a7bdfb9756d48aa7e1f1e5c48968f0aac74ccfd0fe84998495e6f72523ebf (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:46:32'),
(189, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:46:38'),
(190, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-002', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:47:59'),
(191, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:48:15'),
(192, 15, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:48:54'),
(193, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:56:00'),
(194, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: superadmin@voting.edu', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:58:14'),
(195, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:58:17'),
(196, 1, 'admin', 'PAUSE_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:58:47'),
(197, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 11:58:48'),
(198, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 15', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:02:57'),
(199, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 14', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:02:59'),
(200, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: superadmin@voting.edu', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:13:58'),
(201, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:14:03'),
(202, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:17:58'),
(203, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:18:38'),
(204, 16, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 12:19:02'),
(205, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 16', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:24:58'),
(206, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:32:08'),
(207, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:32:28'),
(208, 17, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:32:48'),
(209, 17, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:32:59'),
(210, 17, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:33:13'),
(211, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:34:21'),
(212, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 17', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:34:25'),
(213, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:37:34'),
(214, 18, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:37:50'),
(215, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:43:44'),
(216, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 18', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:43:46'),
(217, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:44:07'),
(218, 1, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:44:49'),
(219, 19, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:46:56'),
(220, 19, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:46:58'),
(221, 19, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:47:05'),
(222, 19, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:47:21'),
(223, 19, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:47:29'),
(224, 19, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:47:37'),
(225, 19, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:47:39'),
(226, 19, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:47:45'),
(227, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:47:53'),
(228, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 19', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:47:55'),
(229, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:48:12'),
(230, 20, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:48:33'),
(231, 20, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:48:52'),
(232, 20, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:49:13'),
(233, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:49:20'),
(234, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 20', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:49:26'),
(235, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-069', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:49:56'),
(236, 21, 'voter', 'LOGIN_FAILED', 'Invalid password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:50:22'),
(237, 1, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:51:50'),
(238, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 21', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:52:00'),
(239, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-035', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:52:17'),
(240, 22, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:52:47'),
(241, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x032acf91371b17054dbb0485b350945cb6afd117ff4dcd146d3eed51b3a579cc (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:52:53'),
(242, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x2458c58174fcb7f233cb20c8e8b37bc56d45af441c1e531870f7720b8f7c0135 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:52:53'),
(243, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:53:08'),
(244, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:53:18'),
(245, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-020', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:53:51'),
(246, 23, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 12:54:14'),
(247, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x78dd3de94eb754ad874369888cbc47753bcf16011816f5a1a6a9cecff377b5a5 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 12:54:19'),
(248, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xd1b9d628d43d49f3b5860f479df44799952e5f0b7a07901db99c317a6d071b04 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 12:54:19'),
(249, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: superadmin@voting.edu', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:55:05'),
(250, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: superadmin@voting.edu', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:55:06'),
(251, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:55:08'),
(252, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 23', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:55:29'),
(253, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 22', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 12:55:31'),
(254, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 13:32:46'),
(255, 24, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 13:33:06'),
(256, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xd19835ac09ee2ec67d71364cc18801d58f173b9d0d4230801c0402a2998f0f24 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 13:33:11');
INSERT INTO `audit_logs` (`id`, `user_id`, `user_type`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(257, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x29ffc5a4f60b095665339c96c1ab4b70b4fdef9567e8c6e57b52396a1475473f (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 13:33:11'),
(258, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: superadmin@voting.edu', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 13:33:26'),
(259, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 13:33:29'),
(260, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 13:36:10'),
(261, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 24', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 13:36:35'),
(262, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-032', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 13:36:52'),
(263, 25, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 13:37:14'),
(264, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xe1650397ba0b865a66a250787da2066aa27550adeeae1a16e02616090c400cf9 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 13:37:18'),
(265, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xe46122fede9e76f3b75c176300201a057ee678e33cc9c9df0711a9923f5c0a63 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 13:37:18'),
(266, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: superadmin@voting.edu', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 13:40:37'),
(267, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: superadmin@voting.edu', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 13:40:37'),
(268, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 13:40:42'),
(269, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 25', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 13:40:58'),
(270, 1, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Servando Tio III', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 13:43:43'),
(271, 1, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Kenneth Dugaria', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 13:44:11'),
(272, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:00:30'),
(273, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2019-002', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:00:57'),
(274, 26, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:01:14'),
(275, 2019, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x61e338bd41c5ecf23da5fd709ea91bdda4d09c67da83a5cad7bea3d8b291d381 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:01:20'),
(276, 2019, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x2c268583b3c6bafa8907d1a8f760c70b449d4d6040f980fc091f58b59d7a34cf (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:01:20'),
(277, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:01:26'),
(278, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:01:37'),
(279, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2020-2001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:02:10'),
(280, 27, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:02:28'),
(281, 2020, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x2261b4a5fc54d3a90fa8eca22ae87f3c8edc84530a6877f41ee0d91b94c0315c (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:02:36'),
(282, 2020, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xa4d7c83111cc5696ae8cae7cde4916985444782e5a01aebbca2f082b3d9b540a (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:02:36'),
(283, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:02:44'),
(284, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:03:54'),
(285, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 27', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:22:28'),
(286, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 26', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:22:30'),
(287, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2018-2002', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:22:56'),
(288, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2019-005', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:23:15'),
(289, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2020-032', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:23:36'),
(290, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2021-084', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:24:00'),
(291, 31, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:24:22'),
(292, 2021, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xcc4eadce235bafe4985b45cc37b0fcb92cbe6eb393028879dc46a45f560b5e5e (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:24:27'),
(293, 2021, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x6eddf1080814d5978ace1083f2f3a1d69c53daad557ee64b06ab2c1c85e91ad2 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:24:27'),
(294, 28, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:24:39'),
(295, 2018, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x91fdf4b1e6fe2cd054f82a2878d411f9de22bec955c7049e829bc943b88cb0fe (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:24:45'),
(296, 2018, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x9393ae32a376d818cd12b6c36c74af705c959dbd67f8b8fe914999b37d8350e0 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:24:45'),
(297, 29, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:24:59'),
(298, 2019, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xf73069069498bf6c187385225d138b55218c4066004ca6a091cb6570f21cae79 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:25:06'),
(299, 2019, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x6c86d3a686ddfa6bc54ff168ab8ddc254d092342454e2a23a51022d1a4674674 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:25:06'),
(300, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:25:12'),
(301, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:25:39'),
(302, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-29 14:27:03'),
(303, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 31', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:29:39'),
(304, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 30', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:29:41'),
(305, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 29', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:29:43'),
(306, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 28', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:29:44'),
(307, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2020-001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:30:04'),
(308, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2021-002', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:30:20'),
(309, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2022-003', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:30:39'),
(310, 33, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:30:59'),
(311, 2021, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x4822b318fb69c4367201ef1f815ffd4bdd0ec87532c9bea42c87f5d9988ccb13 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:31:04'),
(312, 2021, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xf2a8f6cacfaa955b73ea4f9ebf5f2cdd2f37bb672a577928aeadb962a3bea05f (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:31:04'),
(313, 34, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:31:16'),
(314, 2022, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x9dc6a99c439a74f29852e45537006a03d8404440dd9002546e7ce13f22477d99 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:31:21'),
(315, 2022, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x1fe567a5fab02c0ff8e5aa0f96bdc88f08c38a0bb01eee7ce39417e478399fb8 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:31:21'),
(316, 32, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:31:32'),
(317, 2020, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xbd4f18fa8da9d54a12cc00e606d4d1912f363d71546a455b8d3a85c0d4a73c90 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:31:36'),
(318, 2020, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x89b35a579dfba508f11703a15836f464a991697b4859e064a5a6cb675a6cfd73 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:31:36'),
(319, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:31:43'),
(320, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:31:49'),
(321, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:32:23'),
(322, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:33:12'),
(323, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:41:22'),
(324, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 34', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:41:28'),
(325, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 33', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:41:29'),
(326, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 32', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:41:31'),
(327, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2019-001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:41:47'),
(328, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2022-042', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:42:05'),
(329, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2018-201', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:42:23'),
(330, 35, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:42:39'),
(331, 2019, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xc035b37db196e5e7df3a778950e0b56fe11d497a86cda8c105262df3ae56e666 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:42:45'),
(332, 2019, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x9f3debaadd1fddad3c2b75c3271713fcc4eec98ca94eb0280bc35b05da18c10a (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:42:45'),
(333, 36, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:42:57'),
(334, 2022, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xc0479ca8669043648361baa7821ba67eb8c42ddf02f598e094b71077aa731ff2 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:43:02'),
(335, 2022, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xc1ecd266d5a011ce233533fb8fe326792c73157585b7805b350f6769cfa638ff (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:43:02'),
(336, 37, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:43:14'),
(337, 2018, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x655288938c6f6adc3657139ad1d9e2b082bf738658d4fe89b6b64995e02d2519 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:43:22'),
(338, 2018, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x031c227c29d141901880554653215a9a576e4cb3155235b6c9356e83f45c5a87 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:43:22'),
(339, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:43:29'),
(340, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:44:00'),
(341, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 37', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:48:20'),
(342, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 36', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:48:21'),
(343, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 35', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:48:23'),
(344, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2020-101', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:49:58'),
(345, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2022-1002', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:50:17'),
(346, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:50:24'),
(347, 39, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:50:50'),
(348, 2022, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x2f5a76ee1c37450a743d637988a0060c96fe54480a5ac276c65c987a5c51c019 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:50:56'),
(349, 2022, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x5d91d50d83645b62392b9292f84005e6e186b36d39d3d8e0af3110f71a6da988 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:50:56'),
(350, 38, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:51:09'),
(351, 2020, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xcc9c0e1978ce4e414db1c99bf366a370acd769176d9145acecefca4749a0d6a2 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:51:16'),
(352, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:51:23'),
(353, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:51:42'),
(354, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 39', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:56:53'),
(355, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 38', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:56:55'),
(356, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-002', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:57:11'),
(357, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: 2020-101', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:57:34'),
(358, 40, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:57:47'),
(359, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xe5084d6f422fc38d0e36c9b1d14aa36ca19ee46a85c6199ac42767e093038bb9 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:57:52'),
(360, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x70bfb5037c493f76524ab7d82507fe8772d07478443ae1b86b967c10ee3b53e5 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:57:52'),
(361, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-10-30 14:57:59'),
(362, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 40', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:25:26'),
(363, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:25:46'),
(364, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2024-002', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:26:02'),
(365, 42, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:26:24'),
(366, 2024, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xa95319d654064b9bc66e9c11004f3df67e7a9a9d122937d827fc77fb35427241 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:26:31'),
(367, 2024, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x831f1a9dc25b2cf10790108291617f89a0f2a3372d612d7d3d8effeb3805020d (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:26:31'),
(368, 41, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:26:44'),
(369, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x22db008b68bcb1a703b8b7e774f11699482dddf030e3f9888b2bb9a9b0d54b43 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:26:48'),
(370, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x059241950a872136131d6b6cbc769ba697f41909d93bbd66ea1ff96a7c7da47f (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:26:48'),
(371, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:26:56'),
(372, 0, 'admin', 'UPDATE_ADMIN', 'Updated admin ID: 4', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:27:48'),
(373, 4, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:27:59'),
(374, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:28:17'),
(375, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2023-007', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:28:40'),
(376, 43, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:29:04'),
(377, 2023, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xcc47c6a58e6f1345f187a2fc65153b41472c1a9e8eded8443e23067dec9a79b2 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:29:08'),
(378, 2023, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xa9164f37cb6fede9326df7a33304b417be68c3cb7296e6025f2d5fc8e349ea14 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:29:08'),
(379, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:29:16'),
(380, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:29:43'),
(381, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 43', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:29:51'),
(382, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 42', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:29:52'),
(383, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 41', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:29:54'),
(384, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:32:41'),
(385, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-003', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:33:03'),
(386, 44, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:33:23'),
(387, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x0850e1d4b8292da352a38454ce0a1519f852e1bdd7c6be2b7253fc78b639500e (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:33:29'),
(388, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xaffb49e89caf1bc1ad1a631215c74b0c25529e20ac8b1e08684d16690fd1bc30 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:33:29'),
(389, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:33:36'),
(390, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:35:10'),
(391, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:36:33'),
(392, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:41:37'),
(393, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 44', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:41:49'),
(394, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:44:21'),
(395, 45, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:45:01'),
(396, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x78fb44f2b9725c299a8df44b763906e6a01350489d04316c9d4473bc3213e405 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:45:06'),
(397, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x1a458248168615e9f816e85eb39cb909e394a5f2f18f8ab66de4788f66705b12 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:45:06'),
(398, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', '2025-11-06 02:45:15'),
(399, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 06:46:37'),
(400, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 45', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 06:46:44'),
(401, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 07:04:41'),
(402, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 07:06:41'),
(403, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2020-023', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 07:07:17'),
(404, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2024-045', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 07:07:47'),
(405, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 48', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 07:07:59'),
(406, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 47', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 07:07:59'),
(407, 1, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 46', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 07:07:59'),
(408, 1, 'admin', 'CREATE_VOTER', 'Created voter: 2025-123', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 07:08:31'),
(409, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 08:19:50'),
(410, 1, 'admin', 'PAUSE_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 08:23:13'),
(411, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 08:23:23'),
(412, 1, 'admin', 'PAUSE_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 08:26:39'),
(413, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 08:34:04'),
(414, 0, 'admin', 'UPDATE_ADMIN', 'Updated admin ID: 4', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 08:39:31'),
(415, 0, 'admin', 'UPDATE_ADMIN', 'Updated admin ID: 3', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 08:40:10'),
(416, 1, 'admin', 'PAUSE_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 08:54:46'),
(417, 1, 'admin', 'START_POLL', 'Poll status updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-11-10 08:55:03'),
(418, 2025, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x2bf4164bebfe86f2e54d00897b0fbf4c2c78f4627ee241c0ca16d8e7de654bb3 (Node: simulation)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-10 09:10:30');

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
(8, 'Mharlou Escobido', 'MGA GWAPO GENGGENG', 'Vice President', NULL, 0, '2025-10-29 06:57:42', '2025-10-29 06:57:42', 1),
(9, 'Servando Tio III', 'PURE GWAPO PARTY', 'Senator', NULL, 0, '2025-10-29 13:43:43', '2025-10-29 13:43:43', 1),
(10, 'Kenneth Dugaria', 'Way Makapilde Sa Ka Gwapo', 'Senator', NULL, 0, '2025-10-29 13:44:11', '2025-10-29 13:44:11', 1);

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
  `id` int(11) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 0,
  `is_paused` tinyint(1) DEFAULT 0,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `paused_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `poll_settings`
--

INSERT INTO `poll_settings` (`id`, `is_active`, `is_paused`, `start_time`, `end_time`, `paused_at`) VALUES
(1, 1, 0, '2025-11-10 08:55:03', NULL, NULL);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=419;

--
-- AUTO_INCREMENT for table `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `voters`
--
ALTER TABLE `voters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
