"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");
const { JsonWebTokenError } = require("jsonwebtoken");

const u1Token = createToken({ username: "u1", isAdmin: true });
const u2Token = createToken({ username: "u2", isAdmin: false });

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await db.query("DELETE FROM jobs");

  await db.query("DELETE FROM applications");

  await Company.create(
    {
      handle: "c1",
      name: "C1",
      numEmployees: 1,
      description: "Desc1",
      logoUrl: "http://c1.img",
    });
  await Company.create(
    {
      handle: "c2",
      name: "C2",
      numEmployees: 2,
      description: "Desc2",
      logoUrl: "http://c2.img",
    });
  await Company.create(
    {
      handle: "c3",
      name: "C3",
      numEmployees: 3,
      description: "Desc3",
      logoUrl: "http://c3.img",
    });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: true,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
  const job1 = await Job.create({
    title: "j1",
    salary: 60000,
    equity: 0.05,
    companyHandle: 'c1'
  });
  const job2 = await Job.create({
    title: 'j2',
    salary: 80000,
    equity: 0.07,
    companyHandle: 'c2'
  });
  await User.apply('u1', job1.id);
  await User.apply('u2', job2.id);
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
  u1Token,
  u2Token,
  j1,
  j2
};
