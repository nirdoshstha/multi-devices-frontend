import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { showError, showSuccess } from '../../../utils/notify';
import api, { BASE_URL } from '../../../api/api';

const LeaveApplicationShow = () => {

    useEffect(() => {
        document.title = "Leave Approved Show";
    }, []);

    const { id } = useParams();

    const navigate = useNavigate();


    const [leaveDetail, setLeaveDetail] = useState({});

    // const [isEdit, setIsEdit] = useState(false);

    const [isApprove, setIsApprove] = useState({
        approval_remarks: "",
        is_approved: 0
    });

    const handleInput = (e) => {
        setIsApprove({ ...isApprove, [e.target.name]: e.target.value })
    }


    useEffect(() => {
        getLeaveDetail();
    }, []);

    const getLeaveDetail = async () => {
        try {
            const result = await api.get(`/leave-applications/${id}`)
            setLeaveDetail(result.data.leave_application);
            setIsApprove(result.data.leave_application);
            // setIsEdit(true);

        } catch (error) {
            showError(error.response.data.message || "Something went wrong");
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await api.post(`/leave-isapproved/${id}`, isApprove)
            showSuccess(result.data.message);
            console.log(result);
            navigate('/admin/leave-application');
        } catch (error) {
            showError(error.response?.data?.message || 'Something went wrong');
        }
    }



    return (
        <div>
            <div className="glass-card-solid profile-right">
                <div style={{ marginBottom: 20 }}>
                    <div>
                        <div className="section-title" style={{ fontSize: 15 }}> Status of Leave Application <div className='float-end'>
                            <Link to={`/admin/leave-application`} className="theme-toggle-btn text-decoration-none" title="Cycle theme"><i class="bi bi-house-door"></i> Back To company</Link>
                        </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>View your Status of Leave Application. </div>
                    </div>

                </div>



                <div className='row'>
                    <div className='col-lg-12'>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">

                                <table className="table table-sm table-borderless mb-0">
                                    <tbody>
                                        <tr>
                                            <th width="35%">
                                                <label className="form-label">Name</label>
                                            </th>

                                            <td className="position-relative">
                                                {/* User Image */}
                                                <img
                                                    src={
                                                        leaveDetail.user?.image
                                                            ? `${BASE_URL}/uploads/user/${leaveDetail.user.image}`
                                                            : `/no_image2.jpg`
                                                    }
                                                    alt={leaveDetail.user?.name || "User"}
                                                    className="rounded-circle border position-absolute"
                                                    style={{
                                                        width: "80px",
                                                        height: "80px",
                                                        objectFit: "cover",
                                                        right: "10px",
                                                        top: "10px",
                                                    }}
                                                />

                                                {/* Name */}
                                                <label className="form-label">
                                                    {leaveDetail.user?.name || ""}
                                                </label>
                                            </td>
                                        </tr>

                                        {/* other rows... */}


                                        <tr>
                                            <th>
                                                <label className="form-label">Role</label>
                                            </th>
                                            <td>
                                                <label className="form-label">
                                                    {leaveDetail.role?.name || ""}
                                                </label>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>
                                                <label className="form-label">Leave Type</label>
                                            </th>
                                            <td>
                                                <label className="form-label">
                                                    {leaveDetail.leave_type?.name || ""}
                                                </label>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>
                                                <label className="form-label">Leave Reason</label>
                                            </th>
                                            <td>
                                                <label className="form-label">
                                                    {leaveDetail.reason || ""}
                                                </label>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>
                                                <label className="form-label">Leave Start / End</label>
                                            </th>
                                            <td className="d-flex">
                                                <label className="form-label">
                                                    {leaveDetail.date_from || ""}
                                                </label>

                                                <label className="form-label px-2">
                                                    TO
                                                </label>

                                                <label className="form-label">
                                                    {leaveDetail.date_to || ""}
                                                </label>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>
                                                <label className="form-label">
                                                    Total Requested Days
                                                </label>
                                            </th>
                                            <td>
                                                <label className="form-label">
                                                    {leaveDetail.total_days || 0}
                                                </label>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>
                                                <label className="form-label">
                                                    Approval Remarks
                                                </label>
                                            </th>
                                            <td>
                                                <textarea
                                                    name="approval_remarks"
                                                    value={isApprove.approval_remarks || ""}
                                                    onChange={handleInput}
                                                    className="form-control" readOnly
                                                />
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>
                                                <label className="form-label">
                                                    Status of Leave Application.
                                                </label>
                                            </th>
                                            <td>
                                                {leaveDetail.is_approved == 1 ? (
                                                    <button type="button" className="btn btn-success active">
                                                        <i className="bi bi-check2-circle fs-6"></i>{" "}
                                                        Approved
                                                    </button>
                                                ) : leaveDetail.is_approved == 2 ? (
                                                    <button type="button" className="btn btn-danger active">
                                                        <i className="bi bi-x-circle"></i>{" "}
                                                        Rejected
                                                    </button>
                                                ) : (
                                                    <button type="button" className="btn btn-secondary active">
                                                        <i className="bi bi-hourglass-split fs-6"></i>{" "}
                                                        Pending
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>


                        </form>
                    </div>

                </div>



            </div >
        </div>
    )
}

export default LeaveApplicationShow