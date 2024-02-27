// Ioana A Mititean
// Unit 35 - Express Jobly

/**
 * Tests for job routes.
 */

"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const { Job } = require("../models/job");
const { NotFoundError } = require("../expressError");

const {
    getJobId,
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token  // Admin token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const basicAuth = `Bearer ${u1Token}`;
const adminAuth = `Bearer ${u2Token}`;


// POST /jobs -------------------------------------------------------------------------------------

describe("POST /jobs", () => {

    const newJob = {
        title: "New Job 1",
        salary: 999,
        equity: 0.999,
        companyHandle: "c1"
    };

    test("Works for admins", async () => {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "New Job 1",
                salary: 999,
                equity: "0.999",
                companyHandle: "c1"
            }
        });

        // Check that job was created
        const jobId = resp.body.job.id;
        const check = await Job.get(jobId);

        expect(check).toEqual({
            id: jobId,
            ...newJob,
            equity: "0.999"
        });
    })

    test("Returns error with status 401 for a user that isn't logged in", async () => {

        // Get original number of jobs
        const origJobs = await Job.findAll({});
        const origNumJobs = origJobs.length;

        const resp = await request(app)
            .post("/jobs")
            .send(newJob);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });

        // Check that job wasn't created
        const check = await Job.findAll({});

        expect(check.length).toEqual(origNumJobs);
    })

    test("Returns error with status 401 for a logged-in, non-admin user", async () => {

        // Get original number of jobs
        const origJobs = await Job.findAll({});
        const origNumJobs = origJobs.length;

        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", basicAuth);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });

        // Check that job wasn't created
        const check = await Job.findAll({});

        expect(check.length).toEqual(origNumJobs);
    })

    test("Returns error with status 400 for request with missing data", async () => {

        // Get original number of jobs
        const origJobs = await Job.findAll({});
        const origNumJobs = origJobs.length;

        const missingData = {
            title: "New Job",
        };

        const resp = await request(app)
            .post("/jobs")
            .send(missingData)
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(400);
        expect(resp.body.error).toBeTruthy();

        // Check that job wasn't created
        const check = await Job.findAll({});

        expect(check.length).toEqual(origNumJobs);
    })

    test("Returns error with status 400 for request with invalid data", async () => {
        // Get original number of jobs
        const origJobs = await Job.findAll({});
        const origNumJobs = origJobs.length;

        const invalidData = {
            title: "New Job",
            salary: -100,
            equity: 1.111,
            companyHandle: "c1"
        };

        const resp = await request(app)
            .post("/jobs")
            .send(invalidData)
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(400);
        expect(resp.body.error).toBeTruthy();

        // Check that job wasn't created
        const check = await Job.findAll({});

        expect(check.length).toEqual(origNumJobs);
    })
})

//-------------------------------------------------------------------------------------------------


// GET /jobs --------------------------------------------------------------------------------------

describe("GET /jobs", () => {

    const noFiltersRes = {
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
                title: "job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c3"
            },
            {
                id: expect.any(Number),
                title: "job3",
                salary: 300,
                equity: "0.3",
                companyHandle: "c3"
            },
            {
                id: expect.any(Number),
                title: "job4",
                salary: 400,
                equity: "0.4",
                companyHandle: "c1"
            }
        ]
    }

    test("Works for a user that isn't logged in", async () => {
        const resp = await request(app).get("/jobs");

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(noFiltersRes);
    })

    test("Works for a logged-in, non-admin user", async () => {
        const resp = await request(app)
            .get("/jobs")
            .set("authorization", basicAuth);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(noFiltersRes);
    })

    test("Works for admins", async () => {
        const resp = await request(app)
            .get("/jobs")
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(noFiltersRes);
    })

    test("Responds with status 200 and correctly-structured body for some filters used",
    async () => {
        const resp = await request(app).get("/jobs/?minSalary=100&title=job3");

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            jobs: expect.any(Array)
        });
    })

    test("Responds with status 200 and correctly-structured body for all filters used",
    async () => {
        const resp = await request(app).get("/jobs/?minSalary=100&title=job3&hasEquity=true");

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            jobs: expect.any(Array)
        });
    })

    test("Returns error with status 400 if minSalary < 0", async () => {
        const resp = await request(app).get("/jobs/?minSalary=-3");

        expect(resp.statusCode).toEqual(400);
        expect(resp.body).toEqual({
            error: {
                status: 400,
                message: "minSalary must be >= 0"
            }
        });
    })

    test("Returns error with status 400 if non-allowed filters are used", async () => {
        const resp = await request(app).get("/jobs/?notAllowed=blah");

        expect(resp.statusCode).toEqual(400);
        expect(resp.body).toEqual({
            error: {
                status: 400,
                message: "Filter not allowed: notAllowed"
            }
        });
    })
})

//-------------------------------------------------------------------------------------------------


// GET /jobs/:id ----------------------------------------------------------------------------------

describe("GET /jobs/:id", () => {

    const jobRes = {
        job: {
            id: expect.any(Number),
            title: "job1",
            salary: 100,
            equity: "0.1",
            companyHandle: "c1"
        }
    };

    test("Works for a user that isn't logged in", async () => {

        // Grab ID of job1 from database
        const id = await getJobId("job1");

        const resp = await request(app)
            .get(`/jobs/${id}`);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(jobRes);
    })

    test("Works for a logged-in, non-admin user", async () => {

        // Grab ID of job1 from database
        const id = await getJobId("job1");

        const resp = await request(app)
            .get(`/jobs/${id}`)
            .set("authorization", basicAuth);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(jobRes);
    })

    test("Works for admins", async () => {

        // Grab ID of job1 from database
        const id = await getJobId("job1");

        const resp = await request(app)
            .get(`/jobs/${id}`)
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(jobRes);
    })

    test("Returns error with status 404 if job not found", async () => {
        const resp = await request(app)
            .get("/jobs/0");

        expect(resp.statusCode).toEqual(404);
        expect(resp.body).toEqual({
            error: {
                status: 404,
                message: "Job not found: '0'"
            }
        });
    })
})

//-------------------------------------------------------------------------------------------------


// PATCH /jobs/:id --------------------------------------------------------------------------------

describe("PATCH /jobs/:id", () => {

    const origData = {
        title: "job1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1"
    }

    const fullData = {
        title: "New Job Title",
        salary: 111,
        equity: 0.111
    };

    const partialData = {
        title: "New Job Title",
        equity: 0.111
    };

    test("Works for admins - full update", async () => {

        // Grab ID of job1 from database
        const id = await getJobId("job1");

        const newData = {
            id,
            title: "New Job Title",
            salary: 111,
            equity: "0.111",
            companyHandle: "c1"
        };

        const resp = await request(app)
            .patch(`/jobs/${id}`)
            .send(fullData)
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            job: newData
        });

        // Check that job was updated
        const check = await Job.get(id);

        expect(check).toEqual(newData);
    })

    test("Works for admins - partial update", async () => {

        // Grab ID of job1 from database
        const id = await getJobId("job1");

        const newData = {
            id,
            title: "New Job Title",
            salary: 100,
            equity: "0.111",
            companyHandle: "c1"
        }

        const resp = await request(app)
            .patch(`/jobs/${id}`)
            .send(partialData)
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            job: newData
        });

        // Check that job was updated
        const check = await Job.get(id);

        expect(check).toEqual(newData);
    })

    test("Returns error with status 400 for empty data input", async () => {

        // Grab ID of job1 from database
        const id = await getJobId("job1");

        const resp = await request(app)
            .patch(`/jobs/${id}`)
            .set("authorization", adminAuth)
            .send({});

        expect(resp.statusCode).toEqual(400);
        expect(resp.body).toEqual({
            error: {
                status: 400,
                message: "No data"
            }
        });

        // Check that job was not updated
        const check = await Job.get(id);

        expect(check).toEqual({
            id,
            ...origData
        });
    })

    test("Returns error with status 401 for a user that isn't logged in", async () => {

        // Grab ID of job1 from database
        const id = await getJobId("job1");

        const resp = await request(app)
            .patch(`/jobs/${id}`)
            .send(fullData);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized",
            }
        });

        // Check that job was not updated
        const check = await Job.get(id);

        expect(check).toEqual({
            id,
            ...origData
        });
    })

    test("Returns error with status 401 for a logged-in, non-admin user", async () => {

        // Grab ID of job1 from database
        const id = await getJobId("job1");

        const resp = await request(app)
            .patch(`/jobs/${id}`)
            .send(fullData)
            .set("authorization", basicAuth);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized",
            }
        });

        // Check that job was not updated
        const check = await Job.get(id);

        expect(check).toEqual({
            id,
            ...origData
        });
    })

    test("Returns error with status 400 for request with invalid data", async () => {

        // Grab ID of job1 from database
        const id = await getJobId("job1");

        const invalidData = {
            title: "New Job Title",
            salary: -200,
            equity: -0.1
        };

        const resp = await request(app)
            .patch(`/jobs/${id}`)
            .send(invalidData)
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(400);
        expect(resp.body.error).toBeTruthy();

        // Check that job was not updated
        const check = await Job.get(id);

        expect(check).toEqual({
            id,
            ...origData
        });
    })

    test("Returns error with status 400 for non-allowed field input", async () => {

        // Grab ID of job1 from database
        const id = await getJobId("job1");

        const notAllowedData = {
            title: "New Job Title",
            notAllowed: "random",
            notAllowed2: "random2",
            notAllowed3: "random3"
        };

        const resp = await request(app)
            .patch(`/jobs/${id}`)
            .send(notAllowedData)
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(400);
        expect(resp.body.error).toBeTruthy();

        // Check that job was not updated
        const check = await Job.get(id);

        expect(check).toEqual({
            id,
            ...origData
        });
    })

    test("Returns error with status 404 if job not found", async () => {
        const resp = await request(app)
            .patch("/jobs/0")
            .send(fullData)
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(404);
        expect(resp.body).toEqual({
            error: {
                status: 404,
                message: "No job found: 0",
            }
        });
    })
})

//-------------------------------------------------------------------------------------------------


// DELETE /jobs/:id -------------------------------------------------------------------------------

describe("DELETE /jobs/:id", () => {

    test("Works for admins", async () => {
        expect.assertions(3);

        // Grab ID of job1 from database
        const id = await getJobId("job1");

        const resp = await request(app)
            .delete(`/jobs/${id}`)
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            deleted: `${id}`
        });

        // Check that job was deleted
        try {
            await Job.get(id);
        } catch(err) {
            expect(err).toEqual(new NotFoundError(`Job not found: '${id}'`));
        }
    })

    test("Returns error with status 401 for a user that isn't logged in", async () => {

        // Grab ID of job1 from database
        const id = await getJobId("job1");

        const resp = await request(app)
            .delete(`/jobs/${id}`);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });

        // Check that job was not deleted
        const check = await Job.get(id);

        expect(check.title).toEqual("job1");
    })

    test("Returns error with status 401 for a logged-in, non-admin user", async () => {

        // Grab ID of job1 from database
        const id = await getJobId("job1");

        const resp = await request(app)
            .delete(`/jobs/${id}`)
            .set("authorization", basicAuth);

        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            error: {
                status: 401,
                message: "Unauthorized"
            }
        });

        // Check that job was not deleted
        const check = await Job.get(id);

        expect(check.title).toEqual("job1");
    })

    test("Returns error with status 404 if job not found", async () => {
        const resp = await request(app)
            .delete("/jobs/0")
            .set("authorization", adminAuth);

        expect(resp.statusCode).toEqual(404);
        expect(resp.body).toEqual({
            error: {
                status: 404,
                message: "No job found: 0"
            }
        });
    })
})

//-------------------------------------------------------------------------------------------------
