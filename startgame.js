import codes from './codes.json' assert { type: 'json' };
let score = 0;
let guessed = [];
let positions = []
let choices = [];
let seconds = 5;
const values = Object.values(codes);
const keys = Object.keys(codes);
let modalStart = new bootstrap.Modal(document.getElementById('modalStart'));
let modalEnd = new bootstrap.Modal(document.getElementById('modalEnd'));
let modalResult = document.getElementById('modalResult');
let modalPoints = document.getElementById('modalPoints');
let randomKey, correctFlag, correctButton, lastPress, timer, interval, points;

function start() {
    modalStart.hide();
    
    let buttons = document.getElementsByClassName('button');
    for (const b of buttons) {
        b.style.visibility = 'visible';
    }

    let flag = document.getElementById('flag');
    flag.style.visibility = 'visible';
    newFlag();
}

function newFlag() {
    positions = [1, 2, 3, 4];
    choices = [];
    seconds = 5;

    document.getElementById('button1').disabled = false;
    document.getElementById('button2').disabled = false;
    document.getElementById('button3').disabled = false;
    document.getElementById('button4').disabled = false;
    document.getElementById('timer').innerHTML = 'Tempo: ' + seconds;
    document.getElementById('points').innerHTML = '';

    if (lastPress) {
        lastPress.classList.remove('btn-success', 'btn-danger',);
        lastPress.classList.add('btn-light');
        correctButton.classList.remove('btn-success');
        correctButton.classList.add('btn-light');
    }

    do {
        randomKey = keys[parseInt(Math.random() * keys.length)];
    } while (guessed.includes(codes[randomKey]))

    document.getElementById('flag').src = 'flags/' + randomKey + '.png';
    correctFlag = codes[randomKey];
    choices.push(correctFlag);
    let randomPosition = parseInt(Math.random() * positions.length) + 1;
    positions = positions.filter(p => p !== randomPosition);
    correctButton = document.getElementById('button' + randomPosition);
    correctButton.innerHTML = correctFlag;

    while (choices.length < 4) {
        let randomValue = values[parseInt(Math.random() * values.length)];
        if (!choices.includes(randomValue)) {
            choices.push(randomValue);
            let randomPosition = positions[parseInt(Math.random() * positions.length)];
            positions = positions.filter(p => p !== randomPosition);
            document.getElementById('button' + randomPosition).innerHTML = randomValue;
        }
    }

    document.getElementById('flag').click();

    interval = setInterval(() => {
        seconds--;
        document.getElementById('timer').innerHTML = 'Tempo: ' + seconds;
    }, 1000);

    timer = setTimeout(() => {
        lose();
        clearInterval(interval);
    }, 5000);

}

function checkResult(event) {
    document.getElementById('button1').disabled = true;
    document.getElementById('button2').disabled = true;
    document.getElementById('button3').disabled = true;
    document.getElementById('button4').disabled = true;

    let answer = event.target.innerHTML;
    if (answer === correctFlag) {
        if (seconds > 3) {
            points = 3;
        } else if (seconds > 2) {
            points = 2;
        } else {
            points = 1;
        }
        guessed.push(correctFlag)
        score += points;
        document.getElementById('score').innerHTML = 'Punti: ' + score;
        document.getElementById('points').innerHTML = '+ ' + points;
        event.target.classList.remove('btn-light');
        event.target.classList.add('btn-success');
        if (guessed.length === 248) {
            win();
        } else {
            const audio = new Audio('res/correct.mp3');
            audio.play();
            setTimeout(() => { newFlag() }, 1000);
        }
    } else {
        event.target.classList.remove('btn-light');
        event.target.classList.add('btn-danger');
        correctButton.classList.remove('btn-light');
        correctButton.classList.add('btn-success');
        lastPress = event.target;
        lose();
    }

    lastPress = event.target;
    clearTimeout(timer);
    clearInterval(interval);
}

function restart() {
    score = 0;
    document.getElementById('score').innerHTML = 'Punti: ' + score;
    guessed = [];
    modalEnd.hide();
    newFlag();
}

function lose() {
    const audio = new Audio('res/lose.mp3');
    audio.play();
    modalResult.innerHTML = '❌ Hai perso! ❌';
    modalPoints.innerHTML = `<br/>Hai totalizzato ${score} punti`;
    modalEnd.toggle();
}

function win() {
    const audio = new Audio('res/win.mp3');
    audio.play();
    modalResult.innerHTML = '🎉 Hai vinto! 🎉';
    modalPoints.innerHTML = `<br/>Hai totalizzato ${score} punti`;
    modalEnd.toggle();
}

window.onload = function main() {
    document.getElementById('button1').addEventListener('click', checkResult);
    document.getElementById('button2').addEventListener('click', checkResult);
    document.getElementById('button3').addEventListener('click', checkResult);
    document.getElementById('button4').addEventListener('click', checkResult);
    document.getElementById('restartButton').addEventListener('click', restart);
    document.getElementById('startButton').addEventListener('click', start);
    modalStart.toggle();
}
