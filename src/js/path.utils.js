import {hslToRgb, mixRBG, mod} from "./math.utils.js";

export function intersectAll(paths) {
  return paths.reduce((a, b) => {
    if (a === undefined) return b;
    return a.intersect(b, {insert: false});
  }, undefined);
}

export function generateCircleData(howMany, size, spacing) {
  return [...Array(howMany).keys()].map(i => {
    return {
      x: (size - spacing)  * Math.sin(Math.PI * 2 * i / howMany),
      y: (size - spacing) * Math.cos(Math.PI * 2 * i / howMany),
      color: hslToRgb(i / howMany, 1, .5)
    };
  });
}

export function generateVennDiagramPaths(paths, colors, n, middle) {
  if (paths.length === 0) {
    return paths;
  }
  if (middle === undefined) {
    const intersection = intersectAll(paths);
    intersection.fillColor = "black";
    middle = intersection;
  }
  const newColors = [];
  const intersections = paths.map((p, i) => {
    const iNext = mod(i + 1, paths.length);
    const iPrev = mod(i - 1, paths.length);
    const pNext = paths[iNext];

    // const color = mixRBG(colors[i], colors[iNext]);
    const color = mixRBG(colors[i], colors[iPrev]);
    newColors.push(color);

    const result = p.intersect(pNext, {insert: false}).subtract(middle);
    result.fillColor = `rgb(${color.join(', ')})`;
    return result;
  }).filter(r => !r.isEmpty());

  const leaves = paths.map((p, i) => {
    const pNext = paths[mod(i + 1, paths.length)];
    const pPrev = paths[mod(i - 1, paths.length)];
    return p.subtract(pNext, {insert: false}).subtract(pPrev);
  });


  paths.forEach(p => {
    p.remove();
  });

  if (n <= 2) {
    return leaves.concat(middle);
  }
  return leaves.concat(generateVennDiagramPaths(intersections, newColors, n - 1, middle));
}
