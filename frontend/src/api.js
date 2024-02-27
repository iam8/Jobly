import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";


/** Jobly API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 */
class JoblyApi {
    static token;

    /** Send request to endpoint via Axios with (optional) data and method. */
    static async request(endpoint, data = {}, method = "get") {

        // Pass authorization token via request header.
        const url = `${BASE_URL}/${endpoint}`;
        const headers = { Authorization: `Bearer ${JoblyApi.token}` };
        const params = (method === "get")
            ? data
            : {};

        try {
            return (await axios({ url, method, data, params, headers })).data;
        } catch (err) {
            console.error("API Error:", err.response);
            let message = err.response.data.error.message;
            throw Array.isArray(message) ? message : [message];
        }
    }

    // Individual API routes ----------------------------------------------------------------------

    /** Register a new user and return their generated auth token. */
    static async signup({username, password, firstName, lastName, email}) {
        let res = await this.request("auth/register",
                                    {username, password, firstName, lastName, email},
                                    "post");
        return res.token;
    }

    /** Log in a user and return their auth token. */
    static async login({username, password}) {
        let res = await this.request("auth/token", {username, password}, "post");
        return res.token;
    }

    /** Get a user by username. */
    static async getCurrentUser(username) {
        let res = await this.request(`users/${username}`);
        return res.user;
    }

    /** Search for and return all companies with names like the given name. */
    static async getCompanies(name) {
        let res = await this.request("companies/", {name});
        return res.companies;
    }

    /** Get details on a company by handle. */
    static async getCompany(handle) {
        let res = await this.request(`companies/${handle}`);
        return res.company;
    }

    /** Search for and return all jobs with titles like the given title. */
    static async getJobs(title) {
        let res = await this.request("jobs/", {title});
        return res.jobs;
    }

    /** Apply to a job with the given jobId using the given username and return the job ID on
     * success. */
    static async applyToJob(username, jobId) {
        let res = await this.request(`users/${username}/jobs/${jobId}`, {}, "post");
        return res.applied;
    }

    /** Save edited user profile info. */
    static async saveUserProfile({username, password, firstName, lastName, email}) {
        let res = await this.request(`users/${username}`,
                                     {password, firstName, lastName, email},
                                     "patch");
        return res.user;
    }
}

// For now, put token ("testuser" / "password" on class)
JoblyApi.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZ" +
    "SI6InRlc3R1c2VyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTU5ODE1OTI1OX0." +
    "FtrMwBQwe6Ue-glIFgz_Nf8XxRT2YecFCiSpYL0fCXc";


export default JoblyApi;
