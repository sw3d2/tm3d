const HEIGHT_STEP = 10;

const COLORS = {
  'program': '#f0f',
  'dir': '#0ff',
  'file': '#00f',
  'module': '#00c',
  'module-block': '#008',
  'interface': '#0c0',
  'class': '#0f0',
  'constructor': '#800',
  'method': '#c00',
  'function': '#f00',
};

main();

function main() {
  let filepath = process.argv[2];
  let tmapjson = parseTMap(filepath);
  let boxes = generateBoxes(tmapjson);
  let tmap3d = generateTMap3D(boxes, filepath);
  console.log(JSON.stringify(tmap3d, null, 2));
}

function parseTMap(filepath) {
  let fs = require('fs');
  let json = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  verifyTMap(json);
  return json.treemap;
}

function verifyTMap(json) {
  if (json.type != 'tmap' || json.version != '1.0.0')
    throw new Error('Invalid TMAP');
}

function generateBoxes(tmap) {
  let boxes = [];
  flatten(tmap, boxes, 0);
  return boxes;
}

function generateTMap3D(boxes, source) {
  return {
    type: 'tm3d',
    version: '1.0.0',
    timestamp: new Date().toJSON(),
    source,
    boxes,
  };
}

function flatten(treemap, boxlist, depth) {
  let { x0, x1, y0, y1 } = treemap;
  let label = treemap.data.name;
  let color = COLORS[treemap.data.type] || null;

  boxlist.push({
    color,
    label,
    x: [x0, x1],
    y: [y0, y1],
    z: [HEIGHT_STEP * depth, HEIGHT_STEP * (depth + 1)],
  });

  for (let subnode of treemap.children || [])
    flatten(subnode, boxlist, depth + 1);
}
