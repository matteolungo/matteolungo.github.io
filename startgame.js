import codes from './codes.json' with { type: 'json' };

const values = Object.values(codes);
const keys = Object.keys(codes);
let guessed = [];
let positions = []
let choices = [];
let score = 0;
let seconds = 5;
let randomKey, correctFlag, correctButton, lastPress, timer, interval, points;

let modalStart = new bootstrap.Modal(document.getElementById('modalStart'));
let modalEnd = new bootstrap.Modal(document.getElementById('modalEnd'));
let modalPWA = new bootstrap.Modal(document.getElementById('modalPWA'));
let modalResult = document.getElementById('modalResult');
let modalPoints = document.getElementById('modalPoints');
let buttons = document.getElementsByClassName('button');
let eTimer = document.getElementById('timer');
let ePoints = document.getElementById('points');
let eScore = document.getElementById('score');
let flag = document.getElementById('flag');

function start() {
    modalStart.hide();
    modalEnd.hide();
    score = 0;
    eScore.innerHTML = score;
    guessed = [];

    for (const b of buttons) {
        b.style.visibility = 'visible';
    }

    flag.style.visibility = 'visible';
    newFlag();
}

function newFlag() {
    positions = [1, 2, 3, 4];
    choices = [];
    seconds = 5;

    for (const b of buttons) {
        b.classList.remove('noClick')
        b.classList.remove('smallText');
    }

    eScore.innerHTML = score;
    eTimer.innerHTML = seconds;
    ePoints.innerHTML = '';

    if (lastPress) {
        lastPress.classList.remove('btn-success', 'btn-danger',);
        lastPress.classList.add('btn-light');
    }
    if (correctButton) {
        correctButton.classList.remove('btn-success');
        correctButton.classList.add('btn-light');
    }

    do {
        randomKey = keys[parseInt(Math.random() * keys.length)];
    } while (guessed.includes(codes[randomKey]))

    flag.src = 'flags/' + randomKey + '.png';
    correctFlag = codes[randomKey];
    choices.push(correctFlag);
    let randomPosition = parseInt(Math.random() * positions.length) + 1;
    positions = positions.filter(p => p !== randomPosition);
    correctButton = document.getElementById('button' + randomPosition);
    correctButton.innerHTML = correctFlag;
    if (correctFlag.length > 30) {
        correctButton.classList.add('smallText');
    }

    while (choices.length < 4) {
        let randomValue = values[parseInt(Math.random() * values.length)];
        if (!choices.includes(randomValue)) {
            choices.push(randomValue);
            let randomPosition = positions[parseInt(Math.random() * positions.length)];
            positions = positions.filter(p => p !== randomPosition);
            document.getElementById('button' + randomPosition).innerHTML = randomValue;
            if (randomValue.length > 30) {
                document.getElementById('button' + randomPosition).classList.add('smallText');
            }
        }
    }

    flag.click();

    interval = setInterval(() => {
        seconds--;
        eTimer.innerHTML = seconds;
    }, 1000);

    timer = setTimeout(() => {
        for (const b of buttons) {
            b.classList.remove('noClick')
        }
        correctButton.classList.remove('btn-light');
        correctButton.classList.add('btn-success');
        lose();
        clearInterval(interval);
    }, 5000);

}

function checkResult(event) {
    for (const b of buttons) {
        b.classList.add('noClick')
    }

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
        eScore.innerHTML = score;
        ePoints.innerHTML = `+${points}`;
        event.target.classList.remove('btn-light');
        event.target.classList.add('btn-success');
        if (guessed.length === 248) {
            win();
        } else {
            const audio = new Audio('res/correct.mp3');
            audio.play().catch((err) => console.log(err));;
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

function lose() {
    const audio = new Audio('res/lose.mp3');
    audio.play().catch((err) => console.log(err));;
    if (seconds === 0) {
        modalResult.innerHTML = '❌ Tempo Scaduto! ❌';
    } else {
        modalResult.innerHTML = '❌ Sbagliato! ❌';
    }
    modalPoints.innerHTML = `<br/>Hai totalizzato ${score} punti`;
    modalEnd.toggle();
}

function win() {
    const audio = new Audio('res/win.mp3');
    audio.play().catch((err) => console.log(err));
    modalResult.innerHTML = '🎉 Hai vinto! 🎉';
    modalPoints.innerHTML = `<br/>Hai totalizzato ${score} punti`;
    modalEnd.toggle();
}

function closePWA() {
    modalPWA.hide();
}

window.onload = function main() {
    function isPWA() {
        // iOS
        if (('standalone' in window.navigator) && (window.navigator.standalone)) {
            return true;
        }
        // Others
        const displayModes = ['standalone', 'fullscreen', 'minimal-ui'];
        for (const element of displayModes) {
            if (window.matchMedia(`(display-mode: ${element})`).matches) {
                return true;
            }
        }
        return false;
    }

    if (!isPWA() && hasTouch()) {
        modalPWA.toggle();
    }

    function hasTouch() {
        return 'ontouchstart' in document.documentElement
            || navigator.maxTouchPoints > 0
            || navigator.msMaxTouchPoints > 0;
    }

    for (const b of buttons) {
        if (hasTouch()) {
            b.classList.add('noHover');
            b.classList.add('mobileButton');
        }
        b.addEventListener('click', checkResult);
    }

    document.getElementById('restartButton').addEventListener('click', start);
    document.getElementById('startButton').addEventListener('click', start);
    document.getElementById('closeButton').addEventListener('click', closePWA);
    modalStart.toggle();
}
