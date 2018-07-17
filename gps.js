var request = require('request');
var jKstra = require('jkstra');
var graph = new jKstra.Graph();

var sleep = require('sleep');

var position = 0;
var progress = 0;
var directions = [];
var regenerateDirections = false;
var possibleDirections = ["up", "down", "left", "right"];
var currentDirection = "";
var n = [];

function solve() {
  request('https://gps.hackmirror.icu/api/map?user=anantdgoel_7202ce', function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //console.log('body:', body); // Print the HTML for the Google homepage.
    var map = JSON.parse(body).graph;
    for(let i = 0; i < map.length; i++) {
      n.push(graph.addVertex(i));
    }
    //console.log(graph.print());
    let j = 0;
    map.forEach((vertex) => {
      vertex.forEach((edge) => {
        edge = parseInt(edge);
        graph.addEdge(n[j], n[edge]);
      });
      j++;
    });

    regenerateDirections = false;
    //position = 0;
    progress = 0;
    directions = calculateDirections(position);

    //console.log("directions", directions);

    currentDirection = directions[progress];
    console.log("trying "+currentDirection);
    navigate(currentDirection, loop); 
  });
}

getCurrPos(function(err,res,body) {
  if (err) {
    console.log(err);
  }
  console.log(body);
  body = JSON.parse(body);
  position =  body.row * 150 + body.col;
  solve();
});

function calculateDirections(pos) {
  var dijkstra = new jKstra.algos.Dijkstra(graph);

  // computes the shortestPath between nodes 0 and 4,
  // using the single number stored in each as its cost
  var path = dijkstra.shortestPath(n[pos], n[22499]);
  //console.log(path.map(function(e) { return e.to.data; }));

  // if(path === null) {
  //   sleep.msleep(100);
  //   position = 0;
  //   reset(solve);
  //   return;
  // }

  let dirArr = path.map(function(e) { return e.to.data; });
  let directionsStr = [];
  let currPos = position;
  dirArr.forEach((x) => {
    x = parseInt(x);
    if(x == currPos + 1) {
      directionsStr.push("right");
    } else if (x == currPos - 1) {
      directionsStr.push("left")
    } else if (x == currPos + 150) {
      directionsStr.push("down");
    } else if (x == currPos - 150) {
      directionsStr.push("up");
    } else if (x == currPos) {
      //grfgklihlhrlnltruunbulibghgbetjedirectionsStr.push("stay");
    } else {
      directionsStr.push("WTF "+currPos+","+x);
    }

    currPos = x;
  });

  return directionsStr;
}

function loop(err, res, body) {
  

  if (err) {
    console.log(err);
  }
  console.log(body);
  body = JSON.parse(body);
  let recalc = false;

  if(regenerateDirections && body.message != "You are stuck, go ahead and reset!" && body.message != "Invalid move.") {
    position =  body.row * 150 + body.col;
    directions = calculateDirections(position);
    if(directions == null)
        return;
    progress = 0;
    regenerateDirections = false;
    recalc = true;
    currentDirection = directions[progress];
    console.log("trying "+currentDirection);
    navigate(currentDirection, loop);
  }

  if(body.message == "You are stuck, go ahead and reset!"){
    reset(solve);
    recalc = true;
  } else if (body.message == "Invalid move.") {
    recalc = true;
    sleep.msleep(100);
    let pos = possibleDirections[Math.floor((Math.random() * 4))];
    console.log("TRYING RANDOM " + pos);
    currentDirection = pos;
    regenerateDirections = true;
    navigate(pos, loop);
  } else if(body.message == "Connection failed! Your driver had to choose a random direction.") {
    let newpos = body.row * 150 + body.col;
    if(getDirection(position, newpos) != currentDirection){
      recalc = true;
      position = newpos;
      console.log("RECALCULATING PATH FROM " + newpos);

      directions = calculateDirections(newpos);
      if(directions == null)
        return;
      progress = 0;
      sleep.msleep(100);
      currentDirection = directions[progress];
      console.log("trying "+currentDirection);
      sleep.msleep(100);
      navigate(currentDirection, loop);
    }
  } else if (body.message != "Phew! The message made it through - your driver made the correct turn.") {
    console.log(body);
    process.exit(1);
  }
  
  if(!recalc) {
    progress++;
    sleep.msleep(100);
    position =  body.row * 150 + body.col;
    currentDirection = directions[progress];
    console.log("trying "+currentDirection);
    navigate(currentDirection, loop);
  }
}

function calculatePos(direction) {
  if(direction == "up") {
    position -= 150;
  } else if (direction == "down") {
    position += 150;
  } else if (direction == "right") {
    position++;
  } else if (direction == "left") {
    position--;
  }
}

function getDirection(init, final) {
  if(final == init + 1) 
    return "right";
  else if (final == init - 1)
    return "left";
  else if (final == init + 150)
    return "down";
  else if (final == init - 150)
    return "up";
}


function navigate(direction, callback) {
  if(direction == "stay"){
    progress++;
    currentDirection = directions[progress];
    console.log("trying "+currentDirection);
    request.post('https://gps.hackmirror.icu/api/move?user=anantdgoel_7202ce&move='+currentDirection, callback);
  } else {
    request.post('https://gps.hackmirror.icu/api/move?user=anantdgoel_7202ce&move='+direction, callback);
  }
}

function getCurrPos(callback) {
  request.get('https://gps.hackmirror.icu/api/position?user=anantdgoel_7202ce', callback);
}

function reset(callback) {
  request.post('https://gps.hackmirror.icu/api/reset?user=anantdgoel_7202ce', callback);
}
