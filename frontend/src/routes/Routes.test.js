import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { DemoUserProvider as UserProvider } from "../testUtils";
import Routes from "./Routes";


test("Renders without crashing", () => {
    render (
        <MemoryRouter>
            <UserProvider>
                <Routes />
            </UserProvider>
        </MemoryRouter>
    );
})


test("Matches snapshot", () => {
    const { asFragment } = render(
        <MemoryRouter>
            <UserProvider>
                <Routes />
            </UserProvider>
        </MemoryRouter>,
    );

    expect(asFragment()).toMatchSnapshot();
});