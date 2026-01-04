import { HexPosition } from './hexUtils.js';

// ============================================================================
// Triangle Generator
// ============================================================================
export const TriangleGenerator = {
    // Base triangle shape (10 cells in 1-2-3-4 formation)
    // Defined relative to the 12 o'clock position
    baseTriangle: [
        new HexPosition(4, -8),                                              // Row 1: tip (1 cell)
        new HexPosition(3, -7), new HexPosition(4, -7),                      // Row 2: 2 cells
        new HexPosition(2, -6), new HexPosition(3, -6), new HexPosition(4, -6),  // Row 3: 3 cells
        new HexPosition(1, -5), new HexPosition(2, -5), new HexPosition(3, -5), new HexPosition(4, -5)  // Row 4: base (4 cells)
    ],

    // Generate a triangle rotated by N * 60° clockwise from the base
    generateTriangle(rotationCount) {
        // rotateN rotates CCW, so we use (6 - n) % 6 to rotate CW instead
        const ccwRotation = (6 - rotationCount) % 6;
        return this.baseTriangle.map(pos => pos.rotateN(ccwRotation));
    },

    // Generate all 6 triangles in clockwise order from 12 o'clock
    // Index 0: 12 o'clock, 1: 2 o'clock, 2: 4 o'clock, 3: 6 o'clock, 4: 8 o'clock, 5: 10 o'clock
    generateAllTriangles() {
        return [0, 1, 2, 3, 4, 5].map(rot => this.generateTriangle(rot));
    }
};

// ============================================================================
// Player Configuration
// ============================================================================
export const PlayerConfig = {
    // Triangle configurations in clockwise order from 12 o'clock
    // Each entry: { name, colorVar, woodTintVar }
    // To rearrange colors, simply reorder this array
    triangles: [
        { name: 'Red',    colorVar: '--color-red',    woodTintVar: '--wood-tint-red' },    // 0: 12 o'clock
        { name: 'Cream',  colorVar: '--color-white',  woodTintVar: '--wood-tint-white' },  // 1: 2 o'clock
        { name: 'Green',  colorVar: '--color-green',  woodTintVar: '--wood-tint-green' },  // 2: 4 o'clock
        { name: 'Blue',   colorVar: '--color-blue',   woodTintVar: '--wood-tint-blue' },   // 3: 6 o'clock
        { name: 'Yellow', colorVar: '--color-yellow', woodTintVar: '--wood-tint-yellow' }, // 4: 8 o'clock
        { name: 'Orange', colorVar: '--color-black',  woodTintVar: '--wood-tint-black' }   // 5: 10 o'clock
    ],

    // Cached resolved colors
    _resolved: null,

    // Resolve CSS variables to actual color values
    _resolveColors() {
        if (this._resolved) return;
        const style = getComputedStyle(document.documentElement);
        this._resolved = this.triangles.map(t => ({
            name: t.name,
            color: style.getPropertyValue(t.colorVar).trim(),
            woodTint: style.getPropertyValue(t.woodTintVar).trim()
        }));
    },

    getTriangleColor(homeIndex) {
        this._resolveColors();
        return this._resolved[homeIndex].color;
    },

    getTriangleWoodTint(homeIndex) {
        this._resolveColors();
        return this._resolved[homeIndex].woodTint;
    },

    getTriangleColorName(homeIndex) {
        return this.triangles[homeIndex].name;
    },

    // Get full config for a triangle
    getTriangleConfig(homeIndex) {
        this._resolveColors();
        return this._resolved[homeIndex];
    }
};

// ============================================================================
// Game Colors - loaded from CSS variables
// ============================================================================
export const GameColors = {
    cached: null,

    get() {
        if (this.cached) return this.cached;

        const style = getComputedStyle(document.documentElement);
        this.cached = {
            boardWoodBase: style.getPropertyValue('--board-wood-base').trim(),
            boardBorderDark: style.getPropertyValue('--board-border-dark').trim(),
            boardBorderDarker: style.getPropertyValue('--board-border-darker').trim(),
            boardBackground: style.getPropertyValue('--board-background').trim(),
            woodGrainColor: style.getPropertyValue('--wood-grain-color').trim(),
            holeShadow: style.getPropertyValue('--hole-shadow').trim(),
            holeLight: style.getPropertyValue('--hole-light').trim(),
            holeMid: style.getPropertyValue('--hole-mid').trim(),
            holeDark: style.getPropertyValue('--hole-dark').trim(),
            holeRim: style.getPropertyValue('--hole-rim').trim(),
            pieceShadow: style.getPropertyValue('--piece-shadow').trim(),
            pieceHighlight: style.getPropertyValue('--piece-highlight').trim(),
            selectionColor: style.getPropertyValue('--selection-color').trim(),
            selectionGlow: style.getPropertyValue('--selection-glow').trim(),
            moveIndicatorSimple: style.getPropertyValue('--move-indicator-simple').trim(),
            moveIndicatorJump: style.getPropertyValue('--move-indicator-jump').trim(),
            moveStrokeSimple: style.getPropertyValue('--move-stroke-simple').trim(),
            moveStrokeJump: style.getPropertyValue('--move-stroke-jump').trim(),
            panelBackground: style.getPropertyValue('--panel-background').trim(),
            panelText: style.getPropertyValue('--panel-text').trim(),
            panelBorderLight: style.getPropertyValue('--panel-border-light').trim()
        };
        return this.cached;
    }
};

// ============================================================================
// Game Configuration Constants
// ============================================================================
export const GameConfig = {
    // Get the triangle indices to use based on player count
    // Triangles are in clockwise order: 0=12, 1=2, 2=4, 3=6, 4=8, 5=10 o'clock
    // Opposite pairs: 0↔3, 1↔4, 2↔5
    getPlayerTriangleIndices(playerCount) {
        switch (playerCount) {
            case 2:
                // Opposite triangles: 12 o'clock vs 6 o'clock
                return [0, 3];
            case 3:
                // Every other triangle: 2, 6, 10 o'clock (equidistant, 120° apart)
                return [1, 3, 5];
            case 4:
                // Two pairs of opposites: 12, 2, 6, 8 o'clock
                return [0, 1, 3, 4];
            case 5:
                // Skip one triangle: 12, 2, 4, 6, 8 o'clock (skip 10 o'clock)
                return [0, 1, 2, 3, 4];
            case 6:
            default:
                // All triangles
                return [0, 1, 2, 3, 4, 5];
        }
    },

    // Get the opposite triangle index (goal triangle)
    getGoalTriangleIndex(homeIndex) {
        return (homeIndex + 3) % 6;
    },

    // Get turn order starting from 6 o'clock, going clockwise
    getTurnOrder(playerIndices) {
        const clockwiseFrom6 = [3, 4, 5, 0, 1, 2];
        return clockwiseFrom6.filter(idx => playerIndices.includes(idx));
    }
};
