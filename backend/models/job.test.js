// Ioana A Mititean
// Unit 35 - Express Jobly

/**
 * Tests for the Job model.
 */

"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const { Job } = require("./job.js");

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


// CREATE -----------------------------------------------------------------------------------------

describe("Testing create() method", () => {

    test("Functions correctly with appropriate input", async () => {
        const newJob = {
            title: "New Job 01",
            salary: 1000,
            equity: 1.0,
            companyHandle: "c1"
        };

        const resJob = await Job.create(newJob);
        expect(resJob).toEqual({
            id: expect.any(Number),
            title: "New Job 01",
            salary: 1000,
            equity: "1",
            companyHandle: "c1"
        });

        // Test insertion into database
        const qRes = await db.query(`
            SELECT title, salary, equity, company_handle
            FROM jobs
            WHERE title = 'New Job 01'`
        );

        expect(qRes.rows[0]).toEqual({
            title: "New Job 01",
            salary: 1000,
            equity: "1",
            company_handle: "c1"
        });
    })

    test("Throws BadRequestError for duplicate job input", async () => {
        expect.assertions(1);

        const newJob = {
            title: "job1",
            salary: 1000,
            equity: 1.0,
            companyHandle: "c1"
        };

        try {
            await Job.create(newJob);
        } catch(err) {
            expect(err).toEqual(new BadRequestError("Duplicate job: 'job1'"));
        }

    })

    test("Throws BadRequestError for a nonexistent company_handle", async () => {
        expect.assertions(1);

        const newJob = {
            title: "New Job 01",
            salary: 1000,
            equity: 1.0,
            companyHandle: "nonexistent"
        };

        try {
            await Job.create(newJob);
        } catch(err) {
            expect(err)
                .toEqual(new BadRequestError("Company handle doesn't exist: 'nonexistent'"));
        }
    })
})

//-------------------------------------------------------------------------------------------------


// FIND ALL ---------------------------------------------------------------------------------------

describe("Testing findAll() method", () => {

    test("Functions correctly with no filters", async () => {
        const jobs = await Job.findAll({});
        expect(jobs).toEqual([
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
            },
            {
                id: expect.any(Number),
                title: "job5",
                salary: 500,
                equity: "0.0",
                companyHandle: "c3"
            }
        ]);
    })

    test("Only title filter applied (upper and lower case)", async () => {
        const jobUpper = await Job.findAll({title: "JOB1"});
        const jobLower = await Job.findAll({title: "job1"});

        expect(jobUpper).toEqual(
            [
                {
                    id: expect.any(Number),
                    title: "job1",
                    salary: 100,
                    equity: "0.1",
                    companyHandle: "c1"
                }
            ]
        );

        expect(jobLower).toEqual(jobUpper);
    })

    test("Only minSalary filter applied", async () => {
        const jobs = await Job.findAll({minSalary: 250});

        expect(jobs).toEqual(
            [
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
                },
                {
                    id: expect.any(Number),
                    title: "job5",
                    salary: 500,
                    equity: "0.0",
                    companyHandle: "c3"
                }
            ]
        );
    })

    test("Only equity filter applied: set to true", async () => {
        const jobs = await Job.findAll({hasEquity: true});

        expect(jobs).toEqual([
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
        ]);
    })

    test("Only equity filter applied: set to false", async () => {
        const jobs = await Job.findAll({hasEquity: false});

        expect(jobs).toEqual([
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
            },
            {
                id: expect.any(Number),
                title: "job5",
                salary: 500,
                equity: "0.0",
                companyHandle: "c3"
            }
        ]);
    })

    test("minSalary and equity filters applied", async () => {
        const jobs = await Job.findAll({
            minSalary: 300,
            hasEquity: true
        });

        expect(jobs).toEqual(
            [
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
        );
    })

    test("All filters applied", async () => {
        const jobs = await Job.findAll({
            title: "job4",
            minSalary: 300,
            hasEquity: true
        });

        expect(jobs).toEqual(
            [
                {
                    id: expect.any(Number),
                    title: "job4",
                    salary: 400,
                    equity: "0.4",
                    companyHandle: "c1"
                }
            ]
        );
    })
})

//-------------------------------------------------------------------------------------------------


// GET --------------------------------------------------------------------------------------------

describe("Testing get() method", () => {

    test("Functions correctly with appropriate input", async () => {

        // Get ID of job 1 from database
        const jobId = await getJobId("job1");

        let job = await Job.get(jobId);

        expect(job).toEqual({
            id: jobId,
            title: "job1",
            salary: 100,
            equity: "0.1",
            companyHandle: "c1"
        });
    })

    test("Throws NotFoundError for a nonexistent job ID", async () => {
        expect.assertions(1);

        try {
            await Job.get(0);
        } catch(err) {
            expect(err).toEqual(new NotFoundError("Job not found: '0'"));
        }
    })
})

//-------------------------------------------------------------------------------------------------


// UPDATE -----------------------------------------------------------------------------------------

describe("Testing update() method", () => {

    const partialData = {
        salary: 99999,
        equity: 0.99999
    };

    const fullData = {
        title: "Updated Job Title",
        salary: 11111,
        equity: 0.11111
    };

    const notAllowedData = {
        id: 0,
        companyHandle: "c3"
    };

    test("Throws BadRequestError when given no input data", async () => {
        expect.assertions(2);

        // Get ID of job 1 from database
        const jobId = await getJobId("job1");

        const originalData = {
            id: jobId,
            title: "job1",
            salary: 100,
            equity: "0.1",
            companyHandle: "c1"
        };

        try {
            await Job.update(jobId, {});
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }

        // Check that entry was not modified in database
        const qRes = await db.query(`
            SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`,
            [jobId]
        );

        expect(qRes.rows[0]).toEqual(originalData);
    })

    test("Works correctly for partial update", async () => {

        // Get ID of job 1 from database
        const jobId = await getJobId("job1");

        const expectedData = {
            id: jobId,
            title: "job1",
            salary: 99999,
            equity: "0.99999",
            companyHandle: "c1"
        };

        let job = await Job.update(jobId, partialData);

        expect(job).toEqual(expectedData);

        // Check change in database
        const qRes = await db.query(`
            SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`,
            [jobId]
        );

        expect(qRes.rows[0]).toEqual(expectedData);
    })

    test("Works correctly for full update", async () => {

        // Get ID of job 1 from database
        const jobId = await getJobId("job1");

        const expectedData = {
            id: jobId,
            title: "Updated Job Title",
            salary: 11111,
            equity: "0.11111",
            companyHandle: "c1"
        };

        let job = await Job.update(jobId, fullData);

        expect(job).toEqual(expectedData);

        // Check change in database
        const qRes = await db.query(`
            SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`,
            [jobId]
        );

        expect(qRes.rows[0]).toEqual(expectedData);
    })

    test("Throws BadRequestError for non-allowed fields in data", async () => {
        expect.assertions(2);

        // Get ID of job 1 from database
        const jobId = await getJobId("job1");

        const originalData = {
            id: jobId,
            title: "job1",
            salary: 100,
            equity: "0.1",
            companyHandle: "c1"
        };

        try {
            await Job.update(jobId, notAllowedData);
        } catch(err) {
            expect(err).toEqual(new BadRequestError("Data field not allowed: 'id'"));
        }

        // Check that entry was not modified in database
        const qRes = await db.query(`
            SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`,
            [jobId]
        );

        expect(qRes.rows[0]).toEqual(originalData);
    })

    test("Throws NotFoundError for a nonexistent job ID", async () => {
        expect.assertions(1);

        try {
            await Job.update(0, fullData);
        } catch(err) {
            expect(err).toEqual(new NotFoundError("No job found: 0"));
        }
    })
})

//-------------------------------------------------------------------------------------------------


// REMOVE -----------------------------------------------------------------------------------------

describe("Testing remove() method", () => {

    test("Functions correctly with appropriate input", async () => {

        // Get ID of job 1 from database
        const jobId = await getJobId("job1");

        await Job.remove(jobId);

        // Test change in database
        const qRes = await db.query(`
            SELECT id FROM jobs
            WHERE id = $1`,
            [jobId]
        );

        expect(qRes.rows.length).toEqual(0);
    })

    test("Throws NotFoundError for a nonexistent job ID", async () => {
        expect.assertions(1);

        try {
            await Job.remove(0);
        } catch(err) {
            expect(err).toEqual(new NotFoundError("No job found: 0"));
        }
    })
})

//-------------------------------------------------------------------------------------------------
