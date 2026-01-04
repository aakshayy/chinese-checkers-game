import { HexPosition, HexUtils } from '../core/hexUtils.js';
import { GameColors, PlayerConfig } from '../core/config.js';

// ============================================================================
// Renderer - Canvas rendering for the game
// ============================================================================
export class Renderer {
    /**
     * Create a new renderer
     * @param {HTMLCanvasElement} canvas - The canvas element
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hexRadius = 20; // Will be recalculated on resize
    }

    // ========================================================================
    // Canvas Management
    // ========================================================================

    /**
     * Resize the canvas to fit its container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const header = container.querySelector('.header');
        const headerHeight = header ? header.offsetHeight + 20 : 70;

        const availableWidth = container.clientWidth - 20;
        const availableHeight = container.clientHeight - headerHeight;

        const aspectRatio = 1.1;
        let width, height;

        if (availableWidth / availableHeight > 1 / aspectRatio) {
            height = availableHeight;
            width = height / aspectRatio;
        } else {
            width = availableWidth;
            height = width * aspectRatio;
        }

        this.canvas.width = width;
        this.canvas.height = height;
        this.hexRadius = Math.min(width, height) / 28;
    }

    /**
     * Get the center X coordinate
     * @returns {number}
     */
    getCenterX() {
        return this.canvas.width / 2;
    }

    /**
     * Get the center Y coordinate
     * @returns {number}
     */
    getCenterY() {
        return this.canvas.height / 2;
    }

    // ========================================================================
    // Coordinate Conversion
    // ========================================================================

    /**
     * Convert axial coordinates to pixel coordinates
     * @param {HexPosition} pos - The hex position
     * @returns {{ x: number, y: number }}
     */
    axialToPixel(pos) {
        return HexUtils.axialToPixel(pos, this.hexRadius, this.getCenterX(), this.getCenterY());
    }

    /**
     * Convert pixel coordinates to axial hex position
     * @param {number} x - Pixel X
     * @param {number} y - Pixel Y
     * @returns {HexPosition}
     */
    pixelToAxial(x, y) {
        return HexUtils.pixelToAxial(x, y, this.hexRadius, this.getCenterX(), this.getCenterY());
    }

    // ========================================================================
    // Color Helpers
    // ========================================================================

    /**
     * Lighten a color
     * @param {string} color - CSS color
     * @param {number} percent - Amount to lighten
     * @returns {string}
     */
    lightenColor(color, percent) {
        const tempCtx = document.createElement('canvas').getContext('2d');
        tempCtx.fillStyle = color;
        const rgb = tempCtx.fillStyle;
        const match = rgb.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
        if (!match) return color;
        const r = Math.min(255, parseInt(match[1], 16) + percent);
        const g = Math.min(255, parseInt(match[2], 16) + percent);
        const b = Math.min(255, parseInt(match[3], 16) + percent);
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Darken a color
     * @param {string} color - CSS color
     * @param {number} percent - Amount to darken
     * @returns {string}
     */
    darkenColor(color, percent) {
        const tempCtx = document.createElement('canvas').getContext('2d');
        tempCtx.fillStyle = color;
        const rgb = tempCtx.fillStyle;
        const match = rgb.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
        if (!match) return color;
        const r = Math.max(0, parseInt(match[1], 16) - percent);
        const g = Math.max(0, parseInt(match[2], 16) - percent);
        const b = Math.max(0, parseInt(match[3], 16) - percent);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // ========================================================================
    // Star Shape Vertices
    // ========================================================================

    /**
     * Get the vertices for the star-shaped board border
     * @returns {Array<{ x: number, y: number }>}
     */
    getStarVertices() {
        const centerX = this.getCenterX();
        const centerY = this.getCenterY();
        const vertices = [];

        const outerRadius = this.hexRadius * 15;
        const innerRadius = outerRadius / Math.sqrt(3);

        for (let i = 0; i < 12; i++) {
            const angle = -Math.PI / 2 + (i * Math.PI / 6);
            const radius = (i % 2 === 0) ? outerRadius : innerRadius;

            vertices.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }

        return vertices;
    }

    // ========================================================================
    // Main Render Method
    // ========================================================================

    /**
     * Render the game
     * @param {GameState} gameState - The game state to render
     * @param {PlayerController} playerController - The player controller (for selection state)
     */
    render(gameState, playerController) {
        const selectedPiece = playerController ? playerController.getSelectedPiece() : null;
        const validMoves = playerController ? playerController.getValidMoves() : [];

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the wooden board first
        this.drawBoard(gameState);

        // Draw holes and pieces
        gameState.forEachCell((cell, key) => {
            const { x, y } = this.axialToPixel(cell.getPosition());

            this.drawHole(x, y);

            if (cell.hasPiece()) {
                const piece = cell.getPiece();
                const drawData = piece.getDrawData();
                this.drawPiece(x, y, drawData.ownerPlayerIndex, drawData.isSelected);
            }
        });

        // Draw valid move indicators
        this.drawValidMoves(validMoves);

        // Draw current player indicator
        this.drawPlayerIndicator(gameState.getCurrentPlayer());
    }

    // ========================================================================
    // Drawing Methods
    // ========================================================================

    /**
     * Draw the board background
     * @param {GameState} gameState
     */
    drawBoard(gameState) {
        const ctx = this.ctx;
        const colors = GameColors.get();

        // Fill entire canvas with background
        ctx.fillStyle = colors.boardBackground;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw smooth star border
        const starVertices = this.getStarVertices();
        ctx.beginPath();
        ctx.moveTo(starVertices[0].x, starVertices[0].y);
        for (let i = 1; i < starVertices.length; i++) {
            ctx.lineTo(starVertices[i].x, starVertices[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = colors.boardBorderDark;
        ctx.fill();
        ctx.strokeStyle = colors.boardBorderDarker;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw wood base with triangle tints
        // First, fill the entire board area with the base color
        ctx.beginPath();
        ctx.moveTo(starVertices[0].x, starVertices[0].y);
        for (let i = 1; i < starVertices.length; i++) {
            ctx.lineTo(starVertices[i].x, starVertices[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = colors.boardWoodBase;
        ctx.fill();

        // Draw each triangle region as a single filled area (no overlapping transparency)
        for (let triangleIndex = 0; triangleIndex < 6; triangleIndex++) {
            const triangleCells = [];
            gameState.forEachCell((cell) => {
                if (cell.getHomeIndex() === triangleIndex) {
                    triangleCells.push(cell.getPosition());
                }
            });

            if (triangleCells.length > 0) {
                // Create a path that encompasses all cells in this triangle
                ctx.beginPath();
                triangleCells.forEach(pos => {
                    const { x, y } = this.axialToPixel(pos);
                    ctx.moveTo(x + this.hexRadius * 1.1, y);
                    ctx.arc(x, y, this.hexRadius * 1.1, 0, Math.PI * 2);
                });
                ctx.fillStyle = PlayerConfig.getTriangleWoodTint(triangleIndex);
                ctx.fill();
            }
        }

        // Add wood grain texture effect - clipped to star shape
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(starVertices[0].x, starVertices[0].y);
        for (let i = 1; i < starVertices.length; i++) {
            ctx.lineTo(starVertices[i].x, starVertices[i].y);
        }
        ctx.closePath();
        ctx.clip();

        ctx.strokeStyle = colors.woodGrainColor;
        ctx.lineWidth = 1;
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            const y = (i / 50) * this.canvas.height;
            ctx.moveTo(0, y + Math.sin(i * 0.5) * 10);
            ctx.bezierCurveTo(
                this.canvas.width * 0.3, y + Math.sin(i * 0.5 + 1) * 15,
                this.canvas.width * 0.6, y + Math.sin(i * 0.5 + 2) * 10,
                this.canvas.width, y + Math.sin(i * 0.5 + 3) * 12
            );
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * Draw a hole at the given position
     * @param {number} x - Pixel X
     * @param {number} y - Pixel Y
     */
    drawHole(x, y) {
        const ctx = this.ctx;
        const colors = GameColors.get();
        const holeRadius = this.hexRadius * 0.7;

        // Subtle shadow
        ctx.beginPath();
        ctx.arc(x, y + 1, holeRadius, 0, Math.PI * 2);
        ctx.fillStyle = colors.holeShadow;
        ctx.fill();

        // Main hole
        ctx.beginPath();
        ctx.arc(x, y, holeRadius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, holeRadius);
        gradient.addColorStop(0, colors.holeLight);
        gradient.addColorStop(0.6, colors.holeMid);
        gradient.addColorStop(1, colors.holeDark);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Subtle inner rim
        ctx.beginPath();
        ctx.arc(x, y, holeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = colors.holeRim;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    /**
     * Draw a piece at the given position
     * @param {number} x - Pixel X
     * @param {number} y - Pixel Y
     * @param {number} homeIndex - The player's triangle index
     * @param {boolean} isSelected - Whether the piece is selected
     */
    drawPiece(x, y, homeIndex, isSelected) {
        const ctx = this.ctx;
        const colors = GameColors.get();
        const pieceRadius = this.hexRadius * 0.55;

        // Piece shadow
        ctx.beginPath();
        ctx.arc(x + 2, y + 3, pieceRadius, 0, Math.PI * 2);
        ctx.fillStyle = colors.pieceShadow;
        ctx.fill();

        // Main piece with gradient
        ctx.beginPath();
        ctx.arc(x, y, pieceRadius, 0, Math.PI * 2);
        const baseColor = PlayerConfig.getTriangleColor(homeIndex);
        const gradient = ctx.createRadialGradient(x - pieceRadius * 0.3, y - pieceRadius * 0.3, 0, x, y, pieceRadius);
        gradient.addColorStop(0, this.lightenColor(baseColor, 60));
        gradient.addColorStop(0.5, baseColor);
        gradient.addColorStop(1, this.darkenColor(baseColor, 30));
        ctx.fillStyle = gradient;
        ctx.fill();

        // Glossy highlight
        ctx.beginPath();
        ctx.arc(x - pieceRadius * 0.25, y - pieceRadius * 0.25, pieceRadius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = colors.pieceHighlight;
        ctx.fill();

        // Selection ring
        if (isSelected) {
            ctx.beginPath();
            ctx.arc(x, y, pieceRadius + 4, 0, Math.PI * 2);
            ctx.strokeStyle = colors.selectionColor;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Glow effect
            ctx.beginPath();
            ctx.arc(x, y, pieceRadius + 6, 0, Math.PI * 2);
            ctx.strokeStyle = colors.selectionGlow;
            ctx.lineWidth = 4;
            ctx.stroke();
        }
    }

    /**
     * Draw valid move indicators
     * @param {Array} validMoves - Array of MoveInfo objects
     */
    drawValidMoves(validMoves) {
        const ctx = this.ctx;
        const colors = GameColors.get();

        validMoves.forEach(move => {
            const { x, y } = this.axialToPixel(move.targetPos);
            ctx.beginPath();
            ctx.arc(x, y, this.hexRadius * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = move.type === 'jump' ? colors.moveIndicatorJump : colors.moveIndicatorSimple;
            ctx.fill();
            ctx.strokeStyle = move.type === 'jump' ? colors.moveStrokeJump : colors.moveStrokeSimple;
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    /**
     * Draw the current player indicator
     * @param {PlayerState} currentPlayer - The current player
     */
    drawPlayerIndicator(currentPlayer) {
        if (!currentPlayer) return;

        const ctx = this.ctx;
        const colors = GameColors.get();
        const displayName = currentPlayer.getDisplayName();
        const playerColor = currentPlayer.getColor();

        const x = 130;
        const y = this.canvas.height - 30;

        // Background panel
        ctx.fillStyle = colors.panelBackground;
        ctx.beginPath();
        ctx.roundRect(x - 120, y - 18, 240, 36, 8);
        ctx.fill();

        // Marble icon
        const marbleX = x - 90;
        ctx.beginPath();
        ctx.arc(marbleX, y, 12, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(marbleX - 4, y - 4, 0, marbleX, y, 12);
        gradient.addColorStop(0, this.lightenColor(playerColor, 60));
        gradient.addColorStop(0.5, playerColor);
        gradient.addColorStop(1, this.darkenColor(playerColor, 30));
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = playerColor === '#FFFFFF' ? colors.panelBorderLight : '#000';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Text
        ctx.fillStyle = colors.panelText;
        ctx.font = 'bold 16px "Segoe UI", Tahoma, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${displayName} to Play`, marbleX + 20, y);
    }

    // ========================================================================
    // Animation Methods
    // ========================================================================

    /**
     * Animate a piece moving through a series of positions
     * @param {HexPosition[]} positions - Array of positions (including start and end)
     * @param {number} homeIndex - The player's triangle index (for piece color)
     * @param {Function} callback - Called when animation completes
     */
    animateJumpPath(positions, homeIndex, callback) {
        if (positions.length < 2) {
            if (callback) callback();
            return;
        }

        const totalSteps = positions.length - 1;
        let currentStep = 0;
        const framesPerStep = 15; // Frames per hop
        let frameInStep = 0;

        // Store reference to the game state and controller for redrawing
        const gameState = this._animationGameState;
        const controller = this._animationController;

        const animate = () => {
            if (currentStep >= totalSteps) {
                if (callback) callback();
                return;
            }

            const from = positions[currentStep];
            const to = positions[currentStep + 1];

            const fromPixel = this.axialToPixel(from);
            const toPixel = this.axialToPixel(to);

            // Easing function for smooth animation
            const progress = frameInStep / framesPerStep;
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const currentX = fromPixel.x + (toPixel.x - fromPixel.x) * eased;
            const currentY = fromPixel.y + (toPixel.y - fromPixel.y) * eased;

            // Add arc height for jump effect
            const arcHeight = this.hexRadius * 1.5;
            const arcOffset = Math.sin(progress * Math.PI) * arcHeight;

            // Redraw the board state
            if (gameState && controller) {
                this.render(gameState, controller);
            }

            // Draw the moving piece on top
            this.drawPiece(currentX, currentY - arcOffset, homeIndex, false);

            frameInStep++;
            if (frameInStep >= framesPerStep) {
                frameInStep = 0;
                currentStep++;
            }

            requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Set the animation context (called before animating)
     * @param {GameState} gameState
     * @param {PlayerController} controller
     */
    setAnimationContext(gameState, controller) {
        this._animationGameState = gameState;
        this._animationController = controller;
    }
}
