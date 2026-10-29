import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { showError } from '../../../utils/notify';
import api, { BASE_URL } from '../../../api/api';
import moment from 'moment/moment';

const AttendanceShow = () => {

    useEffect(() => {
            document.title = "Staff Attendance View";
        }, []);

    const { id } = useParams();

    const [staff, setStaff] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getData();
    }, []);


    const getData = async () => {
        setLoading(true);
        try {

            const result = await api.get(`staffs/${id}`);
            console.log(result)
            setStaff(result.data.staff);
        } catch (error) {
            showError(error.response.data.message)
        }
        finally {
            setLoading(false);
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
                        <div className="col-md-12">

                            <div className="row g-3">

                                <div className="col-md-9">
                                    <div className='row'>
                                        <div className='col-md-6'>
                                            <div className="info-card mb-2">
                                                <span className="info-label">Staff Name</span>
                                                <h6>{staff.name || ""}</h6>
                                            </div>
                                        </div>
                                        <div className='col-md-6'>
                                            <div className="info-card mb-2">
                                                <span className="info-label">Company Name</span>
                                                <h6>{staff.company?.name || ""}</h6>
                                            </div>
                                        </div>

                                        <div className='col-md-6'>
                                            <div className="info-card mb-2">
                                                <span className="info-label">Designation</span>
                                                <h6>{staff.designation?.name || ""}</h6>
                                            </div>
                                        </div>

                                        <div className='col-md-6'>
                                            <div className="info-card mb-2">
                                                <span className="info-label">Gender</span>
                                                <h6>{staff.gender || ""}</h6>
                                            </div>
                                        </div>

                                        <div className='col-md-6'>
                                            <div className="info-card mb-2">
                                                <span className="info-label">Phone</span>
                                                <h6>{staff.phone || ""}</h6>
                                            </div>
                                        </div>

                                        <div className='col-md-6'>
                                            <div className="info-card mb-2">
                                                <span className="info-label">Email</span>
                                                <h6>{staff.email || ""}</h6>
                                            </div>
                                        </div>

                                        <div className='col-md-6'>
                                            <div className="info-card mb-2">
                                                <span className="info-label">Address</span>
                                                <h6>{staff.address || ""}</h6>
                                            </div>
                                        </div>

                                        <div className='col-md-6'>
                                            <div className="info-card mb-2">
                                                <span className="info-label">Working Hr</span>
                                                <h6>{staff.working_hr || ""}</h6>
                                            </div>
                                        </div>
                                    </div>


                                    {/*  */}
                                </div>


                                {/* Image */}
                                <div className="col-md-3 text-center">
                                    <img
                                        src={
                                            staff.image
                                                ? `${BASE_URL}/uploads/staff/${staff.image}`
                                                : "/no_image2.jpg"
                                        }
                                        alt="Staff"
                                        className="about-view-image" style={{ height: "220px" }}
                                    />
                                    {/*  */}
                                </div>




                                <div className="row g-2">
                                    <div className="col-md-3">
                                        <div className="info-card">
                                            <span className="info-label">Created Date</span>
                                            <h6>{moment(staff.created_at).format('LL')}</h6>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="info-card">
                                            <span className="info-label">Created By</span>
                                            <h6>{staff.creator?.name}</h6>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="info-card">
                                            <span className="info-label">Updated Date</span>
                                            <h6>{moment(staff.updated_at).format('LL')}</h6>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="info-card">
                                            <span className="info-label">Updated By</span>
                                            <h6>{staff.updator?.name || 'Stil Not Updated'}</h6>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>



                </div>


            </div>


        </div>
    )
}

export default AttendanceShow