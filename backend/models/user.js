// Ioana A Mititean
// Unit 35 - Express Jobly

/**
 * User class.
 */

"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");


/** Related functions for users. */
class User {

    /** authenticate user with username, password.
     *
     * Returns { username, first_name, last_name, email, is_admin }
     *
     * Throws UnauthorizedError is user not found or wrong password.
     **/
    static async authenticate(username, password) {

        // try to find the user first
        const result = await db.query(
            `SELECT username,
                    password,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    is_admin AS "isAdmin"
            FROM users
            WHERE username = $1`,
            [username],
        );

        const user = result.rows[0];

        if (user) {

            // compare hashed password to a new hash from password
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true) {
                delete user.password;
                return user;
            }
        }

        throw new UnauthorizedError("Invalid username/password");
    }

    /** Register user with data.
     *
     * Returns { username, firstName, lastName, email, isAdmin }
     *
     * Throws BadRequestError on duplicates.
     **/
    static async register({ username, password, firstName, lastName, email, isAdmin }) {
        const duplicateCheck = await db.query(
            `SELECT username
            FROM users
            WHERE username = $1`,
            [username],
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `INSERT INTO users
            (username,
                password,
                first_name,
                last_name,
                email,
                is_admin)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
            [
                username,
                hashedPassword,
                firstName,
                lastName,
                email,
                isAdmin,
            ],
        );

        const user = result.rows[0];
        return user;
    }

    /** Find all users.
     *
     * Returns [{ username, first_name, last_name, email, is_admin }, ...]
     **/
    static async findAll() {
        const result = await db.query(
            `SELECT username,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    is_admin AS "isAdmin"
            FROM users
            ORDER BY username`,
        );

        return result.rows;
    }

    /** Given a username, return data about user.
     *
     * Returns { username, firstName, lastName, email, isAdmin, jobs }
     *   where jobs is [ jobId1, jobId2, ...]
     *
     * Throws NotFoundError if user not found.
     **/
    static async get(username) {
        const userRes = await db.query(
            `SELECT users.username,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    is_admin AS "isAdmin",
                    id
            FROM users
            LEFT JOIN applications
                ON users.username = applications.username
            LEFT JOIN jobs
                ON applications.job_id = jobs.id
            WHERE users.username = $1`,
            [username],
        );

        if (userRes.rows.length === 0) throw new NotFoundError(`No user: ${username}`);

        const { username: uname, firstName, lastName, email, isAdmin } = userRes.rows[0];
        const id = userRes.rows[0].id;

        // Handle cases: user with vs without applications
        let jobs = [];
        if (id !== null) {
            jobs = userRes.rows.map((row) => {
                return row.id;
            })
        }

        return { username: uname, firstName, lastName, email, isAdmin, jobs };
    }

    /** Update user data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * Data can include:
     *   { firstName, lastName, password, email, isAdmin }
     *
     * Returns { username, firstName, lastName, email, isAdmin }
     *
     * Throws NotFoundError if not found.
     *
     * WARNING: this function can set a new password or make a user an admin.
     * Callers of this function must be certain they have validated inputs to this
     * or a serious security risks are opened.
     */
    static async update(username, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                firstName: "first_name",
                lastName: "last_name",
                isAdmin: "is_admin",
            });

        const usernameVarIdx = "$" + (values.length + 1);
        const querySql = `UPDATE users
                        SET ${setCols}
                        WHERE username = ${usernameVarIdx}
                        RETURNING username,
                                    first_name AS "firstName",
                                    last_name AS "lastName",
                                    email,
                                    is_admin AS "isAdmin"`;
        const result = await db.query(querySql, [...values, username]);
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        delete user.password;
        return user;
    }

    /** Delete given user from database; returns undefined. */
    static async remove(username) {
        let result = await db.query(
            `DELETE
            FROM users
            WHERE username = $1
            RETURNING username`,
            [username],
        );
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);
    }

    /**
     * Apply for the job with the given ID.
     *
     * Return { username, jobId }, where:
     *  - 'username' is the username of the user applying for the job,
     *  - 'jobId' is the ID of the job being applied for.
     *
     * Throw error (status 400) for duplicate applications.
     *
     * Throw error (status 404) if no username with the given username exists.
     *
     * Throw error (status 404) if no job with the given ID exists.
     */
    static async applyForJob(username, jobId) {

        // Check for user existence
        const userRes = await db.query(`
            SELECT username FROM users
            WHERE username = $1`,
            [username]
        );

        if (userRes.rows[0] === undefined) {
            throw new NotFoundError(`No user found: '${username}'`);
        }

        // Check for job existence
        const jobRes = await db.query(`
            SELECT id FROM jobs
            WHERE id = $1`,
            [jobId]
        );

        if (jobRes.rows[0] === undefined) {
            throw new NotFoundError(`No job found: '${jobId}'`);
        }

        // Check for application existence
        const appRes = await db.query(`
            SELECT username FROM applications
            WHERE username = $1 AND job_id = $2`,
            [username, jobId]
        );

        if (appRes.rows.length !== 0) {
            throw new BadRequestError(`Duplicate application: job ID ${jobId}`);
        }

        // Insert entry into applications table
        const result = await db.query(`
            INSERT INTO applications
                (username, job_id)
            VALUES
                ($1, $2)
            RETURNING username, job_id AS "jobId"`,
            [username, jobId]
        );

        return result.rows[0];
    }
}


module.exports = User;
