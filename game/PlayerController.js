// ============================================================================
// PlayerController - Handles input and controls player actions
// ============================================================================
export class PlayerController {
    /**
     * Create a new player controller
     * @param {GameMode} gameMode - The game mode
     * @param {Renderer} renderer - The renderer (for coordinate conversion)
     */
    constructor(gameMode, renderer) {
        this.gameMode = gameMode;
        this.renderer = renderer;

        // Input state
        this.selectedPiece = null;
        this.validMoves = [];
        this.isAnimating = false;

        // Bound click handler (for removal)
        this._boundClickHandler = this._handleClick.bind(this);
    }

    // ========================================================================
    // Input Binding
    // ========================================================================

    /**
     * Bind input events to the canvas
     * @param {HTMLCanvasElement} canvas
     */
    bindInputEvents(canvas) {
        this.canvas = canvas;
        canvas.addEventListener('click', this._boundClickHandler);
    }

    /**
     * Unbind input events from the canvas
     */
    unbindInputEvents() {
        if (this.canvas) {
            this.canvas.removeEventListener('click', this._boundClickHandler);
        }
    }

    // ========================================================================
    // Click Handling
    // ========================================================================

    /**
     * Handle canvas click events
     * @private
     */
    _handleClick(event) {
        // Ignore clicks during animation
        if (this.isAnimating) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.handleClick(x, y);
    }

    /**
     * Process a click at pixel coordinates
     * @param {number} pixelX - X coordinate
     * @param {number} pixelY - Y coordinate
     */
    handleClick(pixelX, pixelY) {
        const gameState = this.gameMode.getGameState();

        // Convert pixel to hex position
        const clickedPos = this.renderer.pixelToAxial(pixelX, pixelY);

        // If clicked off the board, do nothing
        if (!gameState.isPositionOnBoard(clickedPos)) {
            return;
        }

        const clickedPiece = gameState.getPieceAt(clickedPos);
        const currentPlayerIndex = this.gameMode.getCurrentPlayerIndex();

        if (this.selectedPiece) {
            // We have a piece selected - check for move or reselection
            const move = this.validMoves.find(m => m.targetPos.equals(clickedPos));

            if (move) {
                // Clicked on a valid move destination
                this.requestMove(move);
            } else if (clickedPiece && clickedPiece.belongsTo(currentPlayerIndex)) {
                // Clicked on another piece belonging to current player
                this.selectPiece(clickedPiece);
            } else {
                // Clicked elsewhere - deselect
                this.deselectPiece();
            }
        } else {
            // No piece selected - try to select one
            if (clickedPiece && clickedPiece.belongsTo(currentPlayerIndex)) {
                this.selectPiece(clickedPiece);
            }
        }
    }

    // ========================================================================
    // Selection
    // ========================================================================

    /**
     * Select a piece
     * @param {Piece} piece - The piece to select
     */
    selectPiece(piece) {
        // Deselect previous piece if any
        if (this.selectedPiece) {
            this.selectedPiece.deselect();
        }

        // Select new piece
        this.selectedPiece = piece;
        piece.select();

        // Calculate valid moves
        this.validMoves = this.gameMode.getValidMovesForPiece(piece);

        // Render to show selection and valid moves
        this.gameMode.render();
    }

    /**
     * Deselect the current piece
     */
    deselectPiece() {
        if (this.selectedPiece) {
            this.selectedPiece.deselect();
            this.selectedPiece = null;
        }
        this.validMoves = [];

        // Render to clear selection
        this.gameMode.render();
    }

    /**
     * Check if a piece can be selected
     * @param {Piece} piece - The piece to check
     * @returns {boolean}
     */
    canSelectPiece(piece) {
        if (!piece) return false;
        return piece.belongsTo(this.gameMode.getCurrentPlayerIndex());
    }

    // ========================================================================
    // Move Execution
    // ========================================================================

    /**
     * Request a move to be executed
     * @param {Object} move - The MoveInfo object
     */
    requestMove(move) {
        const fromPos = this.selectedPiece.getPosition();
        const toPos = move.targetPos;
        const piece = this.selectedPiece;

        // Clear selection immediately
        this.selectedPiece.deselect();
        this.selectedPiece = null;
        this.validMoves = [];

        if (move.type === 'jump' && move.jumpPath && move.jumpPath.length > 0) {
            // Animated jump move
            this.executeJumpMove(fromPos, toPos, piece, move.jumpPath);
        } else {
            // Simple move - no animation
            this.executeSimpleMove(fromPos, toPos);
        }
    }

    /**
     * Execute a simple (non-jump) move
     * @private
     */
    executeSimpleMove(fromPos, toPos) {
        this.gameMode.executeMove(fromPos, toPos);
        this.onMoveComplete();
    }

    /**
     * Execute a jump move with animation
     * @private
     */
    executeJumpMove(fromPos, toPos, piece, jumpPath) {
        this.isAnimating = true;

        // Build full path including start position
        const fullPath = [fromPos, ...jumpPath];

        // Temporarily remove the piece from its starting position
        const gameState = this.gameMode.getGameState();
        gameState.removePieceAt(fromPos);

        // Animate the jump path
        this.renderer.animateJumpPath(
            fullPath,
            piece.getOwnerPlayerIndex(),
            () => {
                // Animation complete - place piece at destination
                gameState.placePiece(toPos, piece);

                // Update player's piece positions
                const player = gameState.players.find(
                    p => p.homeTriangleIndex === piece.getOwnerPlayerIndex()
                );
                if (player) {
                    player.updatePiecePosition(fromPos.key, toPos.key);
                }

                this.isAnimating = false;
                this.onMoveComplete();
            }
        );
    }

    /**
     * Called when a move is complete
     */
    onMoveComplete() {
        // Advance turn
        this.gameMode.advanceTurn();

        // Render new state
        this.gameMode.render();

        // Check win condition
        const result = this.gameMode.checkWinCondition();
        if (result.winner) {
            this.gameMode.endMatch(result.playerState);
        }
    }

    // ========================================================================
    // State Queries
    // ========================================================================

    /**
     * Check if it's the current player's turn
     * @returns {boolean}
     */
    isMyTurn() {
        return true; // In single-device play, it's always the current player's turn
    }

    /**
     * Get the currently selected piece
     * @returns {Piece|null}
     */
    getSelectedPiece() {
        return this.selectedPiece;
    }

    /**
     * Get the valid moves for the selected piece
     * @returns {Array}
     */
    getValidMoves() {
        return this.validMoves;
    }

    /**
     * Check if the controller is animating
     * @returns {boolean}
     */
    getIsAnimating() {
        return this.isAnimating;
    }

    // ========================================================================
    // Reset
    // ========================================================================

    /**
     * Reset the controller state
     */
    reset() {
        if (this.selectedPiece) {
            this.selectedPiece.deselect();
        }
        this.selectedPiece = null;
        this.validMoves = [];
        this.isAnimating = false;
    }
}
