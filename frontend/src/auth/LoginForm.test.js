import React from "react";
import { render } from "@testing-library/react";
import LoginForm from "./LoginForm";


test("Renders without crashing", () => {
    render(<LoginForm />);
})


test("Matches snapshot", () => {
    const { asFragment } = render(
        <LoginForm />
    );

    expect(asFragment()).toMatchSnapshot();
})
