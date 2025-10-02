# MovieBooking (CineBook)

A simple microservice-based movie booking sample app. This workspace contains three Spring Boot services (User, Movie, Booking) and a small frontend served from the `userService` static resources. The UI has been simplified and the booking flow includes a client-side seat map and a minimal "Book Now" payment step (Name + Phone).

---

## Table of contents

- Project overview
- Repository layout
- Technologies
- How to run (Windows / cmd.exe)
- Build (package) instructions
- Frontend details (where to find pages & assets)
- Booking flow (quick walkthrough)
- Configuration and ports (assumptions and how to change)
- Troubleshooting & common errors
- Files you may want to inspect/modify
- Next steps / TODOs

---

## Project overview

This project implements a small movie booking system split into three services so you can run them independently while developing:

- `userService` — serves the frontend static assets (HTML/CSS/JS) and contains authentication/user endpoints.
- `movieService` — provides movie data (listings, details).
- `bookingService` — accepts booking requests and stores/returns bookings.

The frontend is shipped inside `userService/src/main/resources/static/` and uses simple JS helpers to call the three services.

Note: This README documents the repository layout and how to run the application locally. A number of UI simplifications were made (minimal CSS, removed marketing sections, simplified payment step) to make testing faster.

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

## Technologies

- Java + Spring Boot (REST services)
- Maven (build)
- Plain HTML/CSS/Vanilla JS for the frontend (static files under `userService/src/main/resources/static/`)
- No frontend framework (React/Vue) — small, easy to modify static pages

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

## Configuration and ports (assumptions)

The repo does not hard-code port assignments in this README. Typical default Spring Boot port is `8080`. Because this workspace contains three services they must not run on the same port simultaneously.

Reasonable assumption used during development/testing:
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
