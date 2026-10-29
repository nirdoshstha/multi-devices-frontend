import { useEffect, useState } from 'react'
import { showError, showSuccess } from '../../../utils/notify';
import { useAuth } from '../../../context/AuthContext';
import api, { BASE_URL } from '../../../api/api';

import noimage from '../../../../public/no_image2.jpg'
import Pagination from '../common/Pagination';

const Staff = () => {

    useEffect(() => {
        document.title = "Staff";
    }, []);


    const { can } = useAuth();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [deviceLinks, setDeviceLinks] = useState({});
    const [staffs, setStaffs] = useState([]);
    const [devices, setDevices] = useState([]);

    const [search, setSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const datasPerPage = 10;


    const handleDeviceLinkInput = (staffId, field, value) => {
        setDeviceLinks(prev => ({
            ...prev,
            [staffId]: {
                ...prev[staffId],
                [field]: value,
            }
        }));
    };

    const toTimeInputValue = (time) => time ? time.slice(0, 5) : "";


    useEffect(() => {
        fetchDatas();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            for (const staffId of Object.keys(deviceLinks)) {

                const link = deviceLinks[staffId];

                if (!link.company_device_id || !link.device_user_id) {
                    continue;
                }

                const result = await api.post('/staff-device-links', {
                    staff_id: staffId,
                    company_device_id: link.company_device_id,
                    device_user_id: link.device_user_id,
                    duty_start_time: link.duty_start_time,
                    duty_end_time: link.duty_end_time
                });
                console.log(result);

            }

            showSuccess("Biometric IDs saved successfully.");

            fetchDatas();

        } catch (error) {
            showError(
                error.response?.data?.message ||
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };




    const applyStaffList = (staffList) => {
        setStaffs(staffList);

        const initialLinks = {};
        staffList.forEach((staff) => {
            const link = staff.device_links?.[0];
            if (link) {
                initialLinks[staff.id] = {
                    company_device_id: String(link.company_device_id ?? ""),
                    device_user_id: link.device_user_id ?? "",
                    duty_start_time: toTimeInputValue(link.duty_start_time),
                    duty_end_time: toTimeInputValue(link.duty_end_time),
                };
            }
        });
        setDeviceLinks(initialLinks);
    };

    const fetchDatas = async (page = 1) => {
        try {
            const result = await api.get(`/staffs`, {
                params: { page, per_page: datasPerPage },
            });

            applyStaffList(result.data.staffs.data);
            setCurrentPage(result.data.staffs.current_page);
            setLastPage(result.data.staffs.last_page);
            setDevices(result.data.devices);
        } catch (error) {
            showError(error.response?.data?.message || "Something went wrong");
        }
    };

    const searchStaffs = async (page = 1) => {
        try {
            const result = await api.get(`/staffs/search`, {
                params: { search: search.trim(), page, per_page: datasPerPage },
            });
            applyStaffList(result.data.staffs.data);
            setCurrentPage(result.data.staffs.current_page);
            setLastPage(result.data.staffs.last_page);
        } catch (error) {
            showError(error.response.data.message || "Something went wrong");
        }
    }

    const handleSubmitSearch = async (e) => {
        e.preventDefault();
        await searchStaffs(1);
    }

    useEffect(() => {
        if (search.trim() === "") {
            fetchDatas();
        }
    }, [search])

    const handlePageChange = (page) => {
        if (page < 1 || page > lastPage) return;
        search.trim() ? searchStaffs(page) : fetchDatas(page);
    };

    return (
        <div>
            <div className="">
                <div className="admin-device-grid">

                    {/* Admin List */}

                    <div className="glass-card-solid admin-list-card">
                        <div className="admin-table-header">
                            <div>
                                <div className="section-title" style={{ fontSize: 15 }}>Company staff Accounts</div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>Manage existing administrator accounts</div>
                            </div>

                            <div className="search-box float-end">

                                <form onSubmit={handleSubmitSearch}>
                                    <div className="search-box float-end">
                                        <input
                                            type="text"
                                            name="search"
                                            className="form-control"
                                            placeholder="Search by name or role..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                        <i className="bi bi-search" />
                                    </div>
                                </form>

                            </div>


                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="admin-table" id="adminTable">
                                    <thead>
                                        <tr>
                                            <th>S.no</th>
                                            <th>staff Name</th>
                                            <th>Company Named</th>
                                            <th>Devices</th>
                                            <th>Biometric ID</th>
                                            <th>Duty Start Time</th>
                                            <th>Duty End Time</th>
                                        </tr>
                                    </thead>
                                    <tbody id="adminTableBody">
                                        {
                                            staffs.length > 0 ? staffs.map((staff, index) => {
                                                return (
                                                    <tr key={staff.id}>
                                                        <td> {(currentPage - 1) * datasPerPage + index + 1}</td>
                                                        <td>
                                                            <div className="admin-name-cell">

                                                                <div
                                                                    className="avatar-initials"
                                                                    style={{ background: "#141414aa" }}
                                                                >
                                                                    {
                                                                        staff.image ? <img src={`${BASE_URL}/uploads/user/${staff.user?.image}`} alt="Profile" className="navbar-avatar" />
                                                                            : <img alt="Profile" className="navbar-avatar" src={noimage} />
                                                                    }

                                                                </div>

                                                                <div>
                                                                    <div className="admin-name">{staff.name} </div>
                                                                    <div className="admin-email"> {staff.email} </div>
                                                                    <div className="admin-email"> {staff.phone} </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            {staff.company?.name} ({staff.id})
                                                        </td>


                                                        <td>
                                                            <input
                                                                type="hidden"
                                                                name="staff_id"
                                                                value={staff.id}
                                                            />
                                                            <select
                                                                name="company_device_id"
                                                                value={deviceLinks[staff.id]?.company_device_id || ""}
                                                                onChange={(e) =>
                                                                    handleDeviceLinkInput(
                                                                        staff.id,
                                                                        "company_device_id",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="form-select"
                                                            >
                                                                <option value="">Please Select Device</option>

                                                                {devices.map((device) => (
                                                                    <option value={device.id} key={device.id}>
                                                                        {device.name || ""}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        <td>
                                                           
                                                                <input
                                                                    name='device_user_id'
                                                                    type="text"
                                                                    value={deviceLinks[staff.id]?.device_user_id || ""}
                                                                    onChange={(e) =>
                                                                        handleDeviceLinkInput(
                                                                            staff.id,
                                                                            "device_user_id",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="form-control"
                                                                    placeholder="Biometric ID"
                                                                />

                                                                {/* <label>Biometric ID</label> */}
                                                           
                                                        </td>

                                                        <td>
                                                           
                                                                <input
                                                                    name='duty_start_time'
                                                                    type="time"
                                                                    value={deviceLinks[staff.id]?.duty_start_time || ""}
                                                                    onChange={(e) =>
                                                                        handleDeviceLinkInput(
                                                                            staff.id,
                                                                            "duty_start_time",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="form-control"
                                                                    placeholder="Biometric ID"
                                                                />

                                                                {/* <label>Duty Start Time</label> */}
                                                             
                                                        </td>

                                                        <td>
                                                           
                                                                <input
                                                                    name='duty_end_time'
                                                                    type="time"
                                                                    value={deviceLinks[staff.id]?.duty_end_time || ""}
                                                                    onChange={(e) =>
                                                                        handleDeviceLinkInput(
                                                                            staff.id,
                                                                            "duty_end_time",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="form-control"
                                                                    placeholder="Biometric ID"
                                                                />

                                                                 
                                                        </td>



                                                    </tr>
                                                )
                                            }) :
                                                <tr>
                                                    <td colSpan={7} className='text-danger text-center'><p>No Data Found !!</p></td>
                                                </tr>

                                        }


                                    </tbody>

                                </table>

                                <Pagination currentPage={currentPage} lastPage={lastPage} onChange={handlePageChange} />
                                <div className='text-center'>
                                    <button type="submit" className="btn-primary"><i className="bi bi-person-plus-fill"></i> SAVE BIOMETRIC</button>
                                </div>

                            </div></form>
                        <div id="emptyState" style={{ display: 'none', textAlign: 'center', padding: 36, color: '#94A3B8' }}>
                            <i className="bi bi-person-x" style={{ fontSize: 36, marginBottom: 10, display: 'block' }} />
                            No admins found.
                        </div>

                    </div>


                </div>
            </div >
        </div >
    )
}

export default Staff
