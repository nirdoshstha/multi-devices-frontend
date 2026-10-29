import React from 'react'
import { Route, Routes } from 'react-router'
import Login from './component/frontend/auth/Login'
import Profile from './component/frontend/Profile'
import PrivateRoutes from './component/PrivateRoutes'
import MasterLayout from './layout/backend/MasterLayout'
import Dashboard from './component/backend/Dashboard'
import Setting from './component/backend/setting/Setting'
import About from './component/backend/about/About'
import User from './component/backend/user/User'
import Role from './component/backend/role/Role'
import ShowRole from './component/backend/role/ShowRole'
import EditRole from './component/backend/role/EditRole'
import UserEdit from './component/backend/user/UserEdit'
import Permission from './component/backend/permission/Permission'
import Error403 from './component/errors/Error403'
import Gender from './component/backend/gender/Gender'
import Designation from './component/backend/designation/Designation'
import Vendor from './component/backend/vendor/Vendor'
import Trashed from './component/backend/vendor/Trashed'
import VendorEdit from './component/backend/vendor/VendorEdit'
import Company from './component/backend/company/Company'
import CompanyEdit from './component/backend/company/CompanyEdit'
import CompanyTrashed from './component/backend/company/CompanyTrashed'
import Brand from './component/backend/brand/Brand'
import BrandEdit from './component/backend/brand/BrandEdit'
import Device from './component/backend/device/Device'
import DeviceEdit from './component/backend/device/DeviceEdit'
import CompanyDevice from './component/backend/company-device/CompanyDevice'
import CompanyDeviceShow from './component/backend/company-device/CompanyDeviceShow'
import CompanyDeviceTrashed from './component/backend/company-device/CompanyDeviceTrashed'
import Staff from './component/backend/staff/Staff'
import StaffTrashed from './component/backend/staff/StaffTrashed'
import StaffShow from './component/backend/staff/StaffShow'
import Attendance from './component/backend/attendance/Attendance'
import AttendanceShow from './component/backend/attendance/AttendanceShow'
import StaffEdit from './component/backend/staff/StaffEdit'
import AttendanceLog from './component/backend/attendance/AttendanceLog'
import Menu from './component/backend/menus/Menu'
import MenuEdit from './component/backend/menus/MenuEdit'
import LeaveType from './component/backend/leavetype/LeaveType'
import LeaveTypeEdit from './component/backend/leavetype/LeaveTypeEdit'
import LeaveApplication from './component/backend/leave-application/LeaveApplication'
import DeviceManager from './component/backend/company-device/DeviceManager'
import PermissionRoute from './component/PermissionRoute'
import StaffDeviceLInk from './component/backend/staff-device-link/StaffDeviceLInk'
import LeaveIsApproved from './component/backend/leave-application/LeaveIsApproved'
import Branch from './component/backend/branch/Branch'
import BranchTrashed from './component/backend/branch/BranchTrashed'
import BranchEdit from './component/backend/branch/BranchEdit'
import LeaveApplicationShow from './component/backend/leave-application/LeaveApplicationShow'
import LeaveApplicationEdit from './component/backend/leave-application/LeaveApplicationEdit'

const App = () => {
  return (
    <div>


      <Routes>
        {/* <Route path="/register" element={<Register />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        <Route element={<PrivateRoutes />}>
          <Route path="/admin" element={<MasterLayout />}>

            <Route path="dashboard" element={<Dashboard />} />
            <Route path='error-403' element={<Error403 />} />

            {/* Menus */}
            <Route element={<PermissionRoute permission="menus.store" />}>
              <Route path='menu' element={<Menu />} />
              <Route path='menu/edit/:id' element={<MenuEdit />} />
            </Route>

            <Route element={<PermissionRoute permission="settings.index" />}>
              <Route path="setting" element={<Setting />} />
            </Route>

            <Route element={<PermissionRoute permission="about.index" />}>
              <Route path="about" element={<About />} />
            </Route>

            <Route element={<PermissionRoute permission="users.index" />}>
              <Route path="user" element={<User />} />
            </Route>
            <Route element={<PermissionRoute permission="users.show" />}>
              <Route path="user/:id/edit" element={<UserEdit />} />
            </Route>

            {/* Leave Management */}
            <Route element={<PermissionRoute permission="leave-types.index" />}>
              <Route path="leave-type" element={<LeaveType />} />
              <Route path="leave-type/edit/:id" element={<LeaveTypeEdit />} />
            </Route>
            <Route element={<PermissionRoute permission="leave-applications.index" />}>
              <Route path="leave-application" element={<LeaveApplication />} />
              <Route path="leave-application/:id" element={<LeaveApplicationShow />} />
              <Route path="leave-application/edit/:id" element={<LeaveApplicationEdit />} />
              <Route path="is-leave-approved/:id" element={<LeaveIsApproved />} />
            </Route>

            {/* Role & Permission */}
            <Route element={<PermissionRoute permission="roles.index" />}>
              <Route path="role" element={<Role />} />
              <Route path="role/:id" element={<ShowRole />} />
              <Route path="role/edit/:id" element={<EditRole />} />
              <Route path="permission" element={<Permission />} />
            </Route>

            <Route element={<PermissionRoute permission="genders.index" />}>
              <Route path='gender' element={<Gender />} />
            </Route>
            <Route element={<PermissionRoute permission="designations.index" />}>
              <Route path='designation' element={<Designation />} />
            </Route>

            {/* Vendor */}
            <Route element={<PermissionRoute permission="vendors.index" />}>
              <Route path='vendor' element={<Vendor />} />
              <Route path='vendor/trashed' element={<Trashed />} />
              <Route path='vendor/edit/:id' element={<VendorEdit />} />
            </Route>

            {/* Companies */}
            <Route element={<PermissionRoute permission="companys.index" />}>
              <Route path='company' element={<Company />} />
              <Route path='company/trashed' element={<CompanyTrashed />} />
              <Route path='company/edit/:id' element={<CompanyEdit />} />
            </Route>

            {/* Branches */}
            <Route element={<PermissionRoute permission="branches.index" />}>
              <Route path='branch' element={<Branch />} />
              <Route path='branch/trashed' element={<BranchTrashed />} />
              <Route path='branch/edit/:id' element={<BranchEdit />} />
            </Route>

            {/* Company Devices */}
            <Route element={<PermissionRoute permission="company-devices.index" />}>
              <Route path='device-manager' element={<DeviceManager />} />
              <Route path='company-device' element={<CompanyDevice />} />
              <Route path='company-device/:id' element={<CompanyDeviceShow />} />
              <Route path='company-device/trashed' element={<CompanyDeviceTrashed />} />
            </Route>

            <Route element={<PermissionRoute permission="device-brand.index" />}>
              <Route path='device-brand' element={<Brand />} />
              <Route path='device-brand/edit/:id' element={<BrandEdit />} />
            </Route>

            {/* permission check, one per resource */}
            <Route element={<PermissionRoute permission="staffs.index" />}>
              <Route path='staff' element={<Staff />} />
              <Route path='staff/:id' element={<StaffShow />} />
              <Route path='staff/edit/:id' element={<StaffEdit />} />
              <Route path='staff/trashed' element={<StaffTrashed />} />
            </Route>

            <Route element={<PermissionRoute permission="staff-device-links.store" />}>
              <Route path='staff-device-link' element={<StaffDeviceLInk />} />
            </Route>

            {/* Devices */}
            <Route element={<PermissionRoute permission="devices.index" />}>
              <Route path='device' element={<Device />} />
              <Route path='device/edit/:id' element={<DeviceEdit />} />
            </Route>

            {/* Staff Attendance */}
            <Route element={<PermissionRoute permission="attendances.index" />}>
              <Route path='attendance' element={<Attendance />} />
              <Route path='attendance/show/:id' element={<AttendanceShow />} />
            </Route>
            <Route element={<PermissionRoute permission="attendance-logs.index" />}>
              <Route path='attendance-logs' element={<AttendanceLog />} />
            </Route>





          </Route>
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </div>

  )
}

export default App