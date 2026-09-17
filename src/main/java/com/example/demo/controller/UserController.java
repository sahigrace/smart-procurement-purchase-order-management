package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ==========================================
    // GET ALL USERS
    // ==========================================

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ==========================================
    // GET USER BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(
            @PathVariable Integer id) {

        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // ==========================================
    // CREATE USER
    // ==========================================

    @PostMapping
    public User createUser(@RequestBody User user) {

        if (user.getUserName() == null ||
                user.getUserName().isBlank()) {

            throw new RuntimeException(
                    "Username is required"
            );
        }

        if (user.getPassword() == null ||
                user.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }

        if (userRepository.findByUserName(
                user.getUserName()).isPresent()) {

            throw new RuntimeException(
                    "Username already exists"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        if (user.getRole() == null ||
                user.getRole().isBlank()) {

            user.setRole("EMPLOYEE");
        } else {
            user.setRole(
                    user.getRole().toUpperCase()
            );
        }

        return userRepository.save(user);
    }

    // ==========================================
    // UPDATE USER
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Integer id,
            @RequestBody User updatedUser) {

        User user = userRepository.findById(id)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (updatedUser.getUserName() != null &&
                !updatedUser.getUserName().isBlank()) {

            user.setUserName(
                    updatedUser.getUserName()
            );
        }

        if (updatedUser.getEmail() != null &&
                !updatedUser.getEmail().isBlank()) {

            user.setEmail(
                    updatedUser.getEmail()
            );
        }

        if (updatedUser.getRole() != null &&
                !updatedUser.getRole().isBlank()) {

            user.setRole(
                    updatedUser.getRole().toUpperCase()
            );
        }

        if (updatedUser.getDepartment() != null) {
            user.setDepartment(
                    updatedUser.getDepartment()
            );
        }

        if (updatedUser.getPassword() != null &&
                !updatedUser.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(
                            updatedUser.getPassword()
                    )
            );
        }

        return ResponseEntity.ok(
                userRepository.save(user)
        );
    }

    // ==========================================
    // CHANGE USER PASSWORD
    // ==========================================

    @PutMapping("/{id}/password")
    public ResponseEntity<User> updatePassword(
            @PathVariable Integer id,
            @RequestParam String password) {

        User user = userRepository.findById(id)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (password == null || password.isBlank()) {
            throw new RuntimeException(
                    "Password is required"
            );
        }

        user.setPassword(
                passwordEncoder.encode(password)
        );

        return ResponseEntity.ok(
                userRepository.save(user)
        );
    }

    // ==========================================
    // CHANGE USER ROLE
    // ==========================================

    @PutMapping("/{id}/role")
    public ResponseEntity<User> updateRole(
            @PathVariable Integer id,
            @RequestParam String role) {

        User user = userRepository.findById(id)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (role == null || role.isBlank()) {
            throw new RuntimeException(
                    "Role is required"
            );
        }

        user.setRole(
                role.toUpperCase()
        );

        return ResponseEntity.ok(
                userRepository.save(user)
        );
    }

    // ==========================================
    // DELETE USER
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Integer id) {

        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(id);

        return ResponseEntity.ok(
                "User deleted successfully"
        );
    }
}