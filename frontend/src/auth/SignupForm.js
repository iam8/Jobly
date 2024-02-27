import React, {useState} from "react";
import { useHistory } from "react-router-dom";
import { Alert, Button, Card, CardBody, Form, FormGroup, Label, Input } from "reactstrap";

import "./SignupForm.css";


/**
 * Route: /signup
 *
 * Form used to register a new user on the Jobly website.
 *
 * Manages state updates on changes to the form inputs.
 *
 * On successful sign up, calls signup (function prop) and redirects to / (home).
 *
 * On signup failure, displays alert and error message.
 */
function SignupForm({signup}) {
    const INIT_FORM = {
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        email: ""
    };

    const [formData, setFormData] = useState(INIT_FORM);
    const [formErrors, setFormErrors] = useState([]);
    const history = useHistory();

    /** Handle changes to inputs. */
    const handleChange = (evt) => {
        const {name, value} = evt.target;
        setFormErrors([]);
        setFormData((formData) => ({
            ...formData,
            [name]: value
        }));
    }

    /** Form submission - register user and redirect to homepage on success. */
    const handleSubmit = async (evt) => {
        evt.preventDefault();
        const result = await signup(formData);

        if (result.success) {
            history.push("/"); // Redirect to homepage
        } else {
            setFormErrors(result.err);
        }
    }

    /** Show an alert message on failure to sign up. */
    const renderAlert = () => {
        if (formErrors.length) {
            return (
                <Alert color="danger">
                    Sign up failed - {formErrors}
                </Alert>
            );
        }
    }

    return (
        <div className="SignupForm">
            <h2 className="SignupForm-heading">Sign Up</h2>

            <Card className="SignupForm-card">
                <CardBody>
                    <Form className="SignupForm-form" onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="first-name">First name</Label>
                            <Input
                                id="first-name"
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="last-name">Last name</Label>
                            <Input
                                id="last-name"
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </FormGroup>

                        {renderAlert()}

                        <Button color="primary" block>Submit</Button>
                    </Form>
                </CardBody>
            </Card>
        </div>
    )
}


export default SignupForm;
