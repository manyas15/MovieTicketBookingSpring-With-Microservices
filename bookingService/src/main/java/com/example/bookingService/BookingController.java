package com.example.bookingService;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/bookings")
@CrossOrigin(origins = "http://localhost:8081")
public class BookingController {

    private final BookingService bookingService;
    private final JwtUtil jwtUtil; // same as in UserService but included here to validate token

    public BookingController(BookingService bookingService, JwtUtil jwtUtil) {
        this.bookingService = bookingService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<?> book(@RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {
        try {
            System.out.println("Booking request received: " + body);
            System.out.println("Authorization header: " + authHeader);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.err.println("Invalid authorization header");
                return ResponseEntity.status(401).body("Invalid authorization header");
            }

            String username = jwtUtil.extractUsername(authHeader);
            System.out.println("Extracted username: " + username);

            if (username == null || username.isEmpty()) {
                System.err.println("Failed to extract username from token");
                return ResponseEntity.status(401).body("Invalid token");
            }

            Long movieId = Long.valueOf(body.get("movieId"));
            String seatLabel = body.get("seatLabel");
            System.out.println("Creating booking for movieId: " + movieId + ", seat: " + seatLabel);

            Booking b = bookingService.book(username, movieId, seatLabel);
            System.out.println("Booking created successfully: " + b.getId());
            return ResponseEntity.ok(b);
        } catch (NumberFormatException e) {
            System.err.println("Invalid movieId format: " + e.getMessage());
            return ResponseEntity.status(400).body("Invalid movieId format");
        } catch (Exception e) {
            System.err.println("Booking error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/debug")
    public ResponseEntity<?> debugBook(@RequestBody Map<String, String> body) {
        try {
            System.out.println("Debug booking request: " + body);
            Long movieId = Long.valueOf(body.get("movieId"));
            String seatLabel = body.get("seatLabel");
            String username = "debug@test.com"; // Use fixed username for testing

            Booking b = bookingService.book(username, movieId, seatLabel);
            return ResponseEntity.ok(b);
        } catch (Exception e) {
            System.err.println("Debug booking error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Debug Error: " + e.getMessage());
        }
    }

    @PostMapping("/no-auth")
    public ResponseEntity<?> bookNoAuth(@RequestBody Map<String, String> body) {
        try {
            System.out.println("No-auth booking request: " + body);
            Long movieId = Long.valueOf(body.get("movieId"));
            String seatLabel = body.get("seatLabel");
            String username = body.getOrDefault("username", "anonymous@example.com");

            System.out.println("Creating no-auth booking for movieId: " + movieId + ", seat: " + seatLabel + ", user: " + username);
            Booking b = bookingService.book(username, movieId, seatLabel);
            System.out.println("No-auth booking created successfully: " + b.getId());
            return ResponseEntity.ok(b);
        } catch (Exception e) {
            System.err.println("No-auth booking error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("No-auth Error: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public List<Booking> myBookings(@RequestHeader("Authorization") String authHeader) {
        try {
            String username = jwtUtil.extractUsername(authHeader);
            return bookingService.findByUsername(username);
        } catch (Exception e) {
            e.printStackTrace();
            return java.util.Collections.emptyList();
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("BookingService is working!");
    }
}
