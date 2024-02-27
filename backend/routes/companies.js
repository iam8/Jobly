// Ioana A Mititean
// Unit 35 - Jobly

/** Routes for companies. */

"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");


const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login, admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, companyNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const company = await Company.create(req.body);
        return res.status(201).json({ company });
    } catch (err) {
        return next(err);
    }
});


/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Throw error with status code 400 if minEmployees > maxEmployees or if a query param is provided
 * that is not in the above filter list.
 *
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
    try {
        const allowedFilters = ["nameLike", "minEmployees", "maxEmployees"];
        const filters = req.query;

        // Check for not-allowed filters
        for (let filter of Object.keys(filters)) {
            if (!allowedFilters.includes(filter)) {
                throw new BadRequestError(`Filter not allowed: ${filter}`);
            }
        }

        const {minEmployees, maxEmployees} = filters;

        // Check if minEmployees > maxEmployees
        if (minEmployees !== undefined && maxEmployees !== undefined) {
            if (+minEmployees > +maxEmployees) {
                throw new BadRequestError("maxEmployees must be greater than minEmployees");
            }
        }

        const companies = await Company.findAll(filters);
        return res.json({ companies });

    } catch (err) {
        return next(err);
    }
});


/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */
router.get("/:handle", async function (req, res, next) {
    try {
        const company = await Company.get(req.params.handle);
        return res.json({ company });
    } catch (err) {
        return next(err);
    }
});


/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login, admin
 */
router.patch("/:handle", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, companyUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const company = await Company.update(req.params.handle, req.body);
        return res.json({ company });
    } catch (err) {
        return next(err);
    }
});


/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login, admin
 */
router.delete("/:handle", ensureAdmin, async function (req, res, next) {
    try {
        await Company.remove(req.params.handle);
        return res.json({ deleted: req.params.handle });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
