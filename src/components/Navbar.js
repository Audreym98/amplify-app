import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import { FaSnapchatGhost, FaHamburger } from 'react-icons/fa';

function Navbar() {

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/newPage">
                        Link to a page
                    </Link>
                    <br/>
                    <Link to="/snapchat" target="_blank" rel="noopener noreferrer">
                        <FaSnapchatGhost/>
                    </Link>
                    <br/>
                    <Link to="/burger" target="_blank" rel="noopener noreferrer">
                        <FaHamburger/>
                    </Link>
                </div>
            </nav>
        </>
    );
}

export default Navbar;
