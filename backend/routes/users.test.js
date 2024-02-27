// Ioana A Mititean
// Unit 35 - Express Jobly

/**
 * Tests for job routes.
 */

"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");
const { NotFoundError } = require("../expressError");

const {
    getJobId,
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const basicAuth = `Bearer ${u1Token}`;
const adminAuth = `Bearer ${u2Token}`;


/************************************** POST /users */

describe("POST /users", function () {

    const newDataNoAdmin = {
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-new",
        password: "password-new",
        email: "new@email.com",
        isAdmin: false
    };

    const expectedDataNoAdmin = {...newDataNoAdmin};
    delete expectedDataNoAdmin.password;

    test("works for admins: create non-admin", async function () {
        const resp = await request(app)
            .post("/users")
            .send(newDataNoAdmin)
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            user: expectedDataNoAdmin,
            token: expect.any(String),
        });

        // Check that user was created
        const check = await User.get(expectedDataNoAdmin.username);

        expect(check).toEqual({
            ...expectedDataNoAdmin,
            jobs: []
        });

    });

    test("works for admins: create admin", async function () {
        const resp = await request(app)
            .post("/users")
            .send({
                ...newDataNoAdmin,
                isAdmin: true
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            user: {
                ...expectedDataNoAdmin,
                isAdmin: true
            },
            token: expect.any(String),
        });

        // Check that user was created
        const check = await User.get(expectedDataNoAdmin.username);

        expect(check).toEqual({
            ...expectedDataNoAdmin,
            isAdmin: true,
            jobs: []
        });
    });

    test("unauth for anon", async function () {
        expect.assertions(2);

        const resp = await request(app)
            .post("/users")
            .send(newDataNoAdmin);

        expect(resp.statusCode).toEqual(401);

        // Check that user was not created
        try {
            await User.get(newDataNoAdmin.username);
        } catch(err) {
            expect(err).toEqual(new NotFoundError(`No user: ${newDataNoAdmin.username}`));
        }
    });

    test("Returns unauthorized error (status 401) for logged-in non-admin users", async () => {
        expect.assertions(3);

        const resp = await request(app)
            .post("/users")
            .send(newDataNoAdmin)
            .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });

        // Check that user was not created
        try {
            await User.get(newDataNoAdmin.username);
        } catch(err) {
            expect(err).toEqual(new NotFoundError(`No user: ${newDataNoAdmin.username}`));
        }
    })

    test("bad request if missing data", async function () {
        expect.assertions(2);

        const resp = await request(app)
            .post("/users")
            .send({
                username: "u-new",
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(400);

        // Check that user was not created
        try {
            await User.get(newDataNoAdmin.username);
        } catch(err) {
            expect(err).toEqual(new NotFoundError(`No user: ${newDataNoAdmin.username}`));
        }
    });

    test("bad request if invalid data", async function () {
        expect.assertions(2);

        const resp = await request(app)
            .post("/users")
            .send({
                ...newDataNoAdmin,
                isAdmin: true,
                email: "not-an-email"
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(400);

        // Check that user was not created
        try {
            await User.get(newDataNoAdmin.username);
        } catch(err) {
            expect(err).toEqual(new NotFoundError(`No user: ${newDataNoAdmin.username}`));
        }
    });
});


/************************************** GET /users */

describe("GET /users", function () {

    test("works for admins", async function () {

        const resp = await request(app)
            .get("/users")
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.body).toEqual({
            users: [
                {
                    username: "u1",
                    firstName: "U1F",
                    lastName: "U1L",
                    email: "user1@user.com",
                    isAdmin: false,
                },
                {
                    username: "u2",
                    firstName: "U2F",
                    lastName: "U2L",
                    email: "user2@user.com",
                    isAdmin: true,
                },
                {
                    username: "u3",
                    firstName: "U3F",
                    lastName: "U3L",
                    email: "user3@user.com",
                    isAdmin: false,
                },
            ],
        });
    });

    test("unauth for anon", async function () {
        const resp = await request(app)
            .get("/users");

        expect(resp.statusCode).toEqual(401);
    });

    test("Returns unauthorized error (status 401) for logged-in non-admin users", async () => {
        const resp = await request(app)
            .get("/users")
            .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });
    })
});


/************************************** GET /users/:username */

describe("GET /users/:username", function () {
    test("works for admins", async function () {
        const resp = await request(app)
            .get(`/users/u1`)
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
                jobs: [
                    expect.any(Number),
                    expect.any(Number)
                ]
            },
        });
    });

    test("Works for corresponding, non-admin user", async () => {
        const resp = await request(app)
            .get("/users/u1")
            .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
                jobs: [
                    expect.any(Number),
                    expect.any(Number)
                ]
            },
        });
    })

    test("Returns unauthorized (status 401) for a non-corresponding, non-admin user", async () => {
        const resp = await request(app)
            .get("/users/u2")
            .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });
    })

    test("unauth for anon", async function () {
        const resp = await request(app)
            .get(`/users/u1`);

        expect(resp.statusCode).toEqual(401);
    });

    test("Not found if user doesn't exist", async function () {
        const resp = await request(app)
            .get(`/users/nope`)
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(404);
    });
});


/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {

    const origDataU1 = {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
    }

    const origDataU2 = {
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "user2@user.com",
        isAdmin: true,
    }

    const expectedDataU1 = {
        username: "u1",
        firstName: "New",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
    }

    test("works for admins", async function () {
        const resp = await request(app)
            .patch(`/users/u1`)
            .send({
                firstName: "New",
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.body).toEqual({
            user: expectedDataU1,
        });

        // Check that user was updated
        const check = await User.get("u1");

        expect(check).toEqual({
            ...expectedDataU1,
            jobs: expect.any(Array)
        });
    });

    test("Works for corresponding, non-admin user", async () => {
        const resp = await request(app)
            .patch("/users/u1")
            .send({
                firstName: "New",
            })
            .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            user: expectedDataU1
        });

        // Check that user was updated
        const check = await User.get("u1");

        expect(check).toEqual({
            ...expectedDataU1,
            jobs: expect.any(Array)
        });
    })

    test("Returns unauthorized (status 401) for a non-corresponding, non-admin user", async () => {
        const resp = await request(app)
            .patch("/users/u2")
            .send({
                firstName: "New"
            })
            .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });

        // Check that user was not updated
        const check = await User.get("u2");

        expect(check).toEqual({
            ...origDataU2,
            jobs: expect.any(Array)
        });
    })

    test("unauth for anon", async function () {
        const resp = await request(app)
            .patch(`/users/u1`)
            .send({
                firstName: "New",
            });

        expect(resp.statusCode).toEqual(401);

        // Check that user was not updated
        const check = await User.get("u1");

        expect(check).toEqual({
            ...origDataU1,
            jobs: expect.any(Array)
        });
    });

    test("not found if no such user", async function () {
        const resp = await request(app)
            .patch(`/users/nope`)
            .send({
                firstName: "Nope",
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(404);
    });

    test("bad request if invalid data", async function () {
        const resp = await request(app)
            .patch(`/users/u1`)
            .send({
                firstName: 42,
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(400);

        // Check that user was not updated
        const check = await User.get("u1");

        expect(check).toEqual({
            ...origDataU1,
            jobs: expect.any(Array)
        });
    });

    test("works: set new password", async function () {
        const resp = await request(app)
            .patch(`/users/u1`)
            .send({
                password: "new-password",
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.body).toEqual({
            user: origDataU1,
        });

        const isSuccessful = await User.authenticate("u1", "new-password");
        expect(isSuccessful).toBeTruthy();
    });
});


/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {

    test("works for admins", async function () {
        expect.assertions(2);

        const resp = await request(app)
            .delete(`/users/u1`)
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.body).toEqual({ deleted: "u1" });

        // Check that user is deleted
        try {
            await User.get("u1");
        } catch(err) {
            expect(err).toEqual(new NotFoundError(`No user: u1`));
        }
    });

    test("Works for corresponding, non-admin user", async () => {
        expect.assertions(2);

        const resp = await request(app)
            .delete("/users/u1")
            .set("authorization", `Bearer ${u1Token}`);

        expect(resp.body).toEqual({ deleted: "u1" });

        // Check that user is deleted
        try {
            await User.get("u1");
        } catch(err) {
            expect(err).toEqual(new NotFoundError(`No user: u1`));
        }
    })

    test("Returns unauthorized (status 401) for a non-corresponding, non-admin user", async () => {
        const resp = await request(app)
            .delete("/users/u2")
            .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });

        // Check that user is not deleted
        const check = await User.get("u2");

        expect(check.username).toEqual("u2");
    })

    test("unauth for anon", async function () {
        const resp = await request(app)
            .delete(`/users/u1`);

        expect(resp.statusCode).toEqual(401);

        // Check that user is not deleted
        const check = await User.get("u1");

        expect(check.username).toEqual("u1");

    });

    test("not found if user missing", async function () {
        const resp = await request(app)
            .delete(`/users/nope`)
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(404);
    });
});


// POST /users/[username]/jobs/[id] ---------------------------------------------------------------

describe("POST /users/:username/jobs/:id", () => {

    test("Works for admins", async () => {

        // Grab ID of job1 from database
        const jobId = await getJobId("job3");

        const resp = await request(app)
            .post(`/users/u1/jobs/${jobId}`)
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            applied: jobId
        });
    })

    test("Works for logged-in, corresponding, non-admin user", async () => {

        // Grab ID of job3 from database
        const jobId = await getJobId("job3");

        const resp = await request(app)
            .post(`/users/u1/jobs/${jobId}`)
            .set("authorization", basicAuth);

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            applied: jobId
        });
    })

    test("Returns error with status code 401 for a logged-out user", async () => {

        // Grab ID of job1 from database
        const jobId = await getJobId("job3");

        const resp = await request(app)
            .post(`/users/u1/jobs/${jobId}`);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });
    })

    test("Returns error with status code 401 for a non-admin, non-corresponding user",
    async () => {

        // Grab ID of job1 from database
        const jobId = await getJobId("job1");

        const resp = await request(app)
            .post(`/users/u2/jobs/${jobId}`)
            .set("authorization", basicAuth);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });
    })

    test("Returns error with status code 404 for a nonexistent username", async () => {

        // Grab ID of job1 from database
        const jobId = await getJobId("job1");

        const resp = await request(app)
            .post(`/users/nonexistent/jobs/${jobId}`)
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(404);
        expect(resp.body).toEqual({
            error: {
                status: 404,
                message: "No user found: 'nonexistent'"
            }
        });
    })

    test("Returns error with status code 404 for a nonexistent job ID", async () => {

        const resp = await request(app)
            .post(`/users/u1/jobs/0`)
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(404);
        expect(resp.body).toEqual({
            error: {
                status: 404,
                message: "No job found: '0'"
            }
        });
    })
})

//-------------------------------------------------------------------------------------------------
