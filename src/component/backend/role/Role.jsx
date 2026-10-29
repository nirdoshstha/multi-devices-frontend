import moment from 'moment/moment';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router';
import { ClipLoader, PulseLoader } from 'react-spinners';
import api from '../../../api/api';
import { showError, showSuccess } from '../../../utils/notify';
import confirmDelete from '../../../utils/confirmDelete';
import { useAuth } from '../../../context/AuthContext';
import { ROLE_SUPER_ADMIN } from '../../../constants/roles';

const Role = () => {

    useEffect(() => {
        document.title = "Role";
    }, []);

    const { can, hasRole } = useAuth();
    const isSuperAdmin = hasRole(ROLE_SUPER_ADMIN);
    const [loading, setLoading] = useState(false);

    const [permissions, setPermissisons] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [roles, setRoles] = useState({
        name: "",
        permissions: [],
        company_id: "",
    })
    const [getRoles, setGetRoles] = useState([])

    const handleInput = (e) => {
        setRoles({ ...roles, [e.target.name]: e.target.value });
    }

    const handleSubmitRole = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await api.post(`/roles`, {
                ...roles,
                company_id: roles.company_id || null,
            })
            showSuccess(result.data.message);
            getPermissions();
            setRoles({
                name: "",
                permissions: [],
                company_id: "",
            });

        } catch (error) {
            showError(error.response.data.message)
        }
        finally {
            setLoading(false)
        }

    }


    const handleCheckboxChange = (permissionName, checked) => {
        if (checked) {
            setRoles(prev => ({
                ...prev, permissions: [...prev.permissions, permissionName]
            }));
        } else {
            setRoles(prev => ({
                ...prev, permissions: prev.permissions.filter(name => name !== permissionName)
            }));
        }
    };


    useEffect(() => {
        getPermissions();
    }, [])

    const getPermissions = async () => {


        try {
            const result = await api.get(`roles`)
            // console.log(result);
            setPermissisons(result.data.permissions);
            setGetRoles(result.data.roles);
            setRoutes(result.data.routes)
            setCompanies(result.data.companies || [])
        } catch (error) {
            showError(error.response.data.message);

        }

    }



    const deleteRole = async (id) => {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        try {
            setLoading(true)
            const result = await api.delete(`/roles/${id}`);
            showSuccess(result.data.message);
            getPermissions();

        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
        finally {
            setLoading(false)
        }

    }

    const formatPermission = (name) => {
        return name
            .replace(/\./g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    let html_roles = "";

    if (loading) {
        html_roles = (
            <div className="position-relative">
                {/* Content */}
                <div className="text-center">
                    <div className="spinner-border text-success" style={{ width: '2rem', height: '2rem' }} />
                    {/* <div className="mt-3 fw-semibold">
                            Loading...
                        </div> */}
                </div>
            </div>

        );
    }


    return (
        <div>
            <div className="admin-mgmt">
                <div className="admin-mgmt-grid">
                    {/* Create Admin Form */}
                    <div className="glass-card create-admin-card">
                        <div className="count-badge-row d-flex justify-content-between">
                            <button class="theme-toggle-btn" title="Cycle theme"><i className="bi bi-plus-circle" style={{ fontSize: "14px" }}></i> Create New Role </button>
                            <div className="count-icon"><i className="bi bi-shield-person-fill" /> {getRoles.length || 0} </div>
                        </div>
                        {/* <div className='d-flex justify-content-between align-items-center'>
                            <div className="section-title" style={{ fontSize: 15, marginBottom: 16 }}>Create New Role </div>

                            {
                                html_roles
                            }
                        </div> */}

                        <form onSubmit={handleSubmitRole}  >
                            <div className="form-group">
                                <label className="form-label"> Roll Name</label>
                                <input type="text" name='name' value={roles.name} onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. Alex Rivera" />

                            </div>

                            {
                                // Super Admin can target any company, or leave it blank for
                                // a global template. A Company/Vendor admin's role is always
                                // auto-scoped to their own company server-side — they only
                                // need this picker once they manage more than one.
                                isSuperAdmin && (
                                    <div className="form-group">
                                        <label className="form-label">Company <span className="text-muted" style={{ fontSize: 12 }}>(leave blank for a global role usable by every company)</span></label>
                                        <select name="company_id" value={roles.company_id} onChange={handleInput} className="form-select">
                                            <option value="">Global (all companies)</option>
                                            {companies.map((company) => (
                                                <option key={company.id} value={company.id}>{company.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )
                            }
                            {
                                !isSuperAdmin && companies.length > 1 && (
                                    <div className="form-group">
                                        <label className="form-label">Company</label>
                                        <select name="company_id" value={roles.company_id} onChange={handleInput} className="form-select" required>
                                            <option value="">Select which of your companies this role belongs to</option>
                                            {companies.map((company) => (
                                                <option key={company.id} value={company.id}>{company.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )
                            }
                            {/* <div className="form-group mb-3">
                                <label className="form-label">Permissions</label>

                                <div className="row">
                                    {permissions.map((permission) => (
                                        <div className="col-md-6 mb-2" key={permission.id}>
                                            <div className="form-check px-1">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="permissions"
                                                    value={permission.name}
                                                    onChange={(e) =>
                                                        handleCheckboxChange(permission.name, e.target.checked)
                                                    }
                                                    id={`permission-${permission.id}`}
                                                />

                                                <label
                                                    className="form-check-label"
                                                    htmlFor={`permission-${permission.id}`}
                                                >
                                                    <span className="status-pill active px-3">
                                                        {formatPermission(permission.name)}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div> */}


                            {
                                can("roles.store") && (
                                    <button type='submit' className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                        {loading ? <PulseLoader
                                            color='white'
                                            loading={true}
                                            size={12}
                                        /> : ''}  <i className="bi bi-person-plus-fill" /> Create Role Account
                                    </button>
                                )
                            }


                        </form>
                    </div>
                    {/* Admin List */}
                    <div className="glass-card-solid admin-list-card">
                        <div className="admin-table-header">
                            <div>
                                <div className="section-title" style={{ fontSize: 15 }}>Role Accounts</div>
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
                                        <th>Scope</th>
                                        <th>Permission</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="adminTableBody">
                                    {
                                        getRoles.map((role, index) => {
                                            return (
                                                <tr>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {role.name}
                                                    </td>
                                                    <td>
                                                        {
                                                            role.company
                                                                ? <span className="status-pill m-1">{role.company.name}</span>
                                                                : <span className="status-pill active m-1">Global</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            role.name === ROLE_SUPER_ADMIN ? 'All Permission' : role.permissions?.length ?? ''
                                                        }
                                                    </td>

                                                    <td>
                                                        <div className="table-actions">
                                                            {
                                                                can("roles.show") && (
                                                                    <Link to={`/admin/role/${role.id}`}
                                                                        className="btn-info-sm"
                                                                        title="View" >
                                                                        <i className="bi bi-eye"></i>
                                                                    </Link>
                                                                )
                                                            }
                                                            {
                                                                can("roles.update") && (
                                                                    <Link to={`/admin/role/edit/${role.id}`}
                                                                        className="theme-toggle-btn text-decoration-none"
                                                                        title="Edit Permission">
                                                                        <i className="bi bi-pencil"></i>Assign Permission
                                                                    </Link>
                                                                )
                                                            }

                                                            {
                                                                can("roles.destroy") && (
                                                                    <button className="btn-danger-sm" onClick={() => deleteRole(role.id)} title="Delete"><i className="bi bi-trash3" /></button>
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

export default Role