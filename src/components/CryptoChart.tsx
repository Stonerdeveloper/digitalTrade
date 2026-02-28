import { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';

export const CryptoChart = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: 'rgba(255,255,255,0.05)' },
                horzLines: { color: 'rgba(255,255,255,0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
        });

        // Correct way to add Area Series in newer versions
        const newSeries = chart.addSeries(AreaSeries, {
            lineColor: '#3b82f6',
            topColor: 'rgba(59, 130, 246, 0.4)',
            bottomColor: 'rgba(59, 130, 246, 0.0)',
            lineWidth: 2,
        });

        const data = [
            { time: '2023-12-22', value: 32800 },
            { time: '2023-12-23', value: 33200 },
            { time: '2023-12-24', value: 33100 },
            { time: '2023-12-25', value: 33800 },
            { time: '2023-12-26', value: 34200 },
            { time: '2023-12-27', value: 33900 },
            { time: '2023-12-28', value: 34500 },
        ];

        newSeries.setData(data as any);

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    return <div ref={chartContainerRef} style={{ width: '100%' }} />;
};
