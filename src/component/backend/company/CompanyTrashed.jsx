import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { showError, showInfo, showSuccess } from '../../../utils/notify';
import moment from 'moment/moment';
import noimage from '../../../../public/no_image2.jpg'
import confirmDelete from '../../../utils/confirmDelete';
import api, { BASE_URL } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import Pagination from '../common/Pagination';


const CompanyTrashed = () => {

    useEffect(() => {
        document.title = "Company Trashed";
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
            const result = await api.get(`/companys`, {
                params: { trashed: 1, page, per_page: perPage },
            });
            setTrashed(result.data.companys.data);
            setCurrentPage(result.data.companys.current_page);
            setLastPage(result.data.companys.last_page);
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
        finally {
            setLoading(false)
        }
    }

    const restoreCompany = async (id) => {
        setLoading(true);
        try {
            const result = await api.get(`/companys/restore/${id}`)
            console.log(result);
            fetchedTrashed();
            showInfo(result.data.message)
            navigate("/admin/company")
        } catch (error) {
            showError(error.response.data.message || "Something went wrong");
        }
        finally {
            setLoading(false)
        }
    }

    // const deletePermanently = async (id) => {
    //     setLoading(true);
    //     try {
    //         const result = await api.delete(`/companys/${id}`)
    //         showInfo(result.data.message);
    //     } catch (error) {
    //         showError(error.response.data.message || "Something went wrong");
    //     }
    // }

    const deleteCompany = async (id) => {
        const confirmed = await confirmDelete();
        if (!confirmed) return;

        try {
            const result = await api.delete(`/companys/destroy/${id}`)
            // console.log(result);
            showSuccess(result.data.message);
            fetchedTrashed();

        } catch (error) {
            showError(
                error.response?.data?.message ||
                error.message ||
                "Something went wrong"
            );
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
                        <Link to={`/admin/company/`} type="button" className="theme-toggle-btn gap-0 position-relative text-decoration-none">
                            <i class="bi bi-house-door text-light"></i>
                            <span className='badge ms-0'> Back To company</span>
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
                                <th>Name</th>
                                <th>Pan</th>
                                {/* <th>Status</th> */}
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="adminTableBody">

                            {
                                trashed.map((item, index) => {
                                    return (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="admin-name-cell">

                                                    <div
                                                        className="avatar-initials"
                                                        style={{ background: "#141414aa" }}
                                                    >


                                                        {
                                                            item.logo ? <img src={`${BASE_URL}/uploads/company/${item.logo}`} alt="Profile" class="navbar-avatar" />
                                                                : <img alt="Profile" class="navbar-avatar" src={noimage} />
                                                        }

                                                    </div>

                                                    <div>
                                                        <div className="admin-name">{item.name} </div>
                                                        <div className="admin-email"> {item.email} </div>
                                                        <div className="admin-email"> {item.phone} </div>
                                                    </div>
                                                </div>
                                            </td>


                                            <td style={{ fontSize: "13px", color: "#64748B" }}>
                                                {item?.pan}
                                            </td>

                                            <td style={{ fontSize: "12.5px", color: "#94A3B8" }}>
                                                {moment(item.created_at).format('LL')}
                                            </td>

                                            <td>
                                                <div className="table-actions">
                                                    {/* {
                                                        can("companys.update") && ( */}
                                                    <button onClick={() => restoreCompany(item.id)} className="btn-edit-sm text-decoration-none" title="Edit" >
                                                        <i class="bi bi-arrow-counterclockwise fs-6"></i> Restore

                                                    </button>
                                                    {/* )
                                                    } */}


                                                    {/* {
                                                        can("companys.destroy") && ( */}
                                                    <button
                                                        onClick={() => deleteCompany(item.id)}
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
                                })
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

export default CompanyTrashed