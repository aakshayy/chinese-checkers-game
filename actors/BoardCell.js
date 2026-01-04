import { Actor } from './Actor.js';
import { PlayerConfig } from '../core/config.js';

// ============================================================================
// BoardCell - Represents a board position (hole)
// ============================================================================
export class BoardCell extends Actor {
    /**
     * Create a new board cell
     * @param {HexPosition} position - The hex position of this cell
     * @param {number} homeIndex - Triangle index (-1 for center, 0-5 for triangles)
     */
    constructor(position, homeIndex = -1) {
        super(position);
        this.homeIndex = homeIndex;
        this.piece = null;
    }

    /**
     * Get the home triangle index
     * @returns {number} -1 for center, 0-5 for triangle positions
     */
    getHomeIndex() {
        return this.homeIndex;
    }

    /**
     * Check if this cell is part of a home triangle
     * @returns {boolean}
     */
    isHomeCell() {
        return this.homeIndex !== -1;
    }

    /**
     * Check if this cell has a piece on it
     * @returns {boolean}
     */
    hasPiece() {
        return this.piece !== null;
    }

    /**
     * Get the piece on this cell
     * @returns {Piece|null}
     */
    getPiece() {
        return this.piece;
    }

    /**
     * Place a piece on this cell
     * @param {Piece} piece - The piece to place
     */
    setPiece(piece) {
        this.piece = piece;
        if (piece) {
            piece.setPosition(this.position);
        }
    }

    /**
     * Remove and return the piece from this cell
     * @returns {Piece|null}
     */
    removePiece() {
        const piece = this.piece;
        this.piece = null;
        return piece;
    }

    /**
     * Get the wood tint color for this cell (if it's a home cell)
     * @returns {string|null}
     */
    getWoodTint() {
        if (this.homeIndex === -1) {
            return null;
        }
        return PlayerConfig.getTriangleWoodTint(this.homeIndex);
    }

    /**
     * Get data needed for rendering this cell
     * @returns {Object}
     */
    getDrawData() {
        return {
            ...super.getDrawData(),
            homeIndex: this.homeIndex,
            woodTint: this.getWoodTint(),
            hasPiece: this.hasPiece()
        };
    }
}
