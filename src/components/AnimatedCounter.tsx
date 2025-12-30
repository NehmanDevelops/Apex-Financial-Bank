"use client";

import { useEffect, useState } from "react";

interface AnimatedCounterProps {
    value: number;
    prefix?: string;
    suffix?: string;
    duration?: number;
    decimals?: number;
}

export function AnimatedCounter({
    value,
    prefix = "",
    suffix = "",
    duration = 1500,
    decimals = 2
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Ease out cubic for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(value * easeOut);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    const formattedValue = displayValue.toLocaleString("en-CA", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return (
        <span>
            {prefix}{formattedValue}{suffix}
        </span>
    );
}
