// ============================================================================
// HexPosition Class
// ============================================================================
export class HexPosition {
    constructor(q, r) {
        this.q = q;
        this.r = r;
    }

    // Create a unique string key for this position
    get key() {
        return `${this.q},${this.r}`;
    }

    // Check equality with another HexPosition
    equals(other) {
        return this.q === other.q && this.r === other.r;
    }

    // Add another HexPosition (or direction) to this one
    add(other) {
        return new HexPosition(this.q + other.q, this.r + other.r);
    }

    // Subtract another HexPosition from this one
    subtract(other) {
        return new HexPosition(this.q - other.q, this.r - other.r);
    }

    // Scale by a factor
    scale(factor) {
        return new HexPosition(this.q * factor, this.r * factor);
    }

    // Rotate 60° counter-clockwise
    rotate60CCW() {
        return new HexPosition(-this.r, this.q + this.r);
    }

    // Rotate 60° clockwise
    rotate60CW() {
        return new HexPosition(this.q + this.r, -this.q);
    }

    // Rotate by N * 60° counter-clockwise
    rotateN(n) {
        let result = this;
        for (let i = 0; i < n; i++) {
            result = result.rotate60CCW();
        }
        return result;
    }

    // Create HexPosition from a key string
    static fromKey(key) {
        const [q, r] = key.split(',').map(Number);
        return new HexPosition(q, r);
    }

    // Round floating-point coordinates to nearest hex
    static round(q, r) {
        const s = -q - r;
        let rq = Math.round(q);
        let rr = Math.round(r);
        let rs = Math.round(s);

        const qDiff = Math.abs(rq - q);
        const rDiff = Math.abs(rr - r);
        const sDiff = Math.abs(rs - s);

        if (qDiff > rDiff && qDiff > sDiff) {
            rq = -rr - rs;
        } else if (rDiff > sDiff) {
            rr = -rq - rs;
        }

        return new HexPosition(rq, rr);
    }
}

// ============================================================================
// Hex Direction Constants
// ============================================================================
export const HexDirection = Object.freeze({
    EAST:       new HexPosition( 1,  0),  // →
    NORTHEAST:  new HexPosition( 1, -1),  // ↗
    NORTHWEST:  new HexPosition( 0, -1),  // ↖
    WEST:       new HexPosition(-1,  0),  // ←
    SOUTHWEST:  new HexPosition(-1,  1),  // ↙
    SOUTHEAST:  new HexPosition( 0,  1),  // ↘
});

// Array of all directions for iteration
export const HEX_DIRECTIONS = Object.values(HexDirection);

// ============================================================================
// Hex Utility Functions
// ============================================================================
export const HexUtils = {
    // Convert axial coordinates to pixel coordinates
    axialToPixel(pos, hexRadius, centerX, centerY) {
        const x = hexRadius * (Math.sqrt(3) * pos.q + Math.sqrt(3) / 2 * pos.r) + centerX;
        const y = hexRadius * (3 / 2 * pos.r) + centerY;
        return { x, y };
    },

    // Convert pixel coordinates to axial HexPosition
    pixelToAxial(x, y, hexRadius, centerX, centerY) {
        x = x - centerX;
        y = y - centerY;
        const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / hexRadius;
        const r = (2 / 3 * y) / hexRadius;
        return HexPosition.round(q, r);
    }
};
