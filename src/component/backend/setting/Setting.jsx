import React, { useEffect, useState } from 'react'
import api, { BASE_URL } from '../../../api/api';
import { showError, showSuccess } from '../../../utils/notify';
import { useAuth } from '../../../context/AuthContext';

const Setting = () => {
    const { can } = useAuth();
    useEffect(() => {
        document.title = "Setting";
    }, []);

    const [settings, setSettings] = useState({
        logo: null,
        fav_icon: null,
        slogan: "",
        email: "",
        phone: "",
        mobile: "",
        address: "",
        facebook: "",
        twitter: "",
        youtube: "",
        linkedin: "",
        instagram: "",
        viber: "",
        whatsapp: "",
        google_map: "",
        recaptcha_key: "",
        recaptcha_secret: ""
    });

    const [isEdit, setIsEdit] = useState(false);



    const [logoPreview, setLogoPreview] = useState(null);
    const [favPreview, setFavPreview] = useState(null);


    useEffect(() => {
        getSettings();
    }, []);

    const getSettings = async () => {
        try {
            const res = await api.get("/settings");

            if (res.data.setting) {
                setSettings(res.data.setting);
                setIsEdit(true);
            }

        } catch (error) {
            console.log(error);
        }
    };


    const handleChange = (e) => {

        const { name, value, files } = e.target;

        if (name === "logo" && files?.length) {
            setLogoPreview(URL.createObjectURL(files[0]));
        }

        if (name === "fav_icon" && files?.length) {
            setFavPreview(URL.createObjectURL(files[0]));
        }

        setSettings({ ...settings, [name]: files?.length ? files[0] : value });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(settings).forEach(key => {
            formData.append(key, settings[key]);
        });

        try {
            const res = isEdit
                // ? await api.post("/setting/update", formData) //we have create and update post in store so ..
                ? await api.post("/settings", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                : await api.post("/settings", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

            showSuccess(res.data.message);
        } catch (error) {
            showError(error.response.data.message);
        }

    };

    return (
        <div>
            <div className="glass-card-solid profile-right">
                <div style={{ marginBottom: 20 }}>
                    <div className="section-title" style={{ fontSize: 15 }}>
                        Website Settings
                    </div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                        Update your website information and social media links.
                    </div>
                </div>


                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        {/* Logo */}
                        <div className="form-group col-md-6">
                            <div className='row'>
                                <div className='col-md-6'>
                                    <label className="form-label">Logo</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="logo"
                                        loading="lazy"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className='col-md-6'>
                                    <div className="image-preview-box">
                                        <img
                                            src={
                                                logoPreview ||
                                                (settings.logo
                                                    ? `${BASE_URL}/uploads/setting/${settings.logo}`
                                                    : "/no-image.jpg")
                                            }
                                            alt="Fav" className="setting-preview-image"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fav Icon */}
                        <div className="form-group col-md-6 ">

                            <div className='row'>
                                <div className='col-md-6'>
                                    <label className="form-label">Fav Icon</label>

                                    <input
                                        type="file"
                                        className="form-control"
                                        name="fav_icon"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className='col-md-6'>
                                    <div className="image-preview-box">
                                        {/* <img
                                            src={
                                                favPreview
                                                    ? favPreview
                                                    : `${BASE_URL}/uploads/setting/${settings.fav_icon}`
                                            }
                                            alt="Fav Icon"
                                            className="setting-preview-image"
                                        /> */}
                                        <img
                                            src={
                                                favPreview ||
                                                (settings.fav_icon
                                                    ? `${BASE_URL}/uploads/setting/${settings.fav_icon}`
                                                    : "/no-image.jpg")
                                            }
                                            alt="Fav Icon" className="setting-preview-image"
                                        />
                                    </div>
                                </div>
                            </div>



                        </div>
                    </div>

                    {/* Slogan */}
                    <div className='form-row'>
                        <div className="form-group">
                            <label className="form-label">Website Slogan</label>
                            <input
                                type="text"
                                className="form-control"
                                name="slogan"
                                value={settings.slogan || ''}
                                onChange={handleChange}
                                placeholder="Enter website slogan"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                className="form-control"
                                name="address"
                                value={settings.address || ''}
                                onChange={handleChange}
                                placeholder="Company Address"
                            />
                        </div>
                    </div>


                    {/* Email & Phone */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={settings.email || ''}
                                onChange={handleChange}
                                placeholder="info@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input
                                type="text"
                                className="form-control"
                                name="phone"
                                value={settings.phone || ''}
                                onChange={handleChange}
                                placeholder="Phone Number"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mobile</label>
                            <input
                                type="text"
                                className="form-control"
                                name="mobile"
                                value={settings.mobile || ''}
                                onChange={handleChange}
                                placeholder="Mobile Number"
                            />
                        </div>

                    </div>



                    {/* Social Media */}
                    <div className="divider" style={{ margin: "20px 0" }} />

                    <div className="section-title" style={{ fontSize: 14, marginBottom: 15 }}>
                        Social Media Links
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Facebook</label>
                            <input
                                type="text"
                                className="form-control"
                                name="facebook"
                                value={settings.facebook || ''}
                                onChange={handleChange}
                                placeholder="https://facebook.com/..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Twitter / X</label>
                            <input
                                type="text"
                                className="form-control"
                                name="twitter"
                                value={settings.twitter || ''}
                                onChange={handleChange}
                                placeholder="https://x.com/..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Instagram</label>
                            <input
                                type="text"
                                className="form-control"
                                name="instagram"
                                value={settings.instagram || ''}
                                onChange={handleChange}
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                    </div>



                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">YouTube</label>
                            <input
                                type="text"
                                className="form-control"
                                name="youtube"
                                value={settings.youtube || ''}
                                onChange={handleChange}
                                placeholder="https://youtube.com/..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">WhatsApp</label>
                            <input
                                type="text"
                                className="form-control"
                                name="whatsapp"
                                value={settings.whatsapp || ''}
                                onChange={handleChange}
                                placeholder="+97798XXXXXXXX"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Viber</label>
                            <input
                                type="text"
                                className="form-control"
                                name="viber"
                                value={settings.viber || ''}
                                onChange={handleChange}
                                placeholder="+97798XXXXXXXX"
                            />
                        </div>

                    </div>
                    <div className='form-row'>
                        <div className="form-group">
                            <label className="form-label">Google Map</label>
                            <input
                                type="text"
                                className="form-control"
                                name="google_map"
                                value={settings.google_map || ''}
                                onChange={handleChange}
                                placeholder="Google Map Embed URL"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">LinkedIn</label>
                            <input
                                type="text"
                                className="form-control"
                                name="linkedin"
                                value={settings.linkedin || ''}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                    </div>




                    {/* Google Recaptcha */}
                    <div className="divider" style={{ margin: "20px 0" }} />

                    <div className="section-title" style={{ fontSize: 14, marginBottom: 15 }}>
                        Google reCAPTCHA
                    </div>
                    <div className='form-row'>
                        <div className="form-group">
                            <label className="form-label">Site Key</label>
                            <input
                                type="text"
                                className="form-control"
                                name="recaptcha_key"
                                value={settings.recaptcha_key || ''}
                                onChange={handleChange}
                                placeholder="Google reCAPTCHA Site Key"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Secret Key</label>
                            <input
                                type="text"
                                className="form-control"
                                name="recaptcha_secret"
                                value={settings.recaptcha_secret || ''}
                                onChange={handleChange}
                                placeholder="Google reCAPTCHA Secret Key"
                            />
                        </div>
                    </div>

                    <div className="divider" />

                    {
                        can("settings.store") && (
                            <div style={{ display: "flex", gap: 10 }}>
                                <button type="submit" className="btn-primary">
                                    <i className="bi bi-check2-circle"></i> Save Changes
                                </button>
                                {/* <button type="reset" className="btn-secondary">
                            <i className="bi bi-arrow-counterclockwise"></i> Reset
                        </button> */}
                            </div>
                        )
                    }


                </form>




            </div>

        </div>
    )
}

export default Setting