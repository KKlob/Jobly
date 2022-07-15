const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await db.query("DELETE FROM jobs");

  await db.query("DELETE FROM applications");

  await db.query(`
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
           ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
           ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);

  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email,
                          is_admin)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com', true),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com', false)
        RETURNING username, is_admin AS isAdmin`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]);

  await db.query(`
        INSERT INTO jobs(title, salary, equity, company_handle)
        VALUES ('j1', 60000, 0.05, 'c1'),
                ('j2', 80000, 0.07, 'c2')
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`);

  let j1Res = await db.query(`SELECT id FROM jobs WHERE title = 'j1'`);
  let job1 = j1Res.rows[0];

  let j2Res = await db.query(`SELECT id FROM jobs WHERE title = 'j2'`);
  let job2 = j2Res.rows[0];

  await db.query(`
        INSERT INTO applications(username, job_id)
        VALUES ('u1', ${job1.id}),
               ('u2', ${job2.id})`);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const j1 = async function () {
  const job = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
                              FROM jobs
                              WHERE title = 'j1'`);
  return job.rows[0];
}

const j2 = async function () {
  const job = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
                              FROM jobs
                              WHERE title = 'j2'`);
  return job.rows[0];
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  j1,
  j2
};