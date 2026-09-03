/**
* Wordfind.js 0.0.1
* (c) 2012 Bill, BunKat LLC.
* Wordfind is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/wordfind
*/

(function (document, $, wordfind) {
  'use strict';

  /**
  * An example game using the puzzles created from wordfind.js. Click and drag
  * to highlight words.
  *
  * WordFindGame requires wordfind.js and jQuery.
  */

    /**
    * Draws the puzzle by inserting rows of buttons into el.
    *
    * @param {String} el: The jQuery element to write the puzzle to
    * @param {[[String]]} puzzle: The puzzle to draw
    */
    var drawPuzzle = function (el, puzzle) {
      var output = '';
      var gridWidth = puzzle.length ? puzzle[0].length : 0;
      // for each row in the puzzle
      for (var i = 0, height = puzzle.length; i < height; i++) {
        // append a div to represent a row in the puzzle
        var row = puzzle[i];
        output += '<div class="puzzleRow">';
        // for each element in that row
        for (var j = 0, width = row.length; j < width; j++) {
            // append our button with the appropriate class
            output += '<button class="puzzleSquare" x="' + j + '" y="' + i + '">';
            output += row[j] || '&nbsp;';
            output += '</button>';
        }
        // close our div that represents a row
        output += '</div>';
      }

      $(el).html(output);
      // expose the grid width as a CSS variable so the stylesheet can
      // compute a responsive square size that always fits the viewport
      $(el).css('--cols', gridWidth);
    };

    var getWords = function () {
      return $('input.word').toArray().map(wordEl => wordEl.value.toLowerCase()).filter(word => word);
    };

    /**
    /**
    * Given a start point and an end point, returns the full list of grid
    * cells that form a straight line between them (horizontal, vertical,
    * or 45° diagonal). Returns null if the two points don't form a
    * straight line in one of those 8 directions.
    *
    * @param {int} x1: The x coordinate of the first point
    * @param {int} y1: The y coordinate of the first point
    * @param {int} x2: The x coordinate of the second point
    * @param {int} y2: The y coordinate of the second point
    */
    var calcPath = function (x1, y1, x2, y2) {
      var dx = x2 - x1, dy = y2 - y1;

      if (!(dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy))) {
        return null;
      }

      var steps = Math.max(Math.abs(dx), Math.abs(dy));
      var stepX = steps === 0 ? 0 : dx / steps;
      var stepY = steps === 0 ? 0 : dy / steps;

      var path = [];
      for (var i = 0; i <= steps; i++) {
        path.push({ x: x1 + stepX * i, y: y1 + stepY * i });
      }
      return path;
    };


  /**
  * Initializes the WordFindGame object.
  *
  * Creates a new word find game and draws the board and words.
  *
  * Returns the puzzle that was created.
  *
  * @param {String} puzzleEl: Selector to use when inserting the puzzle
  * @param {Options} options: WordFind options to use when creating the puzzle
  */
  var WordFindGame = function (puzzleEl, options) {

    // Class properties, game initial config:
    var wordList, puzzle;

    /**
    * Game play events.
    *
    * The following events handle the turns, word selection, word finding, and
    * game end.
    *
    */

    // Game state
    var startSquare, selectedSquares = [], curOrientation, curWord = '';

    /**
    * Event that handles mouse down on a new square. Initializes the game state
    * to the letter that was selected.
    *
    */
    var startTurn = function () {
      $(this).addClass('selected');
      startSquare = this;
      selectedSquares.push(this);
      curWord = $(this).text();
    };
    
    var touchStart = function(e) {
      // Evita que el navegador interprete el toque como "hacer scroll"
      // o abra el menú de selección de texto de iOS
      e.preventDefault();
      startTurn.call(this);
    };

    var touchMove = function(e) {
      e.preventDefault();
      var touch = e.originalEvent.touches[0];
      // clientX/clientY son coordenadas relativas a la pantalla visible;
      // pageX/pageY incluyen el scroll de la página y pueden desalinearse
      var targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
      select(targetElement)
    };

    var touchEnd = function(e) {
      e.preventDefault();
      endTurn.call(this);
    };
    
    var mouseMove = function() { 
      select(this);
    };

    /**
    * Event that handles mouse over / touch move on a new square. Recomputes
    * the full straight-line path from the starting square to this one and
    * highlights exactly that path. Recalculating from scratch on every move
    * (instead of accumulating letter by letter) means a single skipped
    * square during a fast mobile drag doesn't permanently break the rest
    * of the gesture — it just self-corrects on the next move.
    *
    */
    var select = function (target) {
      if (!startSquare || !target) {
        return;
      }

      var $target = $(target);
      if (!$target.hasClass('puzzleSquare')) {
        return;
      }

      var x1 = $(startSquare).attr('x') - 0, y1 = $(startSquare).attr('y') - 0;
      var x2 = $target.attr('x') - 0, y2 = $target.attr('y') - 0;

      var path = calcPath(x1, y1, x2, y2);

      // no es una línea recta válida (ni horizontal, ni vertical, ni
      // diagonal a 45°): ignoramos este movimiento y dejamos el último
      // camino válido resaltado
      if (!path) {
        return;
      }

      $(selectedSquares).removeClass('selected');
      selectedSquares = [];
      curWord = '';

      for (var i = 0, len = path.length; i < len; i++) {
        var square = $('.puzzleSquare[x="' + path[i].x + '"][y="' + path[i].y + '"]')[0];
        // esto no debería pasar, pero por seguridad: si alguna casilla
        // del camino no existe (fuera del tablero), abortamos limpio
        if (!square) {
          selectedSquares = [];
          curWord = '';
          return;
        }
        $(square).addClass('selected');
        selectedSquares.push(square);
        curWord += $(square).text();
      }
    };

    /**
    * Event that handles mouse up on a square. Checks to see if a valid word
    * was created and updates the class of the letters and word if it was. Then
    * resets the game state to start a new word.
    *
    */
    var endTurn = function () {
      // see if we formed a valid word
      for (var i = 0, len = wordList.length; i < len; i++) {
        
        if (wordList[i] === curWord) {
          $('.selected').addClass('found');
          wordList.splice(i,1);
          $('input.word[value="' + curWord + '"]').addClass('wordFound');
        }

        if (wordList.length === 0) {
          $('.puzzleSquare').addClass('complete');
        }
      }

      // reset the turn
      $('.selected').removeClass('selected');
      startSquare = null;
      selectedSquares = [];
      curWord = '';
      curOrientation = null;
    };

    /* Constructor START */
    $('input.word').removeClass('wordFound');

    // Class properties, game initial config:
    wordList = getWords().sort();
    puzzle = wordfind.newPuzzleLax(wordList, options);

    // Draw all of the words
    drawPuzzle(puzzleEl, puzzle);

    // attach events to the buttons
    // optimistically add events for windows 8 touch
    if (window.navigator.msPointerEnabled) {
      $('.puzzleSquare').on('MSPointerDown', startTurn);
      $('.puzzleSquare').on('MSPointerOver', select);
      $('.puzzleSquare').on('MSPointerUp', endTurn);
    } else {
      $('.puzzleSquare').mousedown(startTurn);
      $('.puzzleSquare').mouseenter(mouseMove);
      $('.puzzleSquare').mouseup(endTurn);
      $('.puzzleSquare').on("touchstart", touchStart);
      $('.puzzleSquare').on("touchmove", touchMove);
      $('.puzzleSquare').on("touchend", touchEnd);
    }

    /**
    * Solves an existing puzzle.
    *
    * @param {[[String]]} puzzle: The puzzle to solve
    */
    this.solve = function() {
      var solution = wordfind.solve(puzzle, wordList).found;

      for( var i = 0, len = solution.length; i < len; i++) {
        var word = solution[i].word,
            orientation = solution[i].orientation,
            x = solution[i].x,
            y = solution[i].y,
            next = wordfind.orientations[orientation];

        var wordEl = $('input.word[value="' + word + '"]');
        if (!wordEl.hasClass('wordFound')) {
          for (var j = 0, size = word.length; j < size; j++) {
            var nextPos = next(x, y, j);
            $('[x="' + nextPos.x + '"][y="' + nextPos.y + '"]').addClass('solved');
          }

          wordEl.addClass('wordFound');
        }
      }
    };
  };

  WordFindGame.emptySquaresCount = function () {
    var allSquares = $('.puzzleSquare').toArray();
    return allSquares.length - allSquares.filter(b => b.textContent.trim()).length;
  };

  // Static method
  WordFindGame.insertWordBefore = function (el, word) {
    $('<li><input class="word" value="' + (word || '') + '"></li>').insertBefore(el);
  };


  /**
  * Allow game to be used within the browser
  */
  window.WordFindGame = WordFindGame;

}(document, jQuery, wordfind));
