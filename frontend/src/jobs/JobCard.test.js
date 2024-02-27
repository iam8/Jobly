import React from "react";
import { render } from "@testing-library/react";
import { DemoUserProvider as UserProvider } from "../testUtils";
import JobCard from "./JobCard";


const testJob = {
    id: 0,
    title: "Test title",
    salary: 100000,
    equity: 0,
    companyName: "Test Company"
}


test("Renders without crashing", () => {
    render(
        <UserProvider>
            <JobCard
                id={testJob.id}
                title={testJob.title}
                salary={testJob.salary}
                equity={testJob.equity}
                companyName={testJob.companyName}
            />
        </UserProvider>
    );
})


test("Matches snapshot", () => {
    const {asFragment} = render(
        <UserProvider>
            <JobCard
                id={testJob.id}
                title={testJob.title}
                salary={testJob.salary}
                equity={testJob.equity}
                companyName={testJob.companyName}
            />
        </UserProvider>
    );

    expect(asFragment()).toMatchSnapshot();
})