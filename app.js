// App Configuration
const APP_VERSION = '1.1.0';
const GPS_TIMEOUT = 30000; // 30 seconds
const GPS_MAX_RETRIES = 2;
const GPS_MAX_ACCURACY = 50; // meters (strict accuracy - prevent low-quality GPS)

// School Geofencing Configuration
// Cendekia Leadership School - Jl. Ligar Taqwa, Jawa Barat
// Source: Google Maps / Wikimapia (6°52'26" S, 107°38'17" E)
const SCHOOL_LAT = -6.8739913;
const SCHOOL_LON = 107.6382024;
const SCHOOL_RADIUS = 50; // meters (tight radius - prevent cheating!)
const SCHOOL_NAME = 'Cendekia Leadership School';

// Global variables
let stream = null;
let currentPhoto = null;
let gpsData = null;

// DOM Elements
const satpamNameSelect = document.getElementById('satpamName');
const cameraSection = document.getElementById('cameraSection');
const previewSection = document.getElementById('previewSection');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const statusMessage = document.getElementById('statusMessage');
const startBtn = document.getElementById('startBtn');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const shareBtn = document.getElementById('shareBtn');

// Utility Functions
function showStatus(message, type = 'loading') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message show ${type}`;
}

function hideStatus() {
    statusMessage.className = 'status-message';
}

function generateReportId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `LAP-${dateStr}-${randomNum}`;
}

function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} - ${hours}:${minutes}:${seconds}`;
}

// Get GPS Location with Retry
async function getGPSLocation(retryCount = 0) {
    const MAX_RETRIES = GPS_MAX_RETRIES;
    
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('GPS tidak tersedia di perangkat ini'));
            return;
        }

        const attemptText = retryCount > 0 ? ` (percobaan ${retryCount + 1}/${MAX_RETRIES + 1})` : '';
        showStatus(`📍 Mengambil lokasi GPS${attemptText}...`, 'loading');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Validate accuracy - reject if too poor
                if (position.coords.accuracy > GPS_MAX_ACCURACY) {
                    console.warn(`GPS accuracy poor: ${position.coords.accuracy}m (max: ${GPS_MAX_ACCURACY}m)`);
                    if (retryCount < MAX_RETRIES) {
                        showStatus(`📍 Akurasi GPS kurang baik (${Math.round(position.coords.accuracy)}m), mencoba lagi...`, 'loading');
                        setTimeout(() => {
                            getGPSLocation(retryCount + 1).then(resolve).catch(reject);
                        }, 1000);
                        return;
                    }
                    // After all retries, still reject if too poor
                    reject(new Error(`Akurasi GPS terlalu buruk: ±${Math.round(position.coords.accuracy)}m (maks: ±${GPS_MAX_ACCURACY}m). Gunakan device dengan GPS yang lebih baik.`));
                    return;
                }
                
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                let errorMsg = 'Gagal mendapatkan lokasi GPS';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = 'Akses GPS ditolak. Mohon izinkan akses lokasi di pengaturan browser.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = 'Lokasi tidak tersedia. Pastikan GPS aktif dan Anda berada di area terbuka.';
                        break;
                    case error.TIMEOUT:
                        if (retryCount < MAX_RETRIES) {
                            // Retry on timeout
                            setTimeout(() => {
                                getGPSLocation(retryCount + 1).then(resolve).catch(reject);
                            }, 1000);
                            return;
                        }
                        errorMsg = 'Waktu habis saat mengambil lokasi. Pastikan GPS aktif dan coba lagi.';
                        break;
                }
                reject(new Error(errorMsg));
            },
            {
                enableHighAccuracy: true,
                timeout: GPS_TIMEOUT,
                maximumAge: 0 // Always get fresh location
            }
        );
    });
}

// Get Location Name from Nominatim - NO FALLBACK
async function getLocationName(lat, lon) {
    showStatus('🗺️ Mengambil nama lokasi...', 'loading');
    
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=id&zoom=18`,
        {
            headers: {
                'User-Agent': 'SatpamReporter-CendekiaLeadershipSchool/1.0 (Security App)'
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Gagal mengambil nama lokasi dari server (HTTP ${response.status}). Pastikan ada koneksi internet.`);
    }

    const data = await response.json();
    
    // NO FALLBACK - must get real location name
    if (!data || (!data.address && !data.display_name)) {
        throw new Error('Data lokasi tidak valid dari server. Coba lagi.');
    }
    
    let locationName = '';
    
    if (data.address) {
        // Priority: building > amenity > road > suburb > neighbourhood > village > town
        // We want building-level precision, avoid county (too generic)
        const parts = [];
        
        // Primary location (POI/building/street level) - MOST SPECIFIC
        const primary = data.address.amenity ||         // POI: NAMA SEKOLAH, kantor, dll (PRIORITAS!)
                       data.address.building ||         // Gedung/bangunan spesifik
                       data.address.house_name ||       // Nama rumah/bangunan
                       data.address.shop ||             // Nama toko
                       data.address.road ||             // Jalan
                       data.address.neighbourhood ||    // Lingkungan
                       data.address.suburb;             // Suburb/kelurahan
        
        if (primary) parts.push(primary);
        
        // Secondary location (city/village level) - AVOID COUNTY!
        const secondary = data.address.village ||
                         data.address.town ||
                         data.address.city ||
                         data.address.municipality;
        
        if (secondary) parts.push(secondary);
        
        if (parts.length > 0) {
            locationName = parts.join(', ');
        }
    }
    
    // If still empty, use display_name as last resort
    if (!locationName && data.display_name) {
        locationName = data.display_name.split(',').slice(0, 3).join(',').trim();
    }
    
    // Still empty? REJECT - no fake data
    if (!locationName || locationName.trim() === '') {
        throw new Error('Tidak dapat menentukan nama lokasi yang valid. Pastikan GPS lock baik dan ada koneksi internet.');
    }
    
    // ===== GEOFENCING VALIDATION - ALWAYS CHECK =====
    // Calculate distance from school center using Haversine approximation
    const distance = Math.sqrt(
        Math.pow((lat - SCHOOL_LAT) * 111000, 2) + 
        Math.pow((lon - SCHOOL_LON) * 111000 * Math.cos(lat * Math.PI / 180), 2)
    );
    
    console.log(`Geofencing check: ${distance.toFixed(1)}m from school center (max allowed: ${SCHOOL_RADIUS}m)`);
    
    // REJECT if outside school radius
    if (distance >= SCHOOL_RADIUS) {
        throw new Error(`❌ LOKASI DITOLAK!\n\nAnda berada ${Math.round(distance)}m dari ${SCHOOL_NAME}.\nFoto hanya bisa diambil dalam radius ${SCHOOL_RADIUS}m dari sekolah.\n\nSilakan datang ke sekolah terlebih dahulu.`);
    }
    
    // WITHIN school radius - check if location name is generic
    const firstPart = locationName.split(',')[0].trim();
    const genericTerms = ['Kabupaten', 'Kota', 'Provinsi'];
    const isOnlyCounty = genericTerms.some(term => firstPart.startsWith(term));
    
    if (isOnlyCounty) {
        // Override generic location with school name
        console.log(`Location too generic, using school name instead`);
        return SCHOOL_NAME;
    }

    return locationName.trim();
}

// Draw Watermark on Canvas
function drawWatermark(ctx, width, height, data) {
    const padding = 40;
    const boxPadding = 35;
    
    // === APP VERSION (pojok kiri atas) ===
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px Arial, sans-serif';
    
    // Shadow untuk readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = '#4CAF50'; // Green color untuk version
    ctx.fillText(`v${APP_VERSION}`, padding, padding + 25);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Split datetime into time and date
    const [dateStr, timeStr] = data.datetime.split(' - ');
    
    // === BOX UNTUK INFO DETAIL (kiri bawah) - LEBIH LEBAR ===
    const boxWidth = Math.min(width * 0.88, 800); // 88% width, max 800px (lebih luas!)
    const boxHeight = 320; // Lebih tinggi untuk accommodate long text
    const boxX = 0; // Mepet ke kiri
    const boxY = height - boxHeight; // Mepet ke bawah
    
    // Draw rounded box dengan shadow (LEBIH TRANSPARENT)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.60)'; // Lebih transparent (dari 0.85 ke 0.60)
    ctx.beginPath();
    // Rounded corner hanya kanan atas [top-left, top-right, bottom-right, bottom-left]
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, [0, 15, 0, 0]);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Red border at top of box
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, 6, [0, 15, 0, 0]);
    ctx.fill();
    
    // Content inside box (with breathing room)
    const innerPadding = 40; // Padding dalam box
    const maxTextWidth = boxWidth - innerPadding - 60; // Max width for text wrapping
    let yPos = boxY + 65; // Start position
    
    // TIME (LARGE)
    ctx.fillStyle = 'white';
    ctx.font = 'bold 56px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(timeStr, boxX + innerPadding, yPos);
    yPos += 54; // Spacing
    
    // DATE
    ctx.font = '26px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText(dateStr, boxX + innerPadding, yPos);
    yPos += 60; // Spacing
    
    // LOCATION with red pin - WITH TEXT WRAPPING
    const locationStartX = boxX + innerPadding;
    const locationTextX = locationStartX + 50;
    
    // Draw pin icon
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText('📍', locationStartX, yPos);
    
    // Draw location text with wrapping
    ctx.fillStyle = 'white';
    ctx.font = 'bold 26px Arial, sans-serif'; // Slightly smaller for long text
    
    // Word wrap function
    const words = data.location.split(' ');
    let line = '';
    const lineHeight = 32;
    let lineCount = 0;
    const maxLines = 2; // Max 2 lines for location
    
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxTextWidth - 50 && line !== '') {
            ctx.fillText(line.trim(), locationTextX, yPos + (lineCount * lineHeight));
            line = words[i] + ' ';
            lineCount++;
            if (lineCount >= maxLines) break; // Stop after max lines
        } else {
            line = testLine;
        }
    }
    
    // Draw last line (or only line if short)
    if (line.trim() !== '' && lineCount < maxLines) {
        ctx.fillText(line.trim(), locationTextX, yPos + (lineCount * lineHeight));
        lineCount++;
    }
    
    yPos += (lineCount * lineHeight) + 20; // Dynamic spacing based on lines used
    
    // GPS Coordinates + Accuracy
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`GPS: ${data.gps}`, locationTextX, yPos);
    
    // Accuracy indicator (show if available)
    if (data.accuracy) {
        yPos += 30;
        ctx.font = '19px Arial, sans-serif';
        ctx.fillStyle = 'rgba(76, 175, 80, 0.9)'; // Green for accuracy
        ctx.fillText(`Akurasi: ${data.accuracy}`, locationTextX, yPos);
    }
    
    // === NAMA SEKOLAH (pojok kanan atas) - TANPA BOX ===
    ctx.textAlign = 'right';
    ctx.font = 'bold 24px Arial, sans-serif';
    
    // Text shadow untuk readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = 'white';
    ctx.fillText('CENDEKIA LEADERSHIP SCHOOL', width - padding, padding + 30);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // === SATPAM & ID LAPORAN (pojok kanan bawah) - TANPA BOX ===
    ctx.textAlign = 'right';
    
    // Satpam name with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(`👤 ${data.satpam}`, width - padding, height - padding - 40);
    
    // Report ID below (green)
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText(`#${data.reportId}`, width - padding, height - padding - 10);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

// Start Camera (with GPS pre-check)
async function startCamera() {
    try {
        // Pre-check GPS availability before starting camera
        if (!navigator.geolocation) {
            showStatus('❌ GPS tidak tersedia di perangkat ini. Aplikasi membutuhkan GPS.', 'error');
            return;
        }
        
        showStatus('📷 Membuka kamera...', 'loading');
        
        const constraints = {
            video: {
                facingMode: { ideal: 'environment' }, // Back camera
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        cameraSection.style.display = 'block';
        previewSection.style.display = 'none';
        startBtn.style.display = 'none';
        captureBtn.style.display = 'block';
        retakeBtn.style.display = 'none';
        shareBtn.style.display = 'none';
        
        showStatus('💡 TIP: Pastikan GPS aktif sebelum mengambil foto', 'success');
        setTimeout(hideStatus, 3000);
    } catch (error) {
        console.error('Camera error:', error);
        let errorMsg = '❌ Gagal membuka kamera';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMsg = '❌ Izin kamera ditolak. Mohon izinkan akses kamera di pengaturan browser.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            errorMsg = '❌ Kamera tidak ditemukan di perangkat ini.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            errorMsg = '❌ Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain dan coba lagi.';
        }
        
        showStatus(errorMsg, 'error');
    }
}

// Stop Camera
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

// Capture Photo with Watermark
async function capturePhoto() {
    try {
        const satpamName = satpamNameSelect.value;
        if (!satpamName) {
            showStatus('❌ Pilih nama satpam terlebih dahulu', 'error');
            return;
        }

        // LANGKAH 1: Ambil foto dan freeze IMMEDIATELY (UX improvement)
        showStatus('📸 Foto diambil! Memproses...', 'loading');
        
        // Setup canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw video frame IMMEDIATELY
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Stop camera immediately for better UX
        stopCamera();
        
        // Show frozen photo immediately (without watermark yet)
        const frozenPhoto = canvas.toDataURL('image/jpeg', 0.9);
        preview.src = frozenPhoto;
        
        // Update UI - show preview immediately
        cameraSection.style.display = 'none';
        previewSection.style.display = 'block';
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'block';
        shareBtn.style.display = 'none'; // Hide until watermark ready
        
        // LANGKAH 2: Fetch GPS di background - STRICT MODE (NO FALLBACK)
        showStatus('📍 Mengambil informasi lokasi...', 'loading');
        
        try {
            // Get GPS location (with retry)
            gpsData = await getGPSLocation();
            
            // Get location name (NO FALLBACK - will throw error if fails)
            const locationName = await getLocationName(gpsData.lat, gpsData.lon);
            
            // LANGKAH 3: Draw watermark on the frozen photo
            // Re-draw the frozen photo
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Prepare watermark data
                const now = new Date();
                const watermarkData = {
                    datetime: formatDate(now),
                    location: locationName,
                    gps: `${gpsData.lat.toFixed(6)}, ${gpsData.lon.toFixed(6)}`,
                    accuracy: `±${Math.round(gpsData.accuracy)}m`,
                    satpam: satpamName,
                    reportId: generateReportId()
                };
                
                // Draw watermark
                drawWatermark(ctx, canvas.width, canvas.height, watermarkData);
                
                // Update with watermarked photo
                currentPhoto = canvas.toDataURL('image/jpeg', 0.9);
                preview.src = currentPhoto;
                
                // Show share button
                shareBtn.style.display = 'block';
                
                showStatus(`✓ Foto berhasil! GPS akurasi: ±${Math.round(gpsData.accuracy)}m`, 'success');
                setTimeout(hideStatus, 3000);
            };
            img.src = frozenPhoto;
            
        } catch (locationError) {
            // ❌ NO FALLBACK - GPS/Location FAILED = FOTO GAGAL TOTAL
            console.error('Location error:', locationError);
            
            // Clean up - restart camera
            currentPhoto = null;
            gpsData = null;
            
            showStatus(`❌ GAGAL: ${locationError.message}`, 'error');
            
            // Give user time to read error, then restart camera
            setTimeout(() => {
                startCamera();
            }, 5000);
            
            return; // Exit without saving photo
        }
        
    } catch (error) {
        console.error('Capture error:', error);
        showStatus(`❌ ${error.message}`, 'error');
        // Restart camera if capture fails
        startCamera();
    }
}

// Retake Photo
function retakePhoto() {
    currentPhoto = null;
    gpsData = null;
    startCamera();
}

// Share to WhatsApp
async function shareToWhatsApp() {
    try {
        if (!currentPhoto) {
            showStatus('❌ Tidak ada foto untuk dibagikan', 'error');
            return;
        }

        showStatus('📤 Mempersiapkan foto...', 'loading');

        // Convert base64 to blob
        const response = await fetch(currentPhoto);
        const blob = await response.blob();
        
        // Create file
        const fileName = `Laporan_Satpam_${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        // Check if Web Share API is supported
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Laporan Satpam',
                text: 'Laporan dari Cendekia Leadership School'
            });
            
            showStatus('✓ Foto berhasil dibagikan!', 'success');
            setTimeout(hideStatus, 3000);
        } else {
            // Fallback: download image
            const link = document.createElement('a');
            link.href = currentPhoto;
            link.download = fileName;
            link.click();
            
            showStatus('✓ Foto berhasil diunduh! Silakan kirim manual ke WhatsApp.', 'success');
        }
        
    } catch (error) {
        console.error('Share error:', error);
        if (error.name !== 'AbortError') {
            showStatus('❌ Gagal membagikan foto', 'error');
        } else {
            hideStatus();
        }
    }
}

// Event Listeners
startBtn.addEventListener('click', () => {
    const satpamName = satpamNameSelect.value;
    if (!satpamName) {
        showStatus('❌ Pilih nama satpam terlebih dahulu', 'error');
        setTimeout(hideStatus, 3000);
        return;
    }
    startCamera();
});

captureBtn.addEventListener('click', capturePhoto);
retakeBtn.addEventListener('click', retakePhoto);
shareBtn.addEventListener('click', shareToWhatsApp);

// Auto-start camera on page load
window.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure everything is ready
    setTimeout(() => {
        const satpamName = satpamNameSelect.value;
        if (satpamName) {
            // If satpam already selected, start camera immediately
            startCamera();
        } else {
            // Show tip to select satpam first
            showStatus('👤 Pilih nama satpam untuk memulai', 'loading');
            
            // Auto-start when satpam selected
            satpamNameSelect.addEventListener('change', function autoStart() {
                if (satpamNameSelect.value) {
                    hideStatus();
                    setTimeout(() => {
                        startCamera();
                    }, 300);
                }
            }, { once: true });
        }
    }, 300);
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Check for updates
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });
}
