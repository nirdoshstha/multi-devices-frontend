import { useEffect, useState } from 'react'
import '../../assets/backend/style.css'
import { NavLink, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import api, { BASE_URL } from '../../api/api';

import { showError } from '../../utils/notify';
const themes = ['', 'theme-forest', 'theme-violet', 'theme-rose', 'theme-amber', 'theme-dark'];

const MasterLayout = () => {
    const { user, clearAuthState } = useAuth();
    const location = useLocation();

    const [openMenuId, setOpenMenuId] = useState(null);
    const toggleMenu = (id) => {
        setOpenMenuId(prev => (prev === id ? null : id));
    };
    const [menus, setMenus] = useState([]);
    const [themeIdx, setThemeIdx] = useState(0);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const handleThemeToggle = () => {
        const next = (themeIdx + 1) % themes.length;
        document.body.classList.remove(...themes.filter(Boolean));
        if (themes[next]) {
            document.body.classList.add(themes[next]);
        }
        setThemeIdx(next);
    };


    useEffect(() => {
        let isMounted = true;

        const getMenus = async () => {
            try {
                const result = await api.get('/menus');
                const categories = result.data?.category ?? result.data?.menus ?? [];

                if (isMounted) {
                    setMenus(Array.isArray(categories) ? categories : []);
                }
            } catch (error) {
                if (isMounted) {
                    showError(error.response?.data?.message || 'Something went wrong');
                }
            }
        };

        getMenus();

        return () => {
            isMounted = false;
        };
        // Re-fetch whenever the authenticated identity changes (e.g.
        // Super Admin impersonating another user, or returning from
        // impersonation) — MasterLayout stays mounted across that swap
        // since it's not a route change, so this effect would otherwise
        // never re-run and the sidebar would keep showing the previous
        // user's menu under the new token.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);



    const isMenuActive = (menu) =>
        menu.sub_categories?.some(sub =>
            location.pathname.startsWith(`/admin/${sub.route}`)
        );

    const [collapsed, setCollapsed] = useState(false);

    const handleSidebarToggle = () => {
        if (window.innerWidth <= 768) {
            setMobileSidebarOpen(isOpen => !isOpen);
        } else {
            setCollapsed(isCollapsed => !isCollapsed);
        }
    };

    const displayName = user?.name ?? '';
    const roleNames = Array.isArray(user?.roles)
        ? user.roles.map(role => (typeof role === 'string' ? role : role.name)).filter(Boolean).join(', ')
        : '';
    const avatarUrl = user?.image ? `${BASE_URL}/uploads/user/${user.image}` : '/no_image2.jpg';


    return (
        <>
            <aside className={`sidebar ${mobileSidebarOpen ? 'open' : ''}`} id="sidebar" style={{
                width: collapsed ? "64px" : "var(--sidebar-width)"
            }}>
                <div className="sidebar-brand">
                    <div className="brand-icon"><i className="bi bi-grid-3x3-gap-fill" /></div>
                    <div>
                        <div className="brand-name" style={{ fontSize: "15px" }}>Multi Devices System</div>
                        <div className="brand-sub">{displayName}</div>
                    </div>
                </div>
                <nav className="sidebar-nav">


                    {menus.map((menu) => {

                        const hasChildren = menu.sub_categories?.length > 0;
                        const isOpen = openMenuId === menu.id;
                        const active = isMenuActive(menu);

                        if (!hasChildren) {
                            return (
                                <div className="nav-item" key={menu.id}>
                                    <NavLink
                                        to={menu.route}
                                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                                    >
                                        <i className={menu.icon} /> {menu.display_name}
                                    </NavLink>
                                </div>
                            );
                        }

                        return (
                            <div className={`nav-item ${isOpen ? "open" : ""}`} key={menu.id}>
                                <button
                                    type="button"
                                    className={`nav-link nav-dropdown ${active ? "active" : ""}`}
                                    onClick={() => toggleMenu(menu.id)}
                                >
                                    <span>
                                        <i className={menu.icon} /> <span className='px-2'>{menu.display_name}</span>
                                    </span>
                                    <i className={`bi ${isOpen ? "bi-chevron-down" : "bi-chevron-right"}`} />
                                </button>

                                <div className={`submenu ${isOpen ? "show" : ""}`} style={{ marginTop: "5px" }}>
                                    {menu.sub_categories.map((submenu) => (
                                        <NavLink
                                            key={submenu.id}
                                            to={submenu.route}
                                            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                                        >
                                            <i className={submenu.icon} />{submenu.display_name}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </nav>
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <img src={avatarUrl} alt="Profile" className="sidebar-user-img" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.15)' }} />
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{displayName}</div>
                            <div className="sidebar-user-role">{roleNames}</div>
                        </div>
                        <button type="button" onClick={clearAuthState} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }} title="Logout">
                            <i className="bi bi-box-arrow-right" />
                        </button>
                    </div>
                </div>
            </aside>
            <div className="main-wrap" id="mainWrap" style={{
                marginLeft: collapsed ? "64px" : "var(--sidebar-width)"
            }}>
                <header className="top-navbar">

                    <button
                        type="button"
                        className="nav-toggle-btn"
                        onClick={handleSidebarToggle}
                    >
                        <i className="bi bi-list"></i>
                    </button>

                    <div className="nav-breadcrumb">
                        <i className="bi bi-house" style={{ fontSize: 13 }} />
                        <i className="bi bi-chevron-right" style={{ fontSize: 10, color: '#CBD5E1' }} />
                        <span>Dashboard</span>
                    </div>
                    <div className="navbar-right">
                        <button type="button" className="theme-toggle-btn" onClick={handleThemeToggle} title="Cycle theme">

                            <i className="bi bi-palette" /> Theme
                        </button>
                        <button type="button" className="icon-btn" title="Search">
                            <i className="bi bi-search" />
                        </button>
                        <button type="button" className="icon-btn" title="Notifications">
                            <i className="bi bi-bell" />
                            <span className="notif-dot" />
                        </button>
                        <button type="button" className="icon-btn" title="Messages">
                            <i className="bi bi-chat-dots" />
                        </button>
                        <img src={avatarUrl} alt="Profile" className="navbar-avatar" />
                    </div>
                </header>
                <main className="page-body">

                    <Outlet />

                </main>
            </div>

        </>

    )
}

export default MasterLayout
