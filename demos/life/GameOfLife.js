var GameOfLife = function( container ) {

	var _canvas = document.createElement( "canvas" ),
	_ctx = null,

	_cols, _rows,
	_cellSize = 5,

	_cells = [ [], [] ],
	_lifeCells = [],
	_index = 0,

	_lifeRule = [2, 3],
	_deathRule = [3],

	_colors = {

		life : [ 0, 0, 0 ],
		death : [ 255, 255, 255 ],
		clear : [ 255, 255, 255 ],

	};


	if ( _canvas.getContext ) {

		_ctx = _canvas.getContext( "2d" );

	}

 	if ( !_ctx ){

		return false;

	}


	container.appendChild( _canvas );

	_canvas.width = container.clientWidth;
	_canvas.height = container.clientHeight;


	function getRGBString( color ) {

		return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";

	};

	function getLifeNeighbors( cells, X, Y ) {

		var i, j, x, y, n = 0;

		for ( i = 0; i < 3; i++ ) {

			for ( j = 0; j < 3; j++ ) {

				if ( i === 1 && j === 1 ) {

					continue;

				}

				x = X - 1 + i;
				y = Y - 1 + j;

				x = x < 0 ? _cols - 1 : x === _cols ? 0 : x;
				y = y < 0 ? _rows - 1 : y === _rows ? 0 : y;

				if ( cells[x][y] ) {

					n++;

				}

			}

		}

		return n;

	};


	this.reset = function() {

		var i, j, col;

		_cols = Math.floor( _canvas.width / _cellSize );
		_rows = Math.floor( _canvas.height / _cellSize );

		_cells = [ [], [] ];
		_lifeCells = [];

		for ( var i = 0; i < _cols; i++ ) {

			col = [];

			for ( var j = 0; j < _rows; j++ ) {

				col.push( false );

			}

			_cells[0].push( col );
			_cells[1].push( col.concat() );

		}

		this.clear();

	};

	this.random = function( factor ) {

		var i, j;

		_ctx.fillStyle = getRGBString( _colors.life );

		for ( i = 0; i < _cols; i++ ) {

			for ( j = 0; j < _rows; j++) {

				if ( Math.random() < factor ) {

					_lifeCells.push( i, j );
					_cells[_index][i][j] = true;

					this.drawCell( _ctx, i, j, _cellSize, true );

				}

			}

		}

	};

	this.clear = function() {

		_ctx.fillStyle = getRGBString( _colors.clear );
		_ctx.fillRect( 0, 0, _canvas.width, _canvas.height );

	};

	this.update = function() {

		var i, j, k, l, x, y, n, lifeCells = [];

		for ( i = 0; i < _lifeCells.length; i += 2 ) {

			for ( j = 0; j < 3; j++ ) {

				for ( k = 0; k < 3; k++ ) {

					x = _lifeCells[i] - 1 + j;
					y = _lifeCells[i+1] - 1 + k;

					x = x < 0 ? _cols - 1 : x === _cols ? 0 : x;
					y = y < 0 ? _rows - 1 : y === _rows ? 0 : y;


					if ( _cells[1-_index][x][y] ) {

						continue;

					}


					n = getLifeNeighbors( _cells[_index], x, y );
					l = _cells[_index][x][y];

					if ( ( l && _lifeRule.indexOf( n ) >= 0 ) ||
						( !l && _deathRule.indexOf( n ) >= 0 ) ) {

						_cells[1-_index][x][y] = true;
						lifeCells.push( x, y );

					}

				}

			}

		}


		_ctx.fillStyle = getRGBString( _colors.death );

		for ( i = 0; i < _lifeCells.length; i += 2 ) {

			x = _lifeCells[i];
			y = _lifeCells[i+1];

			this.drawCell( _ctx, x, y, _cellSize, false );

			_cells[_index][x][y] = false;

		}


		_ctx.fillStyle = getRGBString( _colors.life );

		for ( i = 0; i < lifeCells.length; i += 2 ) {

			this.drawCell( _ctx, lifeCells[i], lifeCells[i+1], _cellSize, true );

		}

		_index = 1 - _index;
		_lifeCells = lifeCells;

	};

	this.drawCell = function( ctx, x, y, size, isLife ) {

		ctx.fillRect( x * size, y * size, size, size );

	};

	this.setLifeColor = function( r, g, b ) {

		_colors.life = [ r, g, b ];

	};

	this.setDeathColor = function( r, g, b ) {

		_colors.death = [ r, g, b ];

	};

	this.setClearColor = function( r, g, b ) {

		_colors.clear = [ r, g, b ];

	};

	this.setCellSize = function( value ) {

		_cellSize = value;

	};

	this.setCanvasSize = function( width, height ) {

		_canvas.width = width;
		_canvas.height = height;

	};

	this.setRules = function( life, death ) {

		_lifeRule = life;
		_deathRule = death;

	};

	this.getCanvas = function() {

		return _canvas;

	};

	this.getContext = function() {

		return _ctx;

	};

};