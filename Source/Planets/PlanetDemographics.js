
function PlanetDemographics(population)
{
	this.population = population;
}

{
	PlanetDemographics.prototype.updateForTurn = function(universe, world, faction, planet)
	{
		var prosperityThisTurn = planet.prosperityPerTurn(universe, world, faction);
		this.prosperityAccumulated += prosperityThisTurn;
		var prosperityRequiredForGrowth = this.population * 2;
		if (this.prosperityAccumulated >= prosperityRequiredForGrowth)
		{
			this.prosperityAccumulated = 0;
			var populationMax = 10; // todo
			if (this.population < populationMax);
			{
				this.population++;
			}
		}
	}
}
