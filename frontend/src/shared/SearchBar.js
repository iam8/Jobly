import React, {useState} from "react";
import {Button, Form, Label, Input, Row, Col} from "reactstrap";

import "./SearchBar.css";


/**
 * Search bar. Used on /companies and /jobs pages to allow filtering.
 *
 * Calls the searchFor method (passed by parent), which performs the actual filtering.
 */
function SearchBar({searchFor}) {
    const [searchTerm, setSearchTerm] = useState("");

    /** Call searchFor() to perform the filtering. */
    const handleSubmit = (evt) => {
        evt.preventDefault();
        searchFor(searchTerm.trim() || undefined);
        setSearchTerm(searchTerm.trim());
    }

    /** Update search bar field. */
    const handleChange = (evt) => {
        setSearchTerm(evt.target.value);
    }

    return (
        <div className="SearchBar mb-4">
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col>
                        <Label
                            className="visually-hidden"
                            for="search-input"
                        >
                            Search
                        </Label>

                        <Input
                            id="search-input"
                            name="searchTerm"
                            placeholder="Enter a search term"
                            value={searchTerm}
                            onChange={handleChange}
                            bsSize="lg"
                        />
                    </Col>

                    <Col>
                        <Button type="submit" color="primary" size="lg">Search</Button>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}


export default SearchBar;
