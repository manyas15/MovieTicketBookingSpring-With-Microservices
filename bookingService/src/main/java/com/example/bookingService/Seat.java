package com.example.bookingService;

public class Seat {

    private Long id;
    private String label;
    private Long movieId;
    private boolean isBooked;

    public Seat() {
    }

    public Seat(Long id, String label, Long movieId, boolean isBooked) {
        this.id = id;
        this.label = label;
        this.movieId = movieId;
        this.isBooked = isBooked;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public boolean isBooked() {
        return isBooked;
    }

    public void setBooked(boolean isBooked) {
        this.isBooked = isBooked;
    }
}
