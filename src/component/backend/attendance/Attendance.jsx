import { useEffect, useState } from 'react'
import { showError, showSuccess } from '../../../utils/notify';
import { Link } from 'react-router';
import { useAuth } from '../../../context/AuthContext';
import api, { BASE_URL } from '../../../api/api';
import "/src/assets/backend/attendance.css";

import noimage from '../../../../public/no_image2.jpg'
import "/node_modules/@munatech/nepali-datepicker/dist/lib/nepali-datepicker.css";

import { Picker, getTodayBs } from '@munatech/nepali-datepicker';
import { ClipLoader } from 'react-spinners';

const MONTHS = [
    { value: 1, label: "Baisakh" },
    { value: 2, label: "Jestha" },
    { value: 3, label: "Ashad" },
    { value: 4, label: "Shrawan" },
    { value: 5, label: "Bhadra" },
    { value: 6, label: "Ashoj" },
    { value: 7, label: "Kartik" },
    { value: 8, label: "Mangsir" },
    { value: 9, label: "Poush" },
    { value: 10, label: "Magh" },
    { value: 11, label: "Falgun" },
    { value: 12, label: "Chaitra" },
];

const Attendance = () => {

    useEffect(() => {
        document.title = "Staff Attendance";
    }, []);

    const { can } = useAuth();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [monthlyLoading, setMonthlyLoading] = useState(false);

    const [staffs, setStaffs] = useState([]);
    const [attendances, setAttendances] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [disabled, setDisabled] = useState(false);

    // const days = Array.from({ length: 32 }, (_, i) => i + 1);
    const [days, setDays] = useState([]);
    // ---- Daily view state ----
    const [date, setDate] = useState(getTodayBs());

    // ---- Monthly view state ----
    const [monthlyStaffs, setMonthlyStaffs] = useState([]);
    const [month, setMonth] = useState(getTodayBs().month);
    const [year, setYear] = useState(getTodayBs().year);

    //Filter By Company & Branch
    const [companies, setCompanies] = useState([]);

    const [branches, setBranches] = useState([]);

    const [companyBranch, setCompanyBranch] = useState({
        company_id: "",
        branch_id: "",
    });

    const handleInputCompanyBranch = (e) => {
        const { name, value } = e.target;

        if (name === 'company_id') {
            const selectedCompany = companies.find((company) => company.id === Number(value));
            setBranches(selectedCompany?.branches || []);

            // Reset branch when company changes
            setCompanyBranch({ ...companyBranch, company_id: value, branch_id: "", });
            return;

        }

        setCompanyBranch({ ...companyBranch, [name]: value })
    }

    const handleSubmitCompanyBranch = async (e, company_id, branch_id) => {
        e.preventDefault(e);

        try {
            const result = await api.get("attendance/staffs-company-and-branch-wise/", {
                params: {
                    company_id: company_id,
                    branch_id: branch_id,
                }
            })

            setStaffs(result.data.staffs);

        } catch (error) {
            showError(error.response.data.message || "Something went wrong")
        }
    }

    const handleAttendanceChange = (staffId, field, value) => {
        setAttendances((prev) => prev.map((item) => item.staff_id === staffId ? { ...item, [field]: value } : item));

    };

    useEffect(() => {
        fetchDailyData(date);
    }, []);

    // ===================== DAILY SEARCH =====================
    const fetchDailyData = async (dateObj) => {
        // setLoading(true);
        try {
            const formattedDate = dateObj
                ? `${dateObj.year}-${String(dateObj.month).padStart(2, "0")}-${String(dateObj.day).padStart(2, "0")}`
                : null;

            const result = await api.get("/attendance/search-by-date", {
                params: {
                    date: formattedDate,

                },
            });

            console.log(result)
            setStaffs(result.data.staffs);
            setDisabled(result.data.disabled);

            const attendanceData = result.data.staffs.map((staff) => {
                const attendance = staff.attendances[0] || {};

                return {
                    staff_id: staff.id,
                    date: attendance.date || formattedDate,
                    // check_in: attendance.check_in ? attendance.check_in.substring(0, 5) : "",
                    check_in: attendance.check_in ? attendance.check_in : "",
                    check_out: attendance.check_out ? attendance.check_out : "",
                    remarks: attendance.remarks || "",
                    late_minutes: attendance.late_minutes || 0,
                    early_leave_minutes: attendance.early_leave_minutes || 0,
                    working_minutes: attendance.working_minutes || 0,
                    overtime_minutes: attendance.overtime_minutes || 0,
                    status: attendance.status || "present",
                };
            });

            setAttendances(attendanceData);
        } catch (error) {
            showError(error?.response?.data?.message || "Failed to load attendance");
        } finally {
            // setLoading(false);
        }
    };

    const handleSubmitByDate = async (e) => {
        e.preventDefault();
        fetchDailyData(date);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await api.post("/attendances", { attendances });
            showSuccess(result.data.message);
            fetchDailyData(date); // Refresh after submission
        } catch (error) {
            showError(error?.response?.data?.message || "Failed to save attendance");
        }
    };

    // ===================== MONTHLY SEARCH =====================
    const fetchMonthlyData = async (m, y) => {
        setMonthlyLoading(true);
        try {
            const result = await api.get("/attendance/search-by-date", {
                params: {
                    month: m,
                    year: y,
                },
            });

            setMonthlyStaffs(result.data.staffs);
            setDays(result.data.days);
            setHolidays(result.data.holidays);
            console.log(result)
        } catch (error) {
            showError(error?.response?.data?.message || "Failed to load monthly report");
        } finally {
            setMonthlyLoading(false);
        }
    };

    const handleMonthlySubmit = (e) => {
        e.preventDefault();
        fetchMonthlyData(month, year);
    };

    // Nepali BS date strings look like "2083-04-16" — pull the day out
    // directly instead of using `new Date(...)`, which will misparse a
    // BS string as if it were Gregorian.
    const getBsDay = (bsDateString) => {
        if (!bsDateString) return null;
        const parts = bsDateString.split("-");
        return parts.length === 3 ? parseInt(parts[2], 10) : null;
    };

    // ===================== VIEW SWITCH =====================
    useEffect(() => {
        const buttons = document.querySelectorAll(".view-switch button");

        const handleClick = (btn) => {
            document.querySelectorAll(".view-switch button").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
            document.getElementById(`view-${btn.dataset.view}`)?.classList.add("active");

            // Lazy-load the monthly report the first time that tab is opened
            if (btn.dataset.view === "monthly" && monthlyStaffs.length === 0) {
                fetchMonthlyData(month, year);
            }
        };

        buttons.forEach((btn) => {
            btn.addEventListener("click", () => handleClick(btn));
        });

        return () => {
            buttons.forEach((btn) => {
                btn.replaceWith(btn.cloneNode(true)); // Removes attached listeners
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monthlyStaffs, month, year]);

    return (
        <div>
            {/* Main */}
            <div className="page-wrap py-0 py-md-2">
                {/* View switch */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-0 mb-3">
                    <div className="view-switch">
                        <button className="active" data-view="daily"><i className="bi bi-calendar-check" /> Daily Register</button>
                        <button data-view="monthly"><i className="bi bi-grid-3x3-gap" /> Monthly Report</button>
                    </div>

                    {
                        can("attendance.search_by_date") && (
                            <form className="d-flex align-items-end gap-2 flex-wrap" onSubmit={handleSubmitByDate}>
                                <div>
                                    <label className="field-label">Date (B.S.)</label>
                                    <Picker
                                        value={date}
                                        onChange={(value) => setDate(value)}
                                        placeholder="Pick a Nepali Date"
                                    />
                                </div>
                                <button type="submit" className="theme-toggle-btn" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <ClipLoader color="white" size={20} />
                                            <span className="ms-2">Searching...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-search" /> Search
                                        </>
                                    )}
                                </button>
                            </form>
                        )
                    }

                </div>

                {/* ============ DAILY VIEW ============ */}
                {
                    can("attendance.search_by_date") && (
                        <div className="view active" id="view-daily">
                            <div className="panel mb-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="p-3 p-md-4">
                                        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-calendar3 text-muted" />
                                                <span className="font-mono small text-muted">
                                                    Showing records for{" "}
                                                    <strong style={{ color: 'var(--teal-900)' }}>
                                                        {date ? `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}` : "-"}
                                                    </strong>
                                                </span>
                                            </div>

                                            <div>
                                                {/* Filters row — all three columns use the same height:36px wrapper */}
                                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                                                    {/* Company */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 160 }}>

                                                        <div style={{ position: 'relative', height: 41 }}>
                                                            <i className="bi bi-building" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94A3B8', pointerEvents: 'none' }} />
                                                            <select
                                                                name="company_id"
                                                                className="form-select"
                                                                onChange={handleInputCompanyBranch}
                                                                value={companyBranch.company_id}
                                                                style={{ position: 'absolute', inset: 0, width: '100%', height: 41, paddingLeft: 30, fontSize: 13 }}
                                                            >
                                                                <option value="">All companies</option>
                                                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Branch */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 160 }}>

                                                        <div style={{ position: 'relative', height: 41 }}>
                                                            <i className="bi bi-geo-alt" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#646464', pointerEvents: 'none' }} />
                                                            <select
                                                                name="branch_id"
                                                                className="form-select"
                                                                onChange={handleInputCompanyBranch}
                                                                value={companyBranch.branch_id}
                                                                style={{ position: 'absolute', inset: 0, width: '100%', height: 41, paddingLeft: 30, fontSize: 13 }}
                                                            >
                                                                <option value="">All branches</option>
                                                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <button type="submit" onClick={(e) => handleSubmitCompanyBranch(e, companyBranch.company_id, companyBranch.branch_id)} class="theme-toggle-btn" title="Cycle theme">
                                                        <i class="bi bi-check2-circle"></i> Submit
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <Link className="btn-ghost"><i className="bi bi-printer" /> Print</Link>
                                                <button type='submit' className="theme-toggle-btn"><i className="bi bi-save" /> Save</button>
                                            </div>
                                        </div>
                                        <div className="table-responsive">
                                            <table className="attn-table">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: 56 }}>S.No</th>
                                                        <th>Staff</th>
                                                        {/* <th>Role</th> */}
                                                        <th>Check In</th>
                                                        <th>Check Out</th>
                                                        <th>Status</th>
                                                        <th>Note</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loading ? (
                                                        <tr><td colSpan={6} className="text-center text-muted py-4">Loading...</td></tr>
                                                    ) : staffs.length === 0 ? (
                                                        <tr><td colSpan={6} className="text-center text-muted py-4">No staff found for this date.</td></tr>
                                                    ) :
                                                        disabled ? (
                                                            <tr><td colSpan={6} className="text-center text-danger py-4"> Today is Holiday.</td></tr>
                                                        )
                                                            : (
                                                                staffs.map((staff, index) => (
                                                                    <tr key={staff.id}>
                                                                        <td className="font-mono text-muted">{index + 1}</td>
                                                                        <td>
                                                                            <div className="d-flex align-items-center gap-3">
                                                                                <div className="staff-avatar" style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden' }}>
                                                                                    <img src={staff.image ? `${BASE_URL}/uploads/user/${staff.image}` : noimage} alt={staff.name} width={40} />
                                                                                </div>
                                                                                <div>
                                                                                    <div className="admin-name">{staff.name}</div>
                                                                                    <div className="admin-email">{staff.email || "Email not available"}</div>
                                                                                    <div className="staff-row-meta">{staff.designation?.name} </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        {/* <td></td> */}
                                                                        <td>
                                                                            <div className="time-input-wrap">

                                                                                <input
                                                                                    type="time"
                                                                                    name="check_in"
                                                                                    className="control"
                                                                                    value={attendances.find(a => a.staff_id === staff.id)?.check_in || ""}
                                                                                    onChange={(e) =>
                                                                                        handleAttendanceChange(staff.id, "check_in", e.target.value)
                                                                                    }
                                                                                />

                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="time-input-wrap">
                                                                                <input
                                                                                    type="time"
                                                                                    name="check_out"
                                                                                    disabled={disabled}
                                                                                    className="control"
                                                                                    value={attendances.find(a => a.staff_id === staff.id)?.check_out || ""}
                                                                                    onChange={(e) => handleAttendanceChange(staff.id, "check_out", e.target.value)}
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <select
                                                                                className="control"
                                                                                name='status'
                                                                                disabled={disabled}
                                                                                value={attendances.find(a => a.staff_id === staff.id)?.status || "present"}
                                                                                onChange={(e) => handleAttendanceChange(staff.id, "status", e.target.value)}
                                                                            >
                                                                                <option value="absent">Absent</option>
                                                                                <option value="present">Present</option>
                                                                                <option value="leave">Leave</option>
                                                                                {/* <option value="holiday">Holiday</option>
                                                                                <option value="halfday">Half Day</option>
                                                                                <option value="weekend">Weekend</option> */}
                                                                            </select>
                                                                        </td>
                                                                        <td>
                                                                            <input
                                                                                type="text"
                                                                                name="remarks"
                                                                                disabled={disabled}
                                                                                className="control"
                                                                                value={attendances.find(a => a.staff_id === staff.id)?.remarks || ""}
                                                                                onChange={(e) => handleAttendanceChange(staff.id, "remarks", e.target.value)}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }


                {/* ============ MONTHLY VIEW ============ */}

                {
                    can("attendance.search_by_date") && (
                        <div className="view" id="view-monthly">
                            <div className="panel">
                                <div className="panel-head">
                                    <div>
                                        <div className="eyebrow">Term overview</div>
                                        <h2 className="panel-title">Biometric attendance report</h2>
                                    </div>

                                    {
                                        can("attendance.search_by_date") && (
                                            <form className="d-flex align-items-end gap-2 flex-wrap" onSubmit={handleMonthlySubmit}>
                                                <div>
                                                    <label className="field-label">Month</label>
                                                    <select
                                                        className="control month-select"
                                                        value={month}
                                                        onChange={(e) => setMonth(Number(e.target.value))}
                                                    >
                                                        {MONTHS.map((m) => (
                                                            <option key={m.value} value={m.value}>{m.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="field-label">Year</label>
                                                    <input
                                                        type="number"
                                                        className="control"
                                                        style={{ width: 100 }}
                                                        value={year}
                                                        onChange={(e) => setYear(Number(e.target.value))}
                                                    />
                                                </div>
                                                <button type="submit" className="btn-search" disabled={monthlyLoading}>
                                                    <i className="bi bi-search" /> {monthlyLoading ? "Searching..." : "Search"}
                                                </button>
                                            </form>
                                        )
                                    }

                                </div>

                                <div className="p-3 p-md-4">
                                    <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
                                        <div>
                                            <div className="font-display fw-semibold" style={{ color: 'var(--teal-900)', fontSize: '1.05rem' }}>
                                                {MONTHS.find(m => m.value === Number(month))?.label}, {year}
                                            </div>
                                            {/* <div className="legend mt-2">
                                        <span><span className="dot" style={{ background: 'var(--sage-soft)', boxShadow: 'inset 0 0 0 1.5px var(--sage)' }} />Present</span>
                                        <span><span className="dot" style={{ background: 'var(--coral-soft)', boxShadow: 'inset 0 0 0 1.5px var(--coral)' }} />Absent</span>
                                        <span><span className="dot" style={{ background: '#fff', boxShadow: 'inset 0 0 0 1.5px var(--gold)' }} />Today</span>
                                    </div> */}
                                        </div>
                                        <button className="btn-gold"><i className="bi bi-cloud-arrow-down" /> Export</button>
                                    </div>

                                    {/* <div className="heat-scroll">
                                <table className="heat-table">
                                    <thead>
                                        <tr>
                                            <th>Staff</th>
                                            {days.map(day => (
                                                <th key={day}>
                                                    {String(day).padStart(2, "0")}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {
                                            monthlyStaffs.map((staff) => {
                                                return (
                                                    <tr>
                                                        <td className="name-col">
                                                            <div className="staff-row-name">{staff.name}</div>
                                                            <div className="staff-row-meta">sdfsd Present:  </div>
                                                            <div className="staff-row-meta">
                                                                Hours:
                                                                hr
                                                            </div>
                                                        </td>
                                                        <td className="cell">
                                                            {staff.attendances?.map((attendance, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="punch present m-1"
                                                                    data-tip="Present"
                                                                >
                                                                    {attendance.date}
                                                                    <br />
                                                                    {attendance.check_in} - {attendance.check_out} ✓
                                                                </div>
                                                            ))}
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }

                                    </tbody>
                                </table>
                            </div> */}
                                    <div className="heat-scroll">
                                        <table className="heat-table">
                                            <thead>
                                                <tr>
                                                    <th className="name-col">Staff</th>

                                                    {days.map((day) => (
                                                        <th key={day} className="day-col">
                                                            {String(day).padStart(2, "0")}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {monthlyStaffs.map((staff) => (
                                                    <tr key={staff.id}>

                                                        {/* Staff Details */}
                                                        <td className="name-col">
                                                            <div className="staff-row-name">
                                                                {staff.name}
                                                            </div>

                                                            <div className="staff-row-meta">
                                                                {staff.designation?.name} Present: {staff.attendances.length}
                                                            </div>



                                                            <div className="staff-row-meta">
                                                                Hours:{" "}
                                                                {(
                                                                    staff.attendances.reduce(
                                                                        (sum, a) => sum + (a.working_minutes || 0),
                                                                        0
                                                                    ) / 60
                                                                ).toFixed(2)}{" "}
                                                                hr
                                                            </div>
                                                        </td>

                                                        {/* Attendance Day Wise */}
                                                        {days.map((day) => {

                                                            const dayString = String(day).padStart(2, "0");

                                                            // These two lines must exist before `leave` uses fullDate
                                                            const monthString = String(month).padStart(2, "0");
                                                            const fullDate = `${year}-${monthString}-${dayString}`;

                                                            // Attendance
                                                            const attendance = staff.attendances.find(a =>
                                                                a.date.split("-")[2] === dayString
                                                            );

                                                            // Leave — check if THIS DAY falls inside the leave's date_from/date_to range
                                                            const leave = staff.leaves?.find(l =>
                                                                fullDate >= l.date_from && fullDate <= l.date_to
                                                            );

                                                            // Holiday
                                                            const holiday = holidays.find(h =>
                                                                h.date.split("-")[2] === dayString &&
                                                                h.is_holiday
                                                            );



                                                            return (
                                                                <td key={day} className="cell">

                                                                    {attendance && attendance?.check_in ? (
                                                                        <div
                                                                            className="punch present m-1"
                                                                            data-tip={`${attendance.check_in?.slice(0, 5) ?? ''} - ${attendance.check_out?.slice(0, 5) ?? ''} = ${attendance.working_minutes ?? 0} min`}
                                                                        > {attendance.check_in?.slice(0, 5) ?? ''} - {attendance.check_out?.slice(0, 5) ?? ''} <br /> = {(attendance.working_minutes / 60).toFixed(2) ?? 0} Hr
                                                                            ✓
                                                                        </div>

                                                                    ) : leave ? (

                                                                        <div className="punch holiday m-1" title={leave.leave_type?.name ?? 'Leave'} data-tip={leave.reason ?? ''}>
                                                                            {leave.leave_type?.name ?? 'Leave'}
                                                                        </div>

                                                                    ) : holiday ? (

                                                                        <div className="punch holiday m-1" title={holiday.title}>
                                                                            {holiday.title}
                                                                        </div>

                                                                    ) : (

                                                                        <div className="punch absent m-1">
                                                                            ✕
                                                                        </div>

                                                                    )}

                                                                </td>
                                                            );

                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="d-flex flex-wrap gap-3 mt-4 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
                                        <span className="summary-pill"><i className="bi bi-check-circle me-1" />
                                            {monthlyStaffs.reduce((sum, s) => sum + s.attendances.length, 0)} Present
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

            </div>
        </div>
    )
}

export default Attendance
