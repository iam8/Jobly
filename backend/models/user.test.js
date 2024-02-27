// Ioana A Mititean
// Unit 35 - Express Jobly

/**
 * Tests for the User model.
 */

"use strict";

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

const db = require("../db.js");
const User = require("./user.js");

const {
    getJobId,
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** authenticate */

describe("authenticate", function () {

    test("works", async function () {
        const user = await User.authenticate("u1", "password1");

        expect(user).toEqual({
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "u1@email.com",
            isAdmin: false,
        });
    });

    test("unauth if no such user", async function () {
        expect.assertions(1);

        try {
            await User.authenticate("nope", "password");
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("unauth if wrong password", async function () {
        expect.assertions(1);

        try {
            await User.authenticate("c1", "wrong");
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});


/************************************** register */

describe("register", function () {

    const newUser = {
        username: "new",
        firstName: "Test",
        lastName: "Tester",
        email: "test@test.com",
        isAdmin: false,
    };

  test("works", async function () {
        let user = await User.register({
            ...newUser,
            password: "password",
        });

        expect(user).toEqual(newUser);

        // Test insertion in database
        const found = await db.query("SELECT * FROM users WHERE username = 'new'");

        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].is_admin).toEqual(false);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("works: adds admin", async function () {
        let user = await User.register({
            ...newUser,
            password: "password",
            isAdmin: true,
        });

        expect(user).toEqual({ ...newUser, isAdmin: true });

        // Test insertion in database
        const found = await db.query("SELECT * FROM users WHERE username = 'new'");

        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].is_admin).toEqual(true);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("bad request with dup data", async function () {
        expect.assertions(1);

        try {
            await User.register({
                ...newUser,
                password: "password",
            });

            await User.register({
                ...newUser,
                password: "password",
            });
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


/************************************** findAll */

describe("findAll", function () {
    test("works", async function () {
        const users = await User.findAll();

        expect(users).toEqual([
        {
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "u1@email.com",
            isAdmin: false,
        },
        {
            username: "u2",
            firstName: "U2F",
            lastName: "U2L",
            email: "u2@email.com",
            isAdmin: false,
        },
        ]);
    });
});


/************************************** get */

describe("get", function () {

    test("Works for user with job applications", async function () {

        // Get job IDs from database
        const jobId1 = await getJobId("job1");
        const jobId2 = await getJobId("job2");
        const jobId3 = await getJobId("job3");

        let user = await User.get("u1");

        expect(user).toEqual({
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "u1@email.com",
            isAdmin: false,
            jobs: [jobId1, jobId2, jobId3]
        });
    });

    test("Works for user with no job applications", async () => {

        let user = await User.get("u2");

        expect(user).toEqual({
            username: "u2",
            firstName: "U2F",
            lastName: "U2L",
            email: "u2@email.com",
            isAdmin: false,
            jobs: []
        })
    })

    test("not found if no such user", async function () {
        expect.assertions(1);

        try {
            await User.get("nope");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});


/************************************** update */

describe("update", function () {

    const updateData = {
        firstName: "NewF",
        lastName: "NewF",
        email: "new@email.com",
        isAdmin: true,
    };

    test("works", async function () {
        let result = await User.update("u1", updateData);

        expect(result).toEqual({
            username: "u1",
            ...updateData,
        });

        // Test change in database
        const found = await db.query(`
            SELECT * FROM users
            WHERE username = $1`,
            ["u1"]
        );

        expect(found.rows.length).toEqual(1);
        expect(found.rows[0]).toEqual({
            username: "u1",
            first_name: "NewF",
            last_name: "NewF",
            email: "new@email.com",
            password: expect.any(String),
            is_admin: true
        });
    });

    test("works: set password", async function () {
        let result = await User.update("u1", {
            password: "new",
        });

        expect(result).toEqual({
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "u1@email.com",
            isAdmin: false,
        });

        // Test change in database
        const found = await db.query("SELECT * FROM users WHERE username = 'u1'");

        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("not found if no such user", async function () {
        expect.assertions(1);

        try {
            await User.update("nope", {
                firstName: "test",
            });
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request if no data", async function () {
        expect.assertions(1);

        try {
            await User.update("c1", {});
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        await User.remove("u1");

        // Test change in database
        const res = await db.query(
            "SELECT * FROM users WHERE username='u1'");

        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such user", async function () {
        expect.assertions(1);

        try {
            await User.remove("nope");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});


// APPLY FOR JOB ----------------------------------------------------------------------------------

describe("Applying for a job", () => {

    test("Works for appropriate inputs", async () => {

        // Grab ID of job5 from database
        const jobId = await getJobId("job5");

        const application = await User.applyForJob("u1", jobId);

        expect(application).toEqual({
            username: "u1",
            jobId
        });

        // Check that database is updated accordingly
        const appRes = await db.query(`
            SELECT username, job_id FROM applications
            WHERE username = $1 AND job_id = $2`,
            ["u1", jobId]
        );

        expect(appRes.rows.length).toEqual(1);
    })

    test("Returns error (status 400) for duplicate application", async () => {
        expect.assertions(1);

        const jobId = await getJobId("job1");

        try {
            await User.applyForJob("u1", jobId);
        } catch(err) {
            expect(err).toEqual(new BadRequestError(`Duplicate application: job ID ${jobId}`));
        }
    })

    test("Returns error (status 404) for a nonexistent username", async () => {
        expect.assertions(2);

        // Grab ID of job1 from database
        const jobId = await getJobId("job5");

        try {
            await User.applyForJob("nonexistent", jobId);
        } catch(err) {
            expect(err).toEqual(new NotFoundError("No user found: 'nonexistent'"));
        }

        // Check that application was not created
        const appRes = await db.query(`
            SELECT username, job_id FROM applications
            WHERE username = $1 AND job_id = $2`,
            ["nonexistent", jobId]
        );

        expect(appRes.rows.length).toEqual(0);
    })

    test("Returns error (status 404) for a nonexistent job ID", async () => {
        expect.assertions(2);

        try {
            await User.applyForJob("u1", 0);
        } catch(err) {
            expect(err).toEqual(new NotFoundError("No job found: '0'"));
        }

        // Check that application was not created
        const appRes = await db.query(`
            SELECT username, job_id FROM applications
            WHERE username = $1 AND job_id = $2`,
            ["nonexistent", 0]
        );

        expect(appRes.rows.length).toEqual(0);
    })
})

//-------------------------------------------------------------------------------------------------
