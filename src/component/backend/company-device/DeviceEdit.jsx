import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { showError, showSuccess } from '../../../utils/notify';
import api from '../../../api/api';

const DeviceEdit = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const[brands, setBrands] = useState([]);
    const [device, setDevice] = useState({
        name: "",
        website: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSpecificData();
    }, [])

    const getSpecificData = async () => {
        try {
            const result = await api.get(`/devices/${id}`)
            setDevice(result.data.device);
            setBrands(result.data.brands)
            console.log(result)
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
    }


    const handleInput = (e) => {
        setDevice({ ...device, [e.target.name]: e.target.value })

    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await api.put(`/devices/${id}`, device)
            showSuccess(result.data.message);
            navigate("/admin/device")
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
                            <Link to={`/admin/device`} className="theme-toggle-btn text-decoration-none" title="Cycle theme"><i class="bi bi-house-door"></i> Back To company</Link>
                        </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Update your company information</div>

                    </div>

                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Device Name</label>
                            <input type="text" name='name' value={device.name} onChange={handleInput} className="form-control" placeholder="First name" />
                        </div>

                        <div className="form-group">
                            <label className="form-label"> Device Brand Name</label>
                            <select
                                name="device_brand_id"
                                className="form-select mb-3"
                                value={device.device_brand_id}
                                onChange={handleInput}
                            >
                                 
                                {brands.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
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

export default DeviceEdit