import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { showError } from '../../../utils/notify';
import api from '../../../api/api';
import moment from 'moment/moment';

const CompanyDeviceShow = () => {

    useEffect(() => {
            document.title = "Company Device Show";
        }, []);

    const { id } = useParams();

    const [device, setDevice] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getData();
    }, []);


    const getData = async () => {
        setLoading(true);
        try {

            const result = await api.get(`company-devices/${id}`);
            console.log(result)
            setDevice(result.data.device);
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

                    <div className="glass-card create-admin-card">
                        <div className="count-badge-row d-flex justify-content-between">
                            <button class="theme-toggle-btn" title="Cycle theme"><i class="bi bi-eye"></i> View Company Devices </button>
                            <Link to={`/admin/company-device`} type='submit' className="btn-primary text-decoration-none">
                                <i class="bi bi-house-door"></i> Back To Company Devices
                            </Link>
                        </div>
                        

                        <div className='row'>

                            <div className="col-md-4">
                                <div className="info-card mb-3">
                                    <span className="info-label">Company Device Name</span>
                                    <h6>{device?.name}</h6>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="info-card mb-3">
                                    <span className="info-label">Company Name</span>
                                    <h6> {device?.company_id}</h6>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="info-card mb-3">
                                    <span className="info-label">Device Brand Id</span>
                                    <h6> {device?.device_brand_id}</h6>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="info-card mb-3">
                                    <span className="info-label">Device Id</span>
                                    <h6> {device?.device_id}</h6>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="info-card mb-3">
                                    <span className="info-label">Serial Number</span>
                                    <h6> {device?.serial_no}</h6>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="info-card mb-3">
                                    <span className="info-label">Port</span>
                                    <h6> {device?.port}</h6>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="info-card mb-3">
                                    <span className="info-label">API Key</span>
                                    <h6> {device?.api_key}</h6>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="info-card mb-3">
                                    <span className="info-label">Device Code</span>
                                    <h6> {device?.device_code}</h6>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="info-card mb-3">
                                    <span className="info-label">API URL</span>
                                    <h6> {device?.api_url}</h6>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="info-card mb-3">
                                    <span className="info-label">IP</span>
                                    <h6> {device?.ip}</h6>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="info-card mb-3">
                                    <span className="info-label">Created Date</span>
                                    <h6>
                                        {device?.created_at
                                            ? moment(device.created_at).format("LLL")
                                            : "-"}
                                    </h6>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="info-card mb-3">
                                    <span className="info-label">Updated Date</span>
                                    <h6>
                                        {device?.updated_at
                                            ? moment(device.updated_at).format("LLL")
                                            : "-"}
                                    </h6>
                                </div>
                            </div>



                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <div className="info-card">
                                    <span className="info-label">
                                        Created By
                                    </span>
                                    <h6>
                                        {device?.creator?.name}
                                    </h6>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="info-card">
                                    <span className="info-label">
                                        Updated By
                                    </span>
                                    <h6>
                                        {device.updator?.name || 'Not Updated Yet'}
                                    </h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>


        </div>
    )
}

export default CompanyDeviceShow