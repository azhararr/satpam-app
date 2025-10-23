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

// Get GPS Location
async function getGPSLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('GPS tidak tersedia di perangkat ini'));
            return;
        }

        showStatus('📍 Mengambil lokasi GPS...', 'loading');

        navigator.geolocation.getCurrentPosition(
            (position) => {
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
                        errorMsg = 'Akses GPS ditolak. Mohon izinkan akses lokasi.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = 'Lokasi tidak tersedia. Pastikan GPS aktif.';
                        break;
                    case error.TIMEOUT:
                        errorMsg = 'Waktu habis saat mengambil lokasi.';
                        break;
                }
                reject(new Error(errorMsg));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Get Location Name from Nominatim
async function getLocationName(lat, lon) {
    try {
        showStatus('🗺️ Mengambil nama lokasi...', 'loading');
        
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=id`,
            {
                headers: {
                    'User-Agent': 'SatpamReporter/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Gagal mengambil nama lokasi');
        }

        const data = await response.json();
        
        // Try to get the most relevant location name
        let locationName = 'Lokasi tidak diketahui';
        
        if (data.address) {
            // Priority: amenity (POI) > building > road > suburb > village
            locationName = data.address.amenity || 
                          data.address.building ||
                          data.address.road ||
                          data.address.suburb ||
                          data.address.village ||
                          data.address.city ||
                          'Cendekia Leadership School';
            
            // Add city/region for context
            if (data.address.city || data.address.town) {
                locationName += `, ${data.address.city || data.address.town}`;
            }
        } else if (data.display_name) {
            // Fallback to display_name (first part)
            locationName = data.display_name.split(',').slice(0, 2).join(',');
        }

        return locationName;
    } catch (error) {
        console.error('Error getting location name:', error);
        // Fallback to school name
        return 'Cendekia Leadership School';
    }
}

// Draw Watermark on Canvas
function drawWatermark(ctx, width, height, data) {
    // Detect orientation
    const isLandscape = width > height;
    
    // Responsive sizing based on orientation
    const scale = isLandscape ? Math.min(height / 1080, 1) : Math.min(width / 1080, 1);
    const padding = Math.round(40 * scale);
    
    // Split datetime into time and date
    const [dateStr, timeStr] = data.datetime.split(' - ');
    
    // === BOX UNTUK INFO DETAIL (kiri bawah) ===
    // Di landscape: box lebih kecil proporsinya
    const boxWidthRatio = isLandscape ? 0.5 : 0.75;
    const boxHeightRatio = isLandscape ? 0.35 : 0.26;
    
    const boxWidth = Math.round(Math.min(width * boxWidthRatio, 650 * scale));
    const boxHeight = Math.round(Math.min(height * boxHeightRatio, 280 * scale));
    const boxX = 0; // Mepet ke kiri
    const boxY = height - boxHeight; // Mepet ke bawah
    
    // Draw rounded box dengan shadow (LEBIH TRANSPARENT)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = Math.round(20 * scale);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(8 * scale);
    
    const cornerRadius = Math.round(15 * scale);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.60)'; // Lebih transparent (dari 0.85 ke 0.60)
    ctx.beginPath();
    // Rounded corner hanya kanan atas [top-left, top-right, bottom-right, bottom-left]
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, [0, cornerRadius, 0, 0]);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Red border at top of box
    const borderHeight = Math.round(6 * scale);
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, borderHeight, [0, cornerRadius, 0, 0]);
    ctx.fill();
    
    // Content inside box - responsive font sizes
    const innerPadding = Math.round(45 * scale);
    const topSpacing = Math.round(70 * scale);
    let yPos = boxY + topSpacing;
    
    // Responsive font sizes
    const timeFontSize = Math.round(60 * scale);
    const dateFontSize = Math.round(28 * scale);
    const pinFontSize = Math.round(36 * scale);
    const locationFontSize = Math.round(30 * scale);
    const gpsFontSize = Math.round(22 * scale);
    const pinOffset = Math.round(50 * scale);
    
    // TIME (VERY LARGE)
    ctx.fillStyle = 'white';
    ctx.font = `bold ${timeFontSize}px Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(timeStr, boxX + innerPadding, yPos);
    yPos += Math.round(58 * scale);
    
    // DATE
    ctx.font = `${dateFontSize}px Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText(dateStr, boxX + innerPadding, yPos);
    yPos += Math.round(65 * scale);
    
    // LOCATION with red pin
    ctx.fillStyle = '#e74c3c';
    ctx.font = `bold ${pinFontSize}px Arial, sans-serif`;
    ctx.fillText('📍', boxX + innerPadding, yPos);
    
    ctx.fillStyle = 'white';
    ctx.font = `bold ${locationFontSize}px Arial, sans-serif`;
    ctx.fillText(data.location, boxX + innerPadding + pinOffset, yPos);
    yPos += Math.round(50 * scale);
    
    // GPS Coordinates
    ctx.font = `${gpsFontSize}px Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`GPS: ${data.gps}`, boxX + innerPadding + pinOffset, yPos);
    
    // === NAMA SEKOLAH (pojok kanan atas) - TANPA BOX ===
    const schoolFontSize = Math.round(24 * scale);
    const satpamFontSize = Math.round(26 * scale);
    const reportFontSize = Math.round(24 * scale);
    
    ctx.textAlign = 'right';
    ctx.font = `bold ${schoolFontSize}px Arial, sans-serif`;
    
    // Text shadow untuk readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = Math.round(10 * scale);
    ctx.shadowOffsetX = Math.round(2 * scale);
    ctx.shadowOffsetY = Math.round(2 * scale);
    
    ctx.fillStyle = 'white';
    ctx.fillText('CENDEKIA LEADERSHIP SCHOOL', width - padding, padding + Math.round(30 * scale));
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // === SATPAM & ID LAPORAN (pojok kanan bawah) - TANPA BOX ===
    ctx.textAlign = 'right';
    
    // Satpam name with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = Math.round(10 * scale);
    ctx.shadowOffsetX = Math.round(2 * scale);
    ctx.shadowOffsetY = Math.round(2 * scale);
    
    ctx.font = `bold ${satpamFontSize}px Arial, sans-serif`;
    ctx.fillStyle = 'white';
    ctx.fillText(`👤 ${data.satpam}`, width - padding, height - padding - Math.round(40 * scale));
    
    // Report ID below (green)
    ctx.font = `bold ${reportFontSize}px Arial, sans-serif`;
    ctx.fillStyle = '#4CAF50';
    ctx.fillText(`#${data.reportId}`, width - padding, height - padding - Math.round(10 * scale));
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

// Start Camera
async function startCamera() {
    try {
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
        
        hideStatus();
    } catch (error) {
        console.error('Camera error:', error);
        showStatus('❌ Gagal membuka kamera. Pastikan izin kamera diberikan.', 'error');
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
        
        // LANGKAH 2: Fetch GPS di background
        showStatus('📍 Menambahkan informasi lokasi...', 'loading');
        
        try {
            // Get GPS location
            gpsData = await getGPSLocation();
            
            // Get location name
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
                
                showStatus('✓ Foto berhasil diambil dengan informasi lengkap!', 'success');
                setTimeout(hideStatus, 3000);
            };
            img.src = frozenPhoto;
            
        } catch (gpsError) {
            // If GPS fails, still allow sharing with basic info
            console.error('GPS error:', gpsError);
            
            // Draw watermark with basic info (no GPS)
            const now = new Date();
            const watermarkData = {
                datetime: formatDate(now),
                location: 'Cendekia Leadership School',
                gps: 'Lokasi tidak tersedia',
                satpam: satpamName,
                reportId: generateReportId()
            };
            
            // Re-draw frozen photo with watermark
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                drawWatermark(ctx, canvas.width, canvas.height, watermarkData);
                
                currentPhoto = canvas.toDataURL('image/jpeg', 0.9);
                preview.src = currentPhoto;
                
                shareBtn.style.display = 'block';
                
                showStatus('⚠️ Foto diambil tanpa GPS (izinkan akses lokasi untuk GPS)', 'error');
                setTimeout(hideStatus, 4000);
            };
            img.src = frozenPhoto;
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
        return;
    }
    startCamera();
});

captureBtn.addEventListener('click', capturePhoto);
retakeBtn.addEventListener('click', retakePhoto);
shareBtn.addEventListener('click', shareToWhatsApp);

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
