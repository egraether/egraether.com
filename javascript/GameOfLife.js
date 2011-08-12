var GameOfLife = function( container ) {
    
    var canvas = document.createElement( "canvas" ),
        ctx = null,
        
        width, height,
        cols, rows,
        
        cellSize = 5,
        fadeSteps = 3,
        fading = true,
        
        grids,
        values,
        
        index = 0,
        
        deathColor = [ 255, 255, 255 ],
        lifeColor = [ 0, 0, 0 ],
        clearColor = deathColor,
        
        colors,
        
        updateIntervalID = null,
        initialized = false;
    
    
    if ( CanvasRenderingContext2D ) {
        
        ctx = canvas.getContext( "2d" );
        
    }
    
    container.appendChild( canvas );
    
    width = canvas.width = container.clientWidth;
    height = canvas.height = container.clientHeight;
    
    function getRGBString( color ) {
        
        return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
        
    };
    
    function getInterpolatedColor( colorA, colorB, factor ) {
        
        var color = [],
            i;
        
        for ( i = 0; i < 3; i++ ) {
            
            color.push( Math.floor( colorA[i] + ( colorB[i] - colorA[i] ) * factor ) );
            
        }
        
        return color;
        
    };
    
    this.init = function() {
        
        if ( !ctx ) {
        
            return;
        
        }
        
        width = canvas.width;
        height = canvas.height;
        
        cols = Math.floor( width / cellSize );
        rows = Math.floor( height / cellSize );
        
        colors = [];
        
        var i;
        
        if ( fading ) {
            
            for ( i = 0; i <= fadeSteps; i++ ) {
            
                colors.push( getRGBString( getInterpolatedColor( deathColor, lifeColor, i / fadeSteps ) ) );
            
            }
            
        } else {
            
            colors.push( getRGBString( clearColor ), getRGBString( lifeColor ) );
            
        }
        
        initialized = true;
        
        this.reset();
        
    };
    
    this.reset = function() {
        
        var i, j;
        
        if ( initialized ) {
        
            grids = [ [], [] ];
            values = [];
        
            for ( i = 0; i < rows; i++ ) {
        
                grids[0].push( [] );
                grids[1].push( [] );
        
                values.push( [] );
        
                for ( j = 0; j < cols; j++) {
            
                    grids[0][i].push( false );
                    grids[1][i].push( false );
            
                    values[i].push( -1 );
            
                }
        
            }
        
            this.clearCanvas();
            
        }
        
    };
    
    this.random = function( factor ) {
        
        var i, j, row;
        
        if ( initialized ) {
        
            for ( i = 0; i < rows; i++ ) {
            
                row = grids[index][i];
            
                for ( j = 0; j < cols; j++) {
                
                    if ( Math.random() < factor ) {
                    
                        row[j] = true;
                        values[i][j] = fadeSteps;
                    
                    } else {
                    
                        row[j] = false;
                        values[i][j] = -1;
                    
                    }
            
                }
        
            }
        
            this.clearCanvas();
        
        }
        
    };
    
    this.clearCanvas = function() {
        
        ctx.fillStyle = getRGBString( clearColor );
        ctx.fillRect( 0, 0, width, height );
        
    }
    
    this.update = function() {
        
        var i, j, k, l, m, n, num, c, row, s, t;
        
        if ( initialized ) {
        
            for ( i = 0; i < rows; i++ ) {
        
                for ( j = 0; j < cols; j++) {
                    
                    if ( values[i][j] >= 0 ) {
                        
                        ctx.fillStyle = colors[ values[i][j] ];
                        this.drawCell( ctx, j, i, cellSize, values[i][j] / fadeSteps );
                        
                        values[i][j]--;
                    
                    }
                
                    num = 0;
                
                    for ( k = 0; k < 3; k++ ) {
                
                        for ( l = 0; l < 3; l++ ) {
                        
                            m = i - 1 + k;
                            n = j - 1 + l;
                        
                            m = m < 0 ? rows - 1 : m == rows ? 0 : m;
                            n = n < 0 ? cols - 1 : n == cols ? 0 : n;
                        
                            if ( m == i && n == j ) {
                            
                                continue;
                            
                            }
                        
                            if ( grids[index][m][n] ) {
                            
                                num++;
                            
                            }
                    
                        }
                
                    }
                
                    if ( grids[index][i][j] ) {
                    
                        if ( num > 1 && num < 4 ) {
                        
                            grids[1 - index][i][j] = true;
                            values[i][j] = fadeSteps;
                        
                        } else {
                        
                            grids[1 - index][i][j] = false;
                        
                        }
                
                    } else {
                    
                        if ( num == 3 ) {
                    
                            grids[1 - index][i][j] = true;
                            values[i][j] = fadeSteps;
                    
                        } else {
                        
                            grids[1 - index][i][j] = false;
                        
                        }
                    
                    }
                
                }
        
            }
        
            index = 1 - index;
        
        }
        
    };
    
    this.drawCell = function( context, x, y, size, value ) {
        
        context.fillRect( x * size, y * size, size, size );
        
    };
    
    this.autoUpdate = function( millis ) {
        
        var self = this;
        
        updateIntervalID = setInterval( function() {
            
            self.update();
            
        }, millis );
        
    }
    
    this.stopAutoUpdate = function() {
        
        if ( updateIntervalID ) {
            
            clearInterval( updateIntervalID );
            updateIntervalID = null;
            
        }
        
    }
    
    this.setFromArray = function( cells ) {
        
        if ( !initialized ) {
            
            this.init();
            
        }
        
        var i, j, k;
        
        for ( i = 0; i < cells.length; i += 2 ) {
            
            j = cells[i];
            k = cells[i + 1];
            
            grids[index][j][k] = true;
            values[j][k] = fadeSteps;
            
        }
        
    };
    
    this.setLifeColor = function( r, g, b ) {
        
        lifeColor = [ r, g, b ];
        
        if ( initialized ) {
            
            this.init();
            
        }
        
    };
    
    this.setDeathColor = function( r, g, b ) {
        
        deathColor = [ r, g, b ];
        
        if ( initialized ) {
            
            this.init();
            
        }
        
    };
    
    this.setClearColor = function( r, g, b ) {
        
        clearColor = [ r, g, b ];
        
    };
    
    this.setFadeSteps = function( steps ) {
        
        fadeSteps = steps < 1 ? 1 : steps;
        fading = true;
        
        if ( initialized ) {
            
            this.init();
            
        }
        
    };
    
    this.noFade = function() {
        
        fadeSteps = 1;
        fading = false;
        
        if ( initialized ) {
            
            this.init();
            
        }
        
    };
    
    this.setCellSize = function( value ) {
        
        cellSize = value;
        
        if ( initialized ) {
            
            this.init();
            
        }
        
    };
    
    this.setCanvasSize = function( width, height ) {
        
        canvas.width = width;
        canvas.height = height;
        
        if ( initialized ) {
            
            this.init();
            
        }
        
    }
    
    this.getCanvas = function() {
        
        return canvas;
        
    };
    
    this.getContext = function() {
        
        return ctx;
        
    };
    
};