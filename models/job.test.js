"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require('./job');
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    j1,
    j2
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create a job", function () {
    let newJob = {
        title: 'newJob',
        salary: 50000,
        equity: "0.007",
        companyHandle: 'c3'
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job.title).toEqual("newJob");
        expect(job.salary).toEqual(50000);
        expect(job.equity).toEqual("0.007");

        const result = await db.query(
            `SELECT title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE title = 'newJob'`
        );
        expect(result.rows).toEqual([newJob]);
        console.log(result.rows[0]);
    });

    test("bad request with salary < 0 || equity > 1.0", async function () {
        newJob.salary = -500;
        try {
            await Job.create(newJob);
            fail();
        } catch (err) {
            expect(err).toBeTruthy();
        }

        newJob.salary = 50000;
        newJob.equity = 1.2;
        try {
            await Job.create(newJob);
            fail();
        } catch (err) {
            expect(err).toBeTruthy();
        }
    });
});

/************************************** findAll */

describe("findAll jobs", function () {
    test("works: no filter", async function () {
        const j1Res = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
                                FROM jobs
                                WHERE title = 'j1'`);

        const j2Res = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
                                    FROM jobs
                                    WHERE title = 'j2'`);

        let jobs = await Job.findAll();
        expect(jobs).toEqual([j1Res.rows[0], j2Res.rows[0]]);
    });

    test("works: filter for title, minSalary, hasEquity", async function () {
        const j1Res = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle" 
                                        FROM jobs
                                        WHERE title = 'j1'`);
        let filters = {
            title: 'j1',
            minSalary: 40000,
            hasEquity: true
        }

        let jobs = await Job.findAll(filters);
        expect(jobs).toEqual([j1Res.rows[0]]);
    });

    test("works: filter for minSalary", async function () {
        const j2Res = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle" 
                                        FROM jobs
                                        WHERE title = 'j2'`);

        let jobs = await Job.findAll({ minSalary: 70000 });
        expect(jobs).toEqual([j2Res.rows[0]]);
    });

    test("bad request - invalid minSalary", async function () {
        try {
            let jobs = await Job.findAll({ minSalary: -500 });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** get */

describe("get a job", function () {
    test("works", async function () {
        const jobRes = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE title = 'j1'`);

        const baseJob = jobRes.rows[0];

        let job = await Job.get(baseJob.id);
        expect(job).toEqual(baseJob);
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(9999999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("update a job", function () {
    const updateData = {
        title: 'newJ1',
        salary: 65000,
        equity: "0.06"
    };

    test("works", async function () {
        const jobRes = await db.query(`SELECT id, title, salary, equity, company_handle AS companyHandle FROM jobs WHERE title = 'j1'`);

        const baseJob = jobRes.rows[0];

        let job = await Job.update(baseJob.id, updateData);
        expect(job).not.toEqual(baseJob);
        expect(job).toEqual({
            id: baseJob.id,
            ...updateData,
            companyHandle: 'c1'
        });
    });

    test("works: null fields", async function () {
        const jobRes = await db.query(`SELECT id, title, salary, equity, company_handle AS companyHandle FROM jobs WHERE title = 'j1'`);

        const baseJob = jobRes.rows[0];

        const updateDataNulls = {
            title: 'newJ1',
            salary: null,
            equity: null
        }
        let job = await Job.update(baseJob.id, updateDataNulls);
        expect(job).not.toEqual(baseJob);
        expect(job).toEqual({
            id: baseJob.id,
            ...updateDataNulls,
            companyHandle: 'c1'
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.update(8734, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        try {
            await Job.update(1, {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove a job", function () {
    test("works", async function () {
        const jobRes = await db.query(`SELECT id, title, salary, equity, company_handle AS companyHandle FROM jobs WHERE title = 'j1'`);

        const baseJob = jobRes.rows[0];

        await Job.remove(baseJob.id);
        const res = await db.query(
            `SELECT title FROM jobs WHERE id=${baseJob.id}`);
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such company", async function () {
        try {
            await Job.remove(9712);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});