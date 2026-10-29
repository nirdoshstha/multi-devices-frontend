import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import { showError, showSuccess } from "../../../utils/notify";
import confirmDelete from "../../../utils/confirmDelete";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/api";
import Accordion from "react-bootstrap/Accordion";
import { Link } from "react-router";
import Select from "react-select";

const Menu = () => {
  useEffect(() => {
    document.title = "Menus";
  }, []);
  const { can } = useAuth();

  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState({
    parent_id: "",
    name: "",
    permission_id: '',
    rank: "",
    route: "",
    icon: ""
  });
  const [menus, setMenus] = useState([]);
  const [category, setCategory] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const handleInput = (e) => {
    setMenu({ ...menu, [e.target.name]: e.target.value });
  };

  const permissionOptions = permissions.map((permission) => ({
    value: String(permission.id),
    label: permission.name,
  }));
  const parentOptions = category.map((parent) => ({
    value: String(parent.id),
    label: parent.display_name || parent.name,
  }));
  const selectedPermission = permissionOptions.find(
    (option) => option.value === String(menu.permission_id),
  ) ?? null;
  const selectedParent = parentOptions.find(
    (option) => option.value === String(menu.parent_id),
  ) ?? null;
  const selectStyles = {
    control: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: '#fff',
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: '#fff',
    }),
  };

  const handlePermissionChange = (option) => {
    setMenu((currentMenu) => ({
      ...currentMenu,
      permission_id: option?.value ?? '',
    }));
  };

  const handleParentChange = (option) => {
    setMenu((currentMenu) => ({
      ...currentMenu,
      parent_id: option?.value ?? '',
    }));
  };

  async function fetchDatas() {
    try {
      const result = await api.get('/menus');
      setMenus(Array.isArray(result.data?.menus) ? result.data.menus : []);
      setCategory(Array.isArray(result.data?.category) ? result.data.category : []);
      setPermissions(Array.isArray(result.data?.permissions) ? result.data.permissions : []);
    } catch (error) {
      showError(error.response?.data?.message || 'Unable to load menus.');
    }
  }

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const result = await api.get('/menus');

        if (isMounted) {
          setMenus(Array.isArray(result.data?.menus) ? result.data.menus : []);
          setCategory(Array.isArray(result.data?.category) ? result.data.category : []);
          setPermissions(Array.isArray(result.data?.permissions) ? result.data.permissions : []);
        }
      } catch (error) {
        if (isMounted) {
          showError(error.response?.data?.message || 'Unable to load menus.');
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await api.post(`/menus`, menu);
      showSuccess(result.data.message);
      fetchDatas();
      setMenu({
        parent_id: "",
        name: "",
        permission_id: '',
        route: "",
        rank: "",
        icon: ""
      });
    } catch (error) {
      showError(error.response?.data?.message || 'Unable to save the menu.');
    } finally {
      setLoading(false);
    }
  };

  const deleteMenu = async (id) => {
    const confirmed = await confirmDelete();
    if (!confirmed) return;
    setLoading(true);

    try {
      const result = await api.delete(`/menus/${id}`);
      showSuccess(result.data.message);
      fetchDatas();
    } catch (error) {
      showError(error.response?.data?.message || 'Unable to delete the menu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-mgmt">
        <div className="admin-mgmt-grid">
          {/* Create Admin Form */}
          <div className="glass-card create-admin-card">
            <div className="count-badge-row d-flex justify-content-between">
              <button type="button" className="theme-toggle-btn" title="Create a new menu">
                <i
                  className="bi bi-plus-circle"
                  style={{ fontSize: "14px" }}
                ></i>
                Create New Menu
              </button>
              <div className="count-icon">
                <i className="bi bi-shield-person-fill" /> {menus?.length || 0}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <Select
                  inputId="parent_id"
                  classNamePrefix="parent-select"
                  options={parentOptions}
                  value={selectedParent}
                  onChange={handleParentChange}
                  styles={selectStyles}
                  placeholder="Search or select a parent menu"
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No parent menus found"}
                />
              </div>

              <div className="form-group mb-3">
                <Select
                  inputId="permission_id"
                  classNamePrefix="permission-select"
                  options={permissionOptions}
                  value={selectedPermission}
                  onChange={handlePermissionChange}
                  styles={selectStyles}
                  placeholder="Search or select a permission"
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No permissions found"}
                />
              </div>



              <div className="form-floating">
                <input
                  type="text"
                  name="name"
                  value={menu?.name}
                  onChange={handleInput}
                  className="form-control"
                  id="menuName"
                  placeholder="Menu Name"
                />
                <label htmlFor="menuName">Menu Name</label>
              </div>


              <div className="form-floating">
                <input
                  type="text"
                  name="display_name"
                  value={menu?.display_name}
                  onChange={handleInput}
                  className="form-control"
                  id="menuName"
                  placeholder="Display Name"
                />
                <label htmlFor="menuName">Display Name</label>
              </div>

              <div className="form-floating">
                <input
                  type="text"
                  name="route"
                  value={menu?.route}
                  onChange={handleInput}
                  className="form-control"
                  id="route"
                  placeholder="Route Name"
                />
                <label htmlFor="route">Route Name</label>
              </div>

              <div className="form-floating">
                <input
                  type="number"
                  name="rank"
                  value={menu?.rank}
                  onChange={handleInput}
                  className="form-control"
                  id="rank"
                  placeholder="Rank"
                />
                <label htmlFor="rank">Rank</label>
              </div>

              <div className="form-floating">
                <input
                  type="text"
                  name="icon"
                  value={menu?.icon}
                  onChange={handleInput}
                  className="form-control"
                  id="icon"
                  placeholder="bi bi-users"
                />
                <label htmlFor="icon">Icon (for example: bi bi-users)</label>
              </div>

              {can("menus.store") && (
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {loading && <PulseLoader color="white" size={12} />}
                  <i className="bi bi-person-plus-fill" /> Create menu Account
                </button>
              )}
            </form>
          </div>
          {/* Admin List */}
          <div className="glass-card-solid admin-list-card">
            <div className="admin-table-header">
              <div>
                <div className="section-title" style={{ fontSize: 15 }}>
                  Menu Accounts
                </div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>
                  Manage existing administrator accounts
                </div>
              </div>

            </div>
            <div style={{ overflowX: "auto" }}>


              {category.map((item, index) => {
                return (

                  <Accordion key={item.id} defaultActiveKey="0">
                    <Accordion.Item eventKey={String(item.id)}>
                      <Accordion.Header>
                        <span className="form-label me-2">
                          # {index + 1}
                        </span>

                        {can("menus.update") && (
                          <Link
                            to={`/admin/menu/edit/${item.id}`}
                            className="btn-edit-sm me-2"
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                        )}

                        {can("menus.destroy") && (
                          <button
                            type="button"
                            className="btn-danger-sm me-2"
                            onClick={() => deleteMenu(item.id)}
                            title="Delete"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        )}

                        <span className="form-label">
                          {item.display_name}
                          <span className="gap-5">
                            ({item.sub_categories.length})
                          </span>
                          <i className={`${item.icon} ms-4`}></i>
                        </span>
                      </Accordion.Header>

                      <Accordion.Body>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>S.no</th>
                              <th>Name</th>
                              <th>Route Name</th>
                              <th>Rank</th>
                              <th>Icon</th>
                              <th>Actions</th>
                            </tr>
                          </thead>

                          <tbody>
                            {item.sub_categories.map((menu, index) => (
                              <tr key={menu.id}>
                                <td>{index + 1}</td>

                                <td>{menu.name}</td>

                                <td>{menu.route}</td>

                                <td>{menu.rank}</td>

                                <td>
                                  <i className={menu.icon}></i>
                                </td>

                                <td>
                                  <div className="table-actions">
                                    {can("menus.update") && (
                                      <Link
                                        to={`/admin/menu/edit/${menu.id}`}
                                        className="btn-edit-sm"
                                        title="Edit"
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </Link>
                                    )}

                                    {can("menus.destroy") && (
                                      <button
                                        type="button"
                                        className="btn-danger-sm"
                                        onClick={() => deleteMenu(menu.id)}
                                        title="Delete"
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
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                );
              })}
            </div>
            {category.length === 0 && (
              <div style={{ textAlign: "center", padding: 36, color: "#94A3B8" }}>
                <i
                  className="bi bi-person-x"
                  style={{ fontSize: 36, marginBottom: 10, display: "block" }}
                />
                No admins found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
