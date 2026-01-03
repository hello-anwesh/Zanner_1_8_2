#!/usr/bin/env node

/**
 * Sound Library Link Checker
 * Tests all URLs in the sound library and reports broken links
 */

import https from 'https';
import http from 'http';

// Extract sound tracks - just checking SoundCloud since those are most likely to be broken
const soundcloudTracks = [
    { id: "sc-lofi-chill", name: "Lofi Chill Mix", url: "https://soundcloud.com/lolofi/lofi-hip-hop-chill-study-beats" },
    { id: "sc-study-beats", name: "Study Beats", url: "https://soundcloud.com/chillhop/chillhop-essentials-fall-2023" },
    { id: "sc-ambient-space", name: "Ambient Space", url: "https://soundcloud.com/atmospheres/deep-space-ambient" },
    { id: "sc-piano-relax", name: "Piano Relaxation", url: "https://soundcloud.com/relaxingpianomusic/relaxing-piano-music" },
    { id: "sc-nature-sounds", name: "Nature Sounds", url: "https://soundcloud.com/naturesounds/rain-sounds-for-sleeping" },
    { id: "sc-jazz-cafe", name: "Jazz Cafe", url: "https://soundcloud.com/jazzhop/coffee-shop-jazz" },
    { id: "sc-synthwave", name: "Synthwave Drive", url: "https://soundcloud.com/synthwave/synthwave-mix" },
    { id: "sc-meditation", name: "Meditation Flow", url: "https://soundcloud.com/meditation-music/deep-meditation" },
    { id: "sc-focus-flow", name: "Focus Flow", url: "https://soundcloud.com/focusmusic/focus-music-for-work" },
    { id: "sc-sleep-sounds", name: "Sleep Sounds", url: "https://soundcloud.com/sleepsounds/sleep-music-8-hours" },
];

async function checkUrl(url, timeout = 10000) {
    return new Promise((resolve) => {
        try {
            const urlObj = new URL(url);
            const protocol = urlObj.protocol === 'https:' ? https : http;

            const req = protocol.request(url, { method: 'HEAD', timeout }, (res) => {
                resolve({
                    status: res.statusCode,
                    ok: res.statusCode >= 200 && res.statusCode < 400
                });
            });

            req.on('error', (err) => {
                resolve({ status: 0, ok: false, error: err.message });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({ status: 0, ok: false, error: 'Timeout' });
            });

            req.end();
        } catch (err) {
            resolve({ status: 0, ok: false, error: err.message });
        }
    });
}

async function checkAllLinks() {
    console.log('🔍 Checking SoundCloud Links...\n');

    const results = {
        working: [],
        broken: [],
        total: soundcloudTracks.length
    };

    for (const sound of soundcloudTracks) {
        process.stdout.write(`Testing: ${sound.name.padEnd(25)} ... `);
        const result = await checkUrl(sound.url);

        if (result.ok) {
            console.log(`✅ OK (${result.status})`);
            results.working.push(sound);
        } else {
            console.log(`❌ BROKEN (${result.status || result.error})`);
            results.broken.push({ ...sound, error: result.error || result.status });
        }

        // Delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\nRESULTS:`);
    console.log(`✅ Working: ${results.working.length}/${results.total}`);
    console.log(`❌ Broken:  ${results.broken.length}/${results.total}`);

    if (results.broken.length > 0) {
        console.log('\n' + '='.repeat(70));
        console.log('⚠️  BROKEN SOUNDCLOUD LINKS:\n');
        results.broken.forEach((sound, i) => {
            console.log(`${i + 1}. ❌ ${sound.name}`);
            console.log(`   ID: ${sound.id}`);
            console.log(`   URL: ${sound.url}`);
            console.log(`   Error: ${sound.error}`);
            console.log('');
        });

        console.log('📝 NOTE: These are likely user-created playlists that may have been');
        console.log('   deleted or made private. They should be replaced with verified');
        console.log('   working SoundCloud embeds or removed from the library.\n');
    } else {
        console.log('\n✨ All SoundCloud links are working!');
    }

    console.log('\n' + '='.repeat(70));
    console.log('ℹ️  OTHER NOTES:');
    console.log('   • YouTube embeds are generally stable (not tested here)');
    console.log('   • Archive.org links are direct MP3s and very reliable');
    console.log('   • The main issue is usually with SoundCloud user content\n');
}

checkAllLinks().catch(console.error);
