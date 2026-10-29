import { useEffect, useState, useCallback } from 'react'
import { PulseLoader } from 'react-spinners';
import { showError, showSuccess } from '../../../utils/notify';
import { Link } from 'react-router';
import confirmDelete from '../../../utils/confirmDelete';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/api';
// import axios from 'axios';

import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Pagination from '../common/Pagination';


const statusColors = {
    online: "bg-success text-light",
    offline: "bg-danger text-light",
    mismatch: "bg-danger text-light",
    unknown: "bg-danger text-light",
};

const CompanyDevice = () => {

    useEffect(() => {
        document.title = "Company Device";
    }, []);

    const { can } = useAuth();

    const [loading, setLoading] = useState(false);
    const [device, setDevice] = useState({});
    const [devices, setDevices] = useState([]);
    const [deviceName, setDeviceName] = useState([]);
    const [deviceBrand, setDeviceBrand] = useState([]);
    const [companies, setCompanies] = useState([]);

    const [trashed, setTrashed] = useState(0);
    const [brands, setBrands] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalDevices, setTotalDevices] = useState(0);
    const perPage = 10;

    const handleInput = async (e) => {
        const { name, value } = e.target;

        setDevice((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "device_brand_id") {
            // Clear previous device selection
            setDevice((prev) => ({
                ...prev,
                device_brand_id: value,
                device_id: ""
            }));

            if (!value) {
                setDeviceName([]);
                return;
            }

            try {
                const response = await api.get(`/devices/by-brand`, {
                    params: {
                        device_brand_id: value
                    }
                });
                setDeviceName(response.data.devices || []);

            } catch (error) {
                console.error("Error fetching devices:", error);
                setDeviceName([]);
            }
        }
    };
    useEffect(() => {
        fetchDatas();
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);

        try {
            const result = await api.post(`/company-devices`, device)
            showSuccess(result.data.message);
            fetchDatas();
            setDevice({
                name: "",
                company_id: "",
                device_brand_id: "",
                device_id: "",
                serial_no: "",
                port: "",
                api_key: "",
                device_code: "",
                api_url: "",
                ip: ""
            });


        } catch (error) {
            showError(error.response.data.message)
        }
        finally {
            setLoading(false)
        }
    }

    const deleteDevice = async (id) => {
        const confirmed = await confirmDelete();
        if (!confirmed) return;
        setLoading(true);

        try {
            const result = await api.delete(`/company-devices/${id}`)
            showSuccess(result.data.message);
            fetchDatas();
        } catch (error) {
            showError(error.response.data.message);
            setLoading(false);
        }
        finally {
            setLoading(false);
        }
    }

    const fetchDatas = async (page = 1) => {
        try {
            const result = await api.get(`/company-devices`, {
                params: { page, per_page: perPage },
            });
            setDevices(result.data.devices.data);
            setCurrentPage(result.data.devices.current_page);
            setLastPage(result.data.devices.last_page);
            setTotalDevices(result.data.devices.total);
            setDeviceName(result.data.device_name)
            setDeviceBrand(result.data.device_brand)
            setCompanies(result.data.companies);
            setTrashed(result.data.trashed);
        } catch (error) {
            showError(error.response.data.message);
        }


    }


    const [busyId, setBusyId] = useState(null); // which device row is mid-action
    const [messages, setMessages] = useState({}); // deviceId -> last result/error text


    const listDevices = async (page) => {
        const result = await api.get(`/company-devices`, {
            params: { page, per_page: perPage },
        });
        setCurrentPage(result.data.devices.current_page);
        setLastPage(result.data.devices.last_page);
        setTotalDevices(result.data.devices.total);
        return result.data.devices.data;
    };

    // const checkDeviceConnection = (id) =>
    //   api.post(`/company-devices/${id}/check-connection`).then((r) => r.data);

    const checkDeviceConnection = async (id) => {
        const result = await api.post(`/company-devices/${id}/check-connection`);
        return result.data; // { status: 'online', serial_no: '...' }
    };

    const syncDevice = async (id) => {
        const result = await api.post(`/company-devices/${id}/sync`);
        return result.data.data; // controller wraps the summary as { data: {...} }
    };

    // const syncDevice = (id) =>
    //   api.post(`/company-devices/${id}/sync`).then((r) => r.data.data);



    const loadDevices = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            setDevices(await listDevices(page));
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDevices(1);
    }, [loadDevices]);

    const handlePageChange = (page) => {
        if (page < 1 || page > lastPage) return;
        loadDevices(page);
    };



    const handleCheckConnection = async (device) => {
        setBusyId(device.id);
        setMessages((m) => ({ ...m, [device.id]: null }));

        try {
            const result = await checkDeviceConnection(device.id);
            console.log(result)
            setMessages((m) => ({
                ...m,
                [device.id]: `Online — serial confirmed (${result?.serial_no ?? "Unknown"})`,
            }));
            showSuccess(`Device connected — serial ${result?.serial_no ?? ""}`);
        } catch (err) {
            console.error("Connection error:", err);
            showError(err.response?.data?.message ?? "Could not reach device");
        } finally {
            setBusyId(null);
            loadDevices();
        }
    };

    const handleSync = async (device) => {
        setBusyId(device.id);
        setMessages((m) => ({ ...m, [device.id]: null }));

        try {
            const summary = await syncDevice(device.id);
            setMessages((m) => ({
                ...m,
                [device.id]: `Synced: ${summary.logs_inserted} new punch(es), ${summary.days_recomputed} day(s) recomputed`,
            }));
            showSuccess("Sync completed");
        } catch (err) {
            showError(err.response?.data?.message ?? "Sync failed");
        } finally {
            setBusyId(null);
        }
    };
    // if (loading) return <p className="text-sm text-gray-500">Loading devices…</p>;


    //Device Manager End


    return (
        <div>
            <div className="admin-mgmt">
                <div className="admin-mgmt-grid">
                    {/* Create Admin Form */}
                    <div className="glass-card create-admin-card">
                        <div className="count-badge-row d-flex justify-content-between">
                            <button class="theme-toggle-btn" title="Cycle theme"><i className="bi bi-plus-circle" style={{ fontSize: "14px" }}></i> Create New Company Device </button>
                            <div className="count-icon"><i className="bi bi-shield-person-fill" />  {totalDevices || 0}</div>
                        </div>


                        <form onSubmit={handleSubmit}  >
                            <div className="form-group">

                                <FloatingLabel
                                    controlId="floatingSelectGrid"
                                    label="Device Name (eg: Branch Office HK Vision)"
                                >
                                    <input type="text" name='name' value={device?.name} onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. Alex Rivera" />
                                </FloatingLabel>
                            </div>


                            <div className="form-group">
                                {/* <label className="form-label"> Company Name</label> */}

                                <FloatingLabel controlId="floatingSelectGrid" label="Company Name">
                                    <Form.Select name="company_id" onChange={handleInput} aria-label="Floating label select example" className="mb-3">
                                        <option>Please Select Company</option>
                                        {
                                            companies.map((item) => {
                                                return (
                                                    <option value={item.id} key={item.id}>{item.name}</option>
                                                )
                                            })
                                        }
                                    </Form.Select>

                                </FloatingLabel>
                            </div>
                            <div className="form-group">
                                {/* <label className="form-label"> Device Brand Id(Name)</label>
                                <input type="number" name='device_brand_id' value={device?.device_brand_id} onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. Alex Rivera" /> */}
                                <FloatingLabel
                                    controlId="floatingSelectGrid"
                                    label="Device Brand"
                                >
                                    <Form.Select
                                        name="device_brand_id"
                                        value={device?.device_brand_id || ""}
                                        onChange={handleInput}
                                        className="mb-3"
                                    >
                                        <option value="">Please Select Device Brand</option>

                                        {deviceBrand.map((item) => (
                                            <option value={item.id} key={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </FloatingLabel>

                            </div>

                            <div className="form-group">
                                {/* <label className="form-label"> Device Id</label> */}
                                <Form.Select name="device_id" value={device?.device_id || ""} onChange={handleInput} aria-label="Floating label select example" className="mb-3">
                                    <option>Please Select Device</option>
                                    {
                                        deviceName.map((item) => {
                                            return (
                                                <option value={item.id} key={item.id}>{item.name}</option>
                                            )
                                        })
                                    }
                                </Form.Select>
                            </div>


                            <FloatingLabel
                                controlId="floatingSelectGrid"
                                label="Serial Number (eg:ZKTK40PRO001)"
                            >
                                <input type="text" name='serial_no' value={device?.serial_no} onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. ZKTK40PRO001" />
                            </FloatingLabel>



                            <FloatingLabel
                                controlId="floatingSelectGrid"
                                label="PORT (eg:4370)"
                            >
                                <input type="text" name='port' value={device?.port} onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. 4370" />
                            </FloatingLabel>



                            <FloatingLabel
                                controlId="floatingSelectGrid"
                                label="API KEY (eg:123456)"
                            >
                                <input type="text" name='api_key' value={device?.api_key} onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. 123456" />
                            </FloatingLabel>

                            {/* <div className="form-group">
                                <label className="form-label"> Device Code</label>
                                <input type="text" name='device_code' value={device?.device_code} onChange={handleInput} className="form-control" placeholder="e.g. Alex Rivera" />
                            </div> */}
                            <FloatingLabel
                                controlId="floatingSelectGrid"
                                label="Device Code (eg:ZKT-001)"
                            >
                                <input type="text" name='device_code' value={device?.device_code} onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. 1ZKT-001" />
                            </FloatingLabel>

                            {/* <div className="form-group">
                                <label className="form-label"> API URL</label>
                                <input type="text" name='api_url' value={device?.api_url} onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. Alex Rivera" />
                            </div> */}

                            <FloatingLabel
                                controlId="floatingSelectGrid"
                                label="API URL (eg: http://192.168.1.201/api)"
                            >
                                <input type="text" name='api_url' value={device?.api_url} onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. 1ZKT-001" />
                            </FloatingLabel>

                            {/* <div className="form-group">
                                <label className="form-label">IP</label>
                                <input type="text" name='ip' value={device?.ip} onChange={handleInput} className="form-control" id="newAdminName" placeholder="e.g. Alex Rivera" />
                            </div> */}

                            <FloatingLabel
                                controlId="floatingSelectGrid"
                                label="IP ADDRESS (eg: 192.168.1.201)"
                            >
                                <input type="text" name='ip' value={device?.ip} onChange={handleInput} className="form-control" placeholder="e.g. 192.168.1.201" />
                            </FloatingLabel>


                            {
                                can("company-devices.store") && (
                                    <button type='submit' className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                        {loading ? <PulseLoader
                                            color='white'
                                            loading={true}
                                            size={12}
                                        /> : ''}
                                        <i className="bi bi-person-plus-fill" /> Create Company Device
                                    </button>
                                )
                            }


                        </form>
                    </div>
                    {/* Admin List */}
                    <div className="glass-card-solid admin-list-card">
                        <div className="admin-table-header">
                            <div>
                                <div className="section-title" style={{ fontSize: 15 }}>Company Device Accounts</div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>Manage existing administrator accounts</div>
                            </div>

                            <div>
                                <Link to={`/admin/company-device/trashed`} type="button" className="theme-toggle-btn gap-0 position-relative">
                                    <i class="bi bi-trash3-fill text-light"></i>
                                    <span className='badge ms-0'> Trashed</span>
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {trashed || 0}+
                                        <span className="visually-hidden">unread messages</span>
                                    </span>
                                </Link>

                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table class="admin-table table table-striped" id="adminTable">
                                <thead>
                                    <tr>
                                        <th>S.no</th>
                                        <th>Device Details</th>
                                        {/* <th>Company Named</th>
                                        <th>Device Brand</th> */}
                                        {/* <th>Serial No</th> */}
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="adminTableBody">
                                    {
                                        devices.length > 0 ? devices.map((device, index) => {
                                            return (
                                                <tr key={device.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{device.name}</span>
                                                                <span
                                                                    className={`rounded-full px-2 py-0.5 text-xs ${statusColors[device.status] ?? statusColors.unknown
                                                                        }`}
                                                                >
                                                                    {device.status ?? "unknown"}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                Serial: <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "1px" }}> {device.serial_no}</span>, Brand: <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "1px" }}> {device.brand?.name}</span>,  IP: <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "1px" }}> {device.ip}</span> Port :<span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "1px" }}>{device.port}</span>
                                                            </div>
                                                            {messages[device.id] && (
                                                                <div className="mt-1 text-xs text-gray-600">{messages[device.id]}</div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* <td>
                                                        {device.company?.name}
                                                    </td>

                                                    <td>
                                                        {device.brand?.name}
                                                    </td> */}

                                                    {/* <td>
                                                        <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "1px" }}> {device.serial_no}</span>
                                                    </td> */}

                                                    <td>
                                                        <div className="table-actions">



                                                            {/* <span className="text-xs text-gray-500"> */}
                                                            <span className="btn-edit-sm rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50">
                                                                {device.connection_mode === 'push'
                                                                    ? `Push mode — last seen ${device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : 'never'}`
                                                                    // : `Pull mode — ${device.ip}:${device.port}`}
                                                                    : `Pullmode`}
                                                            </span>

                                                            {device.connection_mode !== 'push' && (
                                                                <button onClick={() => handleSync(device)} disabled={busyId === device.id}
                                                                    className="btn-danger-sm rounded-md bg-blue-600 px-3 py-1.5 text-sm disabled:opacity-50">
                                                                    Sync
                                                                </button>
                                                            )}

                                                            {
                                                                can("company-devices.show") && (
                                                                    <Link to={`/admin/company-device/${device.id}`} className="btn-edit-sm" title="Show" >
                                                                        <i className="bi bi-eye"></i>
                                                                    </Link>
                                                                )
                                                            }


                                                            {
                                                                can("company-devices.update") && (
                                                                    <Link to={`/admin/company-device/edit/${device.id}`} className="btn-edit-sm" title="Edit" >
                                                                        <i className="bi bi-pencil"></i>
                                                                    </Link>
                                                                )
                                                            }


                                                            {
                                                                can("company-devices.destroy") && (
                                                                    <button className="btn-danger-sm" onClick={() => deleteDevice(device.id)} title="Delete"><i className="bi bi-trash3" /></button>
                                                                )
                                                            }
                                                        </div>
                                                    </td>
                                                    {messages[device.id] && (
                                                        <div className="mt-1 text-xs text-gray-600">{messages[device.id]}</div>
                                                    )}
                                                </tr>
                                            )
                                        }) :
                                            <tr>
                                                <td colSpan={6} className='text-danger'><p>No Data Found !!</p></td>
                                            </tr>

                                    }


                                </tbody>
                            </table>
                            <Pagination currentPage={currentPage} lastPage={lastPage} onChange={handlePageChange} />
                        </div>
                        <div id="emptyState" style={{ display: 'none', textAlign: 'center', padding: 36, color: '#94A3B8' }}>
                            <i className="bi bi-person-x" style={{ fontSize: 36, marginBottom: 10, display: 'block' }} />
                            No admins found.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompanyDevice