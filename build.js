import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DIST_DIR = path.join(__dirname, 'dist');
const FILES_TO_COPY = ['preview.png', 'widget.json', 'README.md'];

// Platform-specific deployment paths
const DEPLOY_PATHS = {
    win32: 'E:\\WorkSpace\\Personal\\Notes\\data\\widgets\\siyuan-run-python-code',
    //   darwin: '/Users/jinmianye/SiYuan/data/widgets/run-python-code',
    // linux: '/path/to/linux/siyuan/widgets/run-python-code',
};

function log(message) {
    console.log(`\x1b[36m${message}\x1b[0m`);
}

function error(message) {
    console.error(`\x1b[31m${message}\x1b[0m`);
}

async function createZip() {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(path.join(DIST_DIR, 'package.zip'));
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            log(`✓ Created package.zip (${archive.pointer()} bytes)`);
            resolve();
        });

        archive.on('error', (err) => reject(err));
        archive.pipe(output);

        // Add all files from dist directory except package.zip itself
        archive.glob('**/*', {
            cwd: DIST_DIR,
            ignore: ['package.zip'],
        });

        archive.finalize();
    });
}

async function build() {
    try {
        // Step 1: Build project
        log('Building project...');
        execSync('pnpm run build', { stdio: 'inherit' });

        // Step 2: Copy additional files
        log('Copying files...');
        for (const file of FILES_TO_COPY) {
            const src = path.join(__dirname, file);
            const dest = path.join(DIST_DIR, file);
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                log(`✓ Copied ${file}`);
            } else {
                error(`✗ File not found: ${file}`);
            }
        }

        // Step 3: Create package.zip
        log('Creating package.zip...');
        await createZip();

        // Step 4: Deploy to SiYuan (if path is configured)
        const deployPath = DEPLOY_PATHS[process.platform];
        if (deployPath) {
            log('Deploying to SiYuan...');

            // Clean old files
            if (fs.existsSync(deployPath)) {
                log('Cleaning old files...');
                fs.removeSync(deployPath);
            }

            // Copy new files
            log('Copying new files...');
            fs.copySync(DIST_DIR, deployPath);
            log(`✓ Deployed to ${deployPath}`);
        } else {
            log(`⚠ No deployment path configured for platform: ${process.platform}`);
        }

        log('✅ Build and deploy completed!');
    } catch (err) {
        error(`❌ Build failed: ${err.message}`);
        process.exit(1);
    }
}

build();
