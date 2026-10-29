import { useEffect, useState } from 'react'
import noimage from '../../../../public/no_image.jpg'
import api, { BASE_URL } from '../../../api/api';
import { showError, showSuccess } from '../../../utils/notify';
import * as bootstrap from "bootstrap";
import moment from 'moment';
import { PulseLoader } from 'react-spinners';
import confirmDelete from './../../../utils/confirmDelete';
import { useAuth } from '../../../context/AuthContext';

const About = () => {

    useEffect(() => {
            document.title = "About";
        }, []);

    const { can } = useAuth();

    const [about, setAbout] = useState({
        image: null,
        banner: null,
        title: "",
        sub_title: "",
        description: "",
        seo_title: "",
        seo_keyword: "",
        seo_description: ""
    });

    const [abouts, setAbouts] = useState({
        image: null,
        title: "",
        sub_title: "",
        description: "",
    });

    const [aboutPost, setAboutPost] = useState([]);
    const [viewAboutPost, setviewAboutPost] = useState({});

    const [isEdit, setIsEdit] = useState(false);

    const [previewImage, setPreviewImage] = useState(false);
    const [previewImagePost, setPreviewImagePost] = useState(false);
    const [previewUpdatePost, setPreviewUpdatePost] = useState(false);
    const [previewBanner, setPreviewBanner] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleInput = (e) => {
        const { name, value, files } = e.target;

        if (name === 'image') {
            setPreviewImage(URL.createObjectURL(files[0]));
        }
        if (name === 'banner') {
            setPreviewBanner(URL.createObjectURL(files[0]));
        }
        setAbout({ ...about, [name]: files?.length ? files[0] : value });
    }


    useEffect(() => {
        getPageData();
    }, [])

    useEffect(() => {
        getPostData();
    }, [])


    const handleInputPost = (e) => {
        const { name, value, files } = e.target;

        if (name === 'image') {
            setPreviewImagePost(URL.createObjectURL(files[0]));
        }

        setAbouts({ ...abouts, [name]: files?.length ? files[0] : value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        Object.keys(about).forEach(key => {
            formData.append(key, about[key]);
        });
        // formData.append("title", about.title);
        try {
            const res = isEdit ? await api.post('/about/store', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
                : await api.post("/about/store", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            showSuccess(res.data.message)

        } catch (error) {
            console.log(error)
            showError(error.response.data.message)
            setLoading(false)
        }
        finally {
            setLoading(false)
        }
    }

    const handleSubmitPost = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        Object.keys(abouts).forEach(key => {
            formData.append(key, abouts[key]);
        });
        // formData.append("image", about.image); 
        try {
            const res = await api.post('/about-post/store', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
            getPostData();
            showSuccess(res.data.message)
            const modalEl = document.getElementById("createModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
            document.body.classList.remove("modal-open");
            document.body.style.removeProperty("padding-right");

        } catch (error) {
            console.log(error)
            showError(error.response.data.message)
            setLoading(false)
        }
        finally {
            setLoading(false)
        }
    }

    const getPageData = async () => {
        setLoading(true);
        try {
            const result = await api.get('about')
            console.log(result);
            if (result.data.about) {
                setAbout(result.data.about);
                setIsEdit(true);
            }

        } catch (error) {
            showError(error.response.data.message);
        }
        finally {
            setLoading(false)
        }
    }

    const getPostData = async () => {
        setLoading(true);
        try {
            const result = await api.get('about')
            console.log(result);
            if (result.data.abouts) {
                setAboutPost(result.data.abouts);
            }

        } catch (error) {
            showError(error.response.data.message);
        }
        finally {
            setLoading(false)
        }
    }


    const aboutPostStatus = async (id) => {
        const result = await api.post(`about/status/${id}`)
        // await api.post(`/about/status/${id}`);
        showSuccess(result.data.message);
    }



    const deleteAboutPost = async (id) => {
        const confirmed = await confirmDelete();
        if (!confirmed) return;

        try {
            const result = await api.delete(`about-post/${id}`);
            getPostData();
            showSuccess(result.data.message)
        }
        catch (error) {
            showError(error.response.data.message)
        }
    }

    const [editAbout, setEditAbout] = useState({});

    const editAboutPost = async (id) => {

        try {
            const result = await api.get(`about-post/${id}`)
            console.log(result);
            setEditAbout(result.data.about)
        } catch (error) {
            showError(error.response.data.message)
        }
    }


    const handleUpdatePost = (e) => {
        const { name, value, files } = e.target;

        console.log(name, files);

        if (name === "image" && files && files.length > 0) {
            setPreviewUpdatePost(URL.createObjectURL(files[0]));
        }

        setEditAbout(prev => ({
            ...prev,
            [name]: files && files.length > 0 ? files[0] : value,
        }));
    };



    const submitUpdatePost = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        Object.keys(editAbout).forEach(key => {
            formData.append(key, editAbout[key]);
        });

        try {
            const result = await api.post(`about-post/update/${editAbout.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
            getPostData();
            showSuccess(result.data.message)
            const modalEl = document.getElementById("editModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();

            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
            document.body.classList.remove("modal-open");
            document.body.style.removeProperty("padding-right");

        } catch (error) {
            showError(error.response.data.message)
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="admin-mgmt">
                <div className="admin-mgmt-grid">
                    {/* Create About Form */}
                    <div className="glass-card create-admin-card">

                        <ul className="nav nav-pills mb-3 gx-2 gap-2" id="pills-tab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className="nav-links active" id="pills-home-tab" data-bs-toggle="pill"
                                    data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true">Home</button>
                                {/* <button className="theme-toggle-btn" title="Cycle theme"><i className="bi bi-palette"></i> Theme</button> */}
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-links" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">Description</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-links" id="pills-contact-tab" data-bs-toggle="pill" data-bs-target="#pills-contact" type="button" role="tab" aria-controls="pills-contact" aria-selected="false">Banner</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-links" id="pills-seo-tab" data-bs-toggle="pill" data-bs-target="#pills-seo" type="button" role="tab" aria-controls="pills-seo" aria-selected="false">SEO</button>
                            </li>
                        </ul>
                        <form onSubmit={handleSubmit}>
                            <div className="tab-content" id="pills-tabContent">
                                <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab" tabindex="0">
                                    <div className="form-floating">
                                        <input type="text" name="title" value={about.title} onChange={handleInput} className="form-control" id="title" placeholder="Title" />
                                        <label for="floatingName">Title</label>
                                    </div>
                                    <div className="form-floating">
                                        <input type="text" name="sub_title" value={about.sub_title} onChange={handleInput} className="form-control" id="title" placeholder="Sub Title" />
                                        <label for="floatingName">Sub Title</label>
                                    </div>
                                    <div className="form-group">
                                        <div className='row'>
                                            <div className='col-md-12'>
                                                <div className="image-preview-box">
                                                    <img
                                                        src={
                                                            previewImage ||
                                                            (about.image
                                                                ? `${BASE_URL}/uploads/about/${about.image}`
                                                                : "/public/no_image.jpg")
                                                        }
                                                        alt="Fav" className="setting-preview-image"
                                                    />
                                                </div>
                                            </div>
                                            <div className='col-md-12'>
                                                <label className="form-label">Image</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    name="image"
                                                    onChange={handleInput}
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab" tabindex="0">
                                    <div className="input-group">
                                        <div class="form-floating">
                                            <textarea name='description' value={about.description} onChange={handleInput} class="form-control" id="floatingName" placeholder="Description"></textarea>
                                            <label for="floatingName">Description here...</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab" tabindex="0">
                                    <div className="form-group">
                                        <div className='row'>
                                            <div className='col-md-12'>
                                                <div className="image-preview-box">
                                                    <img
                                                        src={
                                                            previewBanner ||
                                                            (about.banner
                                                                ? `${BASE_URL}/uploads/about/${about.banner}`
                                                                : "/public/no_image.jpg")
                                                        }
                                                        alt="Fav" className="setting-preview-image"
                                                    />
                                                </div>
                                            </div>
                                            <div className='col-md-12'>
                                                <label className="form-label">Banner</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    name="banner"
                                                    onChange={handleInput}
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="tab-pane fade" id="pills-seo" role="tabpanel" aria-labelledby="pills-seo-tab" tabindex="0">
                                    <div class="col-md-12 mb-3">
                                        <div class="form-floating">
                                            <input type="text" name="seo_title" value={about.seo_title} onChange={handleInput} class="form-control" id="floatingName" placeholder="Seo Title" />

                                            <label for="floatingName">Seo Title</label>
                                        </div>
                                    </div>
                                    <div class="col-md-12 mb-3">
                                        <div class="form-floating">
                                            <input type="text" name="seo_keyword" value={about.seo_keyword} onChange={handleInput} class="form-control" placeholder="Seo Keyword" />

                                            <label for="floatingUser">Seo Keyword</label>
                                        </div>
                                    </div>
                                    <div class="col-md-12 mb-3">
                                        <div class="form-floating">
                                            <textarea name="seo_description" value={about.seo_description} onChange={handleInput} class="form-control" placeholder="Seo Description">  </textarea>

                                            <label for="floatingUser">Seo Description</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {
                                can("about.store") && (
                                    <button type='submit' className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                        <i className="bi bi-person-plus-fill" /> Create Admin Account
                                    </button>
                                )
                            }

                        </form>
                    </div>


                    {/* About Us Post List */}
                    <div className="glass-card-solid admin-list-card">
                        <div className="admin-table-header">
                            <div>
                                <div className="section-title" style={{ fontSize: 15 }}>About Accounts</div>
                                {/* <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>Manage existing administrator accounts</div> */}
                            </div>
                            <div className="">
                                <button className="theme-toggle-btn" data-bs-toggle="modal" data-bs-target="#createModal" title="View"><i class="bi bi-plus-lg fs-5"></i></button>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="admin-table" id="adminTable">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Title</th>
                                        <th>Sub Title</th>
                                        <th>Image</th>
                                        <th>Status</th>
                                        <th>Create</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {
                                        aboutPost.map((item, index) => {
                                            return (
                                                <tr key={item.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <div className="admin-name-cell">

                                                            <div>
                                                                <div className="admin-name">
                                                                    {item.title.slice(0, 30)}
                                                                    {item.title.length > 30 ? "..." : ""}
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td style={{ fontSize: 13, color: '#64748B' }}>
                                                        {item.sub_title?.slice(0, 15)}
                                                        {item.sub_title?.length > 15 ? "..." : ""}
                                                    </td>
                                                    <td style={{ fontSize: 13 }}>
                                                        <img alt="Logo" loading="lazy" className="preview-image" src={

                                                            item.image ? `${BASE_URL}/uploads/about/${item.image}`
                                                                : "/public/no_image.jpg"
                                                        } />
                                                    </td>
                                                    <td>
                                                        <div className="form-check form-switch">
                                                            <input className="form-check-input" type="checkbox" onChange={() => aboutPostStatus(item.id)} role="switch" id="switchCheckChecked" defaultChecked={item.status === 0 ? 'checked' : ''} />
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: '12px', color: '#94A3B8' }}>{moment(item.created_at).format('LL')}  </td>
                                                    <td>
                                                        <div className="table-actions">
                                                            {
                                                                can("abouts.edit") && (
                                                                    <button className="btn-info-sm" data-bs-toggle="modal" data-bs-target="#viewModal" onClick={() => setviewAboutPost(item)} title="View"><i className="bi bi-eye" /></button>
                                                                )
                                                            }


                                                            {
                                                                can("abouts.edit") && (
                                                                    <button className="btn-edit-sm" data-bs-toggle="modal" data-bs-target="#editModal" onClick={() => editAboutPost(item.id)} title="Edit"><i className="bi bi-pencil" /></button>
                                                                )
                                                            }


                                                            {
                                                                can("abouts.destroy") && (
                                                                    <button className="btn-danger-sm" onClick={() => deleteAboutPost(item.id)} title="Delete"><i className="bi bi-trash3" /></button>
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
                        <div id="emptyState" style={{ display: 'none', textAlign: 'center', padding: 36, color: '#94A3B8' }}>
                            <i className="bi bi-person-x" style={{ fontSize: 36, marginBottom: 10, display: 'block' }} />
                            No admins found.
                        </div>
                    </div>
                </div>
            </div>

            <div>
                {/* ░░ MODALS ░░ */}

                {/* Add Modal */}
                <div className="modal fade" id="createModal" tabIndex={-1} aria-labelledby="editModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content" style={{ background: 'transparent', border: 'none' }}>
                            {/* <div className='float-end'>
                                        <button type="button" className="btn-close float-end" data-bs-dismiss="modal" aria-label="Close" />
                                    </div> */}
                            <div className="modal-box">
                                <div className="modal-title">Create</div>
                                <form onSubmit={handleSubmitPost}>

                                    <input type='hidden' name='type' value="post" />

                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="form-floating">
                                                <input type="text" name="title" value={abouts.title} onChange={handleInputPost} className="form-control title" id="floatingName" placeholder="Title" />
                                                <label for="floatingName">Title</label>
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div className="form-floating">
                                                <input type="text" name="sub_title" value={abouts.sub_title} onChange={handleInputPost} className="form-control sub_title" id="floatingName" placeholder="Title" />
                                                <label for="floatingName">Sub Title</label>
                                            </div>
                                        </div>

                                        <div className="col-md-12 mb-3">
                                            <div className="d-flex justify-content-between align-items-center image dropify-wrapper">
                                                <label for="" className="form-label me-2 "> Image</label>
                                                <input name="image" onChange={handleInputPost} className="form-control my-2 me-2 file-input custom-file-input" type="file" id="formFile3" />
                                                <div className="image-preview-box">
                                                    <img
                                                        src={
                                                            previewImagePost ||
                                                            (abouts.image
                                                                ? `${BASE_URL}/uploads/about/${abouts.image}`
                                                                : "/public/no_image.jpg")
                                                        }
                                                        alt="Fav" className="setting-preview-image"
                                                    />
                                                </div>
                                            </div>
                                        </div>


                                        <div className="col-md-12 mb-3">
                                            <div className="form-floating">
                                                <textarea name='description' value={abouts.description} onChange={handleInputPost} className='form-control' id='floatingName' placeholder="Description" ></textarea>
                                                <label for="floatingName">Description here...</label>
                                            </div>
                                        </div>

                                        <div className="text-center d-flex justify-content-around py-3">
                                            <button type="submit" data-button="post" className="formButton btn btn-primary text-center mx-auto btn-w-md d-flex align-items-center justify-content-center btn-wave waves-light text-nowrap waves-effect waves-light" data-bs-toggle="modal" data-bs-target="#create-folder">
                                                <i class="bi bi-check2-circle"></i>
                                                Create

                                            </button>
                                        </div>

                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>

                {/* View Modal */}
                <div className="modal fade" id="viewModal" tabIndex={-1} aria-labelledby="viewModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content" style={{ background: 'transparent', border: 'none' }}>
                            {/* <div className='float-end'>
                                        <button type="button" className="btn-close float-end" data-bs-dismiss="modal" aria-label="Close" />
                                    </div> */}
                            <div className="modal-body">
                                <div className="modal-box">

                                    <div className="about-view-card">

                                        <div className="row g-4 align-items-start">


                                            {/* Details */}
                                            <div className="col-md-12">

                                                <div className="row g-3">

                                                    <div className="col-md-7">
                                                        <div className="info-card mb-2">
                                                            <span className="info-label">Title</span>
                                                            <h6>{viewAboutPost.title || "-"}</h6>
                                                        </div>
                                                        <div className="info-card mb-2">
                                                            <span className="info-label">Subtitle</span>
                                                            <h6>{viewAboutPost.sub_title || "-"}</h6>
                                                        </div>
                                                        {/*  */}
                                                    </div>


                                                    {/* Image */}
                                                    <div className="col-md-5 text-center">
                                                        <img
                                                            src={
                                                                viewAboutPost.image
                                                                    ? `${BASE_URL}/uploads/about/${viewAboutPost.image}`
                                                                    : "/no_image.jpg"
                                                            }
                                                            alt="About"
                                                            className="about-view-image"
                                                        />
                                                        {/*  */}
                                                    </div>


                                                    <div className="info-card mt-3">
                                                        <span className="info-label">Description</span>

                                                        <div
                                                            className="description-box"
                                                            dangerouslySetInnerHTML={{
                                                                __html: viewAboutPost.description || "-"
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="row g-2">
                                                        <div className="col-md-6">
                                                            <div className="info-card">
                                                                <span className="info-label">Created Date</span>
                                                                <h6>{moment(viewAboutPost.created_at).format('LL')}</h6>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="info-card">
                                                                <span className="info-label">Updated Date</span>
                                                                <h6>{moment(viewAboutPost.updated_at).format('LL')}</h6>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        <div className="modal-actions mt-4 text-end">
                                            <button
                                                type="button"
                                                className="btn btn-modern"
                                                data-bs-dismiss="modal"
                                            >
                                                <i className="bi bi-x-circle me-2"></i>
                                                Close
                                            </button>
                                        </div>

                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                <div className="modal fade" id="editModal" tabIndex={-1} aria-labelledby="editModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content" style={{ background: 'transparent', border: 'none' }}>
                            {/* <div className='float-end'>
                                        <button type="button" className="btn-close float-end" data-bs-dismiss="modal" aria-label="Close" />
                                    </div> */}
                            <div className="modal-box">
                                <div className="modal-title">Edit</div>
                                <form onSubmit={submitUpdatePost}>

                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="form-floating">
                                                <input type="text" name="title" value={editAbout.title} onChange={handleUpdatePost} className="form-control title" id="floatingName" placeholder="Title" />
                                                <label for="floatingName">Title</label>
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div className="form-floating">
                                                <input type="text" name="sub_title" value={editAbout.sub_title} onChange={handleUpdatePost} className="form-control sub_title" id="floatingName" placeholder="Title" />
                                                <label for="floatingName">Sub Title</label>
                                            </div>
                                        </div>

                                        <div className="col-md-12 mb-3">
                                            <div className="d-flex justify-content-between align-items-center image dropify-wrapper">
                                                <label for="" className="form-label me-2 "> Image</label>
                                                <input
                                                    name="image"
                                                    type="file"
                                                    className="form-control"
                                                    onChange={handleUpdatePost}
                                                />


                                                <div className="image-preview-box">
                                                    {/* <img
                                                        src={
                                                            previewUpdatePost
                                                                ? previewUpdatePost
                                                                : editAbout.image
                                                                    ? `${BASE_URL}/uploads/about/${editAbout.image}`
                                                                    : noimage
                                                        }
                                                        alt="Preview"
                                                        className="setting-preview-image"
                                                    /> */}

                                                    <img
                                                        src={
                                                            previewUpdatePost ||
                                                            (editAbout.image
                                                                ? `${BASE_URL}/uploads/about/${editAbout.image}`
                                                                : "/public/no_image.jpg")
                                                        }
                                                        alt="Fav" className="setting-preview-image"
                                                    />
                                                </div>

                                            </div>
                                        </div>


                                        <div className="col-md-12 mb-3">
                                            <div className="form-floating">
                                                <textarea name='description' className='form-control' value={editAbout.description} onChange={handleUpdatePost} id='floatingName' placeholder="Description" ></textarea>
                                                <label for="floatingName">Description here...</label>
                                            </div>
                                        </div>

                                        <div className="text-center d-flex justify-content-around py-3">
                                            <button type="submit" data-button="post" className="formButton btn btn-primary text-center mx-auto btn-w-md d-flex align-items-center justify-content-center btn-wave waves-light text-nowrap waves-effect waves-light" data-bs-toggle="modal" data-bs-target="#create-folder">
                                                <i className="ri-add-large-fill p-1"></i>
                                                <i class="bi bi-check2-circle"></i> Update
                                            </button>
                                        </div>

                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Delete Confirm Modal */}
                <div className="modal-overlay" id="deleteModal">
                    <div className="modal-box" style={{ maxWidth: 380, textAlign: 'center' }}>
                        <div style={{ width: 60, height: 60, background: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26, color: '#EF4444' }}>
                            <i className="bi bi-trash3" />
                        </div>
                        <div className="modal-title">Delete Admin?</div>
                        <div className="modal-sub">This action cannot be undone. The admin will lose all access permanently.</div>
                        <input type="hidden" id="deleteAdminId" />
                        <div className="modal-actions" style={{ justifyContent: 'center' }}>
                            <button className="btn-secondary" onclick="closeModal('deleteModal')">Cancel</button>
                            <button style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }} onclick="confirmDelete()">
                                <i className="bi bi-trash3" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About