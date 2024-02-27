// Ioana A Mititean
// Unit 35 - Jobly

/**
 * Setup functions for Jobly model tests.
 */

const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");


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
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM users");

    await db.query(`
        INSERT INTO companies(handle, name, num_employees, description, logo_url)
        VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
            ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
            ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);

    const userInsert = await db.query(`
        INSERT INTO users(username,
                        password,
                        first_name,
                        last_name,
                        email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
            ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
        [
            await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
            await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
        ]
    );

    const uname1 = userInsert.rows[0].username;

    const jobInsert = await db.query(`
        INSERT INTO jobs
            (title, salary, equity, company_handle)
        VALUES
            ('job1', 100, 0.1, 'c1'),
            ('job2', 200, 0.2, 'c3'),
            ('job3', 300, 0.3, 'c3'),
            ('job4', 400, 0.4, 'c1'),
            ('job5', 500, 0.0, 'c3')
        RETURNING id`
    );

    const jobId1 = jobInsert.rows[0].id;
    const jobId2 = jobInsert.rows[1].id;
    const jobId3 = jobInsert.rows[2].id;

    await db.query(`
        INSERT INTO applications
            (username, job_id)
        VALUES
            ($1, $2),
            ($3, $4),
            ($5, $6)`,
        [uname1, jobId1, uname1, jobId2, uname1, jobId3]);
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


module.exports = {
    getJobId,
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
};
