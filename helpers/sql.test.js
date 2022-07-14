const { sqlForPartialUpdate, sqlForCompanyFilters } = require('./sql');

describe("Test sql helper", function () {

    test("Test sqlForPartialUpdate", function () {
        dataToUpdate = {
            firstName: 'Alyia',
            age: 32
        }
        jsToSql = {
            firstName: "first_name",
            lastName: "last_name",
            isAdmin: "is_admin",
        }
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

        expect(result.setCols).toEqual('"first_name"=$1, "age"=$2');
        expect(result.values).toEqual(['Alyia', 32]);
    });

    test("Test sqlForCompanyFilters", function () {
        let filters = {
            name: 'c2',
            minEmployees: 2,
            maxEmployees: 3
        }
        const result = sqlForCompanyFilters(filters);

        expect(result).toEqual("WHERE lower(name) LIKE lower('%c2%') AND num_employees >= 2 AND num_employees <= 3 ");
    });
});