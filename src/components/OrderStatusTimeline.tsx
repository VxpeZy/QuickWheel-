// src/components/OrderStatusTimeline.tsx
import { StatusUpdate, getStatusText } from '@/hooks/useOrderTracking';

interface OrderStatusTimelineProps {
  statusHistory: StatusUpdate[];
}

export const OrderStatusTimeline = ({ statusHistory }: OrderStatusTimelineProps) => {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No status updates available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Order Status Timeline</h3>
      <div className="space-y-0">
        {statusHistory.map((update, index) => (
          <div key={index} className="relative pl-6 pb-4">
            {/* Vertical line */}
            {index < statusHistory.length - 1 && (
              <div className="absolute left-[9px] top-2 bottom-0 w-0.5 bg-blue-200"></div>
            )}
            
            {/* Status dot */}
            <div className="absolute left-0 top-1 w-[18px] h-[18px] rounded-full bg-blue-500 border-2 border-white shadow"></div>
            
            <div className="ml-2">
              <p className="font-medium text-gray-900">{getStatusText(update.status)}</p>
              <p className="text-sm text-gray-500">
                {new Date(update.timestamp).toLocaleString('th-TH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

