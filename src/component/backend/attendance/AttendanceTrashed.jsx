import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { showError, showInfo, showSuccess } from '../../../utils/notify';
import moment from 'moment/moment';
import noimage from '../../../../public/no_image2.jpg'
import confirmDelete from '../../../utils/confirmDelete';
import api, { BASE_URL } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';


const StaffTrashed = () => {

    useEffect(() => {
        document.title = "Staff Attendance Trashed";
    }, []);

    const { can } = useAuth();
    const [loading, setLoading] = useState(false);
    const [trashed, setTrashed] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchedTrashed();
    }, []);



    const fetchedTrashed = async () => {
        setLoading(true);
        try {
            const result = await api.get(`/staffs`)
            console.log(result)
            setTrashed(result.data.trashed_all);
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
        finally {
            setLoading(false)
        }
    }

    const restoreDevice = async (id) => {
        setLoading(true);
        try {
            const result = await api.get(`/staffs/restore/${id}`)
            console.log(result);
            fetchedTrashed();
            showInfo(result.data.message)
            navigate("/admin/staff")
        } catch (error) {
            showError(error.response.data.message || "Something went wrong");
        }
        finally {
            setLoading(false)
        }
    }

    const deletePermanently = async (id) => {
        setLoading(true);
        try {
            const result = await api.delete(`/staffs/permanent/${id}`);
            navigate("/admin/staff")
            showInfo(result.data.message);
        } catch (error) {
            showError(error.response.data.message || "Something went wrong");
        }
        finally {
            setLoading(false);
        }
    }


    return (
        <div>
            <div className="glass-card-solid admin-list-card">
                <div className="admin-table-header">
                    <div>
                        <div className="section-title" style={{ fontSize: 15 }}>Company Trashed</div>
                        {/* <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>Manage existing administrator accounts</div> */}
                    </div>

                    <div>
                        <Link to={`/admin/staff/`} type="button" className="theme-toggle-btn gap-0 position-relative text-decoration-none">
                            <i class="bi bi-house-door text-light"></i>
                            <span className='badge ms-0'> Back To company devices</span>
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                +
                                <span className="visually-hidden">unread messages</span>
                            </span>
                        </Link>

                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table class="admin-table" id="adminTable">
                        <thead>
                            <tr>
                                <th>S.no</th>
                                <th>Device Name</th>
                                <th>Company Named</th>
                                <th>Device Brand</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="adminTableBody">
                            {
                                trashed.length > 0 ? trashed.map((device, index) => {
                                    return (
                                        <tr key={device.id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {device.name}
                                            </td>

                                            <td>
                                                {device.company?.name}
                                            </td>

                                            <td>
                                                {device.designation?.name}
                                            </td>

                                            <td>
                                                <div className="table-actions">
                                                    {/* {
                                                        can("companys.update") && ( */}
                                                    <button onClick={() => restoreDevice(device.id)} className="btn-edit-sm text-decoration-none" title="Edit" >
                                                        <i class="bi bi-arrow-counterclockwise fs-6"></i> Restore

                                                    </button>
                                                    {/* )
                                                    } */}


                                                    {/* {
                                                        can("companys.destroy") && ( */}
                                                    <button
                                                        onClick={() => deletePermanently(device.id)}
                                                        className="btn-danger-sm"
                                                        title="Delete"
                                                    >
                                                        <i className="bi bi-trash3"></i> Permanently Delete
                                                    </button>
                                                    {/* )} */}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                }) :
                                    <tr>
                                        <td colSpan={6} className='text-danger'><p>No Data Found !!</p></td>
                                    </tr>

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
    )
}

export default StaffTrashed
