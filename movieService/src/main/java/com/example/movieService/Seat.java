package com.example.movieService;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "seats")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "movie_id", nullable = false)
    private Long movieId;

    @Column(name = "seat_number", nullable = false)
    private String seatNumber; // e.g., "A1", "B5"

    @Column(name = "row_name", nullable = false)
    private String rowName; // e.g., "A", "B", "C"

    @Column(name = "seat_in_row", nullable = false)
    private Integer seatInRow; // e.g., 1, 2, 3

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    @Column(name = "seat_type")
    private String seatType; // e.g., "Regular", "Premium", "VIP"

    @Column(name = "additional_price")
    private Double additionalPrice = 0.0; // extra cost for premium seats

    // Default constructor
    public Seat() {
    }

    // Constructor with parameters
    public Seat(Long movieId, String seatNumber, String rowName, Integer seatInRow,
            Boolean isAvailable, String seatType, Double additionalPrice) {
        this.movieId = movieId;
        this.seatNumber = seatNumber;
        this.rowName = rowName;
        this.seatInRow = seatInRow;
        this.isAvailable = isAvailable;
        this.seatType = seatType;
        this.additionalPrice = additionalPrice;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getRowName() {
        return rowName;
    }

    public void setRowName(String rowName) {
        this.rowName = rowName;
    }

    public Integer getSeatInRow() {
        return seatInRow;
    }

    public void setSeatInRow(Integer seatInRow) {
        this.seatInRow = seatInRow;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public String getSeatType() {
        return seatType;
    }

    public void setSeatType(String seatType) {
        this.seatType = seatType;
    }

    public Double getAdditionalPrice() {
        return additionalPrice;
    }

    public void setAdditionalPrice(Double additionalPrice) {
        this.additionalPrice = additionalPrice;
    }
}
