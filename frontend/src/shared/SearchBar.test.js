import React from "react";
import { render } from "@testing-library/react";

import SearchBar from "./SearchBar";


test("Renders without crashing", () => {
    render(<SearchBar />);
})


test("Matches snapshot", () => {
    const { asFragment } = render(<SearchBar />);
    expect(asFragment()).toMatchSnapshot();
})
