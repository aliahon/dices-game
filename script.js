let maxRolls = 7;
let rollsRemaining = { player1: maxRolls, player2: maxRolls };  // Track rolls for each player
let scores = { player1: 0, player2: 0 };
let currentPlayer = 1;
let groupConserved = { player1: [false, false], player2: [false, false] };

// Use dice images instead of text
const diceImages = [
    'images/dice1.png',
    'images/dice2.png',
    'images/dice3.png',
    'images/dice4.png',
    'images/dice5.png',
    'images/dice6.png'
];

// Function to switch between players
function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    document.getElementById("player-turn").textContent = `Current Player: Player ${currentPlayer}`;
    updateRollsRemainingDisplay();
}

// Update rolls remaining display
function updateRollsRemainingDisplay() {
    document.getElementById("remaining-rolls").textContent = rollsRemaining[`player${currentPlayer}`];
}

// Function to roll dice for a group
function rollDiceGroup(groupNumber, player) {
    if (rollsRemaining[`player${player}`] <= 0) {
        alert("No more rolls left!");
        return;
    }

    if (groupConserved[`player${player}`][groupNumber - 1]) {
        return; // This group is already conserved
    }

    const diceGroup = document.getElementById(`player${player}-group${groupNumber}`).children;
    let groupScore = 0;
    let sixCount = 0;

    for (let i = 0; i < diceGroup.length; i++) {
        let diceValue = Math.floor(Math.random() * 6) + 1;
        diceGroup[i].src = diceImages[diceValue - 1];  // Use images instead of text

        if (diceValue === 6) {
            sixCount++;
        } else {
            groupScore += diceValue;
        }
    }

    // If there are 6s, disable the conserve button
    const conserveButton = document.getElementById(`conserve${groupNumber}-player${player}`);
    if (sixCount > 0) {
        conserveButton.disabled = true;
    } else {
        conserveButton.disabled = false;
        scores[`player${player}`] += groupScore;
    }

    rollsRemaining[`player${player}`]--;
    updateRollsRemainingDisplay();

    if (rollsRemaining[`player${player}`] <= 0) {
        handleUnconservedGroups(player);  // Handle unconserved groups with zero score
        checkGameOver();
    }
}

// Function to conserve a group's score
function conserveGroup(groupNumber, player) {
    groupConserved[`player${player}`][groupNumber - 1] = true;
    document.getElementById(`conserve${groupNumber}-player${player}`).disabled = true;
    document.getElementById(`score-player${player}`).textContent = scores[`player${player}`];

    if (groupConserved[`player${player}`].every(c => c)) {
        switchPlayer();
    }

    checkGameOver();
}

// Function to check if the game is over
function checkGameOver() {
    const allGroupsConservedOrSix = (player) => {
        return groupConserved[`player${player}`].every((conserved, index) => {
            if (conserved) {
                return true;
            } else {
                // Check if the group contains a 6
                const diceGroup = document.getElementById(`player${player}-group${index + 1}`).children;
                for (let i = 0; i < diceGroup.length; i++) {
                    const diceValue = parseInt(diceGroup[i].src.match(/\d+/)[0]);  // Extract dice value
                    if (diceValue === 6) {
                        return true;  // Group contains a 6, so treat as effectively conserved
                    }
                }
                return false;
            }
        });
    };

    if ((rollsRemaining.player1 <= 0 && rollsRemaining.player2 <= 0) || 
        (allGroupsConservedOrSix(1) && allGroupsConservedOrSix(2))) {
        displayFinalResults();
    }
}


// Function to handle unconserved groups when a player runs out of rolls
function handleUnconservedGroups(player) {
    for (let group = 1; group <= 2; group++) {
        if (!groupConserved[`player${player}`][group - 1]) {
            const diceGroup = document.getElementById(`player${player}-group${group}`).children;
            let sixFound = false;

            // Check if any dice in the group is 6
            for (let i = 0; i < diceGroup.length; i++) {
                const diceValue = diceGroup[i].src.match(/\d+/)[0];  // Extract dice value from image filename
                if (diceValue == 6) {
                    sixFound = true;
                    break;
                }
            }

            if (sixFound) {
                // If a 6 was found, score for this group is zero
                scores[`player${player}`] -= getGroupScore(diceGroup);
            }
        }
    }
}

// Function to get the score of a group
function getGroupScore(diceGroup) {
    let groupScore = 0;
    for (let i = 0; i < diceGroup.length; i++) {
        const diceValue = parseInt(diceGroup[i].src.match(/\d+/)[0]);  // Extract dice value from image filename
        if (diceValue !== 6) {
            groupScore += diceValue;
        }
    }
    return groupScore;
}

// Function to display the final result
function displayFinalResults() {
    document.getElementById('final-result').innerHTML = 
        `Game Over!<br> Player 1: ${scores.player1} <br> Player 2: ${scores.player2}`;
}

// Initialize game with proper display
updateRollsRemainingDisplay();
