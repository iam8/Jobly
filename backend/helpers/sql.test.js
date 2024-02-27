// Ioana A Mititean
// Unit 35: Jobly

/**
 * Tests for SQL helper functions.
 */

const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");


describe("Tests for sqlForPartialUpdate()", () => {

    test("Throws BadRequestError for empty dataToUpdate object", () => {
        expect(() => {
            sqlForPartialUpdate({}, {})
        })
        .toThrow(BadRequestError);
    })

    test("Returns appropriate response for a non-empty dataToUpdate and empty jsToSql", () => {
        const data = {
            property1: "value1",
            property2: "value2",
            property3: "value3",
            extraProp: "extraVal"
        };

        const result = sqlForPartialUpdate(data, {});
        expect(result).toEqual({
            setCols: '"property1"=$1, "property2"=$2, "property3"=$3, "extraProp"=$4',
            values: ["value1", "value2", "value3", "extraVal"]
        });
    })

    test("Returns appropriate response for a non-empty dataToUpdate and non-empty jsToSql", () => {
        const data = {
            property1: "value1",
            property2: "value2",
            property3: "value3",
            extraProp: "extraVal"
        };

        const jsToSql = {
            "property1": "property_1",
            "property3": "property_3",
            "extraProp": "extra_prop"
        };

        const result = sqlForPartialUpdate(data, jsToSql);
        expect(result).toEqual({
            setCols: '"property_1"=$1, "property2"=$2, "property_3"=$3, "extra_prop"=$4',
            values: ["value1", "value2", "value3", "extraVal"]
        });
    })
})
