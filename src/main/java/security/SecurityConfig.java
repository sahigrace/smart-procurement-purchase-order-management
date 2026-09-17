package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(Customizer.withDefaults())

                .authorizeHttpRequests(authorize -> authorize

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        .requestMatchers("/auth/**")
                        .permitAll()

                        .requestMatchers("/admin/**")
                        .hasRole("ADMIN")

                        .requestMatchers("/requisitions/**")
                        .hasAnyRole(
                                "EMPLOYEE",
                                "MANAGER",
                                "FINANCE",
                                "PROCUREMENT_HEAD",
                                "ADMIN"
                        )

                        .requestMatchers("/purchase-orders/**")
                        .hasAnyRole(
                                "PROCUREMENT_HEAD",
                                "ADMIN"
                        )

                        .requestMatchers("/analytics/**")
                        .hasAnyRole(
                                "FINANCE",
                                "PROCUREMENT_HEAD",
                                "ADMIN"
                        )

                        /*
                         * Everyone who is authenticated can
                         * READ departments.
                         *
                         * Only ADMIN and MANAGER can use
                         * the department management APIs.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/departments/**"
                        )
                        .hasAnyRole(
                                "EMPLOYEE",
                                "MANAGER",
                                "FINANCE",
                                "PROCUREMENT_HEAD",
                                "ADMIN"
                        )

                        .requestMatchers("/departments/**")
                        .hasAnyRole(
                                "ADMIN",
                                "MANAGER"
                        )

                        /*
                         * Everyone who is authenticated can
                         * READ products.
                         *
                         * Only ADMIN and PROCUREMENT_HEAD can
                         * manage products.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/products/**"
                        )
                        .hasAnyRole(
                                "EMPLOYEE",
                                "MANAGER",
                                "FINANCE",
                                "PROCUREMENT_HEAD",
                                "ADMIN"
                        )

                        .requestMatchers("/products/**")
                        .hasAnyRole(
                                "PROCUREMENT_HEAD",
                                "ADMIN"
                        )

                        .requestMatchers("/suppliers/**")
                        .hasAnyRole(
                                "PROCUREMENT_HEAD",
                                "ADMIN"
                        )

                        .requestMatchers("/audit-logs/**")
                        .hasRole("ADMIN")

                        .anyRequest().authenticated()
                )

                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}