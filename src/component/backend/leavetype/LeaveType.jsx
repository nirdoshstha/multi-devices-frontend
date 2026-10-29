import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import { showError, showSuccess } from "../../../utils/notify";
import confirmDelete from "../../../utils/confirmDelete";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/api"; 
import {Link} from "react-router" 
import Form from 'react-bootstrap/Form';

const LeaveType = () => {
  useEffect(() => {
    document.title = "Leave Type";
  }, []);
  const { can } = useAuth();

  const [loading, setLoading] = useState(false);
  const [leave, setLeave] = useState({ 
    name: "",
    days_per_year: 0, 
    is_paid: true,
    requires_approval:true,
    allow_half_day:true,
    status:true
  });
  const [leaves, setLeaves] = useState([]); 

  const handleInput = (e) => {
    setLeave({ ...leave, [e.target.name]: e.target.value });
  };

  const handleChecked = (e) => {
    setLeave({...leave,[e.target.name]: e.target.checked});
  }
  useEffect(() => {
    fetchDatas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await api.post(`/leave-types`, leave);
      showSuccess(result.data.message);
      fetchDatas();
      setLeave({ 
        name: "",
        days_per_year: "", 
        
      });
    } catch (error) {
      showError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteLeave = async (id) => {
    const confirmed = await confirmDelete();
    if (!confirmed) return;
    setLoading(true);

    try {
      const result = await api.delete(`/leave-types/${id}`);
      showSuccess(result.data.message);
      fetchDatas();
    } catch (error) {
      showError(error.response.data.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatas = async () => {
    try {
      const result = await api.get(`/leave-types`);
       console.log(result);
      setLeaves(result.data.leaves); 
    } catch (error) {
      showError(error.response.data.message);
    }
  };
  return (
    <div>
      <div className="admin-mgmt">
        <div className="admin-mgmt-grid">
          {/* Create Admin Form */}
          <div className="glass-card create-admin-card">
            <div className="count-badge-row d-flex justify-content-between">
              <button class="theme-toggle-btn" title="Cycle theme">
                <i
                  className="bi bi-plus-circle"
                  style={{ fontSize: "14px" }}
                ></i>{" "}
                Create New leave{" "}
              </button>
              <div className="count-icon">
                <i className="bi bi-shield-person-fill" /> {leaves?.length || 0}
              </div>
            </div>

            <form onSubmit={handleSubmit}> 

               <div className="form-floating">

                <input
                  type="text"
                  name="name"
                  value={leave?.name}
                  onChange={handleInput}
                  className="form-control"
                  id="leaveName"
                  placeholder="Leave Name"
                />
                <label for="leaveName"> Leave Name</label>
              </div>

             <div className="form-floating mb-2">
                <input
                  type="number"
                  name="days_per_year"
                  value={leave?.days_per_year}
                  onChange={handleInput}
                  className="form-control"
                  id="route"
                  placeholder="Days Per Year"
                />
                <label for="route">Days Per Year</label>
                 <small style={{fontSize: "12px", color: "#94a3b8"}}>Note: Put 0 for unlimited leave like Leave Without Pay.</small>
              </div>

               <div className="form-group py-2"> 
                 <div className="form-check form-switch ">
                    <input className="form-check-input" 
                    name="is_paid" 
                    type="checkbox" 
                    role="switch" 
                    checked={leave.is_paid}
                    onChange={handleChecked} 
                    />
                    <span className="title-label">Paid Leave</span> 
                     <small style={{fontSize: "12px", color: "#94a3b8"}}> Note: If off this leave can be used for salary deduction.</small>
                </div>
              </div>

              <div className="form-group py-1"> 
                 <div className="form-check form-switch ">
                    <input className="form-check-input" 
                    name="requires_approval" 
                    type="checkbox" 
                    role="switch" 
                    checked={leave.requires_approval}
                    onChange={handleChecked} 
                    />
                    <span className="title-label">Requires Approval</span> 
                </div>
              </div>

               <div className="form-group py-1"> 
                 <div className="form-check form-switch ">
                    <input className="form-check-input" 
                    name="allow_half_day" 
                    type="checkbox" 
                    role="switch" 
                    checked={leave.allow_half_day}
                    onChange={handleChecked} 
                    />
                    <span className="title-label">Allow Half Day</span> 
                </div>
              </div>


               <div className="form-group py-1"> 
                 <div className="form-check form-switch ">
                    <input className="form-check-input" 
                    name="status" 
                    type="checkbox" 
                    role="switch" 
                    checked={leave.status}
                    onChange={handleChecked} 
                    />
                    <span className="title-label">Active</span> 
                </div>
              </div>


              {can("leaves.store") && (
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {loading ? (
                    <PulseLoader color="white" loading={true} size={12} />
                  ) : (
                    ""
                  )}
                  <i className="bi bi-person-plus-fill" /> Create Leave
                </button>
              )}
            </form>
          </div>
          {/* Admin List */}
          <div className="glass-card-solid admin-list-card">
            <div className="admin-table-header">
              <div>
                <div className="section-title" style={{ fontSize: 15 }}>
                  Leave Types Accounts
                </div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>
                  Manage existing administrator accounts
                </div>
              </div>
               
            </div>
            <div style={{ overflowX: "auto" }}> 
                                 
                    <table class="admin-table" id="adminTable">
        <thead>
            <tr>
                <th>S.no</th> 
                <th>Leave Name</th>
                <th>Days / Year</th>
                <th>Paid</th>
                <th> Approval</th>
                <th> Half Day</th>
                <th> Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="adminTableBody">
                    {
                      leaves?.map((leave, index) => {
                          return (
                              <tr key={leave.id}>
                                  <td>{index + 1}</td> 
                                  <td>
                                      {leave.name}
                                  </td>
                                  <td>
                                    {
                                      leave.days_per_year !== 0 ? <span className="status-pill active px-2"> {leave.days_per_year} Days</span> : 
                                      <span className="status-pill active px-2"> Unlimited / As needed</span>
                                    }
                                    
                                   
                                   </td>

                                  <td>
                                    {
                                      leave.is_paid === 1 ? 
                                      <span className="status-pill active">Paid</span>
                                      : 
                                      <span className="status-pill"> Unpaid</span>
                                    }
                                       
                                  </td>

                                  <td>
                                        {
                                      leave.requires_approval === 1 ? 
                                      <span className="status-pill active">Required</span>
                                      : 
                                      <span className="status-pill">N/R</span>
                                    }
                                  </td>

                                  <td>
                                     {
                                      leave.allow_half_day === 1 ? 
                                      <span className="status-pill active">Allowed</span>
                                      : 
                                      <span className="status-pill">N/A</span>
                                    }
                                  </td>
                                  <td>
                                     {
                                      leave.status === 1 ? 
                                      <span className="status-pill active">Active</span>
                                      : 
                                      <span className="status-pill">Inactive</span>
                                    }
                                  </td>
                                  <td>
                                      <div className="table-actions">

                                          {
                                              can("leaves.update") && (
                                                  <Link to={`/admin/leave-type/edit/${leave.id}`} className="btn-edit-sm" title="Edit" >
                                                      <i className="bi bi-pencil"></i>
                                                  </Link>
                                              )
                                          }


                                          {
                                              can("leaves.destroy") && (
                                                  <button className="btn-danger-sm" onClick={() => deleteLeave(leave.id)} title="Delete"><i className="bi bi-trash3" /></button>
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
            <div
              id="emptyState"
              style={{
                display: "none",
                textAlign: "center",
                padding: 36,
                color: "#94A3B8",
              }}
            >
              <i
                className="bi bi-person-x"
                style={{ fontSize: 36, marginBottom: 10, display: "block" }}
              />
              No admins found.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveType;
