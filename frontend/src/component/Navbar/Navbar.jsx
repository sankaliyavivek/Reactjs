import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


function Navbar() {

  // console.log("name",name);
  const navigate = useNavigate();
  const name = localStorage.getItem('username')
  const role = localStorage.getItem('role')

  const handellogout = async () => {
    const data = await axios.post('http://localhost:8000/user/logout',{},{withCredentials:true});
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('token');

    navigate('/');
    window.location.reload();
  }
  return (
    <div className='border '>

      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" >
            Navbar
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to={'/'} className='none nav-link'>
                    Home
               </Link>
              </li>

              <li>

                <Link to={'/alltask'} className='none nav-link'>
                  {/* <a className="nav-link active" aria-current="page" > */}
                    All Task
               </Link>
              </li>

              {
                role === 'admin' && (
                  <li className="nav-item">
                  <Link to={'/dashboard'} className='none nav-link '>
                    Dashboard
                  </Link>
                </li>
                )
              }

              {name ? (
                <>
                  <li className='bg-info btn none' onClick={handellogout}>
                    Logout
                  </li>
                  <li className='nav-item mx-2  d-flex justify-content-center align-items-center'>
                    <span>{role}</span>
                  </li>
                  <li className='nav-item d-flex justify-content-center align-items-center'>
                    <span>{name}</span>
                  </li>



                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to={'/register'} className='none nav-link'>  
                      Register
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={'/login'} className='none nav-link'>
                        Login
                    </Link>
                  </li>


                </>
              )}
              
            </ul>

          </div>
        </div>
      </nav>

    </div>
  )
}

export default Navbar

