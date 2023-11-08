let score = document.querySelector(".score");
let timer = document.querySelector(".timer");
let holes = document.querySelectorAll(".hole");
let playBtn = document.querySelector(".play");
let beep = document.getElementById("beep");
let nameInput = document.getElementById("name");
let leaderboardEl = document.querySelector(".leaderboard");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let totalTime = 25;
let interval = 500;
let time = totalTime;
timer.innerHTML = time;
score.innerHTML = 0;

function getScores() {
  leaderboard.getScores().then((results) => {
    const leaderboardItems = results.map(
      (result) => `
    <div class="leaderboard-item">
      <p>${result.Name}</p>
      <p>${result.Score}</p>
    </div>`
    );

    const html = `<div class="leaderboard-item">
    <p>Name</p>
    <p>Score</p>
    </div> ${leaderboardItems.join("")}`;

    leaderboardEl.innerHTML = html;
  });
}

getScores();

playBtn.addEventListener("click", () => {
  if (nameInput.value == "") {
    alert("Enter a username");
    return false;
  }

  leaderboard.setName(nameInput.value);

  playBtn.style.display = "none";
  leaderboardEl.style.display = "none";
  nameInput.style.display = "none";
  let currHole;
  let currScore = 0;
  let noOfHoles = 9; //Math.floor(Math.random() * 4) + 5;
  for (let i = 0; i < noOfHoles; i++) {
    holes[i].style.display = "block";
  }

  const start = setInterval(() => {
    let hole = Math.floor(Math.random() * noOfHoles);
    currHole = holes[hole];

    let moleImg = document.createElement("img");
    const randomPhoto = getRandomSrc();
    moleImg.setAttribute("src", `./${randomPhoto}`);
    moleImg.setAttribute("class", "mole");
    beep.play();
    currHole.appendChild(moleImg);
    let timeout = Math.floor(Math.random() * 200) + interval / 2;
    setTimeout(() => {
      currHole.removeChild(moleImg);
    }, timeout);
  }, interval);

  const event = (event) => {
    event.preventDefault();
    if (event.target === currHole) {
      currScore += 1;
      score.innerHTML = currScore;
    }
  };

  window.addEventListener("click", event);
  window.addEventListener("touchstart", event);

  function checkTime() {
    if (time === 0) {
      playBtn.style.display = "block";
      leaderboardEl.style.display = "block";
      nameInput.style.display = "block";
      playBtn.innerHTML = "REPLAY";

      score.innerHTML = `${currScore} / ${totalTime}`;
      leaderboard.setScore(currScore);
      leaderboard
        .submit()
        .then(() => delay(200))
        .then(getScores);

      currScore = 0;
      currHole.innerHTML = "";
      clearInterval(start);
      time = totalTime;
      clearInterval(countdown);
      holes.forEach((hole) => {
        hole.style.display = "none";
      });
    }
  }
  let countdown = setInterval(() => {
    time--;
    timer.innerHTML = time;
    checkTime();
  }, interval);

  function getRandomSrc() {
    const paths = [
      "phone.png",
      "watch.png",
      "router.png",
      "laptop.png",
      "ipad.webp",
      "tobi.png",
    ];
    return paths[Math.floor(Math.random() * paths.length)];
  }
});
