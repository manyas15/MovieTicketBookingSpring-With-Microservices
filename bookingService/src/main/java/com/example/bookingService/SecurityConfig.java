package com.example.bookingService;

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
                .requestMatchers("/api/**").permitAll() // all API endpoints are public
                .anyRequest().permitAll() // everything else is also public for development
                );
        return http.build();
    }
}
