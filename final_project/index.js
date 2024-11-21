const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Use JSON parser for incoming requests
app.use(express.json());

// Use session for customer routes
app.use("/customer", session({
  secret: "fingerprint_customer", 
  resave: true, 
  saveUninitialized: true
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if the access token is stored in session
  const token = req.session.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No access token found" });
  }

  // Verify the token using jwt.verify()
  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }

    // Store the decoded information in the request object (optional)
    req.user = decoded;

    // Proceed to the next middleware or route
    next();
  });
});

const PORT = 5000;

// Use customer and general routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
app.listen(PORT, () => console.log("Server is running"));
