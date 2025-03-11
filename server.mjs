import 'dotenv/config'
import express, { json } from 'express' // Express is installed using npm
import USER_API from './routes/usersRoute.mjs'; // This is where we have defined the API for working with users
import SuperLogger from './modules/SuperLogger.mjs';
import printDeveloperStartupInportantInformationMSG from "./modules/developerHelpers.mjs";
import dbm from "./modules/storageManager.mjs";
import { HTTPCodes } from "./modules/httpConstants.mjs";

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

server.post("/content", async (req, res) => {
    try {
        const { title, text } = req.body;
        const addContent = await dbm.addContent(title, text);
        if (addContent.id){
            res.status(HTTPCodes.SuccesfullRespons.Ok).end();
        }else{
            res.status(HTTPCodes.ServerErrorRespons.InternalError).end();
        }
    } catch (error) {
        console.error('Error adding content:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to add content' });
    }
});

server.get("/content", async (req, res) => {
    try {
        const getContent = await dbm.getContent();
        if (getContent){
            res.status(HTTPCodes.SuccesfullRespons.Ok).json(getContent).end();
        }else{
            res.status(HTTPCodes.ServerErrorRespons.InternalError).end();
        }
    } catch (error) {
        console.error('Error adding content:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to add content' });
    }
});

server.delete("/content", async (req, res) => {
    try {
        let id = req.body.id;
        const response = await dbm.deleteContent(id);
        if (response){
            res.status(HTTPCodes.SuccesfullRespons.Ok).end();
        }else{
            res.status(HTTPCodes.ServerErrorRespons.InternalError).end();
        }
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to delete content' });
    }
});

server.put("/content", async (req, res) => {
    try {
        let {id,title,text} = req.body;
        const response = await dbm.updateContent(id,title,text);
        if (response){
            res.status(HTTPCodes.SuccesfullRespons.Ok).json(response).end();
        }else{
            res.status(HTTPCodes.ServerErrorRespons.InternalError).end();
        }
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to delete content' });
    }
});

server.get("/comments/:itemid", async (req, res) => {
    try {
        const getComments = await dbm.getComments(req.params.itemid);
        if (getComments){
            res.status(HTTPCodes.SuccesfullRespons.Ok).json(getComments).end();
        }else{
            res.status(HTTPCodes.ServerErrorRespons.InternalError).end();
        }
    } catch (error) {
        console.error('Error showing users:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to show users' });
    }
});

server.get("/myComments/:userid", async (req, res) => {
    try {
        const getMyComments = await dbm.getMyComments(req.params.userid);
        if (getMyComments){
            res.status(HTTPCodes.SuccesfullRespons.Ok).json(getMyComments).end();
        }else{
            res.status(HTTPCodes.ServerErrorRespons.InternalError).end();
        }
    } catch (error) {
        console.error('Error showing my comments:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to show my comments' });
    }
});

server.post("/comment", async (req, res) => {
    try {
        const {userid, itemid, comment} = req.body;
        const id = await dbm.addComment(userid, itemid, comment);
        if (id){
            res.status(HTTPCodes.SuccesfullRespons.Ok).end();
        }else{
            res.status(HTTPCodes.ServerErrorRespons.InternalError).end();
        }
    } catch (error) {
        console.error('Error adding content:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to add content' });
    }
});

server.delete("/comment", async (req, res) => {
    try {
        let id = req.body.id;
        const response = await dbm.deleteComment(id);
        if (response){
            res.status(HTTPCodes.SuccesfullRespons.Ok).end();
        }else{
            res.status(HTTPCodes.ServerErrorRespons.InternalError).end();
        }
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).json({ message: 'Failed to delete content' });
    }
});

// Start the server 
server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});