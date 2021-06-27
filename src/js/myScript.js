import {generateCircleData, generateVennDiagramPaths} from "./path.utils.js";
import {downloadAsSVG} from "./dom.utils.js";


function showPointer(show) {
  if (show) {
    view.element.style.setProperty('cursor', 'pointer');
  } else {
    view.element.style.setProperty('cursor', null);
  }
}

function onMouseEnter(event) {
  showPointer(true);
  event.target.opacity = .7;
  event.target.strokeWidth = 2;
  event.target.strokeColor = "#000000";
}

function onMouseLeave(event) {
  showPointer(false);
  event.target.opacity = 1;
  event.target.strokeWidth = 0;
}

function drawInteractiveVennDiagram(howMany, size, spacing) {
  const start = new Date();


  const circleData = generateCircleData(howMany, size, spacing);
  const circles = circleData.map(data => {
    return new Path.Circle({
      center: {
        x: view.center.x + data.x,
        y: view.center.y + data.y,
      },
      radius: size,
      fillColor: `rgb(${data.color.join(', ')})`,
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave
    });
  });

  const vennDiagramPaths = generateVennDiagramPaths(circles, circleData.map(d => d.color), howMany);
  let group = new Group(vennDiagramPaths);
  vennDiagramPaths.forEach(v => {
    if (v) {
      v.onMouseEnter = onMouseEnter;
      v.onMouseLeave = onMouseLeave;
    }
  });
  project.activeLayer.insertChild(0, group);


  return {
    group: group,
    stats: {
      secondsElapsed: ((new Date()).getTime() - start.getTime()) / 1000,
      objects: vennDiagramPaths.length
    }
  };
}

function drawMenu(howMany, spacing) {
  new PointText({
    content: `Circles: ${howMany}\n(press ↑ or ↓ keys) \n(press enter to type a number)`,
    point: {
      x: 10,
      y: 100
    },
    fontSize: 20
  });
  new PointText({
    content: `Spacing: ${spacing}\n(press ← or → keys)`,
    point: {
      x: 10,
      y: 200
    },
    fontSize: 20
  });
  new PointText({
    content: `Save: press P or p to save`,
    point: {
      x: 10,
      y: 275
    },
    fontSize: 20
  });
}

function drawStats(stats) {
  new PointText({
    content: `Time Elapsed: ${stats.secondsElapsed} seconds`,
    point: {
      x: 10,
      y: view.size.height - 125,
    },
    fontSize: 20
  });
  new PointText({
    content: `# of objects: ${stats.objects}`,
    point: {
      x: 10,
      y: view.size.height - 50,
    },
    fontSize: 20
  });
}

function draw(size, howMany, spacing) {
  project.activeLayer.removeChildren();
  drawMenu(howMany, spacing);
  const output = drawInteractiveVennDiagram(howMany, size, spacing);
  drawStats(output.stats);
  return output.group;
}

window.onload = function () {
  paper.install(window);
  paper.setup('myCanvas');
  const size = Math.floor(Math.min(200, view.size.height / 3));
  let howMany = 3;
  let spacing = Math.floor(size / 2);
  let group = draw(size, howMany, spacing);

  let keysPressed = {};
  let processes = 0;
  paper.view.onKeyDown = function (event) {
    if (processes !== 0) {
      console.log("Busy");
      return;
    }
    if (event.key === "enter") {
      let input = prompt("How many circles do you want?", howMany);
      while (true) {
        if (/^\d+$/.test(input)) {
          howMany = parseInt(input);
          break;
        } else {
          input = prompt(`Error: expected only digits, got '${input}'. \nHow many circles do you want?`, howMany);
        }
      }
      howMany = Math.max(1, howMany);

    } else if (event.key === "left") {
      spacing -= 1;

    } else if (event.key === "right") {
      spacing += 1;
      spacing = Math.min(size, spacing);

    } else if (event.key === "down") {
      if (keysPressed[event.key]) return;
      howMany -= 1;
      howMany = Math.max(1, howMany);

    } else if (event.key === "up") {
      if (keysPressed[event.key]) return;
      howMany += 1;

    } else {
      return;
    }
    keysPressed[event.key] = true;
    processes += 1;
    setTimeout(() => {
      group = draw(size, howMany, spacing);
      processes -= 1;
    }, 10);
  }
  paper.view.onKeyUp = function (event) {
    keysPressed[event.key] = false;
    if (event.character.toUpperCase() === "P") {
      downloadAsSVG("venn_diagram.svg", group);
    }
  }

}
