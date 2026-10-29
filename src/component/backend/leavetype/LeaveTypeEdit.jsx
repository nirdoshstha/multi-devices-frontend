import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { showError, showSuccess } from '../../../utils/notify';
import api from '../../../api/api';

const LeaveTypeEdit = () => {

    useEffect(() => {
        document.title = "Leave Type Edit";
    }, []);

    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
 
    const [leave, setLeave] = useState({ 
        name: '',
        days_per_year: '',
        is_paid: true,
        requires_approval: true,
        allow_half_day: true,
        status: true,
    });

    useEffect(() => {
        getSpecificData();
    }, [])

    const getSpecificData = async () => {
        setLoading(true);
        try {
            const result = await api.get(`/leave-types/${id}`)
            setLeave(result.data.leave); 
            setLoading(false);
             
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
        finally{
            setLoading(false);
        }
    }


    const handleInput = (e) => {
        setLeave({ ...leave, [e.target.name]: e.target.value })
    }

    const handleChecked = (e) => {
        setLeave({...leave, [e.target.name]: e.target.checked ? 1 : 0})
    }

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await api.put(`/leave-types/${id}`, leave)
            showSuccess(result.data.message);
            navigate("/admin/leave-type")
        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
    }

    return (
        <div>
            <div className="glass-card-solid profile-right">
                <div style={{ marginBottom: 20 }}>
                    <div>
                        <div className="section-title" style={{ fontSize: 15 }}>Edit Leave Type<div className='float-end'>
                            <Link to={`/admin/leave-type`} className="theme-toggle-btn text-decoration-none" title="Cycle theme"><i class="bi bi-house-door"></i> Back To company</Link>
                        </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Update your Leave Type information</div>
                    </div>

                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row"> 
                         <div className="form-group">
                            <label className="form-label">Leave Name</label>
                            <input type="text" name='name' value={leave.name} onChange={handleInput} className="form-control" placeholder="leave name" />
                        </div>

                      <div className="form-group">
                            <label className="form-label">Days Per Year</label>
                            <input type="text" name='days_per_year' value={leave.days_per_year} onChange={handleInput} className="form-control" placeholder="Route name" />
                        </div>  
                    </div>

                    <div className='row'>
                        <div className='col-lg-3'>
                            <div className="form-group"> 
                                <div className="form-check form-switch ">
                                    <input className="form-check-input" 
                                    name="is_paid" 
                                    type="checkbox" 
                                    role="switch"  
                                    checked={leave.is_paid === 1}
                                    onChange={handleChecked}
                                    />
                                <span className="title-label">Paid Leave</span> 
                                </div>
                            </div>
                        </div>

                        <div className='col-lg-3'>
                            <div className="form-group"> 
                                <div className="form-check form-switch ">
                                    <input className="form-check-input" 
                                    name="requires_approval" 
                                    type="checkbox" 
                                    role="switch" 
                                    checked={leave.requires_approval === 1}
                                     onChange={handleChecked} 
                                    />
                                <span className="title-label">Requires Approval</span> 
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-3'>
                            <div className="form-group"> 
                                <div className="form-check form-switch ">
                                    <input className="form-check-input" 
                                    name="allow_half_day" 
                                    type="checkbox" 
                                    role="switch" 
                                    checked={leave.allow_half_day === 1}
                                     onChange={handleChecked} 
                                    />
                                <span className="title-label">Allow Half Day</span> 
                                </div>
                            </div>
                        </div>
                        <div className='col-lg-3'>
                            <div className="form-group"> 
                                <div className="form-check form-switch ">
                                    <input className="form-check-input" 
                                    name="status" 
                                    type="checkbox" 
                                    role="switch" 
                                    checked={leave.status === 1}
                                    onChange={handleChecked} 
                                    />
                                <span className="title-label">Active / Inactive</span> 
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="divider" />
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type='submit' className="btn-primary">
                            <i className="bi bi-check2-circle" /> Save Changes
                        </button>

                    </div>
                </form>
            </div >
        </div>
    )
}

export default LeaveTypeEdit