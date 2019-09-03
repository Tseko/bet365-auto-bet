var shouldPlaceBet = false; // true ако искаш скрипта, да почне да натиска бутона 'Заложи'. Това е цел ТЕСТ, че слага правилите мачове в правилното каре с правилния залог.
var configAfterMinute = 72; // От коя минута да почне да следи коефициентите
var configBelowOdd = 1.3; 	// Под кой коефициент да се активизира
var configBetAmount = 1;	// Сумата която да залага
var refreshRateInSeconds = 1; // На колко време да се изпълнява скрипта (секунди)

function removeHighlight(element){
	const highLightClass = "gll-ParticipantCentered_Highlighted";
	if (element.classList.contains(highLightClass))
	{
		element.click();
		element.classList.remove(highLightClass);		
	}
}

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
		let oddElementValue = oddElement.value;
		try
		{
			odd = parseInt(oddElementValue);
		}
		catch(error)
		{
			console.log(`Ред ${index+1}: ` + error + "Прихванатият коефициент не е число! Стойност: " + oddElementValue);
			return;
		}
	}
	
	if (odd == null || odd > configBelowOdd)
	{
		return;
	}
	
	// Преминаваме към залога, защото стойността на коефициента е под или равна на зададения от потребителя.
	removeHighlight(element);
	element.click();
	
	let iframeBedModule = document.getElementsByClassName("bw-BetslipWebModule_Frame")[0].contentDocument;
	
	let stakeElements = iframeBedModule.getElementsByClassName("bs-Stake_TextBox");
	if (stakeElements.length == 0 || typeof stakeElements[0] == "undefined")
	{
		console.log(`Ред ${index+1}: Не успяхме да открием полето за въвеждане на сума за залог.`);
		return;
	}
	
	let firstStakeElement = stakeElements[0];
	
	let potentialChangeAcceptanceElement = iframeBedModule.getElementsByClassName("acceptChanges bs-BtnWrapper");
	
	if (potentialChangeAcceptanceElement.length == 1 && !potentialChangeAcceptanceElement[0].classList.contains("hidden"))
	{
		potentialChangeAcceptanceElement[0].click();
	}
	
	let betButtonElements = iframeBedModule.getElementsByClassName("placeBet bs-BtnWrapper");
	
	if (betButtonElements.length == 1 && !betButtonElements[0].classList.contains("hidden") && shouldPlaceBet)
	{
		firstStakeElement.value = configBetAmount;
		betButtonElements[0].click();
	}	
}

function processRow(rowElement, index)
{
	var firstColumnDivs = rowElement.querySelector(".ipo-MainMarkets").getElementsByClassName("ipo-MainMarketRenderer")[0].childNodes;
	var firstTeamOddElement = firstColumnDivs[0];
	var secondTeamOddElement = firstColumnDivs[1];
	var evenOddElement = firstColumnDivs[2];
	
	if (firstTeamOddElement.childNodes.length == 0 &&
		secondTeamOddElement.childNodes.length == 0 &&
		evenOddElement.childNodes.length == 0)
		{
			console.log(`Ред ${index+1}: Изчакваме, защото няма коефициенти в първата колона.`);
			return;
		}
		
	// Залогаме на всеки един от коефициентите ако е със стойност под зададената от потребителя.
	checkOddsAndBet(firstTeamOddElement, index);
	checkOddsAndBet(secondTeamOddElement, index);
	checkOddsAndBet(evenOddElement, index);
}

setInterval(function(){
	var rows = document.getElementsByClassName("ipo-Fixture_TableRow");
	for (var index = 0; index < rows.length; index++)
	{
		let currentRow = rows[index];
		
		let time = null;
		try
		{
			time = parseInt(currentRow.childNodes[0].childNodes[0].childNodes[0].textContent.split(":")[0]);
		
		}
		catch(error)
		{
			console.log("Възникна грешка при установяването на изминалото време. " + error);
			return;
		}
		
		if (time != null && time >= configAfterMinute)
		{
			processRow(currentRow, index);
		}
		else
		{
			console.log(`Ред ${index+1}: Изчакваме, защото сме в ${time} минута. Ще се активизираме на ${configAfterMinute} минута.`);
		}
	}
}, refreshRateInSeconds * 1000);