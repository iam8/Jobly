// Ioana A Mititean
// Unit 35: Jobly

/**
 * Helpers for writing SQL queries.
 */

const { BadRequestError } = require("../expressError");


/**
 * Create and return an object containing a string of column names to update, and an array of
 * new values for those columns.
 *
 * Throw a BadRequestError if the given dataToUpdate contains no entries.
 *
 * Params:
 * - dataToUpdate (object) - data to update. Keys are column names to update, values are the new
 * values.
 * - jsToSql (object) - mapping of JS property names to their corresponding SQL column names.
 *
 * Returned object properties:
 * - setCols: prepared SQL statement for updating data, separated by commas (i.e. `"col1"=$1,
 * "col2"=$2, "col3"=$3`)
 * - values: array of new values in corresponding order (i.e. `[value1, value2, value3]`)
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0) throw new BadRequestError("No data");

    const cols = keys.map((colName, idx) =>
        `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    );

    return {
        setCols: cols.join(", "),
        values: Object.values(dataToUpdate),
    };
}


module.exports = {
    sqlForPartialUpdate
};
