var shouldPlaceBet = false;   // true ако искаш скрипта, да почне да натиска бутона 'Заложи'. Това е цел ТЕСТ, че слага правилите мачове в правилното каре с правилния залог.
var configAfterMinute = 80;   // От коя минута да почне да следи коефициентите
var configAboveOdd = 0;       // Ако искаш коефицинта да е интервал това е долната граница.
var configBelowOdd = 1.2; 	  // Под кой коефициент да се активизира. Горна граница за коефициента.
var configBetAmount = 0.25;	  // Сумата която да залага


function clearAllSelections(callback) {
  let iframeBedModule = document.getElementsByClassName("bw-BetslipWebModule_Frame")[0].contentDocument;

  let removeAllButtons = iframeBedModule.getElementsByClassName("bs-Header_RemoveAllLink");

  if (removeAllButtons.length) {
    removeAllButtons[0].click();
    console.log("Изчистване на селекциите.");
  }

  if (typeof callback == "function") {
    callback();
  }
}

function getOddFromElement(element, index) {
  let odd = null;
  if (element.childNodes.length == 2) {
    let oddElement = element.childNodes[1];
    if (typeof oddElement == "undefined" || !oddElement.classList.contains("gll-ParticipantCentered_Odds")) {
      console.log(`Ред ${index + 1}: Не можем да прихванем елемента съдържащ коефициента.`);
      return null;
    }

    let oddElementValue = oddElement.innerHTML;
    try {
      odd = parseFloat(oddElementValue);
    }
    catch (error) {
      console.log(`Ред ${index + 1}: ` + error + "Прихванатият коефициент не е число! Стойност: " + oddElementValue);
      return null;
    }
  }

  if (odd == null || isNaN(odd)) {
    return null;
  }

  return odd;
}

function checkOddsAndMakeSelection(element, index) {
  let odd = getOddFromElement(element, index);

  if (odd != null && configAboveOdd < odd && odd < configBelowOdd && !element.classList.contains("gll-ParticipantCentered_Highlighted")) {
    console.log(`Ред ${index + 1}: Прихванат коефициент: ${odd}`);
    // Клик върху коефициента.
    element.click();
  } else {
    console.log(`Ред ${index + 1}: Зададен коефициент: Между ${configAboveOdd} и ${configBelowOdd}. Прихванат коефициент: ${odd}. Не правим селекция.`);
  }
}

function makeSelections(callback) {
  var rows = document.getElementsByClassName("ipo-Fixture_TableRow");
  for (var index = 0; index < rows.length; index++) {
    let currentRow = rows[index];
    console.log(`Ред ${index + 1} се обработва...`);

    let time = null;
    try {
      time = parseInt(currentRow.childNodes[0].childNodes[0].childNodes[0].textContent.split(":")[0]);
    }
    catch (error) {
      console.log("Възникна грешка при установяването на изминалото време. " + error);
      continue;
    }

    var firstColumnDivs = currentRow.querySelector(".ipo-MainMarkets").getElementsByClassName("ipo-MainMarketRenderer")[0].childNodes;
    var firstTeamOddElement = firstColumnDivs[0];
    var secondTeamOddElement = firstColumnDivs[1];
    var evenOddElement = firstColumnDivs[2];

    if (time != null && time >= configAfterMinute) {
      if (firstTeamOddElement.childNodes.length == 0 &&
        secondTeamOddElement.childNodes.length == 0 &&
        evenOddElement.childNodes.length == 0) {
        console.log(`Ред ${index + 1}: Изчакваме, защото няма коефициенти в първата колона.`);
        continue;
      }

      // Залогаме на всеки един от коефициентите ако е със стойност под зададената от потребителя.
      checkOddsAndMakeSelection(firstTeamOddElement, index);
      checkOddsAndMakeSelection(secondTeamOddElement, index);
      checkOddsAndMakeSelection(evenOddElement, index);
    }
    else {
      console.log(`Ред ${index + 1}: Изчакваме, защото сме в ${time} минута. Ще се активизираме на ${configAfterMinute} минута.`);
    }
  }

  if (typeof callback == "function") {
    callback();
  }
}

function makeBetForAllSelections() {
  let iframeElement = document.getElementsByClassName("bw-BetslipWebModule_Frame")[0].contentDocument;

  // Стойността на залога би трябвало да е в кутийката. Продължаваме към клик на бутона "Заложи"
  let potentialChangeAcceptanceElement = iframeElement.getElementsByClassName("acceptChanges bs-BtnWrapper");

  if (potentialChangeAcceptanceElement.length == 1 && !potentialChangeAcceptanceElement[0].classList.contains("hidden")) {
    potentialChangeAcceptanceElement[0].click();
    console.log("Клик върху бутона 'Приемане на промените'");
  } else {
    console.log("Не открихме бутон за 'Приемане на промените'");
  }

  let betButtonElements = iframeElement.getElementsByClassName("bs-Btn bs-BtnHover");

  if (betButtonElements.length == 1 && !betButtonElements[0].classList.contains("hidden") && shouldPlaceBet) {
    betButtonElements[0].click();
    console.log("Клик върху бутона 'Заложи'");
  } else {
    console.log("Не открихме бутон за 'Заложи'");
  }
}

function placeBetForAllSelections(callback) {
  let iframeElement = document.getElementsByClassName("bw-BetslipWebModule_Frame")[0].contentDocument;
  let stakeElements = iframeElement.getElementsByClassName("bs-Stake_TextBox");
  let selectionDescriptions = iframeElement.getElementsByClassName("bs-Selection");
  if (stakeElements.length) {
    for (let index = 0; index < stakeElements.length; index++) {
      const stakeElement = stakeElements[index];
      let uniqueName = generateUniqueName(selectionDescriptions[index]);
      if (alreadyAddedSelection(uniqueName)) {
        console.log(`Вече имаме активен залог за "${uniqueName}", така че го пропускаме.`);
        stakeElement.setAttribute("value", "");
        let removeButtons = stakeElement
          .parentNode
          .parentNode
          .parentNode
          .parentNode
          .children[0].getElementsByClassName("bs-RemoveColumn_Button remove");

        if (removeButtons.length) {
          removeButtons[0].click();
        }
      } else {
        stakeElement.setAttribute("value", configBetAmount);
        addSelectionDescription(uniqueName);
      }
    }
  }
  else {
    console.log("Няма открити селекции.");
  }

  if (typeof callback == "function") {
    callback();
  }
}

function generateUniqueName(selectionDescriptions) {
  let name = "";
  let childDivs = selectionDescriptions.children;
  if (childDivs.length == 3) {
    name += childDivs[0].innerText.trim();
    name += childDivs[1].innerText.trim();
    name += childDivs[2].innerText.trim();
  }

  if (name == "") {
    throw "Не успяхме да генерираме уникално име за селекцията.";
  }

  return name;
}

function clearProcessData() {
  localStorage.madeSelections = undefined;
  console.log("Историята на залозите е изтрита. Може да стартирате отново процеса чрез startProcess()");
}

function alreadyAddedSelection(uniqueName) {
  let madeSelections = localStorage.madeSelections;
  if (typeof madeSelections == "undefined" || madeSelections == "undefined") {
    return false;
  }

  let deserializedMadeSelections = JSON.parse(localStorage.madeSelections);
  return deserializedMadeSelections.includes(uniqueName);
}

function addSelectionDescription(uniqueName) {
  let madeSelections = localStorage.madeSelections;
  let madeSelectionsArray = [];

  if (typeof madeSelections != "undefined" && madeSelections != "undefined") {
    madeSelectionsArray = JSON.parse(localStorage.madeSelections);
  }

  if (!madeSelectionsArray.includes(uniqueName)) {
    madeSelectionsArray.push(uniqueName);
  }
  localStorage.madeSelections = JSON.stringify(madeSelectionsArray);
}

function startProcess() {
  clearAllSelections(function () {
    setTimeout(function () { // Wait 1s
      makeSelections(function () {
        setTimeout(function () { // Wait 1s
          placeBetForAllSelections(function () {
            setTimeout(function () { // Wait 1s
              makeBetForAllSelections();
            }, 1000);
          });
        }, 1000);
      });
    }, 1000);
  });
}

var processInterval = [];
/** * Accepts seconds as parameter */
function repeatProcess(seconds) {
  if (typeof seconds == "undefined" || seconds == 0) {
    throw "Моля въведете валидна стойност за секундите на които искате скрипта да се повтаря.";
  }

  if (seconds < 10) {
    throw "Минимумът за интервал на повторение е 10 секунди.";
  }

  processInterval.push(setInterval(function () {
    startProcess();
  }, seconds * 1000));
}

function stopRepeating() {
  processInterval.forEach(processId => {
    clearInterval(processId);
  });
}