import { PlayerConfig, GameConfig } from '../core/config.js';

// ============================================================================
// PlayerState - Per-player state
// ============================================================================
export class PlayerState {
    /**
     * Create a new player state
     * @param {number} playerIndex - The player's index in the turn order
     * @param {number} homeTriangleIndex - The triangle index where this player starts (0-5)
     */
    constructor(playerIndex, homeTriangleIndex) {
        this.playerIndex = playerIndex;
        this.homeTriangleIndex = homeTriangleIndex;
        this.goalTriangleIndex = GameConfig.getGoalTriangleIndex(homeTriangleIndex);

        // Get display properties from config
        const config = PlayerConfig.getTriangleConfig(homeTriangleIndex);
        this.colorName = config.name;
        this.color = config.color;
        this.woodTint = config.woodTint;

        // Track piece positions (set of position keys)
        this.piecePositions = new Set();
    }

    /**
     * Get the display name for this player
     * @returns {string}
     */
    getDisplayName() {
        return this.colorName;
    }

    /**
     * Get the player's color
     * @returns {string}
     */
    getColor() {
        return this.color;
    }

    /**
     * Get the wood tint color
     * @returns {string}
     */
    getWoodTint() {
        return this.woodTint;
    }

    /**
     * Get the number of pieces this player has
     * @returns {number}
     */
    getPieceCount() {
        return this.piecePositions.size;
    }

    /**
     * Add a piece position to tracking
     * @param {string} positionKey - The position key
     */
    addPiecePosition(positionKey) {
        this.piecePositions.add(positionKey);
    }

    /**
     * Remove a piece position from tracking
     * @param {string} positionKey - The position key
     */
    removePiecePosition(positionKey) {
        this.piecePositions.delete(positionKey);
    }

    /**
     * Update piece position (for moves)
     * @param {string} fromKey - The old position key
     * @param {string} toKey - The new position key
     */
    updatePiecePosition(fromKey, toKey) {
        this.piecePositions.delete(fromKey);
        this.piecePositions.add(toKey);
    }

    /**
     * Check if this player has won
     * @param {GameState} gameState - The current game state
     * @returns {boolean}
     */
    hasWon(gameState) {
        const goalTriangle = gameState.getTrianglePositions(this.goalTriangleIndex);

        // Check if all 10 cells in the goal triangle are occupied by this player's pieces
        for (const pos of goalTriangle) {
            const cell = gameState.getBoardCell(pos);
            if (!cell || !cell.hasPiece()) {
                return false;
            }
            const piece = cell.getPiece();
            if (piece.getOwnerPlayerIndex() !== this.homeTriangleIndex) {
                return false;
            }
        }

        return true;
    }
}
