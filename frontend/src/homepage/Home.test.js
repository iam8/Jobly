import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Home from "./Home";
import { DemoUserProvider as UserProvider } from "../testUtils";


test("Renders without crashing", () => {
    render(
        <MemoryRouter>
            <UserProvider>
                <Home />
            </UserProvider>
        </MemoryRouter>,
    );
});


test("Matches snapshot when logged in", () => {
    const { asFragment } = render(
        <MemoryRouter>
            <UserProvider>
                <Home />
            </UserProvider>
        </MemoryRouter>,
    );

    expect(asFragment()).toMatchSnapshot();
});


test("Matches snapshot when logged out", () => {
    const { asFragment } = render(
        <MemoryRouter>
            <UserProvider currentUser={null}>
                <Home />
            </UserProvider>
        </MemoryRouter>,
    );

    expect(asFragment()).toMatchSnapshot();
});