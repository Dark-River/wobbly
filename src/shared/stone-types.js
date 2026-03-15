// Stone type definitions for structure pieces
// Dimensions in meters, colors for rendering

export const STONE_TYPES = {
  wall: {
    width: 0.6,
    height: 1.8,
    density: 2.5,
    friction: 0.7,
    restitution: 0.1,
    colorTop: '#8a7d6d',
    colorBottom: '#5c5246',
    border: '#3d3630',
    label: 'wall',
  },
  slab: {
    width: 2.4,
    height: 0.4,
    density: 2.0,
    friction: 0.6,
    restitution: 0.05,
    colorTop: '#9e9180',
    colorBottom: '#706656',
    border: '#4a4238',
    label: 'slab',
  },
  block: {
    width: 1.0,
    height: 1.0,
    density: 3.0,
    friction: 0.8,
    restitution: 0.05,
    colorTop: '#706458',
    colorBottom: '#4a4038',
    border: '#332e28',
    label: 'block',
  },
  pillar: {
    width: 0.4,
    height: 2.4,
    density: 2.2,
    friction: 0.65,
    restitution: 0.1,
    colorTop: '#a8997e',
    colorBottom: '#7a6d5a',
    border: '#4a4238',
    label: 'pillar',
  },
};
