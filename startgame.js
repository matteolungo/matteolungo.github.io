window.onload = function main() {

    var points = 0;
    var guessed = [];
    
    fetch("./codes.json")
        .then(response => response.json())
        .then(json => {

            function newFlag() {

                const values = Object.values(json);
                const keys = Object.keys(json);
                var positions = [1,2,3,4];
                
                var randomKey = keys[parseInt(Math.random() * keys.length)];
                while (guessed.includes(randomKey)) {
                    randomKey = keys[parseInt(Math.random() * keys.length)];
                }
                document.getElementById("flag").src = "flags/" + randomKey + ".png";

                var correctFlag = json[randomKey];
                var randomPosition = parseInt(Math.random() * positions.length) + 1;
                positions = positions.filter(p => p !== randomPosition);
                document.getElementById("button"+randomPosition).innerHTML = correctFlag;
                
                for (var i=0; i<3; i++) {
                    var randomValue = values[parseInt(Math.random() * values.length)];
                    var randomPosition = positions[parseInt(Math.random() * positions.length)];
                    positions = positions.filter(p => p !== randomPosition);
                    document.getElementById("button"+randomPosition).innerHTML = randomValue;
                }
                
            }

            newFlag();

        });
    // $("#failModal").modal();

}