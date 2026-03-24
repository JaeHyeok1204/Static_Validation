/**
 * Converts HH:MM:SS string or legacy decimal hour string (e.g. "1.5h") to total seconds.
 */
export function hmsToSeconds(hms: string): number {
    if (!hms || hms === "-" || hms === "0h") return 0;
    
    // Support legacy decimal format "1.5h"
    if (typeof hms === 'string' && hms.endsWith('h')) {
        return Math.round(parseFloat(hms) * 3600);
    }
    
    // Handle "HH:MM:SS" or "MM:SS"
    const parts = hms.split(':').map(Number);
    if (parts.length === 3) {
        return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    } else if (parts.length === 2) {
        return (parts[0] || 0) * 60 + (parts[1] || 0);
    } else if (parts.length === 1) {
        return (parts[0] || 0);
    }
    
    return 0;
}

/**
 * Converts total seconds to HH:MM:SS string.
 */
export function secondsToHms(seconds: number, showSign: boolean = false): string {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(Math.round(seconds));
    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = Math.floor(absSeconds % 60);
    
    const hStr = h.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');
    
    const formatted = `${hStr}:${mStr}:${sStr}`;
    
    if (showSign) {
        if (seconds === 0) return "00:00:00";
        return (isNegative ? "-" : "+") + formatted;
    }
    
    return formatted;
}

/**
 * Validates and formats a partial HH:MM:SS input.
 */
export function formatTimeInput(input: string): string {
    // Remove non-digit characters
    const clean = input.replace(/\D/g, '');
    if (!clean) return "00:00:00";
    
    // Pad with leading zeros up to 6 digits
    const padded = clean.padStart(6, '0').slice(-6);
    const h = padded.slice(0, 2);
    const m = padded.slice(2, 4);
    const s = padded.slice(4, 6);
    
    return `${h}:${m}:${s}`;
}
