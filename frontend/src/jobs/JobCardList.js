import React from "react";

import JobCard from "./JobCard";


/** Render a list of JobCard components. Each JobCard displays basic info about a job. */
function JobCardList({jobList}) {

    return (
        <div className="JobCardList">
            {jobList.map((job) => {
                return <div className="mb-3" key={job.id}>
                    <JobCard
                        id={job.id}
                        title={job.title}
                        salary={job.salary}
                        equity={job.equity}
                        companyName={job.companyName}
                    />
                </div>
            })}
        </div>
    )
}


export default JobCardList;
