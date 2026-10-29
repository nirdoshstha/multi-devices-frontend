import React, { useEffect, useState } from 'react'
import { PulseLoader } from 'react-spinners';
import { useAuth } from '../../../context/AuthContext';
import { showError, showSuccess } from '../../../utils/notify';
import api from '../../../api/api';
import { Link } from 'react-router';
import confirmDelete from '../../../utils/confirmDelete';

const Designation = () => {

    useEffect(() => {
            document.title = "Designation";
        }, []);

    const { can } = useAuth();

    const [loading, setLoading] = useState(false);
    const [designation, setDesignation] = useState({
        name: "",
    });
    const [designations, setDesignations] = useState([]);

    const handleInput = (e) => {
        setDesignation({ ...designation, [e.target.name]: e.target.value })
    }
    useEffect(() => {
        fetchDatas();
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);

        try {
            const result = await api.post(`/designations`, designation)
            showSuccess(result.data.message);
            fetchDatas();
            setDesignation({
                name: "",
            });


        } catch (error) {
            showError(error.response.data.message)
        }
        finally {
            setLoading(false)
        }
    }

    const deleteDesignation = async (id) => {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        setLoading(true);

        try {
            const result = await api.delete(`/designations/${id}`)
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
            const result = await api.get(`/designations`)
            console.log(result);
            setDesignations(result.data.designations)
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
                            <button class="theme-toggle-btn" title="Cycle theme"><i className="bi bi-plus-circle" style={{ fontSize: "14px" }}></i> Create New Role </button>
                            <div className="count-icon"><i className="bi bi-shield-person-fill" />  {designations?.length || 0} </div>
                        </div>


                        <form onSubmit={handleSubmit}  >
                            <div className="form-group">
                                <label className="form-label"> Designation Name</label>
                                <input type="text" name='name' value={designation?.name} onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. Alex Rivera" />

                            </div>



                            {
                                can("designations.store") && (
                                    <button type='submit' className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                        {loading ? <PulseLoader
                                            color='white'
                                            loading={true}
                                            size={12}
                                        /> : ''}
                                        <i className="bi bi-person-plus-fill" /> Create Designation
                                    </button>
                                )
                            }


                        </form>
                    </div>
                    {/* Admin List */}
                    <div className="glass-card-solid admin-list-card">
                        <div className="admin-table-header">
                            <div>
                                <div className="section-title" style={{ fontSize: 15 }}>Designation Accounts</div>
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
                                        <th>Role</th>
                                        <th>Key</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="adminTableBody">
                                    {
                                        designations.map((designation, index) => {
                                            return (
                                                <tr>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {designation.name}
                                                    </td>

                                                    <td>
                                                        {designation.key}
                                                    </td>

                                                    <td>
                                                        <div className="table-actions">


                                                            {
                                                                can("designations.destroy") && (
                                                                    <button className="btn-danger-sm" onClick={() => deleteDesignation(designation.id)} title="Delete"><i className="bi bi-trash3" /></button>
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

export default Designation