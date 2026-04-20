import { useEffect, useMemo, useState } from 'react';
import { AlertOctagon, AlertTriangle, Bell, Check, CheckCircle2 } from 'lucide-react';
import {
    fetchNotifications,
    markAllNotificationsRead,
    markNotificationRead
} from '../../services/inventoryApi';

export default function NotificationsPanel() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        try {
            const data = await fetchNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = useMemo(
        () => notifications.filter((item) => !item.isRead).length,
        [notifications]
    );

    const handleMarkOne = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications((prev) => prev.map((item) => (
                item._id === id ? { ...item, isRead: true } : item
            )));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const handleMarkAll = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all notifications as read', error);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex h-full max-h-[640px] flex-col">
            <div className="flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-900">Inventory Alerts</h3>
                    {unreadCount > 0 ? (
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{unreadCount}</span>
                    ) : null}
                </div>
                {unreadCount > 0 ? (
                    <button
                        type="button"
                        onClick={handleMarkAll}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark all read
                    </button>
                ) : null}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {loading ? (
                    <p className="py-6 text-center text-sm text-slate-500">Loading alerts...</p>
                ) : null}

                {!loading && notifications.length === 0 ? (
                    <div className="py-8 text-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No active inventory alerts.</p>
                    </div>
                ) : null}

                {!loading && notifications.map((notification) => {
                    const cardStyle = notification.isRead
                        ? 'bg-slate-50 border-slate-200 opacity-65'
                        : notification.type === 'OutOfStock'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-amber-50 border-amber-200';

                    return (
                        <div key={notification._id} className={`rounded-lg border p-3 ${cardStyle}`}>
                            <div className="flex gap-3">
                                <div className="mt-0.5 shrink-0">
                                    {notification.type === 'OutOfStock' ? (
                                        <AlertOctagon className={`h-5 w-5 ${notification.isRead ? 'text-slate-400' : 'text-red-600'}`} />
                                    ) : (
                                        <AlertTriangle className={`h-5 w-5 ${notification.isRead ? 'text-slate-400' : 'text-amber-600'}`} />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p className={`text-sm ${notification.isRead ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                                        {notification.message}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                {!notification.isRead ? (
                                    <button
                                        type="button"
                                        onClick={() => handleMarkOne(notification._id)}
                                        className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-white hover:text-blue-700"
                                        title="Mark as read"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
