import React, {useState, useEffect} from "react";
import { useParams, Redirect } from "react-router-dom";

import JoblyApi from "../api";
import JobCardList from "../jobs/JobCardList";
import "./Company.css";


/**
 * Route: /companies/:handle
 *
 * Display basic details about a company with a given handle, followed by a list of jobs at that
 * company.
 */
function Company() {
    const { handle } = useParams();
    const [companyData, setCompanyData] = useState(null);

    useEffect(() => {
        const getCompanyData = async () => {
            try {
                setCompanyData(await JoblyApi.getCompany(handle));
            } catch(err) {
                console.log("ERROR FETCHING COMPANY DATA:", err);
                setCompanyData({});
            }
        }

        getCompanyData();
    }, [handle]);

    if (!companyData) return <div>LOADING...</div>

    /** If no company with the given handle was found, redirect to homepage */
    if (!Object.keys(companyData).length) return <Redirect to="/" />

    return (
        <div className="Company pt-5 col-8 offset-2">
            <div className="Company-info">
                <h2>{companyData.name}</h2>
                <p>{companyData.description}</p>
            </div>

            <JobCardList jobList={companyData.jobs}/>
        </div>
    )
}


export default Company;
