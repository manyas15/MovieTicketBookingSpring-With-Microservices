package com.example.userService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // disable CSRF for APIs
                .cors(cors -> cors.disable()) // disable CORS since we handle it in WebConfig
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll() // public APIs
                .requestMatchers("/api/**").permitAll() // all API endpoints for development
                .requestMatchers("/", "/index.html", "/movies.html", "/booking.html", "/dashboard.html").permitAll() // public pages
                .requestMatchers("/css/**", "/js/**", "/images/**", "/static/**").permitAll() // static resources
                .requestMatchers("/favicon.ico").permitAll() // favicon
                .anyRequest().permitAll() // everything permissive for development
                );
        return http.build();
    }
}
