import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { showError, showSuccess } from '../../../utils/notify';
import api, { BASE_URL } from '../../../api/api';
import moment from 'moment/moment';

const StaffEdit = () => {

    useEffect(() => {
        document.title = "Staff Edit";
    }, []);

    const { id } = useParams();
    const navigate = useNavigate();


    const [staff, setStaff] = useState({});
    const [designation, setDesignation] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        setLoading(true);
        try {

            const result = await api.get(`staffs/${id}`);
            console.log(result)
            setStaff(result.data.staff);
            setDesignation(result.data.designations)
            setBranches(result.data.branches)
        } catch (error) {
            showError(error.response.data.message)
        }
        finally {
            setLoading(false);
        }
    }

    const handleInput = (e) => {
        const { name, files, value } = e.target;

        if (name === 'image') {
            setPreviewImage(URL.createObjectURL(files[0]));
        }

        setStaff({ ...staff, [name]: files?.length ? files[0] : value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        const fields = [
            'name', 'company_id', 'branch_id', 'designation_id', 'gender', 'phone',
            'email', 'address', 'working_hr'
        ];

        fields.forEach((field) => {
            if (staff[field] !== undefined && staff[field] !== null) {
                formData.append(field, staff[field]);
            }
        });

        if (staff.image instanceof File) {
            formData.append('image', staff.image);
        }
        try {
            formData.append("_method", "PUT");

            const result = await api.post(`/staffs/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            showSuccess(result.data.message);
            navigate("/admin/staff")
        } catch (error) {
            showError(error.response.data.message || "something went wrong")
        }
    }
    return (
        <div>
            <div className="about-view-card">
                <div className='col-lg-12'>


                    <div className="count-badge-row d-flex justify-content-between">
                        <button class="theme-toggle-btn" title="Cycle theme"><i class="bi bi-eye"></i> View Company staffs </button>
                        <Link to={`/admin/staff`} type='submit' className="btn-primary text-decoration-none">
                            <i class="bi bi-house-door"></i> Back To Company staffs
                        </Link>
                    </div>


                    <div className="row g-4 align-items-start">


                        {/* Details */}
                        <form onSubmit={handleSubmit}>
                            <div className="col-md-12">

                                <div className="row g-3">

                                    <div className="col-md-9">
                                        <div className='row'>
                                            <div className='col-md-6'>
                                                <div className="mb-2">
                                                    <span className="info-label">Staff Name</span>
                                                    <input type="text" name="name" onChange={handleInput} className="form-control" value={staff.name || ""} />
                                                </div>
                                            </div>

                                            <div className='col-md-6'>
                                                <div className="mb-2">
                                                    <span className="info-label">Designation</span>
                                                    {/* <input type="text" name="designation_id" onChange={handleInput} className="form-control" value={staff.designation?.name || ""} /> */}

                                                    <select
                                                        name="designation_id"
                                                        className="form-select"
                                                        value={staff.designation_id || ""}
                                                        onChange={handleInput}
                                                    >
                                                        <option value="">Select designation</option>
                                                        {
                                                            designation.map((designation) => {
                                                                return (
                                                                    <option key={designation.id} value={designation.id}>{designation.name}</option>
                                                                )
                                                            })
                                                        }

                                                    </select>
                                                </div>
                                            </div>

                                            <div className='col-md-6'>
                                                <div className="mb-2">
                                                    <span className="info-label">Company Name</span>
                                                    <input type="text" name="company_id" className="form-control" value={staff.company?.name || ""} readOnly />
                                                </div>
                                            </div>


                                            <div className="col-6">
                                                <select
                                                    name="branch_id"
                                                    className="form-select"
                                                    value={staff.branch_id || ""}
                                                    onChange={handleInput}
                                                >
                                                    <option>Select Branch</option>

                                                    {branches.map((branch) => (
                                                        <option
                                                            key={branch.id}
                                                            value={branch.id}
                                                        >
                                                            {branch.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className='col-md-6'>
                                                <div className="mb-2">
                                                    <span className="info-label">Gender</span>
                                                    {/* <input type="text" name="gender" onChange={handleInput} className="form-control" value={staff.gender || ""} /> */}
                                                    <div className="col-lg-12 d-flex gap-3">

                                                        <div className="form-check form-check-inline">
                                                            <input
                                                                type="radio"
                                                                name="gender"
                                                                id="genderMale"
                                                                value="male"
                                                                onChange={handleInput}
                                                                checked={staff.gender === "male"}
                                                            />
                                                            <label className="form-check-label" htmlFor="genderMale">
                                                                Male
                                                            </label>
                                                        </div>

                                                        <div className="form-check form-check-inline">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="genderFemale"
                                                                name="gender"
                                                                value="female"
                                                                onChange={handleInput}
                                                                checked={staff.gender === "female"}
                                                            />
                                                            <label className="form-check-label" htmlFor="genderFemale">
                                                                Female
                                                            </label>
                                                        </div>

                                                        <div className="form-check form-check-inline">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="genderOther"
                                                                name="gender"
                                                                value="other"
                                                                onChange={handleInput}
                                                                checked={staff.gender === "other"}
                                                            />
                                                            <label className="form-check-label" htmlFor="genderOther">
                                                                Other
                                                            </label>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                            <div className='col-md-6'>
                                                <div className="mb-2">
                                                    <span className="info-label">Phone</span>
                                                    <input type="text" name="phone" onChange={handleInput} className="form-control" value={staff.phone || ""} />
                                                </div>
                                            </div>

                                            <div className='col-md-6'>
                                                <div className="mb-2">
                                                    <span className="info-label">Email</span>
                                                    <input type="email" name="email" onChange={handleInput} className="form-control" value={staff.email || ""} />
                                                </div>
                                            </div>

                                            <div className='col-md-6'>
                                                <div className="mb-2">
                                                    <span className="info-label">Address</span>
                                                    <input type="text" name="address" onChange={handleInput} className="form-control" value={staff.address || ""} />
                                                </div>
                                            </div>

                                            <div className='col-md-6'>
                                                <div className="mb-2">
                                                    <span className="info-label">Working Hr</span>
                                                    <input type="text" name="working_hr" onChange={handleInput} className="form-control" value={staff.working_hr || ""} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image */}
                                    <div className="col-md-3 text-center">
                                        <img
                                            src={
                                                previewImage
                                                    ? previewImage
                                                    : staff.user?.image
                                                        ? `${BASE_URL}/uploads/user/${staff.user?.image}`
                                                        : "/no_image2.jpg"
                                            }
                                            alt="Staff"
                                            className="about-view-image" style={{ height: "220px" }}
                                        />
                                        <input type="file" name="image" onChange={handleInput} className="form-control mt-2" />
                                        {/*  */}
                                    </div>

                                </div>
                                <div style={{ display: 'float-end', gap: 10, marginTop: 20 }}>
                                    <button type="submit" class="btn-primary float-end">
                                        <i class="bi bi-check2-circle"></i> Save Changes
                                    </button>
                                </div>
                            </div>
                        </form>

                    </div>



                </div>


            </div>


        </div>
    )
}

export default StaffEdit
