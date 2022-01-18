
import { SocketProvider } from './contexts/SocketContext';
import { MapPage } from './pages/MapPage';

export const MapApp = () => {
    return (
      <SocketProvider>
        <MapPage />
      </SocketProvider>
    )
}