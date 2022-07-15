"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary equity, companyHandle }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, ensureIsAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters:
 * - title
 * - minSalary - >= salary given
 * - hasEquity - boolean, if true shows only jobs with equity
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    try {
        let filters;
        if (req.query.title || req.query.minSalary || req.query.hasEquity) {
            filters = req.query;
        }
        const jobs = await Job.findAll(filters);
        return res.json({ jobs });
    } catch (err) {
        return next(err);
    }
});

/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, companyHandle }
 *  
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary >= 0, equity <= "1.0" }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login
 */

router.patch("/:id", ensureLoggedIn, ensureIsAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login
 */

router.delete("/:id", ensureLoggedIn, ensureIsAdmin, async function (req, res, next) {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;