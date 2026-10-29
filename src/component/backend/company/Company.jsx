import moment from 'moment/moment';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router';
import { ClipLoader, PulseLoader } from 'react-spinners';
import { showError, showSuccess } from '../../../utils/notify';
import api, { BASE_URL } from '../../../api/api';
import noimage from "../../../../public/no_image2.jpg"
import confirmDelete from '../../../utils/confirmDelete';
import { useAuth } from '../../../context/AuthContext';
import Pagination from '../common/Pagination';


const Company = () => {
    useEffect(() => {
        document.title = "Company";
    }, []);

    const { can } = useAuth();

    const [company, setCompany] = useState({
        logo: null,
        name: '',
        email: "",
        phone: "",
        address: "",
        pan: "",
        authorized_person: "",
    })

    const [companys, setCompanys] = useState([]);
    const [trashed, setTrashed] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalCompanys, setTotalCompanys] = useState(0);
    const perPage = 10;

    useEffect(() => {
        getCompanies(1);
    }, []);

    const getCompanies = async (page = 1) => {
        setLoading(true);
        try {
            const result = await api.get(`/companys/`, {
                params: { page, per_page: perPage },
            });
            setCompanys(result.data.companys.data);
            setCurrentPage(result.data.companys.current_page);
            setLastPage(result.data.companys.last_page);
            setTotalCompanys(result.data.companys.total);
            setTrashed(result.data.trashed);
        } catch (error) {
            showError(error.response.data.message);
        }
        finally {
            setLoading(false)
        }
    }

    const [previewImage, setPreviewImage] = useState(false);

    const handleInput = (e) => {
        const { name, files, value } = e.target;

        if (name === 'logo') {
            setPreviewImage(URL.createObjectURL(files[0]))
        }

        setCompany({ ...company, [name]: files?.length ? files[0] : value })
    }

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        // const formData = new FormData();
        // Object.keys(company).forEach(key => {
        //     formData.append(key, company[key]);
        // });
        const formData = new FormData();

        formData.append("name", company.name);
        formData.append("email", company.email);
        formData.append("phone", company.phone);
        formData.append("address", company.address);
        formData.append("authorized_person", company.authorized_person);
        formData.append("pan", company.pan);


        if (company.logo) {
            formData.append("logo", company.logo);
        }



        try {
            const result = await api.post(`/companys`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
            showSuccess(result.data.message);
            setCompany({
                name: "",
                email: "",
                phone: "",
                address: "",
                authorized_person: "",
                pan: ""
            });
            setPreviewImage(null)
            getCompanies();
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
        finally {
            setLoading(false)
        }
    }



    const deleteCompany = async (id) => {
        const confirmed = await confirmDelete();
        if (!confirmed) return;

        try {
            const result = await api.delete(`/companys/${id}`)
            showSuccess(result.data.message);
            getCompanies();

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
            <div className="admin-mgmt">
                <div className="admin-mgmt-grid">
                    {/* Create Admin Form */}
                    <div className="glass-card create-admin-card">
                        <div className="count-badge-row d-flex justify-content-between">
                            <button class="theme-toggle-btn" title="Cycle theme"><i className="bi bi-save" style={{ fontSize: "14px" }}></i> Create New Company </button>
                            <div>

                            </div>

                            <div className="count-icon"><i className="bi bi-shield-person-fill" /> {totalCompanys || 0}</div>
                        </div>


                        <form onSubmit={handleSubmit} autoComplete='off' >
                            <div class="form-floating">
                                <input type="text" name='name' value={company.name} onChange={handleInput} className="form-control" id="floatinginput" placeholder="e.g. Alex Rivera" />
                                <label for="floatinginput">Full Name</label>
                            </div>


                            {/* <label className="form-label">Image</label> */}
                            <div className='d-flex justify-content-between align-items-center gap-4'>
                                <input type="file" name='logo' onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. Alex Rivera" />
                                <div className="">

                                    {
                                        previewImage ? <img
                                            src={previewImage} alt="Fav" className="user-preview-image" />
                                            : <img
                                                src="/public/no_image2.jpg"

                                                alt="Fav" className="user-preview-image"
                                            />
                                    }

                                </div>
                            </div>

                            <div className="form-floating mb-0">
                                <input
                                    type="email"
                                    name="email"
                                    value={company.email}
                                    onChange={handleInput}
                                    className="form-control"
                                    id="floatingEmail"
                                    placeholder="Email"
                                />
                                <label htmlFor="floatingEmail">Email</label>
                            </div>

                            <div className="form-floating mb-0">
                                <input
                                    type="text"
                                    name="address"
                                    value={company.address}
                                    onChange={handleInput}
                                    className="form-control"
                                    id="floatingAddress"
                                    placeholder="Address"
                                />
                                <label htmlFor="floatingAddress">Address</label>
                            </div>

                            <div className="form-floating mb-0">
                                <input
                                    type="text"
                                    name="phone"
                                    value={company.phone}
                                    onChange={handleInput}
                                    className="form-control"
                                    id="floatingPhone"
                                    placeholder="Phone"
                                />
                                <label htmlFor="floatingPhone">Phone</label>
                            </div>

                            <div className="form-floating mb-0">
                                <input
                                    type="text"
                                    name="pan"
                                    value={company.pan}
                                    onChange={handleInput}
                                    className="form-control"
                                    id="floatingPan"
                                    placeholder="Pan"
                                />
                                <label htmlFor="floatingPan">Pan</label>
                            </div>


                            <div style={{ display: 'flex', gap: 10, marginTop: "20px" }}>
                                {
                                    can("companys.store") && (
                                        !loading ?
                                            <button type='submit' className="btn-primary">
                                                <i className="bi bi-check2-circle" /> Save Changes
                                            </button>
                                            :
                                            <button type="button" className="btn-primary" disabled>
                                                <ClipLoader color='color' size={20} /><i className="bi bi-check2-circle" /> Saving...
                                            </button>
                                    )
                                }



                            </div>


                        </form>
                    </div>
                    {/* Admin List */}
                    <div className="glass-card-solid admin-list-card">
                        <div className="admin-table-header">
                            <div>
                                <div className="section-title" style={{ fontSize: 15 }}>Companies List</div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>Manage existing company accounts</div>
                            </div>

                            <div>
                                <Link to={`/admin/company/trashed`} type="button" className="theme-toggle-btn gap-0 position-relative">
                                    <i class="bi bi-trash3-fill text-light"></i>
                                    <span className='badge ms-0'> Trashed</span>
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {trashed || 0}+
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
                                        companys?.length > 0 ? (
                                            companys.map((item, index) => {
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
                                                        {/* <td>
                                                        <span className="status-pill active">Active</span>
                                                    </td> */}

                                                        <td style={{ fontSize: "12.5px", color: "#94A3B8" }}>
                                                            {/* {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""} */}
                                                            {moment(item.created_at).format('LL')}
                                                        </td>

                                                        <td>
                                                            <div className="table-actions">
                                                                {
                                                                    can("companys.update") && (
                                                                        <Link to={`/admin/company/edit/${item.id}`} className="btn-edit-sm" title="Edit" >
                                                                            <i className="bi bi-pencil"></i>
                                                                        </Link>
                                                                    )
                                                                }


                                                                {
                                                                    can("companys.destroy") && (
                                                                        <button
                                                                            onClick={() => deleteCompany(item.id)}
                                                                            className="btn-danger-sm"
                                                                            title="Delete"
                                                                        >
                                                                            <i className="bi bi-trash3"></i>
                                                                        </button>
                                                                    )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            }))
                                            :
                                            <tr className='text-center'>
                                                <td colSpan={5}><span className='text-danger text-center'>No Data Found</span></td>
                                            </tr>

                                    }



                                </tbody>
                            </table>
                            <Pagination currentPage={currentPage} lastPage={lastPage} onChange={getCompanies} />
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

export default Company