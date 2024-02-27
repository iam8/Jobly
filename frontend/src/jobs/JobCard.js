import React, {useContext, useState, useEffect} from "react";
import {Button, Card, CardTitle, CardBody} from "reactstrap";

import UserContext from "../auth/UserContext";


/** Show basic information about a job. */
function JobCard({id, title, salary, equity, companyName}) {
    const {hasAppliedToJob, applyToJob} = useContext(UserContext);
    const [hasApplied, setHasApplied] = useState();

    useEffect(() => {

        /** Retrieve the application status of this JobCard. */
        setHasApplied(hasAppliedToJob(id));
    }, [id, hasAppliedToJob]);

    /** Apply for the job associated with this JobCard. */
    const handleApply = async () => {
        if (hasAppliedToJob(id)) return;

        await applyToJob(id);
        setHasApplied(true);
    }

    return (
        <div className="JobCard">
            <Card>
                <CardBody>
                    <CardTitle tag="h5">{title}</CardTitle>

                    {companyName !== undefined &&
                        <p className="text-muted">
                            {companyName}
                        </p>
                    }

                    {salary &&
                            <div><small>Salary: {salary}</small></div>
                    }

                    {equity !== null &&
                            <div><small>Equity: {equity}</small></div>
                    }

                    <Button
                        className="float-end"
                        color="danger"
                        onClick={handleApply}
                        disabled={hasApplied}
                    >
                        {hasApplied ? <span>Applied</span> : <span>Apply</span>}
                    </Button>
                </CardBody>
            </Card>
        </div>
    )
}


export default JobCard;
