// ============================================================================
// Match Phase Enum
// ============================================================================
export const MatchPhase = Object.freeze({
    WaitingToStart: 'WaitingToStart',
    InProgress: 'InProgress',
    GameOver: 'GameOver'
});

// ============================================================================
// Move Info Structure
// ============================================================================
// MoveInfo is a plain object with the following shape:
// {
//     targetPos: HexPosition,  // Destination position
//     type: 'move' | 'jump',   // Type of move
//     jumpPath: HexPosition[]  // For jumps, the intermediate positions
// }

/**
 * Creates a simple move (adjacent cell)
 * @param {HexPosition} targetPos - The destination position
 * @returns {Object} MoveInfo object
 */
export function createSimpleMove(targetPos) {
    return {
        targetPos,
        type: 'move',
        jumpPath: []
    };
}

/**
 * Creates a jump move
 * @param {HexPosition} targetPos - The destination position
 * @param {HexPosition[]} jumpPath - The path of positions jumped through
 * @returns {Object} MoveInfo object
 */
export function createJumpMove(targetPos, jumpPath) {
    return {
        targetPos,
        type: 'jump',
        jumpPath
    };
}

// ============================================================================
// Event Emitter for State Changes
// ============================================================================
export class EventEmitter {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    unsubscribe(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    /**
     * Emit an event with data
     * @param {string} event - Event name
     * @param {*} data - Data to pass to listeners
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
}
