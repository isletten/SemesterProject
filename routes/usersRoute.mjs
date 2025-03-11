// usersRoute.mjs
import express from 'express';
import User from '../modules/user.mjs';
import { HTTPCodes } from "../modules/httpConstants.mjs";
import SuperLogger from "../modules/SuperLogger.mjs";
import authenticateUser from '../modules/authMiddleware.mjs'; 
import dbm from "../modules/storageManager.mjs";
const USER_API = express.Router();
USER_API.use(express.json());

const users = [];

USER_API.get('/all', async (req, res, next) => {
    try {
        const getUsers = await dbm.getUsers();
        if (getUsers){
            res.status(HTTPCodes.SuccesfullRespons.Ok).json(getUsers).end();
        }else{
            res.status(HTTPCodes.ServerErrorRespons.InternalError).end();
        }
    } catch (error) {
        console.error('Error showing users:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to show users' });
    }
});

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
        const existingUser = await dbm.getUserFromEmail(email);
        if (existingUser) {
            return res.status(HTTPCodes.ClientSideErrorRespons.Conflict).json({ message: 'User already exists with this email' });
        }

        // If user does not exist, create a new user
        const newUser = new User(name, email, password);
        await newUser.save();
        res.status(HTTPCodes.SuccesfullRespons.Ok).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to create user' });
    }
});

// Route to authenticate user
USER_API.post('/login', async (req, res) => {
    const {email, pswHash} = req.body;
    const user = await dbm.getUserFromEmail(email);
    if(user){
        if(user.password === pswHash){
            const role = await dbm.getUserRole(user.userid);
           
            res.status(HTTPCodes.SuccesfullRespons.Ok).json({ message: 'User found', data: {userID: user.userid, email: user.email, role: role.role}})
        }else{

            res.status(HTTPCodes.ClientSideErrorRespons.Unauthorized).json({ message: 'Wrong password'})
        }
    }else{
       
        res.status(HTTPCodes.ClientSideErrorRespons.Unauthorized).json({ message: 'Email not found'})
    }
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
USER_API.delete('/', async (req, res) => {
    try {
        let userid = req.body.userid;
        const response = await dbm.deleteUser(userid);
        if (response){
            res.status(HTTPCodes.SuccesfullRespons.Ok).end();
        }else{
            res.status(HTTPCodes.ServerErrorRespons.InternalError).end();
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to delete user' });
    }
});

export default USER_API;