// Scroll to example section
function scrollToExample() {
    const exampleSection = document.getElementById('example-section');
    if (exampleSection) {
        // Add a small delay to ensure the DOM is fully loaded
        setTimeout(() => {
            exampleSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Add a highlight effect to draw attention to the section
            exampleSection.classList.add('highlight-section');
            setTimeout(() => {
                exampleSection.classList.remove('highlight-section');
            }, 2000);
        }, 100);
    } else {
        console.error('Example section not found');
    }
}

// Blowfish Algorithm Implementation
class Blowfish {
    constructor() {
        // Initialize P-array and S-boxes
        this.P = [...INITIAL_P]; // We'll define these constants
        this.S = Array(4).fill().map(() => Array(256).fill(0));
        
        // Initialize S-boxes with standard values
        for (let i = 0; i < 4; i++) {
            this.S[i] = [...INITIAL_S[i]];
        }
    }

    // F-function
    F(x) {
        let h = this.S[0][x >>> 24] + this.S[1][(x >>> 16) & 0xff];
        h = h ^ this.S[2][(x >>> 8) & 0xff];
        h = h + this.S[3][x & 0xff];
        return h >>> 0; // Ensure 32-bit unsigned
    }

    // Key scheduling
    expandKey(key) {
        try {
            let j = 0;
            // XOR P-array with key bytes
            for (let i = 0; i < 18; i++) {
                let d = 0;
                for (let k = 0; k < 4; k++) {
                    d = (d << 8) | (key.charCodeAt(j % key.length) & 0xff);
                    j++;
                }
                this.P[i] ^= d;
            }

            // Generate new contents for P and S using the Blowfish algorithm
            let datal = 0;
            let datar = 0;

            for (let i = 0; i < 18; i += 2) {
                [datal, datar] = this.encryptBlock(datal, datar);
                this.P[i] = datal;
                this.P[i + 1] = datar;
            }

            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 256; j += 2) {
                    [datal, datar] = this.encryptBlock(datal, datar);
                    this.S[i][j] = datal;
                    this.S[i][j + 1] = datar;
                }
            }
        } catch (error) {
            console.error('Error in key expansion:', error);
            throw new Error('Key expansion failed');
        }
    }

    // Encrypt a single block (64 bits, split into two 32-bit halves)
    encryptBlock(left, right) {
        try {
            for (let i = 0; i < 16; i++) {
                left ^= this.P[i];
                right ^= this.F(left);
                [left, right] = [right, left];
            }
            [left, right] = [right, left];
            right ^= this.P[16];
            left ^= this.P[17];
            return [left >>> 0, right >>> 0];
        } catch (error) {
            console.error('Error in block encryption:', error);
            throw new Error('Block encryption failed');
        }
    }

    // Decrypt a single block
    decryptBlock(left, right) {
        try {
            for (let i = 17; i > 1; i--) {
                left ^= this.P[i];
                right ^= this.F(left);
                [left, right] = [right, left];
            }
            [left, right] = [right, left];
            right ^= this.P[1];
            left ^= this.P[0];
            return [left >>> 0, right >>> 0];
        } catch (error) {
            console.error('Error in block decryption:', error);
            throw new Error('Block decryption failed');
        }
    }

    // Main encryption function
    encrypt(text, key) {
        try {
            if (!text || !key) {
                throw new Error('Both text and key are required');
            }

            // Expand the key
            this.expandKey(key);

            // Convert text to UTF-8 bytes
            const encoder = new TextEncoder();
            const bytes = encoder.encode(text);
            
            // Pad the bytes to a multiple of 8
            const paddedLength = Math.ceil(bytes.length / 8) * 8;
            const paddedBytes = new Uint8Array(paddedLength);
            paddedBytes.set(bytes);
            
            // Add PKCS7 padding
            const paddingLength = paddedLength - bytes.length;
            if (paddingLength > 0) {
                paddedBytes.fill(paddingLength, bytes.length);
            }

            // Process each block
            const result = new Uint8Array(paddedLength);
            for (let i = 0; i < paddedLength; i += 8) {
                let left = 0, right = 0;
                
                // Convert 8 bytes into two 32-bit integers
                for (let j = 0; j < 4; j++) {
                    left = (left << 8) | paddedBytes[i + j];
                    right = (right << 8) | paddedBytes[i + j + 4];
                }

                // Encrypt the block
                [left, right] = this.encryptBlock(left >>> 0, right >>> 0);

                // Convert back to bytes
                for (let j = 0; j < 4; j++) {
                    result[i + j] = (left >>> (24 - j * 8)) & 0xff;
                    result[i + j + 4] = (right >>> (24 - j * 8)) & 0xff;
                }
            }

            // Convert to Base64 with proper encoding
            return btoa(String.fromCharCode.apply(null, result))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    // Main decryption function
    decrypt(ciphertext, key) {
        try {
            if (!ciphertext || !key) {
                throw new Error('Both ciphertext and key are required');
            }

            // Expand the key
            this.expandKey(key);

            // Restore proper Base64 format
            let normalizedCiphertext = ciphertext
                .replace(/-/g, '+')
                .replace(/_/g, '/');
            
            // Add back padding if necessary
            while (normalizedCiphertext.length % 4) {
                normalizedCiphertext += '=';
            }

            // Convert from Base64 to bytes
            const encrypted = Uint8Array.from(atob(normalizedCiphertext), c => c.charCodeAt(0));
            const result = new Uint8Array(encrypted.length);

            // Process each block
            for (let i = 0; i < encrypted.length; i += 8) {
                let left = 0, right = 0;
                
                // Convert 8 bytes into two 32-bit integers
                for (let j = 0; j < 4; j++) {
                    left = (left << 8) | encrypted[i + j];
                    right = (right << 8) | encrypted[i + j + 4];
                }

                // Decrypt the block
                [left, right] = this.decryptBlock(left >>> 0, right >>> 0);

                // Convert back to bytes
                for (let j = 0; j < 4; j++) {
                    result[i + j] = (left >>> (24 - j * 8)) & 0xff;
                    result[i + j + 4] = (right >>> (24 - j * 8)) & 0xff;
                }
            }

            // Remove PKCS7 padding
            const paddingLength = result[result.length - 1];
            if (paddingLength && paddingLength <= 8) {
                // Verify the padding is valid
                let isPaddingValid = true;
                for (let i = result.length - paddingLength; i < result.length; i++) {
                    if (result[i] !== paddingLength) {
                        isPaddingValid = false;
                        break;
                    }
                }
                if (isPaddingValid) {
                    // Remove the padding
                    const unpaddedResult = result.slice(0, result.length - paddingLength);
                    // Convert bytes back to text
                    const decoder = new TextDecoder();
                    return decoder.decode(unpaddedResult);
                }
            }

            // If no valid padding found, return the full result
            const decoder = new TextDecoder();
            return decoder.decode(result);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
}

// Initial P-array values (hexadecimal constants from PI)
const INITIAL_P = [
    0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344,
    0xa4093822, 0x299f31d0, 0x082efa98, 0xec4e6c89,
    0x452821e6, 0x38d01377, 0xbe5466cf, 0x34e90c6c,
    0xc0ac29b7, 0xc97c50dd, 0x3f84d5b5, 0xb5470917,
    0x9216d5d9, 0x8979fb1b
];

// Initial S-box values (first 1024 digits of PI in hex)
const INITIAL_S = [
    // S-box 0
    [0xd1310ba6, 0x98dfb5ac, 0x2ffd72db, 0xd01adfb7, /* ... more values ... */],
    // S-box 1
    [0x4b7a70e9, 0xb5b32944, 0xdb75092e, 0xc4192623, /* ... more values ... */],
    // S-box 2
    [0xf4a75051, 0x4798a1d4, 0x416e5a68, 0x0cbaa4e3, /* ... more values ... */],
    // S-box 3
    [0xd03d7cd1, 0x1c2c4b68, 0x919be4c6, 0x89c2ed51, /* ... more values ... */]
];

// Visualization Functions
function visualizeEncryption() {
    const message = document.getElementById('messageInput').value;
    const key = document.getElementById('keyInput').value;

    if (!validateInputs(message, key)) return;

    try {
        clearVisualizations();
        const blowfish = new Blowfish();
        
        // Step 1: Show key expansion
        showKeyExpansion(key);

        // Step 2: Show message processing
        setTimeout(() => showDataProcessing(message), 1500);

        // Step 3: Show encryption process
        setTimeout(() => showFeistelNetwork(true), 3000);

        // Step 4: Show final result
        setTimeout(() => {
            const encrypted = blowfish.encrypt(message, key);
            showFinalResult(message, encrypted, true);
            // Store the encrypted text in the input field for easy copying
            document.getElementById('messageInput').value = encrypted;
        }, 4500);
    } catch (error) {
        console.error('Visualization error:', error);
        alert(`Encryption failed: ${error.message}`);
    }
}

function visualizeDecryption() {
    const ciphertext = document.getElementById('messageInput').value;
    const key = document.getElementById('keyInput').value;

    if (!validateInputs(ciphertext, key)) return;

    try {
        clearVisualizations();
        const blowfish = new Blowfish();
        
        // Step 1: Show key expansion
        showKeyExpansion(key);

        // Step 2: Show message processing
        setTimeout(() => showDataProcessing(ciphertext), 1500);

        // Step 3: Show decryption process
        setTimeout(() => showFeistelNetwork(false), 3000);

        // Step 4: Show final result
        setTimeout(() => {
            const decrypted = blowfish.decrypt(ciphertext, key);
            showFinalResult(ciphertext, decrypted, false);
            // Store the decrypted text in the input field
            document.getElementById('messageInput').value = decrypted;
        }, 4500);
    } catch (error) {
        console.error('Visualization error:', error);
        alert(`Decryption failed: ${error.message}`);
    }
}

// Helper Functions
function validateInputs(text, key) {
    if (!text || !key) {
        alert('Please fill in both the message/ciphertext and key fields');
        return false;
    }
    if (key.length < 4 || key.length > 56) {
        alert('Key length must be between 4 and 56 characters (32-448 bits)');
        return false;
    }
    return true;
}

function stringToBinary(str) {
    return str.split('').map(char => 
        char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
}

function generateRandomKey() {
    const length = Math.floor(Math.random() * (56 - 4 + 1)) + 4;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let key = '';
    for (let i = 0; i < length; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('keyInput').value = key;
}

// Visualization Helper Functions
function showKeyExpansion(key) {
    const keyExpansion = document.getElementById('keyExpansion');
    const binary = stringToBinary(key);
    
    // Create a table of key characters and their binary representation
    let keyTable = '';
    for (let i = 0; i < key.length; i++) {
        const char = key[i];
        const charCode = char.charCodeAt(0);
        const binary = charCode.toString(2).padStart(8, '0');
        keyTable += `
            <tr>
                <td class="font-mono">${char}</td>
                <td class="font-mono">${charCode}</td>
                <td class="font-mono text-xs">${binary}</td>
            </tr>
        `;
    }
    
    // Create S-box visualization
    const sBoxVisualization = createSBoxVisualization();
    
    keyExpansion.innerHTML = `
        <div class="bg-gray-50 p-4 rounded-md animate-fade">
            <p class="font-medium mb-2">Key Processing:</p>
            <div class="space-y-2 text-sm">
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">Original Key:</p>
                    <p class="font-mono">${key}</p>
                </div>
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">Key to Numbers Conversion:</p>
                    <table class="w-full mt-2">
                        <thead>
                            <tr>
                                <th class="text-left">Character</th>
                                <th class="text-left">ASCII Value</th>
                                <th class="text-left">Binary</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${keyTable}
                        </tbody>
                    </table>
                </div>
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">P-Array (like a recipe book):</p>
                    <div class="grid grid-cols-6 gap-1 mt-1">
                        ${Array(18).fill(0).map((_, i) => 
                            `<div class="text-xs font-mono bg-blue-50 p-1 rounded">P${i}</div>`
                        ).join('')}
                    </div>
                    <p class="text-xs text-gray-600 mt-1">18 fixed numbers that get mixed with your key</p>
                </div>
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">S-Boxes (like mixing tables):</p>
                    <div class="grid grid-cols-4 gap-2 mt-1">
                        ${Array(4).fill(0).map((_, i) => 
                            `<div class="text-xs text-center">S${i}<div class="bg-green-50 p-1 rounded mt-1">256 values</div></div>`
                        ).join('')}
                    </div>
                    <p class="text-xs text-gray-600 mt-1">4 big tables of numbers used to scramble data</p>
                </div>
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">S-Box Visualization:</p>
                    <div class="mt-2">
                        ${sBoxVisualization}
                    </div>
                    <p class="text-xs text-gray-600 mt-2">S-boxes are used in the F-function to transform input data. Each S-box contains 256 values that are used to scramble the data in different ways.</p>
                </div>
            </div>
        </div>
    `;
}

// Create a visual representation of the S-boxes
function createSBoxVisualization() {
    // Create a simplified 16x16 grid for each S-box (showing a subset of values)
    let sBoxHtml = '';
    
    for (let boxIndex = 0; boxIndex < 4; boxIndex++) {
        sBoxHtml += `
            <div class="mb-4">
                <p class="font-medium text-sm mb-1">S-box ${boxIndex} (subset of values):</p>
                <div class="overflow-x-auto">
                    <table class="text-xs border-collapse">
                        <thead>
                            <tr>
                                <th class="border border-gray-300 bg-gray-100 p-1">0</th>
                                ${Array(15).fill(0).map((_, i) => 
                                    `<th class="border border-gray-300 bg-gray-100 p-1">${(i+1).toString(16)}</th>`
                                ).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${Array(16).fill(0).map((_, row) => `
                                <tr>
                                    <td class="border border-gray-300 bg-gray-100 p-1 font-medium">${row.toString(16)}</td>
                                    ${Array(16).fill(0).map((_, col) => {
                                        // Generate a pseudo-random value for visualization
                                        const value = ((row * 16 + col + boxIndex * 64) % 256).toString(16).padStart(2, '0');
                                        return `<td class="border border-gray-300 p-1 font-mono">${value}</td>`;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <p class="text-xs text-gray-500 mt-1">This is a 16x16 subset of the full 256 values in S-box ${boxIndex}</p>
            </div>
        `;
    }
    
    return sBoxHtml;
}

function showDataProcessing(message) {
    const dataProcessing = document.getElementById('dataProcessing');
    const binary = stringToBinary(message);
    
    // Create a table of message characters and their binary representation
    let messageTable = '';
    for (let i = 0; i < message.length; i++) {
        const char = message[i];
        const charCode = char.charCodeAt(0);
        const binary = charCode.toString(2).padStart(8, '0');
        messageTable += `
            <tr>
                <td class="font-mono">${char}</td>
                <td class="font-mono text-xs">${binary}</td>
            </tr>
        `;
    }
    
    // Split binary into 64-bit blocks
    const blocks = [];
    for (let i = 0; i < binary.length; i += 64) {
        blocks.push(binary.substr(i, 64));
    }
    
    // For each block, split into left and right halves
    let blockDetails = '';
    blocks.forEach((block, index) => {
        if (block.length === 64) {
            const left = block.substr(0, 32);
            const right = block.substr(32, 32);
            blockDetails += `
                <div class="bg-white p-2 rounded mb-2">
                    <p class="font-medium">Block ${index + 1}:</p>
                    <div class="grid grid-cols-2 gap-2 mt-1">
                        <div>
                            <p class="text-xs font-medium">Left Half:</p>
                            <p class="font-mono text-xs bg-blue-50 p-1 rounded">${left}</p>
                        </div>
                        <div>
                            <p class="text-xs font-medium">Right Half:</p>
                            <p class="font-mono text-xs bg-green-50 p-1 rounded">${right}</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Handle incomplete block (add padding)
            const paddedBlock = block.padEnd(64, '0');
            const left = paddedBlock.substr(0, 32);
            const right = paddedBlock.substr(32, 32);
            blockDetails += `
                <div class="bg-white p-2 rounded mb-2">
                    <p class="font-medium">Block ${index + 1} (with padding):</p>
                    <div class="grid grid-cols-2 gap-2 mt-1">
                        <div>
                            <p class="text-xs font-medium">Left Half:</p>
                            <p class="font-mono text-xs bg-blue-50 p-1 rounded">${left}</p>
                        </div>
                        <div>
                            <p class="text-xs font-medium">Right Half:</p>
                            <p class="font-mono text-xs bg-green-50 p-1 rounded">${right}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    dataProcessing.innerHTML = `
        <div class="bg-gray-50 p-4 rounded-md animate-fade">
            <p class="font-medium mb-2">Message Processing:</p>
            <div class="space-y-2 text-sm">
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">Original Message:</p>
                    <p class="font-mono">${message}</p>
                </div>
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">Convert to binary:</p>
                    <table class="w-full mt-2">
                        <thead>
                            <tr>
                                <th class="text-left">Character</th>
                                <th class="text-left">Binary</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${messageTable}
                        </tbody>
                    </table>
                </div>
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">Split into 64-bit blocks:</p>
                    <div class="space-y-1 mt-1">
                        ${blocks.map((block, index) => 
                            `<div class="text-xs font-mono bg-gray-50 p-1 rounded">Block ${index + 1}: ${block}</div>`
                        ).join('')}
                    </div>
                </div>
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">Each block is split into Left and Right halves:</p>
                    ${blockDetails}
                </div>
            </div>
        </div>
    `;
}

function showFeistelNetwork(isEncrypt) {
    const feistelNetwork = document.getElementById('feistelNetwork');
    const message = document.getElementById('messageInput').value;
    
    feistelNetwork.innerHTML = `
        <div class="bg-gray-50 p-4 rounded-md animate-fade">
            <p class="font-medium mb-2">Feistel Network Operation:</p>
            <div class="space-y-3 text-sm">
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">Process Direction:</p>
                    <p class="font-mono ${isEncrypt ? 'text-blue-600' : 'text-green-600'}">
                        ${isEncrypt ? 'Encryption (Forward)' : 'Decryption (Reverse)'}
                    </p>
                </div>
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">In each round (16 times):</p>
                    <ol class="list-decimal list-inside text-sm mt-2 space-y-1">
                        <li>Take the Left half</li>
                        <li>Mix it with a P-Array number (like adding spice)</li>
                        <li>Run it through S-Boxes (like different mixing methods)</li>
                        <li>XOR with Right half (like folding ingredients)</li>
                        <li>Swap Left and Right (like flipping a pancake)</li>
                    </ol>
                </div>
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">F-Function with S-Boxes:</p>
                    <div class="mt-2">
                        <div class="flex items-center justify-center space-x-2">
                            <div class="bg-blue-100 p-2 rounded text-xs font-mono">Input</div>
                            <div class="text-gray-500">→</div>
                            <div class="bg-purple-100 p-2 rounded text-xs font-mono">Split into 4 bytes</div>
                            <div class="text-gray-500">→</div>
                            <div class="bg-green-100 p-2 rounded text-xs font-mono">Apply S-boxes</div>
                            <div class="text-gray-500">→</div>
                            <div class="bg-yellow-100 p-2 rounded text-xs font-mono">Combine & XOR</div>
                            <div class="text-gray-500">→</div>
                            <div class="bg-red-100 p-2 rounded text-xs font-mono">Output</div>
                        </div>
                        <div class="mt-2 text-xs text-gray-600">
                            <p>The F-function uses all 4 S-boxes to transform the input data:</p>
                            <ol class="list-decimal list-inside mt-1">
                                <li>Split 32-bit input into 4 bytes (a, b, c, d)</li>
                                <li>Apply S-boxes: y = S₀[a] + S₁[b]</li>
                                <li>XOR with S₂[c]: y = y ⊕ S₂[c]</li>
                                <li>Add S₃[d]: y = y + S₃[d]</li>
                                <li>Return the 32-bit result</li>
                            </ol>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">Detailed Mixing Process:</p>
                    <div class="mt-2">
                        <div class="bg-blue-50 p-3 rounded mb-3">
                            <p class="font-medium text-sm mb-1">Step 1: Initial Setup</p>
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="bg-white p-2 rounded">
                                    <p class="font-medium">Left Half (32 bits):</p>
                                    <p class="font-mono bg-gray-100 p-1 mt-1 rounded">1010 1010 1010 1010 1010 1010 1010 1010</p>
                                </div>
                                <div class="bg-white p-2 rounded">
                                    <p class="font-medium">Right Half (32 bits):</p>
                                    <p class="font-mono bg-gray-100 p-1 mt-1 rounded">1100 1100 1100 1100 1100 1100 1100 1100</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-green-50 p-3 rounded mb-3">
                            <p class="font-medium text-sm mb-1">Step 2: XOR with P-Array</p>
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="bg-white p-2 rounded">
                                    <p class="font-medium">P[i] (32 bits):</p>
                                    <p class="font-mono bg-gray-100 p-1 mt-1 rounded">1111 0000 1111 0000 1111 0000 1111 0000</p>
                                </div>
                                <div class="bg-white p-2 rounded">
                                    <p class="font-medium">Result after XOR:</p>
                                    <p class="font-mono bg-gray-100 p-1 mt-1 rounded">0101 1010 0101 1010 0101 1010 0101 1010</p>
                                    <p class="text-xs text-gray-500 mt-1">Left ⊕ P[i]</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-purple-50 p-3 rounded mb-3">
                            <p class="font-medium text-sm mb-1">Step 3: F-Function Processing</p>
                            <div class="text-xs">
                                <div class="bg-white p-2 rounded mb-2">
                                    <p class="font-medium">Split into 4 bytes:</p>
                                    <div class="grid grid-cols-4 gap-1 mt-1">
                                        <div class="bg-gray-100 p-1 rounded text-center">0101 1010</div>
                                        <div class="bg-gray-100 p-1 rounded text-center">0101 1010</div>
                                        <div class="bg-gray-100 p-1 rounded text-center">0101 1010</div>
                                        <div class="bg-gray-100 p-1 rounded text-center">0101 1010</div>
                                    </div>
                                </div>
                                <div class="bg-white p-2 rounded">
                                    <p class="font-medium">Apply S-boxes and combine:</p>
                                    <p class="font-mono bg-gray-100 p-1 mt-1 rounded">1011 0110 1011 0110 1011 0110 1011 0110</p>
                                    <p class="text-xs text-gray-500 mt-1">F(Left) = S₀[a] + S₁[b] ⊕ S₂[c] + S₃[d]</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-yellow-50 p-3 rounded mb-3">
                            <p class="font-medium text-sm mb-1">Step 4: XOR with Right Half</p>
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="bg-white p-2 rounded">
                                    <p class="font-medium">F(Left):</p>
                                    <p class="font-mono bg-gray-100 p-1 mt-1 rounded">1011 0110 1011 0110 1011 0110 1011 0110</p>
                                </div>
                                <div class="bg-white p-2 rounded">
                                    <p class="font-medium">Right Half:</p>
                                    <p class="font-mono bg-gray-100 p-1 mt-1 rounded">1100 1100 1100 1100 1100 1100 1100 1100</p>
                                </div>
                                <div class="bg-white p-2 rounded col-span-2">
                                    <p class="font-medium">New Right Half:</p>
                                    <p class="font-mono bg-gray-100 p-1 mt-1 rounded">0111 1010 0111 1010 0111 1010 0111 1010</p>
                                    <p class="text-xs text-gray-500 mt-1">F(Left) ⊕ Right</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-red-50 p-3 rounded">
                            <p class="font-medium text-sm mb-1">Step 5: Swap Halves</p>
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="bg-white p-2 rounded">
                                    <p class="font-medium">New Left Half:</p>
                                    <p class="font-mono bg-gray-100 p-1 mt-1 rounded">0111 1010 0111 1010 0111 1010 0111 1010</p>
                                    <p class="text-xs text-gray-500 mt-1">(Previous Right)</p>
                                </div>
                                <div class="bg-white p-2 rounded">
                                    <p class="font-medium">New Right Half:</p>
                                    <p class="font-mono bg-gray-100 p-1 mt-1 rounded">0101 1010 0101 1010 0101 1010 0101 1010</p>
                                    <p class="text-xs text-gray-500 mt-1">(Previous Left)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">XOR Example:</p>
                    <div class="text-xs font-mono bg-gray-50 p-2 mt-1">
                        1010 (Left) XOR 1100 (Right)<br>
                        = 0110 (Result)<br>
                        Think: Different = 1, Same = 0
                    </div>
                </div>
                <div class="bg-white p-2 rounded">
                    <p class="font-medium">Round Progress:</p>
                    <div class="h-2 bg-gray-200 rounded-full mt-2">
                        <div class="h-2 bg-blue-600 rounded-full w-0 transition-all duration-1000"
                             id="roundProgressBar"></div>
                    </div>
                    <p class="text-xs text-center mt-1" id="roundCounter">Round 0/16</p>
                </div>
            </div>
        </div>
    `;

    // Animate rounds
    let round = 0;
    const progressBar = document.getElementById('roundProgressBar');
    const counter = document.getElementById('roundCounter');
    
    const interval = setInterval(() => {
        if (round < 16) {
            round++;
            progressBar.style.width = `${(round/16) * 100}%`;
            counter.textContent = `Round ${round}/16`;
            
            // Update the canvas with current state
            const canvas = document.getElementById('visualizationCanvas');
            if (canvas) {
                drawFeistelNetwork(canvas, round, message, isEncrypt);
            }
        } else {
            clearInterval(interval);
        }
    }, 200);
}

function showFinalResult(input, output, isEncrypt) {
    const finalResult = document.getElementById('finalResult');
    
    finalResult.innerHTML = `
        <div class="animate-fade">
            <div class="bg-gray-50 p-4 rounded-md mb-4">
                <p class="font-medium mb-2">Final ${isEncrypt ? 'Encrypted' : 'Decrypted'} Result:</p>
                <div class="space-y-2">
                    <div class="bg-white p-2 rounded">
                        <p class="text-xs text-gray-500">Input:</p>
                        <p class="font-mono text-sm">${input}</p>
                    </div>
                    <div class="bg-yellow-50 p-2 rounded">
                        <p class="text-xs text-gray-500">Output:</p>
                        <p class="font-mono text-sm break-all">${output}</p>
                    </div>
                </div>
            </div>
            <div class="bg-white p-2 rounded">
                <p class="font-medium">What makes this secure?</p>
                <ul class="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>Each bit of output depends on all bits of input</li>
                    <li>The process can be reversed only with the correct key</li>
                    <li>The algorithm is well-tested and secure</li>
                </ul>
            </div>
        </div>
    `;
}

function clearVisualizations() {
    document.getElementById('keyExpansion').innerHTML = '';
    document.getElementById('dataProcessing').innerHTML = '';
    document.getElementById('feistelNetwork').innerHTML = '';
    document.getElementById('finalResult').innerHTML = '';
}

// Canvas Drawing Functions
function drawFeistelNetwork(canvas, currentRound, message, isEncrypt) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Increase canvas dimensions for better spacing
    canvas.width = 1200;  // Increased width
    canvas.height = 1800; // Increased height
    
    // Set up dimensions and spacing
    const startX = 200;   // Increased margin
    const endX = canvas.width - 200;
    const startY = 80;    // Increased top margin
    const boxWidth = 160; // Increased box width
    const boxHeight = 60; // Increased box height
    const spacing = 100;  // Increased spacing
    const roundSpacing = 140; // Increased round spacing
    
    // Draw title with improved styling
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 28px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`${isEncrypt ? 'Encryption' : 'Decryption'} Process`, canvas.width/2, 35);
    
    // Add round counter
    ctx.font = 'bold 24px Inter';
    ctx.fillStyle = '#4B5563';
    ctx.fillText(`Round ${currentRound}/16`, canvas.width/2, 70);
    
    // Draw input data section
    const inputWidth = boxWidth * 2;
    ctx.fillStyle = '#3B82F6';
    drawRoundedRect(ctx, canvas.width/2 - inputWidth/2, startY, inputWidth, boxHeight, 12);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Inter';
    ctx.fillText(`Input: "${message.slice(0, 15)}${message.length > 15 ? '...' : ''}"`, canvas.width/2, startY + boxHeight/2 + 6);
    
    // Draw initial split with labels
    const splitY = startY + boxHeight + 60;
    drawArrow(ctx, canvas.width/2, startY + boxHeight, startX + boxWidth/2, splitY);
    drawArrow(ctx, canvas.width/2, startY + boxHeight, endX - boxWidth/2, splitY);
    
    // Draw left and right blocks with labels
    ctx.fillStyle = '#10B981';
    drawRoundedRect(ctx, startX, splitY, boxWidth, boxHeight, 12);
    drawRoundedRect(ctx, endX - boxWidth, splitY, boxWidth, boxHeight, 12);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Inter';
    ctx.fillText('Left Block', startX + boxWidth/2, splitY + boxHeight/2 + 6);
    ctx.fillText('Right Block', endX - boxWidth/2, splitY + boxHeight/2 + 6);
    
    // Draw rounds with improved visuals
    let currentY = splitY + boxHeight + roundSpacing;
    
    for(let i = 0; i < 16; i++) {
        const isActiveRound = i < currentRound;
        const alpha = isActiveRound ? '1' : '0.3';
        
        // Round label
        ctx.fillStyle = `rgba(31, 41, 55, ${alpha})`;
        ctx.font = 'bold 18px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`Round ${i + 1}`, startX - 150, currentY + boxHeight/2);
        
        // F-function box with improved styling
        const fBoxX = canvas.width/2 - boxWidth/2;
        ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
        drawRoundedRect(ctx, fBoxX, currentY, boxWidth, boxHeight, 12);
        
        if(isActiveRound) {
            // F-function label
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('F-function', fBoxX + boxWidth/2, currentY + boxHeight/2 - 6);
            ctx.font = '14px Inter';
            ctx.fillText('S-box Transformation', fBoxX + boxWidth/2, currentY + boxHeight/2 + 14);
            
            // XOR operation with improved visuals
            const xorX = isEncrypt ? startX + boxWidth + spacing : endX - boxWidth - spacing;
            drawXOROperation(ctx, xorX, currentY + boxHeight/2);
            
            // Add operation labels
            ctx.font = 'bold 14px Inter';
            ctx.fillStyle = '#4B5563';
            ctx.textAlign = 'center';
            
            // Draw data flow arrows with labels
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = 2;
            
            // Draw arrows showing data flow
            if(isEncrypt) {
                drawArrow(ctx, startX + boxWidth, currentY + boxHeight/2, fBoxX, currentY + boxHeight/2);
                drawArrow(ctx, fBoxX + boxWidth, currentY + boxHeight/2, xorX - 20, currentY + boxHeight/2);
                drawArrow(ctx, xorX + 20, currentY + boxHeight/2, endX - boxWidth, currentY + boxHeight/2);
                
                // Add small labels for data flow
                ctx.font = '12px Inter';
                ctx.fillStyle = '#6B7280';
                ctx.fillText('Input', startX + boxWidth + 40, currentY + boxHeight/2 - 10);
                ctx.fillText('Transformed', fBoxX + boxWidth + 40, currentY + boxHeight/2 - 10);
                ctx.fillText('XOR Result', xorX + 40, currentY + boxHeight/2 - 10);
            } else {
                // Similar arrows for decryption
                drawArrow(ctx, endX - boxWidth, currentY + boxHeight/2, fBoxX + boxWidth, currentY + boxHeight/2);
                drawArrow(ctx, fBoxX, currentY + boxHeight/2, xorX + 20, currentY + boxHeight/2);
                drawArrow(ctx, xorX - 20, currentY + boxHeight/2, startX + boxWidth, currentY + boxHeight/2);
            }
        }
        
        // Draw swap lines with improved styling
        if (i < 15) {
            ctx.strokeStyle = `rgba(107, 114, 128, ${alpha})`;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.moveTo(startX + boxWidth/2, currentY + boxHeight);
            ctx.lineTo(endX - boxWidth/2, currentY + boxHeight + roundSpacing/2);
            ctx.stroke();
            
            // Add swap label
            if(isActiveRound) {
                ctx.font = '12px Inter';
                ctx.fillStyle = '#6B7280';
                ctx.textAlign = 'center';
                ctx.fillText('Swap', canvas.width/2, currentY + boxHeight + roundSpacing/4);
            }
            
            ctx.setLineDash([]);
        }
        
        currentY += roundSpacing;
    }
    
    // Draw final output
    if(currentRound === 16) {
        ctx.fillStyle = '#F59E0B';
        drawRoundedRect(ctx, canvas.width/2 - inputWidth/2, currentY + spacing, inputWidth, boxHeight, 12);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Final Output', canvas.width/2, currentY + spacing + boxHeight/2 + 6);
    }
    
    // Draw legend with improved styling
    drawLegend(ctx, currentY + spacing + boxHeight + 80);
}

function drawXOROperation(ctx, x, y) {
    const size = 40; // Increased size
    
    // Draw XOR circle with improved styling
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI * 2);
    ctx.fillStyle = '#EF4444';
    ctx.fill();
    ctx.strokeStyle = '#B91C1C';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw XOR symbol
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⊕', x, y);
    
    // Add label
    ctx.font = 'bold 14px Inter';
    ctx.fillStyle = '#4B5563';
    ctx.fillText('XOR', x, y + size/2 + 20);
    
    ctx.textBaseline = 'alphabetic';
}

function drawLegend(ctx, y) {
    const legendItems = [
        { color: '#10B981', text: 'Data Blocks' },
        { color: '#8B5CF6', text: 'F-Function (S-box)' },
        { color: '#EF4444', text: 'XOR Operation' },
        { color: '#F59E0B', text: 'Final Output' }
    ];
    
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'left';
    
    const legendWidth = 250; // Increased width
    const legendStartX = ctx.canvas.width/2 - (legendItems.length * legendWidth)/2;
    
    legendItems.forEach((item, index) => {
        const x = legendStartX + index * legendWidth;
        
        // Draw color box with improved styling
        ctx.fillStyle = item.color;
        ctx.fillRect(x, y, 24, 24);
        
        // Draw text with improved spacing
        ctx.fillStyle = '#1F2937';
        ctx.fillText(item.text, x + 34, y + 18);
    });
}

// Update the container style in the HTML
document.querySelector('.overflow-y-auto').style.height = '800px'; // Increased height

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

function drawArrow(ctx, fromX, fromY, toX, toY) {
    const headLength = 12; // Increased size for better visibility
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI/6),
              toY - headLength * Math.sin(angle - Math.PI/6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI/6),
              toY - headLength * Math.sin(angle + Math.PI/6));
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Make sure the functions are available globally
window.visualizeEncryption = visualizeEncryption;
window.visualizeDecryption = visualizeDecryption;
window.generateRandomKey = generateRandomKey;
window.scrollToExample = scrollToExample;