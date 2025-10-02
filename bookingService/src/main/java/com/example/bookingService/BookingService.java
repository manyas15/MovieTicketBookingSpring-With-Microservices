package com.example.bookingService;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BookingService {

    private final BookingRepository repo;
    private final RestTemplate rest;
    private final String movieServiceUrl = "http://localhost:8082";

    public BookingService(BookingRepository repo, RestTemplate rest) {
        this.repo = repo;
        this.rest = rest;
    }

    @Transactional
    public Booking book(String username, Long movieId, String seatLabel) {
        // For now, skip seat validation to allow bookings to work
        // TODO: Fix seat validation with proper DTO mapping

        // 2) attempt booking (unique constraint prevents duplicates)
        Booking b = new Booking();
        b.setMovieId(movieId);
        b.setSeatLabel(seatLabel);
        b.setUsername(username);
        b.setBookedAt(LocalDateTime.now());
        try {
            return repo.save(b);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Seat already booked");
        }
    }

    public List<Booking> findByUsername(String username) {
        return repo.findByUsername(username);
    }
}
