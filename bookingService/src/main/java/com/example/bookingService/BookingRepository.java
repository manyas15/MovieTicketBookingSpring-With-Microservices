package com.example.bookingService;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByMovieIdAndSeatLabel(Long movieId, String seatLabel);

    List<Booking> findByUsername(String username);
}
