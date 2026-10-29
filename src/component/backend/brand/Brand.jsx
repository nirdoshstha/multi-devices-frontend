import React, { useEffect, useState } from 'react'
import { PulseLoader } from 'react-spinners';
import { showError, showSuccess } from '../../../utils/notify';
import { Link } from 'react-router';
import confirmDelete from '../../../utils/confirmDelete';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/api';

const Brand = () => {

    useEffect(() => {
        document.title = "Brand";
    }, []);

    const { can } = useAuth();

    const [loading, setLoading] = useState(false);
    const [brand, setBrand] = useState({
        name: "",
        website: ""
    });
    const [brands, setBrands] = useState([]);

    const handleInput = (e) => {
        setBrand({ ...brand, [e.target.name]: e.target.value })
    }
    useEffect(() => {
        fetchDatas();
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);

        try {
            const result = await api.post(`/device-brand`, brand)
            showSuccess(result.data.message);
            fetchDatas();
            setBrand({
                name: "",
                website: ""
            });


        } catch (error) {
            showError(error.response.data.message)
        }
        finally {
            setLoading(false)
        }
    }

    const deleteBrand = async (id) => {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        setLoading(true);

        try {
            const result = await api.delete(`/device-brand/${id}`)
            showSuccess(result.data.message);
            fetchDatas();
        } catch (error) {
            showError(error.response.data.message);
            setLoading(false);
        }
        finally {
            setLoading(false);
        }
    }



    const fetchDatas = async (e) => {
        try {
            const result = await api.get(`/device-brand`)
            console.log(result);
            setBrands(result.data.brands)
        } catch (error) {
            showError(error.response.data.message);
        }
    }
    return (
        <div>
            <div className="admin-mgmt">
                <div className="admin-mgmt-grid">
                    {/* Create Admin Form */}
                    <div className="glass-card create-admin-card">
                        <div className="count-badge-row d-flex justify-content-between">
                            <button class="theme-toggle-btn" title="Cycle theme"><i className="bi bi-plus-circle" style={{ fontSize: "14px" }}></i> Create New Device Brand </button>
                            <div className="count-icon"><i className="bi bi-shield-person-fill" />  {brands?.length || 0}</div>
                        </div>


                        <form onSubmit={handleSubmit}  >
                            <div className="form-group">
                                <label className="form-label"> Brand Name</label>
                                <input type="text" name='name' value={brand?.name} onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. Alex Rivera" />
                            </div>

                            <div className="form-group">
                                <label className="form-label"> Brand Website</label>
                                <input type="text" name='website' value={brand?.website} onChange={handleInput} className="form-control" id="newAdminName" placeholder="www.example.com" />

                            </div>



                            {
                                can("device-brand.store") && (
                                    <button type='submit' className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                        {loading ? <PulseLoader
                                            color='white'
                                            loading={true}
                                            size={12}
                                        /> : ''}
                                        <i className="bi bi-person-plus-fill" /> Create brand Account
                                    </button>
                                )
                            }


                        </form>
                    </div>
                    {/* Admin List */}
                    <div className="glass-card-solid admin-list-card">
                        <div className="admin-table-header">
                            <div>
                                <div className="section-title" style={{ fontSize: 15 }}>Device Brands Accounts</div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>Manage existing administrator accounts</div>
                            </div>
                            <div className="search-box">
                                <i className="bi bi-search" />
                                <input type="text" className="form-control" id="adminSearch" placeholder="Search admins..." oninput="filterAdmins()" />
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table class="admin-table" id="adminTable">
                                <thead>
                                    <tr>
                                        <th>S.no</th>
                                        <th>Device Name</th>
                                        <th>Slug</th>
                                        <th>Website</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="adminTableBody">
                                    {
                                        brands.map((brand, index) => {
                                            return (
                                                <tr>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {brand.name}
                                                    </td>

                                                    <td>
                                                        {brand.slug}
                                                    </td>

                                                    <td>
                                                        {brand.website}
                                                    </td>

                                                    <td>
                                                        <div className="table-actions">

                                                            {
                                                                can("device-brand.update") && (
                                                                    <Link to={`/admin/device-brand/edit/${brand.id}`} className="btn-edit-sm" title="Edit" >
                                                                        <i className="bi bi-pencil"></i>
                                                                    </Link>
                                                                )
                                                            }


                                                            {
                                                                can("device-brand.destroy") && (
                                                                    <button className="btn-danger-sm" onClick={() => deleteBrand(brand.id)} title="Delete"><i className="bi bi-trash3" /></button>
                                                                )
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }


                                </tbody>
                            </table>
                        </div>
                        <div id="emptyState" style={{ display: 'none', textAlign: 'center', padding: 36, color: '#94A3B8' }}>
                            <i className="bi bi-person-x" style={{ fontSize: 36, marginBottom: 10, display: 'block' }} />
                            No admins found.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Brand