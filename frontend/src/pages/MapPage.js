import React, { useContext, useEffect } from 'react';

import { useMapbox } from '../hooks/useMapbox';
import {SocketContext} from '../contexts/SocketContext';

const initPoint = {
    lng: -122.47,
    lat: 37.80,
    zoom: 13.5,
}

export const MapPage = () => {

    const { setRef, coords, newMarker$, markerMovement$, addMarker, updateMarker } = useMapbox( initPoint );
    const { socket } = useContext( SocketContext )

    useEffect(() => {
        socket.on('active-markers', (markers) => {
            for( const key of Object.keys( markers ) ) {
                addMarker(markers[ key ], key);
            }
        });
    }, [ socket, addMarker ]);

    useEffect(() => {
        newMarker$.subscribe( marker => {
            socket.emit( 'new-marker', marker );
        });
    }, [ newMarker$, socket ]);

    useEffect(() => {
        markerMovement$.subscribe( marker => {
            socket.emit('marker-updated', marker);
        });
    }, [ socket, markerMovement$ ]);

    useEffect(() => {
        socket.on('marker-updated', (marker) => {
            updateMarker( marker );
        });
    }, [ socket, updateMarker ]);

    useEffect(() => {
        socket.on('new-marker', (marker) => {
            addMarker( marker, marker.id );
        });
    }, [ socket, addMarker ]);

    return (
    <>
        <div className="info">
            Lng: { coords.lng } | Lat: { coords.lat } | Zoom: { coords.zoom }
        </div>
        <div 
            ref={ setRef }
            className="mapContainer"
        />
    </>
    )
}
