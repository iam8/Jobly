import React from "react";
import { render } from "@testing-library/react";
import { DemoUserProvider as UserProvider } from "../testUtils";
import JobCardList from "./JobCardList";


test("Renders without crashing", () => {
    render(
        <UserProvider>
            <JobCardList jobList={[]} />
        </UserProvider>
    );
})


test("Matches snapshot for no jobs", () => {
    const {asFragment} = render(
        <UserProvider>
            <JobCardList jobList={[]} />
        </UserProvider>
    );

    expect(asFragment()).toMatchSnapshot();
})


test("Matches snapshot for nonempty jobs list", () => {
    const list = [
        {
            id: 0,
            title: "Test title",
            salary: 100000,
            equity: 0,
            companyName: "Test Company"
        },
        {
            id: 1,
            title: "Test title 2",
            salary: 200000,
            equity: 1,
            companyName: "Test Company 2"
        },
    ];

    const {asFragment} = render(
        <UserProvider>
            <JobCardList jobList={list} />
        </UserProvider>
    );

    expect(asFragment()).toMatchSnapshot();
})