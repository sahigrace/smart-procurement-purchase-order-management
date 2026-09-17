package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    // Get all users
    public List<User> getAllUsers() {
        return repository.findAll();
    }

    // Registration
    public User registerUser(User user) {
        return repository.save(user);
    }

    // Login
    public String loginUser(String userName, String password) {

        Optional<User> optionalUser = repository.findByUserName(userName);

        if (optionalUser.isPresent()) {

            User user = optionalUser.get();

            if (user.getPassword().equals(password)) {
                return "Login Successful";
            } else {
                return "Invalid Password";
            }

        }

        return "User Not Found";
    }
}