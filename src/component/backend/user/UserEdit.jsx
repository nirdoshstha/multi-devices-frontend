import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router';
import { ClipLoader } from 'react-spinners'
import { showError, showSuccess } from '../../../utils/notify';
import api, { BASE_URL } from '../../../api/api';

const UserEdit = () => {

    useEffect(() => {
            document.title = "User Edit";
        }, []);
    const { id } = useParams();
    const navigate = useNavigate();
    const [userEdit, setUserEdit] = useState({
        image: null,
        name: '',
        email: "",
        phone: "",
        roles: [],
    })
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Managed Branches — the data behind the 'managed' access-scope tier
    // (see HasAccessScope on the backend). A role can be set to 'managed'
    // for a module, but without assigning specific branches to the user
    // here, that tier always resolves to an empty set — "all permissions
    // granted, but no lists show up".
    const [allBranches, setAllBranches] = useState([]);
    const [managedBranchIds, setManagedBranchIds] = useState([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [branchesSaving, setBranchesSaving] = useState(false);

    useEffect(() => {
        fetchSpecificUser();
        fetchBranchAssignments();
    }, [id]);

    const fetchSpecificUser = async () => {
        try {
            const result = await api.get(`/users/${id}`);

            setUserEdit({
                ...result.data.user,
                roles: result.data.user.roles.map(role => role.name),
            });

            setRoles(result.data.roles);

        } catch (error) {
            console.log(error);
        }
    };

    const fetchBranchAssignments = async () => {
        setBranchesLoading(true);
        try {
            const result = await api.get(`/users/${id}/branch-assignments`);
            setAllBranches(result.data.branches ?? []);
            setManagedBranchIds(result.data.assigned_branch_ids ?? []);
        } catch (error) {
            console.log(error);
        } finally {
            setBranchesLoading(false);
        }
    };

    const handleManagedBranchChange = (branchId, checked) => {
        setManagedBranchIds(prev =>
            checked ? [...prev, branchId] : prev.filter(id => id !== branchId)
        );
    };

    const handleSaveManagedBranches = async () => {
        setBranchesSaving(true);
        try {
            const result = await api.put(`/users/${id}/branch-assignments`, {
                branch_ids: managedBranchIds,
            });
            showSuccess(result.data.message);
        } catch (error) {
            showError(error.response?.data?.message || 'Unable to update managed branches.');
        } finally {
            setBranchesSaving(false);
        }
    };

    const [previewImage, setPreviewImage] = useState(false);

    const handleInput = (e) => {
        const { name, files, value } = e.target;

        if (name === 'image') {
            setPreviewImage(URL.createObjectURL(files[0]));
        }

        setUserEdit({ ...userEdit, [name]: files?.length ? files[0] : value })

    }

    const handleCheckboxChange = (roleName, checked) => {
        if (checked) {
            setUserEdit(prev => ({
                ...prev, roles: [...prev.roles, roleName]
            }));
        } else {
            setUserEdit(prev => ({
                ...prev, roles: prev.roles.filter(name => name !== roleName)
            }));
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();

        formData.append("name", userEdit.name);
        formData.append("email", userEdit.email);
        formData.append("phone", userEdit.phone);

        if (userEdit.image) {
            formData.append("image", userEdit.image);
        }

        userEdit.roles.forEach(role => {
            formData.append("roles[]", role);
        });

        try {
            formData.append("_method", "PUT");

            const res = await api.post(`/users/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            await showSuccess(res.data.message);
            navigate("/admin/user/");
            // console.log(res);

        } catch (error) {
            showError(error.response.data.message || "Something went wrong");
        }
        finally {
            setLoading(false)
        }
    }

    let html_users = "";

    if (loading) {
        html_users = (<div className="position-relative">
            {/* Content */}
            <div className="text-center">
                <div className="spinner-border text-success" style={{ width: '2rem', height: '2rem' }} />
                {/* <div className="mt-3 fw-semibold">
                            Loading...
                        </div> */}
            </div>
        </div>);
    }

    return (
        <div>
            <div className="glass-card-solid profile-right">
                <div style={{ marginBottom: 20 }}>
                    <div>
                        <div className="section-title" style={{ fontSize: 15 }}>Edit Profile<div className='float-end'>
                            <Link to={`/admin/user`} className="theme-toggle-btn text-decoration-none" title="Cycle theme"><i class="bi bi-house-door"></i> Back To Users Table</Link>
                        </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Update your personal and contact information</div>
                        {html_users}
                    </div>

                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input type="text" name='name' value={userEdit.name} onChange={handleInput} className="form-control" id="profileFirstName" placeholder="First name" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Image</label>
                            <div className='d-flex justify-content-between align-items-center gap-4'>
                                <input type="file" name='image' onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. Alex Rivera" />
                                <div className="">

                                    {
                                        userEdit.image ? <img
                                            src={`${BASE_URL}/uploads/user/${userEdit.image}`} alt="Fav" className="user-preview-image" />
                                            : <img
                                                src="/public/no_image2.jpg"

                                                alt="Fav" className="user-preview-image"
                                            />
                                    }

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" name='email' value={userEdit.email} onChange={handleInput} className="form-control" id="profileEmail" placeholder="your@email.com" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input type="text" name='phone' value={userEdit.phone} onChange={handleInput} className="form-control" id="profileDesignation" placeholder="Phone" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Roles</label>
                        <div className="row">
                            {roles.map((role) => (
                                <div className="col-md-2 mb-2" key={role.id}>
                                    <div className="form-check">

                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            value={role.name}
                                            checked={userEdit.roles.includes(role.name)}
                                            onChange={(e) =>
                                                handleCheckboxChange(role.name, e.target.checked)
                                            }
                                            id={`role-${role.id}`}
                                        />

                                        <label
                                            className="form-check-label"
                                            htmlFor={`role-${role.id}`}
                                        >

                                            <span style={{ fontSize: "13.5px", color: "#64748b" }}> {role.name}</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="divider" />
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type='submit' className="btn-primary" onclick="saveProfile()">
                            <i className="bi bi-check2-circle" /> Save Changes
                        </button>
                        <button className="btn-secondary" onclick="resetProfile()">
                            <i className="bi bi-arrow-counterclockwise" /> Reset
                        </button>
                    </div>
                </form>

                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <label className="form-label">
                        Managed Branches <span className="text-muted" style={{ fontSize: 12 }}>
                            (which branches this user manages — only matters if one of their roles uses the "managed" data scope)
                        </span>
                    </label>

                    {branchesLoading ? (
                        <div className="text-center py-3"><ClipLoader size={16} /> Loading branches...</div>
                    ) : (
                        <>
                            <div className="row">
                                {allBranches.length === 0 && (
                                    <div className="text-muted" style={{ fontSize: 13 }}>No branches available to assign.</div>
                                )}
                                {allBranches.map((branch) => (
                                    <div className="col-md-4 mb-2" key={branch.id}>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={managedBranchIds.includes(branch.id)}
                                                onChange={(e) => handleManagedBranchChange(branch.id, e.target.checked)}
                                                id={`managed-branch-${branch.id}`}
                                            />
                                            <label className="form-check-label" htmlFor={`managed-branch-${branch.id}`}>
                                                <span style={{ fontSize: "13.5px", color: "#64748b" }}>
                                                    {branch.name} {branch.company?.name ? `(${branch.company.name})` : ''}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                                <button type="button" className="btn-primary" disabled={branchesSaving} onClick={handleSaveManagedBranches}>
                                    <i className="bi bi-check2-circle" /> {branchesSaving ? 'Saving...' : 'Save Managed Branches'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div >

        </div >
    )
}

export default UserEdit