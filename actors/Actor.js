import { HexPosition } from '../core/hexUtils.js';

// ============================================================================
// Actor - Base class for game world objects
// ============================================================================
export class Actor {
    /**
     * Create a new Actor
     * @param {HexPosition} position - The hex position of this actor
     */
    constructor(position) {
        this.position = position;
        this.isVisible = true;
    }

    /**
     * Get the actor's position
     * @returns {HexPosition}
     */
    getPosition() {
        return this.position;
    }

    /**
     * Set the actor's position
     * @param {HexPosition} pos - New position
     */
    setPosition(pos) {
        this.position = pos;
    }

    /**
     * Get the position key for map lookups
     * @returns {string}
     */
    getPositionKey() {
        return this.position.key;
    }

    /**
     * Get data needed for rendering this actor
     * Override in subclasses to provide specific draw data
     * @returns {Object}
     */
    getDrawData() {
        return {
            position: this.position,
            isVisible: this.isVisible
        };
    }
}
