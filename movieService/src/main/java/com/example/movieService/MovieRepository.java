package com.example.movieService;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    // Find movies by genre
    List<Movie> findByGenre(String genre);

    // Find movies by language
    List<Movie> findByLanguage(String language);

    // Find movies by rating
    List<Movie> findByRating(String rating);

    // Find movies by title containing (case insensitive search)
    List<Movie> findByTitleContainingIgnoreCase(String title);

    // Find movies by genre and language
    List<Movie> findByGenreAndLanguage(String genre, String language);

    // Custom query to find movies with duration in a specific range
    @Query("SELECT m FROM Movie m WHERE m.duration BETWEEN :minDuration AND :maxDuration")
    List<Movie> findByDurationRange(@Param("minDuration") Integer minDuration,
            @Param("maxDuration") Integer maxDuration);

    // Custom query to find movies with ticket price less than or equal to specified amount
    @Query("SELECT m FROM Movie m WHERE m.ticketPrice <= :maxPrice")
    List<Movie> findByTicketPriceLessThanEqual(@Param("maxPrice") Double maxPrice);
}
