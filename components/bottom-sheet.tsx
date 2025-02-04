import React, { useCallback, useMemo, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import MapView, { Marker } from 'react-native-maps';

interface CBottomSheetProps {
    onLocationSelect?: (location: { latitude: number; longitude: number }) => void;
}

interface CBottomSheetRef {
    open: () => void;
    close: () => void;
}

const CBottomSheet = forwardRef<CBottomSheetRef, CBottomSheetProps>(({ onLocationSelect }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);
    const [selectedLocation, setSelectedLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const [region, setRegion] = useState({
        latitude: 41.0082,
        longitude: 28.9784,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
    });
    // Dışarıdan erişilebilir metodlar
    useImperativeHandle(ref, () => ({
        open: () => bottomSheetRef.current?.expand(),
        close: () => bottomSheetRef.current?.close()
    }));

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const handleMapPress = (e:any) => {
        const newLocation = {
            latitude: e.nativeEvent.coordinate.latitude,
            longitude: e.nativeEvent.coordinate.longitude,
        };

        setSelectedLocation(newLocation);
        setRegion(prev => ({
            ...prev,
            ...newLocation
        }));
        onLocationSelect?.(newLocation);
    };

    return (
        <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            enablePanDownToClose={true}
            index={-1}
        >
            <BottomSheetView style={styles.contentContainer}>
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={region}
                        onPress={handleMapPress}
                    >
                        {selectedLocation && (
                            <Marker
                                coordinate={selectedLocation}
                                draggable
                                onDragEnd={(e) => {
                                    const newLocation = {
                                        latitude: e.nativeEvent.coordinate.latitude,
                                        longitude: e.nativeEvent.coordinate.longitude,
                                    };
                                    setSelectedLocation(newLocation);
                                    if (onLocationSelect) {
                                        onLocationSelect(newLocation);
                                    }
                                }}
                            />
                        )}
                    </MapView>
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
});
const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
    },
    mapContainer: {
        flex: 1,
        height: 400,
    },
    map: {
        width: '100%',
        height: '100%',
    }
});

export default CBottomSheet;