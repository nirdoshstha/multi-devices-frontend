import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import { showError, showSuccess } from "../../../utils/notify";
import confirmDelete from "../../../utils/confirmDelete";
import { useAuth } from "../../../context/AuthContext";
import api, { BASE_URL } from "../../../api/api";
import { Link, useParams } from "react-router"
import Select from "react-select";
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { getTodayBs, Picker } from "@munatech/nepali-datepicker";
import Pagination from "../common/Pagination";

const LeaveApplication = () => {
    useEffect(() => {
        document.title = "Leave Application";
    }, []);
    const { can } = useAuth();
    const { id } = useParams();

    const [viewLeaveApproval, setviewLeaveApproval] = useState({});

    const [dateFrom, setDateFrom] = useState(getTodayBs());
    const [dateTo, setDateTo] = useState(getTodayBs());

    const [loading, setLoading] = useState(false);
    const [leaveApplication, setLeaveApplication] = useState({
        user_id: "",
        role_id: "",
        leave_type_id: "",
        day_type: "",
        total_days: "",
        date_from: "",
        date_to: "",
    });

    const [companies, setCompanies] = useState([]);

    const [branches, setBranches] = useState([]);

    const [companyBranch, setCompanyBranch] = useState({
        company_id: "",
        branch_id: "",
    });

    const handleInputCompanyBranch = (e) => {
        const { name, value } = e.target;

        if (name === 'company_id') {
            const selectedCompany = companies.find((company) => company.id === Number(value));
            setBranches(selectedCompany?.branches || []);

            // Reset branch when company changes
            setCompanyBranch({ ...companyBranch, company_id: value, branch_id: "", });
            return;

        }

        setCompanyBranch({ ...companyBranch, [name]: value })
    }

    const applyPaginated = (payload) => {
        setLeaveApplications(payload.data);
        setCurrentPage(payload.current_page);
        setLastPage(payload.last_page);
        setTotalLeaves(payload.total);
    };

    const filterByCompanyBranch = async (page, params) => {
        try {
            const result = await api.get("leave/staffs-company-and-branch-wise/", {
                params: { ...params, page, per_page: perPage },
            })
            applyPaginated(result.data.leave_applications);
            setActiveFilter(params);
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
    }

    const handleSubmitCompanyBranch = async (e, company_id, branch_id) => {
        e.preventDefault(e);
        await filterByCompanyBranch(1, { company_id, branch_id });
    }

    const handlePageChange = (page) => {
        if (page < 1 || page > lastPage) return;
        activeFilter ? filterByCompanyBranch(page, activeFilter) : fetchDatas(page);
    };

    const [leaveApplications, setLeaveApplications] = useState([]);
    const [leaveType, setLeaveType] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalLeaves, setTotalLeaves] = useState(0);
    const perPage = 10;

    // Tracks whether pagination should repeat the plain index or the
    // company/branch filter — mirrors the same pattern used on Staff.jsx.
    const [activeFilter, setActiveFilter] = useState(null);

    const [selectedUser, setSelectedUser] = useState(null);
    const [options, setOptions] = useState([]);

    // const [selectedRole, setSelectedRole] = useState(null);
    // const [optionRole, setOptionRole] = useState([]);

    const [leaveaIsApproved, setLeaveIsApproved] = useState({
        is_approved: 0,
        approval_remarks: ""
    })

    const handleInput = (e) => {
        setLeaveApplication({ ...leaveApplication, [e.target.name]: e.target.value });
    };

    const handleApprove = (e) => {
        setLeaveIsApproved({ ...leaveaIsApproved, [e.target.name]: e.target.value });
    }


    useEffect(() => {
        fetchDatas();
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await api.post(`/leave-applications`, leaveApplication);
            showSuccess(result.data.message);
            fetchDatas();
            setLeaveApplication({
                user_id: "",
                role_id: "",
                leave_type_id: "",
                day_type: "",
                reason: "",
                date_from: "",
                date_to: ""
            });
        } catch (error) {


            // Fallback for non-validation errors (500s, network errors, etc.)
            showError(error.response?.data?.message || "Something went wrong.");

        } finally {
            setLoading(false);
        }
    };

    const deleteLeave = async (id) => {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        setLoading(true);

        try {
            const result = await api.delete(`/leave-applications/${id}`);
            showSuccess(result.data.message);
            fetchDatas();
        } catch (error) {
            showError(error.response.data.message);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchDatas = async (page = 1) => {
        try {
            const result = await api.get(`/leave-applications`, {
                params: { page, per_page: perPage },
            });
            applyPaginated(result.data.leave_applications);
            setLeaveType(result.data.leave_type);
            setCompanies(result.data.companies);
            setBranches(result.data.branches);
            setActiveFilter(null);

        } catch (error) {
            showError(error.response.data.message);
        }
    };


    const searchUsers = async (search) => {
        if (!search || search.trim() === "") {
            setOptions([]);
            return;
        }

        try {
            const response = await api.get("/users/search", {
                params: {
                    search: search.trim(),
                },
            });

            // const users = response.data.users || [];
            const users = response.data.users?.data || [];


            const formattedOptions = users.map((user) => ({ value: user.id, label: `${user.name} - ${user.email}`, }));

            setOptions(formattedOptions);
        } catch (error) {
            console.error("Search users error:", error);
            setOptions([]);
        }
    };

    const handleUserInputChange = (inputValue, { action }) => {
        if (action === "input-change") {
            searchUsers(inputValue);
        }
        return inputValue;
    };


    // const searchRole = async (search = "") => {
    //     try {
    //         const response = await api.get("/roles");

    //         const roles = response.data.roles || [];

    //         const filteredRoles = roles.filter((role) =>
    //             role.name.toLowerCase().includes(search.toLowerCase())
    //         );

    //         const formattedOptionsRole = filteredRoles.map((role) => ({
    //             value: role.id,
    //             label: role.name,
    //         }));

    //         setOptionRole(formattedOptionsRole);
    //     } catch (error) {
    //         console.error("Search roles error:", error);
    //         setOptionRole([]);
    //     }
    // };

    // const handleRoleInputChange = (inputValue, { action }) => {
    //     if (action === "input-change") {
    //         searchRole(inputValue);
    //     }

    //     return inputValue;
    // };




    return (
        <div>
            <div className="admin-mgmt">
                <div className="admin-mgmt-grid">
                    {/* Create Admin Form */}
                    <div className="glass-card create-admin-card">
                        <div className="count-badge-row d-flex justify-content-between">
                            <button className="theme-toggle-btn" title="Cycle theme">
                                <i
                                    className="bi bi-plus-circle"
                                    style={{ fontSize: "14px" }}
                                ></i>
                                Create New Leave Application
                            </button>
                            <div className="count-icon">
                                <i className="bi bi-shield-person-fill" /> {totalLeaves || 0}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="form-floating mb-3">


                                {/* <Select
                  name="user_id"
                  options={options}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  onInputChange={handleUserInputChange}
                  isSearchable
                  placeholder="Search users..."
                  isClearable
                /> */}
                                <Select
                                    name="user_id"
                                    options={options}
                                    value={selectedUser}
                                    onChange={(selectedOption) => {
                                        setSelectedUser(selectedOption);

                                        setLeaveApplication((prev) => ({
                                            ...prev,
                                            user_id: selectedOption ? selectedOption.value : "",
                                        }));
                                    }}
                                    onInputChange={handleUserInputChange}
                                    isSearchable
                                    placeholder="Search users..."
                                    isClearable
                                />


                                {/* <Select
                  name="role_id"
                  options={optionRole}
                  onInputChange={handleRoleInputChange}
                  onMenuOpen={() => searchRole("")}
                  placeholder="Select Role"
                  className="mt-3"
                  isClearable
                /> */}

                                {/* <Select
                                    name="role_id"
                                    options={optionRole}
                                    value={selectedRole}
                                    onChange={(selectedOption) => {
                                        setSelectedRole(selectedOption);

                                        setLeaveApplication((prev) => ({
                                            ...prev,
                                            role_id: selectedOption ? selectedOption.value : "",
                                        }));
                                    }}
                                    onInputChange={handleRoleInputChange}
                                    onMenuOpen={() => searchRole("")}
                                    placeholder="Select Role"
                                    className="mt-3"
                                    isClearable
                                /> */}


                                {/* <label for="leaveName"> User Name</label> */}
                            </div>




                            <Form.Select name="leave_type_id" onChange={handleInput} aria-label="Floating label select example" className="mb-3">
                                <option>Please Select Leave Type <span className="text-danger">*</span></option>
                                {
                                    leaveType.map((item) => {
                                        return (
                                            <option value={item.id} key={item.id}>{item.name}</option>
                                        )
                                    })
                                }
                            </Form.Select>


                            {/* <FloatingLabel
                controlId="floatingSelectGrid"
              // label="Day Type"
              > */}
                            <Form.Select name="day_type" onChange={handleInput} aria-label="Floating label select example" className="mb-3">
                                <option value="">Please Select Day Type <span className="text-danger">*</span></option>
                                <option value="full_day">Full Day</option>
                                <option value="half_day">Half Day</option>
                            </Form.Select>
                            {/* </FloatingLabel> */}


                            <div className="d-flex justify-content-evenly">
                                <label for="leaveName"> From <span className="text-danger">*</span></label>
                                <label for="leaveName"> To <span className="text-danger">*</span></label></div>

                            <div className="form-group d-flex gap-3 mb-3">

                                <Picker
                                    name="date_from"
                                    value={dateFrom}
                                    onChange={(value) => {
                                        setDateFrom(value);

                                        setLeaveApplication((prev) => ({
                                            ...prev,
                                            date_from: `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`,
                                        }));
                                    }}
                                    placeholder="Pick a Nepali Date"
                                    className="w-100"
                                />

                                <Picker
                                    name="date_to"
                                    value={dateTo}
                                    onChange={(value) => {
                                        setDateTo(value);

                                        setLeaveApplication((prev) => ({
                                            ...prev,
                                            date_to: `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`,
                                        }));
                                    }}
                                    placeholder="Pick a Nepali Date"
                                    className="w-100"
                                />
                            </div>

                            <div className="form-floating mb-0">
                                <textarea
                                    name="reason"
                                    value={leaveApplication?.reason}
                                    onChange={handleInput}
                                    className="form-control"
                                    id="route"
                                    placeholder="Reason"
                                />
                                <label for="route">Reason</label>
                            </div>


                            {can("leave-applications.store") && (
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ width: "100%", justifyContent: "center" }}
                                >
                                    {loading ? (
                                        <PulseLoader color="white" loading={true} size={12} />
                                    ) : (
                                        ""
                                    )}
                                    <i className="bi bi-person-plus-fill" /> Create Leave
                                </button>
                            )}
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

                                {/* <Link
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
                        </Link> */}
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
                            </div>


                        </div>
                        <div style={{ overflowX: "auto" }}>

                            <table className="admin-table" id="adminTable">
                                <thead>
                                    <tr>
                                        <th>S.no</th>
                                        <th>Staff Name And Role</th>
                                        {/* <th>Company</th> */}
                                        <th> Name</th>
                                        <th>Leave Start/End</th>
                                        <th>Days</th>
                                        <th> Is Approved?</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="adminTableBody">
                                    {
                                        leaveApplications.length === 0 ? (
                                            <tr><td colSpan={7} className="text-danger text-center"><p>No Data Found !!</p></td></tr>
                                        ) : leaveApplications.map((leave, index) => {
                                            return (
                                                <tr key={leave.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {/* {leave.user?.name}<br />
                                                        <span className="status-pill active">{leave.role?.name}</span> */}
                                                        <div className="admin-name-cell">

                                                            <div
                                                                className="avatar-initials"
                                                                style={{ background: "#141414aa" }}
                                                            >
                                                                {
                                                                    leave.user?.image ? <img src={`${BASE_URL}/uploads/user/${leave.user?.image}`} alt="Profile" className="navbar-avatar" />
                                                                        : ""
                                                                }

                                                            </div>

                                                            <div>
                                                                <div className="admin-name">{leave.user?.name} </div>
                                                                <div className="admin-email">
                                                                    {leave.user?.roles?.map(role => role.name).join(", ") || ""}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* <td><small>{leave.user?.staff?.company?.name}</small></td> */}

                                                    <td>
                                                        <small>{leave.leave_type?.name}</small>
                                                    </td>
                                                    <td>
                                                        <span className="status-pill active">{leave.date_from}</span>
                                                        <span className="status-pill mt-1">{leave.date_to}</span>
                                                    </td>
                                                    <td>
                                                        {
                                                            leave.total_days !== 0 ? <span className="status-pill active px-2"> {leave.total_days}</span> :
                                                                <span className="status-pill active px-2"> Unlimited / As needed</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            {
                                                                leave.is_approved === 0 ? <span className="status-pill px-2">Pending</span> :
                                                                    leave.is_approved === 1 ? <span className="status-pill active px-2">Approved</span> :
                                                                        leave.is_approved === 2 ? <span className="status-pill px-2">Rejected</span> : <span className="status-pill px-2">Pending</span>
                                                            }



                                                            {
                                                                can("leave_is_approved") && (
                                                                    <Link to={`/admin/is-leave-approved/${leave.id}`} className="theme-toggle-btn" title="Approved/Rejected"><i className="bi bi-check2-circle fs-6"></i> </Link>
                                                                )
                                                            }
                                                        </div>

                                                    </td>


                                                    <td>
                                                        <div className="table-actions">

                                                            {
                                                                can("leave-applications.show") && (
                                                                    <Link to={`/admin/leave-application/${leave.id}`} className="btn-info-sm" title="Show" >
                                                                        <i className="bi bi-eye"></i>
                                                                    </Link>
                                                                )
                                                            }

                                                            {
                                                                leave.is_approved === 0 || leave.is_approved === 2 ?
                                                                    can("leave-applications.update") && (
                                                                        <Link to={`/admin/leave-application/edit/${leave.id}`} className="btn-edit-sm" title="Edit" >
                                                                            <i className="bi bi-pencil"></i>
                                                                        </Link>
                                                                    ) : ''

                                                            }


                                                            {
                                                                leave.is_approved === 0 || leave.is_approved === 2 ?
                                                                    can("leave-applications.destroy") && (
                                                                        <button className="btn-danger-sm" onClick={() => deleteLeave(leave.id)} title="Delete"><i className="bi bi-trash3" /></button>
                                                                    ) : ""
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>


                            </table>
                            <Pagination currentPage={currentPage} lastPage={lastPage} onChange={handlePageChange} />
                        </div>
                        <div
                            id="emptyState"
                            style={{
                                display: "none",
                                textAlign: "center",
                                padding: 36,
                                color: "#94A3B8",
                            }}
                        >
                            <i
                                className="bi bi-person-x"
                                style={{ fontSize: 36, marginBottom: 10, display: "block" }}
                            />
                            No admins found.
                        </div>
                    </div>
                </div>
            </div>




        </div>
    );
};

export default LeaveApplication;
