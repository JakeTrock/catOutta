import { useEffect, useRef, useCallback, useState, useMemo } from 'react';

import { BrowserMultiFormatReader, DecodeContinuouslyCallback, DecodeHintType, NotFoundException } from '@zxing/library';

import deepEqual from '../utilities/deepEqual';
import { OnResultFunction, OnErrorFunction } from '../types';

export interface IUseQrScannerProps {
    onResult: OnResultFunction;
    onError: OnErrorFunction;
    scanDelay: number;
    constraints: MediaTrackConstraints;
    deviceId?: string;
    useScreenCapture?: boolean;
    hints?: Map<DecodeHintType, any>;
    stopDecoding?: boolean;
}

export const useQrScanner = (props: IUseQrScannerProps) => {
    const { onResult, onError, scanDelay, hints, useScreenCapture, deviceId, stopDecoding } = props;

    const isMounted = useRef(false);
    const onResultRef = useRef(onResult);
    const onErrorRef = useRef(onError);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [constraints, setConstraints] = useState(props.constraints);

    const reader = useMemo(() => new BrowserMultiFormatReader(hints, scanDelay), []);

    const onDecode = useCallback<DecodeContinuouslyCallback>((result, error) => {
        if (result) onResultRef.current(result);

        if (error) {
            if (error instanceof NotFoundException) {
                return;
            }

            if (error instanceof DOMException && error.name === 'IndexSizeError') {
                return;
            }

            onErrorRef.current(error);
        }
    }, []);

    const readerReset = useCallback(() => {
        reader.reset();
    }, [reader]);

    const readerStop = useCallback(() => {
        reader.stopAsyncDecode();
    }, [reader]);

    const readerStart = useCallback(async () => {
        if (!videoRef.current) return;

        try {
            if (deviceId) {
                await reader.decodeFromVideoDevice(deviceId, videoRef.current, onDecode);
            } else {
                let newConstraints: MediaStreamConstraints = {
                    audio: false,
                    video: constraints
                };

                // qr decoded here
                const stream = useScreenCapture?
                    await navigator.mediaDevices.getDisplayMedia({video: true}):
                    await navigator.mediaDevices.getUserMedia(newConstraints);

                
                await reader.decodeFromStream(stream, videoRef.current, onDecode);
            }
        } catch (error) {
            onErrorRef.current(error as Error);
        }
    }, [reader, deviceId, constraints, onDecode]);

    useEffect(() => {
        isMounted.current = true;

        if (stopDecoding) {
            readerStop();
            return;
        }

        (async () => {
            await readerStart();

            if (!isMounted.current) {
                readerReset();
            }
        })();

        return () => {
            isMounted.current = false;
            readerReset();
        };
    }, [readerStart, readerReset, stopDecoding]);

    useEffect(() => {
        const isEqual = deepEqual(props.constraints, constraints);

        if (!isEqual) {
            setConstraints(props.constraints);
        }
    }, [props.constraints]);

    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    return { ref: videoRef, start: readerStart, stop: stopDecoding };
};
