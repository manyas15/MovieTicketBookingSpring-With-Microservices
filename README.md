# 🎬 Movie Ticket Booking System with Microservices

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7-green.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-11-orange.svg)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-red.svg)](https://jwt.io/)

A modern movie ticket booking application built using a microservices architecture with Spring Boot. This workspace contains three Spring Boot services (User, Movie, Booking) and a responsive frontend served from the `userService` static resources. The UI features a clean design with a client-side seat map and streamlined booking process.

---

## 🌟 Key Features

- **User Authentication & Authorization**: Secure registration and login with JWT tokens
- **Movie Browsing & Filtering**: Browse movies with filtering options
- **Interactive Seat Selection**: Visual seat map with real-time availability updates
- **Booking Management**: Create, view, and manage ticket bookings
- **Responsive Design**: Modern UI that works on desktop and mobile devices

## Table of contents

- Project overview
- Architecture
- Repository layout
- Technologies
- How to run (Windows / cmd.exe)
- Build (package) instructions
- Frontend details (where to find pages & assets)
- Booking flow (quick walkthrough)
- API Documentation
- Configuration and ports (assumptions and how to change)
- Database Structure
- Troubleshooting & common errors
- Files you may want to inspect/modify
- Next steps / TODOs

---

## Project Overview

This project implements a comprehensive movie booking system split into three microservices so you can run them independently while developing:

- `userService` — serves the frontend static assets (HTML/CSS/JS) and contains authentication/user endpoints.
- `movieService` — provides movie data (listings, details) and manages seat availability.
- `bookingService` — accepts booking requests and stores/returns bookings.

The frontend is shipped inside `userService/src/main/resources/static/` and uses JavaScript helpers to call the three services.

## 🏗️ Architecture

The application follows a microservice architecture with three main services:

### 1. User Service
- Manages user authentication and profile information
- Handles user registration and login
- Generates and validates JWT tokens
- Serves the frontend UI static resources
- Default port: 8080

### 2. Movie Service
- Manages movie data and seat information
- Provides APIs for movie listings, details, and seat availability
- Handles search and filtering of movie content
- Default port: 8081

### 3. Booking Service
- Manages the booking process and ticketing
- Handles seat reservation and booking confirmation
- Maintains booking history and status
- Default port: 8082

### Microservice Communication

The services communicate with each other via REST APIs:
- Frontend -> UserService: Direct HTTP for authentication and serving static files
- Frontend -> MovieService: Direct HTTP for movie listings and details
- Frontend -> BookingService: Direct HTTP for booking operations
- BookingService -> MovieService: Server-side HTTP for seat availability verification
- BookingService -> UserService: Server-side HTTP for user validation

Each service maintains its own database, with referential integrity managed at the application level.

---

## Repository layout (top-level)

```
MovieBooking/
├─ bookingService/   # Spring Boot service for bookings
├─ movieService/     # Spring Boot service for movies
├─ userService/      # Spring Boot service for users + static frontend files
└─ README.md          # (this file)
```

Each service is a standard Maven Spring Boot application and includes the Maven wrapper (`mvnw`, `mvnw.cmd`) so you can run it without installing Maven system-wide.

---

## 💻 Tech Stack

### Backend
- **Java 11**
- **Spring Boot** - REST API development
- **Spring Data JPA** - Data persistence and ORM
- **Spring Security** - Authentication and authorization
- **JWT Authentication** - Secure token-based authentication
- **Maven** - Dependency management and build
- **MySQL** - Relational database

### Frontend
- **HTML5/CSS3** - Structure and styling
- **Vanilla JavaScript** - Client-side functionality
- **Fetch API** - HTTP requests
- **JSON** - Data interchange
- **Responsive Design** - Mobile-friendly UI
- Static files served from `userService/src/main/resources/static/`

### Development Tools
- **Git** - Version control
- **Maven Wrapper** - No need for local Maven installation
- **Spring Boot DevTools** - Hot reload during development

---

## How to run (Windows / cmd.exe)

Open three separate terminals (one per service) and run each service. The project includes the Maven wrapper so you can use the included `mvnw.cmd` on Windows.

1) Start UserService (serves frontend + user APIs)

```cmd
cd /d "C:\Users\Hp\OneDrive\Desktop\MovieBooking\userService"
.mvnw.cmd spring-boot:run
```

2) Start MovieService (movie listing APIs)

```cmd
cd /d "C:\Users\Hp\OneDrive\Desktop\MovieBooking\movieService"
.mvnw.cmd spring-boot:run
```

3) Start BookingService (booking APIs)

```cmd
cd /d "C:\Users\Hp\OneDrive\Desktop\MovieBooking\bookingService"
.mvnw.cmd spring-boot:run
```

If you prefer to run the packaged JARs after building, see the Build section below.

After the services start, open the frontend (user service) in a browser (example):

- http://localhost:8080/

If the `userService` uses a different port in your configuration, substitute that port (see Configuration below).

---

## Build (package) instructions

To build a fat JAR for a service (example for `userService`):

```cmd
cd /d "C:\Users\Hp\OneDrive\Desktop\MovieBooking\userService"
.mvnw.cmd -DskipTests package

# Then run the generated jar
java -jar target\userService-0.0.1-SNAPSHOT.jar
```

Repeat for `movieService` and `bookingService`.

---

## Frontend details

Frontend files live in `userService/src/main/resources/static/`.

Key pages:
- `index.html` — minimal home page (Browse Movies link). Marketing sections were intentionally removed.
- `movies.html` — movie listing page (dynamic movie cards rendered by `js/movies.js`).
- `booking.html` — booking flow page (seat selection, summary, payment step changed to minimal Name + Phone, and confirmation step).
- `dashboard.html` — user dashboard (shows your bookings).

Important JS files:
- `userService/src/main/resources/static/js/movies.js` — renders movie cards and the movie details modal; it uses a placeholder for posters (no external images required).
- `userService/src/main/resources/static/js/booking.js` — booking flow: seat map rendering, seat selection, summary, minimal payment form handling, booking API calls.
- `userService/src/main/resources/static/js/main.js` — general site boot logic and homepage movie preview.
- `userService/src/main/resources/static/js/auth.js` — basic auth helpers (login/register modals) used by the frontend.

The CSS is a small, minimal stylesheet at `userService/src/main/resources/static/css/style.css`.

---

## Booking flow (how to test manually)

1. Start all three services (see How to run).
2. Open the frontend in a browser (example: `http://localhost:8080/`).
3. Click "Browse Movies".
4. Click "Book Now" or Quick Book on a movie card.
5. On the booking page:
   - Select seats using the seat map.
   - Click "Book" (this navigates to the minimal payment step).
   - Fill `Name` and `Phone` (10 digits) and click "Book Now".
6. On success the Confirmation step will be shown with Booking ID, seats and total amount.
7. You can then go to Dashboard which lists bookings.

Note: the frontend now sends `selectedSeatLabels` (array of seat ids like `A1`, `A2`) in the booking payload in addition to `seats` (count) and `totalAmount`.

---

## 🔌 API Documentation

### User Service API
- `POST /api/auth/register` - Register a new user
  - Request: `{ "username": "user", "password": "pass", "email": "user@example.com" }`
  - Response: `{ "id": 1, "username": "user", "email": "user@example.com" }`

- `POST /api/auth/login` - Authenticate and get JWT token
  - Request: `{ "username": "user", "password": "pass" }`
  - Response: `{ "token": "JWT_TOKEN_STRING", "username": "user" }`

- `GET /api/auth/user` - Get current user profile (requires authentication)
  - Response: `{ "id": 1, "username": "user", "email": "user@example.com" }`

### Movie Service API
- `GET /api/movies` - List all movies
  - Response: `[{ "id": 1, "title": "Movie Title", "description": "...", ... }]`

- `GET /api/movies/{id}` - Get movie details
  - Response: `{ "id": 1, "title": "Movie Title", "description": "...", ... }`

- `GET /api/movies/{id}/seats` - Get seat availability for a movie
  - Response: `[{ "id": 1, "movieId": 1, "seatLabel": "A1", "isBooked": false, "price": 10.0 }]`

### Booking Service API
- `POST /api/bookings` - Create a new booking (requires authentication)
  - Request: `{ "username": "user", "movieId": 1, "selectedSeatLabels": ["A1", "A2"], "seats": 2, "totalAmount": 20.0 }`
  - Response: `{ "id": 1, "username": "user", "movieId": 1, "seatLabel": "A1,A2", "bookedAt": "2023-06-15T10:30:00" }`

- `GET /api/bookings/{username}` - Get user's bookings (requires authentication)
  - Response: `[{ "id": 1, "username": "user", "movieId": 1, "seatLabel": "A1,A2", "bookedAt": "2023-06-15T10:30:00" }]`

## 🗄️ Database Structure

The application can use either a single database (`moviebooking`) for all services or separate databases for each service.

### Database Setup Scripts

#### Option 1: Separate Databases (Microservices Best Practice)

```sql
-- Create separate databases for each service
CREATE DATABASE IF NOT EXISTS user_service;
CREATE DATABASE IF NOT EXISTS movie_service;
CREATE DATABASE IF NOT EXISTS booking_service;

-- User Service Database Setup
USE user_service;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Movie Service Database Setup
USE movie_service;

CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    genre VARCHAR(50),
    duration INT,
    release_date DATE,
    image_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    seat_label VARCHAR(10) NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2) NOT NULL,
    UNIQUE KEY movie_seat_unique (movie_id, seat_label),
    FOREIGN KEY (movie_id) REFERENCES movies(id)
);

-- Booking Service Database Setup
USE booking_service;

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    movie_id INT NOT NULL,
    seat_label VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_booking (movie_id, seat_label)
);
```

#### Option 2: Single Database (Current Implementation)

```sql
-- Create a single database for all services
CREATE DATABASE IF NOT EXISTS moviebooking;
USE moviebooking;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Movies Table
CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    genre VARCHAR(50),
    duration INT,
    release_date DATE,
    image_url VARCHAR(255)
);

-- Seats Table (based on actual entity structure)
CREATE TABLE IF NOT EXISTS seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    row_name VARCHAR(5) NOT NULL,
    seat_in_row INT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    seat_type VARCHAR(20),
    additional_price DECIMAL(10,2) DEFAULT 0.00
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    movie_id INT NOT NULL,
    seat_label VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_booking (movie_id, seat_label)
);

-- Sample Seat Data Generation
INSERT INTO seats (movie_id, seat_number, row_name, seat_in_row, is_available, seat_type, additional_price)
SELECT 
    m.id, 
    CONCAT(r.row_letter, s.seat_num),
    r.row_letter,
    s.seat_num,
    TRUE,
    CASE 
        WHEN r.row_letter IN ('A', 'B') THEN 'Regular'
        WHEN r.row_letter IN ('C', 'D') THEN 'Premium'
        ELSE 'VIP'
    END,
    CASE 
        WHEN r.row_letter IN ('A', 'B') THEN 0.00
        WHEN r.row_letter IN ('C', 'D') THEN 2.00
        ELSE 5.00
    END
FROM movies m
CROSS JOIN (
    SELECT 'A' as row_letter UNION SELECT 'B' UNION SELECT 'C' UNION SELECT 'D'
) r
CROSS JOIN (
    SELECT 1 as seat_num UNION SELECT 2 UNION SELECT 3 UNION 
    SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
) s;
```

### Data Verification Queries

```sql
-- Check tables in the database
USE moviebooking;
SHOW TABLES;

-- View data in each table
SELECT * FROM users;
SELECT * FROM movies;
SELECT * FROM seats;
SELECT * FROM bookings;
```

### Entity Relationships
- **Users → Bookings**: One-to-many (one user can make many bookings)
- **Movies → Seats**: One-to-many (one movie has many seats)
- **Movies → Bookings**: One-to-many (one movie can have many bookings)
- **Seats → Bookings**: One-to-one (each seat can be booked once per movie)

## Configuration and ports (assumptions)

Default port configuration during development/testing:
- `userService` — 8080 (frontend)
- `movieService` — 8081
- `bookingService` — 8082

If your `application.properties` files use different ports, use those instead. To change a service port, open:

```
<service-dir>/src/main/resources/application.properties
```

and set (example):

```
server.port=8081
```

Also check for any other environment-specific configuration (DB, credentials) in each service's `application.properties` or `application.yml`.

---

## Troubleshooting & common errors

- Port conflict / service fails to start:
  - Check terminal logs for `Tomcat` / `Port` errors. Modify `server.port` in the service's `application.properties` or stop the conflicting app.

- Frontend shows "Loading..." or empty movies:
  - Ensure `movieService` is running and reachable from the browser. Open the movie API endpoint (e.g., `http://localhost:8081/api/movies`) in the browser or use `curl` to validate.

- Booking fails with 4xx/5xx:
  - Inspect the Network tab in browser devtools for the POST payload to the booking endpoint. Paste the response body here and I can help adapt the frontend payload or server logic.

- CSS not applied / broken UI:
  - Ensure the `userService` static files are being served from `userService` and the `<link>` to `/css/style.css` is available. Refresh and clear cache if necessary.

---

## Files you may want to inspect / modify

(Recent changes made during UX cleanup & bugfixes)

- `userService/src/main/resources/static/css/style.css` — minimal global stylesheet
- `userService/src/main/resources/static/js/booking.js` — seat map, booking flow; this contains the code that builds the booking payload (now includes `selectedSeatLabels`).
- `userService/src/main/resources/static/js/movies.js` — movie card rendering (uses placeholders instead of <img> tags)
- `userService/src/main/resources/static/index.html` — home (marketing sections removed)
- `userService/src/main/resources/static/movies.html` — movies list page
- `userService/src/main/resources/static/booking.html` — booking page markup (seat map + minimal payment form)

Backend service main classes:

## 🚀 Future Improvements

Here are some potential enhancements for the project:

1. **Payment Gateway Integration**: Add real payment processing
2. **Email Confirmation**: Send booking confirmations via email
3. **Admin Dashboard**: Create an admin panel for managing movies and bookings
4. **User Reviews**: Allow users to rate and review movies
5. **Recommendation Engine**: Suggest movies based on user preferences
6. **Docker Containerization**: Package services as Docker containers
7. **API Gateway**: Implement an API Gateway using Spring Cloud Gateway
8. **Service Discovery**: Add Eureka service registry
9. **Circuit Breaker**: Implement Resilience4j for fault tolerance
10. **Monitoring**: Add Spring Boot Actuator endpoints

## 👥 Contributors

- [manyas15](https://github.com/manyas15) - Project Creator

## 📄 License

This project is licensed under the MIT License.

---

⭐ If you find this project useful, please consider giving it a star on GitHub! ⭐
- `bookingService/src/main/java/.../BookingServiceApplication.java`
- `movieService/src/main/java/.../MovieServiceApplication.java`
- `userService/src/main/java/.../UserServiceApplication.java`

---

## Next steps / TODOs

- Run an end-to-end booking test and verify successful POST to booking service and persistence.
- If BookingService requires a different payload shape (different field names for seats, user id, etc.), adapt `booking.js`'s `collectBookingData()` to match server expectations.
- Add unit/integration tests for backend services.
- Optionally add a small in-browser automated test harness to run the booking flow automatically.

---

## Contributing

Small project; feel free to open issues or PRs in this workspace. Recommend running each service locally using the Maven wrapper before making changes.

---

## License

This project is provided as-is for learning and experimentation. No license file is included by default.

---

If you'd like, I can now:

- Run an automated end-to-end booking test and paste the network request/response, or
- Generate a quick Postman collection / curl examples for the main API calls, or
- Add a `docker-compose` to run all services with fixed ports.

Tell me which and I'll proceed. 
