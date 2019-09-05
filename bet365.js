var shouldPlaceBet = false; // true ако искаш скрипта, да почне да натиска бутона 'Заложи'. Това е цел ТЕСТ, че слага правилите мачове в правилното каре с правилния залог.
var configAfterMinute = 30; // От коя минута да почне да следи коефициентите
var configBelowOdd = 1.1; 	// Под кой коефициент да се активизира
var configBetAmount = 0.25;	// Сумата която да залага
var refreshRateInSeconds = 5; // На колко време да се изпълнява скрипта (секунди)

function checkOddsAndBet(element, index)
{
	let odd = null;	
	if (element.childNodes.length == 2)
	{
		let oddElement = element.childNodes[1];
		if (typeof oddElement == "undefined" || !oddElement.classList.contains("gll-ParticipantCentered_Odds"))
		{
			console.log(`Ред ${index+1}: Не можем да прихванем елемента съдържащ коефициента.`);
			return;
		}
    
		let oddElementValue = oddElement.innerHTML;
		try
		{
			odd = parseFloat(oddElementValue);
		}
		catch(error)
		{
			console.log(`Ред ${index+1}: ` + error + "Прихванатият коефициент не е число! Стойност: " + oddElementValue);
			return;
		}
	}

	if (odd == null || odd > configBelowOdd || isNaN(odd))
	{
		return;
	}

	console.log(`Ред ${index+1}: Прихванат коефициент: ${odd}`);

if(!element.classList.contains("gll-ParticipantCentered_Highlighted"))
{
	// Клик върху коефициента
	element.click();
}

	var checkExist = setInterval(function() {
    
    let stakeElements = document.getElementsByClassName("bw-BetslipWebModule_Frame")[0].contentDocument.getElementsByClassName("bs-Stake_TextBox");
  	if (stakeElements.length >= 0 && !stakeElements[0].classList.contains("hidden"))
  	{
  		stakeElements[0].setAttribute("value", configBetAmount);
      console.log(stakeElements[0]);

      // Стойността на залога би трябвало да е в кутийката. Продължаваме към клик на бутона "Заложи"
    	let potentialChangeAcceptanceElement = document.getElementsByClassName("bw-BetslipWebModule_Frame")[0].contentDocument.getElementsByClassName("acceptChanges bs-BtnWrapper");
    	
    	if (potentialChangeAcceptanceElement.length == 1 && !potentialChangeAcceptanceElement[0].classList.contains("hidden"))
    	{
    		potentialChangeAcceptanceElement[0].click();
    	}
    	
    	let betButtonElements = document.getElementsByClassName("bw-BetslipWebModule_Frame")[0].contentDocument.getElementsByClassName("bs-Btn bs-BtnHover");
    	
    	if (betButtonElements.length == 1 && !betButtonElements[0].classList.contains("hidden") && shouldPlaceBet)
    	{
    		document.getElementsByClassName("bw-BetslipWebModule_Frame")[0].contentDocument.getElementsByClassName("bs-Btn bs-BtnHover")[0].click();
    	}	

      clearInterval(checkExist);
  	}
  	else
    {
  		console.log(`Ред ${index+1}: Не успяхме да открием полето за въвеждане на сума за залог.`);
    }
}, 500);

  
}

function startProcess(){
//setInterval(function(){
	var rows = document.getElementsByClassName("ipo-Fixture_TableRow");
	for (var index = 0; index < rows.length; index++)
	{
  		let currentRow = rows[index];
			console.log(`Ред ${index+1} се обработва.`);
  		
  		let time = null;
  		try
  		{
  			time = parseInt(currentRow.childNodes[0].childNodes[0].childNodes[0].textContent.split(":")[0]);
  		}
  		catch(error)
  		{
  			console.log("Възникна грешка при установяването на изминалото време. " + error);
  			continue;
  		}
  		
      var firstColumnDivs = currentRow.querySelector(".ipo-MainMarkets").getElementsByClassName("ipo-MainMarketRenderer")[0].childNodes;
    	var firstTeamOddElement = firstColumnDivs[0];
    	var secondTeamOddElement = firstColumnDivs[1];
    	var evenOddElement = firstColumnDivs[2];
      	
  		if (time != null && time >= configAfterMinute)
  		{
      	if (firstTeamOddElement.childNodes.length == 0 &&
      		secondTeamOddElement.childNodes.length == 0 &&
      		evenOddElement.childNodes.length == 0)
      		{
      			console.log(`Ред ${index+1}: Изчакваме, защото няма коефициенти в първата колона.`);
      			continue;
      		}
      		
        	// Залогаме на всеки един от коефициентите ако е със стойност под зададената от потребителя.
        	checkOddsAndBet(firstTeamOddElement, index);
        	//checkOddsAndBet(secondTeamOddElement, index);
        	//checkOddsAndBet(evenOddElement, index);
  		}
  		else
  		{
  			console.log(`Ред ${index+1}: Изчакваме, защото сме в ${time} минута. Ще се активизираме на ${configAfterMinute} минута.`);
  		}
	}
}
//}, refreshRateInSeconds * 1000);
