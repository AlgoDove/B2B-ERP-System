import { AlertCircle, CheckCircle } from 'lucide-react';

export default function AlertBanner({ type = 'error', message, onClose }) {
    if (!message) return null;

    const isError = type === 'error';
    const styles = isError
        ? 'border-red-200 bg-red-50 text-red-900'
        : 'border-emerald-200 bg-emerald-50 text-emerald-900';

    const Icon = isError ? AlertCircle : CheckCircle;

    return (
        <div className={`mb-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 shadow-sm ${styles}`}>
            <div className="flex items-center gap-2.5">
                <Icon className="mt-0.5 h-5 w-5" />
                <span className="text-sm font-semibold">{message}</span>
            </div>
            {onClose ? (
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md px-2 py-0.5 text-lg leading-none transition-opacity hover:opacity-70"
                    aria-label="Dismiss alert"
                >
                    x
                </button>
            ) : null}
        </div>
    );
}
