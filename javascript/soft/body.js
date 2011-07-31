var Body = {
    
    // constants
    
    MAX_CUBES : 100,
    ITEM_SIZE : 3,
    
    
    // data
    
    vertices : null,
    edges : null,
    
    color : 3,
    
    // buffers
    
    vertexBuffer : null,
    vertexArray : null,
    
    normalBuffer : null,
    normalArray : null,
    
    indexBuffer : null,
    indexArray : null,
    
    
    // flags
    
    geometryChanged : false,
    shapeChanged : false,
    
    drawEdges : false,
    

    init : function() {
    
        this.vertices = [];
        this.edges = [];
        
        this.faces = [];
        this.cubes = {};
        
        Vertex.count = 0;
        this.indexBuffer.itemCount = 0;
    
        this.reset();
    
        this.addCube([0, 0, 0]);
    
    },

    reset : function() {
        
        for (var i = 0; i < this.vertices.length; i++) {
            
            this.vertices[i].reset();
            
        }
    
    },
    
    addCube : function(position, mergeFaces) {
        
        this.reset();
        
        if (this.cubes[vec3.str(position)]) {
            
            return;
            
        }
        
        var cube = new Cube(position),
            cubeVertices = cube.vertices;
        
        this.mergeNeighbors(cube);
        
        for (var i = 0; i < 8; i++) {
            
            if (!cubeVertices[i]) {
                
                var vertex = new Vertex(
                    vec3.add(this.cubeVertices[i], position, vec3.create()),
                    Vertex.colors[this.color]
                );
                
                this.vertices.push(vertex);
                cubeVertices[i] = vertex;
                
            }
            
        }
        
        for (var i = 0; i < 12; i++) {
        
            if (!cube.straightEdges[i]) {
                
                this.edges.push(new Edge(
                    cubeVertices[this.straightEdges[i * 2]], 
                    cubeVertices[this.straightEdges[i * 2 + 1]]
                ));
                
            }
        
        }
        
        for (var i = 0; i < 6; i++) {
            
            if (!cube.faces[i]) {
                
                for (var j = 0; j < 2; j++) {

                    this.edges.push(new Edge(
                        cubeVertices[this.crossEdges[i][j * 2]], 
                        cubeVertices[this.crossEdges[i][j * 2 + 1]]
                    ));

                }
                
                var face = new Face(i),
                    faceVertices = this.faceVertices[i];

                for (var j = 0; j < 4; j++) {

                    face.vertices.push(cubeVertices[faceVertices[j]]);

                }
                
                face.calculateMid();
                face.calculateNormal();
                
                this.faces.push(face);
                cube.faces[i] = face;
                
                face.cube = cube;
                face.color = Vertex.colors[this.color];
                
            }
            
        }
        
        for (var i = 0; i < 4; i++) {
            
            this.edges.push(new Edge(
                cubeVertices[this.diagonalEdges[i * 2]], 
                cubeVertices[this.diagonalEdges[i * 2 + 1]]
            ));
            
        }
        
        this.cubes[vec3.str(position)] = cube;
        
        this.color = (this.color + 1) % Vertex.colors.length;
        this.geometryChanged = true;
        
    },
    
    mergeNeighbors : function(cube) {
        
        var pos = vec3.create(),
            offset = vec3.create(),
            neighbor,
            dot;
        
        for (var i = -1; i < 2; i++) {
            
            offset[0] = i;
            
            for (var j = -1; j < 2; j++) {
                
                offset[1] = j;

                for (var k = -1; k < 2; k++) {
                    
                    if (!i && !j && !k) {
                        
                        continue;
                        
                    }
                    
                    offset[2] = k;

                    vec3.add(cube.position, offset, pos);
                    
                    neighbor = this.cubes[vec3.str(pos)];
                    
                    if (neighbor) {
                        
                        this.mergeNeighbor(cube, neighbor, offset);
                        
                    }
                }
            }
        }
    },
    
    mergeNeighbor : function(cube, neighbor, offset) {
        
        var dot = vec3.dot(offset, offset),
            vertexIndices;
        
        if (dot == 1) {
            
            this.mergeFace(cube, neighbor, offset);
            
        } else if (dot == 2) {
            
            cube.straightEdges[this.straightEdgeIndexPerOffset[vec3.str(offset)]] = true;
            
            vertexIndices = this.vertexIndexPerOffset[vec3.str(offset)];
            cube.vertices[vertexIndices[0]] = neighbor.vertices[vertexIndices[1]];
            cube.vertices[vertexIndices[2]] = neighbor.vertices[vertexIndices[3]];
            
        } else {
            
            vertexIndices = this.vertexIndexPerOffset[vec3.str(offset)];
            cube.vertices[vertexIndices[0]] = neighbor.vertices[vertexIndices[1]];
            
        }
        
    },
    
    mergeFace : function(cube, neighbor, offset) {
        
        var orientation = -1;
        
        for (var i = 0; i < 6; i++) {
            
            if (offset[i % 3] == orientation) {
                
                var face = neighbor.faces[i],
                    faceType = (face.type + 3) % 6,
                    faceVertices = this.faceVertices[faceType],
                    straightEdges = this.straightEdgeIndices[faceType];

                cube.faces[faceType] = face;

                for (var j = 0; j < 4; j++) {

                    cube.vertices[faceVertices[j]] = face.vertices[j];

                }
                
                for (var j = 0; j < 4; j++) {
                    
                    cube.straightEdges[straightEdges[j]] = false;

                }
                
                break;
                
            }
            
            if (i == 2) {
                
                orientation = 1;
                
            }
            
        }
        
    },

    update : function(dt) {
    
        for (var i = 0; i < this.edges.length; i++) {
            
            this.edges[i].update();
            
        }
        
        for (var i = 0; i < this.vertices.length; i++) {
            
            this.vertices[i].update(dt);
            
        }
        
        this.shapeChanged = true;
    
    },

    draw : function() {
    
        if (this.geometryChanged) {
            
            this.updateArrays();
            this.updateBuffers();
            
        } else if (this.shapeChanged) {
            
            this.updateBuffers();
            
        }
        
        gl.useProgram(this.shader);
        
        gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.shader.positionAttribute, this.ITEM_SIZE, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(this.shader.normalAttribute, this.ITEM_SIZE, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(this.shader.colorAttribute, this.ITEM_SIZE, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(this.drawEdges ? gl.LINES : gl.TRIANGLES, this.indexArray.length, gl.UNSIGNED_SHORT, 0);
    
    },
    
    updateArrays : function () {
        
        if (this.drawEdges) {
            
            this.vertexArray = new Float32Array(this.edges.length * 2 * this.ITEM_SIZE);

            this.normalArray = new Float32Array(this.edges.length * 2 * this.ITEM_SIZE);

            this.colorArray = new Float32Array(this.edges.length * 2 * this.ITEM_SIZE);

            this.indexArray = new Uint16Array(this.edges.length * 2);
            
            for (var i = 0; i < this.edges.length; i++) {

                this.indexArray[i * 2] = i * 2;
                this.indexArray[i * 2 + 1] = i * 2 + 1;

            }
            
        } else {
            
            this.vertexArray = new Float32Array(this.faces.length * 4 * this.ITEM_SIZE);

            this.normalArray = new Float32Array(this.faces.length * 4 * this.ITEM_SIZE);

            this.colorArray = new Float32Array(this.faces.length * 4 * this.ITEM_SIZE);

            this.indexArray = new Uint16Array(this.faces.length * 6);
            
            for (var i = 0; i < this.faces.length; i++) {

                var indices = this.drawIndices[this.faces[i].type < 3 ? 0 : 1];

                for (var j = 0; j < 6; j++) {

                    this.indexArray[i * 6 + j] = i * 4 + indices[j];

                }

            }
            
        }
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexArray, gl.STATIC_DRAW);
        
    },
    
    updateBuffers : function () {
        
        if (this.drawEdges) {
            
            for (var i = 0; i < this.edges.length; i++) {

                var edge = this.edges[i];

                for (var j = 0; j < 2; j++) {

                    var vertex = j == 0 ? edge.to : edge.from,
                        pos = vertex.position,
                        col = vertex.color,
                        x = i * 6 + j * 3;

                    this.vertexArray[x] = pos[0];
                    this.vertexArray[x + 1] = pos[1];
                    this.vertexArray[x + 2] = pos[2];
                    
                    this.colorArray[x] = col[0];
                    this.colorArray[x + 1] = col[1];
                    this.colorArray[x + 2] = col[2];

                }

            }
            
        } else {
            
            for (var i = 0; i < this.faces.length; i++) {

                var face = this.faces[i],
                    col = face.color,
                    nor = face.calculateNormal();

                for (var j = 0; j < 4; j++) {

                    var vertex = face.vertices[j],
                        pos = vertex.position,
                        // col = vertex.color,
                        x = i * 12 + j * 3;

                    this.vertexArray[x] = pos[0];
                    this.vertexArray[x + 1] = pos[1];
                    this.vertexArray[x + 2] = pos[2];

                    this.normalArray[x] = nor[0];
                    this.normalArray[x + 1] = nor[1];
                    this.normalArray[x + 2] = nor[2];

                    this.colorArray[x] = col[0];
                    this.colorArray[x + 1] = col[1];
                    this.colorArray[x + 2] = col[2];

                }
                
            }
            
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normalArray, gl.DYNAMIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colorArray, gl.DYNAMIC_DRAW);
        
        this.shapeChanged = false;
        
    },
    
    getFaceInRay : function(origin, direction) {
        
        var min = Infinity,
            dist,
            nearest = null,
            vector = vec3.create();
        
        for (var i = 0; i < this.faces.length; i++) {
            
            var face = this.faces[i],
                dist = face.distanceToRay(origin, direction);
            
            if (dist < 0.5 && face.intersectsRay(origin, direction)) {
                
                vec3.subtract(face.mid, origin, vector);
                len = vec3.dot(vector, vector);
                
                if (len < min) {
                    
                    nearest = face;
                    min = len;
                    
                }
                
            }
            
        }
        
        return nearest;
        
    },
    
    initShader : function(gl, vertexShaderID, fragmentShaderID) {

        this.shader = loadShader(gl, vertexShaderID, fragmentShaderID);
        gl.useProgram(this.shader);

        this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
        this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");

        this.shader.lightUniform = gl.getUniformLocation(this.shader, "uLight");

        this.shader.positionAttribute = gl.getAttribLocation(this.shader, "aPosition");
        gl.enableVertexAttribArray(this.shader.positionAttribute);

        this.shader.normalAttribute = gl.getAttribLocation(this.shader, "aNormal");
        gl.enableVertexAttribArray(this.shader.normalAttribute);
        
        this.shader.colorAttribute = gl.getAttribLocation(this.shader, "aColor");
        gl.enableVertexAttribArray(this.shader.colorAttribute);
        
        gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
        
        var light = [3.0, 4.0, 5.0];
        vec3.normalize(light);
        
        gl.uniform3fv(this.shader.lightUniform, light);
        
    },
    
    initBuffers : function() {
        
        this.vertexBuffer = gl.createBuffer();
        this.normalBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        
        this.cubeVertices = [
            [ 1, 1, 1 ],
            [ 1, 0, 1 ],
            [ 1, 0, 0 ],
            [ 1, 1, 0 ],
            [ 0, 1, 1 ],
            [ 0, 0, 1 ],
            [ 0, 0, 0 ],
            [ 0, 1, 0 ]
        ];
        
        this.drawIndices = [
        
            // counter clockwise
            [0, 1, 2, 0, 2, 3],
            
            // clockwise
            [0, 2, 1, 0, 3, 2]
            
        ];
        
        this.vertexIndexPerOffset = {
            
            "[1, 1, 1]" : [0, 6],
            "[-1, 1, 1]" : [4, 2],
            "[-1, -1, 1]" : [5, 3],
            "[1, -1, 1]" : [1, 7],
            
            "[1, 1, -1]" : [3, 5],
            "[-1, 1, -1]" : [7, 1],
            "[-1, -1, -1]" : [6, 0],
            "[1, -1, -1]" : [2, 4],
            
            "[1, 1, 0]" : [0, 5, 3, 6],
            "[-1, 1, 0]" : [4, 1, 7, 2],
            "[-1, -1, 0]" : [5, 0, 6, 3],
            "[1, -1, 0]" : [1, 4, 2, 7],
            
            "[1, 0, 1]" : [0, 7, 1, 6],
            "[-1, 0, 1]" : [4, 3, 5, 2],
            "[-1, 0, -1]" : [6, 1, 7, 0],
            "[1, 0, -1]" : [2, 5, 3, 4],
            
            "[0, 1, 1]" : [0, 2, 4, 6],
            "[0, -1, 1]" : [1, 3, 5, 7],
            "[0, -1, -1]" : [2, 0, 6, 4],
            "[0, 1, -1]" : [3, 1, 7, 5]
            
        };
        
        this.faceVertices = [
        
            // front
            [0, 1, 2, 3],
            
            // right
            [0, 3, 7, 4],
            
            // top
            [0, 4, 5, 1],
            
            // back
            [4, 5, 6, 7],
            
            // left
            [1, 2, 6, 5],
            
            // bottom
            [3, 7, 6, 2]
        
        ];
        
        this.faceNormals = [
            [ 1, 0, 0 ],
            [ 0, 1, 0 ],
            [ 0, 0, 1 ],
            [ -1, 0, 0 ],
            [ 0, -1, 0 ],
            [ 0, 0, -1 ]
        ];
        
        this.straightEdges = [
        
            0, 1,
            1, 2,
            2, 3,
            3, 0,
            4, 5,
            5, 6,
            6, 7,
            7, 4,
            0, 4,
            1, 5,
            2, 6,
            3, 7
        
        ];
        
        this.straightEdgeIndices = [
        
            // front
            [0, 1, 2, 3],
            
            // right
            [3, 7, 8, 11],
            
            // top
            [0, 4, 8, 9],
            
            // back
            [4, 5, 6, 7],
            
            // left
            [1, 5, 9, 10],
            
            // bottom
            [2, 6, 10, 11]
        
        ];
        
        this.straightEdgeIndexPerOffset = {
            
            "[1, 1, 0]" : 3,
            "[-1, 1, 0]" : 7,
            "[-1, -1, 0]" : 5,
            "[1, -1, 0]" : 1,
            
            "[1, 0, 1]" : 0,
            "[-1, 0, 1]" : 4,
            "[-1, 0, -1]" : 6,
            "[1, 0, -1]" : 2,
            
            "[0, 1, 1]" : 8,
            "[0, -1, 1]" : 9,
            "[0, -1, -1]" : 10,
            "[0, 1, -1]" : 11
            
        };
        
        this.crossEdges = [
        
            // front
            [0, 2, 1, 3],
            
            // right
            [0, 7, 3, 4],
            
            // top
            [0, 5, 1, 4],
            
            // back
            [4, 6, 5, 7],
            
            // left
            [1, 6, 2, 5],
            
            // bottom
            [2, 7, 3, 6]
        
        ];
        
        this.diagonalEdges = [
        
            0, 6,
            1, 7,
            2, 4,
            3, 5
        
        ];
    
    }

};
