import React, { useEffect, useState } from 'react'
import { PulseLoader } from 'react-spinners';
import { showError, showSuccess } from '../../../utils/notify';
import { Link } from 'react-router';
import confirmDelete from '../../../utils/confirmDelete';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/api';
import Pagination from '../common/Pagination';

const Device = () => {


    useEffect(() => {
        document.title = "Devices";
    }, []);
    const { can } = useAuth();

    const [loading, setLoading] = useState(false);
    const [device, setDevice] = useState({});
    const [devices, setDevices] = useState([]);
    const [brands, setBrands] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalDevices, setTotalDevices] = useState(0);
    const perPage = 10;

    const handleInput = (e) => {
        setDevice({ ...device, [e.target.name]: e.target.value })
    }
    useEffect(() => {
        fetchDatas();
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);

        try {
            const result = await api.post(`/devices`, device)
            showSuccess(result.data.message);
            fetchDatas();
            setDevice({
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

    const deletedevice = async (id) => {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        setLoading(true);

        try {
            const result = await api.delete(`/devices/${id}`)
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



    const fetchDatas = async (page = 1) => {
        try {
            const result = await api.get(`/devices`, {
                params: { page, per_page: perPage },
            });
            setDevices(result.data.devices.data);
            setCurrentPage(result.data.devices.current_page);
            setLastPage(result.data.devices.last_page);
            setTotalDevices(result.data.devices.total);
            setBrands(result.data.device_brand)
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
                            <button class="theme-toggle-btn" title="Cycle theme"><i className="bi bi-plus-circle" style={{ fontSize: "14px" }}></i> Create New Device device </button>
                            <div className="count-icon"><i className="bi bi-shield-person-fill" />  {totalDevices || 0}</div>
                        </div>


                        <form onSubmit={handleSubmit}  >
                            <div className="form-group">
                                <label className="form-label"> Device Name</label>
                                <input type="text" name='name' value={device?.name} onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. Alex Rivera" />
                            </div>

                            <div className="form-group">
                                <label className="form-label"> Device Brand Name</label>
                                <select
                                    name="device_brand_id"
                                    className="form-select mb-3"
                                    value={device.device_brand_id}
                                    onChange={handleInput}
                                >
                                    <option value="">Please select Brand</option>
                                    {brands.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label"> Device Type</label>
                                <input type="text" name='type' value={device?.type} onChange={handleInput} className="form-control" id="newAdminName" placeholder="www.example.com" />

                            </div>



                            {
                                can("devices.store") && (
                                    <button type='submit' className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                        {loading ? <PulseLoader
                                            color='white'
                                            loading={true}
                                            size={12}
                                        /> : ''}
                                        <i className="bi bi-person-plus-fill" /> Create device Account
                                    </button>
                                )
                            }


                        </form>
                    </div>
                    {/* Admin List */}
                    <div className="glass-card-solid admin-list-card">
                        <div className="admin-table-header">
                            <div>
                                <div className="section-title" style={{ fontSize: 15 }}>Device Accounts</div>
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
                                        <th>Name</th>
                                        <th>Device Brand</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="adminTableBody">
                                    {
                                        devices.length === 0 ? (
                                            <tr><td colSpan={6} className="text-danger text-center"><p>No Data Found !!</p></td></tr>
                                        ) : devices.map((device, index) => {
                                            return (
                                                <tr key={device.id}>
                                                    <td>{(currentPage - 1) * perPage + index + 1}</td>
                                                    <td>
                                                        {device.name}
                                                    </td>

                                                    <td>
                                                        {device.device_brand?.name}
                                                    </td>

                                                    <td>
                                                        {device.type}
                                                    </td>

                                                    <td>
                                                        {device.status === 1 ? 'Active' : 'Inactive'}
                                                    </td>

                                                    <td>
                                                        <div className="table-actions">

                                                            {
                                                                can("devices.update") && (
                                                                    <Link to={`/admin/device/edit/${device.id}`} className="btn-edit-sm" title="Edit" >
                                                                        <i className="bi bi-pencil"></i>
                                                                    </Link>
                                                                )
                                                            }


                                                            {
                                                                can("devices.destroy") && (
                                                                    <button className="btn-danger-sm" onClick={() => deletedevice(device.id)} title="Delete"><i className="bi bi-trash3" /></button>
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
                            <Pagination currentPage={currentPage} lastPage={lastPage} onChange={fetchDatas} />
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

export default Device