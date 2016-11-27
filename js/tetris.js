(function(context) { 
    var COLS = 20, 
        ROWS = 20,
        W = 400, 
        H = 600,
        BLOCK_W = W / COLS, 
        BLOCK_H = H / ROWS,
        board = [],
        canvas = document.getElementsByTagName( 'canvas' )[ 0 ],
        ctx = canvas.getContext( '2d' ),
        shapes = [
            [ 1, 1, 1, 1 ],
            [ 1, 1, 1, 0,1 ],
            [ 1, 1, 1, 0, 0, 0, 1 ],
            [ 1, 1, 0, 0, 1, 1 ],
            [ 1, 1, 0, 0, 0, 1, 1 ],
            [ 0, 1, 1, 0, 1, 1 ],
            [ 0, 1, 0, 0, 1, 1, 1 ]
        ];

    var lose;
    var interval;
    var current;
    var currentX, currentY;

    // creates a new 4x4 shape in global variable 'current'
    // 4x4 so as to cover the size when the shape is rotated
    context.newShape = function() {
        var id = Math.floor( Math.random() * shapes.length );
        var shape = shapes[ id ]; // maintain id for color filling

        current = [];
        for ( var y = 0; y < 4; ++y ) {
            current[ y ] = [];
            for ( var x = 0; x < 4; ++x ) {
                var i = 4 * y + x;
                if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
                    current[ y ][ x ] = id + 1;
                } else {
                    current[ y ][ x ] = 0;
                }
            }
        }
        currentX = 5;
        currentY = 0;
    }
 
    // clears the board
    context.init = function() {
        for ( var y = 0; y < ROWS; ++y ) {
            board[ y ] = [];
            for ( var x = 0; x < COLS; ++x ) {
                board[ y ][ x ] = 0;
            }
        }
    }

    // keep the element moving down, creating new shapes and clearing lines
    context.tick = function() {
        if ( valid( 0, 1 ) ) {
            ++currentY;
        } else {
            freeze();
            clearLines();
            if (lose) {
                document.getElementById("playagain").style.display = "block";
                document.getElementById("startButton").style.display = "none";
                document.getElementById("restartButton").style.display = "none";
                return false;
            } else newShape();
        }
    }

    // stop shape at its position and fix it to board
    context.freeze = function() {
        for ( var y = 0; y < 4; ++y ) {
            for ( var x = 0; x < 4; ++x ) {
                if ( current[ y ][ x ] ) {
                    board[ y + currentY ][ x + currentX ] = current[ y ][ x ];
                }
            }
        }
    }

    // returns rotates the rotated shape 'current' perpendicularly anticlockwise
    context.rotate = function( current ) {
        var newCurrent = [];
        for ( var y = 0; y < 4; ++y ) {
            newCurrent[ y ] = [];
            for ( var x = 0; x < 4; ++x ) {
                newCurrent[ y ][ x ] = current[ 3 - x ][ y ];
            }
        }
        return newCurrent;
    }

    // check if any lines are filled and clear them
    context.clearLines = function() {
        for ( var y = ROWS - 1; y >= 0; --y ) {
            var rowFilled = true;
            for ( var x = 0; x < COLS; ++x ) {
                if ( board[ y ][ x ] == 0 ) {
                    rowFilled = false;
                    break;
                }
            }
            if ( rowFilled ) {
                for ( var yy = y; yy > 0; --yy ) {
                    for ( var x = 0; x < COLS; ++x ) {
                        board[ yy ][ x ] = board[ yy - 1 ][ x ];
                    }
                }
                ++y;
            }
        }
    }

    context.keyPress = function( key ) {
        switch ( key ) {
            case 'left':
                if ( valid( -1 ) ) {
                    --currentX;
                }
                break;
            case 'right':
                if ( valid( 1 ) ) {
                    ++currentX;
                }
                break;
            case 'down':
                if ( valid( 0, 1 ) ) {
                    ++currentY;
                }
                break;
            case 'rotate':
                var rotated = rotate( current );
                if ( valid( 0, 0, rotated ) ) {
                    current = rotated;
                }
                break;
        }
    }

    // checks if the resulting position of current shape will be feasible
    context.valid = function( offsetX, offsetY, newCurrent ) {
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;
        offsetX = currentX + offsetX;
        offsetY = currentY + offsetY;
        newCurrent = newCurrent || current;

        for ( var y = 0; y < 4; ++y ) {
            for ( var x = 0; x < 4; ++x ) {
                if ( newCurrent[ y ][ x ] ) {
                    if ( typeof board[ y + offsetY ] == 'undefined'
                      || typeof board[ y + offsetY ][ x + offsetX ] == 'undefined'
                      || board[ y + offsetY ][ x + offsetX ]
                      || x + offsetX < 0
                      || y + offsetY >= ROWS
                      || x + offsetX >= COLS ) {
                        if (offsetY == 1) lose = true; // lose if the current shape at the top row when checked
                        return false;
                    }
                }
            }
        }
        return true;
    }

    context.newGame = function() {
        clearInterval(interval);
        init();
        newShape();
        lose = false;
        interval = setInterval(tick, 250 );
    }

    // draw a single square at (x, y)
    context.drawBlock = function( x, y ) {
        ctx.fillText("*",(BLOCK_W * x)+2,(BLOCK_H * y)+25);
        ctx.font="30px Georgia";    
    }

    // draws the board and the moving shape
    context.render = function() {
        ctx.clearRect( 0, 0, W, H );
        for ( var x = 0; x < COLS; ++x ) {
            for ( var y = 0; y < ROWS; ++y ) {
                if ( board[ y ][ x ] ) {
                    drawBlock( x, y );
                }
            }
        }
        for ( var y = 0; y < 4; ++y ) {
            for ( var x = 0; x < 4; ++x ) {
                if ( current[ y ][ x ] ) {
                    drawBlock( currentX + x, currentY + y );
                }
            }
        }
    }

    //start game
    context.start = function(me) {
        if(me === 1) {
            document.getElementById("startButton").style.display = "none";
            document.getElementById("restartButton").style.display = "block";
        } else if(me === 3) {
            document.getElementById("playagain").style.display = "none";
            document.getElementById("restartButton").style.display = "block";
        } 
        
        newGame();
        setInterval(render, 30 );
    }

})(this);

document.body.onkeydown = function( e ) {
    var keys = {37: 'left', 39: 'right', 40: 'down', 38: 'rotate', 65: 'left', 68: 'right', 40: 'down', 87: 'rotate'};
    if ( typeof keys[ e.keyCode ] != 'undefined' ) {
        keyPress( keys[ e.keyCode ] );
        render();
    }
};


