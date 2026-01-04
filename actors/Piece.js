import { Actor } from './Actor.js';
import { PlayerConfig } from '../core/config.js';

// ============================================================================
// Piece - Represents a game piece (marble)
// ============================================================================
export class Piece extends Actor {
    /**
     * Create a new piece
     * @param {HexPosition} position - The hex position of this piece
     * @param {number} ownerPlayerIndex - The index of the owning player (0-5)
     */
    constructor(position, ownerPlayerIndex) {
        super(position);
        this.ownerPlayerIndex = ownerPlayerIndex;
        this.isSelected = false;
    }

    /**
     * Get the owner's player index
     * @returns {number}
     */
    getOwnerPlayerIndex() {
        return this.ownerPlayerIndex;
    }

    /**
     * Get the color for this piece
     * @returns {string}
     */
    getColor() {
        return PlayerConfig.getTriangleColor(this.ownerPlayerIndex);
    }

    /**
     * Get the color name for this piece
     * @returns {string}
     */
    getColorName() {
        return PlayerConfig.getTriangleColorName(this.ownerPlayerIndex);
    }

    /**
     * Select this piece
     */
    select() {
        this.isSelected = true;
    }

    /**
     * Deselect this piece
     */
    deselect() {
        this.isSelected = false;
    }

    /**
     * Check if this piece belongs to a specific player
     * @param {number} playerIndex - The player index to check
     * @returns {boolean}
     */
    belongsTo(playerIndex) {
        return this.ownerPlayerIndex === playerIndex;
    }

    /**
     * Get data needed for rendering this piece
     * @returns {Object}
     */
    getDrawData() {
        return {
            ...super.getDrawData(),
            ownerPlayerIndex: this.ownerPlayerIndex,
            color: this.getColor(),
            colorName: this.getColorName(),
            isSelected: this.isSelected
        };
    }
}
