
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router';
import { showError, showSuccess } from '../../../utils/notify';
import api, { BASE_URL } from '../../../api/api';
import { Picker } from '@munatech/nepali-datepicker';

const LeaveApplicationEdit = () => {
    const { id } = useParams();

    const [leaveDetail, setLeaveDetail] = useState({});
    const [leaveTypes, setLeaveTypes] = useState([]);

    // Keep picker values as Nepali date objects.
    const [dateFrom, setDateFrom] = useState(undefined);
    const [dateTo, setDateTo] = useState(undefined);

    useEffect(() => {
        document.title = 'Edit Leave Application';
    }, []);

    // Convert YYYY-MM-DD or a JSON date string into a Nepali date object.
    const parseNepaliDate = (value) => {
        if (!value) return undefined;

        // Already a date object: { year, month, day }
        if (typeof value === 'object') {
            if (value.year && value.month && value.day) {
                return {
                    year: Number(value.year),
                    month: Number(value.month),
                    day: Number(value.day),
                };
            }

            return undefined;
        }

        if (typeof value !== 'string') return undefined;

        const trimmed = value.trim();

        // Handle JSON stored as a string:
        // {"year":2083,"month":7,"day":19}
        if (trimmed.startsWith('{')) {
            try {
                return parseNepaliDate(JSON.parse(trimmed));
            } catch {
                return undefined;
            }
        }

        // Handle YYYY-MM-DD
        const match = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

        if (!match) return undefined;

        return {
            year: Number(match[1]),
            month: Number(match[2]),
            day: Number(match[3]),
        };
    };

    // Convert a Nepali date object to YYYY-MM-DD.
    const formatNepaliDate = (value) => {
        if (!value) return '';

        const date = parseNepaliDate(value);

        if (!date) return '';

        const year = String(date.year);
        const month = String(date.month).padStart(2, '0');
        const day = String(date.day).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const getLeaveDetail = useCallback(async () => {
        try {
            const result = await api.get(`/leave-applications/${id}`);

            const leave = result.data.leave_application;

            setLeaveDetail(leave);
            setLeaveTypes(result.data.leave_types || []);

            // Use the API response directly, not the old React state.
            setDateFrom(parseNepaliDate(leave.date_from));
            setDateTo(parseNepaliDate(leave.date_to));
        } catch (error) {
            showError(
                error.response?.data?.message ||
                'Failed to load leave application.'
            );
        }
    }, [id]);

    useEffect(() => {
        getLeaveDetail();
    }, [getLeaveDetail]);

    const handleInput = (e) => {
        const { name, value } = e.target;

        setLeaveDetail((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!dateFrom || !dateTo) {
            showError('Please select both leave start and end dates.');
            return;
        }

        const formattedFrom = formatNepaliDate(dateFrom);
        const formattedTo = formatNepaliDate(dateTo);

        if (!formattedFrom || !formattedTo) {
            showError('Please select valid Nepali dates.');
            return;
        }

        try {
            const payload = {
                ...leaveDetail,
                date_from: formattedFrom,
                date_to: formattedTo,
            };

            const result = await api.put(
                `/leave-applications/${id}`,
                payload
            );

            showSuccess(result.data.message || 'Leave application updated.');

            // Reload the saved data.
            await getLeaveDetail();
        } catch (error) {
            const errors = error.response?.data?.errors;

            showError(
                errors
                    ? Object.values(errors).flat().join('\n')
                    : error.response?.data?.message ||
                    'Failed to update leave application.'
            );
        }
    };

    return (
        <div>
            <div className="glass-card-solid profile-right">
                <div style={{ marginBottom: 20 }}>
                    <div>
                        <div
                            className="section-title"
                            style={{ fontSize: 15 }}
                        >
                            Update Leave Approve / Reject

                            <div className="float-end">
                                <Link
                                    to="/admin/leave-application"
                                    className="theme-toggle-btn text-decoration-none"
                                >
                                    <i className="bi bi-house-door"></i>
                                    {' '}Back To company
                                </Link>
                            </div>
                        </div>

                        <div
                            style={{
                                fontSize: 12,
                                color: '#94A3B8',
                                marginTop: 2,
                            }}
                        >
                            Update your Is Leave Approved?
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <table className="table table-sm table-bordered mb-0">
                                    <tbody>
                                        <tr>
                                            <th width="35%">
                                                <label className="form-label">
                                                    Name
                                                </label>
                                            </th>

                                            <td className="position-relative">
                                                <img
                                                    src={
                                                        leaveDetail.user?.image
                                                            ? `${BASE_URL}/uploads/user/${leaveDetail.user.image}`
                                                            : '/no_image2.jpg'
                                                    }
                                                    alt={
                                                        leaveDetail.user?.name ||
                                                        'User'
                                                    }
                                                    className="rounded-circle border position-absolute"
                                                    style={{
                                                        width: 80,
                                                        height: 80,
                                                        objectFit: 'cover',
                                                        right: 10,
                                                        top: 10,
                                                    }}
                                                />

                                                <label className="form-label">
                                                    {leaveDetail.user?.name || ''}
                                                </label>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>
                                                <label className="form-label">
                                                    Leave Type
                                                </label>
                                            </th>

                                            <td>
                                                <select
                                                    name="leave_type_id"
                                                    className="form-select"
                                                    value={
                                                        leaveDetail.leave_type_id ||
                                                        ''
                                                    }
                                                    onChange={handleInput}
                                                >
                                                    <option value="">
                                                        Select Leave Type
                                                    </option>

                                                    {leaveTypes.map((item) => (
                                                        <option
                                                            value={item.id}
                                                            key={item.id}
                                                        >
                                                            {item.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>
                                                <label className="form-label">
                                                    Leave Start / End
                                                </label>
                                            </th>

                                            <td>
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">
                                                            From
                                                            {' '}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>

                                                        <Picker
                                                            name="date_from"
                                                            value={dateFrom}
                                                            onChange={(value) => {
                                                                setDateFrom(
                                                                    parseNepaliDate(value)
                                                                );
                                                            }}
                                                            dateFormat="YYYY-MM-DD"
                                                            placeholder="Pick a Nepali Date"
                                                            className="w-100"
                                                            disabled={leaveDetail.is_approved === 1}
                                                        />
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label">
                                                            To
                                                            {' '}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>

                                                        <Picker
                                                            name="date_to"
                                                            value={dateTo}
                                                            onChange={(value) => {
                                                                setDateTo(
                                                                    parseNepaliDate(value)
                                                                );
                                                            }}
                                                            dateFormat="YYYY-MM-DD"
                                                            placeholder="Pick a Nepali Date"
                                                            className="w-100"
                                                            disabled={leaveDetail.is_approved === 1}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>
                                                <label className="form-label">
                                                    Reason
                                                </label>
                                            </th>

                                            <td>
                                                <textarea
                                                    name="reason"
                                                    value={leaveDetail.reason || ''}
                                                    onChange={handleInput}
                                                    className="form-control"
                                                    disabled={leaveDetail.is_approved === 1}
                                                />
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>
                                                <label className="form-label">
                                                    Approval Status
                                                </label>
                                            </th>

                                            <td>
                                                {leaveDetail.is_approved == 1 ? (
                                                    <button
                                                        type="button"
                                                        className="btn btn-success"
                                                    >
                                                        <i className="bi bi-check2-circle"></i>
                                                        {' '}Approved
                                                    </button>
                                                ) : leaveDetail.is_approved == 2 ? (
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                    >
                                                        <i className="bi bi-x-circle"></i>
                                                        {' '}Rejected
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                    >
                                                        <i className="bi bi-hourglass-split"></i>
                                                        {' '}Pending
                                                    </button>
                                                )}
                                            </td>
                                        </tr>

                                        {leaveDetail.approval_remarks != null && (
                                            <tr>
                                                <th>
                                                    <label className="form-label">
                                                        Approval Remarks
                                                    </label>
                                                </th>

                                                <td>
                                                    {leaveDetail.approval_remarks ||
                                                        'No remarks'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="modal-footer gap-3 mt-3">
                                <button
                                    type="submit"
                                    className="btn btn-danger"
                                    disabled={leaveDetail.is_approved === 1}
                                >
                                    <i className="bi bi-save"></i> Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaveApplicationEdit;
