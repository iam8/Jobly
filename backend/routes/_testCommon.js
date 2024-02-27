// Ioana A Mititean
// Unit 35 - Jobly

/**
 * Setup functions for Jobly route tests.
 */

"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const { Job } = require("../models/job");
const { createToken } = require("../helpers/tokens");


// HELPERS FOR TESTS ------------------------------------------------------------------------------

/**
 * Get the ID of the job with the given title from the database.
 *
 * Returns: job ID (integer)
 */
async function getJobId(jobTitle) {
    const idRes = await db.query(`
        SELECT id FROM jobs
        WHERE title = $1`,
        [jobTitle]
    );

    return idRes.rows[0].id;
}

//-------------------------------------------------------------------------------------------------


async function commonBeforeAll() {
    await db.query("DELETE FROM applications"); // Just in case
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM companies");

    await Company.create(
        {
            handle: "c1",
            name: "C1",
            numEmployees: 1,
            description: "Desc1",
            logoUrl: "http://c1.img",
        });

    await Company.create(
        {
            handle: "c2",
            name: "C2",
            numEmployees: 2,
            description: "Desc2",
            logoUrl: "http://c2.img",
        });

    await Company.create(
        {
            handle: "c3",
            name: "C3",
            numEmployees: 3,
            description: "Desc3",
            logoUrl: "http://c3.img",
        });

    await User.register({
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        password: "password1",
        isAdmin: false,
    });

    await User.register({
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "user2@user.com",
        password: "password2",
        isAdmin: true,
    });

    await User.register({
        username: "u3",
        firstName: "U3F",
        lastName: "U3L",
        email: "user3@user.com",
        password: "password3",
        isAdmin: false,
    });

    const job1 = await Job.create({
        title: "job1",
        salary: 100,
        equity: 0.1,
        companyHandle: "c1"
    });

    const job2 = await Job.create({
        title: "job2",
        salary: 200,
        equity: 0.2,
        companyHandle: "c3"
    });

    const job3 = await Job.create({
        title: "job3",
        salary: 300,
        equity: 0.3,
        companyHandle: "c3"
    });

    await Job.create({
        title: "job4",
        salary: 400,
        equity: 0.4,
        companyHandle: "c1"
    });

    // Add job applications
    await User.applyForJob("u1", job1.id);
    await User.applyForJob("u1", job2.id);
    await User.applyForJob("u2", job3.id);
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: true });


module.exports = {
    getJobId,
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token
};
