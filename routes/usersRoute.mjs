// usersRoute.mjs
import express from 'express';
import User from '../modules/user.mjs';
import { HTTPCodes } from "../modules/httpConstants.mjs";
import SuperLogger from "../modules/SuperLogger.mjs";
import authenticateUser from '../modules/authMiddleware.mjs'; 


const USER_API = express.Router();
USER_API.use(express.json());

const users = [];

USER_API.get('/', (req, res, next) => {
    SuperLogger.log("Demo of logging tool");
    SuperLogger.log("A important msg", SuperLogger.LOGGING_LEVELS.CRTICAL);
})

// Route to get user info (requires authentication)
USER_API.get('/profile', authenticateUser, (req, res) => {
    // Get user info from session
    const user = req.session.user;
    res.status(HTTPCodes.SuccesfullRespons.Ok).json(user);
});

// Route to create a new user
USER_API.post('/register', async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).json({ message: 'Missing required fields' });
    }

    try {
        // Check if user already exists with the same email
        const existingUser = await DBManager.getUserFromEmail(email);
        if (existingUser) {
            return res.status(HTTPCodes.ClientSideErrorRespons.Conflict).json({ message: 'User already exists with this email' });
        }

        // If user does not exist, create a new user
        const newUser = new User(name, email, password);
        await newUser.save();
        res.status(HTTPCodes.SuccesfullRespons.Created).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to create user' });
    }
});


// Route to authenticate user
USER_API.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(user => user.email === email);

    if (!user || user.pswHash !== password) {
        return res.status(HTTPCodes.ClientSideErrorRespons.Unauthorized).json({ message: 'Invalid credentials' });
    }

    // Authentication successful
    // You might want to use a more secure authentication method like JWT instead of storing user state in session
    req.session.user = user;
    res.status(HTTPCodes.SuccesfullRespons.Ok).json({ message: 'Authentication successful' });
});

// Route to update user information
USER_API.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    
    // Find user by ID
    const user = users.find(user => user.id === parseInt(id));

    if (!user) {
        return res.status(HTTPCodes.ClientSideErrorRespons.NotFound).json({ message: 'User not found' });
    }

    // Update user information
    user.name = name || user.name;
    user.email = email || user.email;
    user.pswHash = password || user.pswHash;

    try {
        // Save the updated user
        await user.save();
        res.status(HTTPCodes.SuccesfullRespons.Ok).json(user);
    } catch (error) {
        // Handle user update failure
        console.error('Error updating user:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to update user' });
    }
});

// Route to delete user
USER_API.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    // Find user by ID
    const index = users.findIndex(user => user.id === parseInt(id));

    if (index === -1) {
        return res.status(HTTPCodes.ClientSideErrorRespons.NotFound).json({ message: 'User not found' });
    }

    // Delete user from users array
    const deletedUser = users.splice(index, 1)[0]; // Remove the user from array and get deleted user object
    
    try {
        // Delete the user
        await deletedUser.delete();
        res.status(HTTPCodes.SuccesfullRespons.Ok).json(deletedUser);
    } catch (error) {
        // Handle user deletion failure
        console.error('Error deleting user:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to delete user' });
    }
});

export default USER_API;