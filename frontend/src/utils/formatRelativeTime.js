/**
 * Formats an ISO timestamp into a human-readable relative time string.
 * Examples: "just now", "5m ago", "2h ago", "3d ago", "1w ago", "2mo ago"
 * 
 * @param {string|Date} timestamp - ISO string or Date object
 * @returns {string} Relative time string
 */
export function formatRelativeTime(timestamp) {
    if (!timestamp) return '';

    try {
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

        if (isNaN(date.getTime())) {
            return '';
        }

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();

        // Handle future dates
        if (diffMs < 0) {
            return 'just now';
        }

        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);

        if (diffSeconds < 60) {
            return 'just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
        } else if (diffWeeks < 4) {
            return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
        } else {
            return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
        }
    } catch (error) {
        console.warn('formatRelativeTime: Invalid timestamp', timestamp);
        return '';
    }
}

export default formatRelativeTime;
