// userRoute.mjs
import express from 'express';
import User from './userModel.mjs';
import authenticateUser from './authMiddleware.mjs';

const USER_API = express.Router();
USER_API.use(express.json());

const users = [];

// Route to create a new user
USER_API.post('/register', (req, res) => {
    const { name, email, pswHash } = req.body;

    if (!name || !email || !pswHash) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const newUser = new User(name, email, pswHash);
    users.push(newUser);
    res.status(201).json({ message: 'User created successfully' });
});

// Route to authenticate user
USER_API.post('/login', (req, res) => {
    const { email, pswHash } = req.body;

    // Find user by email
    const user = users.find(user => user.email === email);

    if (!user || user.pswHash !== pswHash) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Authentication successful
    // You might want to use a more secure authentication method like JWT instead of storing user state in session
    req.session.user = user;
    res.status(200).json({ message: 'Authentication successful' });
});

// Route to get user info (requires authentication)
USER_API.get('/profile', authenticateUser, (req, res) => {
    // Get user info from session
    const user = req.session.user;
    res.status(200).json(user);
});

export default USER_API;