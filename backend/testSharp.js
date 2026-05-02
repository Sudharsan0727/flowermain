const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function test() {
    try {
        console.log('Testing sharp...');
        // Create a blank image to test
        const buffer = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 0.5 }
            }
        }).webp().toBuffer();
        
        console.log('Sharp is working! WebP buffer size:', buffer.length);
        process.exit(0);
    } catch (err) {
        console.error('Sharp test failed:', err);
        process.exit(1);
    }
}

test();
