import React, {useContext} from "react";
import { NavLink, Link } from "react-router-dom";
import { Navbar, Nav, NavItem } from "reactstrap";

import UserContext from "../auth/UserContext";
import "./NavBar.css";


/**
 * Render a navigation bar for the site. Appears at the top of every page.
 *  - When user is logged in: displays links to main pages of the site.
 *  - When user is logged out: displays links only to login and signup forms.
 *
 * Props:
 *  - logout(): log out the current user; passed by parent
 */
function NavBar({logout}) {
    const {currentUser} = useContext(UserContext);

    /** Logged-out appearance for navbar. */
    function loggedOutNavbar() {
        return (
            <>
                <NavItem>
                    <NavLink to="/signup">Sign up</NavLink>
                </NavItem>

                <NavItem>
                    <NavLink to="/login">Log in</NavLink>
                </NavItem>
            </>
        );
    }

    /** Logged-in appearance for navbar. */
    function loggedInNavbar() {
        return (
            <>
                <NavItem>
                    <NavLink to="/companies">Companies</NavLink>
                </NavItem>

                <NavItem>
                    <NavLink to="/jobs">Jobs</NavLink>
                </NavItem>

                <NavItem>
                    <NavLink to="/profile">Profile ({currentUser.username})</NavLink>
                </NavItem>

                <NavItem>
                    <Link to="/" onClick={logout}>Log out</Link>
                </NavItem>
            </>
        );
    }

    return (
        <div className="NavBar">
            <Navbar expand="md">
                <NavLink exact to="/" className="navbar-brand">
                    Jobly
                </NavLink>

                <Nav className="ml-auto">
                    {currentUser ? loggedInNavbar() : loggedOutNavbar()}
                </Nav>
            </Navbar>
        </div>
    )
}


export default NavBar;
