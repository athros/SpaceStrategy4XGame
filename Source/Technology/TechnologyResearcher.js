
function TechnologyResearcher
(
	name, 
	nameOfTechnologyBeingResearched,
	researchAccumulated,
	namesOfTechnologiesKnown
)
{
	this.name = name;
	this.nameOfTechnologyBeingResearched = nameOfTechnologyBeingResearched;
	this.researchAccumulated = researchAccumulated;
	this.namesOfTechnologiesKnown = namesOfTechnologiesKnown;
}

{
	TechnologyResearcher.prototype.buildablesAvailable = function()
	{
		var returnValues = [];

		return returnValues;
	}

	TechnologyResearcher.prototype.researchAccumulatedIncrement = function(universe, amountToIncrement)
	{
		var technologyBeingResearched = this.technologyBeingResearched(universe);

		if (technologyBeingResearched == null)
		{
			var notification = new Notification("Default", universe.world.turnsSoFar, "Nothing being researched.");
			// todo
		}
		else
		{
			this.researchAccumulated += amountToIncrement;

			var researchRequired = technologyBeingResearched.researchRequired;
			if (this.researchAccumulated >= researchRequired)
			{
				this.namesOfTechnologiesKnown.push
				(
					this.nameOfTechnologyBeingResearched
				);
				this.nameOfTechnologyBeingResearched = null;
				this.researchAccumulated = 0;
			}
		}
	}

	TechnologyResearcher.prototype.strength = function()
	{
		var returnValue = 0;

		var technologiesKnown = this.technologiesKnown();
		for (var i = 0; i < technologiesKnown.length; i++)
		{
			var tech = technologiesKnown[i];
			returnValue += tech.strength();
		}

		return returnValue;
	}

	TechnologyResearcher.prototype.technologiesAvailable = function(technologyResearchSession)
	{
		var technologyTree = technologyResearchSession.technologyTree;
		var technologies = technologyTree.technologies;
		var technologiesKnown = this.namesOfTechnologiesKnown;
		var technologiesUnknown = [];

		for (var i = 0; i < technologies.length; i++)
		{
			var technology = technologies[i];
			var technologyName = technology.name;

			var isAlreadyKnown = (technologiesKnown.indexOf(technologyName) >= 0);

			if (isAlreadyKnown == false)
			{
				technologiesUnknown.push(technology);
			}
		}

		var technologiesUnknownWithKnownPrerequisites = [];

		for (var i = 0; i < technologiesUnknown.length; i++)
		{
			var technology = technologiesUnknown[i];
			var prerequisites = technology.namesOfPrerequisiteTechnologies;

			var areAllPrerequisitesKnown = true;

			for (var p = 0; p < prerequisites.length; p++)
			{
				var prerequisite = prerequisites[p];
				var isPrerequisiteKnown = 
				(
					technologiesKnown.indexOf(prerequisite) >= 0
				);

				if (isPrerequisiteKnown == false)
				{
					areAllPrerequisitesKnown = false;
					break;
				}
			}

			if (areAllPrerequisitesKnown == true)
			{
				technologiesUnknownWithKnownPrerequisites.push
				(
					technology
				);
			}
		}

		return technologiesUnknownWithKnownPrerequisites;
	}

	TechnologyResearcher.prototype.technologiesKnown = function(universe)
	{
		var returnValues = [];

		for (var i = 0; i < this.namesOfTechnologiesKnown.length; i++)
		{
			var techName = this.namesOfTechnologiesKnown[i];
			var technology = universe.world.technologyTree.technologies[techName];
			returnValues.push(technology);
		}

		return returnValues;
	}

	TechnologyResearcher.prototype.technologyBeingResearched = function(universe)
	{
		var technologyTree = universe.world.technologyTree;

		var returnValue = technologyTree.technologies[this.nameOfTechnologyBeingResearched];

		return returnValue;
	}

	// turns

	TechnologyResearcher.prototype.updateForTurn = function(universe, faction)
	{
		var researchThisTurn = faction.researchPerTurn(universe);
		this.researchAccumulatedIncrement(universe, researchThisTurn);
	}
}