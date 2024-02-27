// Ioana A Mititean
// Unit 35 - Jobly

/** Tests for Company routes. */

"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const Company = require("../models/company");
const { NotFoundError } = require("../expressError");

const {
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


/************************************** POST /companies */

describe("POST /companies", function () {

    const newCompany = {
        handle: "new",
        name: "New",
        logoUrl: "http://new.img",
        description: "DescNew",
        numEmployees: 10,
    };

    test("ok for admins", async function () {
        const resp = await request(app)
            .post("/companies")
            .send(newCompany)
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            company: newCompany,
        });

        // Test that company was created
        const check = await Company.get("new");

        expect(check).toEqual({
            ...newCompany,
            jobs: []
        });
    });

    test("Returns unauthorized error (status 401) for logged-in non-admin users", async () => {
        expect.assertions(3);

        const resp = await request(app)
            .post("/companies")
            .send(newCompany)
            .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });

        // Test that company was not created
        try {
            await Company.get("new");
        } catch(err) {
            expect(err).toEqual(new NotFoundError("No company: new"));
        }
    })

    test("bad request with missing data", async function () {
        expect.assertions(2);

        const resp = await request(app)
            .post("/companies")
            .send({
                handle: "new",
                numEmployees: 10,
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(400);

        // Test that company was not created
        try {
            await Company.get("new");
        } catch(err) {
            expect(err).toEqual(new NotFoundError("No company: new"));
        }
    });

    test("bad request with invalid data", async function () {
        expect.assertions(2);

        const resp = await request(app)
            .post("/companies")
            .send({
                ...newCompany,
                logoUrl: "not-a-url",
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(400);

        // Test that company was not created
        try {
            await Company.get("new");
        } catch(err) {
            expect(err).toEqual(new NotFoundError("No company: new"));
        }
    });
});


/************************************** GET /companies */

describe("GET /companies", function () {

    test("ok for anon", async function () {
        const resp = await request(app).get("/companies");

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            companies:
            [
                {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img",
                },
                {
                    handle: "c2",
                    name: "C2",
                    description: "Desc2",
                    numEmployees: 2,
                    logoUrl: "http://c2.img",
                },
                {
                    handle: "c3",
                    name: "C3",
                    description: "Desc3",
                    numEmployees: 3,
                    logoUrl: "http://c3.img",
                },
            ],
        });
    });

    test("Returns error 400 response if filter minEmployees > maxEmployees", async () => {
        const response = await request(app)
            .get("/companies/?minEmployees=100&maxEmployees=99");

        expect(response.statusCode).toEqual(400);
        expect(response.body).toEqual({
            error: {
                status: 400,
                message: "maxEmployees must be greater than minEmployees"
            }
        });
    })

    test("Throws error 400 if any non-allowed filters are used", async () => {
        const response = await request(app)
            .get("/companies/?minEmployees=10&notAllowed1=40$notAllowed2=50");

        expect(response.statusCode).toEqual(400);
        expect(response.body).toEqual({
            error: {
                status: 400,
                message: "Filter not allowed: notAllowed1"
            }
        });
    })

    test("Responds with 200 OK and correctly-structured body for some filters used", async () => {
        const response = await request(app)
            .get("/companies/?minEmployees=10");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            companies: expect.any(Array)
        });
    })

    test("Responds with 200 OK and correctly-structured body for all filters used", async () => {
        const response = await request(app)
            .get("/companies/?maxEmployees=30&minEmployees=10&nameLike=SomeName");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            companies: expect.any(Array)
        });
    })

    test("fails: test next() handler", async function () {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE companies CASCADE");
        const resp = await request(app)
            .get("/companies")
            .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(500);
    });
});


/************************************** GET /companies/:handle */

describe("GET /companies/:handle", function () {

    test("works for anon", async function () {
        const resp = await request(app).get(`/companies/c1`);

        expect(resp.body).toEqual({
        company: {
            handle: "c1",
            name: "C1",
            description: "Desc1",
            numEmployees: 1,
            logoUrl: "http://c1.img",
            jobs: [
                {
                    id: expect.any(Number),
                    title: "job1",
                    salary: 100,
                    equity: "0.1",
                    companyHandle: "c1"
                },
                {
                    id: expect.any(Number),
                    title: "job4",
                    salary: 400,
                    equity: "0.4",
                    companyHandle: "c1"
                }
            ]
        },
        });
    });

    test("works for anon: company w/o jobs", async function () {
        const resp = await request(app).get(`/companies/c2`);

        expect(resp.body).toEqual({
            company: {
                handle: "c2",
                name: "C2",
                description: "Desc2",
                numEmployees: 2,
                logoUrl: "http://c2.img",
                jobs: []
            },
        });
    });

    test("not found or no such company", async function () {
        const resp = await request(app).get(`/companies/nope`);
        expect(resp.statusCode).toEqual(404);
    });
});


/************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {

    const originalC1 = {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
        jobs: expect.any(Array)
    }

    test("works for admins", async function () {

        const expectedData = {
            handle: "c1",
            name: "C1-new",
            description: "Desc1",
            numEmployees: 1,
            logoUrl: "http://c1.img",
        };

        const resp = await request(app)
            .patch(`/companies/c1`)
            .send({
                name: "C1-new",
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.body).toEqual({
            company: expectedData
        });

        // Check that company was updated
        const check = await Company.get("c1");

        expect(check).toEqual({
            ...expectedData,
            jobs: expect.any(Array)
        });
    });

    test("Returns unauthorized error (status 401) for logged-in non-admin users", async () => {
        const resp = await request(app)
            .patch("/companies/c1")
            .send({
                name: "C1-new",
            })
            .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });

        // Check that company was not updated
        const check = await Company.get("c1");

        expect(check).toEqual(originalC1);
    })

    test("unauth for anon", async function () {
        const resp = await request(app)
            .patch(`/companies/c1`)
            .send({
                name: "C1-new",
            });

        expect(resp.statusCode).toEqual(401);

        // Check that company was not updated
        const check = await Company.get("c1");

        expect(check).toEqual(originalC1);
    });

    test("not found or no such company", async function () {
        const resp = await request(app)
            .patch(`/companies/nope`)
            .send({
                name: "new nope",
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(404);
    });

    test("bad request on handle change attempt", async function () {
        const resp = await request(app)
            .patch(`/companies/c1`)
            .send({
                handle: "c1-new",
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(400);

        // Check that company was not updated
        const check = await Company.get("c1");

        expect(check).toEqual(originalC1);
    });

    test("bad request on invalid data", async function () {
        const resp = await request(app)
            .patch(`/companies/c1`)
            .send({
                logoUrl: "not-a-url",
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(400);

        // Check that company was not updated
        const check = await Company.get("c1");

        expect(check).toEqual(originalC1);
    });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {

    test("works for admins", async function () {
        expect.assertions(2);

        const resp = await request(app)
            .delete(`/companies/c1`)
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.body).toEqual({ deleted: "c1" });

        // Check that company was deleted
        try {
            await Company.get("c1");
        } catch(err) {
            expect(err).toEqual(new NotFoundError("No company: c1"));
        }
    });

    test("Returns unauthorized error (status 400) for logged-in non-admin users", async () => {
        const resp = await request(app)
            .delete("/companies/c1")
            .set("authorization", `Bearer ${u1Token}`);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });

        // Check that company was not deleted
        const check = await Company.get("c1");

        expect(check.handle).toEqual("c1");
    })

    test("unauth for anon", async function () {
        const resp = await request(app)
            .delete(`/companies/c1`);

        expect(resp.statusCode).toEqual(401);

        // Check that company was not deleted
        const check = await Company.get("c1");

        expect(check.handle).toEqual("c1");
    });

    test("not found for no such company", async function () {
        const resp = await request(app)
            .delete(`/companies/nope`)
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(404);
    });
});
