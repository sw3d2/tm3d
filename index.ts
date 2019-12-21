import * as crypto from 'crypto';

export interface FileFormat {
  type: 'tm3d',
  version: string,
  timestamp: string,
  source: string,
  boxes: Box3D[],
}

export interface Box3D {
  id: number;
  parent: number;
  color: string | null;
  label: string | null;
  x: [number, number];
  y: [number, number];
  z: [number, number];
}

interface TreemapNode {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  data: {
    id?: number;
    name: string;
    type: string;
  };
  children?: TreemapNode[];
}

interface HexColors {
  [nodeType: string]: string;
}

main();

function main() {
  let filepath = process.argv[2];
  let [treemap, colors] = parseTMap(filepath);
  let boxes = generateBoxes(treemap, colors || {});
  let tmap3d = generateTMap3D(boxes, filepath);
  console.log(JSON.stringify(tmap3d, null, 2));
}

function parseTMap(filepath): [TreemapNode, HexColors] {
  let fs = require('fs');
  let json = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  verifyTMap(json);
  return [json.treemap, json.colors];
}

function verifyTMap(json) {
  if (json.type != 'tmap' || json.version != '1.0.0')
    throw new Error('Invalid TMAP');
}

function generateBoxes(tmap: TreemapNode, colors: HexColors): Box3D[] {
  let boxes: Box3D[] = [];
  setNodeIds(tmap, 1);
  flatten(tmap, boxes, colors);
  return boxes;
}

function generateTMap3D(boxes: Box3D[], source: string): FileFormat {
  return {
    type: 'tm3d',
    version: '1.0.0',
    timestamp: new Date().toJSON(),
    source,
    boxes,
  };
}

function setNodeIds(treemap: TreemapNode, minid: number) {
  const walk = (node: TreemapNode) => {
    node.data.id = minid++;
    for (let subnode of node.children || [])
      walk(subnode);
  };

  walk(treemap);
}

function flatten(treemap: TreemapNode, boxes: Box3D[],
  colors: HexColors, depth = 0, parent: TreemapNode | null = null) {

  let { x0, x1, y0, y1 } = treemap;
  let label = treemap.data.name;
  let color = getNodeColor(treemap.data.type, colors);
  let id = treemap.data.id || 0;

  boxes.push({
    id,
    parent: parent?.data.id || 0,
    color,
    label,
    x: [x0, x1],
    y: [y0, y1],
    z: [depth, depth + 1],
  });

  for (let subnode of treemap.children || [])
    flatten(subnode, boxes, colors, depth + 1, treemap);
}

function getNodeColor(type: string, colors: HexColors) {
  let color = colors[type];
  if (color) return color;
  let hash = crypto.createHash('sha256').update(type).digest();
  color = '#' + hash.toString('hex').slice(0, 6);
  colors[type] = color;
  return color;
}
