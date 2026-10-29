import moment from 'moment/moment';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router';
import { ClipLoader, PulseLoader } from 'react-spinners';
import { showError, showSuccess } from '../../../utils/notify';
import api, { BASE_URL } from '../../../api/api';
import noimage from '../../../../public/no_image2.jpg'
import confirmDelete from '../../../utils/confirmDelete';
import { useAuth } from '../../../context/AuthContext';
import Pagination from '../common/Pagination';


const User = () => {

    const navigate = useNavigate();

    useEffect(() => {
        document.title = "User ";
    }, []);

    useEffect(() => {
        document.title = "User";
    }, []);

    const { can, startImpersonation } = useAuth();

    const [userAdd, setUserAdd] = useState({
        image: null,
        name: '',
        email: "",
        phone: "",
        roles: [],
    })
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const datasPerPage = 10;

    useEffect(() => {
        getUsers(1);
    }, []);

    const getUsers = async (page = currentPage) => {
        setLoading(true);
        try {
            const result = await api.get(`/users/`, {
                params: { page, per_page: datasPerPage },
            });
            setUsers(result.data.users.data);
            setCurrentPage(result.data.users.current_page);
            setLastPage(result.data.users.last_page);
            setTotalUsers(result.data.users.total);
            setRoles(result.data.roles);
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

        if (name === 'image') {
            setPreviewImage(URL.createObjectURL(files[0]))
        }

        setUserAdd({ ...userAdd, [name]: files?.length ? files[0] : value })
    }



    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        // const formData = new FormData();
        // Object.keys(userAdd).forEach(key => {
        //     formData.append(key, userAdd[key]);
        // });
        const formData = new FormData();

        formData.append("name", userAdd.name);
        formData.append("email", userAdd.email);
        formData.append("password", userAdd.password);
        formData.append("phone", userAdd.phone);

        if (userAdd.image) {
            formData.append("image", userAdd.image);
        }

        userAdd.roles.forEach(role => {
            formData.append("roles[]", role);
        });

        try {
            const result = await api.post(`/users`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
            showSuccess(result.data.message);
            getUsers();
            setUserAdd({
                name: "",
                email: "",
                phone: "",
                roles: [],
            });
            setPreviewImage(null)
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
        finally {
            setLoading(false)
        }
    }

    const handleCheckboxChange = (roleName, checked) => {
        if (checked) {
            setUserAdd(prev => ({
                ...prev, roles: [...prev.roles, roleName]
            }));
        } else {
            setUserAdd(prev => ({
                ...prev, roles: prev.roles.filter(name => name !== roleName)
            }));
        }
    };

    const deleteUser = async (id) => {
        const confirmed = await confirmDelete();
        if (!confirmed) return;

        try {
            const result = await api.delete(`/users/${id}`)
            showSuccess(result.data.message);
            getUsers();

        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }

    }

    const handlePageChange = (page) => {
        if (page < 1 || page > lastPage) return;
        search.trim() ? searchUsers(page) : getUsers(page);
    };

    let html_users = "";

    if (loading) {
        html_users = (
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



    const searchUsers = async (page = 1) => {
        setLoading(true);

        try {
            const result = await api.get('/users/search', {
                params: { search: search.trim(), page, per_page: datasPerPage },
            });

            setUsers(result.data.users.data || []);
            setCurrentPage(result.data.users.current_page);
            setLastPage(result.data.users.last_page);
            setTotalUsers(result.data.users.total);
        } catch (error) {
            console.error(error.response);
            showError(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitSearch = async (e) => {
        e.preventDefault();
        searchUsers(1);
    };

    // Optional: auto-reset to full list when the search box is cleared
    useEffect(() => {
        if (search.trim() === "") {
            getUsers(1);
        }
    }, [search]);


    const superAdminCan = async (userId) => {
        try {
            const result = await api.post(`/superadmin-can-go-any-dashboard`,
                {
                    userId: userId,
                }
            );

            if (result.data.success) {
                await startImpersonation(result.data.token);
                navigate("/admin/dashboard");
            }

        } catch (error) {
            showError(
                error.response?.data?.message ||
                "Something went wrong"
            );
        }
    };


    return (
        <div>
            <div className="admin-mgmt">
                <div className="admin-mgmt-grid">
                    {/* Create Admin Form */}
                    <div className="glass-card create-admin-card">
                        <div className="count-badge-row d-flex justify-content-between">
                            <button class="theme-toggle-btn" title="Cycle theme"><i className="bi bi-plus-circle" style={{ fontSize: "14px" }}></i> Create New User </button>

                            <div className="count-icon"><i className="bi bi-shield-person-fill" /> {totalUsers || 0}</div>
                        </div>


                        <form onSubmit={handleSubmit} autoComplete='off' >
                            <div class="form-floating">
                                <input type="text" name='name' value={userAdd.name} onChange={handleInput} className="form-control" id="floatinginput" placeholder="e.g. Alex Rivera" />
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
                                    type="email"
                                    name="email"
                                    value={userAdd.email}
                                    onChange={handleInput}
                                    className="form-control"
                                    id="floatingEmail"
                                    placeholder="Email"
                                />
                                <label htmlFor="floatingEmail">Email</label>
                            </div>

                            <div className="form-floating mb-0">
                                <input
                                    type="password"
                                    name="password"
                                    value={userAdd.password}
                                    onChange={handleInput}
                                    className="form-control"
                                    id="floatingPassword"
                                    placeholder="Password"
                                />
                                <label htmlFor="floatingPassword">Password</label>
                            </div>

                            <div className="form-floating mb-0">
                                <input
                                    type="text"
                                    name="phone"
                                    value={userAdd.phone}
                                    onChange={handleInput}
                                    className="form-control"
                                    id="floatingPhone"
                                    placeholder="Phone"
                                />
                                <label htmlFor="floatingPhone">Phone</label>
                            </div>

                            <div className="row">
                                <label class="form-label">Role</label>
                                {roles.map((role) => (
                                    <div className="col-md-4 mb-2" key={role.id}>
                                        <div className="form-check">

                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                name="roles"
                                                value={role.name}
                                                checked={userAdd.roles.includes(role.name)}
                                                onChange={(e) =>
                                                    handleCheckboxChange(role.name, e.target.checked)
                                                }
                                                id={`role-${role.id}`}
                                            />

                                            <label
                                                className="form-check-label"
                                                htmlFor={`role-${role.id}`}
                                            >

                                                <span style={{ fontSize: "13.5px", color: "#64748b" }}>{role.name}</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: "20px" }}>
                                {
                                    can("users.store") && (
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
                                <div className="section-title" style={{ fontSize: 15 }}>User Accounts</div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>Manage existing administrator accounts</div>
                            </div>

                            <form onSubmit={handleSubmitSearch}>
                                <div className="search-box float-end">



                                    {
                                        can('users.search') && (
                                            <div className="search-box float-end">
                                                <input
                                                    type="text"
                                                    name="search"
                                                    className="form-control"
                                                    placeholder="Search by name or role..."
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                />
                                                <i className="bi bi-search" />
                                            </div>
                                        )
                                    }


                                </div>
                            </form>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="admin-table" id="adminTable">
                                <thead>
                                    <tr>
                                        <th>S.no</th>
                                        <th>Name</th>
                                        <th>Roles</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>
                                                {(currentPage - 1) * datasPerPage + index + 1}
                                            </td>

                                            <td>
                                                <div className="admin-name-cell">
                                                    <div
                                                        className="avatar-initials"
                                                        style={{ background: "#141414aa" }}
                                                    >
                                                        {item.image ? (
                                                            <img
                                                                src={`${BASE_URL}/uploads/user/${item.image}`}
                                                                alt="Profile"
                                                                className="navbar-avatar"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={noimage}
                                                                alt="Profile"
                                                                className="navbar-avatar"
                                                            />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <div className="admin-name">
                                                            {item.name}
                                                        </div>

                                                        <div className="admin-email">
                                                            {item.email}
                                                        </div>

                                                        <div className="admin-email">
                                                            {item.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                {item.roles?.map((role) => (
                                                    <span
                                                        key={role.id}
                                                        className="status-pill active m-1"
                                                    >
                                                        {role.name}
                                                    </span>
                                                ))}
                                            </td>

                                            <td>
                                                {moment(item.created_at).format("LL")}
                                            </td>

                                            <td>
                                                <div className="table-actions">

                                                    {can("users.impersonate") && (
                                                        <button
                                                            type="button"
                                                            onClick={() => superAdminCan(item.id)}
                                                            className="btn-edit-sm"
                                                            title="Go to Dashboard"
                                                        >
                                                            <i className="bi bi-unlock"></i>
                                                        </button>
                                                    )}

                                                    {can("users.update") && (
                                                        <Link
                                                            to={`/admin/user/${item.id}/edit`}
                                                            className="btn-edit-sm"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </Link>
                                                    )}

                                                    {can("users.destroy") && (
                                                        <button
                                                            onClick={() => deleteUser(item.id)}
                                                            className="btn-danger-sm"
                                                        >
                                                            <i className="bi bi-trash3"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <Pagination currentPage={currentPage} lastPage={lastPage} onChange={handlePageChange} />


                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default User