const HEIGHT_STEP = 50;

main();

function main() {
  let filepath = process.argv[2];
  let tmapjson = parseTMap(filepath);
  let tmap3d = generateBoxes(tmapjson);
  console.log(JSON.stringify(tmap3d, null, 2));
}

function parseTMap(filepath) {
  let fs = require('fs');
  let json = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(json);
}

function generateBoxes(tmap) {
  let res = [];
  flatten(tmap, res, 0);
  return res;
}

function flatten(treemap, boxlist, depth) {
  let { x0, x1, y0, y1 } = treemap;

  boxlist.push({
    x: [x0, x1],
    y: [y0, y1],
    z: [HEIGHT_STEP * depth, HEIGHT_STEP * (depth + 1)],
  });

  for (let subnode of treemap.children || [])
    flatten(subnode, boxlist, depth + 1);
}
