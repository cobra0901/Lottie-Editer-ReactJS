import { rgbToHex } from 'color-invert';

import { fromUnitVector } from './utils';

// main algorithm, it executes a callback on every color it finds
const getColors = (tree: Object, cb: Function, asset: number = -1): void => {
  if (tree) {
    tree.forEach((layer, i) => {
      if (layer.shapes) {
        layer.shapes.forEach((shape, j) => {
          if (shape.it) {
            shape.it.forEach((prop, k) => {
              if (['fl', 'st'].includes(prop.ty)) {
                const color = prop.c.k;

                // eslint-disable-next-line
                let [r, g, b, a] = color;

                r = fromUnitVector(r);
                g = fromUnitVector(g);
                b = fromUnitVector(b);

                const meta = {
                  i,
                  j,
                  k,
                  r,
                  g,
                  b,
                  a,
                  nm: prop.nm,
                  asset,
                  color: rgbToHex(r, g, b)
                };

                if (cb) {
                  cb(meta);
                }
              }
            });
          }
        });
      }
    });
  }
};

export default getColors;
