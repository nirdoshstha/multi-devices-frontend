import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { showError, showSuccess } from '../../../utils/notify';
import api from '../../../api/api';

const BrandEdit = () => {

    useEffect(() => {
            document.title = "Brand Edit";
        }, []);

    const { id } = useParams();
    const navigate = useNavigate();

    const [brand, setBrand] = useState({
        name: "",
        website: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSpecificData();
    }, [])

    const getSpecificData = async () => {
        try {
            const result = await api.get(`/device-brand/${id}`)
            setBrand(result.data.brand);
            console.log(result)
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
    }


    const handleInput = (e) => {
        setBrand({ ...brand, [e.target.name]: e.target.value })

    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await api.put(`/device-brand/${id}`, brand)
            showSuccess(result.data.message);
            navigate("/admin/device-brand")
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
    }

    return (
        <div>
            <div className="glass-card-solid profile-right">
                <div style={{ marginBottom: 20 }}>
                    <div>
                        <div className="section-title" style={{ fontSize: 15 }}>Edit company<div className='float-end'>
                            <Link to={`/admin/device-brand`} className="theme-toggle-btn text-decoration-none" title="Cycle theme"><i class="bi bi-house-door"></i> Back To company</Link>
                        </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Update your company information</div>

                    </div>

                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Brand Name</label>
                            <input type="text" name='name' value={brand.name} onChange={handleInput} className="form-control" placeholder="First name" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Website</label>
                            <input type="text" name='website' value={brand.website} onChange={handleInput} className="form-control" placeholder="your@email.com" />
                        </div>

                    </div>





                    <div className="divider" />
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type='submit' className="btn-primary" onclick="saveProfile()">
                            <i className="bi bi-check2-circle" /> Save Changes
                        </button>

                    </div>
                </form>
            </div >
        </div>
    )
}

export default BrandEdit