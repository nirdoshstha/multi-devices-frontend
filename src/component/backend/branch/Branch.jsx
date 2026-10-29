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


const Branch = () => {
    useEffect(() => {
        document.title = "Branch";
    }, []);

    const { can } = useAuth();

    const [branch, setBranch] = useState({
        logo: null,
        name: '',
        company_id: "",
        email: "",
        phone: "",
        address: "",
        pan: "",
        authorized_person: "",
    })

    const [branches, setBranches] = useState([]);
    const [trashed, setTrashed] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalBranches, setTotalBranches] = useState(0);
    const perPage = 10;

    // Only shown when this admin manages more than one company — a
    // single-company admin never needs to pick, the backend resolves it
    // automatically. 100 is a generous cap for a picker dropdown.
    const [myCompanies, setMyCompanies] = useState([]);

    useEffect(() => {
        getBranches(1);
        getMyCompanies();
    }, []);

    const getMyCompanies = async () => {
        try {
            const result = await api.get('/companys', { params: { per_page: 100 } });
            setMyCompanies(result.data.companys.data || []);
        } catch (error) {
            // Non-essential for most admins (single company) — the branch
            // form keeps working without it, it just can't offer a picker.
        }
    }

    const getBranches = async (page = 1) => {
        setLoading(true);
        try {
            const result = await api.get(`/branches/`, {
                params: { page, per_page: perPage },
            });
            setBranches(result.data.branches.data);
            setCurrentPage(result.data.branches.current_page);
            setLastPage(result.data.branches.last_page);
            setTotalBranches(result.data.branches.total);
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

        setBranch({ ...branch, [name]: files?.length ? files[0] : value })
    }

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        // const formData = new FormData();
        // Object.keys(branch).forEach(key => {
        //     formData.append(key, branch[key]);
        // });
        const formData = new FormData();

        formData.append("name", branch.name);
        formData.append("email", branch.email);
        formData.append("phone", branch.phone);
        formData.append("address", branch.address);
        formData.append("authorized_person", branch.authorized_person);
        formData.append("pan", branch.pan);

        if (myCompanies.length > 1) {
            formData.append("company_id", branch.company_id);
        }


        if (branch.logo) {
            formData.append("logo", branch.logo);
        }



        try {
            const result = await api.post(`/branches`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
            showSuccess(result.data.message);
            setBranch({
                name: "",
                email: "",
                phone: "",
                address: "",
                authorized_person: "",
                pan: "",
                company_id: "",
            });
            setPreviewImage(null)
            getBranches();
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
        finally {
            setLoading(false)
        }
    }



    const deleteBranch = async (id) => {
        const confirmed = await confirmDelete();
        if (!confirmed) return;

        try {
            const result = await api.delete(`/branches/${id}`)
            showSuccess(result.data.message);
            getBranches();

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
                            <button class="theme-toggle-btn" title="Cycle theme"><i className="bi bi-save" style={{ fontSize: "14px" }}></i> Create New Branch </button>
                            <div>

                            </div>

                            <div className="count-icon"><i className="bi bi-shield-person-fill" /> {totalBranches || 0}</div>
                        </div>


                        <form onSubmit={handleSubmit} autoComplete='off' >
                            {
                                // Only needed when this admin manages more than one
                                // company — the backend resolves it automatically
                                // otherwise, so a single-company admin's form stays
                                // exactly as it was.
                                myCompanies.length > 1 && (
                                    <div className="form-group mb-3">
                                        <label className="form-label">Company</label>
                                        <select name="company_id" value={branch.company_id} onChange={handleInput} className="form-select" required>
                                            <option value="">Select the company this branch belongs to</option>
                                            {myCompanies.map((company) => (
                                                <option key={company.id} value={company.id}>{company.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )
                            }
                            <div class="form-floating">
                                <input type="text" name='name' value={branch.name} onChange={handleInput} className="form-control" id="floatinginput" placeholder="e.g. Alex Rivera" />
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
                                    value={branch.email}
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
                                    value={branch.address}
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
                                    value={branch.phone}
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
                                    value={branch.pan}
                                    onChange={handleInput}
                                    className="form-control"
                                    id="floatingPan"
                                    placeholder="Pan"
                                />
                                <label htmlFor="floatingPan">Pan</label>
                            </div>


                            <div style={{ display: 'flex', gap: 10, marginTop: "20px" }}>
                                {
                                    can("branches.store") && (
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
                                <div className="section-title" style={{ fontSize: 15 }}>Branches List</div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>Manage existing branch accounts</div>
                            </div>

                            <div>
                                <Link to={`/admin/branch/trashed`} type="button" className="theme-toggle-btn gap-0 position-relative">
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
                                        <th>Company Name</th>
                                        <th>Pan</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="adminTableBody">

                                    {
                                        branches?.length > 0 ? (
                                            branches.map((item, index) => {
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
                                                                        item.logo ? <img src={`${BASE_URL}/uploads/branch/${item.logo}`} alt="Profile" class="navbar-avatar" />
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
                                                        <td style={{ fontSize: "13px", color: "#64748B" }}>{item.company?.name}</td>


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
                                                                    can("branches.update") && (
                                                                        <Link to={`/admin/branch/edit/${item.id}`} className="btn-edit-sm" title="Edit" >
                                                                            <i className="bi bi-pencil"></i>
                                                                        </Link>
                                                                    )
                                                                }


                                                                {
                                                                    can("branches.destroy") && (
                                                                        <button
                                                                            onClick={() => deleteBranch(item.id)}
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
                            <Pagination currentPage={currentPage} lastPage={lastPage} onChange={getBranches} />
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

export default Branch