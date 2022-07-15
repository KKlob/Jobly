const { sqlForPartialUpdate, sqlForCompanyFilters, sqlForJobFilters } = require('./sql');

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

    test("Test sqlForJobFilters - All filters present", function () {
        let filters = {
            title: 'j1',
            minSalary: 40000,
            hasEquity: true
        }
        const result = sqlForJobFilters(filters);

        expect(result).toEqual(`WHERE lower(title) LIKE lower('%j1%') AND salary >= 40000 AND equity IS NOT NULL `);
    });

    test("Test sqlForJobFilters - some filters present", function () {
        let filters = {
            minSalary: 40000
        }
        const result = sqlForJobFilters(filters);

        expect(result).toEqual(`WHERE salary >= 40000 `);
    });
});