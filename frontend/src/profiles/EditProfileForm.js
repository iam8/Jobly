import React, {useState, useContext} from "react";
import { Alert, Button, Card, CardBody, Form, FormGroup, Label, Input } from "reactstrap";

import JoblyApi from "../api";
import UserContext from "../auth/UserContext";

import "./EditProfileForm.css";


/**
 * Route: /profile
 *
 * Form used to edit user profile. Initially fills form inputs with the current user profile data.
 *
 * Manages state updates on changes to the form inputs.
 *
 * On form submission, attempts to update user profile with new data and displays a success or
 * failure notification.
 */
function EditProfileForm() {
    const {currentUser, setCurrentUser} = useContext(UserContext);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState([]);

    const INIT_FORM = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email
    };

    const [formData, setFormData] = useState(INIT_FORM);

    /** Handle changes to inputs. */
    const handleChange = (evt) => {
        const {name, value} = evt.target;
        setSaveSuccess(false);
        setFormErrors([]);
        setFormData((formData) => ({
            ...formData,
            [name]: value
        }));
    }

    /**
     * Call API to save new user profile data. Return saved data if successful or undefined if
     * unsuccessful.
     */
    async function saveUserProfile(username, formData) {
        try {
            const savedData = await JoblyApi.saveUserProfile({username, ...formData});
            return savedData;
        } catch(err) {
            setSaveSuccess(false);
            setFormErrors(err);
            console.log("ERROR SAVING PROFILE:", err);
            return;
        }
    }

    /** Form submission - attempt to update user profile data and reset form inputs. */
    const handleSubmit = async (evt) => {
        evt.preventDefault();
        const savedUserData = await saveUserProfile(currentUser.username, formData);
        if (!savedUserData) {
            return;
        }

        setCurrentUser(savedUserData);
        setSaveSuccess(true);
        setFormErrors([]);

        if ("password" in formData) {
            setFormData(data => ({
                ...data,
                password: ""
            }));
        }
    }

    /** Show an alert message on success or failure to update profile. */
    const renderAlert = () => {
        if (saveSuccess) {
            return (
                <Alert color="success">
                    Save successful!
                </Alert>
            )
        }

        if (formErrors.length) {
            return (
                <Alert color="danger">
                    Could not update profile - {formErrors}
                </Alert>
            );
        }
    }

    return (
        <div className="EditProfileForm">
            <h2 className="EditProfileForm-heading">Edit Profile</h2>

            <Card className="EditProfileForm-card">
                <CardBody>
                    <Form className="EditProfileForm-form" onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                value={currentUser.username}
                                disabled
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

                        <Button color="primary" block>Save changes</Button>
                    </Form>
                </CardBody>
            </Card>
        </div>
    )
}


export default EditProfileForm;
