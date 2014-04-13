var app = angular.module('game', []);

function Level() {
  var args = Array.prototype.slice.call(arguments),
      size = Math.sqrt(args.length);

  if (Math.ceil(size) > size) throw new Error('Invalid Level size');

  this.valueAt = function (x, y) {
    if (x < 0 || y < 0 || x >= size || y >= size) return 0;
	return args[(y * size) + x];
  };

  this.getValues = function (x, y, pov) {
    var length = (pov * 2) + 1,
	    dx = x - pov,
	    values = [];

	for (var i = 0; i < length; ++i) {
	  var oy  = (y - pov + i) * size,
		  row = oy < 0 ? [] : args.slice(dx < 0 ? oy + Math.abs(dx) : oy + dx, Math.min(oy + dx + length, oy + size));

	  if (oy >= 0 && dx < 0) row = args.slice(oy, oy + length + dx);
	  while (row.length < length) dx < 0 ? row.unshift(0) : row.push(0);

	  values = row.concat(values);
	}

	return values;
  };

  this.getSize = function () { return size; };
}

app.controller('GameCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
  var level = new Level(
	1,1,1,1,1,1,1,1,1,1,1,1,1,
	1,1,1,1,1,1,1,1,1,1,1,1,1,
	1,1,1,1,1,1,1,1,1,1,1,1,1,
	1,1,1,1,1,1,1,1,1,1,1,1,1,
	1,1,1,1,1,1,1,1,1,1,1,1,1,
	1,1,1,1,1,1,2,1,1,1,1,1,1,
	1,1,1,1,1,1,1,1,1,1,1,1,1,
	1,1,1,1,1,1,1,1,1,1,1,1,1,
	1,1,1,1,1,1,1,1,1,1,1,1,1,
	1,1,1,1,1,1,1,1,1,1,1,1,1,
	1,1,1,1,1,1,1,1,1,1,1,1,1,
	1,1,1,1,1,1,1,1,1,1,1,1,1,
	1,1,1,1,1,1,1,1,1,1,1,1,1
  );

  var KEYS = [65, 68, 87, 83];

  var keysLocked = false,
      timeLocked = false;
  
  var turnDelta = 0,
      turnValue = 0,
	  localX = 5,
	  localY = 5,
      stepX = 0,
	  stepY = 0,
	  pov = 5;

  $scope.transition = false;
  
  function updateValues() { return level.getValues(localX, localY, pov); };

  $scope.tiles = updateValues();

  $scope.getSides = function ($index) {
    var value  = $scope.tiles[$index],
	    length = (pov * 2) + 1,
		tx = $index % length,
		ty = Math.floor($index / length),
		sides = [];
	//console.log(tx, ty);

	switch (value) {
	  case 2: sides.push('front', 'right', 'back', 'left'); break;
	  case 1: sides.push('floor', 'ceil'); break;
	}

	return sides;
  };

  $scope.getDirection = function () {
    var r = 90 * turnValue,
	    x = -74 * stepX,
		y = 74 * stepY;

    var str = 'rotateZ(' + r.toString() + 'deg) translateX(' + x.toString() + 'px) translateY(' + y.toString() + 'px)';

    return {
	  '-moz-transform': str,
	  '-webkit-transform': str,
	  'transform': str
	};
  };

  $scope.getLightness = function ($index) {
    return 0;
  };

  $scope.onKeyDown = function ($event) {
    var moving = false;

    if (!keysLocked && !timeLocked) {
      keysLocked = true;

	  if (KEYS.indexOf($event.keyCode) !== -1) {
	    timeLocked = true;

        switch ($event.keyCode) {
          case 65:
		    turnValue++;
		    turnDelta++;
		    if (turnDelta > 3) turnDelta = 0;
		    break;
          case 68:
		    turnValue--;
            turnDelta--;
		    if (turnDelta< 0) turnDelta = 3;
		    break;
		  default:
		    var k = event.keyCode === 83 ? -1 : 1;

			moving = true;

			if (turnDelta % 2 === 0) !turnDelta ? stepY += k : stepY -= k;
			else turnDelta === 1 ? stepX -= k : stepX += k;

		    break;
        }

		if (moving && level.valueAt(localX + stepX, localY + stepY) === 1) {
		  if (event.keyCode === 87) {
            localX += stepX;
		    localY += stepY;
		    stepX *= -1;
		    stepY *= -1;
		    $scope.tiles = updateValues();

			// delay animation to update tiles
		    $timeout(function () {
		      $scope.transition = true;
		      stepX = stepY = 0;

			  $timeout(function () { $scope.transition = timeLocked = false; }, 500);
		    }, 40);
		  } else {
		    $scope.transition = true;

            $timeout(function () {
		      localX += stepX;
		      localY += stepY;

		      stepX = stepY = 0;
		      $scope.transition = timeLocked = false;
		      $scope.tiles = updateValues();
		    }, 500);
		  }
		} else if (!moving) {
		  $scope.transition = true;

		  $timeout(function () { $scope.transition = timeLocked = false; }, 500);
		} else {
		  timeLocked = false;
		  stepX = stepY = 0;
		}
	  }
	}
  };

  $scope.onKeyUp = function () { keysLocked = false; };
}]);