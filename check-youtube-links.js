#!/usr/bin/env node

/**
 * YouTube Video Checker
 * Tests if YouTube videos are available
 */

import https from 'https';

// Extract all YouTube video IDs from soundLibrary.ts
const youtubeVideos = [
    // LOFI & CHILL
    { id: "lofi-girl", name: "Lofi Girl 24/7", videoId: "jfKfPfyJRdk", category: "lofi" },
    { id: "lofi-synthwave", name: "Synthwave Radio", videoId: "4xDzrJKXOOY", category: "lofi" },
    { id: "lofi-chillhop", name: "Chillhop Music", videoId: "5yx6BWlEVcY", category: "lofi" },
    { id: "lofi-coffee", name: "Coffee & Jazz", videoId: "-5KAN9_CzSA", category: "lofi" },

    // NATURE
    { id: "rain-window", name: "Rain on Window", videoId: "q76bMs-NwRk", category: "nature" },
    { id: "thunder", name: "Thunder & Rain", videoId: "nDq6TstdEi8", category: "nature" },
    { id: "ocean-waves", name: "Ocean Waves", videoId: "WHPEKLQID4U", category: "nature" },
    { id: "forest-birds", name: "Forest & Birds", videoId: "xNN7iTA57jM", category: "nature" },
    { id: "fire-crackle", name: "Fireplace", videoId: "UgHKb_7884o", category: "nature" },
    { id: "river-stream", name: "River Stream", videoId: "IvjMgVS6kng", category: "nature" },
    { id: "night-crickets", name: "Night Crickets", videoId: "eKmRkS1os7k", category: "nature" },
    { id: "wind-leaves", name: "Wind in Trees", videoId: "2Kc8B8K8rjg", category: "nature" },

    // AMBIENT
    { id: "coffee-shop", name: "Coffee Shop", videoId: "gaGrHUekGrc", category: "ambient" },
    { id: "library-quiet", name: "Quiet Library", videoId: "0y4q9RP3DIY", category: "ambient" },
    { id: "space-ambient", name: "Deep Space", videoId: "waeYTkCdpPk", category: "ambient" },
    { id: "train-ride", name: "Train Journey", videoId: "K5j3TS1Z1aM", category: "ambient" },
    { id: "airplane", name: "Airplane White Noise", videoId: "y1gLFZ6_Ui4", category: "ambient" },
    { id: "fan-noise", name: "Fan Noise", videoId: "BVV5bOLJNfQ", category: "ambient" },

    // BINAURAL
    { id: "alpha-waves", name: "Alpha 10Hz Focus", videoId: "WPni755-Krg", category: "binaural" },
    { id: "beta-waves", name: "Beta 20Hz Energy", videoId: "gpGysVqD1A0", category: "binaural" },
    { id: "theta-waves", name: "Theta 6Hz Relax", videoId: "BWYyGMuZSgk", category: "binaural" },
    { id: "gamma-waves", name: "Gamma 40Hz Focus", videoId: "0G7LR1VnloM", category: "binaural" },
    { id: "delta-sleep", name: "Delta 2Hz Sleep", videoId: "s6V4TTdqE80", category: "binaural" },

    // FREQUENCIES
    { id: "hz-432", name: "432Hz Healing", videoId: "1ZYbU82GVz4", category: "frequency" },
    { id: "hz-528", name: "528Hz DNA Repair", videoId: "0zqAAPBNMlY", category: "frequency" },
    { id: "hz-396", name: "396Hz Liberation", videoId: "BCVHSLL2RG4", category: "frequency" },
    { id: "hz-852", name: "852Hz Intuition", videoId: "UrzyPGEvOaY", category: "frequency" },
    { id: "solfeggio-all", name: "All Solfeggio", videoId: "Fo0Y0AZCW2s", category: "frequency" },

    // ASMR
    { id: "asmr-keyboard", name: "Keyboard ASMR", videoId: "52FLUaXMBEI", category: "asmr" },
    { id: "asmr-writing", name: "Writing Sounds", videoId: "XCQxzB8-gWQ", category: "asmr" },
    { id: "asmr-gibi", name: "Gibi ASMR Mix", videoId: "RhMc8RwH_HM", category: "asmr" },
    { id: "asmr-gentle", name: "Gentle Whispering", videoId: "vx8qkhfvlpM", category: "asmr" },
    { id: "asmr-amalzd", name: "Amalzd Tapping", videoId: "JYxNZhCWBTo", category: "asmr" },
    { id: "asmr-tingting", name: "Tingting ASMR", videoId: "a1bvujKdMos", category: "asmr" },
    { id: "asmr-book", name: "Book Sounds", videoId: "1q8LfBJYw8c", category: "asmr" },
    { id: "asmr-haircut", name: "Haircut Roleplay", videoId: "Xz5QKl0TJaI", category: "asmr" },
    { id: "asmr-spa", name: "Spa Treatment", videoId: "_Rnv0aKlSRY", category: "asmr" },
    { id: "asmr-rain-window", name: "Rain + Window", videoId: "3hxRp0_X0Do", category: "asmr" },

    // FOCUS
    { id: "focus-music", name: "Focus Music", videoId: "lTRiuFIWV54", category: "focus" },
    { id: "study-music", name: "Study Music", videoId: "OWeo5P4vgUw", category: "focus" },
    { id: "coding-music", name: "Coding Beats", videoId: "f02mOEt11OQ", category: "focus" },
    { id: "deep-work", name: "Deep Work", videoId: "XRxmBFBGukI", category: "focus" },

    // CLASSICAL
    { id: "classical-mozart", name: "Mozart Focus", videoId: "Rb0UmrCXxVA", category: "classical" },
    { id: "classical-bach", name: "Bach Cello", videoId: "S6yuR8efotI", category: "classical" },
    { id: "classical-piano", name: "Piano Pieces", videoId: "HSOtku1j600", category: "classical" },
    { id: "classical-debussy", name: "Debussy", videoId: "LlvUepMa31o", category: "classical" },

    // ELECTRONIC
    { id: "synthwave", name: "Synthwave Mix", videoId: "4xDzrJKXOOY", category: "electronic" },
    { id: "ambient-elec", name: "Ambient Electronic", videoId: "kniaPi9OmKM", category: "electronic" },
    { id: "dark-ambient", name: "Dark Ambient", videoId: "S_MOd40zlYU", category: "electronic" },
    { id: "vapor-wave", name: "Vaporwave", videoId: "aQkPcPqTq4M", category: "electronic" },

    // NEURODIVERGENT
    { id: "brown-noise", name: "Brown Noise", videoId: "RqzGzwTY-6w", category: "neurodivergent" },
    { id: "pink-noise", name: "Pink Noise", videoId: "ZXtimhT-ff4", category: "neurodivergent" },
    { id: "white-noise", name: "White Noise", videoId: "nMfPqeZjc2c", category: "neurodivergent" },
    { id: "adhd-focus", name: "ADHD Focus Music", videoId: "Fp64Lpm0bPc", category: "neurodivergent" },
    { id: "adhd-study", name: "ADHD Study Beats", videoId: "jWFbo4t7w9o", category: "neurodivergent" },
    { id: "body-double", name: "Body Doubling", videoId: "XU2PJPIFNGI", category: "neurodivergent" },
    { id: "autism-calm", name: "Autism Calm", videoId: "77ZozI0rw7w", category: "neurodivergent" },

    // VISUALS (sample)
    { id: "vis-mandala", name: "Mandala Flow", videoId: "T4KQ6nSO8yo", category: "visuals" },
    { id: "vis-fractal1", name: "Fractal Journey", videoId: "kxopViU98Xo", category: "visuals" },
    { id: "vis-lava", name: "Lava Lamp", videoId: "7FX1_M1dQj4", category: "visuals" },
    { id: "vis-fireplace", name: "Fireplace", videoId: "L_LUpnjgPso", category: "visuals" },
    { id: "vis-aquarium", name: "Aquarium", videoId: "n7pFM234g6c", category: "visuals" },
];

async function checkYouTubeVideo(videoId) {
    return new Promise((resolve) => {
        const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve({ ok: true, status: 200 });
                } else if (res.statusCode === 404 || res.statusCode === 401) {
                    resolve({ ok: false, status: res.statusCode, error: 'Video unavailable/deleted' });
                } else {
                    resolve({ ok: false, status: res.statusCode });
                }
            });
        }).on('error', (err) => {
            resolve({ ok: false, status: 0, error: err.message });
        });
    });
}

async function checkAllVideos() {
    console.log('🔍 Checking YouTube Video Availability...\n');

    const results = {
        working: [],
        broken: [],
        total: youtubeVideos.length
    };

    for (const video of youtubeVideos) {
        process.stdout.write(`[${video.category.padEnd(14)}] ${video.name.padEnd(25)} ... `);
        const result = await checkYouTubeVideo(video.videoId);

        if (result.ok) {
            console.log('✅ OK');
            results.working.push(video);
        } else {
            console.log(`❌ BROKEN (${result.status || result.error})`);
            results.broken.push({ ...video, error: result.error || `HTTP ${result.status}` });
        }

        // Delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\nRESULTS:`);
    console.log(`✅ Working: ${results.working.length}/${results.total}`);
    console.log(`❌ Broken:  ${results.broken.length}/${results.total}`);
    console.log(`📊 Success Rate: ${((results.working.length / results.total) * 100).toFixed(1)}%`);

    if (results.broken.length > 0) {
        console.log('\n' + '='.repeat(80));
        console.log('⚠️  BROKEN YOUTUBE VIDEOS:\n');

        // Group by category
        const byCategory = {};
        results.broken.forEach(video => {
            if (!byCategory[video.category]) byCategory[video.category] = [];
            byCategory[video.category].push(video);
        });

        Object.entries(byCategory).forEach(([category, videos]) => {
            console.log(`\n📁 ${category.toUpperCase()}:`);
            videos.forEach(video => {
                console.log(`   ❌ ${video.name}`);
                console.log(`      ID: ${video.id}`);
                console.log(`      Video ID: ${video.videoId}`);
                console.log(`      URL: https://www.youtube.com/watch?v=${video.videoId}`);
                console.log(`      Error: ${video.error}`);
            });
        });

        console.log('\n' + '='.repeat(80));
        console.log('🔧 ACTION REQUIRED:');
        console.log('   These videos need to be replaced or removed from soundLibrary.ts\n');
    } else {
        console.log('\n✨ All YouTube videos are available!');
    }
}

checkAllVideos().catch(console.error);
