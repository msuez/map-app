import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { v4 } from 'uuid';
import { Subject } from 'rxjs';

mapboxgl.accessToken = 'pk.eyJ1IjoibWF0aXN1ZXoiLCJhIjoiY2t5amVyODBnMWJucjJwbjhkbjIyZDdscSJ9.BU8dSTWm8dmEEMR_NfB_1w';

export const useMapbox = ( initPoint ) => {

    const mapDiv = useRef();
    const setRef = useCallback( (node) => {
        mapDiv.current = node;
    }, []);

    const markers = useRef({});

    // Observables of rxjs
    const markerMovement = useRef( new Subject() );
    const newMarker = useRef( new Subject() );

    const mapRef = useRef();
    const [ coords, setCoords ] = useState( initPoint );

    const addMarker = useCallback( (e, id) => {
        const { lng, lat } = e.lngLat || e;
        const marker = new mapboxgl.Marker();
        
        marker.id = id ?? v4();
        marker
            .setLngLat([ lng, lat ])
            .addTo( mapRef.current )
            .setDraggable( true );

        markers.current[ marker.id ] = marker;
        
        if( !id ) {
            newMarker.current.next({
                id: marker.id,
                lng,
                lat,
            });
        }

        // Marker movements
        marker.on('drag', (e) => {

            const { id } = e.target;
            const { lng, lat } = e.target.getLngLat();
            markerMovement.current.next({ id, lng, lat });

        });

    }, []);

    const updateMarker = useCallback( ( marker ) => {
        markers.current[ marker.id ].setLngLat([ marker.lng, marker.lat ]);
    }, []);

    useEffect( () => {
        const map = new mapboxgl.Map({
            container: mapDiv.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [ initPoint.lng, initPoint.lat ],
            zoom: initPoint.zoom,
        });
        mapRef.current = map;
    }, [ initPoint ]);

    useEffect( () => {
        mapRef.current?.on('move', () => {
            const { lng, lat } = mapRef.current.getCenter();
            setCoords({ 
                lng: lng.toFixed(4), 
                lat: lat.toFixed(4),
                zoom: mapRef.current.getZoom().toFixed(2), 
            });
        });
    }, []);

    useEffect(() => {
        mapRef.current?.on('click', addMarker );
    }, [ addMarker ]);

    return {
        addMarker,
        updateMarker,
        coords,
        markers,
        newMarker$: newMarker.current,
        markerMovement$: markerMovement.current,
        setRef
    };

}
