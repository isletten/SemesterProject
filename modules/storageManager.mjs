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
                SuperLogger.log("Error updating user: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
                throw error; // Rethrow the error to handle it elsewhere
            } finally {
                client.end(); // Always disconnect from the database.
            }
            return role;
    }

    async getUsers() {
        const client = new pg.Client(connectionString);
        let users = null;
        try {
            await client.connect();
            const sql = "SELECT userid, username, email FROM users";

            const output = await client.query(sql);
            if(output && output.rows){
                    users = output.rows;
            }

        } catch (error) {
            console.error('Error getting users:', error);
            SuperLogger.log("Error getting user: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
            throw error; // Rethrow the error to handle it elsewhere
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return users;
    }


    async updateUser(user) {
        const client = new pg.Client(this.#credentials);

        try {
            await client.connect();
            const output = await client.query('UPDATE "public"."users" SET "name" = $1, "email" = $2, "password" = $3 WHERE id = $4;', [user.name, user.email, user.pswHash, user.id]);

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

    async deleteUser(userid) {
        const client = new pg.Client(this.#credentials);

        try {
            await client.connect();
            const output1 = await client.query('DELETE FROM "public"."roles" WHERE userid = $1;', [userid]);
            const output2 = await client.query('DELETE FROM "public"."users" WHERE userid = $1;', [userid]);

            if (output1.rowCount>0 && output2.rowCount>0) {
                SuperLogger.log("User deleted successfully", SuperLogger.LOGGING_LEVELS.INFO);
            } else {
                SuperLogger.log("User deletion failed", SuperLogger.LOGGING_LEVELS.ERROR);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            SuperLogger.log("Error deleting user: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
            throw error; // Rethrow the error to handle it elsewhere
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return userid;
    }

    async createUser(user) {
        const client = new pg.Client(this.#credentials);

        try {
            await client.connect();
            const output = await client.query('INSERT INTO "public"."users"("username", "email", "password") VALUES($1::Text, $2::Text, $3::Text) RETURNING userid;', [user.name, user.email, user.pswHash]);

            if (output.rows.length == 1) {
                user.id = output.rows[0].userid;
               await this.userRole(user.id, "basic")
                SuperLogger.log("User created successfully", SuperLogger.LOGGING_LEVELS.INFO);
            }

        } catch (error) {
            console.error('Error creating user:', error);
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

            if (output.rows.length == 1) {
               cont.id= output.rows[0].id;
                SuperLogger.log("User created successfully", SuperLogger.LOGGING_LEVELS.INFO);
            }

        } catch (error) {
            console.error('Error adding content:', error);
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

    async getContent(){
        const client = new pg.Client(connectionString);
        let content = null;
        try {
            await client.connect()
            const sql = "SELECT * FROM content";

            const output = await client.query(sql);
            console.log(output)
            if(output && output.rows){
                    content = output.rows;
            }

        } catch (error) {
            console.log(error)
        } finally {
            client.end(); // Always disconnect from the database.
        }
        return content;
    }

    async deleteContent(id) {
        const client = new pg.Client(this.#credentials);

        try {
            await client.connect();
            const output = await client.query('DELETE FROM "public"."content" WHERE id = $1;', [id]);

            if (output.rowCount > 0) {
                SuperLogger.log("Content deleted successfully", SuperLogger.LOGGING_LEVELS.INFO);
            } else {
                SuperLogger.log("Content deletion failed", SuperLogger.LOGGING_LEVELS.ERROR);
            }
        } catch (error) {
            console.error('Error deleting Content:', error);
            SuperLogger.log("Error deleting Content: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
            throw error; // Rethrow the error to handle it elsewhere
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return id;
    }

    async updateContent(id, title, text) {
        const client = new pg.Client(this.#credentials);

        try {
            await client.connect();
            const output = await client.query('UPDATE "public"."content" SET "title" = $1, "text" = $2 WHERE id = $3;', [title, text, id]);

            if (output.rowCount > 0) {
                SuperLogger.log("Content updated successfully", SuperLogger.LOGGING_LEVELS.INFO);
            } else {
                SuperLogger.log("Content update failed", SuperLogger.LOGGING_LEVELS.ERROR);
            }
        } catch (error) {
            console.error('Error updating Content:', error);
            SuperLogger.log("Error updating Content: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
            throw error; // Rethrow the error to handle it elsewhere
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return {id, title, text};
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
            SuperLogger.log("Error getting user: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
            throw error; // Rethrow the error to handle it elsewhere
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return user;
    }


    async getComments(itemid){
        const client = new pg.Client(connectionString);
        let comments = [];
        try {
            await client.connect()
            const sql = "SELECT * FROM comments WHERE itemid = $1";
            const params = [itemid];

            const output = await client.query(sql, params);
            if(output && output.rows){
                    comments = output.rows;
            }

        } catch (error) {
            console.log(error)
        } finally {
            client.end(); // Always disconnect from the database.
        }
        return comments;
    }
    async getMyComments(userid){
        const client = new pg.Client(connectionString);
        let comments = [];
        try {
            await client.connect()
            const sql = "SELECT * FROM comments WHERE userid = $1";
            const params = [userid];

            const output = await client.query(sql, params);
            if(output && output.rows){
                    comments = output.rows;
            }

        } catch (error) {
            console.log(error)
        } finally {
            client.end(); // Always disconnect from the database.
        }
        return comments;
    }

    async addComment(userid, itemid, comment) {
        const client = new pg.Client(this.#credentials);
        let id = null;
        try {
            await client.connect();
            const output = await client.query('INSERT INTO "public"."comments"("userid", "itemid", "comment") VALUES($1, $2, $3::Text) RETURNING id;', [userid, itemid, comment]);

            if (output.rows.length == 1) {
                id = output.rows[0].id;
                SuperLogger.log("comment created successfully", SuperLogger.LOGGING_LEVELS.INFO);
            }

        } catch (error) {
            console.error('Error creating comment:', error);
            SuperLogger.log("Error creating comment: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
            throw error; // Rethrow the error to handle it elsewhere
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return id;
    }

    async deleteComment(id) {
        const client = new pg.Client(this.#credentials);

        try {
            await client.connect();
            const output = await client.query('DELETE FROM "public"."comments" WHERE id = $1;', [id]);

            if (output.rowCount > 0) {
                SuperLogger.log("comment deleted successfully", SuperLogger.LOGGING_LEVELS.INFO);
            } else {
                SuperLogger.log("comment deletion failed", SuperLogger.LOGGING_LEVELS.ERROR);
            }
        } catch (error) {
            console.error('Error deleting Content:', error);
            SuperLogger.log("Error deleting Content: " + error.message, SuperLogger.LOGGING_LEVELS.ERROR);
            throw error; // Rethrow the error to handle it elsewhere
        } finally {
            client.end(); // Always disconnect from the database.
        }

        return id;
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