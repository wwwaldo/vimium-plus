// ASCII donut spinner inspired by donut.c
class DonutSpinner {
    constructor() {
        this.A = 0;  // X-rotation
        this.B = 0;  // Z-rotation
        this.width = 35;
        this.height = 15;
        this.chars = '.,-~:;=!*#$@'.split('');
        this.interval = null;
    }

    // Render a frame of the donut
    renderFrame() {
        // Precompute sines and cosines
        const cosA = Math.cos(this.A), sinA = Math.sin(this.A);
        const cosB = Math.cos(this.B), sinB = Math.sin(this.B);

        // Output and zbuffer arrays
        const output = new Array(this.width * this.height).fill(' ');
        const zbuffer = new Array(this.width * this.height).fill(0);

        // Rotate around the y-axis (vertical)
        for (let theta = 0; theta < 6.28; theta += 0.07) {
            const cosTheta = Math.cos(theta), sinTheta = Math.sin(theta);

            // Rotate around the center of the donut
            for (let phi = 0; phi < 6.28; phi += 0.02) {
                const cosPhi = Math.cos(phi), sinPhi = Math.sin(phi);

                // 3D coordinates of point on torus
                const x = cosTheta * (2 + cosPhi);
                const y = sinTheta * (2 + cosPhi);
                const z = sinPhi;

                // 3D rotation
                const ooz = 1 / (5 + x * cosB * cosA - z * sinA);  // one over z
                
                // Project 3D -> 2D
                const xp = Math.floor(this.width/2 + 30 * ooz * (x * cosB * sinA + z * cosA));
                const yp = Math.floor(this.height/2 + 15 * ooz * (x * sinB - y));

                // Calculate luminance
                const L = Math.floor(8 * Math.abs(cosPhi * cosTheta * sinB - cosA * cosTheta * sinPhi - sinA * sinTheta + sinB * (cosA * sinTheta - cosTheta * sinA * sinPhi)));

                // Only render if point is visible and in front
                if (xp >= 0 && xp < this.width && yp >= 0 && yp < this.height) {
                    const pos = xp + yp * this.width;
                    if (ooz > zbuffer[pos]) {
                        zbuffer[pos] = ooz;
                        output[pos] = this.chars[L > 0 ? L : 0];
                    }
                }
            }
        }

        // Convert to string with newlines
        let frame = '';
        for (let i = 0; i < this.height; i++) {
            frame += output.slice(i * this.width, (i + 1) * this.width).join('') + '\n';
        }
        return frame;
    }

    // Start spinning
    start(message = 'Loading') {
        if (this.interval) return;
        
        // Clear terminal and hide cursor
        process.stdout.write('\x1B[?25l');
        
        this.interval = setInterval(() => {
            // Move cursor to start
            process.stdout.write('\x1B[H');
            
            // Render frame
            process.stdout.write(this.renderFrame());
            process.stdout.write(`\n${message}...\n`);
            
            // Update angles
            this.A += 0.07;
            this.B += 0.03;
        }, 50);
        
        // Handle cleanup on exit
        process.on('SIGINT', () => this.stop());
    }

    // Stop spinning
    stop() {
        if (!this.interval) return;
        clearInterval(this.interval);
        this.interval = null;
        // Show cursor again
        process.stdout.write('\x1B[?25h');
        // Clear screen
        process.stdout.write('\x1B[2J');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DonutSpinner;
}
