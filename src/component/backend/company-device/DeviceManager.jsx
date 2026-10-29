import { useEffect, useState, useCallback } from "react";
import api from "../../../api/api";
// import { listDevices, checkDeviceConnection, syncDevice } from '../../../api/api';
// import api from '../../../api/api';

const statusColors = {
  online: "bg-green-100 text-green-700",
  offline: "bg-red-100 text-red-700",
  mismatch: "bg-red-100 text-red-700",
  unknown: "bg-gray-100 text-gray-600",
};

export default function DeviceManager() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null); // which device row is mid-action
  const [messages, setMessages] = useState({}); // deviceId -> last result/error text


  // const listDevices = () => api.get("/company-devices").then((r) => r.data.data);

  const listDevices = async () => {
    const result = await api.get(`/company-devices`);
    return result.data.devices;
  };

  // const checkDeviceConnection = (id) =>
  //   api.post(`/company-devices/${id}/check-connection`).then((r) => r.data);

  const checkDeviceConnection = async (id) => {
    const result = await api.post(`/company-devices/${id}/check-connection`)
    // console.log(result)
  }

  // const syncDevice = (id) =>
  //   api.post(`/company-devices/${id}/sync`).then((r) => r.data.data);

  const syncDevice = async (id) => {
    const result = await api.post(`/company-devices/${id}/sync`)
    console.log(result)
  }
 

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      setDevices(await listDevices());
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleCheckConnection = async (device) => {
    setBusyId(device.id);
    setMessages((m) => ({ ...m, [device.id]: null }));
    try {
      const result = await checkDeviceConnection(device.id);
      setMessages((m) => ({
        ...m,
        [device.id]: `Online — serial confirmed (${result.serial_no})`,
      }));
    } catch (err) {
      setMessages((m) => ({
        ...m,
        [device.id]: err.response?.data?.message ?? "Could not reach device",
      }));
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
    } catch (err) {
      setMessages((m) => ({
        ...m,
        [device.id]: err.response?.data?.message ?? "Sync failed",
      }));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading devices…</p>;

  return (
    <div className="space-y-3">
      {devices?.map((device) => (
        <div
          key={device.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
        >
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
              Serial: {device.serial_no} · {device.brand?.name} · {device.ip}:{device.port}
            </div>
            {messages[device.id] && (
              <div className="mt-1 text-xs text-gray-600">{messages[device.id]}</div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleCheckConnection(device)}
              disabled={busyId === device.id}
              className="btn-edit-sm rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {busyId === device.id ? "…" : "Test connection"}
            </button>
            <button
              onClick={() => handleSync(device)}
              disabled={busyId === device.id}
              className="btn-danger-sm rounded-md bg-blue-600 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {busyId === device.id ? "…" : "Sync now"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
