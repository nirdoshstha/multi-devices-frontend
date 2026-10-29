import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import moment from "moment";

import api from "../../../api/api";
import { showError } from "../../../utils/notify";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../../../context/AuthContext";
import { ROLE_SUPER_ADMIN } from "../../../constants/roles";

// Kept in sync with EditRole.jsx so a role looks the same whether you're
// viewing or editing it.
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

const ShowRole = () => {
    const { id } = useParams();
    const { hasRole } = useAuth();
    const isSuperAdmin = hasRole(ROLE_SUPER_ADMIN);

    const [role, setRole] = useState(null);
    const [permissionGroups, setPermissionGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [openGroups, setOpenGroups] = useState({});

    const [scopeModules, setScopeModules] = useState([]);
    const [roleScopes, setRoleScopes] = useState({});
    const [scopeLoading, setScopeLoading] = useState(false);

    useEffect(() => {
        fetchRole();
    }, [id]);

    useEffect(() => {
        if (!isSuperAdmin) return;

        let isMounted = true;

        const loadScopes = async () => {
            setScopeLoading(true);
            try {
                const response = await api.get('role-scopes');
                if (!isMounted) return;

                setScopeModules(response.data?.modules ?? []);
                const current = (response.data?.roles ?? []).find(
                    (r) => String(r.id) === String(id)
                );
                setRoleScopes(current?.scopes ?? {});
            } catch {
                // Non-essential for the view page — permissions are the
                // primary content, so a scope-load failure stays silent.
            } finally {
                if (isMounted) setScopeLoading(false);
            }
        };

        loadScopes();

        return () => { isMounted = false; };
    }, [id, isSuperAdmin]);

    const fetchRole = async () => {
        setLoading(true);
        try {
            const result = await api.get(`roles/${id}`);
            setRole(result.data.role);

            const groups = result.data.permissions && typeof result.data.permissions === 'object'
                ? result.data.permissions
                : {};
            setPermissionGroups(groups);
            setOpenGroups(
                Object.keys(groups).reduce((acc, key) => ({ ...acc, [key]: true }), {})
            );
        } catch (error) {
            showError(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
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

    const grantedNames = useMemo(
        () => new Set((role?.permissions ?? []).map((permission) => permission.name)),
        [role]
    );

    const totalPermissionCount = Object.values(permissionGroups).flat().length;

    return (
        <div>
            <div className="role-edit-shell">

                {/* Header */}
                <div className="role-head">
                    <div className="role-head-icon"><i className="bi bi-shield-lock-fill" /></div>
                    <div>
                        <h5 className="mb-0 text-white">{role?.name || (loading ? 'Loading...' : '-')}</h5>
                        <div className="role-head-sub">
                            Read-only view — granted permissions are highlighted, everything else is this role's ceiling.
                        </div>
                    </div>

                    <div className="role-head-stats">
                        <div className="role-stat-chip">
                            <div className="num">{grantedNames.size}</div>
                            <div className="lbl">Granted</div>
                        </div>
                        <div className="role-stat-chip">
                            <div className="num">{totalPermissionCount}</div>
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
                        <button type="button" className="theme-toggle-btn" title="View role">
                            <i className="bi bi-eye" /> View Role
                        </button>
                        <Link to="/admin/role" className="btn-primary text-decoration-none">
                            <i className="bi bi-house-door" /> Back To Role
                        </Link>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="info-card">
                                <span className="info-label">Created Date</span>
                                <h6>{role?.created_at ? moment(role.created_at).format("LLL") : "-"}</h6>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="info-card">
                                <span className="info-label">Updated Date</span>
                                <h6>{role?.updated_at ? moment(role.updated_at).format("LLL") : "-"}</h6>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5"><ClipLoader size={16} /> Loading permissions...</div>
                    ) : (
                        <div className="perm-grid mb-4">
                            {Object.entries(permissionGroups).map(([groupName, permissions]) => {
                                const groupPermissions = Array.isArray(permissions) ? permissions : [];
                                const selectedCount = groupPermissions.filter((permission) => grantedNames.has(permission.name)).length;
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
                                            <i className="bi bi-chevron-down perm-card-chevron" />
                                        </div>

                                        <div className="perm-card-body">
                                            <div className="perm-card-body-inner">
                                                <div className="perm-chip-list">
                                                    {groupPermissions.length === 0 ? (
                                                        <span className="text-muted" style={{ fontSize: 12.5 }}>No permissions in this module.</span>
                                                    ) : groupPermissions.map((permission) => {
                                                        const active = grantedNames.has(permission.name);
                                                        return (
                                                            <span className={`perm-chip perm-chip-readonly ${active ? 'active' : ''}`} key={permission.id}>
                                                                <i className={`bi ${active ? 'bi-check-circle-fill' : 'bi-dash-circle'}`} />
                                                                {formatChildPermission(permission.name)}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Data Scope — read-only */}
                    {isSuperAdmin && (
                        <div className="scope-board">
                            <div className="scope-board-head">
                                <div className="scope-board-title">
                                    <i className="bi bi-funnel-fill" style={{ color: 'var(--primary)' }} />
                                    Data Scope
                                </div>
                                <div className="scope-board-sub">How much of each module's data this role can see.</div>
                            </div>

                            {scopeLoading ? (
                                <div className="text-center py-3"><ClipLoader size={16} /> Loading data scope...</div>
                            ) : (
                                <div className="scope-rows">
                                    {scopeModules.map((module) => {
                                        const current = roleScopes[module] || 'own';
                                        return (
                                            <div className="scope-row" key={module}>
                                                <div className="scope-row-label">
                                                    <i className={`bi ${GROUP_ICONS[module] || 'bi-folder2'}`} />
                                                    {toSentenceCase(module)}
                                                </div>
                                                <div className="scope-segment">
                                                    <button type="button" className="active" data-tier={current} title={SCOPE_DESCRIPTIONS[current]} disabled>
                                                        {current}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShowRole;
