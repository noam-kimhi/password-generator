// ==============================
// --- DOM Elements ---
// ==============================
const passwordElement = document.getElementById("password");
const showPasswordButton = document.getElementById("show-password");
const lengthNumber = document.getElementById("length-number");
const lengthSlider = document.getElementById("length-slider");

const includeLowercaseElement = document.getElementById("IncludeLowercase");
const includeUppercaseElement = document.getElementById("IncludeUppercase");
const includeNumbersElement = document.getElementById("IncludeNumbers");
const includeSymbolsElement = document.getElementById("IncludeSymbols");
const form = document.querySelector("form");

// ==============================
// --- State Variables ---
// ==============================
let actualPassword = "";       // stores the generated password
let passwordVisible = false;   // tracks visibility state
showPasswordButton.classList.add("off");

// ==============================
// --- Sync slider and number input ---
// Ensures changes in one input reflect in the other
// ==============================
// Keep slider and number input in sync while typing
lengthNumber.addEventListener("input", () => {
    lengthSlider.value = lengthNumber.value;
});

lengthSlider.addEventListener("input", () => {
    lengthNumber.value = lengthSlider.value;
});

// Clamp number only when user leaves the input (blur)
lengthNumber.addEventListener("blur", () => {
    let val = parseInt(lengthNumber.value);
    if (isNaN(val)) val = 6; // default
    if (val < 4) val = 4;
    if (val > 25) val = 25;
    lengthNumber.value = val;
    lengthSlider.value = val;
});

// ==============================
// --- Validation ---
// Check if at least one character type is selected
// ==============================

/**
 * Checks if at least one character type is selected.
 * @returns {boolean}
 */
function validOption() {
    const selected = includeLowercaseElement.checked || includeUppercaseElement.checked ||
                     includeNumbersElement.checked || includeSymbolsElement.checked;
    if (!selected) {
        actualPassword = "";
        passwordElement.textContent = "Select at least one character type.";
        passwordElement.style.color = "#a83b3bff";
        passwordElement.style.fontStyle = "normal";
        passwordElement.style.fontSize = "22px";
        return false;
    }
    return true;
}

// ==============================
// --- Generate password ---
// Validates options, creates password, and animates masked display
// ==============================

/**
 * Generates a random password based on user-selected criteria.
 * @returns {Promise<void>}
 */
async function generatePassword() {
    if (!validOption()) return;

    const length = parseInt(lengthNumber.value);
    const includeLowercase = includeLowercaseElement.checked;
    const includeUppercase = includeUppercaseElement.checked;
    const includeNumbers = includeNumbersElement.checked;
    const includeSymbols = includeSymbolsElement.checked;

    actualPassword = createPassword(length, includeLowercase, includeUppercase, includeNumbers, includeSymbols);
    
    // Reset styles
    passwordVisible = false;
    passwordElement.style.color = "";
    passwordElement.style.fontStyle = "";
    passwordElement.style.fontSize = "";

    await animatePasswordDisplay(actualPassword, "*");

    // Reset visibility button
    showPasswordButton.classList.remove("on");
    showPasswordButton.classList.add("off");
}

// ==============================
// --- Animate masked password ---
// Display password as random characters before showing masked version
// ==============================

/**
 * Animates the display of the password by showing random characters before revealing the actual password.
 * @param {string} password - The actual password to display.
 * @param {string} maskChar - The character used to mask the password.
 */
async function animatePasswordDisplay(password, maskChar) {
    passwordElement.textContent = "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

    for (let i = 0; i < password.length; i++) {
        let displayed = "";

        // Masked characters up to current index
        for (let j = 0; j <= i; j++) displayed += maskChar;

        // Random characters for the rest
        for (let k = i + 1; k < password.length; k++) {
            displayed += chars[Math.floor(Math.random() * chars.length)];
        }

        passwordElement.textContent = displayed;
        await sleep(75);  // animation speed
    }

    passwordElement.textContent = maskChar.repeat(password.length);
}

// ==============================
// --- Utility ---
// Sleep for async animations
// ==============================

/**
 * Sleeps for a specified duration.
 * @param {number} ms - The duration to sleep in milliseconds.
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==============================
// --- Create password ---
// Generate password based on selected options
// ==============================

/**
 * Generates a random password based on user-selected criteria.
 * @param {number} length - The length of the password.
 * @param {boolean} includeLowercase - Whether to include lowercase letters.
 * @param {boolean} includeUppercase - Whether to include uppercase letters.
 * @param {boolean} includeNumbers - Whether to include numbers.
 * @param {boolean} includeSymbols - Whether to include symbols.
 * @returns {string} - The generated password.
 */
function createPassword(length, includeLowercase, includeUppercase, includeNumbers, includeSymbols) {
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*_";

    let validChars = "";
    let requiredChars = [];

    // Ensure at least one character of each selected type
    if (includeLowercase) {
        validChars += lowercaseChars;
        requiredChars.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]);
    }
    if (includeUppercase) {
        validChars += uppercaseChars;
        requiredChars.push(uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]);
    }
    if (includeNumbers) {
        validChars += numberChars;
        requiredChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
    }
    if (includeSymbols) {
        validChars += symbolChars;
        requiredChars.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
    }

    // Fill remaining length
    let passwordArray = requiredChars;
    for (let i = requiredChars.length; i < length; i++) {
        passwordArray.push(validChars[Math.floor(Math.random() * validChars.length)]);
    }

    // Shuffle password for randomness
    for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }

    return passwordArray.join("");
}

// ==============================
// --- Copy to clipboard ---
// ==============================
/**
 * Copies the generated password to the clipboard.
 * @returns {Promise<void>}
 */
function copyPassword() {
    if (!actualPassword) return;
    return navigator.clipboard.writeText(actualPassword).then(() => showMessage("Password copied to clipboard"));
}

// ==============================
// --- Show temporary message ---
// Displays confirmation message for a short time
// ==============================

/**
 * Shows a temporary message on the screen.
 * @param {string} text - The message text to display.
 * @param {number} duration - The duration to display the message (in milliseconds).
 */
function showMessage(text, duration = 3000) {
    const msg = document.getElementById("copied-message");
    msg.textContent = text;
    msg.classList.add("show");
    setTimeout(() => msg.classList.remove("show"), duration);
}

// ==============================
// --- Toggle password visibility ---
// ==============================
/**
 * Toggles the visibility of the generated password.
 * @param {Event} event - The event object.
 * @returns {void}
 */
function togglePasswordVisibility(event) {
    event.preventDefault();
    if (!actualPassword) return;

    passwordVisible = !passwordVisible;
    if (passwordVisible) {
        passwordElement.textContent = actualPassword;
        showPasswordButton.classList.replace("off", "on");
    } else {
        passwordElement.textContent = "*".repeat(actualPassword.length);
        showPasswordButton.classList.replace("on", "off");
    }
}

// Add event listener for the visibility button
showPasswordButton.addEventListener("click", togglePasswordVisibility);

// ==============================
// --- Lock icon toggling for checkboxes ---
// Changes lock icon based on checkbox state
// ==============================
const lockCheckboxes = document.querySelectorAll('.checkbox-label input[type="checkbox"]');

lockCheckboxes.forEach(cb => {
    const lockIcon = cb.nextElementSibling; // assumes <img> follows input

    // Initialize icon
    lockIcon.src = cb.checked ? 'images/locked.png' : 'images/unlocked.png';

    // Update icon when checkbox changes
    cb.addEventListener('change', () => {
        lockIcon.src = cb.checked ? 'images/locked.png' : 'images/unlocked.png';
    });

    // Toggle checkbox when clicking the icon
    lockIcon.addEventListener('click', (e) => {
        e.preventDefault();
        cb.checked = !cb.checked;
        lockIcon.src = cb.checked ? 'images/locked.png' : 'images/unlocked.png';
    });
});
