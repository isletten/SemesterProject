import 'dotenv/config'
import express, { json } from 'express' // Express is installed using npm
import USER_API from './routes/usersRoute.mjs'; // This is where we have defined the API for working with users
import SuperLogger from './modules/SuperLogger.mjs';
import printDeveloperStartupInportantInformationMSG from "./modules/developerHelpers.mjs";
import dbm from "./modules/storageManager.mjs";


// Creating an instance of the server
const server = express();
server.use(express.json());
// Selecting a port for the server to use.
const port = (process.env.PORT || 8080);
server.set('port', port);


// Enable logging for server
const logger = new SuperLogger();
server.use(logger.createAutoHTTPRequestLogger()); // Will logg all http method requests
printDeveloperStartupInportantInformationMSG();

// Defining a folder that will contain static files.
server.use(express.static('public'));


// Telling the server to use the USER_API (all urls that uses this code will have to have the /user after the base address)
server.use("/user", USER_API);

server.post("/login", async (req, res, next) => {
    const {email, pswHash} = req.body;
    console.log (req.body)
    const user = await dbm.getUserFromEmail(email);
    if(user){
        if(user.password === pswHash){
            const role = await dbm.getUserRole(user.userid);
            console.log(role);
            const data = {
                msg: "Bruker funnet",
                code: 200,
                data: {userID: user.userid, email: user.email, role: role.role}
            }
            res.status(200).send(JSON.stringify(data));
        }else{
            // feil passord
            const data = {
                msg: "Feil Passord",
                code: 401
            }
            res.status(401).send(JSON.stringify())
        }
    }else{
        // feil e-post
        const data = {
            msg: "Feil epost",
            code: 401
        }
        res.status(401).send(JSON.stringify())
    }

});

// Add a route for user registration
server.post("/register", async (req, res) => {
    try {
        const { name, email, pswHash } = req.body;
        // Your validation logic here
        
        // Assuming you have a createUser method in storageManager.mjs
        const newUser = await dbm.createUser({ name, email, pswHash });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Failed to register user' });
    }
});

server.post("/content", async (req, res) => {
    try {
        const { title, text } = req.body;
        console.log(title)
        
        // Assuming you have a createUser method in storageManager.mjs
        const addContent = await dbm.addContent(title, text);
        if (addContent.id){
            res.status(200).end();
        }else{
            res.status(500).end();
        }
    } catch (error) {
        console.error('Error adding content:', error);
        res.status(500).json({ message: 'Failed to add content' });
    }
});

server.get("/content", async (req, res) => {
    try {
        
        // Assuming you have a createUser method in storageManager.mjs
        const getContent = await dbm.getContent();
        console.log(getContent)
        if (getContent){
            res.status(200).json(getContent).end();
        }else{
            res.status(500).end();
        }
    } catch (error) {
        console.error('Error adding content:', error);
        res.status(500).json({ message: 'Failed to add content' });
    }
});

server.delete("/content", async (req, res) => {
    try {
        let id = req.body.id;
        // Assuming you have a createUser method in storageManager.mjs
        const response = await dbm.deleteContent(id);
        console.log(response)
        if (response){
            res.status(200).end();
        }else{
            res.status(500).end();
        }
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ message: 'Failed to delete content' });
    }
});

server.put("/content", async (req, res) => {
    try {
        let {id,title,text} = req.body;
        // Assuming you have a createUser method in storageManager.mjs
        const response = await dbm.updateContent(id,title,text);
        console.log(response)
        if (response){
            res.status(200).json(response).end();
        }else{
            res.status(500).end();
        }
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ message: 'Failed to delete content' });
    }
});

server.get("/users", async (req, res) => {
    try {
        
        // Assuming you have a createUser method in storageManager.mjs
        const getUsers = await dbm.getUsers();
        console.log(getUsers)
        if (getUsers){
            res.status(200).json(getUsers).end();
        }else{
            res.status(500).end();
        }
    } catch (error) {
        console.error('Error showing users:', error);
        res.status(500).json({ message: 'Failed to show users' });
    }
});

server.delete("/users", async (req, res) => {
    try {
        let userid = req.body.userid;
        // Assuming you have a createUser method in storageManager.mjs
        const response = await dbm.deleteUser(userid);
        console.log(response)
        if (response){
            res.status(200).end();
        }else{
            res.status(500).end();
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

server.get("/comments/:itemid", async (req, res) => {
    try {
        
        // Assuming you have a createUser method in storageManager.mjs
        const getComments = await dbm.getComments(req.params.itemid);
        console.log(getComments)
        if (getComments){
            res.status(200).json(getComments).end();
        }else{
            res.status(500).end();
        }
    } catch (error) {
        console.error('Error showing users:', error);
        res.status(500).json({ message: 'Failed to show users' });
    }
});

server.get("/myComments/:userid", async (req, res) => {
    try {
        
        // Assuming you have a createUser method in storageManager.mjs
        const getMyComments = await dbm.getMyComments(req.params.userid);
        console.log(getMyComments)
        if (getMyComments){
            res.status(200).json(getMyComments).end();
        }else{
            res.status(500).end();
        }
    } catch (error) {
        console.error('Error showing my comments:', error);
        res.status(500).json({ message: 'Failed to show my comments' });
    }
});

server.post("/comment", async (req, res) => {
    try {
        const {userid, itemid, comment} = req.body;
        
        // Assuming you have a createUser method in storageManager.mjs
        const id = await dbm.addComment(userid, itemid, comment);
        if (id){
            res.status(200).end();
        }else{
            res.status(500).end();
        }
    } catch (error) {
        console.error('Error adding content:', error);
        res.status(500).json({ message: 'Failed to add content' });
    }
});

server.delete("/comment", async (req, res) => {
    try {
        let id = req.body.id;
        // Assuming you have a createUser method in storageManager.mjs
        const response = await dbm.deleteComment(id);
        console.log(response)
        if (response){
            res.status(200).end();
        }else{
            res.status(500).end();
        }
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ message: 'Failed to delete content' });
    }
});


// Start the server 
server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});