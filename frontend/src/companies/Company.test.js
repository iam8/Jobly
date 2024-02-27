import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router";

import {DemoUserProvider as UserProvider} from "../testUtils";
import Company from "./Company";


test("Renders without crashing", () => {
    render (
        <MemoryRouter>
            <UserProvider>
                <Company />
            </UserProvider>
        </MemoryRouter>
    );
})


test("Matches snapshot", () => {
    const {asFragment} = render(
        <MemoryRouter initialEntries={["/company/testCompany"]}>
            <UserProvider>
                <Route path="/company/:handle">
                    <Company />
                </Route>
            </UserProvider>
      </MemoryRouter>
    );

    expect(asFragment()).toMatchSnapshot();
})
