// usersRoute.mjs
import express from 'express';
import User from '../modules/user.mjs';
import { HTTPCodes } from '../modules/httpConstants.mjs';
import SuperLogger from '../modules/SuperLogger.mjs';
import authenticateUser from '../modules/authMiddleware.mjs';

const USERS_API = express.Router();
USERS_API.use(express.json());

const users = [];

USERS_API.get('/', (req, res, next) => {
    SuperLogger.log("Demo of logging tool");
    SuperLogger.log("An important msg", SuperLogger.LOGGING_LEVELS.CRITICAL);
    res.status(HTTPCodes.SuccessfulResponse.Ok).end();
});

USERS_API.get('/:id', (req, res, next) => {
    const userId = req.params.id;
    const user = users.find(user => user.id === userId);
    if (user) {
        res.status(HTTPCodes.SuccessfulResponse.Ok).json(user);
    } else {
        res.status(HTTPCodes.ClientSideErrorResponse.NotFound).end();
    }
});

USERS_API.post('/', (req, res, next) => {
    const { name, email, password } = req.body;

    if (name && email && password) {
        const existingUser = users.find(user => user.email === email);
        if (!existingUser) {
            const newUser = new User(name, email, password);
            users.push(newUser);
            res.status(HTTPCodes.SuccessfulResponse.Ok).end();
        } else {
            res.status(HTTPCodes.ClientSideErrorResponse.BadRequest).end();
        }
    } else {
        res.status(HTTPCodes.ClientSideErrorResponse.BadRequest).send("Missing data fields").end();
    }
});

USERS_API.put('/:id', (req, res) => {
    const userId = req.params.id;
    const { name, email } = req.body;

    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        if (name) users[userIndex].name = name;
        if (email) users[userIndex].email = email;
        res.status(HTTPCodes.SuccessfulResponse.Ok).end();
    } else {
        res.status(HTTPCodes.ClientSideErrorResponse.NotFound).end();
    }
});

USERS_API.delete('/:id', (req, res) => {
    const userId = req.params.id;
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        res.status(HTTPCodes.SuccessfulResponse.Ok).end();
    } else {
        res.status(HTTPCodes.ClientSideErrorResponse.NotFound).end();
    }
});

export default USERS_API;