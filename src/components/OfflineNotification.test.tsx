import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/utils';
import OfflineNotification from './OfflineNotification';
import useOnlineStatus from '@/hooks/useOnlineStatus';

// Mock the useOnlineStatus hook
vi.mock('@/hooks/useOnlineStatus', () => ({
  default: vi.fn(),
}));

describe('OfflineNotification', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should not render anything when online and not previously offline', () => {
    // Mock the hook to return online status
    vi.mocked(useOnlineStatus).mockReturnValue({
      isOnline: true,
      wasOffline: false,
      reconnecting: false,
      checkConnection: vi.fn().mockResolvedValue(true),
    });

    render(<OfflineNotification />);
    
    // The component should not render any visible elements
    expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/back online/i)).not.toBeInTheDocument();
  });

  it('should show offline notification when offline', () => {
    // Mock the hook to return offline status
    vi.mocked(useOnlineStatus).mockReturnValue({
      isOnline: false,
      wasOffline: false,
      reconnecting: false,
      checkConnection: vi.fn().mockResolvedValue(false),
    });

    render(<OfflineNotification />);
    
    // Should show the offline message
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
    expect(screen.getByText(/retry/i)).toBeInTheDocument();
  });

  it('should show reconnected notification when back online after being offline', () => {
    // Mock the hook to return online after offline status
    vi.mocked(useOnlineStatus).mockReturnValue({
      isOnline: true,
      wasOffline: true,
      reconnecting: false,
      checkConnection: vi.fn().mockResolvedValue(true),
    });

    render(<OfflineNotification />);
    
    // Should show the back online message
    expect(screen.getByText(/you're back online/i)).toBeInTheDocument();
  });

  it('should show reconnecting message when trying to reconnect', () => {
    // Mock the hook to return reconnecting status
    vi.mocked(useOnlineStatus).mockReturnValue({
      isOnline: true,
      wasOffline: true,
      reconnecting: true,
      checkConnection: vi.fn().mockResolvedValue(true),
    });

    render(<OfflineNotification />);
    
    // Should show the reconnecting message
    expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
  });
});
