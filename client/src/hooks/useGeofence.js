'use client';

import { useCallback } from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';

export function useGeofence(missions, userLocation) {
    const checkGeofence = useCallback(() => {
        if (!userLocation || !missions || missions.length === 0) {
            return { isInZone: false, activeMission: null };
        }

        const userPoint = point([userLocation.longitude, userLocation.latitude]);

        for (const mission of missions) {
            if (!mission.active || !mission.geometry) continue;

            try {
                const isInside = booleanPointInPolygon(userPoint, mission.geometry);
                if (isInside) {
                    return { isInZone: true, activeMission: mission };
                }
            } catch (err) {
                console.error('Geofence check error:', err);
            }
        }

        return { isInZone: false, activeMission: null };
    }, [missions, userLocation]);

    return checkGeofence();
}
