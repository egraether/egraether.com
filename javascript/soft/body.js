var Body = {
    
    // constants
    
    MAX_CUBES : 100,
    ITEM_SIZE : 3,
    
    
    // data
    
    vertices : null,
    edges : null,
    
    
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
        
        var mergeFaces = this.getMergeFaces(position);
        
        if (this.faces.length && !mergeFaces.length) {
            
            return;
            
        }
        
        var cube = new Cube(position),
            cubeVertices = cube.vertices,
            faceTypes = [],
            vertexIndices = [],
            straightEdgeIndices = [];
            
        
        for (var i = 0; i < 12; i++) {
            
            straightEdgeIndices.push(true);
            
            if (i < 8) {
                
                vertexIndices.push(true);
                
            }
            
            if (i < 6) {
                
                faceTypes.push(true);
                
            }
            
        }
            
        for (var i = 0; i < mergeFaces.length; i++) {
            
            var face = mergeFaces[i],
                compFaceType = (face.type + 3) % 6,
                compFaceVertices = this.faceVertices[compFaceType];
                
            faceTypes[compFaceType] = false;
            cube.faces[compFaceType] = face;

            for (var j = 0; j < 4; j++) {
                
                var comp = compFaceVertices[j];
                
                if (vertexIndices[comp]) {
                    
                    cubeVertices[comp] = face.vertices[j];
                    vertexIndices[comp] = false;
                    
                }
                
            }

        }
        
        for (var i = 0; i < 8; i++) {
            
            if (vertexIndices[i]) {
                
                var vertex = new Vertex(vec3.add(this.cubeVertices[i], position, []));
                
                this.vertices.push(vertex);
                cubeVertices[i] = vertex;
                
            }
            
        }
        
        for (var i = 0; i < 6; i++) {
            
            if (!faceTypes[i]) {
                
                var straightEdges = this.straightEdgeIndices[i];

                for (var j = 0; j < 4; j++) {

                    var index = straightEdges[i];

                    if (straightEdgeIndices[index]) {

                        straightEdgeIndices[index] = false;

                    }

                }
                
            }
            
        }
        
        for (var i = 0; i < 12; i++) {
        
            if (straightEdgeIndices[i]) {
                
                this.edges.push(new Edge(
                    cubeVertices[this.straightEdges[i * 2]], 
                    cubeVertices[this.straightEdges[i * 2 + 1]]
                ));
                
            }
        
        }
        
        for (var i = 0; i < 6; i++) {
            
            if (faceTypes[i]) {
                
                for (var j = 0; j < 2; j++) {

                    this.edges.push(new Edge(
                        cubeVertices[this.crossEdges[i][j * 2]], 
                        cubeVertices[this.crossEdges[i][j * 2 + 1]]
                    ));

                }
                
                var face = new Face(i),
                    faceVertices = this.faceVertices[i];

                this.faces.push(face);
                cube.faces[i] = face;

                for (var j = 0; j < 4; j++) {

                    face.vertices.push(cubeVertices[faceVertices[j]]);

                }
                
            }
            
        }
        
        for (var i = 0; i < 4; i++) {
            
            this.edges.push(new Edge(
                cubeVertices[this.diagonalEdges[i * 2]], 
                cubeVertices[this.diagonalEdges[i * 2 + 1]]
            ));
            
        }
        
        this.cubes[vec3.str(position)] = cube;
        this.geometryChanged = true;
        
    },
    
    getMergeFaces : function(position) {
        
        var mergeFaces = [],
            pos = vec3.create(),
            offset = 1,
            cube;
        
        for (var i = 0; i < 6; i++) {
            
            vec3.set(position, pos);
            pos[i % 3] += offset;
            
            cube = this.cubes[vec3.str(pos)];
            
            if (cube) {
                
                mergeFaces.push(cube.faces[(i + 3) % 6]);
                
            }
            
            if (i == 2) {
                
                offset = -1;
                
            }
            
        }
        
        return mergeFaces;
        
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
        
        gl.uniform3f(shader.colorUniform, 0.4, 0.8, 0.4);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(shader.positionAttribute, this.ITEM_SIZE, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(shader.normalAttribute, this.ITEM_SIZE, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(this.drawEdges ? gl.LINES : gl.TRIANGLES, this.indexArray.length, gl.UNSIGNED_SHORT, 0);
    
    },
    
    updateArrays : function () {
        
        if (this.drawEdges) {
            
            this.vertexArray = new Float32Array(this.edges.length * 2 * this.ITEM_SIZE);

            this.normalArray = new Float32Array(this.edges.length * 2 * this.ITEM_SIZE);

            this.indexArray = new Uint16Array(this.edges.length * 2);
            
            for (var i = 0; i < this.edges.length; i++) {

                this.indexArray[i * 2] = i * 2;
                this.indexArray[i * 2 + 1] = i * 2 + 1;

            }
            
        } else {
            
            this.vertexArray = new Float32Array(this.faces.length * 4 * this.ITEM_SIZE);

            this.normalArray = new Float32Array(this.faces.length * 4 * this.ITEM_SIZE);

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
                        x = i * 6 + j * 3;

                    this.vertexArray[x] = pos[0];
                    this.vertexArray[x + 1] = pos[1];
                    this.vertexArray[x + 2] = pos[2];

                }

            }
            
        } else {
            
            for (var i = 0; i < this.faces.length; i++) {

                var face = this.faces[i],
                    nor = face.calculateNormal();

                for (var j = 0; j < 4; j++) {

                    var vertex = face.vertices[j],
                        pos = vertex.position,
                        x = i * 12 + j * 3;

                    this.vertexArray[x] = pos[0];
                    this.vertexArray[x + 1] = pos[1];
                    this.vertexArray[x + 2] = pos[2];

                    this.normalArray[x] = nor[0];
                    this.normalArray[x + 1] = nor[1];
                    this.normalArray[x + 2] = nor[2];

                }

            }
            
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normalArray, gl.DYNAMIC_DRAW);
        
        this.shapeChanged = false;
        
    },
    
    initBuffers : function() {
        
        this.vertexBuffer = gl.createBuffer();
        this.normalBuffer = gl.createBuffer();
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
        
        // this.cubeVertices = [
        //     [ 0.5,  0.5,  0.5],
        //     [ 0.5, -0.5,  0.5],
        //     [ 0.5, -0.5, -0.5],
        //     [ 0.5,  0.5, -0.5],
        //     [-0.5,  0.5,  0.5],
        //     [-0.5, -0.5,  0.5],
        //     [-0.5, -0.5, -0.5],
        //     [-0.5,  0.5, -0.5]
        // ];
        
        this.drawIndices = [
        
            // counter clockwise
            [0, 1, 2, 0, 2, 3],
            
            // clockwise
            [0, 2, 1, 0, 3, 2]
            
        ];
        
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
        
            // front
            [1, 0, 0],
            
            // right
            [0, 1, 0],
            
            // top
            [0, 0, 1],
            
            // back
            [-1, 0, 0],
            
            // left
            [0, -1, 0],
            
            // bottom
            [0, 0, -1]
        
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
