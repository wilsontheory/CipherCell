var enterMatrix = require("./matrix.js");
enterMatrix();

window.onload = function (){

  //create and append canvas element
  var canvas = document.getElementById("canvasA");
  var playerImage = document.getElementById("arrow");
  var ctx = canvas.getContext("2d");
  // canvas.width = parseInt(window.innerWidth * 0.86);
  // canvas.height = parseInt(window.innerHeight * 0.86);
  canvas.width = 800;
  canvas.height = 650;
  var center = [canvas.width/2, canvas.height/2];
  var innerCircleWidth = canvas.width / 20;
  var orbits = [0, 50, 100, 150, 200, 250];
  var life; //reach 100 detection and you die
  var time; //time for level
  var playerScore; //score of the player
  var difficultyMultiplier; //var to determine how difficult stage is


  addEventListener("keydown", function (e) {
    e.stopPropagation();
    if (e.keyCode === 32){
      playing = playing ? false : true;
    }
    if ((e.keyCode === 38 || e.keyCode === 87) && playing) {
      //up arrow or 'w'
      if (playerObject.orbit > 0){
        if (!checkCollisionAgainstBlocker(playerObject.orbit - 1)){
          //no collision by decrease orbit
          playerObject.orbit --;
        }
      }
    }
    if ((e.keyCode === 40 || e.keyCode === 83) && playing) {
      //down arrow
      if (playerObject.orbit < 4){
        if (!checkCollisionAgainstBlocker(playerObject.orbit + 1)){
          //no collision by increase orbit
          playerObject.orbit ++;
        }
      }
    }
    if ((e.keyCode === 37 || e.keyCode === 65) && playing) {
      //left
      var intendedRadianChange = (.15 - (playerObject.orbit * .02));

      if (playerObject.orbit === orbits.length - 1){
        //if player is in top orbit, don't check collision
        playerObject.radian += intendedRadianChange;
      } else {
        if (!checkCollisionAgainstBlocker(playerObject.orbit, intendedRadianChange)){
          playerObject.radian += intendedRadianChange;
        }
      }
    }
    if ((e.keyCode === 39 || e.keyCode === 68) && playing) {
      //right
      var intendedRadianChange = -(.15 - (playerObject.orbit * .02));
      if (playerObject.orbit === orbits.length - 1){
        //if player is in top orbit, don't check collision
        playerObject.radian += intendedRadianChange;
      } else {
        if (!checkCollisionAgainstBlocker(playerObject.orbit, intendedRadianChange)){
          playerObject.radian += intendedRadianChange;
        }
      }
    }
  }, false);


  var playerObject = {
    orbit: 5,
    radian: Math.PI/2,
    //CLOCKWISE starting from 0
    x: function (radian, playerOrbit) {
      //radius times the cosine of the radian
      return (
        (innerCircleWidth + orbits[playerOrbit]) * Math.cos(radian)
      );
    },
    y: function (radian, playerOrbit) {
      return (
        (innerCircleWidth + orbits[playerOrbit]) * Math.sin(radian)
      );
    },

  };

  var itemsOfOrbit;
  var resetOrbits = function (){
    itemsOfOrbit = {
      //does not include the player object
      0: [],
      1: [],
      2: [],
      3: [],
      4: []
    };
    playerObject.orbit = 5;
    playerObject.radian = Math.PI/2;
  };

  var buildKillers = function (number){
    var killers = 0;
    var startArcsInOrbit = { 1: [], 2: [], 3: [], 4: []};
    while (killers < number){
      for (var orbit = 1; orbit < 5; orbit++){
          var randomStartArc = parseInt(Math.random() * 6) + 1;
          if (startArcsInOrbit[orbit].indexOf(randomStartArc) === -1){
            //if this start arc was not used in this orbit...
            startArcsInOrbit[orbit].push(randomStartArc);
            itemsOfOrbit[orbit].push({type: "killer", breed: "normal", startArc: randomStartArc});
            killers += 1;
          }
      }
    }
  };
  var buildHunterKillers = function (number){
    var hunterKillers = 0;
    var startArcsInOrbit = { 1: [], 2: [], 3: [], 4: []};
    while (hunterKillers < number){
      for (var orbit = 1; orbit < 5; orbit++){
        if (hunterKillers < number){
          var randomStartArc = parseInt(Math.random() * 6) + 1;
          if (startArcsInOrbit[orbit].indexOf(randomStartArc) === -1){
            //if this start arc was not used in this orbit...
            startArcsInOrbit[orbit].push(randomStartArc);
            itemsOfOrbit[orbit].push({type: "killer", breed: "hunterKiller", startArc: randomStartArc});
            hunterKillers += 1;
          }
        }
      }
    }
  };
  var buildBlockers = function (number){
    var blockers = 0;
    var startArcsInOrbit = { 1: [], 2: [], 3: [], 4: []};
    while (blockers < number){
      for (var orbit = 1; orbit < 5; orbit++){
        if (blockers < number){
          var randomStartArc = parseInt(Math.random() * 6) + 1;
          if (startArcsInOrbit[orbit].indexOf(randomStartArc) === -1){
            //if this start arc was not used in this orbit...
            startArcsInOrbit[orbit].push(randomStartArc);
            itemsOfOrbit[orbit].push({type: "blocker", startArc: randomStartArc});
            blockers += 1;
          }
        }
      }
    }
  };
  var rotateOrbitItems = function () {
    Object.keys(itemsOfOrbit).forEach((orbit) => {
      itemsOfOrbit[orbit].forEach((item) => {
        if (Math.random() > 0.5){
          item.startArc += (Math.random() * Math.PI/7);
        } else {
          item.startArc -= (Math.random() * Math.PI/7);
        }
      });
    });
  };

  var checkCollisionAgainstBlocker = function (orbit, intendedRadianChange=0){
    var collisionDetected = false;
    var collisionMarginOrbitRatio = (innerCircleWidth + 50) / innerCircleWidth;
    var collisionMargin = (Math.PI/96) + Math.pow(collisionMarginOrbitRatio, (4 - orbit))
     * (Math.PI/394); //prevents player icon from appearing inside blocker
    itemsOfOrbit[orbit].forEach((blocker) => {
      var playerHorizRad = ((Math.PI*2) - ((Math.PI*2 + ((playerObject.radian + intendedRadianChange) % (Math.PI * 2)))%(Math.PI*2)));
      var blockerHorizRad = ((Math.PI*2) - blocker.startArc);
      //remember blockers are rendered clockwise
      if (blocker.type === "blocker"){
        if (blockerHorizRad <= Math.PI/6){
          //if blocker is at the overlap
          if (playerHorizRad <= (blockerHorizRad + collisionMargin)
            || playerHorizRad >= Math.PI*2 - (Math.PI/6 - blockerHorizRad + collisionMargin) ){
              collisionDetected = true;
            }
        } else if (playerHorizRad <= (blockerHorizRad + collisionMargin)
            && playerHorizRad >= ((blockerHorizRad - Math.PI/6) - collisionMargin)){
              collisionDetected = true;
            }
      }
    });
    return collisionDetected;
  };

  var checkPlayerInsideKiller = function (){
    if (playerObject.orbit < 5){
      itemsOfOrbit[playerObject.orbit].forEach((killer) => {
        var playerHorizRad = ((Math.PI*2) - ((Math.PI*2 + (playerObject.radian % (Math.PI * 2)))%(Math.PI*2)));
        var killerHorizRad = ((Math.PI*2) - killer.startArc);
        //remember killers are rendered clockwise
        if (killer.type !== "killer"){
          return false;
        }

        if (killer.breed === "normal"){
          if (killerHorizRad <= Math.PI/6){
            //if killer is at the overlap
            if (playerHorizRad <= killerHorizRad
              || playerHorizRad >= Math.PI*2 - (Math.PI/6 - killerHorizRad) ){
                playerHit(killer);
                return true;
              }
            } else if (playerHorizRad <= killerHorizRad
              && playerHorizRad >= killerHorizRad - Math.PI/6){
                playerHit(killer);
                return true;
            }
        } else {
          killerHorizRad %= Math.PI*2;
          if (killerHorizRad <= Math.PI/6){
            //if hunterKiller is at the overlap (hks rendered CCW)
            if (playerHorizRad <= killerHorizRad
              || playerHorizRad >= Math.PI*2 - (Math.PI/6 - killerHorizRad) ){
                playerHit(killer);
                return true;
              }
            } else if (playerHorizRad <= killerHorizRad
              && playerHorizRad >= killerHorizRad - Math.PI/6){
                playerHit(killer);
                return true;
            }
        }
      });
    }
    return false;
  };

  var playerHit = function (killer) {
    if (killer.breed === "normal"){
      life -= 0.2;
    } else {
      life -= 0.7;
    }
    window.playerDamaged = true;
    document.getElementById("matrix").classList.remove("matrixRegular");
    document.getElementById("matrix").classList.add("matrixDamaged");
  };

  var update = function() {
    var bubble = document.getElementById("bubble");
    bubble.style.opacity = (life) / 225;
    if (playing){
      window.playerDamaged = false; //undo player damaged
      document.getElementById("matrix").classList.remove("matrixDamaged");
      document.getElementById("matrix").classList.add("matrixRegular");
      time --;
      if (time <= 0){ //if player time is out
        life -= 0.1;
        window.playerDamaged = true;
        document.getElementById("matrix").classList.remove("matrixRegular");
        document.getElementById("matrix").classList.add("matrixDamaged");
      }
      Object.keys(itemsOfOrbit).forEach((orbit) => {
        itemsOfOrbit[orbit].forEach((item) => {
          if (item.startArc >= 2 * Math.PI){
            item.startArc = 0;
          } else if (item.startArc <= -2 * Math.PI){
            item.startArc = 0;
          }
          if (item.type === "killer"){
            if (item.breed === "normal"){
              item.startArc += 0.01 * (1 + Math.log(difficultyMultiplier) / 14);
            } else {
              item.startArc -= 0.02 * (1 + Math.log(difficultyMultiplier) / 14);
            }
          }
        });
      });
      checkPlayerInsideKiller();
    }
  };

  var positionWithinKillerArc = function(pos, killerStartArc){

  };

  var winAnimation = function(){
    var imageHolder = document.getElementById("switch");
    imageHolder.src="circleSwitch.gif";
    imageHolder.style.display = "block";
    window.playerWinning = true;
    setTimeout(() => {
      imageHolder.src = "";
      imageHolder.style.display = "none";
      window.playerWinning = false;
    }, 1100);
  };

  var render = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(center[0], center[1], innerCircleWidth + orbits[4], 0, 2 * Math.PI);
    if (window.playerDamaged){
      ctx.fillStyle = "rgba(40, 0, 0, 0.68)";
    } else if (window.playerWinning){
      ctx.fillStyle = "rgba(0, 15, 0, 0.58)";
    } else {
      ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
    }
    ctx.fill();
    ctx.closePath();

    ctx.save();
    ctx.lineWidth = 1;

    if (playerObject.orbit < 1){
      ctx.strokeStyle = "#05ad1b"; //matrix green
      winAnimation();
    } else {
      ctx.setLineDash([10, 15]);
      ctx.strokeStyle = "black";
      ctx.shadowColor = "white";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 4;
    }
    ctx.beginPath();
    //orbit paths
    ctx.arc(center[0], center[1], innerCircleWidth + orbits[0], 0, 2 * Math.PI);
    ctx.arc(center[0], center[1], innerCircleWidth + orbits[1], 0, 2 * Math.PI);
    ctx.arc(center[0], center[1], innerCircleWidth + orbits[2], 0, 2 * Math.PI);
    ctx.arc(center[0], center[1], innerCircleWidth + orbits[3], 0, 2 * Math.PI);
    ctx.arc(center[0], center[1], innerCircleWidth + orbits[4], 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

    var playerPosX = center[0] + playerObject.x(playerObject.radian, playerObject.orbit) - 15;
    var playerPosY = center[1] + playerObject.y(playerObject.radian, playerObject.orbit) - 15;

    var angle = Math.atan2(playerPosY + 15 - center[1], playerPosX + 15 - center[0]) - Math.PI / 2;

    ctx.save();
    if (Math.random() < 0.2){
      ctx.shadowColor = "white";
    }
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 7;

    ctx.translate(playerPosX + 15, playerPosY + 15);
    ctx.rotate(Math.PI/6 + angle);
    ctx.drawImage(playerImage, -15, -15, 34 , 34);
    ctx.restore();
    ctx.save();
    ctx.translate((center[0] + center[0]/3), center[1]/10);
    ctx.font = "24px courier";
    if (time <= 0){
      ctx.fillStyle="#e51300";
    } else {
      ctx.fillStyle="#FFFFFF";
    }
    ctx.fillText(`Time: ${time}ms`, -center[0], 0);
    if (window.playerDamaged){
      ctx.fillStyle="#e51300";
      ctx.fillText(`detection: ${parseInt((100 - life))}%`, 0, 0);
    } else {
      ctx.fillText(`Detection: ${parseInt((100 - life))}%`, 0, 0);
    }
    ctx.restore();


    ctx.save();
    ctx.lineWidth = 14;
    ctx.lineCap = "square";
    //draw the objects in each orbit
    Object.keys(itemsOfOrbit).forEach((orbitKey) => {
      itemsOfOrbit[orbitKey].forEach((item) => {
        ctx.beginPath();
        if (item.type === "killer"){
          ctx.setLineDash([5, 16]);
          if (item.breed === "normal"){
            ctx.strokeStyle = "#e51300";
            ctx.arc(center[0], center[1], innerCircleWidth + orbits[orbitKey], item.startArc, item.startArc + Math.PI/6);
          } else {
            ctx.strokeStyle = "orange";
            ctx.arc(center[0], center[1], innerCircleWidth + orbits[orbitKey], item.startArc, item.startArc + Math.PI/6);
          }
        } else {
          ctx.strokeStyle = "#05ad1b";
          ctx.arc(center[0], center[1], innerCircleWidth + orbits[orbitKey], item.startArc, item.startArc + Math.PI/6);
        }
        ctx.stroke();
        ctx.closePath();
      });
    });
    ctx.restore();

  };

  life = 100;
  time = 2000;
  playerScore = 0;
  difficultyMultiplier = 0;
  var playing = true;
  var playerAlive;
  var changeLevel = true;


  var menuLoop = function () {
    var gameStarted = false;


    if (gameStarted){
      masterLoop();
    }
  };

var gameStarted = false;
var mainMenu = document.getElementById("menuBox");
var instructionsBox = document.getElementById("instructionsBox");
var instructionShower = document.getElementById("instructionShower");
var instructionsButton = document.getElementById("menuBoxInstructions");

var mainMenuStartButton = document.getElementById("menuBoxStartButton");
var backToMenuButton = document.getElementById("backToMenu");
  var masterLoop = function () {
    playerAlive = true;

    if (gameStarted){
      mainMenu.style.display = "none";
      if (changeLevel === true && playerAlive === true){
        resetOrbits();
        difficultyMultiplier ++;
        if (time >= 0){
          playerScore += time / 2;
        }
        time = 1000 + parseInt(Math.log(difficultyMultiplier) * 100);
        buildKillers(parseInt(Math.log(difficultyMultiplier + 1) * 3.5));
        buildHunterKillers(parseInt(Math.log(difficultyMultiplier + 0.25)));
        buildBlockers(parseInt(Math.log(difficultyMultiplier + 100) * 1.5));
        rotateOrbitItems();
        changeLevel = false;
      }

      if (playerAlive === true){
        if (life <= 0){
          playerAlive = false;
          deadLoop();
        } else {
          update();
          render();
        }
      }

      if (playerObject.orbit === 0){
        changeLevel = true;
      }


    } else {
      mainMenuStartButton.addEventListener("click", () => {
        gameStarted = true;
      });
      instructionsButton.addEventListener("click", () => {
        instructionsBox.classList.remove("overlayHidden");
        instructionsBox.classList.add("overlayBlack");
        mainMenu.style.display = "none";
        instructionShower.style.display = "flex";
      });
      backToMenuButton.addEventListener("click", () => {
        instructionsBox.classList.remove("overlayBlack");
        instructionsBox.classList.add("overlayHidden");
        mainMenu.style.display = "flex";
        instructionShower.style.display = "none";
      });
    }
    requestAnimationFrame(masterLoop);
  };

  var deadLoop = function () {
    var deathBox = document.getElementById("deathBox");
    deathBox.classList.remove("overlayHidden");
    deathBox.classList.add("overlay");
    var deathBoxRestartButton = document.getElementById("deathBoxRestartButton");
    deathBoxRestartButton.addEventListener("click", () => {
      life = 100;
      time = 2000;
      playerScore = 0;
      difficultyMultiplier = 0;
      playing = true;
      playerAlive = true;
      changeLevel = true;
      deathBox.classList.remove("overlay");
      deathBox.classList.add("overlayHidden");
    });
    var deathBoxScore = document.getElementById("deathBoxScore");
    deathBoxScore.innerText = parseInt(playerScore);

  };

masterLoop();

};
