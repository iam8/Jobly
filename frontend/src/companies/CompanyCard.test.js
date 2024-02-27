import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import CompanyCard from "./CompanyCard";


test("Renders without crashing", () => {
    render(
        <MemoryRouter>
            <CompanyCard
                handle="test-0"
                name="Test Company"
                description="Desc 0"
                logo_url="dummyUrl.jpg"
            />
        </MemoryRouter>
    )
})


test("Matches snapshot with image", () => {
    const { asFragment } = render(
        <MemoryRouter>
            <CompanyCard
                handle="test-0"
                name="Test Company"
                description="Desc 0"
                logoUrl="dummyUrl.jpg"
            />
        </MemoryRouter>,
    );

    expect(asFragment()).toMatchSnapshot();
});


test("matches snapshot without image", () => {
    const { asFragment } = render(
        <MemoryRouter>
            <CompanyCard
                handle="test-0"
                name="Test Company"
                description="Desc 0"
            />
        </MemoryRouter>,
    );

    expect(asFragment()).toMatchSnapshot();
});
