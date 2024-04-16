// https://javascript.info/mouse-drag-and-drop
// https://javascript.info/pointer-events

function playFireworks() {
  setTimeout(() => {
    confetti({
      particleCount: 77,
      spread: 70,
      origin: { x: 0.50, y: 0.6 },
    });
  }, 0);
}

function lerp(s, e, t) {
  if (t < 0) t = 0;
  if (t > 1) t = 1;
  return s + (e - s) * t;
}

function makeDraggable(elem, isRightAnswer) {
  elem.ondragstart = () => false;
  // disable holding to select even though user-select is none
  elem.ontouchstart = () => false;

  elem.beingDraggedByPointer = undefined;

  function convertToRelativeX(x) {
    // relative to #options's left
    let optionsDivRect = document.getElementById("options").getBoundingClientRect();
    return (x - optionsDivRect.left) / factor;
  }
  function convertToRelativeY(y) {
    // relative to #options's top
    let optionsDivRect = document.getElementById("options").getBoundingClientRect();
    return (y - optionsDivRect.top) / factor;
  }
  function isOverTheBlank(e) {
    let blankRect = document.getElementById("blank").getBoundingClientRect();
    let overTheBlank = blankRect.left <= e.clientX && e.clientX <= blankRect.right &&
                          blankRect.top <= e.clientY && e.clientY <= blankRect.bottom;
    return overTheBlank;
  }

  elem.onpointerdown = function(event) {
    if (elem.beingDraggedByPointer != undefined) return false;

    // retarget all pointer events (until pointerup) to elem
    elem.setPointerCapture(event.pointerId);
    elem.beingDraggedByPointer = event.pointerId;

    let originalLeft = convertToRelativeX(elem.getBoundingClientRect().left);
    let originalTop = convertToRelativeY(elem.getBoundingClientRect().top);
    elem.style.left = originalLeft + 'px';
    elem.style.top = originalTop + 'px';
    elem.style.position = 'absolute';
    elem.style.zIndex = 1000;
    // document.body.append(elem);

    let lastTimestamp = document.timeline.currentTime / 1000;
    let evt = event;

    let req = requestAnimationFrame(move);

    function move(currentTimestamp) {
      let currentLeft = convertToRelativeX(elem.getBoundingClientRect().left);
      let currentTop = convertToRelativeY(elem.getBoundingClientRect().top);

      let newLeft = convertToRelativeX(evt.clientX) - elem.getBoundingClientRect().width/2;
      let newTop = convertToRelativeY(evt.clientY) - elem.getBoundingClientRect().height/2;

      // let currentTimestamp = document.timeline.currentTime / 1000;
      currentTimestamp /= 1000;
      let timeDiff = currentTimestamp - lastTimestamp;

      elem.style.left = lerp(currentLeft, newLeft, timeDiff * 20) + 'px';
      elem.style.top = lerp(currentTop, newTop, timeDiff * 20) + 'px';

      if (isOverTheBlank(evt)) {
        blank.classList.add("highlight");
      } else {
        blank.classList.remove("highlight");
      }

      lastTimestamp = currentTimestamp;
      if (Math.abs(newLeft - currentLeft) > 0.1 || Math.abs(newTop - currentTop) > 0.1) {
        req = requestAnimationFrame(move);
      }
    }

    function moveBack(currentTimestamp) {
      let currentLeft = convertToRelativeX(elem.getBoundingClientRect().left);
      let currentTop = convertToRelativeY(elem.getBoundingClientRect().top);

      let newLeft = originalLeft;
      let newTop = originalTop;

      // let currentTimestamp = document.timeline.currentTime / 1000;
      currentTimestamp /= 1000;
      let timeDiff = currentTimestamp - lastTimestamp;

      elem.style.left = lerp(currentLeft, newLeft, timeDiff * 20) + 'px';
      elem.style.top = lerp(currentTop, newTop, timeDiff * 20) + 'px';

      lastTimestamp = currentTimestamp;
      if (Math.abs(newLeft - currentLeft) > 0.1 || Math.abs(newTop - currentTop) > 0.1) {
        req = requestAnimationFrame(moveBack);
      } else {
        // clean up
        // elem.style.position = 'static';
        elem.style.zIndex = 'auto';
        elem.beingDragged = false;
        elem.beingDraggedByPointer = undefined;
      }
    }

    function moveToBlank(currentTimestamp) {
      let currentLeft = convertToRelativeX(elem.getBoundingClientRect().left);
      let currentTop = convertToRelativeY(elem.getBoundingClientRect().top);

      let blank = document.getElementById("blank").getBoundingClientRect();
      let newLeft = convertToRelativeX(blank.left) + (blank.width - elem.getBoundingClientRect().width)/2;
      let newTop = convertToRelativeY(blank.top) + (blank.height - elem.getBoundingClientRect().height)/2;

      // let currentTimestamp = document.timeline.currentTime / 1000;
      currentTimestamp /= 1000;
      let timeDiff = currentTimestamp - lastTimestamp;

      elem.style.left = lerp(currentLeft, newLeft, timeDiff * 20) + 'px';
      elem.style.top = lerp(currentTop, newTop, timeDiff * 20) + 'px';

      lastTimestamp = currentTimestamp;
      if (Math.abs(newLeft - currentLeft) > 1 || Math.abs(newTop - currentTop) > 1) {
        req = requestAnimationFrame(moveToBlank);
      } else {
        // clean up
        document.getElementById("blank").classList.add("completed");
        elem.classList.add("completed");

        playAnimation();
      }
    }

    // start tracking pointer moves
    elem.onpointermove = function(event) {
      if (elem.beingDraggedByPointer != event.pointerId) return false;

      evt = event;
      cancelAnimationFrame(req);
      req = requestAnimationFrame(move);
    };

    // on pointer up finish tracking pointer moves
    elem.onpointerup = function(event) {
      if (elem.beingDraggedByPointer != event.pointerId) return false;

      elem.onpointermove = null;
      elem.onpointerup = null;
      // ...also process the "drag end" if needed
      cancelAnimationFrame(req);
      lastTimestamp = document.timeline.currentTime;

      // clear all mouse over highlights
      blank.classList.remove("highlight");

      if (isRightAnswer && isOverTheBlank(event)) {
        req = requestAnimationFrame(moveToBlank);
      } else {
        req = requestAnimationFrame(moveBack);
      }
    };
  };
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

let num1 = undefined;
let num2 = undefined;
let leftFruit = undefined;
let rightFruit = undefined;
let answer = undefined;
let timeouts = [];
let factor = 1.0;

function playAnimation() {
  if (answer == document.getElementById("lessThan")) {
    document.getElementById("crocRight").classList.add("animated");
    let rightFruits = Array.from(document.querySelectorAll("#fruitsRight .fruit")).slice(0, num2);
    let secretRightFruits = Array.from(document.querySelectorAll("#secretFruitsRight .fruit")).slice(0, num2);
    for (let i = 0; i < rightFruits.length; i++) {
      timeouts.push(setTimeout(() => {
        rightFruits[i].classList.add("hidden");
        secretRightFruits[i].classList.add("collected");
      }, 500 + i * 150));

      timeouts.push(setTimeout(() => {
        secretRightFruits[i].classList.remove("collected");
        secretRightFruits[i].classList.add("collectedReverse");
      }, 500 + rightFruits.length * 150 + 3500 + i * 150));

      timeouts.push(setTimeout(() => {
        rightFruits[i].classList.remove("hidden");
      }, 500 + rightFruits.length * 150 + 3500 + i * 150 + 300));
    }
  } else if (answer == document.getElementById("greaterThan")) {
    document.getElementById("crocLeft").classList.add("animated");
    let leftFruits = Array.from(document.querySelectorAll("#fruitsLeft .fruit")).slice(0, num1);
    let secretLeftFruits = Array.from(document.querySelectorAll("#secretFruitsLeft .fruit")).slice(0, num1);
    for (let i = 0; i < leftFruits.length; i++) {
      timeouts.push(setTimeout(() => {
        leftFruits[i].classList.add("hidden");
        secretLeftFruits[i].classList.add("collected");
      }, 500 + i * 150));

      timeouts.push(setTimeout(() => {
        secretLeftFruits[i].classList.remove("collected");
        secretLeftFruits[i].classList.add("collectedReverse");
      }, 500 + leftFruits.length * 150 + 3500 + i * 150));

      timeouts.push(setTimeout(() => {
        leftFruits[i].classList.remove("hidden");
      }, 500 + leftFruits.length * 150 + 3500 + i * 150 + 300));
    }
  } else if (answer == document.getElementById("equalTo")) {
    playFireworks();
    let leftFruits = Array.from(document.querySelectorAll("#fruitsLeft .fruit")).slice(0, num1);
    let secretLeftFruits = Array.from(document.querySelectorAll("#secretFruitsLeft .fruit")).slice(0, num1);
    let rightFruits = Array.from(document.querySelectorAll("#fruitsRight .fruit")).slice(0, num2);
    let secretRightFruits = Array.from(document.querySelectorAll("#secretFruitsRight .fruit")).slice(0, num2);
    for (let i = 0; i < leftFruits.length; i++) {
      timeouts.push(setTimeout(() => {
        leftFruits[i].classList.add("hidden");
        secretLeftFruits[i].classList.add("collected");
        rightFruits[i].classList.add("hidden");
        secretRightFruits[i].classList.add("collected");
      }, 500 + i * 150));

      timeouts.push(setTimeout(() => {
        secretLeftFruits[i].classList.remove("collected");
        secretLeftFruits[i].classList.add("collectedReverse");
        secretRightFruits[i].classList.remove("collected");
        secretRightFruits[i].classList.add("collectedReverse");
      }, 500 + leftFruits.length * 150 + 3500 + i * 150));

      timeouts.push(setTimeout(() => {
        leftFruits[i].classList.remove("hidden");
        rightFruits[i].classList.remove("hidden");
      }, 500 + leftFruits.length * 150 + 3500 + i * 150 + 300));
    }
  }
}

function restart() {
  // reset animations
  document.getElementById("crocLeft").classList.remove("animated");
  document.getElementById("crocRight").classList.remove("animated");
  document.getElementById("blank").classList.remove("completed");
  for (let i = 0; i < timeouts.length; i++) {
    clearTimeout(timeouts[i]);
  }
  timeouts = [];

  // shuffle options
  let options = [
      `
      <div class="optionContainer">
        <div id="lessThan" class="option">
          <svg width="193px" height="193px"> <text x="50%" y="50%"> &gt; </text> </svg>
        </div>
      </div>
      `,
      `
      <div class="optionContainer">
        <div id="greaterThan" class="option">
          <svg width="193px" height="193px"> <text x="50%" y="50%"> &gt; </text> </svg>
        </div>
      </div>
      `,
      `
      <div class="optionContainer">
        <div id="equalTo" class="option">
          <svg width="193px" height="193px"> <text x="50%" y="50%"> = </text> </svg>
        </div>
      </div>
      `
  ];
  shuffle(options);
  let optionsHTML = "";
  for (option of options) {
    optionsHTML += option;
  }
  document.getElementById("options").innerHTML = optionsHTML;

  // random numbers
  let choice = randomIntFromInterval(0, 4);
  if (choice == 0) {
    // equal
    num1 = randomIntFromInterval(1, 20); 
    num2 = num1;
    answer = document.getElementById("equalTo");
  } else if (1 <= choice && choice <= 2) {
    // <
    num1 = randomIntFromInterval(1, 20);
    num2 = randomIntFromInterval(1, 20);
    while (num1 >= num2) {
      num1 = randomIntFromInterval(1, 20);
      num2 = randomIntFromInterval(1, 20);
    }
    answer = document.getElementById("lessThan");
  } else {
    // >
    num1 = randomIntFromInterval(1, 20);
    num2 = randomIntFromInterval(1, 20);
    while (num1 <= num2) {
      num1 = randomIntFromInterval(1, 20);
      num2 = randomIntFromInterval(1, 20);
    }
    answer = document.getElementById("greaterThan");
  }

  // set numbers
  document.querySelector("#numLeft svg text").innerHTML = num1;
  document.querySelector("#numRight svg text").innerHTML = num2;

  // set fruits
  let fruits = [
    "apple",
    "banana",
    "cherry",
    "kiwi",
    "melon",
    "orange",
    "pineapple",
    "strawberry"
  ];
  shuffle(fruits);
  leftFruit = fruits[0];
  rightFruit = fruits[1];
  let i = 1;
  for (fruit of document.querySelectorAll("#fruitsLeft .fruit")) {

    // remove existing fruit / hidden / collected status
    for (x of fruits) {
      fruit.classList.remove(x); 
    }
    fruit.classList.remove("hidden");
    fruit.classList.remove("collected");
    fruit.classList.remove("collectedReverse");

    // and add the new random fruit
    fruit.classList.add(leftFruit);
    // always keep 20 fruits; hide if too many
    if (i > num1) fruit.classList.add("hidden");
    i++;
  }
  i = 1;
  for (fruit of document.querySelectorAll("#fruitsRight .fruit")) {

    // remove existing fruit / hidden / collected status
    for (x of fruits) {
      fruit.classList.remove(x); 
    }
    fruit.classList.remove("hidden");
    fruit.classList.remove("collected");
    fruit.classList.remove("collectedReverse");

    // and add the new random fruit
    fruit.classList.add(rightFruit);
    // always keep 20 fruits; hide if too many
    if (i > num2) fruit.classList.add("hidden");
    i++;
  }
  for (fruit of document.querySelectorAll("#secretFruitsLeft .fruit")) {
    fruit.classList.remove("collected");
    fruit.classList.remove("collectedReverse");
    fruit.classList.remove("hidden");
  }
  for (fruit of document.querySelectorAll("#secretFruitsRight .fruit")) {
    fruit.classList.remove("collected");
    fruit.classList.remove("collectedReverse");
    fruit.classList.remove("hidden");
  }

  // make options draggable
  let lessThan = document.getElementById("lessThan");
  let greaterThan = document.getElementById("greaterThan");
  let equalTo = document.getElementById("equalTo");
  makeDraggable(lessThan, lessThan == answer);
  makeDraggable(greaterThan, greaterThan == answer);
  makeDraggable(equalTo, equalTo == answer);
}

function resize() {
  const WIDTH = 1024;
  const HEIGHT = 768;
  let winWidth = window.innerWidth;
  let winHeight = window.innerHeight;
  factor = Math.min(winWidth / WIDTH, winHeight / HEIGHT);
  let main = document.querySelector("main");
  let mainRect = main.getBoundingClientRect();
  main.style.transform = `scale(${factor}, ${factor})`;
  main.style.marginLeft = `${(winWidth - WIDTH*factor) / 2}px`;

  let bgSize = Math.min(winWidth, winHeight)/32*3.2;
  document.body.style.backgroundSize = `${bgSize}px ${bgSize}px`;
}

document.addEventListener("DOMContentLoaded", (e) => {
  document.getElementById("restartButton").onclick = restart;

  resize();
  restart();

  // no double click to zoom
  document.ondblclick = function(e) {
    e.preventDefault();
  }
});

window.addEventListener("resize", (e) => {
  resize();
});