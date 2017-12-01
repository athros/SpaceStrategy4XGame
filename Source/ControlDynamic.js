
function ControlDynamic(name, pos, size, binding)
{
	this.name = name;
	this.pos = pos;
	this.size = size;
	this.binding = binding;

	this.boundValuePrev = null;
	this.child = null;

	// Helper variables.

	this.drawPos = new Coords();
	this.drawLoc = new Location(this.drawPos);
	this.mouseClickPos = new Coords();
	this.mouseMovePos = new Coords();
}
{
	ControlDynamic.prototype.actionHandle = function(universe, actionNameToHandle)
	{
		if (this.child != null)
		{
			this.child.actionHandle(universe, actionNameToHandle);
		}
	}

	ControlDynamic.prototype.focusGain = function()
	{
		if (this.child != null && this.child.focusGain != null)
		{
			this.child.focusGain();
		}
	}

	ControlDynamic.prototype.focusLose = function()
	{
		if (this.child != null && this.child.focusLose != null)
		{
			this.child.focusLose();
		}
	}

	ControlDynamic.prototype.mouseClick = function(universe, mouseClickPos)
	{
		var wasHandledByChild = false;
		if (this.child != null && this.child.mouseClick != null)
		{
			mouseClickPos = this.mouseClickPos.overwriteWith(mouseClickPos).subtract(this.pos);

			wasHandledByChild = this.child.mouseClick(universe, mouseClickPos);
		}
		return wasHandledByChild;
	}

	ControlDynamic.prototype.mouseEnter = function()
	{
		if (this.child != null && this.child.mouseEnter != null)
		{
			return this.child.mouseEnter();
		}
	}

	ControlDynamic.prototype.mouseExit = function()
	{
		if (this.child != null && this.child.mouseExit != null)
		{
			return this.child.mouseExit();
		}
	}

	ControlDynamic.prototype.mouseMove = function(mouseMovePos)
	{
		if (this.child != null && this.child.mouseMove != null)
		{
			mouseMovePos = this.mouseMovePos.overwriteWith(mouseMovePos).subtract(this.pos);
			return this.child.mouseMove(mouseMovePos);
		}
	}

	// drawable

	ControlDynamic.prototype.draw = function(universe, display, drawLoc)
	{
		var boundValue = this.binding.get();
		if (boundValue != this.boundValuePrev)
		{
			this.boundValuePrev = boundValue;
			if (boundValue == null)
			{
				this.child = null;
			}
			else if (boundValue.controlBuild != null)
			{
				this.child = boundValue.controlBuild(universe, this.size);
			}
		}

		if (this.child != null)
		{
			var drawLoc = this.drawLoc.overwriteWith(drawLoc);
			drawLoc.pos.add(this.pos);
			this.child.draw(universe, display, drawLoc);
		}
	}
}