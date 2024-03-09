import pg from "pg";
import SuperLogger from "./SuperLogger.mjs";


class DBManager {

    #credentials = {};

    constructor() {
        this.#credentials = {
            connectionString,
            ssl: (process.env.DB_SSL === "true") ? { rejectUnauthorized: false } : false
        };
    }

    async userRole(id, role){
        const client = new pg.Client(this.#credentials);

        try {
            await client.connect();
                const output = await client.query('INSERT INTO "public"."roles" ("userid", "role") VALUES($1, $2) RETURNING id;', [parseInt(id), role]);
        
                if (output.rowCount > 0) {
                    SuperLogger.log("User updated successfully", SuperLogger.LOGGING_LEVELS.INFO);
                } else {
                    SuperLogger.log("User update failed", SuperLogger.LOGGING_LEVELS.ERROR);
                }
            }
            catch(error) {
                console.error('Error updating user:', error);
                // TODO: Error handling?? Remember that this is a module separate from your server
                SuperLogger.log("Error updating user: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
                throw error; // Rethrow the error to handle it elsewhere
            } finally {
                client.end(); // Always disconnect from the database.
            }
            return role;
    }


    async updateUser(user) {
        const client = new pg.Client(this.#credentials);

        try {
            await client.connect();
            const output = await client.query('UPDATE "public"."users" SET "name" = $1, "email" = $2, "password" = $3 WHERE id = $4;', [user.name, user.email, user.pswHash, user.id]);

            // Client.Query returns an object of type pg.Result
            // Of special interest are the rows and rowCount properties of this object.

            // TODO: Did we update the user?
            if (output.rowCount > 0) {
                SuperLogger.log("User updated successfully", SuperLogger.LOGGING_LEVELS.INFO);
            } else {
                SuperLogger.log("User update failed", SuperLogger.LOGGING_LEVELS.ERROR);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            // TODO: Error handling?? Remember that this is a module separate from your server
            SuperLogger.log("Error updating user: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
            throw error; // Rethrow the error to handle it elsewhere
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return user;
    }

    async deleteUser(user) {
        const client = new pg.Client(this.#credentials);

        try {
            await client.connect();
            const output = await client.query('DELETE FROM "public"."users" WHERE id = $1;', [user.id]);

            // Client.Query returns an object of type pg.Result
            // Of special interest are the rows and rowCount properties of this object.

            // TODO: Did the user get deleted?
            if (output.rowCount > 0) {
                SuperLogger.log("User deleted successfully", SuperLogger.LOGGING_LEVELS.INFO);
            } else {
                SuperLogger.log("User deletion failed", SuperLogger.LOGGING_LEVELS.ERROR);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            // TODO: Error handling?? Remember that this is a module separate from your server
            SuperLogger.log("Error deleting user: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
            throw error; // Rethrow the error to handle it elsewhere
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return user;
    }

    async createUser(user) {
        const client = new pg.Client(this.#credentials);

        try {
            await client.connect();
            const output = await client.query('INSERT INTO "public"."users"("username", "email", "password") VALUES($1::Text, $2::Text, $3::Text) RETURNING userid;', [user.name, user.email, user.pswHash]);

            // Client.Query returns an object of type pg.Result
            // Of special interest are the rows and rowCount properties of this object.

            if (output.rows.length == 1) {
                // We stored the user in the DB.
                user.id = output.rows[0].userid;
               await this.userRole(user.id, "basic")
                SuperLogger.log("User created successfully", SuperLogger.LOGGING_LEVELS.INFO);
            }

        } catch (error) {
            console.error('Error creating user:', error);
            // TODO: Error handling?? Remember that this is a module separate from your server
            SuperLogger.log("Error creating user: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
            throw error; // Rethrow the error to handle it elsewhere
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return user;
    }

    async addContent(title, text) {
        console.log("halla")
        console.log(title)
        console.log(text)
        const client = new pg.Client(this.#credentials);
        let cont = {};
        try {
            await client.connect();
            const output = await client.query('INSERT INTO "public"."content"("title", "text") VALUES($1::Text, $2::Text) RETURNING id;', [title, text]);

            // Client.Query returns an object of type pg.Result
            // Of special interest are the rows and rowCount properties of this object.

            if (output.rows.length == 1) {
                // We stored the user in the DB.
               cont.id= output.rows[0].id;
                SuperLogger.log("User created successfully", SuperLogger.LOGGING_LEVELS.INFO);
            }

        } catch (error) {
            console.error('Error adding content:', error);
            // TODO: Error handling?? Remember that this is a module separate from your server
            SuperLogger.log("Error adding content: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
            throw error; // Rethrow the error to handle it elsewhere
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return cont;
    }
    
    async getUserRole(userid){
        const client = new pg.Client(connectionString);
        let role = null;
        try {
            await client.connect()
            const sql = "SELECT * FROM roles WHERE userid = $1";
            const params = [userid];

            const output = await client.query(sql, params);
            if(output && output.rows){
                if(output.rows.length === 1){
                    role = output.rows[0];
                }
            }

        } catch (error) {
            console.log(error)
        } finally {
            client.end(); // Always disconnect from the database.
        }
        return role;
    }

    async getUserFromEmail(email) {
        const client = new pg.Client(connectionString);
        let user = null;
        try {
            await client.connect();
            const sql = "SELECT * FROM users WHERE email = $1";
            const params = [email];

            const output = await client.query(sql, params);
            if(output && output.rows){
                if(output.rows.length === 1){
                    user = output.rows[0];
                }
            }

        } catch (error) {
            console.error('Error getting user:', error);
            // TODO: Error handling?? Remember that this is a module separate from your server
            SuperLogger.log("Error getting user: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
            throw error; // Rethrow the error to handle it elsewhere
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return user;
    }
}

let connectionString = process.env.DB_CONNECTIONSTRING_LOCAL;
if (process.env.ENVIORMENT != "local") {
    connectionString = process.env.DB_CONNECTIONSTRING_PROD;
}

if (connectionString == undefined) {
    throw ("You forgot the db connection string");
}

export default new DBManager();