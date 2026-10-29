import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { showError, showInfo, showSuccess } from '../../../utils/notify';
import moment from 'moment/moment';
import noimage from '../../../../public/no_image2.jpg'
import confirmDelete from '../../../utils/confirmDelete';
import api, { BASE_URL } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import Pagination from '../common/Pagination';


const StaffTrashed = () => {

    useEffect(() => {
        document.title = "Staff Trashed";
    }, []);


    const { can } = useAuth();
    const [loading, setLoading] = useState(false);
    const [trashed, setTrashed] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const navigate = useNavigate();
    const perPage = 10;

    useEffect(() => {
        fetchedTrashed(1);
    }, []);



    const fetchedTrashed = async (page = 1) => {
        setLoading(true);
        try {
            const result = await api.get(`/staffs`, {
                params: { trashed: 1, page, per_page: perPage },
            });
            setTrashed(result.data.staffs.data);
            setCurrentPage(result.data.staffs.current_page);
            setLastPage(result.data.staffs.last_page);
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
        finally {
            setLoading(false)
        }
    }

    const restoreStaff = async (id) => {
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
                            <span className='badge ms-0'> Back To company staffs</span>
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
                                <th>staff Name</th>
                                <th>Company Named</th>
                                <th>Designation</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="adminTableBody">
                            {
                                trashed.length > 0 ? trashed.map((staff, index) => {
                                    return (
                                        <tr key={staff.id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="admin-name-cell">

                                                    <div
                                                        className="avatar-initials"
                                                        style={{ background: "#141414aa" }}
                                                        
                                                    >
                                                        {
                                                            staff?.user?.image ? <img src={`${BASE_URL}/uploads/user/${staff.user?.image}`} alt="Profile" class="navbar-avatar" />
                                                                : <img alt="Profile" class="navbar-avatar" src={noimage} />
                                                        }

                                                    </div>

                                                    <div>
                                                        <div className="admin-name">{staff.name} </div>
                                                        <div className="admin-email"> {staff.email} </div>
                                                        <div className="admin-email"> {staff.phone} </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                {staff.company?.name}
                                            </td>

                                            <td>
                                                {staff.designation?.name}
                                            </td>

                                            <td>
                                                <div className="table-actions">
                                                    {
                                                        can("staffs.restore") && (
                                                            <button onClick={() => restoreStaff(staff.id)} className="btn-edit-sm text-decoration-none" title="Edit" >
                                                                <i class="bi bi-arrow-counterclockwise fs-6"></i> Restore

                                                            </button>
                                                        )
                                                    }


                                                    {
                                                        can("staffs.delete_permanent") && (
                                                            <button
                                                                onClick={() => deletePermanently(staff.id)}
                                                                className="btn-danger-sm"
                                                                title="Delete"
                                                            >
                                                                <i className="bi bi-trash3"></i> Permanently Delete
                                                            </button>
                                                        )}
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
                    <Pagination currentPage={currentPage} lastPage={lastPage} onChange={fetchedTrashed} />
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
