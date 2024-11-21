const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: "user1", password: "password123" },
    { username: "user2", password: "password456" }
];

// Validate username
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Authenticate user by username and password
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// User login endpoint
regd_users.post("/customer/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username)) {
        return res.status(404).json({ message: "Username not found" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(403).json({ message: "Incorrect password" });
    }

    // Create JWT token
    const token = jwt.sign({ username }, "your_secret_key", { expiresIn: '1h' });

    // Send the token as response
    return res.status(200).json({
        message: "Login successful",
        token: token
    });
});

// Add or modify book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: "User not logged in" });
    }

    try {
        const decoded = jwt.verify(token, "your_secret_key");
        const username = decoded.username;

        if (!review) {
            return res.status(400).json({ message: "Review cannot be empty" });
        }

        // Check if the book exists
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Initialize reviews if not already present
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }

        // Add or modify the review
        books[isbn].reviews[username] = review;

        return res.status(200).json({
            message: "Review added/modified successfully",
            reviews: books[isbn].reviews
        });
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
});

// Delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: "User not logged in" });
    }

    try {
        const decoded = jwt.verify(token, "your_secret_key");
        const username = decoded.username;

        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check if the user has reviewed this book
        if (!books[isbn].reviews || !books[isbn].reviews[username]) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Delete the review
        delete books[isbn].reviews[username];

        return res.status(200).json({
            message: "Review deleted successfully",
            reviews: books[isbn].reviews
        });
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
