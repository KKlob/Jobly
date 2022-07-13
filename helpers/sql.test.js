const { sqlForPartialUpdate } = require('./sql');

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

});