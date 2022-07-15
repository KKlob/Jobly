const { BadRequestError } = require("../expressError");

/** returns sql statements as a single string based on key names. Any key names from JSON not able to translate to db cols are provided via jsToSql object */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  // setCols will be a single string of valid sql based on keys of dataToUpdate
  // values will be an array of values to be passed into the db.query command later
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** returns WHERE sql statment as a single string for Company.findAll() */

function sqlForCompanyFilters(filters) {
  let nameStr = undefined;
  let minMaxStr = undefined;
  // for each expected key, if present, create a str vairable and prepare it's filter
  if (filters.name) {
    nameStr = `lower(name) LIKE lower('%${filters.name}%') `
  }
  if (filters.minEmployees && filters.maxEmployees) {
    if (filters.minEmployees > filters.maxEmployees) {
      throw new BadRequestError("minEmployees cannot be less than maxEmployees");
    }
    minMaxStr = `num_employees >= ${filters.minEmployees} AND num_employees <= ${filters.maxEmployees} `
  } else if (filters.minEmployees) {
    minMaxStr = `num_employees >= ${filters.minEmployees} `
  } else if (filters.maxEmployees) {
    minMaxStr = `num_employees <= ${filters.maxEmployees} `
  }

  // build complete WHERE statement and return it.
  let whereStr = "WHERE ";
  if (nameStr && minMaxStr) {
    whereStr += nameStr + "AND " + minMaxStr;
  } else if (nameStr) {
    whereStr += nameStr;
  } else if (minMaxStr) {
    whereStr += minMaxStr;
  }

  return (whereStr);
}

/** returns WHERE sql statment as a single string for Job.findAll() */

function sqlForJobFilters(filters) {
  let titleStr = undefined;
  let minSalStr = undefined;
  let equityStr = undefined;
  // for each expected key, if present, create a str variable and prepare it's filter
  if (filters.title) {
    titleStr = `lower(title) LIKE lower('%${filters.title}%') `;
  }
  if (filters.minSalary) {
    if (filters.minSalary < 0) {
      throw new BadRequestError("minSalary cannot be less than 0");
    }
    minSalStr = `salary >= ${filters.minSalary} `;
  }
  if (filters.hasEquity) {
    equityStr = `equity IS NOT NULL `;
  }

  // build complete WHERE statement and return it
  let whereStr = "WHERE ";
  let count = 0;
  [titleStr, minSalStr, equityStr].forEach((item, ind) => {
    if (item && ind - count == 0) {
      whereStr += item;
    } else if (item && ind > 0) {
      whereStr += "AND " + item;
    }
    if (!item) {
      count++;
    }
  });

  return whereStr;

}

module.exports = { sqlForPartialUpdate, sqlForCompanyFilters, sqlForJobFilters };
