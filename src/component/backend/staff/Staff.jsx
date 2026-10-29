import React, { useEffect, useState } from 'react'
import { ClipLoader, PulseLoader } from 'react-spinners';
import { showError, showSuccess } from '../../../utils/notify';
import { Link } from 'react-router';
import confirmDelete from '../../../utils/confirmDelete';
import { useAuth } from '../../../context/AuthContext';
import api, { BASE_URL } from '../../../api/api';

import noimage from '../../../../public/no_image2.jpg'
import axios from 'axios';
import Pagination from '../common/Pagination';

const Staff = () => {

    useEffect(() => {
        document.title = "Staff";
    }, []);

    useEffect(() => {
        document.title = "Staff";
    }, []);

    const { can } = useAuth();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState({
        image: null,
        company_id: "",
        branch_id: "",
        name: "",
        email: "",
        gender: "",
        phone: "",
        address: "",
    });
    const [staffs, setStaffs] = useState([]);
    const [designations, setDesignations] = useState([]);

    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);



    const [gender, setGender] = useState("");

    const [trashed, setTrashed] = useState(0);
    const [brands, setBrands] = useState([]);

    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalStaffs, setTotalStaffs] = useState(0);
    const datasPerPage = 10;

    // Which query the pagination control should re-run — the list can be
    // showing the plain index, a text search, or a company/branch filter,
    // and "next page" needs to repeat whichever one is currently active.
    const [activeQuery, setActiveQuery] = useState({ type: 'default', params: {} });

    const applyPaginated = (payload) => {
        setStaffs(payload.data);
        setCurrentPage(payload.current_page);
        setLastPage(payload.last_page);
        setTotalStaffs(payload.total);
    };


    // const handleInput = (e) => {
    //     setStaff({ ...staff, [e.target.name]: e.target.value })
    // }
    const [previewImage, setPreviewImage] = useState(false);

    const handleInput = (e) => {
        const { name, files, value } = e.target;
        if (name === 'image') {
            setPreviewImage(URL.createObjectURL(files[0]))
        }

        setStaff({ ...staff, [name]: files?.length ? files[0] : value })
    }

    const [companyBranch, setCompanyBranch] = useState({
        company_id: "",
        branch_id: "",
    });

    const handleInputCompanyBranch = (e) => {
        const { name, files, value } = e.target;
        if (name === 'image') {
            setPreviewImage(URL.createObjectURL(files[0]))
        }
        if (name === 'company_id') {
            const selectedCompany = companies.find((company) => company.id === Number(value));
            setBranches(selectedCompany?.branches || []);

            // Reset branch when company changes
            setCompanyBranch({ ...companyBranch, company_id: value, branch_id: "", });

        }
        setCompanyBranch({ ...companyBranch, [name]: value })
    }



    useEffect(() => {
        fetchDatas();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);

        const formData = new FormData();
        Object.keys(staff).forEach(key => {
            formData.append(key, staff[key]);
        });

        try {
            const result = await api.post(`/staffs`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
            showSuccess(result.data.message);
            fetchDatas();
            setStaff({
                name: "",
                email: "",
                address: "",
                phone: "",
                gender: "",
            });
            setPreviewImage(null);


        } catch (error) {
            showError(error.response.data.message)
        }
        finally {
            setLoading(false)
        }
    }

    const deleteStaff = async (id) => {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        setLoading(true);

        try {
            const result = await api.delete(`/staffs/${id}`)
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
            const result = await api.get(`/staffs`, {
                params: { page, per_page: datasPerPage },
            });
            applyPaginated(result.data.staffs);
            setTrashed(result.data.trashed);
            setDesignations(result.data.designations);
            setCompanies(result.data.companies);
            setBranches(result.data.branches);
            setActiveQuery({ type: 'default', params: {} });
        } catch (error) {
            showError(error.response.data.message);
        }

    }

    const handleSubmitSearch = async (e) => {
        e.preventDefault();
        await searchStaffs(1);
    }

    const searchStaffs = async (page = 1) => {
        try {
            const params = { search: search.trim(), page, per_page: datasPerPage };
            const result = await api.get(`/staffs/search`, { params });
            applyPaginated(result.data.staffs);
            setDesignations(result.data.designations);
            setCompanies(result.data.companies);
            setActiveQuery({ type: 'search', params });
        } catch (error) {
            showError(error.response.data.message || "Something went wrong");
        }
    }

    useEffect(() => {
        if (search.trim() === "") {
            fetchDatas();
        }
    }, [search])

    const handlePageChange = (page) => {
        if (page < 1 || page > lastPage) return;

        if (activeQuery.type === 'search') {
            searchStaffs(page);
        } else if (activeQuery.type === 'filter') {
            filterByCompanyBranch(page, activeQuery.params);
        } else {
            fetchDatas(page);
        }
    };

    const filterByCompanyBranch = async (page, params) => {
        try {
            const result = await api.get("/staffs-company-branch/", {
                params: { ...params, page, per_page: datasPerPage },
            });
            applyPaginated(result.data.staffs);
            setActiveQuery({ type: 'filter', params });
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
    }

    const handleSubmitCompanyBranch = async (e, company_id, branch_id) => {
        e.preventDefault(e);
        await filterByCompanyBranch(1, { company_id, branch_id });
    }

    return (
        <div>
            <div className="admin-mgmt">
                <div className="admin-mgmt-grid">
                    {/* Create Admin Form */}
                    <div className="glass-card create-admin-card">
                        <div className="count-badge-row d-flex justify-content-between">
                            <button class="theme-toggle-btn" title="Cycle theme"><i className="bi bi-plus-circle" style={{ fontSize: "14px" }}></i> Create New User </button>

                            <div className="count-icon"><i className="bi bi-shield-person-fill" /> {totalStaffs || 0}</div>
                        </div>


                        <form onSubmit={handleSubmit}>

                            <div className="row mb-4">
                                <div className="col-12">
                                    {/* <label className="form-label"> </label> */}

                                    <select
                                        name="company_id"
                                        className="form-select"
                                        onChange={handleInput}
                                        value={staff.company_id}
                                    >
                                        <option value="">Select Company</option>

                                        {companies.map((company) => (
                                            <option
                                                key={company.id}
                                                value={company.id}   // or company.name
                                            >
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-12">
                                    {/* <label className="form-label"> </label> */}

                                    <select
                                        name="branch_id"
                                        className="form-select"
                                        onChange={handleInput}
                                        value={staff.branch_id}
                                    >
                                        <option value="">Select Branch</option>

                                        {branches.map((branch) => (
                                            <option
                                                key={branch.id}
                                                value={branch.id}   // or branch.name
                                            >
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>


                            <div class="form-floating">
                                <input type="text" name='name' value={staff.name} onChange={handleInput} className="form-control" id="floatinginput" placeholder="e.g. Alex Rivera" />
                                <label for="floatinginput">Full Name</label>
                            </div>


                            {/* <label className="form-label">Image</label> */}
                            <div className='d-flex justify-content-between align-items-center gap-4'>
                                <input type="file" name='image' onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. Alex Rivera" />
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
                                    type="text"
                                    name="phone"
                                    value={staff.phone}
                                    onChange={handleInput}
                                    className="form-control"
                                    id="floatingphone"
                                    placeholder="Phone"
                                />
                                <label htmlFor="floatingphone">Phone</label>
                            </div>

                            <div className="form-floating mb-0">
                                <input
                                    type="text"
                                    name="email"
                                    value={staff.email}
                                    onChange={handleInput}
                                    className="form-control"
                                    id="floatingEmail"
                                    placeholder="Email"
                                />
                                <label htmlFor="floatingEmail">Email</label>
                            </div>



                            <div className="row mb-3">
                                <label className="form-label">Gender</label>

                                <div className="col-lg-12 d-flex gap-3">

                                    <div className="form-check form-check-inline">
                                        <input
                                            type="radio"
                                            name="gender"
                                            id="genderMale"
                                            value="male"
                                            onChange={handleInput}
                                        />
                                        <label className="form-check-label" htmlFor="genderMale">
                                            Male
                                        </label>
                                    </div>

                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            id="genderFemale"
                                            name="gender"
                                            value="female"
                                            onChange={handleInput}
                                        />
                                        <label className="form-check-label" htmlFor="genderFemale">
                                            Female
                                        </label>
                                    </div>

                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            id="genderOther"
                                            name="gender"
                                            value="other"
                                            onChange={handleInput}
                                        />
                                        <label className="form-check-label" htmlFor="genderOther">
                                            Other
                                        </label>
                                    </div>

                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-12">
                                    <label className="form-label">Designation</label>

                                    <select
                                        name="designation_id"
                                        className="form-select"
                                        onChange={handleInput}
                                    >
                                        <option value="">Select Designation</option>

                                        {designations.map((designation) => (
                                            <option
                                                key={designation.id}
                                                value={designation.id}   // or designation.name
                                            >
                                                {designation.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    name="address"
                                    value={staff.address}
                                    onChange={handleInput}
                                    className="form-control"
                                    id="floatingAddress"
                                    placeholder="Address"
                                />
                                <label htmlFor="floatingAddress">Address</label>
                            </div>


                            <div style={{ display: 'flex', gap: 10, marginTop: "20px" }}>
                                {
                                    can("staffs.store") && (
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

                        <div style={{ marginBottom: 18 }}>

                            {/* Title row + Trashed button */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
                                <div>
                                    <div className="section-title" style={{ fontSize: 15 }}>Company staff accounts</div>
                                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Manage existing staff and administrator accounts</div>
                                </div>

                                <Link
                                    to="/admin/staff/trashed"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 34, borderRadius: 8,
                                        background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 12, fontWeight: 500,
                                        textDecoration: 'none', position: 'relative', whiteSpace: 'nowrap'
                                    }}
                                >
                                    <i className="bi bi-trash3-fill" style={{ fontSize: 14 }} />
                                    Trashed
                                    <span style={{
                                        position: 'absolute', top: -7, right: -7, background: '#EF4444', color: '#fff',
                                        fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '1px 6px', lineHeight: '16px'
                                    }}>
                                        {trashed || 0}+
                                    </span>
                                </Link>
                            </div>

                            {/* Filters row — all three columns use the same height:36px wrapper */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>

                                {/* Company */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 160 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
                                        Company
                                    </label>
                                    <div style={{ position: 'relative', height: 41 }}>
                                        <i className="bi bi-building" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94A3B8', pointerEvents: 'none' }} />
                                        <select
                                            name="company_id"
                                            className="form-select"
                                            onChange={handleInputCompanyBranch}
                                            value={companyBranch.company_id}
                                            style={{ position: 'absolute', inset: 0, width: '100%', height: 41, paddingLeft: 30, fontSize: 13 }}
                                        >
                                            <option value="">All companies</option>
                                            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Branch */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 160 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 2 }}>
                                        Branch
                                    </label>
                                    <div style={{ position: 'relative', height: 41 }}>
                                        <i className="bi bi-geo-alt" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#646464', pointerEvents: 'none' }} />
                                        <select
                                            name="branch_id"
                                            className="form-select"
                                            onChange={handleInputCompanyBranch}
                                            value={companyBranch.branch_id}
                                            style={{ position: 'absolute', inset: 0, width: '100%', height: 41, paddingLeft: 30, fontSize: 13 }}
                                        >
                                            <option value="">All branches</option>
                                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" onClick={(e) => handleSubmitCompanyBranch(e, companyBranch.company_id, companyBranch.branch_id)} class="theme-toggle-btn" title="Cycle theme">
                                    <i class="bi bi-check2-circle"></i> Submit
                                </button>

                                {/* Search — form is now display:contents so it contributes no box */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 180 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
                                        Search
                                    </label>
                                    <div style={{ position: 'relative', height: 41 }}>
                                        <i className="bi bi-search" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94A3B8', pointerEvents: 'none', zIndex: 1 }} />
                                        <form onSubmit={handleSubmitSearch} style={{ display: 'contents' }}>
                                            <input
                                                type="text"
                                                name="search"
                                                className="form-control"
                                                placeholder="Name or role…"
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                                style={{ position: 'absolute', inset: 0, width: '100%', height: 41, paddingLeft: 30, fontSize: 13, boxSizing: 'border-box' }}
                                            />
                                        </form>
                                    </div>
                                </div>

                            </div>

                            {/* Active filter pills — render only when a filter is active */}
                            {(staff.company_id || staff.branch_id) && (
                                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 11, color: '#94A3B8' }}>Active filters:</span>

                                    {staff.company_id && (
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                            background: 'rgba(37,99,235,0.1)', color: '#2563EB',
                                            fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 999
                                        }}>
                                            {companies.find(c => c.id == staff.company_id)?.name}
                                            <i className="bi bi-x" style={{ fontSize: 11, cursor: 'pointer' }}
                                                onClick={() => handleInput({ target: { name: 'company_id', value: '' } })} />
                                        </span>
                                    )}

                                    {staff.branch_id && (
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                            background: 'rgba(37,99,235,0.1)', color: '#2563EB',
                                            fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 999
                                        }}>
                                            {branches.find(b => b.id == staff.branch_id)?.name}
                                            <i className="bi bi-x" style={{ fontSize: 11, cursor: 'pointer' }}
                                                onClick={() => handleInput({ target: { name: 'branch_id', value: '' } })} />
                                        </span>
                                    )}

                                    <button
                                        onClick={() => {
                                            handleInput({ target: { name: 'company_id', value: '' } });
                                            handleInput({ target: { name: 'branch_id', value: '' } });
                                        }}
                                        style={{ fontSize: 11, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table class="admin-table" id="adminTable">
                                <thead>
                                    <tr>
                                        <th>S.no</th>
                                        <th>staff Name</th>
                                        <th>Company Name</th>
                                        <th>Branch Name</th>
                                        <th>Designation</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="adminTableBody">
                                    {
                                        staffs.length > 0 ? staffs.map((staff, index) => {
                                            return (
                                                <tr key={staff.id}>
                                                    <td> {(currentPage - 1) * datasPerPage + index + 1}</td>
                                                    <td>
                                                        <div className="admin-name-cell">

                                                            <div
                                                                className="avatar-initials"
                                                                style={{ background: "#141414aa" }}
                                                            >
                                                                {
                                                                    staff.user?.image ? <img src={`${BASE_URL}/uploads/user/${staff.user?.image}`} alt="Profile" class="navbar-avatar" />
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
                                                        {staff.branch?.name}
                                                    </td>

                                                    <td>
                                                        {staff.designation?.name}
                                                    </td>

                                                    <td>
                                                        <div className="table-actions">

                                                            {
                                                                can("staffs.show") && (
                                                                    <Link to={`/admin/staff/${staff.id}`} className="btn-edit-sm" title="Show" >
                                                                        <i className="bi bi-eye"></i>
                                                                    </Link>
                                                                )
                                                            }


                                                            {
                                                                can("staffs.update") && (
                                                                    <Link to={`/admin/staff/edit/${staff.id}`} className="btn-edit-sm" title="Edit" >
                                                                        <i className="bi bi-pencil"></i>
                                                                    </Link>
                                                                )
                                                            }


                                                            {
                                                                can("staffs.destroy") && (
                                                                    <button className="btn-danger-sm" onClick={() => deleteStaff(staff.id)} title="Delete"><i className="bi bi-trash3" /></button>
                                                                )
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        }) :
                                            <tr>
                                                <td colSpan={6} className='text-danger text-center'><p>No Data Found !!</p></td>
                                            </tr>

                                    }


                                </tbody>
                            </table>

                            <Pagination currentPage={currentPage} lastPage={lastPage} onChange={handlePageChange} />

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

export default Staff