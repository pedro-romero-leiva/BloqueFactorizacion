export type BlockBase = {
  id: string;
  x: number;
  y: number;
};

export type SimpleBlock = BlockBase & {
  type: 'simple';
  value: number;
};

export type PowerBlock = BlockBase & {
  type: 'power';
  base: number;
  exponent: number;
  value: number;
};

export type ProductBlock = BlockBase & {
  type: 'product';
  factors: [number, number];
  value: number;
};

export type NumberBlock = SimpleBlock | PowerBlock | ProductBlock;

export type MoldType = 'cuadrado' | 'cubo';

export type MoldBlockBase = BlockBase & {
  type: 'mold';
  moldType: MoldType;
  side: number;
  capacity: number;
  filledById: string | null;
  filledValue: number | null;
  surplus: number;
  originalBlockType?: NumberBlock['type'];
  originalBlockState?: PowerBlock | ProductBlock;
}

export type SquareMoldBlock = MoldBlockBase & {
  moldType: 'cuadrado';
};

export type CubeMoldBlock = MoldBlockBase & {
  moldType: 'cubo';
};

export type MoldBlock = SquareMoldBlock | CubeMoldBlock;

export type AbacusRow = {
  value: number;
  beads: number;
};

export type AbacusBlock = BlockBase & {
  type: 'abacus';
  rows: AbacusRow[];
};


export type Block = NumberBlock | MoldBlock | AbacusBlock;
