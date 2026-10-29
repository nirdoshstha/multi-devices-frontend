import React, { useEffect, useState } from 'react'
import { showError, showSuccess } from '../../../utils/notify';
import api from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router';
import confirmDelete from '../../../utils/confirmDelete';
import { ROLE_SUPER_ADMIN } from '../../../constants/roles';

const Permission = () => {

    useEffect(() => {
        document.title = "Permission";
    }, []);

    const { can } = useAuth();
    const [loading, setLoading] = useState(false);
    const [routes, setRoutes] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [permissions, setPermissions] = useState({});

    const [roles, setRoles] = useState({
        name: "",
        permissions: []
    })

    const handleInput = (e) => {
        setRoles({ ...roles, [e.target.name]: e.target.value });
    }

    const handleSubmitRole = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: roles.name,
                permissions: selectedPermissions
            };

            console.log("Submitting:", payload);

            const result = await api.post('/roles', payload);

            showSuccess(result.data.message);

            // Refresh roles
            fetchRoles();

            // Reset form
            setRoles({
                name: "",
                permissions: []
            });

            setSelectedPermissions([]);

        } catch (error) {
            console.log(error.response?.data);

            showError(
                error.response?.data?.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        getPermissions();
    }, [])

    const getPermissions = async () => {
        try {
            // /roles already returns the full permissions+routes list this
            // page needs (there is no separate /permissions endpoint).
            const result = await api.get(`/roles`);
            setPermissions(result.data.permissions);
            setRoutes(result.data.routes);
        } catch (error) {
            showError(error.response?.data?.message || "Something went wrong");
        }
    }

    // const formatPermission = (name) => {
    //     return name ? name
    //         .replace(/\./g, " ")
    //         .replace(/\b\w/g, char => char.toUpperCase()) : '';
    // };
    const formatPermission = (permission) => {

        const action = permission.split(".")[1] || permission;

        return action.charAt(0).toUpperCase() + action.slice(1);

    };


    const handlePermission = (id) => {

        setSelectedPermissions(prev =>

            prev.includes(id)

                ? prev.filter(item => item !== id)

                : [...prev, id]

        );

    };


    const handleModuleSelect = (items, checked) => {

        const ids = items.map(item => item.id);

        if (checked) {

            setSelectedPermissions(prev =>

                [...new Set([...prev, ...ids])]

            );

        } else {

            setSelectedPermissions(prev =>

                prev.filter(id => !ids.includes(id))

            );

        }

    };

    const isModuleChecked = (items) => {

        return items.every(item =>

            selectedPermissions.includes(item.id)

        );

    };

    const handleSelectAll = (checked) => {

        if (checked) {

            const ids = Object.values(permissions)
                .flat()
                .map(item => item.id);

            setSelectedPermissions(ids);

        } else {

            setSelectedPermissions([]);

        }

    };

    const [getRoles, setGetRoles] = useState([]);
    useEffect(() => {
        fetchRoles();
    }, [])

    const fetchRoles = async () => {


        try {
            const result = await api.get(`roles`)
            // console.log(result); 
            setGetRoles(result.data.roles);
            console.log(result)
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
            getRoles();

        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
        finally {
            setLoading(false)
        }

    }

    useEffect(() => {
        // import("bootstrap/dist/js/bootstrap.bundle.min.js");
    }, []);
    return (
        <div>
            <div className="admin-mgmt">
                <div className="admin-mgmt-grid">
                    {/* Create Admin Form */}
                    <div className="glass-card create-admin-card">
                        <div className="count-badge-row">
                            <div className="count-icon"><i className="bi bi-shield-person-fill" /> 2 </div>
                            <div>
                                <div className="count-label">Create New Role</div>
                                <div className="count-value" id="admin-total-count"><div className="count-value">
                                </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitRole}  >
                            <div className="form-group">
                                <label className="form-label"> Roll Name</label>
                                <input type="text" name='name' onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. Alex Rivera" />

                            </div>
                            {/* <div className="form-group mb-3">
                                <label className="form-label">Permissions TEST</label>

                                <div className="row">
                                    {routes.slice(0, 25).map((permission) => (
                                        <div className="col-md-6 mb-2" key={permission.id}>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="permissions"
                                                    value={permission.name}
                                                    // onChange={(e) =>
                                                    //     handleCheckboxChange(permission.name, e.target.checked)
                                                    // }
                                                    id={`permission-${permission.id}`}
                                                />

                                                <label
                                                    className="form-check-label"
                                                    htmlFor={`permission-${permission.id}`}
                                                >
                                                    <span className="status-pill active px-1">
                                                        {permission.label}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div> */}

                            <div className="glass-card-solid admin-list-card mt-4">

                                <div className="d-flex justify-content-between align-items-center mb-4">

                                    <h6 className="mb-0">
                                        <i className="bi bi-shield-lock me-2"></i>
                                        Permissions
                                    </h6>

                                    <label className="form-check">

                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={
                                                Object.values(permissions)
                                                    .flat()
                                                    .every(item =>
                                                        selectedPermissions.includes(item.id)
                                                    )
                                            }
                                            onChange={(e) =>
                                                handleSelectAll(e.target.checked)
                                            }
                                        />

                                        <small className="form-check-label fw-bold">

                                            Select All

                                        </small>

                                    </label>

                                </div>

                                <div
                                    className="accordion"
                                    id="permissionAccordion"
                                >

                                    {

                                        Object.entries(permissions).map(([module, items], index) => (

                                            <div
                                                className="accordion-item mb-3 border-0 shadow-sm rounded"
                                                key={module}
                                            >

                                                <h2 className="accordion-header">

                                                    <button
                                                        className={`accordion-button ${index !== 0 ? "collapsed" : ""}`}
                                                        type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target={`#collapse${index}`}
                                                        aria-expanded={index === 0}
                                                    >

                                                        <div className="d-flex justify-content-between w-100 align-items-center">

                                                            <small className="text-capitalize">

                                                                {module}

                                                            </small>

                                                            <span className="badge bg-primary">

                                                                {items.length}

                                                            </span>

                                                        </div>

                                                    </button>

                                                </h2>

                                                <div
                                                    id={`collapse${index}`}
                                                    className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                                                    data-bs-parent="#permissionAccordion"
                                                >

                                                    <div className="accordion-body">

                                                        <div className="mb-3">

                                                            <label className="form-check">

                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    checked={isModuleChecked(items)}
                                                                    onChange={(e) =>
                                                                        handleModuleSelect(
                                                                            items,
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                />

                                                                <small className="form-check-label fw-semibold">

                                                                    Select All {module}

                                                                </small>

                                                            </label>

                                                        </div>

                                                        <div className="row">

                                                            {

                                                                items.map(permission => (

                                                                    <div
                                                                        className="col-lg-4 col-md-4 col-sm-6 mb-3"
                                                                        key={permission.id}
                                                                    >

                                                                        <label className="permission-box">

                                                                            <input
                                                                                type="checkbox"
                                                                                checked={
                                                                                    selectedPermissions.includes(permission.id)
                                                                                }
                                                                                onChange={() =>
                                                                                    handlePermission(permission.id)
                                                                                }
                                                                            />

                                                                            <small>

                                                                                {formatPermission(permission.name)}

                                                                            </small>

                                                                        </label>

                                                                    </div>

                                                                ))

                                                            }

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        ))

                                    }

                                </div>

                            </div>

                            <button type='submit' className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                <i className="bi bi-person-plus-fill" /> Create Role Account
                            </button>


                        </form>
                    </div>
                    {/* Admin List */}
                    {/* <div className="glass-card-solid admin-list-card">
                        <div className="admin-table-header">
                            <div>
                                <div className="section-title" style={{ fontSize: 15 }}>Permission Accounts</div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>Manage existing administrator accounts</div>
                            </div>
                            <div className="search-box">
                                <i className="bi bi-search" />
                                <input type="text" className="form-control" id="adminSearch" placeholder="Search admins..." oninput="filterAdmins()" />
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <div className="accordion permission-accordion">
                                <table className="admin-table" id="adminTable">
                                    <thead>
                                        <tr>
                                            <th>S.no</th>
                                            <th>Permission</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <div className="accordion permission-accordion" id="permissionAccordion">
                                        <tbody id="adminTableBody">

                                            {Object.entries(permissions).map(([module, items], index) => (

                                                <div
                                                    className="accordion-item permission-item"
                                                    key={module}
                                                >

                                                    <h2 className="accordion-header">

                                                        <button
                                                            className={`accordion-button ${index !== 0 ? "collapsed" : ""}`}
                                                            data-bs-toggle="collapse"
                                                            data-bs-target={`#collapse-${index}`}
                                                        >

                                                            <div className="d-flex justify-content-between w-100">

                                                                <strong className="text-capitalize">

                                                                    {module}

                                                                </strong>

                                                                <span className="badge bg-primary">

                                                                    {items.length}

                                                                </span>

                                                            </div>

                                                        </button>

                                                    </h2>

                                                    <div
                                                        id={`collapse-${index}`}
                                                        className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                                                    >

                                                        <div className="accordion-body">

                                                            <div className="mb-3">

                                                                <label className="form-check">

                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input"
                                                                        onChange={(e) =>

                                                                            handleModuleSelect(
                                                                                module,
                                                                                items,
                                                                                e.target.checked
                                                                            )

                                                                        }
                                                                    />

                                                                    <span className="fw-semibold">

                                                                        Select All

                                                                    </span>

                                                                </label>

                                                            </div>

                                                            <div className="row">

                                                                {items.map(permission => (

                                                                    <div
                                                                        className="col-lg-3 col-md-4 mb-3"
                                                                        key={permission.id}
                                                                    >

                                                                        <label className="permission-box">

                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedPermissions.includes(permission.id)}
                                                                                onChange={() => handlePermission(permission.id)}
                                                                            />

                                                                            <span>

                                                                                {formatPermission(permission.name)}

                                                                            </span>

                                                                        </label>

                                                                    </div>

                                                                ))}

                                                            </div>

                                                        </div>

                                                    </div>

                                                </div>

                                            ))}

                                        </tbody>

                                    </div>
                                </table>

                            </div>
                        </div>
                        <div id="emptyState" style={{ display: 'none', textAlign: 'center', padding: 36, color: '#94A3B8' }}>
                            <i className="bi bi-person-x" style={{ fontSize: 36, marginBottom: 10, display: 'block' }} />
                            No admins found.
                        </div>
                    </div> */}
                    <div className="glass-card-solid admin-list-card mt-4">

                        <table class="admin-table" id="adminTable">
                            <thead>
                                <tr>
                                    <th>S.no</th>
                                    <th>Role</th>
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
                                                {/* <td style={{ fontSize: "13px", color: "#64748B" }} className='gx-2'>
                                                        {
                                                            role.permissions.map((permission) => {
                                                                return (
                                                                    <span className="status-pill active m-1"> {formatPermission(permission.name)}</span>
                                                                )
                                                            })
                                                        }
                                                    </td> */}
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
                                                                    className="btn-edit-sm"
                                                                    title="Edit">
                                                                    <i className="bi bi-pencil"></i>
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
                </div>
            </div>
        </div >
    )
}

export default Permission