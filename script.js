// Main
$(document).ready(function() {
    $('.screen').each(function() {
        $(this).hide();
        $('.options').show();
    });
});

// Change which screen the user sees
function changeScreen(prev, next) {
    $(prev).hide();
    $(next).show();
}

// Starts a new game
function newGame() {
    timer = 60;
    var i = 0;
    if(i == 0) {
        $('#mazeCount').html(1);
    }
    
    for(var i = 1; i <= 2; i++) {
        var mazeNumber = parseInt(i);
        generateMaze(mazeNumber);
    }

    $('.singleMaze').hide();
    $('#maze1').show();
}

// Generates a new maze for infinite levels
function generateNewMaze() {
    var current = $('.singleMaze');
    var currentCount = current.length;
    var current = current[currentCount - 1];
    
    var currentClass = current.id;
    var nextMazeNumber = parseInt(currentClass.replace('maze', ''));
    generateMaze(nextMazeNumber + 1);
}

// Maze

var timer;
let clockImg;
let goldImg;
let playerImg;
let endImg;

function generateMaze(mazeNumber) {
    const game = maze => {
        // Variables for generating the maze
        var cols, rows, current;
        var cellSize = 25;
        var grid = [];
        var stack = [];
        var gold = [];
        
        // Time variables
        var time;
        var timeCellEffectiveness = 20 // Seconds to add
        var timeCellThreshold = 0.45; // Percentage out of 1
        
        // Scoring Variables
        var completedMazeScore = 500;
        var goldenNuggetScore = 200;
        var missedGoldPenalty = goldenNuggetScore / 2;
        
        // Variables for controls
        var startedPlaying = false;
        var playPosition = false;
        var endPosition = false;
        if(mazeNumber == 1) {
            var activeMaze = true;
        }
        
        
        p5.disableFriendlyErrors = true
        
        
        var difficulty = $('input[name="difficulty"]:checked').val();
        if(difficulty == 'easy') {
             var size = 300;
            var goldCount = 2;
        } else if(difficulty == 'medium') {
            var size = 450;
            var goldCount = 4;
        } else if(difficulty == 'hard') {
            var size = 650;
            var goldCount = 7;
        }
        
        
        maze.setup = function() {
            let canvas = maze.createCanvas(size, size);
            canvas.id('maze' + mazeNumber);
            canvas.class('singleMaze');
            canvas.parent('maze');
            maze.setFrameRate(60);
            
            
            rows = maze.floor((maze.height / cellSize));
            cols = maze.floor((maze.width / cellSize));

            
            for(var y = 0; y < rows; y++) {
                for(var x = 0; x < cols; x++) {
                    var cell = new Cell(x, y);
                    grid.push(cell);
                }
            }
            
            
            $('.timer').html(timer + 's');
            
            current = grid[0];
            
            
            for(var i = 0; i < goldCount; i++) {
                gold[i] = grid[Math.floor(Math.random() * grid.length)];
                gold[i].gold = 'waiting';
            }
            
            
            var timeCell = Math.random() * 1;
            
            if(timeCell <= timeCellThreshold) {
                while(!time) {
                    var rand = Math.floor(Math.random() * (grid.length * 0.15));
                    time = grid[rand];
                    time.time == 'waiting';

                    if(time.gold == 'waiting') {
                        time = 0;
                    }
                }
            }
            
            while(!playPosition) {
                var rand = Math.floor(Math.random() * (grid.length * 0.15));
                playPosition = grid[rand];
                
                if(playPosition.gold == 'waiting' || playPosition.time == 'waiting') {
                    playPosition = 0;
                }
            }
            while(!endPosition) {
                var rand = Math.floor(Math.random() * (grid.length - grid.length * 0.75) + (grid.length * 0.75));
                endPosition = grid[rand];
                
                if(endPosition.gold == 'waiting' || endPosition.time == 'waiting') {
                    endPosition = 0;
                }
            }
        }
        
        
        maze.draw = function() {
            maze.background(000000);
            
            // Checks to see if it is the active maze
            getActiveMaze = $('#mazeCount').html();
            if(getActiveMaze == mazeNumber) {
                activeMaze = true;
            } else {
                activeMaze = false;
            }

            
            for(var i = 0; i < grid.length; i++) {
                grid[i].show();
            }
            
            
            current.visited = true;
            if(!startedPlaying) { 
                current.highlight();
            }
            
            var next = current.checkNeighbours();

            if(next) { 
                stack.push(current);
                removeWalls(current, next);
                current = next;
            } else if(stack.length > 0) { 
                current = stack.pop();
            } else if(activeMaze && !startedPlaying) { 
                startedPlaying = true;
                
                
                for(var i = 0; i < gold.length; i++) {
                    gold[i].gold = true;
                }
                if(time) {
                    time.time = true;
                }
                
            startPlaying(mazeNumber);
                
                playPosition.playPosition = true;
                endPosition.endPosition = true;
            }
            
            
            if(activeMaze && startedPlaying) {
                if(maze.frameCount % 60 == 0 && timer > 0) {
                    timer--;
                    $('.timer').html(timer + 's');
                }

                if (timer == 0) {
                    var SCORE = $('.score').html();
                    var scoreValue = parseInt(SCORE.replace("GOLD: ", ""));
                    $('.successScore').html('Your gold: ' + scoreValue);
                    maze.remove();
                    changeScreen('.maze', '.timeOut');
                }
            }
        }
        
        
        var index = function(x, y) {
            if(x < 0 || y < 0 || x > cols - 1|| y > rows - 1) {
                return -1;
            }
            return x + y * cols;
        }

        
        var removeWalls = function(a, b) {
            var topBottom = a.y - b.y;
            var leftRight = a.x - b.x;

            if(leftRight == 1) { 
                a.walls[3] = false;
                b.walls[1] = false;
            } else if(leftRight == -1) { 
                a.walls[1] = false;
                b.walls[3] = false;
            }

            if(topBottom == 1) { 
                a.walls[0] = false;
                b.walls[2] = false;
            } else if(topBottom == -1) { 
                a.walls[2] = false;
                b.walls[0] = false;
            }
        }

        
        Cell = function(x, y) {
            this.x = x;
            this.y = y;
            this.visited = false;
            this.highlight = false;
            this.walls = [true, true, true, true];

            this.playPosition = false;
            this.endPosition = false;
            this.gold = false;
            this.time = false;
            
            
            this.checkNeighbours = function() {
                var x = this.x;
                var y = this.y;
                var neighbours = [];

                var top = grid[index(x, y - 1)];
                var right = grid[index(x + 1, y)];
                var bottom = grid[index(x, y + 1)];
                var left = grid[index(x - 1, y)];

                
                [top, right, bottom, left].forEach(n => {
                    if(n && !n.visited) {
                        neighbours.push(n);
                    }
                })
                
                
                if(neighbours.length > 0) {
                    var r = Math.floor(Math.random() * neighbours.length);
                    return neighbours[r];
                } else {
                    return undefined;
                }
            }
            
            
            this.show = function() {
                var x = this.x * cellSize;
                var y = this.y * cellSize;

                maze.stroke(255);
                maze.strokeWeight(2);
                maze.noFill();
                
               
                if(this.walls[0] == true) {
                    maze.line(x, y, x + cellSize, y);
                }
                if(this.walls[1] == true) {
                    maze.line(x + cellSize, y, x + cellSize, y + cellSize);
                }
                if(this.walls[2] == true) {
                    maze.line(x + cellSize, y + cellSize, x, y + cellSize);
                }
                if(this.walls[3] == true) {
                    maze.line(x, y + cellSize, x, y);
                }
                
                
                if(this.visited) {
                    maze.noStroke();
                    maze.fill(0);
                    maze.rect(x, y, cellSize, cellSize);
                }
                
                if(this.playPosition) {
                    maze.fill(255, 0, 0);
                    maze.triangle(x + cellSize/2, y + 5, x + 5, y + cellSize - 5, x + cellSize - 5, y + cellSize - 5);
                }
                
                if(this.endPosition) {
                    maze.fill(000000);
                    maze.fill(0, 255, 0)
                    maze.circle(x + 10, y + 10, cellSize - 10, cellSize - 10);
                }
               
                if(this.gold === true) {
                    maze.noStroke();
                    maze.fill(255, 215, 0);
                    maze.circle(x + 10, y + 10, cellSize - 10, cellSize - 10);
                }
                
                
                if(this.time === true) {
                    maze.noStroke();
                    maze.fill(0, 0, 255);
                    maze.circle(x + 10, y + 10, cellSize - 10, cellSize - 10);
                    
//                    maze.image(clockImg, x, y, cellSize, cellSize);
                }
            }
            
            
            this.highlight = function() {
                var x = this.x * cellSize;
                var y = this.y * cellSize;

                maze.noStroke();
                maze.fill(0, 0, 255);
                maze.rect(x, y, cellSize, cellSize);
            }
        }

        
        var startPlaying = function() {
            window.addEventListener('keydown', movement) 
            
            function movement(e) {
                var moveTo;
                var valid = false;
                
                switch(e.code) {
                    case 'ArrowUp':
                    case 'KeyW':
                        
                        moveTo = grid[index(playPosition.x, playPosition.y - 1)];
                        
                        if(moveTo && !playPosition.walls[0] && !moveTo.walls[2]) {
                            valid = true;
                        }
                        break;
                    case 'ArrowRight':
                    case 'KeyD':
                        moveTo = grid[index(playPosition.x + 1, playPosition.y)];

                        if(moveTo && !playPosition.walls[1] && !moveTo.walls[3]) {
                            valid = true;
                        }
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        moveTo = grid[index(playPosition.x, playPosition.y + 1)];

                        if(moveTo && !playPosition.walls[2] && !moveTo.walls[0]) {
                            valid = true;
                        }
                        break;
                    case 'ArrowLeft':
                    case 'KeyA':
                        moveTo = grid[index(playPosition.x - 1, playPosition.y)];

                        if(moveTo && !playPosition.walls[3] && !moveTo.walls[1]) {
                            valid = true;
                        }
                        break;
                }

                if(valid) {
                    
                    playPosition.playPosition = false;
                    playPosition = moveTo;
                    playPosition.playPosition = true;
                    
                    
                    if(playPosition.gold) {
                       playPosition.gold = false;
                       addToScore(goldenNuggetScore);
                    }
                       
                    
                    if(playPosition.time == true) {
                        playPosition.time = false;
                        timer += timeCellEffectiveness;
                    }
                    
                    
                    if(playPosition.endPosition) {
                        
                        window.removeEventListener('keydown', movement);
                        
                        generateNewMaze();
                        
                        activeMaze = false;
                        playable = false;
                        
                        $('#mazeCount').html(mazeNumber + 1);
                        
                        maze.remove();
                        
                        
                        var missedGold = 0;
                        for(var i = 0; i < grid.length; i++) {
                            if(grid[i].gold == true) {
                                missedGold += 1;
                            }
                        }
                        
                        if(missedGold == 0) {
                            goldToAdd = completedMazeScore;
                        } else {
                            goldToAdd = completedMazeScore - (missedGold * missedGoldPenalty);
                        }
                        
                        addToScore(goldToAdd);
                        var nextMaze = mazeNumber + 1;
                        $('.singleMaze').hide();
                        $('#maze' + nextMaze).show();
                        
                        return;
                    }
                }
            };
        };
    };
    
    
    let startMaze = new p5(game);
}


function addToScore(toAdd) {
    var SCORE = $('.score').html();
    var scoreValue = parseInt(SCORE.replace("GOLD: ", ""));
    scoreValue += toAdd;
    
    $('.score').html('GOLD: ' + scoreValue);
}