// Ioana A Mititean
// Unit 35 - Jobly

/**
 * Tests for Company model.
 */

"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create", function () {

    const newCompany = {
        handle: "new",
        name: "New",
        description: "New Description",
        numEmployees: 1,
        logoUrl: "http://new.img",
    };

    test("works", async function () {
        let company = await Company.create(newCompany);

        expect(company).toEqual(newCompany);

        // Test change in database
        const result = await db.query(
            `SELECT handle, name, description, num_employees, logo_url
            FROM companies
            WHERE handle = 'new'`);

        expect(result.rows).toEqual([
            {
                handle: "new",
                name: "New",
                description: "New Description",
                num_employees: 1,
                logo_url: "http://new.img",
            },
        ]);
    });

    test("bad request with dupe", async function () {
        expect.assertions(1);

        try {
            await Company.create(newCompany);
            await Company.create(newCompany);
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


/************************************** findAll */

describe("findAll", function () {

    test("works: no filter", async function () {
        let companies = await Company.findAll({});
        expect(companies).toEqual([
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
        ]);
    });

    test("Works for only nameLike filter applied (upper and lower case)", async function () {
        let companiesLower = await Company.findAll({nameLike: "c1"});
        let companiesUpper = await Company.findAll({nameLike: "C1"});

        expect(companiesLower).toEqual([
            {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            }
        ]);

        expect(companiesLower).toEqual(companiesUpper);
    })

    test("Works for only minEmployees filter applied", async function () {
        let companies = await Company.findAll({minEmployees: 2});

        expect(companies).toEqual([
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
            }
        ]);
    })

    test("Works for only nameLike and minEmployees filters applied", async function () {
        let companies = await Company.findAll({nameLike: "c3", minEmployees: 2});

        expect(companies).toEqual([
            {
                handle: "c3",
                name: "C3",
                description: "Desc3",
                numEmployees: 3,
                logoUrl: "http://c3.img",
            }
        ]);
    })

    test("Works for all filters applied", async function () {
        let companies = await Company.findAll({nameLike: "c1", minEmployees: 1, maxEmployees: 3});

        expect(companies).toEqual([
            {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            }
        ]);
    })
});


/************************************** get */

describe("get", function () {

    test("works: company with associated jobs", async function () {
        let company = await Company.get("c1");

        expect(company).toEqual({
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
        });
    });

    test("Works: company with no associated jobs", async () => {
        let company = await Company.get("c2");

        expect(company).toEqual({
            handle: "c2",
            name: "C2",
            description: "Desc2",
            numEmployees: 2,
            logoUrl: "http://c2.img",
            jobs: []
        });
    })

    test("not found if no such company", async function () {
        expect.assertions(1);

        try {
            await Company.get("nope");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});


/************************************** update */

describe("update", function () {

    const updateData = {
        name: "New",
        description: "New Description",
        numEmployees: 10,
        logoUrl: "http://new.img",
    };

    test("works", async function () {
        let company = await Company.update("c1", updateData);

        expect(company).toEqual({
            handle: "c1",
            ...updateData,
        });

        // Test change in database
        const result = await db.query(
            `SELECT handle, name, description, num_employees, logo_url
            FROM companies
            WHERE handle = 'c1'`);

        expect(result.rows).toEqual([{
            handle: "c1",
            name: "New",
            description: "New Description",
            num_employees: 10,
            logo_url: "http://new.img",
        }]);
    });

    test("works: null fields", async function () {
        const updateDataSetNulls = {
            name: "New",
            description: "New Description",
            numEmployees: null,
            logoUrl: null,
        };

        let company = await Company.update("c1", updateDataSetNulls);

        expect(company).toEqual({
            handle: "c1",
            ...updateDataSetNulls,
        });

        // Test change in database
        const result = await db.query(
            `SELECT handle, name, description, num_employees, logo_url
            FROM companies
            WHERE handle = 'c1'`);

        expect(result.rows).toEqual([{
            handle: "c1",
            name: "New",
            description: "New Description",
            num_employees: null,
            logo_url: null,
        }]);
    });

    test("not found if no such company", async function () {
        expect.assertions(1);

        try {
            await Company.update("nope", updateData);
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        expect.assertions(1);

        try {
            await Company.update("c1", {});
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


/************************************** remove */

describe("remove", function () {

    test("works", async function () {
        await Company.remove("c1");

        // Test change in database
        const res = await db.query(
            "SELECT handle FROM companies WHERE handle='c1'");

        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such company", async function () {
        expect.assertions(1);

        try {
            await Company.remove("nope");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
