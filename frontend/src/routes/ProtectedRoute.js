import React, {useContext} from "react";
import { Redirect } from "react-router-dom";

import UserContext from "../auth/UserContext";


/**
 * Wrapper component. Wrap this around components only meant to be viewed by users who are logged
 * in.
 *
 * Redirects to login page if a logged-out user tries to access the protected route.
 *
 * Created with guidance from this post: https://www.robinwieruch.de/react-router-private-routes/
 */
function ProtectedRoute({children}) {
    const {currentUser} = useContext(UserContext);

    if (!currentUser) return <Redirect to="/login" />

    return children;
}


export default ProtectedRoute;
