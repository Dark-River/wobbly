// Stone type definitions for structure pieces
// Dimensions in meters, colors for rendering

export const STONE_TYPES = {
  wall: {
    width: 0.6,
    height: 1.8,
    density: 2.5,
    friction: 0.7,
    restitution: 0.1,
    color: '#7a6e5d',
    label: 'wall',
  },
  slab: {
    width: 2.4,
    height: 0.4,
    density: 2.0,
    friction: 0.6,
    restitution: 0.05,
    color: '#8a7d6b',
    label: 'slab',
  },
  block: {
    width: 1.0,
    height: 1.0,
    density: 3.0,
    friction: 0.8,
    restitution: 0.05,
    color: '#6b6155',
    label: 'block',
  },
  pillar: {
    width: 0.4,
    height: 2.4,
    density: 2.2,
    friction: 0.65,
    restitution: 0.1,
    color: '#9a8b78',
    label: 'pillar',
  },
};
