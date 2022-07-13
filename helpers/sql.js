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

module.exports = { sqlForPartialUpdate };
