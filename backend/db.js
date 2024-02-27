// Ioana A Mititean
// Unit 35 - Jobly

/** Database setup for jobly. */

"use strict";

const { Client } = require("pg");
const { getDatabaseUri } = require("./config");


let db;

if (process.env.NODE_ENV === "production") {
    db = new Client({
        connectionString: getDatabaseUri(),
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    db = new Client({
        connectionString: getDatabaseUri()
    });
}

db.connect();

module.exports = db;
