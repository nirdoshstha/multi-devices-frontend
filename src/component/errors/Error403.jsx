import React from 'react'
import { Link, useNavigate } from 'react-router'

const Error403 = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className='background'>
        <div className="background-circle circle1" />
        <div className="background-circle circle2" />
        <div className="background-circle circle3" />
        <div className="container d-flex justify-content-center align-items-center">
          <div className="glass-card-403 text-center ">
            <div className="lock-icon">
              <i className="bi bi-shield-lock-fill" />
            </div>
            <h1 className="error-code">
              403
            </h1>
            <h2 className="title">
              Permission Denied
            </h2>
            <p className="description">
              Sorry! You don't have permission to access this page.
              {/* Please contact your administrator if you believe this is a mistake. */}
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">

              <Link to="/admin/dashboard" className="btn btn-home">
                <i className="bi bi-house-door-fill px-2"></i>
                Home
              </Link>

              <button
                className="btn btn-back"
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left-circle-fill px-2"></i>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Error403