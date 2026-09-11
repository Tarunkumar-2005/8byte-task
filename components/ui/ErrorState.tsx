import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from './Card';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Failed to load portfolio market data.',
  onRetry,
  isRetrying = false,
}) => {
  return (
    <Card className="border-rose-900/50 bg-rose-950/20 p-8 text-center my-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/60 mb-4">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-rose-200 mb-2">Market Data Service Warning</h3>
      <p className="text-sm text-gray-300 max-w-md mx-auto mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Retry Fetch'}
        </button>
      )}
    </Card>
  );
};
