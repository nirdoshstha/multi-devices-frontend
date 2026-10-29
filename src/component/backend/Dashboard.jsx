import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api, { BASE_URL } from '../../api/api';
import { showError, showSuccess } from '../../utils/notify';
import { Link } from 'react-router';
import { ClipLoader, PulseLoader } from 'react-spinners';
import * as bootstrap from "bootstrap";
import moment from 'moment/moment';
// import noimage from '../../../public/no_image.jpg'
import DOMPurify from 'dompurify'
import noimage from '../../../public/no_image2.jpg'

import NepaliCalendar, { getTodayBs } from "@krbaidik/react-nepali-patro";

const Dashboard = () => {

    useEffect(() => {
        document.title = "Admin Dashboard";
    }, []);

    const token = localStorage.getItem("auth_token");

    const [selected, setSelected] = useState("");
    const [calendars, setCalendars] = useState([]);

    const { user, updateAuthState, impersonating, stopImpersonation } = useAuth();
    const [previewImage, setPreviewImage] = useState(false);
    const [loading, setLoading] = useState(false);

    const [getUser, setGetUser] = useState({
        image: null,
        name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        if (user) {
            setGetUser({
                image: user.image || null,
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
            });
        }
    }, [user]);

    const handleInput = (e) => {
        const { name, value, files } = e.target;

        if (name === 'image') {
            setPreviewImage(URL.createObjectURL(files[0]));
        }

        setGetUser({ ...getUser, [name]: files?.length ? files[0] : value });
    }

    const [changePassword, setChangePassword] = useState({
        password: "",
        new_password: "",
        cnew_password: "",
    })

    const submitChangePassword = async (e) => {
        e.preventDefault();

        try {
            const result = await api.put(`/users/update-password/${user.id}`, changePassword);
            console.log(result);
            showSuccess(result.data.message)
            setChangePassword({
                password: "",
                new_password: "",
                cnew_password: ""
            })
        } catch (error) {
            showError(error.response.data.message);
        }
    }

    const submitAuthProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("name", getUser.name);
        formData.append("email", getUser.email);
        formData.append("phone", getUser.phone);

        if (getUser.image) {
            formData.append("image", getUser.image);
        }

        try {
            //  formData.append("_method", "PUT");
            const result = await api.post(`/users/${user.id}?_method=PUT`, formData);

            // Update AuthContext
            updateAuthState(localStorage.getItem("auth_token"), result.data.user);

            // Update local form values
            setGetUser({
                name: result.data.user.name || "",
                email: result.data.user.email || "",
                phone: result.data.user.phone || "",
            });

            showSuccess(result.data.message);

        } catch (error) {
            showError(
                error.response?.data?.message || "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };


    const getCalendarHolidays = async (year, month) => {
        try {
            const result = await api.get("/calendars", {
                params: {
                    year: year,
                    month: month,
                },
            });

            setCalendars(result.data.data);

            console.log(result.data);
        } catch (error) {
            showError(
                error.response?.data?.message || "Something went wrong"
            );
        }
    };


    const backToSuperAdmin = async () => {
        const restored = await stopImpersonation();

        if (!restored) {
            showError("Original Super Admin session not found.");
        }
    };

    const stripHtml = (html = "") => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
    };
    return (
        <div>
            {/* Page Header */}
            <div className='d-flex justify-content-between'>
                <div className="page-header">
                    <div className="page-title">Admin Dashboard</div>
                    <div className="page-sub">Welcome back, <span className='text-primary'>{user.name || ""}</span>  Here's what's happening today.</div>
                </div>
                {impersonating && (
                    <button
                        type="button"
                        className="theme-toggle-btn"
                        onClick={backToSuperAdmin}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Super Admin
                    </button>
                )}
            </div>
            {/* STAT CARDS */}


            {/* ADMIN PROFILE SECTION */}
            {/* <div className="section-header">
                <div>
                    <div className="section-title">Admin Profile</div>
                    <div className="section-sub">View and update your personal information</div>
                </div>
            </div> */}
            <div className="profile-section" style={{ marginBottom: 28 }}>
                {/* Left: Profile Card */}
                <div className="glass-card profile-left">
                    <div className="profile-avatar-wrap">
                        {/* <img src="" alt="" className="profile-avatar" id="profileAvatarImg" />
                        <span className="profile-online-dot" /> */}

                        {/* {
                            user.image ? <img src={`${BASE_URL}/uploads/user/${user.image}`} alt="Profile" className="profile-avatar" />
                                : <img alt="Profile" className="profile-avatar" src={noimage} />
                        } */}

                        {
                            <img
                                src={
                                    previewImage ||
                                    (getUser.image
                                        ? `${BASE_URL}/uploads/user/${getUser.image}`
                                        : noimage)
                                }
                                alt="Fav" className="profile-avatar" style={{ objectFit: "contain" }}
                            />
                        }
                    </div>
                    <div className="profile-name" id="profileDisplayName">{user?.name}</div>
                    <div className="profile-role" id="profileDisplayRole">{user?.email}</div>
                    <div className="profile-badge"><i className="bi bi-patch-check-fill" />{user.roles?.map(role => role.name).join(", ") || ""}</div>
                    <div className="profile-role" id="profileDisplayName"> <b>Joined</b>: {moment(user.created_at).format('LLLL')}</div>
                    <div className="divider" style={{ width: '100%' }} />

                    <div className="social-icons">
                        <a href="#" className="social-icon" title="LinkedIn"><i className="bi bi-linkedin" /></a>
                        <a href="#" className="social-icon" title="Twitter"><i className="bi bi-twitter-x" /></a>
                        <a href="#" className="social-icon" title="GitHub"><i className="bi bi-github" /></a>
                        <a href="#" className="social-icon" title="Email"><i className="bi bi-envelope-fill" /></a>
                    </div>
                </div>
                {/* Right: Edit Form */}
                <div className="glass-card-solid profile-right">
                    {/* <div style={{ marginBottom: 20 }}>
                        <div className="section-title" style={{ fontSize: 15 }}>Edit Profile</div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Update your personal and password information</div>
                    </div> */}

                    <div>
                        <div className="admin-mgmt">
                            <div className="glass-card create-admin-card">
                                <ul className="nav nav-pills mb-3 gap-4" id="pills-tab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-links active" id="pills-calendar-tab" data-bs-toggle="pill" data-bs-target="#pills-calendar" type="button" role="tab" aria-controls="pills-calendar" aria-selected="true">Holidays & Events Management.</button>
                                    </li>

                                    <li className="nav-item" role="presentation">
                                        <button className="nav-links" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true">Personal Information.</button>
                                    </li>

                                    <li className="nav-item" role="presentation">
                                        <button className="nav-links" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">Account Password.</button>
                                    </li>


                                </ul>
                                <div className="tab-content" id="pills-tabContent">

                                    <div className="tab-pane fade show active" id="pills-calendar" role="tabpanel" aria-labelledby="pills-calendar-tab" tabIndex={0}>
                                        <div className='row'>

                                            <div className='col-lg-9'>
                                                {/* <div className="section-header">
                                                    <div>
                                                        <div className="section-title">Holiday & Events Management</div>
                                                        <div className="section-sub"> Edit your holiday & events update in the Calendar</div>
                                                    </div>
                                                </div> */}

                                                <NepaliCalendar
                                                    year={getTodayBs().year}
                                                    month={getTodayBs().month}
                                                    api={`${BASE_URL}/api/calendars`}
                                                    apiHeaders={{
                                                        Authorization: `Bearer ${token}`,
                                                    }}
                                                    onDateClick={setSelected}
                                                    brandColor="linear-gradient(135deg, #2563EB, #06B6D4);"
                                                    onError={(error) => console.error(error)}
                                                    canAddEvent={true}
                                                    onMonthChange={(year, month) => {
                                                        getCalendarHolidays(year, month);
                                                    }}
                                                />
                                            </div>

                                            <div className='col-lg-3 mb-5'>
                                                <div className='row'>
                                                    <div className="col-lg-12">
                                                        {
                                                            calendars.slice(0, 6).map((item) => {
                                                                return (
                                                                    <div key={item.id} className="calendar-event-card d-flex align-items-center mb-2">
                                                                        {/* Image */}
                                                                        <div className="event-image-box flex-shrink-0">

                                                                            {
                                                                                item.image ?
                                                                                    <img
                                                                                        src={item.image}
                                                                                        alt="Fav"
                                                                                        className="event-image"
                                                                                        style={{ objectFit: "cover" }}
                                                                                    />
                                                                                    :
                                                                                    <img
                                                                                        src={noimage}
                                                                                        alt="Fav"
                                                                                        className="event-image"
                                                                                        style={{ objectFit: "cover" }}
                                                                                    />
                                                                            }

                                                                        </div>

                                                                        {/* Content */}
                                                                        <div className="event-content flex-grow-1">
                                                                            <div className="d-flex align-items-center gap-2 flex-wrap">

                                                                                {/* Title */}
                                                                                <h5 className="event-title mb-0">
                                                                                    {/* <i className="bi bi-calendar3"></i> */}
                                                                                    <span className='text-muted'>{item.date || ""}</span><br />
                                                                                    {item.title || ""}
                                                                                </h5>
                                                                            </div>
                                                                            <div className="event-date">

                                                                                {/* <p className='textcolor textheight textmargin'>
                                                        <div dangerouslySetInnerHTML={{
                                                            __html: DOMPurify.sanitize(item.description?.length > 40
                                                                ? item.about.description.substring(0, 40) + "....."
                                                                : item.description || ""),
                                                        }} /></p> */}
                                                                                <p className="bottomlast">
                                                                                    {item.description ? stripHtml(item.description).slice(0, 35) + "..." : ""}
                                                                                </p>
                                                                            </div>
                                                                        </div>


                                                                    </div>
                                                                )
                                                            })
                                                        }

                                                    </div>

                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane fade show" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab" tabIndex={0}>
                                        <form onSubmit={submitAuthProfileUpdate}>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label className="form-label">First Name</label>

                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={getUser.name}
                                                        onChange={handleInput}
                                                        className="form-control"
                                                        placeholder="First name"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Image</label>

                                                    <input
                                                        type="file"
                                                        name="image"
                                                        onChange={handleInput}
                                                        className="form-control"
                                                        placeholder="Image"
                                                    />
                                                    {/* <div className="image-preview-box">
                                                        <img
                                                            src={
                                                                previewImage ||
                                                                (getUser.image
                                                                    ? `${BASE_URL}/uploads/user/${getUser.image}`
                                                                    : "/public/no_image.jpg")
                                                            }
                                                            alt="Fav" className="setting-preview-image"
                                                        />
                                                    </div> */}
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Email Address</label>

                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={getUser.email}
                                                        onChange={handleInput}
                                                        className="form-control"
                                                        placeholder="your@email.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label className="form-label">Phone Number</label>
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        value={getUser.phone}
                                                        onChange={handleInput}
                                                        className="form-control"
                                                        placeholder="your@email.com"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Role</label>
                                                    <input
                                                        type="text"
                                                        value={user.roles?.map(role => role.name).join(", ") || ""}
                                                        readOnly
                                                        className="form-control"
                                                    />


                                                </div>
                                            </div>

                                            <div className="divider" />
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                {
                                                    !loading ?
                                                        <button type='submit' className="btn-primary">
                                                            <i className="bi bi-check2-circle" /> Save Changes
                                                        </button>
                                                        :
                                                        <button type="button" className="btn-primary" disabled>
                                                            <ClipLoader color='color' size={20} /><i className="bi bi-check2-circle" /> Saving...
                                                        </button>
                                                }

                                            </div>
                                        </form>
                                    </div>

                                    <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab" tabIndex={0}>
                                        <form onSubmit={submitChangePassword}>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label className="form-label">Old Password</label>
                                                    <input type="text" name='password' value={changePassword.password} onChange={(e) => setChangePassword({ ...changePassword, password: e.target.value })} className="form-control" placeholder="First name" />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">New Password</label>
                                                    <input type="text" name='new_password' value={changePassword.new_password} onChange={(e) => setChangePassword({ ...changePassword, new_password: e.target.value })} className="form-control" placeholder="First name" />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Confirm New Password</label>
                                                    <input type="text" name='cnew_password' value={changePassword.cnew_password} onChange={(e) => setChangePassword({ ...changePassword, cnew_password: e.target.value })} className="form-control" placeholder="your@email.com" />
                                                </div>

                                                <div className="form-group">
                                                    <div>
                                                        {
                                                            !loading ?
                                                                <button type='submit' className="btn-primary mt-4">
                                                                    <i className="bi bi-check2-circle" /> Save Changes
                                                                </button>
                                                                :
                                                                <button type="button" className="btn-primary" disabled>
                                                                    <ClipLoader color='color' size={20} /><i className="bi bi-check2-circle" /> Saving...
                                                                </button>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div >

        </div >
    )
}

export default Dashboard