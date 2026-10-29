import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { showError, showSuccess } from '../../../utils/notify';
import api, { BASE_URL } from '../../../api/api';
import noimage from '../../../../public/no_image2.jpg'

const CompanyEdit = () => {

    useEffect(() => {
            document.title = "Company Edit";
        }, []);

    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState({
        logo: null,
        name: '',
        email: "",
        phone: "",
        address: "",
        authorized_person: "",
        pan: ""

    });
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(false);

    useEffect(() => {
        getcompany();
    }, []);

    const getcompany = async () => {
        try {
            const result = await api.get(`/companys/${id}`)
            console.log(result);
            setCompany(result.data.company)
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
    }

    const handleInput = (e) => {
        const { name, files, value } = e.target;

        if (name === 'logo') {
            setPreviewImage(URL.createObjectURL(files[0]));
        }
        setCompany({ ...company, [name]: files?.length ? files[0] : value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();


        const formData = new FormData();
        Object.keys(company).forEach(key => {
            formData.append(key, company[key]);
        });

        try {
            formData.append("_method", "PUT");
            const result = await api.post(`/companys/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            showSuccess(result.data.message)
            navigate("/admin/company")

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
                            <Link to={`/admin/user`} className="theme-toggle-btn text-decoration-none" title="Cycle theme"><i class="bi bi-house-door"></i> Back To company</Link>
                        </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Update your company information</div>

                    </div>

                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" name='name' value={company.name} onChange={handleInput} className="form-control" placeholder="First name" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Logo</label>
                            <div className='d-flex justify-content-between align-items-center gap-4'>
                                <input type="file" name='logo' onChange={handleInput} className="form-control" placeholder="e.g. Alex Rivera" />
                                <div className="">

                                    {<img
                                        src={
                                            previewImage ||
                                            (company.logo
                                                ? `${BASE_URL}/uploads/company/${company.logo}`
                                                : {noimage})
                                        }
                                        alt="Fav" className="user-preview-image"
                                    />}



                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" name='email' value={company.email} onChange={handleInput} className="form-control" placeholder="your@email.com" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input type="text" name='phone' value={company.phone} onChange={handleInput} className="form-control" placeholder="Phone" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input type="text" name='address' value={company.address} onChange={handleInput} className="form-control" placeholder="Address" />
                        </div>
                    </div>

                    <div className="form-row">

                        <div className="form-group">
                            <label className="form-label">Authorized Person</label>
                            <input type="text" name='authorized_person' value={company.authorized_person} onChange={handleInput} className="form-control" placeholder="Authorized Person" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Pan No</label>
                            <input type="text" name='pan' value={company.pan} onChange={handleInput} className="form-control" id="profileEmail" placeholder="Pan no" />
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

export default CompanyEdit