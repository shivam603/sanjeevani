import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function OfflineBanner({ isOnline, pendingCount, onSync, isSyncing }) {
  const { t } = useTranslation();

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div
      className="offline-strip"
      style={{
        background: isOnline
          ? 'linear-gradient(90deg, #059669, #047857)'
          : 'linear-gradient(90deg, #d97706, #b45309)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isOnline ? (
          <Wifi size={15} strokeWidth={2.2} style={{ color: '#ffffff' }} />
        ) : (
          <WifiOff size={15} strokeWidth={2.2} style={{ color: '#ffffff' }} />
        )}
        <span>
          {!isOnline
            ? t('offline_status')
            : t('pending_syncs', { count: pendingCount })}
        </span>
      </div>

      {pendingCount > 0 && isOnline && (
        <button
          type="button"
          className="offline-sync-btn"
          onClick={onSync}
          disabled={isSyncing}
        >
          {isSyncing ? 'Syncing...' : t('sync_now')}
        </button>
      )}
    </div>
  );
}
