const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const zlib = require('zlib');

const VERSION = require('../package.json').version;
const REPO = 'envcheck/envcheck';

function getPlatformTarget() {
    const platform = os.platform();
    const arch = os.arch();

    if (platform === 'linux' && arch === 'x64') {
        return 'x86_64-unknown-linux-gnu';
    } else if (platform === 'darwin' && arch === 'x64') {
        return 'x86_64-apple-darwin';
    } else if (platform === 'darwin' && arch === 'arm64') {
        return 'aarch64-apple-darwin';
    } else if (platform === 'win32' && arch === 'x64') {
        return 'x86_64-pc-windows-msvc';
    } else {
        throw new Error(`Unsupported platform: ${platform}-${arch}`);
    }
}

async function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                download(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function install() {
    const target = getPlatformTarget();
    const ext = target.includes('windows') ? 'zip' : 'tar.gz';
    const archiveName = `envcheck-${target}.${ext}`;
    const url = `https://github.com/${REPO}/releases/download/v${VERSION}/${archiveName}`;

    console.log(`Downloading envcheck for ${target}...`);

    const tmpDir = os.tmpdir();
    const archivePath = path.join(tmpDir, archiveName);
    const binDir = path.join(__dirname, '..', 'bin');

    try {
        await download(url, archivePath);

        if (!fs.existsSync(binDir)) {
            fs.mkdirSync(binDir, { recursive: true });
        }

        if (ext === 'tar.gz') {
            execSync(`tar -xzf "${archivePath}" -C "${binDir}"`, { stdio: 'inherit' });
        } else {
            // For Windows, extract zip
            execSync(`powershell -Command "Expand-Archive -Path '${archivePath}' -DestinationPath '${binDir}' -Force"`, { stdio: 'inherit' });
        }

        // Make binary executable on Unix
        if (process.platform !== 'win32') {
            fs.chmodSync(path.join(binDir, 'envcheck'), 0o755);
        }

        console.log('envcheck installed successfully!');
    } catch (err) {
        console.error('Failed to install envcheck:', err.message);
        console.error('You can install manually with: cargo install envcheck');
        process.exit(1);
    } finally {
        try { fs.unlinkSync(archivePath); } catch { }
    }
}

install();
