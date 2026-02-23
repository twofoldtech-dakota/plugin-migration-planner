import { s as sql, B as is, C as Column } from './db-BWpbog7L.js';

function max(expression) {
  return sql`max(${expression})`.mapWith(is(expression, Column) ? expression : String);
}

export { max as m };
//# sourceMappingURL=aggregate-B2GxRiPZ.js.map
