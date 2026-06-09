# ChessWebsite ♟️

A modern online chess platform built with **p5.js**, **Node.js**, **XAMPP**, and **MariaDB**, featuring real-time online gameplay, account management, persistent match history, and a custom-built chess engine capable of AI gameplay and game analysis.

---

## Features

### 🎨 Modern User Interface

* Clean and responsive design
* User-friendly navigation
* Interactive chessboard experience
* Optimized for desktop and modern browsers

### 🌐 Online Multiplayer

* Create and join online matches
* Real-time game synchronization
* Server-owned match management system
* Player matchmaking and reconnect support

### 👤 Account Management

* User registration and authentication
* Persistent player profiles
* Personal game history tracking

### 📊 Match History & Statistics

* Store completed games in MariaDB
* Review previous matches
* Track player performance
* Access historical game records

### 🐐 CapraStar Chess Engine

* Fully custom-developed chess engine
* Legal move generation and board logic
* Position evaluation system
* AI opponent for local play with an estimated elo of 1700+
* Move analysis and game review capabilities

### ♟️ Local Play

* Play against CapraStar with 3 levels of difficulty
* Play against an opponent on the same device

---

## Technology Stack

| Category            | Technology    | Badge                                                                                                                                        |
| ------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend             | Node.js       | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge\&logo=nodedotjs\&logoColor=white)                                 |
| Backend             | Express.js    | ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge\&logo=express\&logoColor=white)                             |
| Database            | MariaDB       | ![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge\&logo=mariadb\&logoColor=white)                                   |
| Database Management | phpMyAdmin    | ![phpMyAdmin](https://img.shields.io/badge/phpMyAdmin-6C78AF?style=for-the-badge\&logo=phpmyadmin\&logoColor=white)                          |
| Server Environment  | XAMPP         | ![XAMPP](https://img.shields.io/badge/XAMPP-FB7A24?style=for-the-badge\&logo=xampp\&logoColor=white)                                         |
| Frontend            | HTML5         | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge\&logo=html5\&logoColor=white)                                         |
| Frontend            | CSS3          | ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge\&logo=css3\&logoColor=white)                                            |
| Frontend            | JavaScript    | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge\&logo=javascript\&logoColor=black)                          |
| Graphics & Visualization            | p5.js         | ![p5.js](https://img.shields.io/badge/p5.js-ED225D?style=for-the-badge\&logo=p5dotjs\&logoColor=white)                                       |
| Chess Engine        | Custom Engine | ![Custom Chess Engine](https://img.shields.io/badge/Chess%20Engine-Custom-blueviolet?style=for-the-badge\&logo=chessdotcom\&logoColor=white) |

---

## Installation

### Prerequisites

Before running the project, ensure the following software is installed:

* Node.js
* npm
* XAMPP
* MariaDB (included with XAMPP)
* SSL/TLS certificate and private key for HTTPS hosting

### Clone the Repository

```bash
git clone https://github.com/CapiMDR/ChessWebsite.git
cd ChessWebsite
```

### Install Dependencies

```bash
npm install
```

### Configure Database

1. Start **Apache** and **MariaDB** using XAMPP.
2. Open **phpMyAdmin**.
3. Create a database for the project.
4. Import the provided SQL schema:

```text
Assets/data/chess_db.sql
```

5. Update the database credentials in the server configuration files.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=chesswebsite
```

### Configure HTTPS

This application is designed to be served over **HTTPS**. Before starting the server, you must provide your own SSL/TLS certificate and private key.

1. Obtain or generate an SSL certificate.
2. Place your certificate and private key files in a secure location on the server.
3. Update the HTTPS configuration in the Node.js server to point to your certificate files.

Example:

```javascript
const httpsOptions = {
    key: fs.readFileSync("certs/private.key"),
    cert: fs.readFileSync("certs/certificate.crt")
};
```

> **Note:** Self-signed certificates may be used for development environments, but a trusted certificate authority (CA) certificate is recommended for production deployments.

### Start the Application

Start the Node.js server:

```bash
cd chess/node
node server.js
```

Once running, access the application through your browser using HTTPS:

```text
https://<your-server-ip>:3000
```

If using a self-signed certificate, your browser may display a security warning that must be accepted before accessing the site.

---

## Database Structure

The MariaDB database stores:

* User accounts
* Match records & move history
* Player statistics

---

## Roadmap

Planned features include:

* Elo rating system
* Spectator mode
* Opening database integration
* Better engine strength settings
* Friend system
* PGN export/import

---

## Contributing

Contributions, bug reports, and feature requests are welcome. Feel free to open an issue or submit a pull request.

---

## Author

Developed by **CapiMDR**.

If you enjoy the project, consider starring the repository ⭐.
