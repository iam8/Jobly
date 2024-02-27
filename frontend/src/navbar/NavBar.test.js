import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import NavBar from "./NavBar";
import { DemoUserProvider as UserProvider } from "../testUtils";


test("Renders without crashing", () => {
    render(
        <MemoryRouter>
            <UserProvider>
                <NavBar />
            </UserProvider>
        </MemoryRouter>,
    );
});


test("Matches snapshot when logged in", () => {
    const { asFragment } = render(
        <MemoryRouter>
            <UserProvider>
                <NavBar />
            </UserProvider>
        </MemoryRouter>,
    );

    expect(asFragment()).toMatchSnapshot();
});


test("Matches snapshot when logged out", () => {
    const { asFragment } = render(
        <MemoryRouter>
            <UserProvider currentUser={null}>
                <NavBar />
            </UserProvider>
        </MemoryRouter>,
    );

    expect(asFragment()).toMatchSnapshot();
});
