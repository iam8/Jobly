import React from "react";
import { render } from "@testing-library/react";
import SignupForm from "./SignupForm";


test("Renders without crashing", () => {
    render(<SignupForm />);
})


test("Matches snapshot", () => {
    const { asFragment } = render(
        <SignupForm />
    );

    expect(asFragment()).toMatchSnapshot();
})