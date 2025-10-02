package com.example.movieService;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MovieController {

    private final MovieRepository movieRepo;
    private final SeatRepository seatRepo;

    public MovieController(MovieRepository movieRepo, SeatRepository seatRepo) {
        this.movieRepo = movieRepo;
        this.seatRepo = seatRepo;
    }

    // Get all movies
    @GetMapping("/movies")
    public List<Movie> getMovies() {
        return movieRepo.findAll();
    }

    // Add new movie
    @PostMapping("/movies")
    public Movie createMovie(@RequestBody Movie movie) {
        return movieRepo.save(movie);
    }

    // Get seats for a movie
    @GetMapping("/movies/{id}/seats")
    public List<Seat> getSeats(@PathVariable Long id) {
        return seatRepo.findByMovieId(id);
    }
}
