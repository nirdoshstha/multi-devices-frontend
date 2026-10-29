import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router';
import { showError, showSuccess } from '../../../utils/notify';
import api from '../../../api/api';
import { ClipLoader, PulseLoader } from "react-spinners";

const Register = () => {

    const navigate = useNavigate();

    const [register, setRegister] = useState({
        name: '',
        email: '',
        password: '',
        cpassword: ''
    });
    const [terms, setTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleInput = (e) => {
        setRegister({ ...register, [e.target.name]: e.target.value });
    }



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            name: register.name,
            email: register.email,
            password: register.password,
            cpassword: register.cpassword
        }

        if (register.password !== register.cpassword) {
            showError('Password and confirm password doesnot matched')
            setLoading(false);
            return;
        }

        if (!terms) {
            showError('You must agree the Terms & Conditions');
            setLoading(false);
            return;
        }

        try {
            const result = await api.post('/register', data)
            // console.log(result)
            if (result.data.status == 200) {
                showSuccess(result.data.message);
                navigate("/login");
            }
            else {
                showError("Something Went Wrong")
            }

        } catch (error) {
            // console.log(error)
            showError(error.response.data.message)

        } finally {
            setLoading(false);
        }
    }






    return (
        <div>

            <section className="hero-section">
                <div className="glow glow1" />
                <div className="glow glow2" />
                <div className="container position-relative">
                    <div className="row align-items-center">

                        {/* Register Form */}
                        <div className="col-lg-5 ms-auto fade-right">
                            <div className="glass-card register-card">
                                <h2 className="register-title">
                                    Create Account
                                </h2>
                                <form onSubmit={handleSubmit} autoComplete='off'>
                                    <div className="mb-3">
                                        <input type="text" name='name' value={register.name} onChange={handleInput} className="form-control" placeholder="Full Name" />
                                    </div>
                                    <div className="mb-3">
                                        <input type="email" name='email' value={register.email} onChange={handleInput} className="form-control" placeholder="Email Address" />
                                    </div>
                                    {/* <div className="mb-3">
                                        <input type="tel" className="form-control" placeholder="Phone Number" />
                                    </div> */}
                                    <div className="mb-3">
                                        <input type="password" name='password' value={register.password} onChange={handleInput} className="form-control" placeholder="Password" />
                                    </div>
                                    <div className="mb-4">
                                        <input type="password" name='cpassword' value={register.cpassword} onChange={handleInput} className="form-control" placeholder="Confirm Password" />
                                    </div>
                                    <div className="mb-4">
                                        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} name='terms' placeholder="Confirm Password" />
                                        <span> I agree to the Terms & Conditions.</span>
                                    </div>

                                    {
                                        !loading ?

                                            <button type='submit' className="btn btn-register w-100 text-white mt-4 py-3" style={{ marginTop: "20px" }}>
                                                Register Now
                                            </button>
                                            :
                                            <button type='button' className="btn btn-register w-100 text-white mt-4 py-3" style={{ marginTop: "20px" }}>
                                                <PulseLoader
                                                    color='white'
                                                    loading={true}
                                                    size={14}
                                                /> Register Now
                                            </button>
                                    }

                                </form>
                                <br />
                                <p>Already have an Account ? <Link to="/login" className='color:#ffffff;' style={{

                                    color: "#fe6937", textDecoration: "none"
                                }} >Login</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    )
}

export default Register