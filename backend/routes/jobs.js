// Ioana A Mititean
// Unit 35 - Express Jobly

/**
 * Routes for jobs.
 */

"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const { Job } = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * Job input should be { title, salary, equity, companyHandle }.
 *
 * Returns {job: {id, title, salary, equity, companyHandle} }.
 *
 * Authorization required: login, admin
 */
router.post("/", ensureAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch(err) {
        return next(err);
    }
})


/** GET /  => { jobs: [{ id, title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on the following search filters:
 * - title: by job title (case insensitive, partial matches)
 * - minSalary: jobs with at least that salary
 * - hasEquity:
 *      - If true, filter to jobs that provide a non-zero amount of equity
 *      - If false or not included in the filtering, list all jobs regardless of equity
 *
 * Throw error with status code 400 if minSalary < 0 or if a query param is provided
 * that is not in the above filter list.
 *
 * Authorization required: none
 */
router.get("/", async (req, res, next) => {
    try {
        const allowedFilters = ["title", "minSalary", "hasEquity"];
        const filters = req.query;

        // Check for non-allowed filters
        for (let filter of Object.keys(filters)) {
            if (!allowedFilters.includes(filter)) {
                throw new BadRequestError(`Filter not allowed: ${filter}`);
            }
        }

        const { minSalary } = filters;

        // Validate minSalary
        if (minSalary < 0) {
            throw new BadRequestError("minSalary must be >= 0");
        }

        const jobs = await Job.findAll(filters);
        return res.json({ jobs });

    } catch(err) {
        return next(err);
    }
})


/** GET /[id]  =>  { job }
 *
 * Returns: {job: { id, title, salary, equity, companyHandle }}.
 *
 * Throw error 404 if job not found.
 *
 * Authorization required: none
 */
router.get("/:id", async (req, res, next) => {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });

    } catch(err) {
        return next(err);
    }
})


/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches data for the job with the given ID.
 *
 * Field inputs include any or all of: { title, salary, equity }.
 *
 * Throw error (status 400) if attempting to modify any fields other than the above.
 * Throw error 404 if job not found.
 *
 * Returns {job: { id, title, salary, equity, companyHandle }} of the patched job.
 *
 * Authorization required: login, admin
 */
router.patch("/:id", ensureAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });

    } catch(err) {
        return next(err);
    }
})


/** DELETE /[id]  =>  { deleted: id }
 *
 * Throw error 404 if job not found.
 *
 * Authorization: login, admin
 */
router.delete("/:id", ensureAdmin, async (req, res, next) => {
    try {
        const id = req.params.id;
        await Job.remove(id);
        return res.json({ deleted: id });

    } catch(err) {
        return next(err);
    }
})


module.exports = {
    router
};
