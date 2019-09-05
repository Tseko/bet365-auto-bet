var shouldPlaceBet = false;   // true ако искаш скрипта, да почне да натиска бутона 'Заложи'. Това е цел ТЕСТ, че слага правилите мачове в правилното каре с правилния залог.
var configAfterMinute = 30;   // От коя минута да почне да следи коефициентите
var configBelowOdd = 1.1; 	  // Под кой коефициент да се активизира
var configBetAmount = 0.25;	  // Сумата която да залага
//var refreshRateInSeconds = 5; // На колко време да се изпълнява скрипта (секунди)


function clearAllSelections(callback) {
  let iframeBedModule = document.getElementsByClassName("bw-BetslipWebModule_Frame")[0].contentDocument;

  let removeAllButtons = iframeBedModule.getElementsByClassName("bs-Header_RemoveAllLink");

  if (removeAllButtons.length) {
    removeAllButtons[0].click();
    console.log("Изчистване на селекциите.");
  }
  callback();
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

  if (odd != null && odd < configBelowOdd && !element.classList.contains("gll-ParticipantCentered_Highlighted")) {
    console.log(`Ред ${index + 1}: Прихванат коефициент: ${odd}`);
    // Клик върху коефициента.
    element.click();
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
      //checkOddsAndBet(secondTeamOddElement, index);
      //checkOddsAndBet(evenOddElement, index);
    }
    else {
      console.log(`Ред ${index + 1}: Изчакваме, защото сме в ${time} минута. Ще се активизираме на ${configAfterMinute} минута.`);
    }
  }

  if (typeof callback == "function") {
    callback();
  }
}

function placeBetForAllSelections() {
  let iframeElement = document.getElementsByClassName("bw-BetslipWebModule_Frame")[0].contentDocument;
  let stakeElements = iframeElement.getElementsByClassName("bs-Stake_TextBox");
  if (stakeElements.length) {
    for (let index = 0; index < stakeElements.length; index++) {
      const stakeElement = stakeElements[index];
      stakeElement.setAttribute("value", configBetAmount);
    }

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
  else {
    console.log("Не успяхме да открием полета за въвеждане на сума за залог.");
  }
}

function startProcess() {
  clearAllSelections(function () {
    setTimeout(function () { // Wait 1s
      makeSelections(function () {
        setTimeout(function () { // Wait 1s
          placeBetForAllSelections();
        }, 1000);
      });
    }, 1000);
  });
}