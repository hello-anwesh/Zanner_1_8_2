import fs from 'fs';
import https from 'https';

// Read and parse the soundLibrary.ts file
const content = fs.readFileSync('./src/config/soundLibrary.ts', 'utf8');

// Extract all tracks using regex
const trackRegex = /{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*icon:\s*"[^"]+",\s*url:\s*"([^"]+)",\s*category:\s*"([^"]+)"/g;
const tracks = [];
let match;

while ((match = trackRegex.exec(content)) !== null) {
    const [, id, name, url, category] = match;

    // Skip frequency mixes (they're generated, not URLs)
    if (url.startsWith('frequency-mix://')) continue;

    let type = 'unknown';
    if (url.includes('youtube.com')) type = 'youtube';
    else if (url.includes('soundcloud.com')) type = 'soundcloud';
    else if (url.includes('archive.org')) type = 'archive';

    tracks.push({ id, name, url, category, type });
}

console.log(`📋 Found ${tracks.length} tracks to test\\n`);

// Test functions
async function checkYouTube(videoId) {
    return new Promise((resolve) => {
        const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ ok: res.statusCode === 200, status: res.statusCode });
            });
        }).on('error', () => resolve({ ok: false, status: 0 }));
    });
}

async function checkSoundCloud(url) {
    return new Promise((resolve) => {
        // Check if the SoundCloud player URL is accessible
        https.get(url, (res) => {
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
        }).on('error', () => resolve({ ok: false, status: 0 }));
    });
}

async function checkArchive(url) {
    return new Promise((resolve) => {
        https.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
        }).on('error', () => resolve({ ok: false, status: 0 }))
            .on('timeout', function () {
                this.destroy();
                resolve({ ok: false, status: 0, error: 'timeout' });
            }).end();
    });
}

async function testAll() {
    console.log('🔍 TESTING ALL TRACKS...\\n');

    const results = {
        working: [],
        broken: [],
        byType: {
            youtube: { working: 0, broken: 0 },
            soundcloud: { working: 0, broken: 0 },
            archive: { working: 0, broken: 0 }
        },
        byCategory: {}
    };

    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const progress = `[${i + 1}/${tracks.length}]`;
        process.stdout.write(`${progress} [${track.category}] ${track.name.padEnd(30)} ... `);

        let result;
        try {
            if (track.type === 'youtube') {
                const videoId = track.url.split('/embed/')[1]?.split('?')[0];
                if (!videoId) {
                    result = { ok: false, status: 'invalid-url' };
                } else {
                    result = await checkYouTube(videoId);
                }
            } else if (track.type === 'soundcloud') {
                result = await checkSoundCloud(track.url);
            } else if (track.type === 'archive') {
                result = await checkArchive(track.url);
            } else {
                result = { ok: false, status: 'unknown-type' };
            }
        } catch (error) {
            result = { ok: false, status: 'error', error: error.message };
        }

        if (result.ok) {
            console.log('✅');
            results.working.push(track);
            results.byType[track.type].working++;
        } else {
            console.log(`❌ (${result.status || 'failed'})`);
            results.broken.push({ ...track, errorCode: result.status, error: result.error });
            results.byType[track.type].broken++;
        }

        // Track by category
        if (!results.byCategory[track.category]) {
            results.byCategory[track.category] = { working: 0, broken: 0 };
        }
        if (result.ok) {
            results.byCategory[track.category].working++;
        } else {
            results.byCategory[track.category].broken++;
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 250));
    }

    // Print summary
    console.log('\\n' + '='.repeat(80));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(80));
    console.log(`\\n✅ Working: ${results.working.length}/${tracks.length}`);
    console.log(`❌ Broken:  ${results.broken.length}/${tracks.length}`);
    console.log(`📈 Success Rate: ${((results.working.length / tracks.length) * 100).toFixed(1)}%`);

    console.log('\\n📁 BY TYPE:');
    Object.entries(results.byType).forEach(([type, stats]) => {
        const total = stats.working + stats.broken;
        if (total > 0) {
            console.log(`  ${type.padEnd(15)}: ${stats.working}/${total} working (${stats.broken} broken)`);
        }
    });

    console.log('\\n📂 BY CATEGORY:');
    Object.entries(results.byCategory).forEach(([cat, stats]) => {
        const total = stats.working + stats.broken;
        console.log(`  ${cat.padEnd(15)}: ${stats.working}/${total} working (${stats.broken} broken)`);
    });

    if (results.broken.length > 0) {
        console.log('\\n❌ BROKEN TRACKS:');
        results.broken.forEach(track => {
            console.log(`  - [${track.category}] ${track.name} (${track.id}) - Error: ${track.errorCode}`);
        });
    }
}

testAll().catch(console.error);
