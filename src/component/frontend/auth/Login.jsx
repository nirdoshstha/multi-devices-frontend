import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import api from '../../../api/api'
import { showError, showSuccess } from '../../../utils/notify';
import { BounceLoader, ClipLoader, PulseLoader } from 'react-spinners';
import { useAuth } from '../../../context/AuthContext';
// import "../../../assets/frontend/css/loginstyle.css"
import "/src/assets/frontend/css/loginstyle.css";

const Login = () => {

    const { user, updateAuthState } = useAuth();

    const navigate = useNavigate();

    const [login, setLogin] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)

    const handleInput = (e) => {
        setLogin({ ...login, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)

        const data = {
            email: login.email,
            password: login.password
        }

        try {
            const result = await api.post('/login', data)

            if (result.data.status === 200) {
                showSuccess(result.data.message);
                updateAuthState(result.data.token, result.data.user);

                navigate("/admin/dashboard");
            }
            else {
                showError('You are not authorized to access this page');
                setLoading(false);
                return;
            }

        } catch (error) {
           
            if (error.response) {
                // Backend responded with an error (401, 422, 500, etc.)
                showError(error.response.data.message || "Something went wrong");
            } else if (error.request) {
                // Request was sent but no response received
                showError("Unable to connect to the server. Please make sure the backend is running.");
            } else {
                // Other errors
                showError(error.message || "An unexpected error occurred.");
            }

            setLoading(false);
        }

        finally {
            setLoading(false)
        }
    }







    return (
        <div className='bodytwo'>


            <section className="hero-section-login">
                <div className="glow glow1" />
                <div className="glow glow2" />
                <div className="container position-relative">
                    <div className="row align-items-center">
                        {/* Left Content */}
                        <div className="col-lg-6 fade-left">
                            <div className="hero-content-login">
                                <h1>
                                    One Platform Unlimited<span className="gradient-text px-2">
                                        Device Control.
                                    </span>
                                </h1>
                                <p>
                                    Simplify device administration with a secure, scalable solution built for modern organizations. Manage multiple devices, monitor system health, and optimize productivity with ease.
                                </p>
                                <div className="mt-4">
                                    <button className="btn btn-lg btn-light px-4">
                                        Explore More
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Register Form */}
                        <div className="col-lg-5 ms-auto fade-right">
                            <div className="glass-card-login register-card">
                                <h2 className="register-title">
                                    {
                                        loading ? <PulseLoader color='white' size={1} /> : ' Sign In'
                                    }
                                </h2>
                                <form onSubmit={handleSubmit}>

                                    <div className="mb-3">

                                        <input type="email" name='email' value={login.email} onChange={handleInput} className="form-control" placeholder="Email Address" autoComplete='off' />
                                        {/* <label htmlFor="loginEmail">Email</label> */}
                                        <span className="error-msg">Enter a valid email address.</span>
                                    </div>

                                    <div className="mb-3">
                                        <input type="password" name='password' value={login.password} onChange={handleInput} className="form-control" placeholder="Password" autoComplete='off' />
                                    </div>

                                    {/* <button className="btn btn-register w-100 text-white">
                                        Login Now
                                    </button> */}

                                    {
                                        !loading ? <button type="submit" className="btn btn-register">Log in</button>
                                            :
                                            <button type="button" className="btn btn-register">
                                                <PulseLoader
                                                    color='white'
                                                    loading={true}
                                                    size={12}
                                                />Log in</button>

                                    }
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


        </div >
    )
}

export default Login