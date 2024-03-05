import pg from "pg";
import SuperLogger from "./SuperLogger.mjs";

// We are using an environment variable to get the db credentials
if (process.env.DB_CONNECTIONSTRING == undefined) {
    throw new Error("You forgot the db connection string");
}

class DBManager {

    #credentials = {};

    constructor(connectionString) {
        this.#credentials = {
            connectionString,
            ssl: (process.env.DB_SSL === "true") ? { rejectUnauthorized: false } : false
        };
    }

    async updateUser(user) {
        const client = new pg.Client(this.#credentials);

        try {
            await client.connect();
            const output = await client.query('UPDATE "public"."Users" SET "name" = $1, "email" = $2, "password" = $3 WHERE id = $4;', [user.name, user.email, user.pswHash, user.id]);

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
            const output = await client.query('DELETE FROM "public"."Users" WHERE id = $1;', [user.id]);

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
            const output = await client.query('INSERT INTO "public"."Users"("name", "email", "password") VALUES($1::Text, $2::Text, $3::Text) RETURNING id;', [user.name, user.email, user.pswHash]);

            // Client.Query returns an object of type pg.Result
            // Of special interest are the rows and rowCount properties of this object.

            if (output.rows.length == 1) {
                // We stored the user in the DB.
                user.id = output.rows[0].id;
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
}

export default new DBManager(process.env.DB_CONNECTIONSTRING);
