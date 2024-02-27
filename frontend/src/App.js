import React, {useState, useEffect} from 'react';
import {BrowserRouter} from "react-router-dom";
import jwtDecode from 'jwt-decode';

import JoblyApi from './api';
import NavBar from './navbar/NavBar';
import Routes from './routes/Routes';
import UserContext from './auth/UserContext';
import useLocalStorage from './hooks/useLocalStorage';

// Key name for storing token in localStorage
export const TOKEN_STORAGE_KEY = "jobly-token";


/**
 * Jobly application.
 *
 * State:
 *  - isUserLoaded (bool): true if user data has been fetched via API, false otherwise
 *  - currentUser (object): data on current user; null if no current user exists
 *  - appliedJobsIds (set): IDs of jobs the user has pplied to
 *  - token (string): authentication token for current user; initially read from local storage
 *
 * Renders Routes component.
 */
function App() {
    const [isUserLoaded, setIsUserLoaded] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [appliedJobsIds, setAppliedJobsIds] = useState(new Set());
    const [token, setToken] = useLocalStorage(TOKEN_STORAGE_KEY);

    useEffect(() => {

        /** Fetch user data from API. */
        async function fetchCurrentUser() {
            if (token) {
                try {
                    const {username} = jwtDecode(token);
                    JoblyApi.token = token;
                    const user = await JoblyApi.getCurrentUser(username);
                    setCurrentUser(user);
                    setAppliedJobsIds(new Set(user.applications));
                } catch(err) {
                    console.log("ERROR FETCHING CURRENT USER:", err);
                    setCurrentUser(null);
                }
            }

            setIsUserLoaded(true);
        }

        setIsUserLoaded(false);
        fetchCurrentUser();

    }, [token]);


    /**
     * Register new user with given user data: {username, password, firstName, lastName, email}.
     *
     * Return {success: true} and log user in on success and {success: false, err} on error.
     */
    async function signup(userData) {
        try {
            const token = await JoblyApi.signup(userData);
            setToken(token);
            return {success: true};
        } catch(err) {
            console.log("ERROR SIGNING IN:", err);
            return {success: false, err};
        }
    }

    /**
     * Log in user with given user data: {username, password}.
     *
     * Return {success: true} on success and {success: false, err} on error.
     */
    async function login(userData) {
        try {
            const token = await JoblyApi.login(userData);
            setToken(token);
            return {success: true};
        } catch(err) {
            console.log("ERROR LOGGING IN:", err);
            return {success: false, err};
        }
    }

    /** Log current user out. */
    async function logout() {
        setCurrentUser(null);
        setToken(null);
    }

    /** Check if the current user has applied to the job with the given ID. */
    function hasAppliedToJob(id) {
        return appliedJobsIds.has(id);
    }

    /** Apply to a job and add job ID to set of applied job IDs on success. */
    async function applyToJob(id) {
        if (hasAppliedToJob(id)) return;

        try {
            await JoblyApi.applyToJob(currentUser.username, id);
            setAppliedJobsIds(new Set([...appliedJobsIds, id]));
        } catch(err) {
            console.log("ERROR APPLYING TO JOB:", err);
        }
    }

    if (!isUserLoaded) return <div>LOADING...</div>

    return (
        <div className="App">
            <BrowserRouter>
                <UserContext.Provider
                    value={{currentUser, setCurrentUser, hasAppliedToJob, applyToJob}}>

                    <NavBar logout={logout}/>
                    <Routes
                        login={login}
                        signup={signup}
                    />
                </UserContext.Provider>
            </BrowserRouter>
        </div>
    );
}

export default App;
