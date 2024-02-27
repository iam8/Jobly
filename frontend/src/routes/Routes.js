import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import Home from "../homepage/Home";
import LoginForm from "../auth/LoginForm";
import SignupForm from "../auth/SignupForm";
import Companies from "../companies/Companies";
import Company from "../companies/Company";
import Jobs from "../jobs/Jobs";
import EditProfileForm from "../profiles/EditProfileForm";
import ProtectedRoute from "./ProtectedRoute";


/**
 * All routes for Jobly website.
 *
 * Props:
 *  - login(): log in an existing user; passed by parent
 *  - signup(): register a new user; passed by parent
 *
 * Route list:
 *  - /companies/:handle
 *  - /companies
 *  - /jobs
 *  - /login
 *  - /signup
 *  - /profile
 *  - /
 *
 * Non-matching URLs will redirect to / (home).
 **/
function Routes({login, signup}) {

    return (
        <Switch>
            <Route exact path="/companies/:handle">
                <ProtectedRoute>
                    <Company />
                </ProtectedRoute>
            </Route>

            <Route exact path="/companies">
                <ProtectedRoute>
                    <Companies />
                </ProtectedRoute>
            </Route>

            <Route exact path="/jobs">
                <ProtectedRoute>
                    <Jobs />
                </ProtectedRoute>
            </Route>

            <Route exact path="/login">
                <LoginForm login={login}/>
            </Route>

            <Route exact path="/signup">
                <SignupForm signup={signup}/>
            </Route>

            <Route exact path="/profile">
                <ProtectedRoute>
                    <EditProfileForm />
                </ProtectedRoute>
            </Route>

            <Route exact path="/">
                <Home />
            </Route>

            <Redirect to="/" />
        </Switch>
    )
}


export default Routes;
