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

// write helper function to create WHERE string based on filters passed in.
// specifc to /companies with query strings name, minEmployees, maxEmployees may be present

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

module.exports = { sqlForPartialUpdate, sqlForCompanyFilters };
