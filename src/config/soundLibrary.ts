/**
 * Sound Library Configuration
 * 
 * Curated collection of ambient sounds, music, and focus frequencies.
 * All URLs verified as of December 2024.
 */

export interface SoundTrack {
    id: string;
    name: string;
    icon: string;
    url: string;
    category: SoundCategory;
    duration?: string;
    description?: string;
    experience?: string;
    usage?: string;
    isCustom?: boolean;
    isPlaylist?: boolean;
    createdAt?: number;
}

export type SoundCategory =
    | "radio"
    | "ambient"
    | "lofi"
    | "nature"
    | "binaural"
    | "frequency"
    | "asmr"
    | "focus"
    | "classical"
    | "electronic"
    | "neurodivergent"
    | "archive"
    | "visuals"
    | "custom";

export interface CategoryInfo {
    id: SoundCategory;
    name: string;
    icon: string;
    description: string;
    color: string;
}

export const CATEGORIES: CategoryInfo[] = [
    { id: "radio", name: "Radio", icon: "📻", description: "24/7 Ad-Free", color: "#EF4444" },
    { id: "lofi", name: "Lofi", icon: "🎵", description: "Chill beats", color: "#F59E0B" },
    { id: "nature", name: "Nature", icon: "🌿", description: "Rain, ocean", color: "#10B981" },
    { id: "ambient", name: "Ambient", icon: "🌌", description: "Soundscapes", color: "#8B5CF6" },
    { id: "binaural", name: "Binaural", icon: "🧠", description: "Brain waves", color: "#EC4899" },
    { id: "frequency", name: "Hz", icon: "🔮", description: "Healing freq", color: "#06B6D4" },
    { id: "asmr", name: "ASMR", icon: "💆", description: "Tingles", color: "#F43F5E" },
    { id: "focus", name: "Focus", icon: "🎯", description: "Productivity", color: "#3B82F6" },
    { id: "classical", name: "Classical", icon: "🎻", description: "Timeless", color: "#A855F7" },
    { id: "electronic", name: "Electronic", icon: "🎹", description: "Synth", color: "#14B8A6" },
    { id: "neurodivergent", name: "ND", icon: "🌈", description: "ADHD/Autism", color: "#F97316" },
    { id: "archive", name: "Archive", icon: "📀", description: "Your uploads", color: "#22D3EE" },
    { id: "visuals", name: "Visuals", icon: "🌀", description: "Trance/Hypnotic", color: "#E879F9" },
    { id: "custom", name: "Custom", icon: "📚", description: "Imported", color: "#64748B" },
];

// ============================================================================
// VERIFIED WORKING SOUNDS - Dec 2024
// Using popular channels with stable content
// ============================================================================


export const DEFAULT_SOUNDS: SoundTrack[] = [
    // =========================================================================
    // 🌿 NATURE - Rain, Ocean, Forest sounds
    // =========================================================================
    { id: "rain-window", name: "Rain on Window", icon: "🌧️", url: "https://www.youtube.com/embed/q76bMs-NwRk", category: "nature", duration: "10hr" },
    { id: "thunder", name: "Thunder & Rain", icon: "⛈️", url: "https://www.youtube.com/embed/nDq6TstdEi8", category: "nature", duration: "10hr" },
    { id: "ocean-waves", name: "Ocean Waves", icon: "🌊", url: "https://www.youtube.com/embed/WHPEKLQID4U", category: "nature", duration: "10hr" },
    { id: "forest-birds", name: "Forest & Birds", icon: "🌲", url: "https://www.youtube.com/embed/xNN7iTA57jM", category: "nature", duration: "8hr" },
    { id: "fire-crackle", name: "Fireplace", icon: "🔥", url: "https://www.youtube.com/embed/UgHKb_7884o", category: "nature", duration: "10hr" },
    { id: "river-stream", name: "River Stream", icon: "🏞️", url: "https://www.youtube.com/embed/IvjMgVS6kng", category: "nature", duration: "8hr" },

    // 🌌 AMBIENT - Music, Lofi, Focus, Classical
    { id: "coffee-shop", name: "Coffee Shop", icon: "☕", url: "https://www.youtube.com/embed/gaGrHUekGrc", category: "ambient", duration: "3hr" },
    { id: "sc-piano-relax", name: "Piano Relaxation", icon: "🎹", url: "https://w.soundcloud.com/player/?url=https://soundcloud.com/relaxingpianomusic/relaxing-piano-music", category: "ambient", duration: "1hr" },
    { id: "lofi-girl", name: "Lofi Girl 24/7", icon: "👧", url: "https://www.youtube.com/embed/jfKfPfyJRdk", category: "ambient", duration: "Live" },
    { id: "lofi-synthwave", name: "Synthwave Radio", icon: "🌆", url: "https://www.youtube.com/embed/4xDzrJKXOOY", category: "ambient", duration: "Live" },
    { id: "lofi-chillhop", name: "Chillhop Music", icon: "🎧", url: "https://www.youtube.com/embed/5yx6BWlEVcY", category: "ambient", duration: "Live" },
    { id: "focus-music", name: "Focus Music", icon: "🎯", url: "https://www.youtube.com/embed/lTRiuFIWV54", category: "ambient", duration: "3hr" },
    { id: "coding-music", name: "Coding Beats", icon: "💻", url: "https://www.youtube.com/embed/f02mOEt11OQ", category: "ambient", duration: "2hr" },
    { id: "classical-mozart", name: "Mozart Focus", icon: "🎼", url: "https://www.youtube.com/embed/Rb0UmrCXxVA", category: "ambient", duration: "4hr" },
    { id: "classical-piano", name: "Piano Pieces", icon: "🎹", url: "https://www.youtube.com/embed/HSOtku1j600", category: "ambient", duration: "3hr" },
    { id: "classical-debussy", name: "Debussy", icon: "🌸", url: "https://www.youtube.com/embed/LlvUepMa31o", category: "ambient", duration: "1hr" },
    { id: "synthwave", name: "Synthwave Mix", icon: "🌆", url: "https://www.youtube.com/embed/4xDzrJKXOOY", category: "ambient", duration: "Live" },
    { id: "dark-ambient", name: "Dark Ambient", icon: "🌑", url: "https://www.youtube.com/embed/S_MOd40zlYU", category: "ambient", duration: "3hr" },
    { id: "vapor-wave", name: "Vaporwave", icon: "🌴", url: "https://www.youtube.com/embed/aQkPcPqTq4M", category: "ambient", duration: "2hr" },

    // 🔮 FREQUENCIES - Hz tones & Binaural beats
    { id: "hz-432", name: "432Hz Healing", icon: "🎶", url: "https://www.youtube.com/embed/1ZYbU82GVz4", category: "frequency", duration: "3hr" },
    { id: "alpha-waves", name: "Alpha 10Hz Binaural", icon: "🧘", url: "https://www.youtube.com/embed/WPni755-Krg", category: "frequency", duration: "8hr" },

    // 💆 ASMR - Individual videos from playlists ✅ VERIFIED
    { id: "asmr-hypnotic", name: "3hr Hypnotic ASMR", icon: "💆", url: "https://www.youtube.com/embed/guZgUX66vTU", category: "asmr", duration: "3hr" },
    { id: "asmr-no-talking", name: "ASMR No Talking", icon: "🤫", url: "https://www.youtube.com/embed/9P7qxM6tbf0", category: "asmr", duration: "1hr" },
    { id: "asmr-study", name: "ASMR Study with Me", icon: "📚", url: "https://www.youtube.com/embed/qsLM0U1iOFY", category: "asmr", duration: "2hr" },
    { id: "asmr-24hr", name: "24hr Deep Sleep ASMR", icon: "😴", url: "https://www.youtube.com/embed/zBOrny37ttA", category: "asmr", duration: "24hr" },
    { id: "asmr-cooking", name: "ASMR Cooking", icon: "🍳", url: "https://www.youtube.com/embed/DoRSCsrKbq8", category: "asmr", duration: "5hr" },
    { id: "asmr-underwater", name: "Underwater ASMR", icon: "🌊", url: "https://www.youtube.com/embed/OIN3emL37V4", category: "asmr", duration: "1hr" },

    // From ASMR (no ads) Playlist
    { id: "asmr-p1", name: "ASMR Deluxe Ear Treatments", icon: "👂", url: "https://www.youtube.com/embed/d3kEOqkx5-0", category: "asmr", duration: "2hr" },
    { id: "asmr-p2", name: "ASMR 101 Triggers 2019", icon: "💯", url: "https://www.youtube.com/embed/jx6CsTSQ_2I", category: "asmr", duration: "4hr" },
    { id: "asmr-p3", name: "ASMR 70+ Green Triggers", icon: "💚", url: "https://www.youtube.com/embed/aoMisDzq19w", category: "asmr", duration: "2hr" },
    { id: "asmr-p4", name: "ASMR Blue Triggers", icon: "💙", url: "https://www.youtube.com/embed/KBLAPp6rQnw", category: "asmr", duration: "2hr" },
    { id: "asmr-p5", name: "ASMR for No Tingles", icon: "✨", url: "https://www.youtube.com/embed/7esfL2oSs-U", category: "asmr", duration: "1hr" },
    { id: "asmr-p6", name: "ASMR 8hr Space Sleep", icon: "🚀", url: "https://www.youtube.com/embed/yZX7r_bc2J4", category: "asmr", duration: "8hr" },
    { id: "asmr-p7", name: "ASMR 70+ Pink Triggers", icon: "🩷", url: "https://www.youtube.com/embed/XclJrdc7RWM", category: "asmr", duration: "3hr" },
    { id: "asmr-p8", name: "ASMR Cryo Spa Dry Ice", icon: "🧊", url: "https://www.youtube.com/embed/WYCrR479nCs", category: "asmr", duration: "1hr" },
    { id: "asmr-p9", name: "ASMR Kawaii XXL Tascam", icon: "🎀", url: "https://www.youtube.com/embed/NmLbsPisuhU", category: "asmr", duration: "2hr" },
    { id: "asmr-p10", name: "ASMR Blue Yeti XXL", icon: "🎙️", url: "https://www.youtube.com/embed/mB5UQKuq0Hc", category: "asmr", duration: "2hr" },
    { id: "asmr-p11", name: "ASMR 4hr Ear to Ear", icon: "👂", url: "https://www.youtube.com/embed/hMJ5MKtIaEY", category: "asmr", duration: "4hr" },
    { id: "asmr-p12", name: "ASMR Sleepless Nights", icon: "🌙", url: "https://www.youtube.com/embed/-NcN6om8Wvg", category: "asmr", duration: "1hr" },
    { id: "asmr-p13", name: "ASMR Sooo Sleepy Triggers", icon: "😴", url: "https://www.youtube.com/embed/4oo5fZfwGuY", category: "asmr", duration: "2hr" },
    { id: "asmr-p14", name: "ASMR Orbeez Ear Satisfaction", icon: "💧", url: "https://www.youtube.com/embed/xAK-PDysT8s", category: "asmr", duration: "1hr" },
    { id: "asmr-p15", name: "ASMR Tickle Stone Ears", icon: "🗿", url: "https://www.youtube.com/embed/aCDFx74C2Dw", category: "asmr", duration: "42min" },
    { id: "asmr-p16", name: "ASMR Tascam 3hr Sleep", icon: "🎚️", url: "https://www.youtube.com/embed/zlVLQ_A35ho", category: "asmr", duration: "3hr" },
    { id: "asmr-p17", name: "ASMR Soap Bubbles 1hr", icon: "🫧", url: "https://www.youtube.com/embed/tnQfP5f-MVU", category: "asmr", duration: "1hr" },
    { id: "asmr-p18", name: "ASMR 2.5hr Scalp Treatment", icon: "💇", url: "https://www.youtube.com/embed/mfUGgSlTP-U", category: "asmr", duration: "2hr" },
    { id: "asmr-p19", name: "ASMR Sailor Moon Makeup", icon: "🌙", url: "https://www.youtube.com/embed/UZj5IaEmQR4", category: "asmr", duration: "46min" },
    { id: "asmr-p20", name: "ASMR 2.5hr Binaural Brushing", icon: "🖌️", url: "https://www.youtube.com/embed/3GOzg1c0EEw", category: "asmr", duration: "2hr" },
    { id: "asmr-p21", name: "ASMR Lavender Sleep", icon: "💜", url: "https://www.youtube.com/embed/EPFDzPSeGrM", category: "asmr", duration: "2hr" },
    { id: "asmr-p22", name: "ASMR YouTube Algorithms", icon: "📺", url: "https://www.youtube.com/embed/yGaf3ETrYwo", category: "asmr", duration: "1hr" },
    { id: "asmr-p23", name: "ASMR Silicone Ear Massage", icon: "👂", url: "https://www.youtube.com/embed/w-6Eygs5cvI", category: "asmr", duration: "20min" },
    { id: "asmr-p24", name: "ASMR Brain Tingling 3hr", icon: "🧠", url: "https://www.youtube.com/embed/R4z2K3HSDqA", category: "asmr", duration: "3hr" },
    { id: "asmr-p25", name: "ASMR 66 Triggers 3hr", icon: "💫", url: "https://www.youtube.com/embed/mdGleunr-qo", category: "asmr", duration: "3hr" },

    // NEURODIVERGENT - ADHD/Autism Focused ✅ VERIFIED WORKING
    { id: "brown-noise", name: "Brown Noise", icon: "🟤", url: "https://www.youtube.com/embed/RqzGzwTY-6w", category: "neurodivergent", duration: "12hr" },
    { id: "pink-noise", name: "Pink Noise", icon: "🩷", url: "https://www.youtube.com/embed/ZXtimhT-ff4", category: "neurodivergent", duration: "10hr" },
    { id: "white-noise", name: "White Noise", icon: "⚪", url: "https://www.youtube.com/embed/nMfPqeZjc2c", category: "neurodivergent", duration: "10hr" },
    { id: "autism-calm", name: "Autism Calm", icon: "💙", url: "https://www.youtube.com/embed/77ZozI0rw7w", category: "neurodivergent", duration: "3hr" },
    { id: "nd-rain-brown", name: "Rain + Brown Noise", icon: "🌧️", url: "https://www.youtube.com/embed/nDq6TstdEi8", category: "neurodivergent", duration: "10hr" },

    // ARCHIVE.ORG - Your ADHD Collection (Direct Audio)
    { id: "ar-174hz", name: "174Hz Pain Relief", icon: "🔮", url: "https://archive.org/download/adhd-music-focus-music-for-better-concentration-study-music-for-add/174%20Hz%20Healing%20Frequency%20Pain%20Relief%20_%20Delta%20Waves%20Binaural%20Beats%20Deep%20Sleep%20Music%20Black%20Screen.mp3", category: "archive", duration: "3hr" },
    { id: "ar-528hz", name: "528Hz Self Healing", icon: "💚", url: "https://archive.org/download/adhd-music-focus-music-for-better-concentration-study-music-for-add/528%20Hz%20%E2%81%82%20ACTIVATE%20SELF%20HEALING%20%26%20Positive%20Transformation%20_%20Solfeggio%20Sleep%20Music.mp3", category: "archive", duration: "3hr" },
    { id: "ar-639hz", name: "639Hz Harmonize", icon: "💜", url: "https://archive.org/download/adhd-music-focus-music-for-better-concentration-study-music-for-add/639Hz%20_%20Harmonize%20Relationships%20_%20Heal%20Old%20Negative%20Energy%20-%20Attract%20Love%20_%20Solfeggio%20Healing%20Tones.mp3", category: "archive", duration: "3hr" },
    { id: "ar-adhd-intense", name: "ADHD Intense Relief", icon: "🧠", url: "https://archive.org/download/adhd-music-focus-music-for-better-concentration-study-music-for-add/ADDADHD%20Intense%20Relief%20-%20Extended%2C%20ADHD%20Focus%20Music%2C%20ADHD%20Music%20Therapy%2C%20Isochronic%20Tones.mp3", category: "archive", duration: "2hr" },
    { id: "ar-adhd-focus", name: "ADHD Focus Concentration", icon: "🎯", url: "https://archive.org/download/adhd-music-focus-music-for-better-concentration-study-music-for-add/ADHD%20Music%20-%20Focus%20Music%20for%20Better%20Concentration%2C%20Study%20Music%20for%20ADD.mp3", category: "archive", duration: "2hr" },
    { id: "ar-adhd-relief", name: "ADHD Relief Study", icon: "📖", url: "https://archive.org/download/adhd-music-focus-music-for-better-concentration-study-music-for-add/ADHD%20Relief%20Music_%20Studying%20Music%20for%20Better%20Concentration%20and%20Focus%2C%20Study%20Music.mp3", category: "archive", duration: "2hr" },
    { id: "ar-9-solfeggio", name: "All 9 Solfeggio", icon: "🌀", url: "https://archive.org/download/adhd-music-focus-music-for-better-concentration-study-music-for-add/All%209%20Solfeggio%20Frequencies%20-%20Full%20Body%20Aura%20Cleanse%20%26%20Cell%20Regeneration%20Therapy.mp3", category: "archive", duration: "3hr" },
    { id: "ar-solfeggio-healing", name: "Solfeggio Healing", icon: "✨", url: "https://archive.org/download/adhd-music-focus-music-for-better-concentration-study-music-for-add/All%209%20Solfeggio%20Frequencies%20Healing%20Music%20%E3%80%8BMeditative%20Mind.mp3", category: "archive", duration: "3hr" },
    { id: "ar-autism-calm", name: "Autism Sensory Calm", icon: "💙", url: "https://archive.org/download/adhd-music-focus-music-for-better-concentration-study-music-for-add/Autism%20Calming%20Sensory%20Meltdown%20Remedy%20Soothing%20Visuals.mp3", category: "archive", duration: "1hr" },
    { id: "ar-emdr", name: "EMDR Bilateral", icon: "👁️", url: "https://archive.org/download/adhd-music-focus-music-for-better-concentration-study-music-for-add/Bilateral%20Stimulation%20Music%20_%20%5BEMDR%5D%20Reduce%20Anxiety%2C%20PTSD%20%26%20Stress%20Disorders.mp3", category: "archive", duration: "2hr" },

    // ARCHIVE.ORG - Wellness Frequencies (Direct Audio - Curated Selection)
    { id: "wf-adhd", name: "ADHD Frequency", icon: "🧠", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Attention_Deficit_Disorder_with_Hyperactivity_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-anxiety", name: "Anxiety Relief Freq", icon: "😌", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Anxiety_Disorders_30m_session.mp3", category: "archive", duration: "30m" },
    { id: "wf-autism", name: "Autism Frequency", icon: "💙", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Autistic_Disorder_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-asperger", name: "Asperger Frequency", icon: "🌟", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Asperger_Syndrome_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-depression", name: "Depression Relief", icon: "☀️", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Depressive_Disorder_30m_session.mp3", category: "archive", duration: "30m" },
    { id: "wf-sleep", name: "Sleep Disorders", icon: "😴", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Sleep_Disorders_30m_session.mp3", category: "archive", duration: "30m" },
    { id: "wf-ptsd", name: "PTSD Relief", icon: "🕊️", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Post-Traumatic_Stress_Disorders_30m_session.mp3", category: "archive", duration: "30m" },
    { id: "wf-ocd", name: "OCD Frequency", icon: "🔄", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Neurosis_Obsessive-Compulsive_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-bipolar", name: "Bipolar Frequency", icon: "⚖️", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Bipolar_Disorder_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-dyslexia", name: "Dyslexia", icon: "📚", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Dyslexia-Symptoms_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-tourette", name: "Tourette", icon: "✋", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Tourette_Syndrome_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-phobia", name: "Phobia Relief", icon: "🦋", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Phobic_Disorders_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-sad", name: "SAD Relief", icon: "🌤️", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Seasonal_Affective_Disorder_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-amnesia", name: "Memory", icon: "🧩", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Amnesia_27m_session.mp3", category: "archive", duration: "27m" },
    { id: "wf-brain", name: "Brain Health", icon: "🩺", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Brain_Diseases_32m_session.mp3", category: "archive", duration: "32m" },

    // More Wellness Frequencies
    { id: "wf-alzheimer", name: "Alzheimer", icon: "🧓", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Alzheimer_Disease_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-dementia", name: "Dementia", icon: "💭", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Dementia_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-parkinson", name: "Parkinson", icon: "🖐️", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Parkinson_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-ms", name: "Multiple Sclerosis", icon: "🧬", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Multiple_Sclerosis_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-seizure", name: "Seizure", icon: "⚡", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Seizures_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-schizo", name: "Schizophrenia", icon: "🔷", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Schizophrenia_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-dissoc", name: "Dissociative", icon: "🪞", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Dissociative_Disorders_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-psychotic", name: "Psychotic", icon: "🌀", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Psychotic_Disorders_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-borderline", name: "Borderline PD", icon: "💔", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Personality_Disorder-Borderline_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-combat", name: "Combat PTSD", icon: "🎖️", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Combat_Disorders_30m_session.mp3", category: "archive", duration: "30m" },
    { id: "wf-postpartum", name: "Postpartum", icon: "👶", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Postpartum_Depression_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-dysthymic", name: "Dysthymia", icon: "☁️", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Dysthymic_Disorder_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-narcolepsy", name: "Narcolepsy", icon: "😴", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Narcolepsy-Cataplexy_Syndrome_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-restless", name: "Restless Legs", icon: "🦵", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Restless_Legs_Syndrome_30m_session.mp3", category: "archive", duration: "30m" },
    { id: "wf-hypersomnia", name: "Hypersomnia", icon: "🛏️", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Hypersomnia_Periodic_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-bruxism", name: "Bruxism", icon: "🦷", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Bruxism_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-stutter", name: "Stuttering", icon: "🗣️", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Stuttering_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-aphasia", name: "Aphasia", icon: "💬", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Aphasia_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-mutism", name: "Mutism", icon: "🤐", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Mutism_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-comm", name: "Communication", icon: "📢", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Communication_Disorders_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-tremor", name: "Essential Tremor", icon: "👋", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Essential_Tremor_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-movement", name: "Movement", icon: "🏃", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Movement_Disorder_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-spasticity", name: "Spasticity", icon: "💪", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Muscle_Spasticity_32m_session.mp3", category: "archive", duration: "32m" },

    { id: "wf-ataxia", name: "Ataxia", icon: "🎯", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Cerebellar_Ataxia_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-chorea", name: "Chorea", icon: "💃", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Chorea_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-motor", name: "Motor Neuron", icon: "⚙️", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Motor_Neuron_Disease_32m_sesion.mp3", category: "archive", duration: "32m" },
    { id: "wf-gait", name: "Gait Disorders", icon: "🚶", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Neurologic_Gait_Disorders_30m_session.mp3", category: "archive", duration: "30m" },

    { id: "wf-hyperacusis", name: "Hyperacusis", icon: "👂", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Hyperacusis_32m_session.mp3", category: "archive", duration: "32m" },

    { id: "wf-agnosia", name: "Agnosia", icon: "❓", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Agnosia_32m_session.mp3", category: "archive", duration: "32m" },

    { id: "wf-apraxia", name: "Apraxia", icon: "🤲", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Apraxias_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-tricho", name: "Trichotillomania", icon: "💇", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Trichotillomania_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-somatoform", name: "Somatoform", icon: "🫀", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Somatoform_Disorders_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-hysteria", name: "Hysteria", icon: "😰", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Hysteria_Dissociative_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-stiff", name: "Stiff Person", icon: "🧍", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Stiff-Person_Syndrome_30m_session.mp3", category: "archive", duration: "30m" },
    { id: "wf-thalamic", name: "Thalamic", icon: "🧠", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Thalamic_Diseases_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-demyelin", name: "Demyelinating", icon: "🔬", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Demyelinating_Diseases_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-vasc-dem", name: "Vascular Dementia", icon: "🩸", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Vascular_Dementia_32m_session.mp3", category: "archive", duration: "32m" },

    { id: "wf-myeloenc", name: "Myeloencephalitis", icon: "🦠", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Myeloencephalitis_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-neuroarth", name: "Neurogenic Arth", icon: "🦴", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Neurogenic_Arthropathy_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-nvld", name: "Nonverbal LD", icon: "🎓", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Nonverbal_Learning_Disorder_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-adiadoch", name: "Adiadochokinesis", icon: "🔄", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Adiadochokinesis_32m_session.mp3", category: "archive", duration: "32m" },

    { id: "wf-tricho2", name: "Trichothio", icon: "🔬", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Trichothiodystrophy_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-tonic", name: "Tonic-Clonic", icon: "⚡", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Tonic-Clonic_Seizures_32m_session.mp3", category: "archive", duration: "32m" },
    { id: "wf-seizure2", name: "Seizure Disorder", icon: "🔋", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Seizure_Disorder_42m_session.mp3", category: "archive", duration: "42m" },
    { id: "wf-parkinsonian", name: "Parkinsonian", icon: "🤲", url: "https://archive.org/download/anwesh-rath-welness-frequency-harmonia/Parkinsonian_Disorders_32m_session.mp3", category: "archive", duration: "32m" },

    //Human: VISUALS - Only VERIFIED WORKING tracks ✅
    { id: "vis-fractal1", name: "Fractal Journey", icon: "🔮", url: "https://www.youtube.com/embed/kxopViU98Xo", category: "visuals", duration: "1hr" },
    { id: "vis-liquid", name: "Liquid Dreams", icon: "💧", url: "https://www.youtube.com/embed/lE6RYpe9IT0", category: "visuals", duration: "3hr" },
    { id: "vis-aurora", name: "Aurora Borealis", icon: "🌌", url: "https://www.youtube.com/embed/V-_O7nl0Ii0", category: "visuals", duration: "2hr" },
    { id: "vis-fire", name: "Fire Meditation", icon: "🔥", url: "https://www.youtube.com/embed/RDfjXj5EGqI", category: "visuals", duration: "3hr" },
    { id: "vis-ocean", name: "Ocean Waves View", icon: "🏖️", url: "https://www.youtube.com/embed/WHPEKLQID4U", category: "visuals", duration: "3hr" },
    { id: "vis-candle", name: "Candle Flame", icon: "🕯️", url: "https://www.youtube.com/embed/5qap5aO4i9A", category: "visuals", duration: "3hr" },
    { id: "vis-fireplace", name: "Fireplace", icon: "🏠", url: "https://www.youtube.com/embed/L_LUpnjgPso", category: "visuals", duration: "10hr" },

];

// ============================================================================
// LOCAL STORAGE
// ============================================================================

const STORAGE_KEY = "chronos_sound_library";

export interface SoundLibraryState {
    customSounds: SoundTrack[];
    favorites: string[];
    recentlyPlayed: string[];
    lastPlayed?: string;
}

export function loadSoundLibrary(): SoundLibraryState {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) { console.error("Failed to load sound library:", e); }
    return { customSounds: [], favorites: [], recentlyPlayed: [] };
}

export function saveSoundLibrary(state: SoundLibraryState): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { console.error("Failed to save sound library:", e); }
}

export function addCustomSound(name: string, url: string, icon: string = "🎵"): SoundTrack {
    const state = loadSoundLibrary();
    const track: SoundTrack = {
        id: `custom-${Date.now()}`,
        name, icon,
        url: convertToEmbedUrl(url),
        category: "custom",
        isCustom: true,
        createdAt: Date.now(),
    };
    state.customSounds.push(track);
    saveSoundLibrary(state);
    return track;
}

export function removeCustomSound(id: string): void {
    const state = loadSoundLibrary();
    state.customSounds = state.customSounds.filter(s => s.id !== id);
    state.favorites = state.favorites.filter(f => f !== id);
    saveSoundLibrary(state);
}

export function toggleFavorite(id: string): boolean {
    const state = loadSoundLibrary();
    const index = state.favorites.indexOf(id);
    if (index === -1) state.favorites.push(id);
    else state.favorites.splice(index, 1);
    saveSoundLibrary(state);
    return index === -1;
}

export function addToRecentlyPlayed(id: string): void {
    const state = loadSoundLibrary();
    state.recentlyPlayed = state.recentlyPlayed.filter(r => r !== id);
    state.recentlyPlayed.unshift(id);
    state.recentlyPlayed = state.recentlyPlayed.slice(0, 10);
    state.lastPlayed = id;
    saveSoundLibrary(state);
}

export function getAllSounds(): SoundTrack[] {
    const state = loadSoundLibrary();
    return [...DEFAULT_SOUNDS, ...state.customSounds];
}

export function getSoundsByCategory(category: SoundCategory): SoundTrack[] {
    return getAllSounds().filter(s => s.category === category);
}

export function getFavorites(): SoundTrack[] {
    const state = loadSoundLibrary();
    const all = getAllSounds();
    return state.favorites.map(id => all.find(s => s.id === id)).filter(Boolean) as SoundTrack[];
}

export function getRecentlyPlayed(): SoundTrack[] {
    const state = loadSoundLibrary();
    const all = getAllSounds();
    return state.recentlyPlayed.map(id => all.find(s => s.id === id)).filter(Boolean) as SoundTrack[];
}

function convertToEmbedUrl(url: string): string {
    if (url.includes("/embed/")) return url;
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    return url;
}
