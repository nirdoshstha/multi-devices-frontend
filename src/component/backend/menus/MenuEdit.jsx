import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { showError, showSuccess } from '../../../utils/notify';
import api from '../../../api/api';

const MenuEdit = () => {

    useEffect(() => {
        document.title = "Menu Edit";
    }, []);

    const { id } = useParams();
    const navigate = useNavigate();

    const [menus, setMenus] = useState([]);
    const [menu, setMenu] = useState({
        parent_id: "",
        name: "",
        display_name: "",
        permission_id: "",
        route: "",
        rank: ""
    });

    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSpecificData();
    }, [])

    const getSpecificData = async () => {
        try {
            const result = await api.get(`/menus/${id}`)
            setMenu(result.data.menu);
            setMenus(result.data.parents)
            setPermissions(result.data.permissions);
            console.log(result)
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
    }


    const handleInput = (e) => {
        setMenu({ ...menu, [e.target.name]: e.target.value })

    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await api.put(`/menus/${id}`, menu)
            showSuccess(result.data.message);
            navigate("/admin/menu")
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
    }

    return (
        <div>
            <div className="glass-card-solid profile-right">
                <div style={{ marginBottom: 20 }}>
                    <div>
                        <div className="section-title" style={{ fontSize: 15 }}>Edit company<div className='float-end'>
                            <Link to={`/admin/menu`} className="theme-toggle-btn text-decoration-none" title="Cycle theme"><i class="bi bi-house-door"></i> Back To company</Link>
                        </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Update your company information</div>
                    </div>

                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">

                        <div className="form-group">
                            <label className="form-label"> Parent Name</label>
                            <select
                                name="parent_id"
                                className="form-select mb-3"
                                value={menu.parent_id}
                                onChange={handleInput}
                            >
                                <option value=""> Self Parent</option>

                                {menus.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label"> Permission Name</label>
                            <select
                                name="permission_id"
                                className="form-select mb-3"
                                value={menu.permission_id}
                                onChange={handleInput}
                            >
                                <option value=""> Self Permission</option>

                                {permissions.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Menu Name</label>
                            <input type="text" name='name' value={menu.name} onChange={handleInput} className="form-control" placeholder="Menu name" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Display Name</label>
                            <input type="text" name='display_name' value={menu.display_name} onChange={handleInput} className="form-control" placeholder="Menu name" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Route Name</label>
                            <input type="text" name='route' value={menu.route} onChange={handleInput} className="form-control" placeholder="Route name" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Rank</label>
                            <input type="text" name='rank' value={menu.rank} onChange={handleInput} className="form-control" placeholder="Rank" />
                        </div>


                        <div className="form-group">
                            <label className="form-label">Icon</label>
                            <input type="text" name='icon' value={menu.icon} onChange={handleInput} className="form-control" placeholder="Route name" />
                        </div>


                    </div>


                    <div className="divider" />
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type='submit' className="btn-primary" onclick="saveProfile()">
                            <i className="bi bi-check2-circle" /> Save Changes
                        </button>

                    </div>
                </form>
            </div >
        </div>
    )
}

export default MenuEdit