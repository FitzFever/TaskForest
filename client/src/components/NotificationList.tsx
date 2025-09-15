import React from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { cn } from '../lib/utils';
import { Notification } from '../types/Notification';
import { Trash2, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

interface NotificationListProps {
  onClose?: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const { notifications, markAsRead, deleteNotification, clearAll } = useNotificationStore();

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        暂无通知
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ScrollArea className="max-h-[400px]">
        {notifications.map((notification) => (
          <NotificationItem 
            key={notification.id} 
            notification={notification} 
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
            onClose={onClose}
          />
        ))}
      </ScrollArea>
      <div className="p-2 border-t">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs text-muted-foreground"
          onClick={() => clearAll()}
        >
          清除所有通知
        </Button>
      </div>
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  onClose?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  markAsRead, 
  deleteNotification,
  onClose
}) => {
  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // 如果通知有链接，则导航到该链接
    if (notification.link) {
      window.location.href = notification.link;
      if (onClose) onClose();
    }
  };

  return (
    <div 
      className={cn(
        "p-3 border-b hover:bg-muted/50 transition-colors",
        "flex items-start gap-2",
        notification.read ? "opacity-70" : ""
      )}
    >
      <div 
        className={cn(
          "w-2 h-2 rounded-full mt-2",
          notification.read ? "bg-muted" : "bg-primary"
        )}
      />
      
      <div className="flex-1 cursor-pointer" onClick={handleClick}>
        <div className="font-medium">{notification.title}</div>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <div className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: zhCN })}
        </div>
      </div>

      <div className="flex gap-1">
        {!notification.read && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={(e) => {
              e.stopPropagation();
              markAsRead(notification.id);
            }}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-destructive" 
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(notification.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}; 