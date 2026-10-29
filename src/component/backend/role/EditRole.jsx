import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import api from '../../../api/api';
import { showError, showSuccess } from '../../../utils/notify';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../../../context/AuthContext';
import { ROLE_SUPER_ADMIN } from '../../../constants/roles';

// Maps a permission group's key (the part of "staffs.index" before the
// dot) to an icon — purely cosmetic, falls back to a generic folder icon
// for any group not listed here so new modules never look broken.
const GROUP_ICONS = {
    staffs: 'bi-people-fill',
    branches: 'bi-geo-alt-fill',
    companys: 'bi-building',
    companies: 'bi-building',
    vendors: 'bi-briefcase-fill',
    users: 'bi-person-gear',
    roles: 'bi-shield-lock-fill',
    'company-devices': 'bi-hdd-network-fill',
    company_devices: 'bi-hdd-network-fill',
    devices: 'bi-cpu-fill',
    attendances: 'bi-calendar-check-fill',
    attendance: 'bi-calendar-check-fill',
    attendance_logs: 'bi-clock-history',
    leave_applications: 'bi-calendar-x-fill',
    leave_types: 'bi-tags-fill',
    calendars: 'bi-calendar3',
    designations: 'bi-award-fill',
    genders: 'bi-gender-ambiguous',
    settings: 'bi-gear-fill',
    menus: 'bi-list-ul',
    about: 'bi-info-circle-fill',
    abouts: 'bi-info-circle-fill',
};

const SCOPE_DESCRIPTIONS = {
    global: 'Everything in the system, across every vendor and company.',
    vendor: "Only the vendor's own companies and their data.",
    company: "Only the user's own company (and its branches).",
    managed: 'Only the branches explicitly assigned to that user.',
    branch: "Only the user's own branch.",
    own: 'Only records that belong to the user themselves.',
};

const EditRole = () => {

    useEffect(() => {
        document.title = "Role Edit";
    }, []);
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const isSuperAdmin = hasRole(ROLE_SUPER_ADMIN);

    const [role, setRole] = useState({
        name: "",
        permissions: []
    })
    const [permissionGroups, setPermissionGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState('');
    const [openGroups, setOpenGroups] = useState({});

    // Data Scope — which companies/branches/records this role can see per
    // module (role_scopes table). Super-Admin-only, drives HasAccessScope.
    const [scopeModules, setScopeModules] = useState([]);
    const [scopeOptions, setScopeOptions] = useState([]);
    const [roleScopes, setRoleScopes] = useState({});
    const [scopeLoading, setScopeLoading] = useState(false);
    const [scopeSaving, setScopeSaving] = useState(false);

    useEffect(() => {
        if (!isSuperAdmin) return;

        let isMounted = true;

        const loadScopes = async () => {
            setScopeLoading(true);
            try {
                const response = await api.get('role-scopes');
                if (!isMounted) return;

                setScopeModules(response.data?.modules ?? []);
                setScopeOptions(response.data?.scopes ?? []);

                const current = (response.data?.roles ?? []).find(
                    (r) => String(r.id) === String(id)
                );
                setRoleScopes(current?.scopes ?? {});
            } catch (error) {
                if (isMounted) {
                    showError(error.response?.data?.message || 'Unable to load data scope.');
                }
            } finally {
                if (isMounted) setScopeLoading(false);
            }
        };

        loadScopes();

        return () => { isMounted = false; };
    }, [id, isSuperAdmin]);

    const handleScopeChange = (module, scope) => {
        setRoleScopes((prev) => ({ ...prev, [module]: scope }));
    };

    const handleScopeSave = async () => {
        setScopeSaving(true);
        try {
            const result = await api.put(`role-scopes/${id}`, { scopes: roleScopes });
            showSuccess(result.data.message);
        } catch (error) {
            showError(error.response?.data?.message || 'Unable to update data scope.');
        } finally {
            setScopeSaving(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const loadRoleData = async () => {
            setLoading(true);
            try {
                const roleResponse = await api.get(`roles/${id}`);

                if (!isMounted) return;

                const roleData = roleResponse.data?.role;
                setRole({
                    name: roleData?.name ?? '',
                    permissions: Array.isArray(roleData?.permissions)
                        ? roleData.permissions.map((permission) => permission.name)
                        : [],
                });

                const groups = roleResponse.data?.permissions && typeof roleResponse.data.permissions === 'object'
                    ? roleResponse.data.permissions
                    : {};
                setPermissionGroups(groups);

                // Open every group by default so the page reads as one
                // continuous, scannable sheet on first load.
                setOpenGroups(
                    Object.keys(groups).reduce((acc, key) => ({ ...acc, [key]: true }), {})
                );
            } catch (error) {
                if (isMounted) {
                    showError(error.response?.data?.message || 'Unable to load role details.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadRoleData();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleCheckboxChange = (permissionName, checked) => {
        setRole(prev => ({
            ...prev,
            permissions: checked
                ? [...prev.permissions, permissionName]
                : prev.permissions.filter(
                    permission => permission !== permissionName
                )
        }));
    };

    const allPermissionNames = Object.values(permissionGroups)
        .flat()
        .map((permission) => permission.name);
    const allPermissionsSelected = allPermissionNames.length > 0
        && allPermissionNames.every((permissionName) => role.permissions.includes(permissionName));

    const handleAllPermissionsChange = (checked) => {
        setRole((currentRole) => ({
            ...currentRole,
            permissions: checked ? allPermissionNames : [],
        }));
    };

    const handleGroupPermissionsChange = (groupPermissions, checked) => {
        const groupPermissionNames = groupPermissions.map((permission) => permission.name);

        setRole((currentRole) => ({
            ...currentRole,
            permissions: checked
                ? [...new Set([...currentRole.permissions, ...groupPermissionNames])]
                : currentRole.permissions.filter(
                    (permissionName) => !groupPermissionNames.includes(permissionName),
                ),
        }));
    };

    const toggleGroupOpen = (groupName) => {
        setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    const toSentenceCase = (value) => {
        const normalizedValue = String(value)
            .replace(/[._-]+/g, ' ')
            .trim()
            .toLowerCase();

        return normalizedValue
            ? `${normalizedValue.charAt(0).toUpperCase()}${normalizedValue.slice(1)}`
            : '';
    };

    const formatChildPermission = (permissionName) => {
        const childPermission = String(permissionName).split('.').slice(1).join('.');
        return toSentenceCase(childPermission || permissionName);
    };

    // Client-side filter — matches either the module name or any
    // permission inside it, so typing "restore" surfaces every module
    // that has a restore action instead of requiring the exact group name.
    const visibleGroups = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return permissionGroups;

        return Object.fromEntries(
            Object.entries(permissionGroups).filter(([groupName, permissions]) => {
                if (groupName.toLowerCase().includes(term)) return true;
                return (Array.isArray(permissions) ? permissions : []).some((permission) =>
                    permission.name.toLowerCase().includes(term)
                );
            })
        );
    }, [permissionGroups, search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const result = await api.put(`roles/${id}`, role)
            showSuccess(result.data.message);
            navigate(`/admin/role`)
        } catch (error) {
            showError(error.response?.data?.message || 'Unable to update the role.');
        }
        finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <div className="role-edit-shell">

                {/* Header */}
                <div className="role-head">
                    <div className="role-head-icon"><i className="bi bi-shield-lock-fill" /></div>
                    <div>
                        <input
                            type="text"
                            value={role.name}
                            onChange={(e) => setRole((currentRole) => ({ ...currentRole, name: e.target.value }))}
                            className="role-head-name-input"
                            placeholder="Role name"
                            required
                        />
                        <div className="role-head-sub">
                            Choose exactly what this role can do, and — for Super Admin — how much of the data it can see.
                        </div>
                    </div>

                    <div className="role-head-stats">
                        <div className="role-stat-chip">
                            <div className="num">{role.permissions.length}</div>
                            <div className="lbl">Granted</div>
                        </div>
                        <div className="role-stat-chip">
                            <div className="num">{allPermissionNames.length}</div>
                            <div className="lbl">Total</div>
                        </div>
                        <div className="role-stat-chip">
                            <div className="num">{Object.keys(permissionGroups).length}</div>
                            <div className="lbl">Modules</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card create-admin-card">

                    <div className="count-badge-row d-flex justify-content-between mb-3">
                        <button type="button" className="theme-toggle-btn" title="Edit role">
                            <i className="bi bi-pencil-square" /> Edit Role & Permission
                        </button>
                        <Link to="/admin/role" className="btn-primary text-decoration-none">
                            <i className="bi bi-house-door" /> Back To Role
                        </Link>
                    </div>

                    {/* Toolbar: search + select-all */}
                    <div className="role-toolbar mb-3">
                        <div className="role-search-box">
                            <i className="bi bi-search" />
                            <input
                                type="text"
                                placeholder="Search a module or permission..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <label className="role-toolbar-switch">
                            <span className="tswitch">
                                <input
                                    type="checkbox"
                                    checked={allPermissionsSelected}
                                    onChange={(e) => handleAllPermissionsChange(e.target.checked)}
                                />
                                <span className="track" />
                            </span>
                            Select all permissions
                        </label>
                    </div>

                    {loading ? (
                        <div className="text-center py-5"><ClipLoader size={16} /> Loading permissions...</div>
                    ) : (
                        <div className="perm-grid mb-4">
                            {Object.keys(visibleGroups).length === 0 ? (
                                <div className="perm-empty">
                                    <i className="bi bi-search" style={{ fontSize: 22, display: 'block', marginBottom: 8 }} />
                                    No module or permission matches "{search}".
                                </div>
                            ) : (
                                Object.entries(visibleGroups).map(([groupName, permissions]) => {
                                    const groupPermissions = Array.isArray(permissions) ? permissions : [];
                                    const selectedCount = groupPermissions.filter((permission) => role.permissions.includes(permission.name)).length;
                                    const groupPermissionsSelected = groupPermissions.length > 0 && selectedCount === groupPermissions.length;
                                    const isOpen = !!openGroups[groupName];
                                    const countClass = selectedCount === 0 ? '' : groupPermissionsSelected ? 'all' : 'some';

                                    return (
                                        <div className={`perm-card ${isOpen ? 'open' : ''} ${selectedCount > 0 ? 'has-selection' : ''}`} key={groupName}>
                                            <div className="perm-card-head" onClick={() => toggleGroupOpen(groupName)}>
                                                <div className="perm-card-icon">
                                                    <i className={`bi ${GROUP_ICONS[groupName] || 'bi-folder2'}`} />
                                                </div>
                                                <div className="perm-card-title">{toSentenceCase(groupName)}</div>
                                                <span className={`perm-card-count ${countClass}`}>{selectedCount}/{groupPermissions.length}</span>

                                                <label className="tswitch" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={groupPermissionsSelected}
                                                        onChange={(event) => handleGroupPermissionsChange(groupPermissions, event.target.checked)}
                                                    />
                                                    <span className="track" />
                                                </label>

                                                <i className="bi bi-chevron-down perm-card-chevron" />
                                            </div>

                                            <div className="perm-card-body">
                                                <div className="perm-card-body-inner">
                                                    <div className="perm-chip-list">
                                                        {groupPermissions.map((permission) => {
                                                            const active = role.permissions.includes(permission.name);
                                                            return (
                                                                <label className={`perm-chip ${active ? 'active' : ''}`} key={permission.id}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={active}
                                                                        onChange={(e) => handleCheckboxChange(permission.name, e.target.checked)}
                                                                    />
                                                                    <span className="dot" />
                                                                    {formatChildPermission(permission.name)}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Data Scope */}
                    {isSuperAdmin && (
                        <div className="scope-board">
                            <div className="scope-board-head">
                                <div className="scope-board-title">
                                    <i className="bi bi-funnel-fill" style={{ color: 'var(--primary)' }} />
                                    Data Scope
                                </div>
                                <div className="scope-board-sub">Super Admin only — how much of each module's data this role can see.</div>
                            </div>

                            <div className="scope-legend">
                                <span><span className="dot" style={{ background: '#7C3AED' }} />Global — everything</span>
                                <span><span className="dot" style={{ background: '#DB2777' }} />Vendor</span>
                                <span><span className="dot" style={{ background: '#2563EB' }} />Company</span>
                                <span><span className="dot" style={{ background: '#D97706' }} />Managed branches</span>
                                <span><span className="dot" style={{ background: '#0D9488' }} />Own branch</span>
                                <span><span className="dot" style={{ background: '#16A34A' }} />Own records only</span>
                            </div>

                            {scopeLoading ? (
                                <div className="text-center py-3"><ClipLoader size={16} /> Loading data scope...</div>
                            ) : (
                                <div className="scope-rows">
                                    {scopeModules.map((module) => {
                                        const current = roleScopes[module] || 'own';
                                        return (
                                            <div className="scope-row" key={module}>
                                                <div className="scope-row-label" title={SCOPE_DESCRIPTIONS[current]}>
                                                    <i className={`bi ${GROUP_ICONS[module] || 'bi-folder2'}`} />
                                                    {toSentenceCase(module)}
                                                </div>
                                                <div className="scope-segment">
                                                    {scopeOptions.map((scope) => (
                                                        <button
                                                            type="button"
                                                            key={scope}
                                                            data-tier={scope}
                                                            className={current === scope ? 'active' : ''}
                                                            title={SCOPE_DESCRIPTIONS[scope]}
                                                            onClick={() => handleScopeChange(module, scope)}
                                                        >
                                                            {scope}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sticky action bar — both saves live together since they
                    describe the same role and are usually edited in one sitting. */}
                <div className="role-sticky-bar">
                    <span className="hint">
                        <i className="bi bi-info-circle" /> Permissions and Data Scope save independently.
                    </span>

                    <button type="button" className="btn-primary" disabled={saving} onClick={handleSubmit}>
                        {saving ? (<><ClipLoader size={14} color="#fff" /> Saving...</>) : (<><i className="bi bi-check-circle" /> Update Role & Permissions</>)}
                    </button>

                    {isSuperAdmin && (
                        <button type="button" className="btn-primary" disabled={scopeSaving} onClick={handleScopeSave}>
                            {scopeSaving ? (<><ClipLoader size={14} color="#fff" /> Saving...</>) : (<><i className="bi bi-check-circle" /> Save Data Scope</>)}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EditRole
