// Ioana A Mititean
// Unit 35 - Jobly

/**
 * Start the Jobly app on the server with port and hostname defined in config file.
 */

"use strict";


const app = require("./app");
const { HOSTNAME, PORT } = require("./config");

app.listen(PORT, HOSTNAME, function () {
    console.log(`Started on http://${HOSTNAME}:${PORT}`);
});
