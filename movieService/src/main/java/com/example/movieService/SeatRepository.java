package com.example.movieService;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    // Find all seats for a specific movie
    List<Seat> findByMovieId(Long movieId);

    // Find available seats for a specific movie
    List<Seat> findByMovieIdAndIsAvailable(Long movieId, Boolean isAvailable);

    // Find seats by movie ID and seat type
    List<Seat> findByMovieIdAndSeatType(Long movieId, String seatType);

    // Find seats by row name for a specific movie
    List<Seat> findByMovieIdAndRowName(Long movieId, String rowName);

    // Find a specific seat by movie ID and seat number
    Seat findByMovieIdAndSeatNumber(Long movieId, String seatNumber);

    // Count total seats for a movie
    Long countByMovieId(Long movieId);

    // Count available seats for a movie
    Long countByMovieIdAndIsAvailable(Long movieId, Boolean isAvailable);

    // Custom query to update seat availability
    @Modifying
    @Transactional
    @Query("UPDATE Seat s SET s.isAvailable = :isAvailable WHERE s.id = :seatId")
    void updateSeatAvailability(@Param("seatId") Long seatId, @Param("isAvailable") Boolean isAvailable);

    // Custom query to update multiple seats availability
    @Modifying
    @Transactional
    @Query("UPDATE Seat s SET s.isAvailable = :isAvailable WHERE s.id IN :seatIds")
    void updateMultipleSeatsAvailability(@Param("seatIds") List<Long> seatIds, @Param("isAvailable") Boolean isAvailable);

    // Find all rows for a specific movie
    @Query("SELECT DISTINCT s.rowName FROM Seat s WHERE s.movieId = :movieId ORDER BY s.rowName")
    List<String> findDistinctRowNamesByMovieId(@Param("movieId") Long movieId);
}
