Array.prototype.rotate = (function() {
  // save references to array functions to make lookup faster
  var push = Array.prototype.push,
      splice = Array.prototype.splice;

  return function(count) {
      var len = this.length >>> 0, // convert to uint
          count = count >> 0; // convert to int

      // convert count to value in range [0, len)
      count = ((count % len) + len) % len;

      // use splice.call() instead of this.splice() to make function generic
      push.apply(this, splice.call(this, 0, count));
      return this;
  };
})();

//gives padded binary string matrix from decimal matrix
function dec2binMatrix(arr) {
  let newarr = [];

  for(let i=0; i<arr.length; i++) {
    newarr[i] = [];
    for(let j=0; j<arr.length; j++) {
      const bin = dec2bin(arr[i][j]);
      let padding = '';
      for(let k=0; k<(8-bin.length); k++) {
        padding += '0';
      }
      newarr[i][j] = padding + bin;
    }
  }

  return newarr;
}

//b matrix should be binary string
function matrixMultiply(m1, m2) {
  var result = [];
  for (var i = 0; i < m1.length; i++) {
    result[i] = [];
    for (var j = 0; j < m2[0].length; j++) {
        var sum = 0;
        for (var k = 0; k < m1[0].length; k++) {
            const m2_val = parseInt(m2[k][j], 2);
            const multiplied = GFmultiply(m1[i][k], m2_val, 8);
            sum ^= parseInt(multiplied,2);
        }
        result[i][j] = sum;
    }
  }
  result = dec2binMatrix(result);
  return result;
}

function dec2bin(dec){
  return (dec >>> 0).toString(2);
}

function sbox(row, col) {
  const sbox = [[99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118],[202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192],[183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21],[4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117],[9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132],[83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207],[208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168],[81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210],[205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115],[96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219],[224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121],[231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8],[186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138],[112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158],[225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223],[140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22]];

  let bin = dec2bin(sbox[row][col]);
  let padding = '';
  for(let k=0; k<(8-bin.length); k++) {
    padding += '0';
  }
  return (padding+bin);
}

//takes string and gives 4x4 matrix with binary in strings, if no string then plain matrix
function get4x4matrix(str) {
  //creating matrix
  let arr = [];
  for(let i=0; i<4; i++) {
    arr[i] = [];
    for(let j=0; j<4; j++) {
      arr[i][j] = '00000000';
    }
  }

  if(str) {
    //adding string into input matrix
    for(let i=0, ctr=0; i<4; i++) {
      for(let j=0; j<4; j++) {
        if(ctr < str.length) {
          const bin = dec2bin(str.charCodeAt(ctr));
          let padding = "";
          for(let k=0; k<(8-bin.length); k++) {
            padding += '0';
          }
          arr[j][i] = padding + bin;
        }
        ctr++;
      }
    }
  }

  return arr;
}

// takes a key and gives next key
function getNextKey(key, round) {
  let lastCol = [];
  const roundConstant = [];

  const rc = [1,2,4,8,16,32,64,128,27,54];

  //making roundConstant
  roundConstant[0] = rc[round-1];
  for(let i=1; i<4; i++) {
    roundConstant[i] = 0;
  }

  for(let i=0; i<4; i++) {
    lastCol.push(key[i][3]);
  }
  lastCol.rotate(1);

  //substituting that col, and xor'ing with round constant
  for(let i=0; i<4; i++) {
    const first4 = lastCol[i].substring(0,4);
    const last4 = lastCol[i].substring(4);
    const row = parseInt(first4, 2);
    const col = parseInt(last4, 2);
    let valFromSbox = parseInt(sbox(row,col), 2);
    lastCol[i] = valFromSbox ^ roundConstant[i];
  }

  //for name sake...
  const theCol = lastCol;

  let nextKey = get4x4matrix();

  //xoring theCol with key cols, and updating theCol after each col
  for(let i=0; i<4; i++) {
    for(let j=0; j<4; j++) {
      const keyVal_ji = parseInt(key[j][i], 2);
      nextKey[j][i] = keyVal_ji ^ theCol[j];
      theCol[j] = nextKey[j][i];
    }
  }

  //converting nextKey matrix from decimal to padded binary
  nextKey = dec2binMatrix(nextKey);

  return nextKey;
}

function addRoundKey(arr, key) {

  let newarr = get4x4matrix();

  for(let i=0; i<4; i++) {
    for(let j=0; j<4; j++) {
      const val1 = parseInt(arr[j][i],2);
      const val2 = parseInt(key[j][i], 2);
      const xored = val1 ^ val2;
      const bin = dec2bin(xored);
      let padding = "";
      for(let k=0; k<(8-bin.length); k++) {
        padding += '0';
      }
      newarr[j][i] = padding + bin;
    }
  }

  return newarr;
}

function substituteBytes(arr) {
  let newarr = get4x4matrix();
  for(let i=0; i<4; i++) {
    for(let j=0; j<4; j++) {
      const bin = arr[j][i];
      const first4 = bin.substring(0,4);
      const last4 = bin.substring(4);
      const row = parseInt(first4, 2);
      const col = parseInt(last4, 2);
      newarr[j][i] = sbox(row,col);
    }
  }
  return newarr;
}

function shiftRows(arr) {
  for(let i=0; i<4; i++) {
    arr[i].rotate(i);
  }
  return arr;
}

function mixColumns(arr) {
  const mix_col_matrix = [[2,3,1,1], [1,2,3,1], [1,1,2,3], [3,1,1,2]];
  return matrixMultiply(mix_col_matrix, arr);
}

function printHexTable(arr) {
  let newarr = getHexTable(arr);
  console.table(newarr);
}

function getHexTable(arr) {
  let newarr = [];
  for(let i=0; i<arr.length; i++) {
    newarr[i] = [];
    for(let j=0; j<arr[i].length; j++) {
      let dec = parseInt(arr[i][j],2);
      let hex = dec.toString(16);
      if(hex.length == 1) hex = '0' + hex;
      hex = hex.toUpperCase();
      newarr[i][j] = hex;
    }
  }
  return newarr;
}

function aes_init() {
  const plain_text = document.querySelector("#plain_text").value;
  const ikey = document.querySelector("#key").value;

  if(plain_text.length == 0 || ikey.length == 0) {
    alert('enter something');
    return;
  }

  let input = get4x4matrix(plain_text); //input matrix
  let key = get4x4matrix(ikey); //key matrix
  let state_arr = input; // Keep track of current state

  const stepsBox = document.querySelector("#results-container");
  stepsBox.innerHTML = '';

  stepsBox.innerHTML += "<h2> ROUND : "+ 0 +"</h2> <br>";

  stepsBox.innerHTML += "Input:";
  stepsBox.appendChild(createTable(getHexTable(input)));
  stepsBox.innerHTML += "<br>";

  stepsBox.innerHTML += "Key:";
  stepsBox.appendChild(createTable(getHexTable(key)));
  stepsBox.innerHTML += "<br>";

  //ADD ROUND KEY - 0
  state_arr = addRoundKey(input, key);

  stepsBox.innerHTML += "Add round key:";
  stepsBox.appendChild(createTable(getHexTable(state_arr)));
  stepsBox.innerHTML += "<br>";
  
  // Add explanation for initial AddRoundKey with actual values
  stepsBox.innerHTML += createTransformationExplanation("addRoundKey", 0, input, key, state_arr);

  const TOTAL_ROUNDS = 10;
  round = 1;

  while(round <= TOTAL_ROUNDS) {
    stepsBox.innerHTML += "<hr><br>"
    stepsBox.innerHTML += "<h2> ROUND : "+round+"</h2> <br>";

    //SUBSTITUTION BYTES
    let beforeSubBytes = [...state_arr];
    state_arr = substituteBytes(state_arr);

    stepsBox.innerHTML += "Substitution bytes:";
    stepsBox.appendChild(createTable(getHexTable(state_arr)));
    stepsBox.innerHTML += "<br>";
    
    // Add explanation for SubBytes with actual values
    stepsBox.innerHTML += createTransformationExplanation("subBytes", round, beforeSubBytes, null, state_arr);

    //SHIFT ROWS
    let beforeShiftRows = [...state_arr];
    state_arr = shiftRows(state_arr);

    stepsBox.innerHTML += "Shift rows:";
    stepsBox.appendChild(createTable(getHexTable(state_arr)));
    stepsBox.innerHTML += "<br>";
    
    // Add explanation for ShiftRows with actual values
    stepsBox.innerHTML += createTransformationExplanation("shiftRows", round, beforeShiftRows, null, state_arr);

    //MIX COLUMNS
    if(round != 10) {
      let beforeMixColumns = [...state_arr];
      state_arr = mixColumns(state_arr);
      stepsBox.innerHTML += "Mix columns:";
      stepsBox.appendChild(createTable(getHexTable(state_arr)));
      stepsBox.innerHTML += "<br>";
      
      // Add explanation for MixColumns with actual values
      stepsBox.innerHTML += createTransformationExplanation("mixColumns", round, beforeMixColumns, null, state_arr);
    }

    //GENERATING NEW KEY
    key = getNextKey(key , round);
    stepsBox.innerHTML += "This round key:";
    stepsBox.appendChild(createTable(getHexTable(key)));
    stepsBox.innerHTML += "<br>";

    //ADD ROUND KEY
    let beforeAddRoundKey = [...state_arr];
    state_arr = addRoundKey(state_arr, key);
    stepsBox.innerHTML += "Add round key:";
    stepsBox.appendChild(createTable(getHexTable(state_arr)));
    stepsBox.innerHTML += "<br>";
    
    // Add explanation for AddRoundKey with actual values
    stepsBox.innerHTML += createTransformationExplanation("addRoundKey", round, beforeAddRoundKey, key, state_arr);

    round++;
  }

  const resultBox = document.querySelector("#resultbox");
  resultBox.innerHTML = 'Final result: <br><br>';
  resultBox.appendChild(createTable(getHexTable(state_arr)));
}

// Function to create detailed explanations for each transformation
function createTransformationExplanation(transformation, round, beforeState, key, afterState) {
  let explanation = '';
  
  switch(transformation) {
    case "subBytes":
      // Find first non-zero byte that changed for the example
      let exampleByte = '';
      let exampleResult = '';
      let exampleRow = '';
      let exampleCol = '';
      
      for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
          const beforeHex = parseInt(beforeState[j][i], 2).toString(16).toUpperCase().padStart(2, '0');
          const afterHex = parseInt(afterState[j][i], 2).toString(16).toUpperCase().padStart(2, '0');
          if(beforeHex !== afterHex) {
            exampleByte = beforeHex;
            exampleResult = afterHex;
            exampleRow = beforeHex[0];
            exampleCol = beforeHex[1];
            break;
          }
        }
        if(exampleByte) break;
      }

      explanation = `
        <div class="transformation-explanation bg-white p-4 rounded-lg shadow-md mt-4 mb-4">
          <h3 class="text-lg font-bold mb-2">SubBytes Transformation (Round ${round})</h3>
          <div class="space-y-2">
            <p class="text-gray-700">Each byte in the state matrix is replaced using the S-box lookup table:</p>
            <div class="bg-gray-50 p-3 rounded">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="mb-2">Before SubBytes:</p>
                  ${createStateMatrix(beforeState)}
                  <p class="mt-2">After SubBytes:</p>
                  ${createStateMatrix(afterState)}
                </div>
                <div class="bg-purple-50 p-2 rounded">
                  <p class="font-medium mb-2">Example using your input:</p>
                  <div class="space-y-2">
                    <p>Input byte: ${exampleByte}</p>
                    <p>1. Split into row (${exampleRow}) and column (${exampleCol})</p>
                    <p>2. Look up in S-box table</p>
                    <p>3. Output: ${exampleResult}</p>
                    <p class="font-mono mt-2">${exampleByte} → ${exampleResult}</p>
                    <p class="text-sm">(Row ${exampleRow}, Column ${exampleCol} in S-box)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
      
    case "shiftRows":
      explanation = `
        <div class="transformation-explanation bg-white p-4 rounded-lg shadow-md mt-4 mb-4">
          <h3 class="text-lg font-bold mb-2">ShiftRows Transformation (Round ${round})</h3>
          <div class="space-y-2">
            <p class="text-gray-700">Each row is shifted cyclically to the left by a different number of positions:</p>
            <div class="bg-gray-50 p-3 rounded">
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <p class="mb-2">Before ShiftRows:</p>
                  ${createStateMatrix(beforeState)}
                  <p class="mt-2">After ShiftRows:</p>
                  ${createStateMatrix(afterState)}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
      
    case "mixColumns":
      explanation = `
        <div class="transformation-explanation bg-white p-4 rounded-lg shadow-md mt-4 mb-4">
          <h3 class="text-lg font-bold mb-2">MixColumns Transformation (Round ${round})</h3>
          <div class="space-y-2">
            <p class="text-gray-700">Each column is transformed using matrix multiplication in GF(2⁸):</p>
            <div class="bg-gray-50 p-3 rounded">
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <p class="mb-2">Before MixColumns:</p>
                  ${createStateMatrix(beforeState)}
                  <p class="mt-2">After MixColumns:</p>
                  ${createStateMatrix(afterState)}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
      
    case "addRoundKey":
      explanation = `
        <div class="transformation-explanation bg-white p-4 rounded-lg shadow-md mt-4 mb-4">
          <h3 class="text-lg font-bold mb-2">AddRoundKey Transformation (Round ${round})</h3>
          <div class="space-y-2">
            <p class="text-gray-700">Each byte of the state is combined with a byte of the round key using XOR:</p>
            <div class="bg-gray-50 p-3 rounded">
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <p class="mb-2">Before AddRoundKey:</p>
                  ${createStateMatrix(beforeState)}
                  <p class="mt-2">Round Key:</p>
                  ${createStateMatrix(key)}
                  <p class="mt-2">After AddRoundKey:</p>
                  ${createStateMatrix(afterState)}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
  }
  
  return explanation;
}

// Helper function to create a visual representation of the state matrix
function createStateMatrix(state) {
  let html = '<div class="grid grid-cols-4 gap-1 font-mono text-sm">';
  for(let i = 0; i < 4; i++) {
    for(let j = 0; j < 4; j++) {
      const hex = parseInt(state[j][i], 2).toString(16).toUpperCase().padStart(2, '0');
      html += `<div class="bg-gray-100 p-1 text-center">${hex}</div>`;
    }
  }
  html += '</div>';
  return html;
}

//rotates left with 1 unit
function rotateLeftOneUnit(l){
  let temp = []
  temp = l.slice(1)
  temp.push(l[0])
  return temp
}

function leftShift(l, shiftBy){
  for(let i=0;i<shiftBy;i++){
    l = rotateLeftOneUnit(l)
  }
  return l
}

function xorList(l1,l2){
  let res = []
  for(let i=0;i<l1.length;i++){
    res.push(l1[i]^l2[i])
  }
  return res
}

function padTo15(str) {
  let padding = '';
  for(let i=0; i<15-str.length; i++) {
    padding += '0';
  }
  return padding + str;
}

function count(l,num){
  let count = 0
  for(let i=0;i<l.length;i++)
    if(l[i]==num){
      count++
    }
  return count
}

function GFmultiply(A,B,N){ //145
  A = dec2bin(A);
  B = dec2bin(B);
  A = padTo15(A);
  B = padTo15(B);
  let tempA = []
  let tempB = []
  for(let i=0;i<A.length;i++){
    tempA.push(parseInt(A.charAt(i)))
    tempB.push(parseInt(B.charAt(i)))
  }
  A = tempA
  B = tempB
  if(count(A,0)==2*N-1 || count(B,0)==2*N-1){
    return A
  }
  let res = []
  for(let i=0;i<2*N-1;i++){
    res[i] = 0
  }
  let shift_count = 2*(N-1)
  for(let i = 0;i<B.length;i++){
    if(B[i]==1){
      res = xorList(res, leftShift(A, shift_count))
    }
    shift_count -= 1
  }
  if(N == 8){
    let nonRed = [0,0,0,0,0,0,1,0,0,0,1,1,0,1,1]
    while(res.indexOf(1)<=6){
      let temp = res.indexOf(1)
      let count = 6 - temp
      let L = leftShift(nonRed, count)
      res = xorList(res, L)
    }
  }
  res_string = '';
  for(let ch of res) {
    res_string += ch;
  }
  return res_string.substring(7);
}

function createTable(tableData) {
  var table = document.createElement('table');
  var tableBody = document.createElement('tbody');

  tableData.forEach(function(rowData) {
    var row = document.createElement('tr');

    rowData.forEach(function(cellData) {
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);

  return table;
}

// Function to get cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Check login status when page loads
document.addEventListener('DOMContentLoaded', async () => {
    let sessionId = getCookie('session_id');
    const userInfo = document.getElementById('userInfo');
    
    if (!sessionId) {
        userInfo.innerHTML = `
            <a href="../login.html">
                <button class="sign-in-btn" title="Sign in to your account">Sign In</button>
            </a>
        `;
        return;
    }
    
    try {
        const response = await fetch('https://security-viz-api.onrender.com/check-session', {
            method: 'GET',
            headers: {
                'X-Session-ID': sessionId,
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok && data.authenticated) {
            userInfo.innerHTML = `
                <span class="welcome-text">Welcome, ${data.username}</span>
                <button class="sign-in-btn" onclick="logout()" title="Sign out">Logout</button>
            `;
        } else {
            document.cookie = 'session_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
            userInfo.innerHTML = `
                <a href="../login.html">
                    <button class="sign-in-btn" title="Sign in to your account">Sign In</button>
                </a>
            `;
        }
    } catch (error) {
        userInfo.innerHTML = `
            <a href="../login.html">
                <button class="sign-in-btn" title="Sign in to your account">Sign In</button>
            </a>
        `;
    }
});

async function logout() {
    const sessionId = getCookie('session_id');
    if (!sessionId) {
        window.location.href = '../login.html';
        return;
    }

    try {
        const response = await fetch('https://security-viz-api.onrender.com/logout', {
            method: 'POST',
            headers: {
                'X-Session-ID': sessionId,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        document.cookie = 'session_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        window.location.reload();
    } catch (error) {
        console.error('Logout failed:', error);
        document.cookie = 'session_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        window.location.reload();
    }
}

// Leaderboard Modal Functions
function showOverallLeaderboard() {
    document.getElementById('leaderboardModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    fetchOverallLeaderboard();
}

function closeOverallLeaderboard() {
    document.getElementById('leaderboardModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == document.getElementById('leaderboardModal')) {
        closeOverallLeaderboard();
    }
}

async function fetchOverallLeaderboard() {
    const sessionId = getCookie('session_id');
    try {
        const response = await fetch('https://security-viz-api.onrender.com/get-overall-leaderboard', {
            method: 'GET',
            headers: {
                'X-Session-ID': sessionId,
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
        }
        
        const data = await response.json();
        if (data.leaderboard && Array.isArray(data.leaderboard)) {
            updateOverallLeaderboard(data.leaderboard);
        } else {
            throw new Error('Invalid leaderboard data');
        }
    } catch (error) {
        console.error('Error fetching overall leaderboard:', error);
        const tbody = document.getElementById('leaderboardTable').querySelector('tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #ff4444;">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load leaderboard. Please try again later.</p>
                </td>
            </tr>
        `;
    }
}

function updateOverallLeaderboard(leaderboardData) {
    const tbody = document.getElementById('leaderboardTable').querySelector('tbody');
    tbody.innerHTML = '';

    if (leaderboardData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center;">
                    <i class="fas fa-info-circle"></i>
                    <p>No scores available yet. Complete some quizzes to appear on the leaderboard!</p>
                </td>
            </tr>
        `;
        return;
    }

    leaderboardData.forEach((user, index) => {
        const row = document.createElement('tr');
        const rank = index + 1;
        let rankDisplay = rank.toString();
        
        if (rank === 1) rankDisplay = '🥇 1';
        else if (rank === 2) rankDisplay = '🥈 2';
        else if (rank === 3) rankDisplay = '🥉 3';
        
        row.innerHTML = `
            <td>${rankDisplay}</td>
            <td>${user.username}</td>
            <td>${user.averageScore.toFixed(2)}%</td>
            <td>${user.algorithmsCompleted}/6</td>
        `;
        
        if (index < 3) {
            row.classList.add(`medal-${index + 1}`);
        }
        
        tbody.appendChild(row);
    });
}
