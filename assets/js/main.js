const SESSION_ID = Date.now();
const spectrumColors = ['#0055AA', '#E6332A', '#FFD700', '#00BFFF'];

/**
 * Selects a random color from the spectrumColors array.
 * @returns {string} A hexadecimal color string.
 */
function getRandomSpectrumColor() {
    const randomIndex = Math.floor(Math.random() * spectrumColors.length);
    return spectrumColors[randomIndex];
}

function getRandomPieceIndex() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    const totalPieces = pieces.length;
    console.log('Total pieces available:', totalPieces);

    // Returns a random integer between 0 and totalPieces - 1
    return Math.floor(Math.random() * totalPieces);
}

/**
 * Fetches the list of spectrum images from the PHP API
 * @returns {Promise<Array>} A promise that resolves to an array of filenames
 */
/**
 * Fetches the list of spectrum images.
 * Switches between PHP API (local/server) and a static JSON file (GitHub Pages).
 * @returns {Promise<Array>} A promise that resolves to an array of filenames.
 */
async function fetchSpectrumFiles() {
    // Detect if the environment is GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    // Choose the endpoint based on the environment
    const endpoint = isGitHubPages 
        ? 'api/spectrumbp-files.json' 
        : 'api/spectrumbp-get-images.php';

    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);

        const fileList = await response.json();
        return fileList;
    } catch (error) {
        console.error('Error fetching file list:', error);
        return [];
    }
}

/**
 * Injects SVG patterns for each image found in the spectrum folder.
 * Now uses a fixed pixel size based on an actual puzzle piece measurement.
 * @param {Array} files Array of image filenames.
 */
function setupImagePatterns(files) {
    const svg = document.querySelector('#puzzle-svg');
    if (!svg || !files.length) return;

    // Select a reference piece to measure the real size in the browser
    const referencePiece = document.querySelector('.puzzle-piece');
    let targetWidth = "60";
    let targetHeight = "60";

    if (referencePiece) {
        /** * getBoundingClientRect provides the actual pixel dimensions 
         * as rendered on the user's screen.
         */
        const rect = referencePiece.getBoundingClientRect();
        targetWidth = `${Math.ceil(rect.width)}px`;
        targetHeight = `${Math.ceil(rect.height)}px`;
        console.log(`Dynamic pattern size set to: ${targetWidth} x ${targetHeight}`);
    }

    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.prepend(defs);
    }

    files.forEach((file, index) => {
        const patternId = `img-pattern-${index}`;

        const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
        pattern.setAttribute("id", patternId);

        /** * We keep objectBoundingBox for the pattern container, 
         * but we will force the image inside to the calculated pixel size.
         */
        pattern.setAttribute("patternUnits", "objectBoundingBox");
        pattern.setAttribute("width", "1");
        pattern.setAttribute("height", "1");

        const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
        image.setAttributeNS("http://www.w3.org/1999/xlink", "href", `assets/img/spectrumbp/${file}?v=${SESSION_ID}`);

        // Applying the fixed pixel sizes derived from the DOM measurement
        image.setAttribute("width", targetWidth);
        image.setAttribute("height", targetHeight);

        image.setAttribute("preserveAspectRatio", "xMidYMid slice");

        pattern.appendChild(image);
        defs.appendChild(pattern);
    });

    console.log(`${files.length} fixed-size patterns injected.`);
}

/**
 * Animates a single random puzzle piece from opacity 0 to 1.
 */
function animatePieceFadeIn() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    const randomIndex = getRandomPieceIndex();
    const targetPiece = pieces[randomIndex];

    if (targetPiece) {
        targetPiece.style.transition = 'opacity 1.5s ease-in-out';
        targetPiece.style.opacity = '1';

        setTimeout(() => {
            targetPiece.style.opacity = '0';
        }, 3000);
    }
}

/**
 * Animates a single random puzzle piece by applying a spectrum color pulse class.
 */
function animateColorSpectrum() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    const randomIndex = getRandomPieceIndex();
    const targetPiece = pieces[randomIndex];

    if (targetPiece) {
        const vel = ['slow', 'medium', 'fast'];
        const colors = ['blue', 'red', 'yellow', 'cyan'];

        const sortVel = vel[Math.floor(Math.random() * vel.length)];
        const sortColor = colors[Math.floor(Math.random() * colors.length)];
        const newClass = `pulse-${sortVel}-${sortColor}`;

        const originalClasses = ['pulse-slow', 'pulse-medium', 'pulse-fast'];
        const activeOriginalClass = originalClasses.find(cls => targetPiece.classList.contains(cls));

        if (activeOriginalClass) {
            targetPiece.classList.remove(activeOriginalClass);
        }

        targetPiece.classList.add(newClass);

        setTimeout(() => {
            targetPiece.classList.remove(newClass);
            if (activeOriginalClass) {
                targetPiece.classList.add(activeOriginalClass);
            }
        }, 5000);
    }
}

/**
 * Enhanced animatePhotoSpectrum to neutralize piece rotation.
 * Updated to remove deprecated webkitTransform and focus on standard transform.
 */
function animatePhotoSpectrum() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    const randomIndex = getRandomPieceIndex();
    const targetPiece = pieces[randomIndex];

    // Select all available patterns injected in <defs>
    const patterns = document.querySelectorAll('#puzzle-svg defs pattern');

    if (targetPiece && patterns.length > 0) {
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        const patternId = randomPattern.getAttribute('id');

        // Extract rotation using the standard transform property
        const style = window.getComputedStyle(targetPiece);
        const transform = style.transform;
        let angle = 0;

        // Check if a transformation matrix exists
        if (transform && transform !== 'none') {
            const values = transform.split('(')[1].split(')')[0].split(',');
            const a = values[0]; // cos(theta)
            const b = values[1]; // sin(theta)
            // Calculate angle in degrees
            angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        }

        // Apply inverse rotation to the pattern so the image remains upright
        randomPattern.setAttribute("patternTransform", `rotate(${-angle})`);

        // Store original state to restore later
        const originalClasses = ['pulse-slow', 'pulse-medium', 'pulse-fast'];
        const activeOriginalClass = originalClasses.find(cls => targetPiece.classList.contains(cls));

        // Remove pulse animations to avoid visual conflicts
        originalClasses.forEach(cls => targetPiece.classList.remove(cls));

        // Apply the pattern via fill attribute
        targetPiece.style.fill = `url(#${patternId})`;
        targetPiece.style.transition = 'fill 1.0s ease-in-out';

        // Revert to original state after 6 seconds
        setTimeout(() => {
            targetPiece.style.fill = '';

            // Clean up the pattern transform for reuse
            randomPattern.removeAttribute("patternTransform");

            if (activeOriginalClass) {
                targetPiece.classList.add(activeOriginalClass);
            }
        }, 6000);
    }
}

/**
 * Distributes animation classes to puzzle pieces in equal quarters.
 */
function distributeAnimationClasses() {
    const allPaths = document.querySelectorAll('#puzzle-svg path');
    allPaths.forEach(path => path.classList.add('puzzle-piece'));

    const pieces = Array.from(document.querySelectorAll('.puzzle-piece'));
    const total = pieces.length;
    const quarter = Math.floor(total / 4);

    const shuffledPieces = pieces.sort(() => 0.5 - Math.random());

    for (let i = 0; i < total; i++) {
        if (i < quarter) {
            shuffledPieces[i].classList.add('pulse-slow');
        } else if (i < quarter * 2) {
            shuffledPieces[i].classList.add('pulse-medium');
        } else if (i < quarter * 3) {
            shuffledPieces[i].classList.add('pulse-fast');
        }
    }
}

function startPuzzleAnimation() {
    console.log('SVG injected and ready for animation.');
    distributeAnimationClasses();
    animatePieceFadeIn();
    for (let i = 0; i < 30; i++) {
        animateColorSpectrum();
    }
    for (let i = 0; i < 5; i++) {
        animatePhotoSpectrum();
    }


    // Load files and setup patterns before starting the interval
    fetchSpectrumFiles().then(files => {
        if (files.length > 0) {
            setupImagePatterns(files);
        }
    });

    setInterval(() => {
        const choice = Math.random();

        // Balanced distribution (approx. 33% each)
        if (choice < 0.16) {
            // console.log('Triggering: FadeIn');
            animatePieceFadeIn();
        } else if (choice < 0.42) {
            console.log('Triggering: ColorSpectrum');
            for (let i = 0; i < 30; i++) {
                animateColorSpectrum();
            }
        } else {
            console.log('Triggering: PhotoSpectrum');
            for (let i = 0; i < 15; i++) {
                animatePhotoSpectrum();
            }
        }
    }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('background-false');

    const svgPath = window.innerWidth > 768
        ? 'assets/svg/puzzle-desktop.svg'
        : 'assets/svg/puzzle-mobile.svg';

    fetch(svgPath)
        .then(response => response.text())
        .then(svgData => {
            container.innerHTML = svgData;

            const svgElement = container.querySelector('svg');
            if (svgElement) {
                svgElement.setAttribute('id', 'puzzle-svg');
                svgElement.setAttribute('preserveAspectRatio', 'xMidYMid slice');
                startPuzzleAnimation();
            }
        })
        .catch(error => console.error('Error loading the puzzle:', error));
});