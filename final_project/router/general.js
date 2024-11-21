const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user (Task 6)
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (users[username]) {
    return res.status(400).json({ message: "Username already exists." });
  }

  // Register the new user
  users[username] = { password };
  res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop (Task 1)
public_users.get('/', function (req, res) {
  res.json(books);
});

// Get book details based on ISBN (Task 2)
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[Number(isbn)]; // Convert isbn to number to match the books keys

  if (book) {
    res.json(book);  // Return book details
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author (Task 3)
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params;
  const result = [];

  // Iterate over all books to find the matching author
  for (let bookId in books) {
    if (books[bookId].author.toLowerCase().includes(author.toLowerCase())) {
      result.push(books[bookId]);
    }
  }

  if (result.length > 0) {
    res.json(result);
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title (Task 4)
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params;
  const result = [];

  // Iterate over all books to find the matching title
  for (let bookId in books) {
    if (books[bookId].title.toLowerCase().includes(title.toLowerCase())) {
      result.push(books[bookId]);
    }
  }

  if (result.length > 0) {
    res.json(result);
  } else {
    res.status(404).json({ message: "No books found for this title" });
  }
});

// Get book review (Task 5)
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[Number(isbn)];

  if (book) {
    res.json(book.reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
