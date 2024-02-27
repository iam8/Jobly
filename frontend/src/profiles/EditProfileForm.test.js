import React from "react";
import { render } from "@testing-library/react";
import { DemoUserProvider as UserProvider } from "../testUtils";
import EditProfileForm from "./EditProfileForm";


test("Renders without crashing", () => {
    render (
        <UserProvider>
            <EditProfileForm />
        </UserProvider>
    );
})


test("Matches snapshot", () => {
    const { asFragment } = render(
        <UserProvider>
            <EditProfileForm />
        </UserProvider>
    );

    expect(asFragment()).toMatchSnapshot();
});