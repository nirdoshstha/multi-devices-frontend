import React from 'react'

import { useAuth } from '../../context/AuthContext'

const Profile = () => {

    const { user } = useAuth();
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
                                {/* <img src="" alt="Student" className="img-fluid rounded-circle" style={{ width: "100px" }} /> */}
                                <h4 className="register-title">
                                    Name: {user?.name}
                                </h4>
                                <p>{user?.email}</p>
                                <p>{user?.created_at}</p>

                                <br />

                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}

export default Profile