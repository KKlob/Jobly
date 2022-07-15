"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    j1,
    j2
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /jobs", function () {
    const newJob = {
        title: 'newJob',
        salary: 50000,
        equity: 0.005,
        companyHandle: 'c3'
    };

    test("ok for user w/ admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(201);
        newJob.id = expect.any(Number);
        newJob.equity = "0.005";
        expect(resp.body).toEqual({
            job: newJob,
        });
    });

    test("unauthorized for user w/o admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(401);
    });

    test("bad request with no data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({})
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid salary", async function () {
        newJob.salary = -500;
        const resp = await request(app)
            .post("/jobs")
            .send({
                ...newJob,
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid equity", async function () {
        newJob.equity = "1.2";
        const resp = await request(app)
            .post("/jobs")
            .send({ ...newJob })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** GET /companies */

describe("GET /jobs", function () {
    test("ok for anon", async function () {

        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs: [await j1(), await j2()]
        });
    });

    test("ok for filtering - all filters passed", async function () {
        const resp = await request(app).get("/jobs?title=j1&minSalary=40000&hasEquity=true");
        expect(resp.body).toEqual({
            jobs: [await j1()]
        });
    });

    test("ok for filtering - minSalary filter passed", async function () {
        const resp = await request(app).get("/jobs?minSalary=70000");
        expect(resp.body).toEqual({
            jobs: [await j2()]
        });
    });

    test("Bad request - invalid minSalary filter passed", async function () {
        const resp = await request(app).get("/jobs?minSalary=-500");
        expect(resp.statusCode).toEqual(400);
    });

    test("fails: test next() handler", async function () {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE jobs CASCADE");
        const resp = await request(app)
            .get("/jobs")
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(500);
    });
});

/************************************** GET /companies/:handle */

describe("GET /jobs/:id", function () {
    test("works for anon", async function () {
        const job1 = await j1();
        const resp = await request(app).get(`/jobs/${job1.id}`);
        expect(resp.body).toEqual({ job: job1 });
    });

    test("not found for no such job", async function () {
        const resp = await request(app).get(`/jobs/99999`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {
    test("works for users w/ admin", async function () {
        const job1 = await j1();
        const resp = await request(app)
            .patch(`/jobs/${job1.id}`)
            .send({
                title: "newJ1",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.body).toEqual({
            job: {
                id: job1.id,
                title: "newJ1",
                salary: 60000,
                equity: "0.05",
                companyHandle: 'c1'
            }
        });
    });

    test("unauth for user w/o admin", async function () {
        const job1 = await j1();

        const resp = await request(app)
            .patch(`/jobs/${job1.id}`)
            .send({
                name: "newJ1"
            })
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(401);
    })

    test("unauth for anon", async function () {
        const job1 = await j1();
        const resp = await request(app)
            .patch(`/jobs/${job1.id}`)
            .send({
                name: "newJ1",
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("not found on no such job", async function () {
        const resp = await request(app)
            .patch(`/jobs/999999`)
            .send({
                title: "new nope",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("bad request on id change attempt", async function () {
        const job1 = await j1();
        const resp = await request(app)
            .patch(`/jobs/${job1.id}`)
            .send({
                id: 9999
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on companyHandle change attempt", async function () {
        const job1 = await j1();
        const resp = await request(app)
            .patch(`/jobs/${job1.id}`)
            .send({
                companyHandle: 'c3'
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on invalid salary", async function () {
        const job1 = await j1();
        const resp = await request(app)
            .patch(`/jobs/${job1.id}`)
            .send({
                salary: -500
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on invalid equity", async function () {
        const job1 = await j1();
        const resp = await request(app)
            .patch(`/jobs/${job1.id}`)
            .send({
                equity: "1.2"
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:id", function () {
    test("works for users w/ admin", async function () {
        const job1 = await j1();
        const resp = await request(app)
            .delete(`/jobs/${job1.id}`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.body).toEqual({ deleted: String(job1.id) });
    });

    test("unauth for users w/o admin", async function () {
        const job1 = await j1();
        const resp = await request(app)
            .delete(`/jobs/${job1.id}`)
            .set("authorization", `Bearer ${u2Token}`);

        expect(resp.statusCode).toEqual(401);
    })

    test("unauth for anon", async function () {
        const job1 = await j1();
        const resp = await request(app)
            .delete(`/jobs/${job1.id}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such company", async function () {
        const resp = await request(app)
            .delete(`/jobs/99999`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(404);
    });
});
