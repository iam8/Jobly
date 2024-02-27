import React, {useState, useEffect} from "react";

import JoblyApi from "../api";
import SearchBar from "../shared/SearchBar";
import JobCardList from "./JobCardList";


/**
 * Route: /jobs
 *
 * Display page with list of jobs, filtered by job title entered in search bar.
 *
 * Displays all jobs if nothing is entered in search bar.
 */
function Jobs() {
    const [jobList, setJobList] = useState(null);

    useEffect(() => {

        /** Fetch jobs, filtered by job title entered in search bar. */
        const fetchJobsOnMount = async () => {
            await searchFor();
        }

        fetchJobsOnMount();
    }, []);

    /** Filter jobs by title entered in search bar and reload page. */
    const searchFor = async (title) => {
        try {
            const results = await JoblyApi.getJobs(title);
            setJobList(results);
        } catch(err) {
            console.log("ERROR RETRIEVING JOB(S):", err);
        }
    }

    if (!jobList) return <div>LOADING...</div>

    return (
        <div className="Jobs pt-5 col-8 offset-2">
            <SearchBar searchFor={searchFor}/>

            {jobList.length ? (
                <JobCardList jobList={jobList}/>
            ) : (
                <p>No results found!</p>
            )}

        </div>
    )
}


export default Jobs;
