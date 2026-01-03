#!/usr/bin/env node

/**
 * Archive.org Link Checker
 * Tests if archive.org MP3 files are accessible
 */

import https from 'https';

// Sample of Archive.org links
const archiveLinks = [
    { id: "ar-174hz", name: "174Hz Pain Relief", url: "https://archive.org/download/adhd-music-focus-music-for-better-concentration-study-music-for-add/174%20Hz%20Healing%20Frequency%20Pain%20Relief%20_%20Delta%20Waves%20Binaural%20Beats%20Deep%20Sleep%20Music%20Black%20Screen.mp3" },
    { id: "ar-528hz", name: "528Hz Self Healing", url: "https://archive.org/download/adhd-music-focus-music-for-better-concentration-study-music-for-add/528%20Hz%20%E2%81%82%20ACTIVATE%20SELF%20HEALING%20%26%20Positive%20Transformation%20_%20Solfeggio%20Sleep%20Music.mp3" },
    { id: "wf-adhd", name: "ADHD Frequency", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Attention_Deficit_Disorder_with_Hyperactivity_32m_session.mp3" },
    { id: "wf-anxiety", name: "Anxiety Relief", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Anxiety_Disorders_30m_session.mp3" },
    { id: "wf-autism", name: "Autism Frequency", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Autistic_Disorder_32m_session.mp3" },
];

async function checkUrl(url, timeout = 10000) {
    return new Promise((resolve) => {
        https.request(url, { method: 'HEAD', timeout }, (res) => {
            resolve({
                status: res.statusCode,
                ok: res.statusCode >= 200 && res.statusCode < 400
            });
        }).on('error', (err) => {
            resolve({ status: 0, ok: false, error: err.message });
        }).on('timeout', function () {
            this.destroy();
            resolve({ status: 0, ok: false, error: 'Timeout' });
        }).end();
    });
}

async function checkArchiveLinks() {
    console.log('🔍 Checking Archive.org Links (Sample)...\n');

    const results = { working: [], broken: [], total: archiveLinks.length };

    for (const track of archiveLinks) {
        process.stdout.write(`Testing: ${track.name.padEnd(25)} ... `);
        const result = await checkUrl(track.url);

        if (result.ok) {
            console.log(`✅ OK (${result.status})`);
            results.working.push(track);
        } else {
            console.log(`❌ BROKEN (${result.status || result.error})`);
            results.broken.push({ ...track, error: result.error || result.status });
        }

        await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\nRESULTS:`);
    console.log(`✅ Working: ${results.working.length}/${results.total}`);
    console.log(`❌ Broken:  ${results.broken.length}/${results.total}`);

    if (results.broken.length > 0) {
        console.log('\n⚠️  BROKEN ARCHIVE.ORG LINKS:\n');
        results.broken.forEach(track => {
            console.log(`   ❌ ${track.name} - ${track.error}`);
        });
    } else {
        console.log('\n✨ All Archive.org links are working!');
        console.log('   These are direct MP3 files and very reliable.\n');
    }
}

checkArchiveLinks().catch(console.error);
