-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-05-2026 a las 04:48:24
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `chess_db`
--
CREATE DATABASE IF NOT EXISTS `chess_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `chess_db`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `matches`
--

CREATE TABLE IF NOT EXISTS `matches` (
  `idMatch` varchar(36) NOT NULL,
  `whitePlayerId` varchar(36) NOT NULL,
  `blackPlayerId` varchar(36) NOT NULL,
  `result` varchar(16) NOT NULL,
  `pgn` text NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `matches`
--

INSERT INTO `matches` (`idMatch`, `whitePlayerId`, `blackPlayerId`, `result`, `pgn`, `date`) VALUES
('fbab9581-52b8-4c25-a503-b6b4d128f1d4', 'c20a1d27-5643-41b2-8927-71e60763af70', '24a24e7a-0757-492c-892c-2a7dd99facde', 'White', '1. e4 e5 2. Bc4 Nc6 3. Qf3 a6 4. Qxf7#', '2025-11-26'),
('5d8b602b-e71a-4cbc-acfa-42ac6c49abb6', 'c20a1d27-5643-41b2-8927-71e60763af70', '24a24e7a-0757-492c-892c-2a7dd99facde', 'Black', '', '2025-11-26'),
('3547010c-2a85-48af-9537-cd8dfabf38ae', '24a24e7a-0757-492c-892c-2a7dd99facde', 'c20a1d27-5643-41b2-8927-71e60763af70', 'Black', '1. d3 d6 2. d4 d5 3. Nf3 Nc6 4. c3 Na5', '2025-11-26'),
('dbfe4808-067f-40b4-b6b9-29641ca22ad4', '24a24e7a-0757-492c-892c-2a7dd99facde', 'af8fa389-322c-4cfd-9eae-3ad848a8f90a', 'Black', '1. d4 d5 2. Nc3 Bf5 3. Nf3 Qd6', '2025-11-28'),
('d1c0429b-c7ad-4f38-881b-9fe1dc5c747c', 'c20a1d27-5643-41b2-8927-71e60763af70', 'c20a1d27-5643-41b2-8927-71e60763af70', 'White', '1. e4', '2025-11-28'),
('64ceb0c7-cbc9-422e-820e-08fe681e5b43', '24a24e7a-0757-492c-892c-2a7dd99facde', 'a53c1d28-ba10-4bbb-ab04-4b6176246b99', 'Black', '', '2025-11-28'),
('d9e77050-d379-4721-9a05-505c06379a38', '24a24e7a-0757-492c-892c-2a7dd99facde', 'af8fa389-322c-4cfd-9eae-3ad848a8f90a', 'Black', '', '2025-11-28'),
('41a2bb19-1651-43c2-8b3f-1b4ece9001a1', '24a24e7a-0757-492c-892c-2a7dd99facde', 'af8fa389-322c-4cfd-9eae-3ad848a8f90a', 'White', '1. e4 d5 2. d4 b5', '2025-11-28'),
('d9719db7-d671-4733-96b8-753c7025ee07', 'a53c1d28-ba10-4bbb-ab04-4b6176246b99', '24a24e7a-0757-492c-892c-2a7dd99facde', 'White', '1. e4 e5 2. Nc3', '2025-11-28'),
('8255ca71-634d-4e3d-afff-51c942ffc352', 'af8fa389-322c-4cfd-9eae-3ad848a8f90a', 'a53c1d28-ba10-4bbb-ab04-4b6176246b99', 'White', '', '2025-11-28'),
('e9a301dd-93f2-4583-b836-2acdeedea008', 'a53c1d28-ba10-4bbb-ab04-4b6176246b99', 'a2b1d8d7-9ec2-4f87-a41f-b53a5e9d792f', 'White', '1. d4 d5 2. Nf3', '2025-11-28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL,
  `username` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`) VALUES
('', 'Martín Pool', 'Alum2046d', 'martinpool@jijijija.es'),
('', 'Jose Pablo', 'Choco123456', 'j_pablomtz@hotmail.com'),
('24a24e7a-0757-492c-892c-2a7dd99facde', 'Capi', '123', 'a@test'),
('c20a1d27-5643-41b2-8927-71e60763af70', 'Bob', 'Marley', 'h@f'),
('af8fa389-322c-4cfd-9eae-3ad848a8f90a', 'MartínP', 'Alum2046d', 'a20200696@alumnos.uady.mx'),
('a53c1d28-ba10-4bbb-ab04-4b6176246b99', 'Ax0Elote', 'coco123', 'a20201160@alumnos.uady.mx'),
('79b0825c-e211-4f3f-8642-97b42fb938c2', 'ob', '123', 'aaa@fe.com'),
('a2b1d8d7-9ec2-4f87-a41f-b53a5e9d792f', 'paputilin777', 'papulandia3000', 'papu@correo.com');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
