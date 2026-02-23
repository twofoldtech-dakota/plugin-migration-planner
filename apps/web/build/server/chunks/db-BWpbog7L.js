import require$$0$3 from 'events';
import require$$1 from 'util';
import require$$0 from 'crypto';
import require$$0$2 from 'dns';
import require$$0$1 from 'fs';
import require$$0$4 from 'net';
import require$$1$1 from 'tls';
import require$$0$6 from 'path';
import require$$0$5 from 'stream';
import require$$1$2 from 'string_decoder';
import { b as private_env } from './shared-server-DaWdgxVh.js';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

const entityKind = Symbol.for("drizzle:entityKind");
function is(value, type) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (value instanceof type) {
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new Error(
      `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
    );
  }
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls) {
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }
      cls = Object.getPrototypeOf(cls);
    }
  }
  return false;
}

class Column {
  constructor(table, config) {
    this.table = table;
    this.config = config;
    this.name = config.name;
    this.keyAsName = config.keyAsName;
    this.notNull = config.notNull;
    this.default = config.default;
    this.defaultFn = config.defaultFn;
    this.onUpdateFn = config.onUpdateFn;
    this.hasDefault = config.hasDefault;
    this.primary = config.primaryKey;
    this.isUnique = config.isUnique;
    this.uniqueName = config.uniqueName;
    this.uniqueType = config.uniqueType;
    this.dataType = config.dataType;
    this.columnType = config.columnType;
    this.generated = config.generated;
    this.generatedIdentity = config.generatedIdentity;
  }
  static [entityKind] = "Column";
  name;
  keyAsName;
  primary;
  notNull;
  default;
  defaultFn;
  onUpdateFn;
  hasDefault;
  isUnique;
  uniqueName;
  uniqueType;
  dataType;
  columnType;
  enumValues = void 0;
  generated = void 0;
  generatedIdentity = void 0;
  config;
  mapFromDriverValue(value) {
    return value;
  }
  mapToDriverValue(value) {
    return value;
  }
  // ** @internal */
  shouldDisableInsert() {
    return this.config.generated !== void 0 && this.config.generated.type !== "byDefault";
  }
}

class ColumnBuilder {
  static [entityKind] = "ColumnBuilder";
  config;
  constructor(name, dataType, columnType) {
    this.config = {
      name,
      keyAsName: name === "",
      notNull: false,
      default: void 0,
      hasDefault: false,
      primaryKey: false,
      isUnique: false,
      uniqueName: void 0,
      uniqueType: void 0,
      dataType,
      columnType,
      generated: void 0
    };
  }
  /**
   * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
   *
   * @example
   * ```ts
   * const users = pgTable('users', {
   * 	id: integer('id').$type<UserId>().primaryKey(),
   * 	details: json('details').$type<UserDetails>().notNull(),
   * });
   * ```
   */
  $type() {
    return this;
  }
  /**
   * Adds a `not null` clause to the column definition.
   *
   * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
   */
  notNull() {
    this.config.notNull = true;
    return this;
  }
  /**
   * Adds a `default <value>` clause to the column definition.
   *
   * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
   *
   * If you need to set a dynamic default value, use {@link $defaultFn} instead.
   */
  default(value) {
    this.config.default = value;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Adds a dynamic default value to the column.
   * The function will be called when the row is inserted, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $defaultFn(fn) {
    this.config.defaultFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Alias for {@link $defaultFn}.
   */
  $default = this.$defaultFn;
  /**
   * Adds a dynamic update value to the column.
   * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
   * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $onUpdateFn(fn) {
    this.config.onUpdateFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Alias for {@link $onUpdateFn}.
   */
  $onUpdate = this.$onUpdateFn;
  /**
   * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
   *
   * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
   */
  primaryKey() {
    this.config.primaryKey = true;
    this.config.notNull = true;
    return this;
  }
  /** @internal Sets the name of the column to the key within the table definition if a name was not given. */
  setName(name) {
    if (this.config.name !== "") return;
    this.config.name = name;
  }
}

const TableName = Symbol.for("drizzle:Name");

class ForeignKeyBuilder {
  static [entityKind] = "PgForeignKeyBuilder";
  /** @internal */
  reference;
  /** @internal */
  _onUpdate = "no action";
  /** @internal */
  _onDelete = "no action";
  constructor(config, actions) {
    this.reference = () => {
      const { name, columns, foreignColumns } = config();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    };
    if (actions) {
      this._onUpdate = actions.onUpdate;
      this._onDelete = actions.onDelete;
    }
  }
  onUpdate(action) {
    this._onUpdate = action === void 0 ? "no action" : action;
    return this;
  }
  onDelete(action) {
    this._onDelete = action === void 0 ? "no action" : action;
    return this;
  }
  /** @internal */
  build(table) {
    return new ForeignKey(table, this);
  }
}
class ForeignKey {
  constructor(table, builder) {
    this.table = table;
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }
  static [entityKind] = "PgForeignKey";
  reference;
  onUpdate;
  onDelete;
  getName() {
    const { name, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
}

function iife(fn, ...args) {
  return fn(...args);
}

function unique(name) {
  return new UniqueOnConstraintBuilder(name);
}
function uniqueKeyName(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
class UniqueConstraintBuilder {
  constructor(columns, name) {
    this.name = name;
    this.columns = columns;
  }
  static [entityKind] = "PgUniqueConstraintBuilder";
  /** @internal */
  columns;
  /** @internal */
  nullsNotDistinctConfig = false;
  nullsNotDistinct() {
    this.nullsNotDistinctConfig = true;
    return this;
  }
  /** @internal */
  build(table) {
    return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
  }
}
class UniqueOnConstraintBuilder {
  static [entityKind] = "PgUniqueOnConstraintBuilder";
  /** @internal */
  name;
  constructor(name) {
    this.name = name;
  }
  on(...columns) {
    return new UniqueConstraintBuilder(columns, this.name);
  }
}
class UniqueConstraint {
  constructor(table, columns, nullsNotDistinct, name) {
    this.table = table;
    this.columns = columns;
    this.name = name ?? uniqueKeyName(this.table, this.columns.map((column) => column.name));
    this.nullsNotDistinct = nullsNotDistinct;
  }
  static [entityKind] = "PgUniqueConstraint";
  columns;
  name;
  nullsNotDistinct = false;
  getName() {
    return this.name;
  }
}

function parsePgArrayValue(arrayString, startFrom, inQuotes) {
  for (let i = startFrom; i < arrayString.length; i++) {
    const char = arrayString[i];
    if (char === "\\") {
      i++;
      continue;
    }
    if (char === '"') {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i + 1];
    }
    if (inQuotes) {
      continue;
    }
    if (char === "," || char === "}") {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i];
    }
  }
  return [arrayString.slice(startFrom).replace(/\\/g, ""), arrayString.length];
}
function parsePgNestedArray(arrayString, startFrom = 0) {
  const result = [];
  let i = startFrom;
  let lastCharIsComma = false;
  while (i < arrayString.length) {
    const char = arrayString[i];
    if (char === ",") {
      if (lastCharIsComma || i === startFrom) {
        result.push("");
      }
      lastCharIsComma = true;
      i++;
      continue;
    }
    lastCharIsComma = false;
    if (char === "\\") {
      i += 2;
      continue;
    }
    if (char === '"') {
      const [value2, startFrom2] = parsePgArrayValue(arrayString, i + 1, true);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    if (char === "}") {
      return [result, i + 1];
    }
    if (char === "{") {
      const [value2, startFrom2] = parsePgNestedArray(arrayString, i + 1);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    const [value, newStartFrom] = parsePgArrayValue(arrayString, i, false);
    result.push(value);
    i = newStartFrom;
  }
  return [result, i];
}
function parsePgArray(arrayString) {
  const [result] = parsePgNestedArray(arrayString, 1);
  return result;
}
function makePgArray(array) {
  return `{${array.map((item) => {
    if (Array.isArray(item)) {
      return makePgArray(item);
    }
    if (typeof item === "string") {
      return `"${item.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return `${item}`;
  }).join(",")}}`;
}

class PgColumnBuilder extends ColumnBuilder {
  foreignKeyConfigs = [];
  static [entityKind] = "PgColumnBuilder";
  array(size) {
    return new PgArrayBuilder(this.config.name, this, size);
  }
  references(ref, actions = {}) {
    this.foreignKeyConfigs.push({ ref, actions });
    return this;
  }
  unique(name, config) {
    this.config.isUnique = true;
    this.config.uniqueName = name;
    this.config.uniqueType = config?.nulls;
    return this;
  }
  generatedAlwaysAs(as) {
    this.config.generated = {
      as,
      type: "always",
      mode: "stored"
    };
    return this;
  }
  /** @internal */
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => {
      return iife(
        (ref2, actions2) => {
          const builder = new ForeignKeyBuilder(() => {
            const foreignColumn = ref2();
            return { columns: [column], foreignColumns: [foreignColumn] };
          });
          if (actions2.onUpdate) {
            builder.onUpdate(actions2.onUpdate);
          }
          if (actions2.onDelete) {
            builder.onDelete(actions2.onDelete);
          }
          return builder.build(table);
        },
        ref,
        actions
      );
    });
  }
  /** @internal */
  buildExtraConfigColumn(table) {
    return new ExtraConfigColumn(table, this.config);
  }
}
class PgColumn extends Column {
  constructor(table, config) {
    if (!config.uniqueName) {
      config.uniqueName = uniqueKeyName(table, [config.name]);
    }
    super(table, config);
    this.table = table;
  }
  static [entityKind] = "PgColumn";
}
class ExtraConfigColumn extends PgColumn {
  static [entityKind] = "ExtraConfigColumn";
  getSQLType() {
    return this.getSQLType();
  }
  indexConfig = {
    order: this.config.order ?? "asc",
    nulls: this.config.nulls ?? "last",
    opClass: this.config.opClass
  };
  defaultConfig = {
    order: "asc",
    nulls: "last",
    opClass: void 0
  };
  asc() {
    this.indexConfig.order = "asc";
    return this;
  }
  desc() {
    this.indexConfig.order = "desc";
    return this;
  }
  nullsFirst() {
    this.indexConfig.nulls = "first";
    return this;
  }
  nullsLast() {
    this.indexConfig.nulls = "last";
    return this;
  }
  /**
   * ### PostgreSQL documentation quote
   *
   * > An operator class with optional parameters can be specified for each column of an index.
   * The operator class identifies the operators to be used by the index for that column.
   * For example, a B-tree index on four-byte integers would use the int4_ops class;
   * this operator class includes comparison functions for four-byte integers.
   * In practice the default operator class for the column's data type is usually sufficient.
   * The main point of having operator classes is that for some data types, there could be more than one meaningful ordering.
   * For example, we might want to sort a complex-number data type either by absolute value or by real part.
   * We could do this by defining two operator classes for the data type and then selecting the proper class when creating an index.
   * More information about operator classes check:
   *
   * ### Useful links
   * https://www.postgresql.org/docs/current/sql-createindex.html
   *
   * https://www.postgresql.org/docs/current/indexes-opclass.html
   *
   * https://www.postgresql.org/docs/current/xindex.html
   *
   * ### Additional types
   * If you have the `pg_vector` extension installed in your database, you can use the
   * `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops`, `vector_l1_ops`, `bit_hamming_ops`, `bit_jaccard_ops`, `halfvec_l2_ops`, `sparsevec_l2_ops` options, which are predefined types.
   *
   * **You can always specify any string you want in the operator class, in case Drizzle doesn't have it natively in its types**
   *
   * @param opClass
   * @returns
   */
  op(opClass) {
    this.indexConfig.opClass = opClass;
    return this;
  }
}
class IndexedColumn {
  static [entityKind] = "IndexedColumn";
  constructor(name, keyAsName, type, indexConfig) {
    this.name = name;
    this.keyAsName = keyAsName;
    this.type = type;
    this.indexConfig = indexConfig;
  }
  name;
  keyAsName;
  type;
  indexConfig;
}
class PgArrayBuilder extends PgColumnBuilder {
  static [entityKind] = "PgArrayBuilder";
  constructor(name, baseBuilder, size) {
    super(name, "array", "PgArray");
    this.config.baseBuilder = baseBuilder;
    this.config.size = size;
  }
  /** @internal */
  build(table) {
    const baseColumn = this.config.baseBuilder.build(table);
    return new PgArray(
      table,
      this.config,
      baseColumn
    );
  }
}
class PgArray extends PgColumn {
  constructor(table, config, baseColumn, range) {
    super(table, config);
    this.baseColumn = baseColumn;
    this.range = range;
    this.size = config.size;
  }
  size;
  static [entityKind] = "PgArray";
  getSQLType() {
    return `${this.baseColumn.getSQLType()}[${typeof this.size === "number" ? this.size : ""}]`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      value = parsePgArray(value);
    }
    return value.map((v) => this.baseColumn.mapFromDriverValue(v));
  }
  mapToDriverValue(value, isNestedArray = false) {
    const a = value.map(
      (v) => v === null ? null : is(this.baseColumn, PgArray) ? this.baseColumn.mapToDriverValue(v, true) : this.baseColumn.mapToDriverValue(v)
    );
    if (isNestedArray) return a;
    return makePgArray(a);
  }
}

const isPgEnumSym = Symbol.for("drizzle:isPgEnum");
function isPgEnum(obj) {
  return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
}

class Subquery {
  static [entityKind] = "Subquery";
  constructor(sql, fields, alias, isWith = false, usedTables = []) {
    this._ = {
      brand: "Subquery",
      sql,
      selectedFields: fields,
      alias,
      isWith,
      usedTables
    };
  }
  // getSQL(): SQL<unknown> {
  // 	return new SQL([this]);
  // }
}
class WithSubquery extends Subquery {
  static [entityKind] = "WithSubquery";
}

const tracer = {
  startActiveSpan(name, fn) {
    {
      return fn();
    }
  }
};

const ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");

const Schema = Symbol.for("drizzle:Schema");
const Columns = Symbol.for("drizzle:Columns");
const ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns");
const OriginalName = Symbol.for("drizzle:OriginalName");
const BaseName = Symbol.for("drizzle:BaseName");
const IsAlias = Symbol.for("drizzle:IsAlias");
const ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
const IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");
class Table {
  static [entityKind] = "Table";
  /** @internal */
  static Symbol = {
    Name: TableName,
    Schema,
    OriginalName,
    Columns,
    ExtraConfigColumns,
    BaseName,
    IsAlias,
    ExtraConfigBuilder
  };
  /**
   * @internal
   * Can be changed if the table is aliased.
   */
  [TableName];
  /**
   * @internal
   * Used to store the original name of the table, before any aliasing.
   */
  [OriginalName];
  /** @internal */
  [Schema];
  /** @internal */
  [Columns];
  /** @internal */
  [ExtraConfigColumns];
  /**
   *  @internal
   * Used to store the table name before the transformation via the `tableCreator` functions.
   */
  [BaseName];
  /** @internal */
  [IsAlias] = false;
  /** @internal */
  [IsDrizzleTable] = true;
  /** @internal */
  [ExtraConfigBuilder] = void 0;
  constructor(name, schema, baseName) {
    this[TableName] = this[OriginalName] = name;
    this[Schema] = schema;
    this[BaseName] = baseName;
  }
}
function getTableName(table) {
  return table[TableName];
}
function getTableUniqueName(table) {
  return `${table[Schema] ?? "public"}.${table[TableName]}`;
}

function isSQLWrapper(value) {
  return value !== null && value !== void 0 && typeof value.getSQL === "function";
}
function mergeQueries(queries) {
  const result = { sql: "", params: [] };
  for (const query of queries) {
    result.sql += query.sql;
    result.params.push(...query.params);
    if (query.typings?.length) {
      if (!result.typings) {
        result.typings = [];
      }
      result.typings.push(...query.typings);
    }
  }
  return result;
}
class StringChunk {
  static [entityKind] = "StringChunk";
  value;
  constructor(value) {
    this.value = Array.isArray(value) ? value : [value];
  }
  getSQL() {
    return new SQL([this]);
  }
}
class SQL {
  constructor(queryChunks) {
    this.queryChunks = queryChunks;
    for (const chunk of queryChunks) {
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        this.usedTables.push(
          schemaName === void 0 ? chunk[Table.Symbol.Name] : schemaName + "." + chunk[Table.Symbol.Name]
        );
      }
    }
  }
  static [entityKind] = "SQL";
  /** @internal */
  decoder = noopDecoder;
  shouldInlineParams = false;
  /** @internal */
  usedTables = [];
  append(query) {
    this.queryChunks.push(...query.queryChunks);
    return this;
  }
  toQuery(config) {
    return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
      const query = this.buildQueryFromSourceParams(this.queryChunks, config);
      span?.setAttributes({
        "drizzle.query.text": query.sql,
        "drizzle.query.params": JSON.stringify(query.params)
      });
      return query;
    });
  }
  buildQueryFromSourceParams(chunks, _config) {
    const config = Object.assign({}, _config, {
      inlineParams: _config.inlineParams || this.shouldInlineParams,
      paramStartIndex: _config.paramStartIndex || { value: 0 }
    });
    const {
      casing,
      escapeName,
      escapeParam,
      prepareTyping,
      inlineParams,
      paramStartIndex
    } = config;
    return mergeQueries(chunks.map((chunk) => {
      if (is(chunk, StringChunk)) {
        return { sql: chunk.value.join(""), params: [] };
      }
      if (is(chunk, Name)) {
        return { sql: escapeName(chunk.value), params: [] };
      }
      if (chunk === void 0) {
        return { sql: "", params: [] };
      }
      if (Array.isArray(chunk)) {
        const result = [new StringChunk("(")];
        for (const [i, p] of chunk.entries()) {
          result.push(p);
          if (i < chunk.length - 1) {
            result.push(new StringChunk(", "));
          }
        }
        result.push(new StringChunk(")"));
        return this.buildQueryFromSourceParams(result, config);
      }
      if (is(chunk, SQL)) {
        return this.buildQueryFromSourceParams(chunk.queryChunks, {
          ...config,
          inlineParams: inlineParams || chunk.shouldInlineParams
        });
      }
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        const tableName = chunk[Table.Symbol.Name];
        return {
          sql: schemaName === void 0 || chunk[IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
          params: []
        };
      }
      if (is(chunk, Column)) {
        const columnName = casing.getColumnCasing(chunk);
        if (_config.invokeSource === "indexes") {
          return { sql: escapeName(columnName), params: [] };
        }
        const schemaName = chunk.table[Table.Symbol.Schema];
        return {
          sql: chunk.table[IsAlias] || schemaName === void 0 ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
          params: []
        };
      }
      if (is(chunk, View)) {
        const schemaName = chunk[ViewBaseConfig].schema;
        const viewName = chunk[ViewBaseConfig].name;
        return {
          sql: schemaName === void 0 || chunk[ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
          params: []
        };
      }
      if (is(chunk, Param)) {
        if (is(chunk.value, Placeholder)) {
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }
        const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
        if (is(mappedValue, SQL)) {
          return this.buildQueryFromSourceParams([mappedValue], config);
        }
        if (inlineParams) {
          return { sql: this.mapInlineParam(mappedValue, config), params: [] };
        }
        let typings = ["none"];
        if (prepareTyping) {
          typings = [prepareTyping(chunk.encoder)];
        }
        return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
      }
      if (is(chunk, Placeholder)) {
        return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
      }
      if (is(chunk, SQL.Aliased) && chunk.fieldAlias !== void 0) {
        return { sql: escapeName(chunk.fieldAlias), params: [] };
      }
      if (is(chunk, Subquery)) {
        if (chunk._.isWith) {
          return { sql: escapeName(chunk._.alias), params: [] };
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk._.sql,
          new StringChunk(") "),
          new Name(chunk._.alias)
        ], config);
      }
      if (isPgEnum(chunk)) {
        if (chunk.schema) {
          return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
        }
        return { sql: escapeName(chunk.enumName), params: [] };
      }
      if (isSQLWrapper(chunk)) {
        if (chunk.shouldOmitSQLParens?.()) {
          return this.buildQueryFromSourceParams([chunk.getSQL()], config);
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk.getSQL(),
          new StringChunk(")")
        ], config);
      }
      if (inlineParams) {
        return { sql: this.mapInlineParam(chunk, config), params: [] };
      }
      return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
    }));
  }
  mapInlineParam(chunk, { escapeString }) {
    if (chunk === null) {
      return "null";
    }
    if (typeof chunk === "number" || typeof chunk === "boolean") {
      return chunk.toString();
    }
    if (typeof chunk === "string") {
      return escapeString(chunk);
    }
    if (typeof chunk === "object") {
      const mappedValueAsString = chunk.toString();
      if (mappedValueAsString === "[object Object]") {
        return escapeString(JSON.stringify(chunk));
      }
      return escapeString(mappedValueAsString);
    }
    throw new Error("Unexpected param value: " + chunk);
  }
  getSQL() {
    return this;
  }
  as(alias) {
    if (alias === void 0) {
      return this;
    }
    return new SQL.Aliased(this, alias);
  }
  mapWith(decoder) {
    this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
    return this;
  }
  inlineParams() {
    this.shouldInlineParams = true;
    return this;
  }
  /**
   * This method is used to conditionally include a part of the query.
   *
   * @param condition - Condition to check
   * @returns itself if the condition is `true`, otherwise `undefined`
   */
  if(condition) {
    return condition ? this : void 0;
  }
}
class Name {
  constructor(value) {
    this.value = value;
  }
  static [entityKind] = "Name";
  brand;
  getSQL() {
    return new SQL([this]);
  }
}
function isDriverValueEncoder(value) {
  return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
}
const noopDecoder = {
  mapFromDriverValue: (value) => value
};
const noopEncoder = {
  mapToDriverValue: (value) => value
};
({
  ...noopDecoder,
  ...noopEncoder
});
class Param {
  /**
   * @param value - Parameter value
   * @param encoder - Encoder to convert the value to a driver parameter
   */
  constructor(value, encoder = noopEncoder) {
    this.value = value;
    this.encoder = encoder;
  }
  static [entityKind] = "Param";
  brand;
  getSQL() {
    return new SQL([this]);
  }
}
function sql(strings, ...params) {
  const queryChunks = [];
  if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
    queryChunks.push(new StringChunk(strings[0]));
  }
  for (const [paramIndex, param2] of params.entries()) {
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  }
  return new SQL(queryChunks);
}
((sql2) => {
  function empty() {
    return new SQL([]);
  }
  sql2.empty = empty;
  function fromList(list) {
    return new SQL(list);
  }
  sql2.fromList = fromList;
  function raw(str) {
    return new SQL([new StringChunk(str)]);
  }
  sql2.raw = raw;
  function join(chunks, separator) {
    const result = [];
    for (const [i, chunk] of chunks.entries()) {
      if (i > 0 && separator !== void 0) {
        result.push(separator);
      }
      result.push(chunk);
    }
    return new SQL(result);
  }
  sql2.join = join;
  function identifier(value) {
    return new Name(value);
  }
  sql2.identifier = identifier;
  function placeholder2(name2) {
    return new Placeholder(name2);
  }
  sql2.placeholder = placeholder2;
  function param2(value, encoder) {
    return new Param(value, encoder);
  }
  sql2.param = param2;
})(sql || (sql = {}));
((SQL2) => {
  class Aliased {
    constructor(sql2, fieldAlias) {
      this.sql = sql2;
      this.fieldAlias = fieldAlias;
    }
    static [entityKind] = "SQL.Aliased";
    /** @internal */
    isSelectionField = false;
    getSQL() {
      return this.sql;
    }
    /** @internal */
    clone() {
      return new Aliased(this.sql, this.fieldAlias);
    }
  }
  SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));
class Placeholder {
  constructor(name2) {
    this.name = name2;
  }
  static [entityKind] = "Placeholder";
  getSQL() {
    return new SQL([this]);
  }
}
function fillPlaceholders(params, values) {
  return params.map((p) => {
    if (is(p, Placeholder)) {
      if (!(p.name in values)) {
        throw new Error(`No value for placeholder "${p.name}" was provided`);
      }
      return values[p.name];
    }
    if (is(p, Param) && is(p.value, Placeholder)) {
      if (!(p.value.name in values)) {
        throw new Error(`No value for placeholder "${p.value.name}" was provided`);
      }
      return p.encoder.mapToDriverValue(values[p.value.name]);
    }
    return p;
  });
}
const IsDrizzleView = Symbol.for("drizzle:IsDrizzleView");
class View {
  static [entityKind] = "View";
  /** @internal */
  [ViewBaseConfig];
  /** @internal */
  [IsDrizzleView] = true;
  constructor({ name: name2, schema, selectedFields, query }) {
    this[ViewBaseConfig] = {
      name: name2,
      originalName: name2,
      schema,
      selectedFields,
      query,
      isExisting: !query,
      isAlias: false
    };
  }
  getSQL() {
    return new SQL([this]);
  }
}
Column.prototype.getSQL = function() {
  return new SQL([this]);
};
Table.prototype.getSQL = function() {
  return new SQL([this]);
};
Subquery.prototype.getSQL = function() {
  return new SQL([this]);
};

class ColumnAliasProxyHandler {
  constructor(table) {
    this.table = table;
  }
  static [entityKind] = "ColumnAliasProxyHandler";
  get(columnObj, prop) {
    if (prop === "table") {
      return this.table;
    }
    return columnObj[prop];
  }
}
class TableAliasProxyHandler {
  constructor(alias, replaceOriginalName) {
    this.alias = alias;
    this.replaceOriginalName = replaceOriginalName;
  }
  static [entityKind] = "TableAliasProxyHandler";
  get(target, prop) {
    if (prop === Table.Symbol.IsAlias) {
      return true;
    }
    if (prop === Table.Symbol.Name) {
      return this.alias;
    }
    if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) {
      return this.alias;
    }
    if (prop === ViewBaseConfig) {
      return {
        ...target[ViewBaseConfig],
        name: this.alias,
        isAlias: true
      };
    }
    if (prop === Table.Symbol.Columns) {
      const columns = target[Table.Symbol.Columns];
      if (!columns) {
        return columns;
      }
      const proxiedColumns = {};
      Object.keys(columns).map((key) => {
        proxiedColumns[key] = new Proxy(
          columns[key],
          new ColumnAliasProxyHandler(new Proxy(target, this))
        );
      });
      return proxiedColumns;
    }
    const value = target[prop];
    if (is(value, Column)) {
      return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
    }
    return value;
  }
}
function aliasedTable(table, tableAlias) {
  return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
}
function aliasedTableColumn(column, tableAlias) {
  return new Proxy(
    column,
    new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false)))
  );
}
function mapColumnsInAliasedSQLToAlias(query, alias) {
  return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}
function mapColumnsInSQLToAlias(query, alias) {
  return sql.join(query.queryChunks.map((c) => {
    if (is(c, Column)) {
      return aliasedTableColumn(c, alias);
    }
    if (is(c, SQL)) {
      return mapColumnsInSQLToAlias(c, alias);
    }
    if (is(c, SQL.Aliased)) {
      return mapColumnsInAliasedSQLToAlias(c, alias);
    }
    return c;
  }));
}

function mapResultRow(columns, row, joinsNotNullableMap) {
  const nullifyMap = {};
  const result = columns.reduce(
    (result2, { path, field }, columnIndex) => {
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      let node = result2;
      for (const [pathChunkIndex, pathChunk] of path.entries()) {
        if (pathChunkIndex < path.length - 1) {
          if (!(pathChunk in node)) {
            node[pathChunk] = {};
          }
          node = node[pathChunk];
        } else {
          const rawValue = row[columnIndex];
          const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
          if (joinsNotNullableMap && is(field, Column) && path.length === 2) {
            const objectName = path[0];
            if (!(objectName in nullifyMap)) {
              nullifyMap[objectName] = value === null ? getTableName(field.table) : false;
            } else if (typeof nullifyMap[objectName] === "string" && nullifyMap[objectName] !== getTableName(field.table)) {
              nullifyMap[objectName] = false;
            }
          }
        }
      }
      return result2;
    },
    {}
  );
  if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
    for (const [objectName, tableName] of Object.entries(nullifyMap)) {
      if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) {
        result[objectName] = null;
      }
    }
  }
  return result;
}
function orderSelectedFields(fields, pathPrefix) {
  return Object.entries(fields).reduce((result, [name, field]) => {
    if (typeof name !== "string") {
      return result;
    }
    const newPath = pathPrefix ? [...pathPrefix, name] : [name];
    if (is(field, Column) || is(field, SQL) || is(field, SQL.Aliased)) {
      result.push({ path: newPath, field });
    } else if (is(field, Table)) {
      result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
    } else {
      result.push(...orderSelectedFields(field, newPath));
    }
    return result;
  }, []);
}
function haveSameKeys(left, right) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (const [index, key] of leftKeys.entries()) {
    if (key !== rightKeys[index]) {
      return false;
    }
  }
  return true;
}
function mapUpdateSet(table, values) {
  const entries = Object.entries(values).filter(([, value]) => value !== void 0).map(([key, value]) => {
    if (is(value, SQL) || is(value, Column)) {
      return [key, value];
    } else {
      return [key, new Param(value, table[Table.Symbol.Columns][key])];
    }
  });
  if (entries.length === 0) {
    throw new Error("No values to set");
  }
  return Object.fromEntries(entries);
}
function applyMixins(baseClass, extendedClasses) {
  for (const extendedClass of extendedClasses) {
    for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
      if (name === "constructor") continue;
      Object.defineProperty(
        baseClass.prototype,
        name,
        Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || /* @__PURE__ */ Object.create(null)
      );
    }
  }
}
function getTableColumns(table) {
  return table[Table.Symbol.Columns];
}
function getTableLikeName(table) {
  return is(table, Subquery) ? table._.alias : is(table, View) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : table[Table.Symbol.IsAlias] ? table[Table.Symbol.Name] : table[Table.Symbol.BaseName];
}
function getColumnNameAndConfig(a, b) {
  return {
    name: typeof a === "string" && a.length > 0 ? a : "",
    config: typeof a === "object" ? a : b
  };
}
function isConfig(data) {
  if (typeof data !== "object" || data === null) return false;
  if (data.constructor.name !== "Object") return false;
  if ("logger" in data) {
    const type = typeof data["logger"];
    if (type !== "boolean" && (type !== "object" || typeof data["logger"]["logQuery"] !== "function") && type !== "undefined") return false;
    return true;
  }
  if ("schema" in data) {
    const type = typeof data["schema"];
    if (type !== "object" && type !== "undefined") return false;
    return true;
  }
  if ("casing" in data) {
    const type = typeof data["casing"];
    if (type !== "string" && type !== "undefined") return false;
    return true;
  }
  if ("mode" in data) {
    if (data["mode"] !== "default" || data["mode"] !== "planetscale" || data["mode"] !== void 0) return false;
    return true;
  }
  if ("connection" in data) {
    const type = typeof data["connection"];
    if (type !== "string" && type !== "object" && type !== "undefined") return false;
    return true;
  }
  if ("client" in data) {
    const type = typeof data["client"];
    if (type !== "object" && type !== "function" && type !== "undefined") return false;
    return true;
  }
  if (Object.keys(data).length === 0) return true;
  return false;
}
typeof TextDecoder === "undefined" ? null : new TextDecoder();

class PgIntColumnBaseBuilder extends PgColumnBuilder {
  static [entityKind] = "PgIntColumnBaseBuilder";
  generatedAlwaysAsIdentity(sequence) {
    if (sequence) {
      const { name, ...options } = sequence;
      this.config.generatedIdentity = {
        type: "always",
        sequenceName: name,
        sequenceOptions: options
      };
    } else {
      this.config.generatedIdentity = {
        type: "always"
      };
    }
    this.config.hasDefault = true;
    this.config.notNull = true;
    return this;
  }
  generatedByDefaultAsIdentity(sequence) {
    if (sequence) {
      const { name, ...options } = sequence;
      this.config.generatedIdentity = {
        type: "byDefault",
        sequenceName: name,
        sequenceOptions: options
      };
    } else {
      this.config.generatedIdentity = {
        type: "byDefault"
      };
    }
    this.config.hasDefault = true;
    this.config.notNull = true;
    return this;
  }
}

class PgBigInt53Builder extends PgIntColumnBaseBuilder {
  static [entityKind] = "PgBigInt53Builder";
  constructor(name) {
    super(name, "number", "PgBigInt53");
  }
  /** @internal */
  build(table) {
    return new PgBigInt53(table, this.config);
  }
}
class PgBigInt53 extends PgColumn {
  static [entityKind] = "PgBigInt53";
  getSQLType() {
    return "bigint";
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }
}
class PgBigInt64Builder extends PgIntColumnBaseBuilder {
  static [entityKind] = "PgBigInt64Builder";
  constructor(name) {
    super(name, "bigint", "PgBigInt64");
  }
  /** @internal */
  build(table) {
    return new PgBigInt64(
      table,
      this.config
    );
  }
}
class PgBigInt64 extends PgColumn {
  static [entityKind] = "PgBigInt64";
  getSQLType() {
    return "bigint";
  }
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  mapFromDriverValue(value) {
    return BigInt(value);
  }
}
function bigint(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config.mode === "number") {
    return new PgBigInt53Builder(name);
  }
  return new PgBigInt64Builder(name);
}

class PgBigSerial53Builder extends PgColumnBuilder {
  static [entityKind] = "PgBigSerial53Builder";
  constructor(name) {
    super(name, "number", "PgBigSerial53");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgBigSerial53(
      table,
      this.config
    );
  }
}
class PgBigSerial53 extends PgColumn {
  static [entityKind] = "PgBigSerial53";
  getSQLType() {
    return "bigserial";
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }
}
class PgBigSerial64Builder extends PgColumnBuilder {
  static [entityKind] = "PgBigSerial64Builder";
  constructor(name) {
    super(name, "bigint", "PgBigSerial64");
    this.config.hasDefault = true;
  }
  /** @internal */
  build(table) {
    return new PgBigSerial64(
      table,
      this.config
    );
  }
}
class PgBigSerial64 extends PgColumn {
  static [entityKind] = "PgBigSerial64";
  getSQLType() {
    return "bigserial";
  }
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  mapFromDriverValue(value) {
    return BigInt(value);
  }
}
function bigserial(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config.mode === "number") {
    return new PgBigSerial53Builder(name);
  }
  return new PgBigSerial64Builder(name);
}

class PgBooleanBuilder extends PgColumnBuilder {
  static [entityKind] = "PgBooleanBuilder";
  constructor(name) {
    super(name, "boolean", "PgBoolean");
  }
  /** @internal */
  build(table) {
    return new PgBoolean(table, this.config);
  }
}
class PgBoolean extends PgColumn {
  static [entityKind] = "PgBoolean";
  getSQLType() {
    return "boolean";
  }
}
function boolean(name) {
  return new PgBooleanBuilder(name ?? "");
}

class PgCharBuilder extends PgColumnBuilder {
  static [entityKind] = "PgCharBuilder";
  constructor(name, config) {
    super(name, "string", "PgChar");
    this.config.length = config.length;
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgChar(
      table,
      this.config
    );
  }
}
class PgChar extends PgColumn {
  static [entityKind] = "PgChar";
  length = this.config.length;
  enumValues = this.config.enumValues;
  getSQLType() {
    return this.length === void 0 ? `char` : `char(${this.length})`;
  }
}
function char(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgCharBuilder(name, config);
}

class PgCidrBuilder extends PgColumnBuilder {
  static [entityKind] = "PgCidrBuilder";
  constructor(name) {
    super(name, "string", "PgCidr");
  }
  /** @internal */
  build(table) {
    return new PgCidr(table, this.config);
  }
}
class PgCidr extends PgColumn {
  static [entityKind] = "PgCidr";
  getSQLType() {
    return "cidr";
  }
}
function cidr(name) {
  return new PgCidrBuilder(name ?? "");
}

class PgCustomColumnBuilder extends PgColumnBuilder {
  static [entityKind] = "PgCustomColumnBuilder";
  constructor(name, fieldConfig, customTypeParams) {
    super(name, "custom", "PgCustomColumn");
    this.config.fieldConfig = fieldConfig;
    this.config.customTypeParams = customTypeParams;
  }
  /** @internal */
  build(table) {
    return new PgCustomColumn(
      table,
      this.config
    );
  }
}
class PgCustomColumn extends PgColumn {
  static [entityKind] = "PgCustomColumn";
  sqlName;
  mapTo;
  mapFrom;
  constructor(table, config) {
    super(table, config);
    this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
    this.mapTo = config.customTypeParams.toDriver;
    this.mapFrom = config.customTypeParams.fromDriver;
  }
  getSQLType() {
    return this.sqlName;
  }
  mapFromDriverValue(value) {
    return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
  }
  mapToDriverValue(value) {
    return typeof this.mapTo === "function" ? this.mapTo(value) : value;
  }
}
function customType(customTypeParams) {
  return (a, b) => {
    const { name, config } = getColumnNameAndConfig(a, b);
    return new PgCustomColumnBuilder(name, config, customTypeParams);
  };
}

class PgDateColumnBaseBuilder extends PgColumnBuilder {
  static [entityKind] = "PgDateColumnBaseBuilder";
  defaultNow() {
    return this.default(sql`now()`);
  }
}

class PgDateBuilder extends PgDateColumnBaseBuilder {
  static [entityKind] = "PgDateBuilder";
  constructor(name) {
    super(name, "date", "PgDate");
  }
  /** @internal */
  build(table) {
    return new PgDate(table, this.config);
  }
}
class PgDate extends PgColumn {
  static [entityKind] = "PgDate";
  getSQLType() {
    return "date";
  }
  mapFromDriverValue(value) {
    return new Date(value);
  }
  mapToDriverValue(value) {
    return value.toISOString();
  }
}
class PgDateStringBuilder extends PgDateColumnBaseBuilder {
  static [entityKind] = "PgDateStringBuilder";
  constructor(name) {
    super(name, "string", "PgDateString");
  }
  /** @internal */
  build(table) {
    return new PgDateString(
      table,
      this.config
    );
  }
}
class PgDateString extends PgColumn {
  static [entityKind] = "PgDateString";
  getSQLType() {
    return "date";
  }
}
function date(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config?.mode === "date") {
    return new PgDateBuilder(name);
  }
  return new PgDateStringBuilder(name);
}

class PgDoublePrecisionBuilder extends PgColumnBuilder {
  static [entityKind] = "PgDoublePrecisionBuilder";
  constructor(name) {
    super(name, "number", "PgDoublePrecision");
  }
  /** @internal */
  build(table) {
    return new PgDoublePrecision(
      table,
      this.config
    );
  }
}
class PgDoublePrecision extends PgColumn {
  static [entityKind] = "PgDoublePrecision";
  getSQLType() {
    return "double precision";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number.parseFloat(value);
    }
    return value;
  }
}
function doublePrecision(name) {
  return new PgDoublePrecisionBuilder(name ?? "");
}

class PgInetBuilder extends PgColumnBuilder {
  static [entityKind] = "PgInetBuilder";
  constructor(name) {
    super(name, "string", "PgInet");
  }
  /** @internal */
  build(table) {
    return new PgInet(table, this.config);
  }
}
class PgInet extends PgColumn {
  static [entityKind] = "PgInet";
  getSQLType() {
    return "inet";
  }
}
function inet(name) {
  return new PgInetBuilder(name ?? "");
}

class PgIntegerBuilder extends PgIntColumnBaseBuilder {
  static [entityKind] = "PgIntegerBuilder";
  constructor(name) {
    super(name, "number", "PgInteger");
  }
  /** @internal */
  build(table) {
    return new PgInteger(table, this.config);
  }
}
class PgInteger extends PgColumn {
  static [entityKind] = "PgInteger";
  getSQLType() {
    return "integer";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number.parseInt(value);
    }
    return value;
  }
}
function integer(name) {
  return new PgIntegerBuilder(name ?? "");
}

class PgIntervalBuilder extends PgColumnBuilder {
  static [entityKind] = "PgIntervalBuilder";
  constructor(name, intervalConfig) {
    super(name, "string", "PgInterval");
    this.config.intervalConfig = intervalConfig;
  }
  /** @internal */
  build(table) {
    return new PgInterval(table, this.config);
  }
}
class PgInterval extends PgColumn {
  static [entityKind] = "PgInterval";
  fields = this.config.intervalConfig.fields;
  precision = this.config.intervalConfig.precision;
  getSQLType() {
    const fields = this.fields ? ` ${this.fields}` : "";
    const precision = this.precision ? `(${this.precision})` : "";
    return `interval${fields}${precision}`;
  }
}
function interval(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgIntervalBuilder(name, config);
}

class PgJsonBuilder extends PgColumnBuilder {
  static [entityKind] = "PgJsonBuilder";
  constructor(name) {
    super(name, "json", "PgJson");
  }
  /** @internal */
  build(table) {
    return new PgJson(table, this.config);
  }
}
class PgJson extends PgColumn {
  static [entityKind] = "PgJson";
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "json";
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
}
function json(name) {
  return new PgJsonBuilder(name ?? "");
}

class PgJsonbBuilder extends PgColumnBuilder {
  static [entityKind] = "PgJsonbBuilder";
  constructor(name) {
    super(name, "json", "PgJsonb");
  }
  /** @internal */
  build(table) {
    return new PgJsonb(table, this.config);
  }
}
class PgJsonb extends PgColumn {
  static [entityKind] = "PgJsonb";
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "jsonb";
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
}
function jsonb(name) {
  return new PgJsonbBuilder(name ?? "");
}

class PgLineBuilder extends PgColumnBuilder {
  static [entityKind] = "PgLineBuilder";
  constructor(name) {
    super(name, "array", "PgLine");
  }
  /** @internal */
  build(table) {
    return new PgLineTuple(
      table,
      this.config
    );
  }
}
class PgLineTuple extends PgColumn {
  static [entityKind] = "PgLine";
  getSQLType() {
    return "line";
  }
  mapFromDriverValue(value) {
    const [a, b, c] = value.slice(1, -1).split(",");
    return [Number.parseFloat(a), Number.parseFloat(b), Number.parseFloat(c)];
  }
  mapToDriverValue(value) {
    return `{${value[0]},${value[1]},${value[2]}}`;
  }
}
class PgLineABCBuilder extends PgColumnBuilder {
  static [entityKind] = "PgLineABCBuilder";
  constructor(name) {
    super(name, "json", "PgLineABC");
  }
  /** @internal */
  build(table) {
    return new PgLineABC(
      table,
      this.config
    );
  }
}
class PgLineABC extends PgColumn {
  static [entityKind] = "PgLineABC";
  getSQLType() {
    return "line";
  }
  mapFromDriverValue(value) {
    const [a, b, c] = value.slice(1, -1).split(",");
    return { a: Number.parseFloat(a), b: Number.parseFloat(b), c: Number.parseFloat(c) };
  }
  mapToDriverValue(value) {
    return `{${value.a},${value.b},${value.c}}`;
  }
}
function line(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (!config?.mode || config.mode === "tuple") {
    return new PgLineBuilder(name);
  }
  return new PgLineABCBuilder(name);
}

class PgMacaddrBuilder extends PgColumnBuilder {
  static [entityKind] = "PgMacaddrBuilder";
  constructor(name) {
    super(name, "string", "PgMacaddr");
  }
  /** @internal */
  build(table) {
    return new PgMacaddr(table, this.config);
  }
}
class PgMacaddr extends PgColumn {
  static [entityKind] = "PgMacaddr";
  getSQLType() {
    return "macaddr";
  }
}
function macaddr(name) {
  return new PgMacaddrBuilder(name ?? "");
}

class PgMacaddr8Builder extends PgColumnBuilder {
  static [entityKind] = "PgMacaddr8Builder";
  constructor(name) {
    super(name, "string", "PgMacaddr8");
  }
  /** @internal */
  build(table) {
    return new PgMacaddr8(table, this.config);
  }
}
class PgMacaddr8 extends PgColumn {
  static [entityKind] = "PgMacaddr8";
  getSQLType() {
    return "macaddr8";
  }
}
function macaddr8(name) {
  return new PgMacaddr8Builder(name ?? "");
}

class PgNumericBuilder extends PgColumnBuilder {
  static [entityKind] = "PgNumericBuilder";
  constructor(name, precision, scale) {
    super(name, "string", "PgNumeric");
    this.config.precision = precision;
    this.config.scale = scale;
  }
  /** @internal */
  build(table) {
    return new PgNumeric(table, this.config);
  }
}
class PgNumeric extends PgColumn {
  static [entityKind] = "PgNumeric";
  precision;
  scale;
  constructor(table, config) {
    super(table, config);
    this.precision = config.precision;
    this.scale = config.scale;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") return value;
    return String(value);
  }
  getSQLType() {
    if (this.precision !== void 0 && this.scale !== void 0) {
      return `numeric(${this.precision}, ${this.scale})`;
    } else if (this.precision === void 0) {
      return "numeric";
    } else {
      return `numeric(${this.precision})`;
    }
  }
}
class PgNumericNumberBuilder extends PgColumnBuilder {
  static [entityKind] = "PgNumericNumberBuilder";
  constructor(name, precision, scale) {
    super(name, "number", "PgNumericNumber");
    this.config.precision = precision;
    this.config.scale = scale;
  }
  /** @internal */
  build(table) {
    return new PgNumericNumber(
      table,
      this.config
    );
  }
}
class PgNumericNumber extends PgColumn {
  static [entityKind] = "PgNumericNumber";
  precision;
  scale;
  constructor(table, config) {
    super(table, config);
    this.precision = config.precision;
    this.scale = config.scale;
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") return value;
    return Number(value);
  }
  mapToDriverValue = String;
  getSQLType() {
    if (this.precision !== void 0 && this.scale !== void 0) {
      return `numeric(${this.precision}, ${this.scale})`;
    } else if (this.precision === void 0) {
      return "numeric";
    } else {
      return `numeric(${this.precision})`;
    }
  }
}
class PgNumericBigIntBuilder extends PgColumnBuilder {
  static [entityKind] = "PgNumericBigIntBuilder";
  constructor(name, precision, scale) {
    super(name, "bigint", "PgNumericBigInt");
    this.config.precision = precision;
    this.config.scale = scale;
  }
  /** @internal */
  build(table) {
    return new PgNumericBigInt(
      table,
      this.config
    );
  }
}
class PgNumericBigInt extends PgColumn {
  static [entityKind] = "PgNumericBigInt";
  precision;
  scale;
  constructor(table, config) {
    super(table, config);
    this.precision = config.precision;
    this.scale = config.scale;
  }
  mapFromDriverValue = BigInt;
  mapToDriverValue = String;
  getSQLType() {
    if (this.precision !== void 0 && this.scale !== void 0) {
      return `numeric(${this.precision}, ${this.scale})`;
    } else if (this.precision === void 0) {
      return "numeric";
    } else {
      return `numeric(${this.precision})`;
    }
  }
}
function numeric(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  const mode = config?.mode;
  return mode === "number" ? new PgNumericNumberBuilder(name, config?.precision, config?.scale) : mode === "bigint" ? new PgNumericBigIntBuilder(name, config?.precision, config?.scale) : new PgNumericBuilder(name, config?.precision, config?.scale);
}

class PgPointTupleBuilder extends PgColumnBuilder {
  static [entityKind] = "PgPointTupleBuilder";
  constructor(name) {
    super(name, "array", "PgPointTuple");
  }
  /** @internal */
  build(table) {
    return new PgPointTuple(
      table,
      this.config
    );
  }
}
class PgPointTuple extends PgColumn {
  static [entityKind] = "PgPointTuple";
  getSQLType() {
    return "point";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      const [x, y] = value.slice(1, -1).split(",");
      return [Number.parseFloat(x), Number.parseFloat(y)];
    }
    return [value.x, value.y];
  }
  mapToDriverValue(value) {
    return `(${value[0]},${value[1]})`;
  }
}
class PgPointObjectBuilder extends PgColumnBuilder {
  static [entityKind] = "PgPointObjectBuilder";
  constructor(name) {
    super(name, "json", "PgPointObject");
  }
  /** @internal */
  build(table) {
    return new PgPointObject(
      table,
      this.config
    );
  }
}
class PgPointObject extends PgColumn {
  static [entityKind] = "PgPointObject";
  getSQLType() {
    return "point";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      const [x, y] = value.slice(1, -1).split(",");
      return { x: Number.parseFloat(x), y: Number.parseFloat(y) };
    }
    return value;
  }
  mapToDriverValue(value) {
    return `(${value.x},${value.y})`;
  }
}
function point(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (!config?.mode || config.mode === "tuple") {
    return new PgPointTupleBuilder(name);
  }
  return new PgPointObjectBuilder(name);
}

function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(Number.parseInt(hex.slice(c, c + 2), 16));
  }
  return new Uint8Array(bytes);
}
function bytesToFloat64(bytes, offset) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  for (let i = 0; i < 8; i++) {
    view.setUint8(i, bytes[offset + i]);
  }
  return view.getFloat64(0, true);
}
function parseEWKB(hex) {
  const bytes = hexToBytes(hex);
  let offset = 0;
  const byteOrder = bytes[offset];
  offset += 1;
  const view = new DataView(bytes.buffer);
  const geomType = view.getUint32(offset, byteOrder === 1);
  offset += 4;
  if (geomType & 536870912) {
    view.getUint32(offset, byteOrder === 1);
    offset += 4;
  }
  if ((geomType & 65535) === 1) {
    const x = bytesToFloat64(bytes, offset);
    offset += 8;
    const y = bytesToFloat64(bytes, offset);
    offset += 8;
    return [x, y];
  }
  throw new Error("Unsupported geometry type");
}

class PgGeometryBuilder extends PgColumnBuilder {
  static [entityKind] = "PgGeometryBuilder";
  constructor(name) {
    super(name, "array", "PgGeometry");
  }
  /** @internal */
  build(table) {
    return new PgGeometry(
      table,
      this.config
    );
  }
}
class PgGeometry extends PgColumn {
  static [entityKind] = "PgGeometry";
  getSQLType() {
    return "geometry(point)";
  }
  mapFromDriverValue(value) {
    return parseEWKB(value);
  }
  mapToDriverValue(value) {
    return `point(${value[0]} ${value[1]})`;
  }
}
class PgGeometryObjectBuilder extends PgColumnBuilder {
  static [entityKind] = "PgGeometryObjectBuilder";
  constructor(name) {
    super(name, "json", "PgGeometryObject");
  }
  /** @internal */
  build(table) {
    return new PgGeometryObject(
      table,
      this.config
    );
  }
}
class PgGeometryObject extends PgColumn {
  static [entityKind] = "PgGeometryObject";
  getSQLType() {
    return "geometry(point)";
  }
  mapFromDriverValue(value) {
    const parsed = parseEWKB(value);
    return { x: parsed[0], y: parsed[1] };
  }
  mapToDriverValue(value) {
    return `point(${value.x} ${value.y})`;
  }
}
function geometry(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (!config?.mode || config.mode === "tuple") {
    return new PgGeometryBuilder(name);
  }
  return new PgGeometryObjectBuilder(name);
}

class PgRealBuilder extends PgColumnBuilder {
  static [entityKind] = "PgRealBuilder";
  constructor(name, length) {
    super(name, "number", "PgReal");
    this.config.length = length;
  }
  /** @internal */
  build(table) {
    return new PgReal(table, this.config);
  }
}
class PgReal extends PgColumn {
  static [entityKind] = "PgReal";
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "real";
  }
  mapFromDriverValue = (value) => {
    if (typeof value === "string") {
      return Number.parseFloat(value);
    }
    return value;
  };
}
function real(name) {
  return new PgRealBuilder(name ?? "");
}

class PgSerialBuilder extends PgColumnBuilder {
  static [entityKind] = "PgSerialBuilder";
  constructor(name) {
    super(name, "number", "PgSerial");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgSerial(table, this.config);
  }
}
class PgSerial extends PgColumn {
  static [entityKind] = "PgSerial";
  getSQLType() {
    return "serial";
  }
}
function serial(name) {
  return new PgSerialBuilder(name ?? "");
}

class PgSmallIntBuilder extends PgIntColumnBaseBuilder {
  static [entityKind] = "PgSmallIntBuilder";
  constructor(name) {
    super(name, "number", "PgSmallInt");
  }
  /** @internal */
  build(table) {
    return new PgSmallInt(table, this.config);
  }
}
class PgSmallInt extends PgColumn {
  static [entityKind] = "PgSmallInt";
  getSQLType() {
    return "smallint";
  }
  mapFromDriverValue = (value) => {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  };
}
function smallint(name) {
  return new PgSmallIntBuilder(name ?? "");
}

class PgSmallSerialBuilder extends PgColumnBuilder {
  static [entityKind] = "PgSmallSerialBuilder";
  constructor(name) {
    super(name, "number", "PgSmallSerial");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgSmallSerial(
      table,
      this.config
    );
  }
}
class PgSmallSerial extends PgColumn {
  static [entityKind] = "PgSmallSerial";
  getSQLType() {
    return "smallserial";
  }
}
function smallserial(name) {
  return new PgSmallSerialBuilder(name ?? "");
}

class PgTextBuilder extends PgColumnBuilder {
  static [entityKind] = "PgTextBuilder";
  constructor(name, config) {
    super(name, "string", "PgText");
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgText(table, this.config);
  }
}
class PgText extends PgColumn {
  static [entityKind] = "PgText";
  enumValues = this.config.enumValues;
  getSQLType() {
    return "text";
  }
}
function text(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgTextBuilder(name, config);
}

class PgTimeBuilder extends PgDateColumnBaseBuilder {
  constructor(name, withTimezone, precision) {
    super(name, "string", "PgTime");
    this.withTimezone = withTimezone;
    this.precision = precision;
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  static [entityKind] = "PgTimeBuilder";
  /** @internal */
  build(table) {
    return new PgTime(table, this.config);
  }
}
class PgTime extends PgColumn {
  static [entityKind] = "PgTime";
  withTimezone;
  precision;
  constructor(table, config) {
    super(table, config);
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : `(${this.precision})`;
    return `time${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
}
function time(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgTimeBuilder(name, config.withTimezone ?? false, config.precision);
}

class PgTimestampBuilder extends PgDateColumnBaseBuilder {
  static [entityKind] = "PgTimestampBuilder";
  constructor(name, withTimezone, precision) {
    super(name, "date", "PgTimestamp");
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  /** @internal */
  build(table) {
    return new PgTimestamp(table, this.config);
  }
}
class PgTimestamp extends PgColumn {
  static [entityKind] = "PgTimestamp";
  withTimezone;
  precision;
  constructor(table, config) {
    super(table, config);
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : ` (${this.precision})`;
    return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
  mapFromDriverValue = (value) => {
    return new Date(this.withTimezone ? value : value + "+0000");
  };
  mapToDriverValue = (value) => {
    return value.toISOString();
  };
}
class PgTimestampStringBuilder extends PgDateColumnBaseBuilder {
  static [entityKind] = "PgTimestampStringBuilder";
  constructor(name, withTimezone, precision) {
    super(name, "string", "PgTimestampString");
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  /** @internal */
  build(table) {
    return new PgTimestampString(
      table,
      this.config
    );
  }
}
class PgTimestampString extends PgColumn {
  static [entityKind] = "PgTimestampString";
  withTimezone;
  precision;
  constructor(table, config) {
    super(table, config);
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : `(${this.precision})`;
    return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
}
function timestamp(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config?.mode === "string") {
    return new PgTimestampStringBuilder(name, config.withTimezone ?? false, config.precision);
  }
  return new PgTimestampBuilder(name, config?.withTimezone ?? false, config?.precision);
}

class PgUUIDBuilder extends PgColumnBuilder {
  static [entityKind] = "PgUUIDBuilder";
  constructor(name) {
    super(name, "string", "PgUUID");
  }
  /**
   * Adds `default gen_random_uuid()` to the column definition.
   */
  defaultRandom() {
    return this.default(sql`gen_random_uuid()`);
  }
  /** @internal */
  build(table) {
    return new PgUUID(table, this.config);
  }
}
class PgUUID extends PgColumn {
  static [entityKind] = "PgUUID";
  getSQLType() {
    return "uuid";
  }
}
function uuid(name) {
  return new PgUUIDBuilder(name ?? "");
}

class PgVarcharBuilder extends PgColumnBuilder {
  static [entityKind] = "PgVarcharBuilder";
  constructor(name, config) {
    super(name, "string", "PgVarchar");
    this.config.length = config.length;
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgVarchar(
      table,
      this.config
    );
  }
}
class PgVarchar extends PgColumn {
  static [entityKind] = "PgVarchar";
  length = this.config.length;
  enumValues = this.config.enumValues;
  getSQLType() {
    return this.length === void 0 ? `varchar` : `varchar(${this.length})`;
  }
}
function varchar(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgVarcharBuilder(name, config);
}

class PgBinaryVectorBuilder extends PgColumnBuilder {
  static [entityKind] = "PgBinaryVectorBuilder";
  constructor(name, config) {
    super(name, "string", "PgBinaryVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgBinaryVector(
      table,
      this.config
    );
  }
}
class PgBinaryVector extends PgColumn {
  static [entityKind] = "PgBinaryVector";
  dimensions = this.config.dimensions;
  getSQLType() {
    return `bit(${this.dimensions})`;
  }
}
function bit(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgBinaryVectorBuilder(name, config);
}

class PgHalfVectorBuilder extends PgColumnBuilder {
  static [entityKind] = "PgHalfVectorBuilder";
  constructor(name, config) {
    super(name, "array", "PgHalfVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgHalfVector(
      table,
      this.config
    );
  }
}
class PgHalfVector extends PgColumn {
  static [entityKind] = "PgHalfVector";
  dimensions = this.config.dimensions;
  getSQLType() {
    return `halfvec(${this.dimensions})`;
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
  }
}
function halfvec(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgHalfVectorBuilder(name, config);
}

class PgSparseVectorBuilder extends PgColumnBuilder {
  static [entityKind] = "PgSparseVectorBuilder";
  constructor(name, config) {
    super(name, "string", "PgSparseVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgSparseVector(
      table,
      this.config
    );
  }
}
class PgSparseVector extends PgColumn {
  static [entityKind] = "PgSparseVector";
  dimensions = this.config.dimensions;
  getSQLType() {
    return `sparsevec(${this.dimensions})`;
  }
}
function sparsevec(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgSparseVectorBuilder(name, config);
}

class PgVectorBuilder extends PgColumnBuilder {
  static [entityKind] = "PgVectorBuilder";
  constructor(name, config) {
    super(name, "array", "PgVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgVector(
      table,
      this.config
    );
  }
}
class PgVector extends PgColumn {
  static [entityKind] = "PgVector";
  dimensions = this.config.dimensions;
  getSQLType() {
    return `vector(${this.dimensions})`;
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
  }
}
function vector(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgVectorBuilder(name, config);
}

class QueryPromise {
  static [entityKind] = "QueryPromise";
  [Symbol.toStringTag] = "QueryPromise";
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally?.();
        return value;
      },
      (reason) => {
        onFinally?.();
        throw reason;
      }
    );
  }
  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
}

class SelectionProxyHandler {
  static [entityKind] = "SelectionProxyHandler";
  config;
  constructor(config) {
    this.config = { ...config };
  }
  get(subquery, prop) {
    if (prop === "_") {
      return {
        ...subquery["_"],
        selectedFields: new Proxy(
          subquery._.selectedFields,
          this
        )
      };
    }
    if (prop === ViewBaseConfig) {
      return {
        ...subquery[ViewBaseConfig],
        selectedFields: new Proxy(
          subquery[ViewBaseConfig].selectedFields,
          this
        )
      };
    }
    if (typeof prop === "symbol") {
      return subquery[prop];
    }
    const columns = is(subquery, Subquery) ? subquery._.selectedFields : is(subquery, View) ? subquery[ViewBaseConfig].selectedFields : subquery;
    const value = columns[prop];
    if (is(value, SQL.Aliased)) {
      if (this.config.sqlAliasedBehavior === "sql" && !value.isSelectionField) {
        return value.sql;
      }
      const newValue = value.clone();
      newValue.isSelectionField = true;
      return newValue;
    }
    if (is(value, SQL)) {
      if (this.config.sqlBehavior === "sql") {
        return value;
      }
      throw new Error(
        `You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`
      );
    }
    if (is(value, Column)) {
      if (this.config.alias) {
        return new Proxy(
          value,
          new ColumnAliasProxyHandler(
            new Proxy(
              value.table,
              new TableAliasProxyHandler(this.config.alias, this.config.replaceOriginalName ?? false)
            )
          )
        );
      }
      return value;
    }
    if (typeof value !== "object" || value === null) {
      return value;
    }
    return new Proxy(value, new SelectionProxyHandler(this.config));
  }
}

function getPgColumnBuilders() {
  return {
    bigint,
    bigserial,
    boolean,
    char,
    cidr,
    customType,
    date,
    doublePrecision,
    inet,
    integer,
    interval,
    json,
    jsonb,
    line,
    macaddr,
    macaddr8,
    numeric,
    point,
    geometry,
    real,
    serial,
    smallint,
    smallserial,
    text,
    time,
    timestamp,
    uuid,
    varchar,
    bit,
    halfvec,
    sparsevec,
    vector
  };
}

const InlineForeignKeys = Symbol.for("drizzle:PgInlineForeignKeys");
const EnableRLS = Symbol.for("drizzle:EnableRLS");
class PgTable extends Table {
  static [entityKind] = "PgTable";
  /** @internal */
  static Symbol = Object.assign({}, Table.Symbol, {
    InlineForeignKeys,
    EnableRLS
  });
  /**@internal */
  [InlineForeignKeys] = [];
  /** @internal */
  [EnableRLS] = false;
  /** @internal */
  [Table.Symbol.ExtraConfigBuilder] = void 0;
  /** @internal */
  [Table.Symbol.ExtraConfigColumns] = {};
}
function pgTableWithSchema(name, columns, extraConfig, schema, baseName = name) {
  const rawTable = new PgTable(name, schema, baseName);
  const parsedColumns = typeof columns === "function" ? columns(getPgColumnBuilders()) : columns;
  const builtColumns = Object.fromEntries(
    Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name2);
      const column = colBuilder.build(rawTable);
      rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
      return [name2, column];
    })
  );
  const builtColumnsForExtraConfig = Object.fromEntries(
    Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name2);
      const column = colBuilder.buildExtraConfigColumn(rawTable);
      return [name2, column];
    })
  );
  const table = Object.assign(rawTable, builtColumns);
  table[Table.Symbol.Columns] = builtColumns;
  table[Table.Symbol.ExtraConfigColumns] = builtColumnsForExtraConfig;
  if (extraConfig) {
    table[PgTable.Symbol.ExtraConfigBuilder] = extraConfig;
  }
  return Object.assign(table, {
    enableRLS: () => {
      table[PgTable.Symbol.EnableRLS] = true;
      return table;
    }
  });
}
const pgTable = (name, columns, extraConfig) => {
  return pgTableWithSchema(name, columns, extraConfig, void 0);
};

class IndexBuilderOn {
  constructor(unique, name) {
    this.unique = unique;
    this.name = name;
  }
  static [entityKind] = "PgIndexBuilderOn";
  on(...columns) {
    return new IndexBuilder(
      columns.map((it) => {
        if (is(it, SQL)) {
          return it;
        }
        it = it;
        const clonedIndexedColumn = new IndexedColumn(it.name, !!it.keyAsName, it.columnType, it.indexConfig);
        it.indexConfig = JSON.parse(JSON.stringify(it.defaultConfig));
        return clonedIndexedColumn;
      }),
      this.unique,
      false,
      this.name
    );
  }
  onOnly(...columns) {
    return new IndexBuilder(
      columns.map((it) => {
        if (is(it, SQL)) {
          return it;
        }
        it = it;
        const clonedIndexedColumn = new IndexedColumn(it.name, !!it.keyAsName, it.columnType, it.indexConfig);
        it.indexConfig = it.defaultConfig;
        return clonedIndexedColumn;
      }),
      this.unique,
      true,
      this.name
    );
  }
  /**
   * Specify what index method to use. Choices are `btree`, `hash`, `gist`, `spgist`, `gin`, `brin`, or user-installed access methods like `bloom`. The default method is `btree.
   *
   * If you have the `pg_vector` extension installed in your database, you can use the `hnsw` and `ivfflat` options, which are predefined types.
   *
   * **You can always specify any string you want in the method, in case Drizzle doesn't have it natively in its types**
   *
   * @param method The name of the index method to be used
   * @param columns
   * @returns
   */
  using(method, ...columns) {
    return new IndexBuilder(
      columns.map((it) => {
        if (is(it, SQL)) {
          return it;
        }
        it = it;
        const clonedIndexedColumn = new IndexedColumn(it.name, !!it.keyAsName, it.columnType, it.indexConfig);
        it.indexConfig = JSON.parse(JSON.stringify(it.defaultConfig));
        return clonedIndexedColumn;
      }),
      this.unique,
      true,
      this.name,
      method
    );
  }
}
class IndexBuilder {
  static [entityKind] = "PgIndexBuilder";
  /** @internal */
  config;
  constructor(columns, unique, only, name, method = "btree") {
    this.config = {
      name,
      columns,
      unique,
      only,
      method
    };
  }
  concurrently() {
    this.config.concurrently = true;
    return this;
  }
  with(obj) {
    this.config.with = obj;
    return this;
  }
  where(condition) {
    this.config.where = condition;
    return this;
  }
  /** @internal */
  build(table) {
    return new Index(this.config, table);
  }
}
class Index {
  static [entityKind] = "PgIndex";
  config;
  constructor(config, table) {
    this.config = { ...config, table };
  }
}
function index(name) {
  return new IndexBuilderOn(false, name);
}

function primaryKey(...config) {
  if (config[0].columns) {
    return new PrimaryKeyBuilder(config[0].columns, config[0].name);
  }
  return new PrimaryKeyBuilder(config);
}
class PrimaryKeyBuilder {
  static [entityKind] = "PgPrimaryKeyBuilder";
  /** @internal */
  columns;
  /** @internal */
  name;
  constructor(columns, name) {
    this.columns = columns;
    this.name = name;
  }
  /** @internal */
  build(table) {
    return new PrimaryKey(table, this.columns, this.name);
  }
}
class PrimaryKey {
  constructor(table, columns, name) {
    this.table = table;
    this.columns = columns;
    this.name = name;
  }
  static [entityKind] = "PgPrimaryKey";
  columns;
  name;
  getName() {
    return this.name ?? `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
  }
}

function toSnakeCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.map((word) => word.toLowerCase()).join("_");
}
function toCamelCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.reduce((acc, word, i) => {
    const formattedWord = i === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`;
    return acc + formattedWord;
  }, "");
}
function noopCase(input) {
  return input;
}
class CasingCache {
  static [entityKind] = "CasingCache";
  /** @internal */
  cache = {};
  cachedTables = {};
  convert;
  constructor(casing) {
    this.convert = casing === "snake_case" ? toSnakeCase : casing === "camelCase" ? toCamelCase : noopCase;
  }
  getColumnCasing(column) {
    if (!column.keyAsName) return column.name;
    const schema = column.table[Table.Symbol.Schema] ?? "public";
    const tableName = column.table[Table.Symbol.OriginalName];
    const key = `${schema}.${tableName}.${column.name}`;
    if (!this.cache[key]) {
      this.cacheTable(column.table);
    }
    return this.cache[key];
  }
  cacheTable(table) {
    const schema = table[Table.Symbol.Schema] ?? "public";
    const tableName = table[Table.Symbol.OriginalName];
    const tableKey = `${schema}.${tableName}`;
    if (!this.cachedTables[tableKey]) {
      for (const column of Object.values(table[Table.Symbol.Columns])) {
        const columnKey = `${tableKey}.${column.name}`;
        this.cache[columnKey] = this.convert(column.name);
      }
      this.cachedTables[tableKey] = true;
    }
  }
  clearCache() {
    this.cache = {};
    this.cachedTables = {};
  }
}

class DrizzleError extends Error {
  static [entityKind] = "DrizzleError";
  constructor({ message, cause }) {
    super(message);
    this.name = "DrizzleError";
    this.cause = cause;
  }
}
class DrizzleQueryError extends Error {
  constructor(query, params, cause) {
    super(`Failed query: ${query}
params: ${params}`);
    this.query = query;
    this.params = params;
    this.cause = cause;
    Error.captureStackTrace(this, DrizzleQueryError);
    if (cause) this.cause = cause;
  }
}
class TransactionRollbackError extends DrizzleError {
  static [entityKind] = "TransactionRollbackError";
  constructor() {
    super({ message: "Rollback" });
  }
}

function bindIfParam(value, column) {
  if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View)) {
    return new Param(value, column);
  }
  return value;
}
const eq = (left, right) => {
  return sql`${left} = ${bindIfParam(right, left)}`;
};
const ne = (left, right) => {
  return sql`${left} <> ${bindIfParam(right, left)}`;
};
function and(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" and ")),
    new StringChunk(")")
  ]);
}
function or(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" or ")),
    new StringChunk(")")
  ]);
}
function not(condition) {
  return sql`not ${condition}`;
}
const gt = (left, right) => {
  return sql`${left} > ${bindIfParam(right, left)}`;
};
const gte = (left, right) => {
  return sql`${left} >= ${bindIfParam(right, left)}`;
};
const lt = (left, right) => {
  return sql`${left} < ${bindIfParam(right, left)}`;
};
const lte = (left, right) => {
  return sql`${left} <= ${bindIfParam(right, left)}`;
};
function inArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`false`;
    }
    return sql`${column} in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} in ${bindIfParam(values, column)}`;
}
function notInArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`true`;
    }
    return sql`${column} not in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} not in ${bindIfParam(values, column)}`;
}
function isNull(value) {
  return sql`${value} is null`;
}
function isNotNull(value) {
  return sql`${value} is not null`;
}
function exists(subquery) {
  return sql`exists ${subquery}`;
}
function notExists(subquery) {
  return sql`not exists ${subquery}`;
}
function between(column, min, max) {
  return sql`${column} between ${bindIfParam(min, column)} and ${bindIfParam(
    max,
    column
  )}`;
}
function notBetween(column, min, max) {
  return sql`${column} not between ${bindIfParam(
    min,
    column
  )} and ${bindIfParam(max, column)}`;
}
function like(column, value) {
  return sql`${column} like ${value}`;
}
function notLike(column, value) {
  return sql`${column} not like ${value}`;
}
function ilike(column, value) {
  return sql`${column} ilike ${value}`;
}
function notIlike(column, value) {
  return sql`${column} not ilike ${value}`;
}

function asc(column) {
  return sql`${column} asc`;
}
function desc(column) {
  return sql`${column} desc`;
}

class Relation {
  constructor(sourceTable, referencedTable, relationName) {
    this.sourceTable = sourceTable;
    this.referencedTable = referencedTable;
    this.relationName = relationName;
    this.referencedTableName = referencedTable[Table.Symbol.Name];
  }
  static [entityKind] = "Relation";
  referencedTableName;
  fieldName;
}
class Relations {
  constructor(table, config) {
    this.table = table;
    this.config = config;
  }
  static [entityKind] = "Relations";
}
class One extends Relation {
  constructor(sourceTable, referencedTable, config, isNullable) {
    super(sourceTable, referencedTable, config?.relationName);
    this.config = config;
    this.isNullable = isNullable;
  }
  static [entityKind] = "One";
  withFieldName(fieldName) {
    const relation = new One(
      this.sourceTable,
      this.referencedTable,
      this.config,
      this.isNullable
    );
    relation.fieldName = fieldName;
    return relation;
  }
}
class Many extends Relation {
  constructor(sourceTable, referencedTable, config) {
    super(sourceTable, referencedTable, config?.relationName);
    this.config = config;
  }
  static [entityKind] = "Many";
  withFieldName(fieldName) {
    const relation = new Many(
      this.sourceTable,
      this.referencedTable,
      this.config
    );
    relation.fieldName = fieldName;
    return relation;
  }
}
function getOperators() {
  return {
    and,
    between,
    eq,
    exists,
    gt,
    gte,
    ilike,
    inArray,
    isNull,
    isNotNull,
    like,
    lt,
    lte,
    ne,
    not,
    notBetween,
    notExists,
    notLike,
    notIlike,
    notInArray,
    or,
    sql
  };
}
function getOrderByOperators() {
  return {
    sql,
    asc,
    desc
  };
}
function extractTablesRelationalConfig(schema, configHelpers) {
  if (Object.keys(schema).length === 1 && "default" in schema && !is(schema["default"], Table)) {
    schema = schema["default"];
  }
  const tableNamesMap = {};
  const relationsBuffer = {};
  const tablesConfig = {};
  for (const [key, value] of Object.entries(schema)) {
    if (is(value, Table)) {
      const dbName = getTableUniqueName(value);
      const bufferedRelations = relationsBuffer[dbName];
      tableNamesMap[dbName] = key;
      tablesConfig[key] = {
        tsName: key,
        dbName: value[Table.Symbol.Name],
        schema: value[Table.Symbol.Schema],
        columns: value[Table.Symbol.Columns],
        relations: bufferedRelations?.relations ?? {},
        primaryKey: bufferedRelations?.primaryKey ?? []
      };
      for (const column of Object.values(
        value[Table.Symbol.Columns]
      )) {
        if (column.primary) {
          tablesConfig[key].primaryKey.push(column);
        }
      }
      const extraConfig = value[Table.Symbol.ExtraConfigBuilder]?.(value[Table.Symbol.ExtraConfigColumns]);
      if (extraConfig) {
        for (const configEntry of Object.values(extraConfig)) {
          if (is(configEntry, PrimaryKeyBuilder)) {
            tablesConfig[key].primaryKey.push(...configEntry.columns);
          }
        }
      }
    } else if (is(value, Relations)) {
      const dbName = getTableUniqueName(value.table);
      const tableName = tableNamesMap[dbName];
      const relations2 = value.config(
        configHelpers(value.table)
      );
      let primaryKey;
      for (const [relationName, relation] of Object.entries(relations2)) {
        if (tableName) {
          const tableConfig = tablesConfig[tableName];
          tableConfig.relations[relationName] = relation;
        } else {
          if (!(dbName in relationsBuffer)) {
            relationsBuffer[dbName] = {
              relations: {},
              primaryKey
            };
          }
          relationsBuffer[dbName].relations[relationName] = relation;
        }
      }
    }
  }
  return { tables: tablesConfig, tableNamesMap };
}
function createOne(sourceTable) {
  return function one(table, config) {
    return new One(
      sourceTable,
      table,
      config,
      config?.fields.reduce((res, f) => res && f.notNull, true) ?? false
    );
  };
}
function createMany(sourceTable) {
  return function many(referencedTable, config) {
    return new Many(sourceTable, referencedTable, config);
  };
}
function normalizeRelation(schema, tableNamesMap, relation) {
  if (is(relation, One) && relation.config) {
    return {
      fields: relation.config.fields,
      references: relation.config.references
    };
  }
  const referencedTableTsName = tableNamesMap[getTableUniqueName(relation.referencedTable)];
  if (!referencedTableTsName) {
    throw new Error(
      `Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const referencedTableConfig = schema[referencedTableTsName];
  if (!referencedTableConfig) {
    throw new Error(`Table "${referencedTableTsName}" not found in schema`);
  }
  const sourceTable = relation.sourceTable;
  const sourceTableTsName = tableNamesMap[getTableUniqueName(sourceTable)];
  if (!sourceTableTsName) {
    throw new Error(
      `Table "${sourceTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const reverseRelations = [];
  for (const referencedTableRelation of Object.values(
    referencedTableConfig.relations
  )) {
    if (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) {
      reverseRelations.push(referencedTableRelation);
    }
  }
  if (reverseRelations.length > 1) {
    throw relation.relationName ? new Error(
      `There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`
    ) : new Error(
      `There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`
    );
  }
  if (reverseRelations[0] && is(reverseRelations[0], One) && reverseRelations[0].config) {
    return {
      fields: reverseRelations[0].config.references,
      references: reverseRelations[0].config.fields
    };
  }
  throw new Error(
    `There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`
  );
}
function createTableRelationsHelpers(sourceTable) {
  return {
    one: createOne(sourceTable),
    many: createMany(sourceTable)
  };
}
function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
  const result = {};
  for (const [
    selectionItemIndex,
    selectionItem
  ] of buildQueryResultSelection.entries()) {
    if (selectionItem.isJson) {
      const relation = tableConfig.relations[selectionItem.tsKey];
      const rawSubRows = row[selectionItemIndex];
      const subRows = typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
      result[selectionItem.tsKey] = is(relation, One) ? subRows && mapRelationalRow(
        tablesConfig,
        tablesConfig[selectionItem.relationTableTsKey],
        subRows,
        selectionItem.selection,
        mapColumnValue
      ) : subRows.map(
        (subRow) => mapRelationalRow(
          tablesConfig,
          tablesConfig[selectionItem.relationTableTsKey],
          subRow,
          selectionItem.selection,
          mapColumnValue
        )
      );
    } else {
      const value = mapColumnValue(row[selectionItemIndex]);
      const field = selectionItem.field;
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
    }
  }
  return result;
}

class PgViewBase extends View {
  static [entityKind] = "PgViewBase";
}

class PgDialect {
  static [entityKind] = "PgDialect";
  /** @internal */
  casing;
  constructor(config) {
    this.casing = new CasingCache(config?.casing);
  }
  async migrate(migrations, session, config) {
    const migrationsTable = typeof config === "string" ? "__drizzle_migrations" : config.migrationsTable ?? "__drizzle_migrations";
    const migrationsSchema = typeof config === "string" ? "drizzle" : config.migrationsSchema ?? "drizzle";
    const migrationTableCreate = sql`
			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at bigint
			)
		`;
    await session.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(migrationsSchema)}`);
    await session.execute(migrationTableCreate);
    const dbMigrations = await session.all(
      sql`select id, hash, created_at from ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} order by created_at desc limit 1`
    );
    const lastDbMigration = dbMigrations[0];
    await session.transaction(async (tx) => {
      for await (const migration of migrations) {
        if (!lastDbMigration || Number(lastDbMigration.created_at) < migration.folderMillis) {
          for (const stmt of migration.sql) {
            await tx.execute(sql.raw(stmt));
          }
          await tx.execute(
            sql`insert into ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} ("hash", "created_at") values(${migration.hash}, ${migration.folderMillis})`
          );
        }
      }
    });
  }
  escapeName(name) {
    return `"${name}"`;
  }
  escapeParam(num) {
    return `$${num + 1}`;
  }
  escapeString(str) {
    return `'${str.replace(/'/g, "''")}'`;
  }
  buildWithCTE(queries) {
    if (!queries?.length) return void 0;
    const withSqlChunks = [sql`with `];
    for (const [i, w] of queries.entries()) {
      withSqlChunks.push(sql`${sql.identifier(w._.alias)} as (${w._.sql})`);
      if (i < queries.length - 1) {
        withSqlChunks.push(sql`, `);
      }
    }
    withSqlChunks.push(sql` `);
    return sql.join(withSqlChunks);
  }
  buildDeleteQuery({ table, where, returning, withList }) {
    const withSql = this.buildWithCTE(withList);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    return sql`${withSql}delete from ${table}${whereSql}${returningSql}`;
  }
  buildUpdateSet(table, set) {
    const tableColumns = table[Table.Symbol.Columns];
    const columnNames = Object.keys(tableColumns).filter(
      (colName) => set[colName] !== void 0 || tableColumns[colName]?.onUpdateFn !== void 0
    );
    const setSize = columnNames.length;
    return sql.join(columnNames.flatMap((colName, i) => {
      const col = tableColumns[colName];
      const value = set[colName] ?? sql.param(col.onUpdateFn(), col);
      const res = sql`${sql.identifier(this.casing.getColumnCasing(col))} = ${value}`;
      if (i < setSize - 1) {
        return [res, sql.raw(", ")];
      }
      return [res];
    }));
  }
  buildUpdateQuery({ table, set, where, returning, withList, from, joins }) {
    const withSql = this.buildWithCTE(withList);
    const tableName = table[PgTable.Symbol.Name];
    const tableSchema = table[PgTable.Symbol.Schema];
    const origTableName = table[PgTable.Symbol.OriginalName];
    const alias = tableName === origTableName ? void 0 : tableName;
    const tableSql = sql`${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`}`;
    const setSql = this.buildUpdateSet(table, set);
    const fromSql = from && sql.join([sql.raw(" from "), this.buildFromTable(from)]);
    const joinsSql = this.buildJoins(joins);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: !from })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    return sql`${withSql}update ${tableSql} set ${setSql}${fromSql}${joinsSql}${whereSql}${returningSql}`;
  }
  /**
   * Builds selection SQL with provided fields/expressions
   *
   * Examples:
   *
   * `select <selection> from`
   *
   * `insert ... returning <selection>`
   *
   * If `isSingleTable` is true, then columns won't be prefixed with table name
   */
  buildSelection(fields, { isSingleTable = false } = {}) {
    const columnsLen = fields.length;
    const chunks = fields.flatMap(({ field }, i) => {
      const chunk = [];
      if (is(field, SQL.Aliased) && field.isSelectionField) {
        chunk.push(sql.identifier(field.fieldAlias));
      } else if (is(field, SQL.Aliased) || is(field, SQL)) {
        const query = is(field, SQL.Aliased) ? field.sql : field;
        if (isSingleTable) {
          chunk.push(
            new SQL(
              query.queryChunks.map((c) => {
                if (is(c, PgColumn)) {
                  return sql.identifier(this.casing.getColumnCasing(c));
                }
                return c;
              })
            )
          );
        } else {
          chunk.push(query);
        }
        if (is(field, SQL.Aliased)) {
          chunk.push(sql` as ${sql.identifier(field.fieldAlias)}`);
        }
      } else if (is(field, Column)) {
        if (isSingleTable) {
          chunk.push(sql.identifier(this.casing.getColumnCasing(field)));
        } else {
          chunk.push(field);
        }
      }
      if (i < columnsLen - 1) {
        chunk.push(sql`, `);
      }
      return chunk;
    });
    return sql.join(chunks);
  }
  buildJoins(joins) {
    if (!joins || joins.length === 0) {
      return void 0;
    }
    const joinsArray = [];
    for (const [index, joinMeta] of joins.entries()) {
      if (index === 0) {
        joinsArray.push(sql` `);
      }
      const table = joinMeta.table;
      const lateralSql = joinMeta.lateral ? sql` lateral` : void 0;
      const onSql = joinMeta.on ? sql` on ${joinMeta.on}` : void 0;
      if (is(table, PgTable)) {
        const tableName = table[PgTable.Symbol.Name];
        const tableSchema = table[PgTable.Symbol.Schema];
        const origTableName = table[PgTable.Symbol.OriginalName];
        const alias = tableName === origTableName ? void 0 : joinMeta.alias;
        joinsArray.push(
          sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`}${onSql}`
        );
      } else if (is(table, View)) {
        const viewName = table[ViewBaseConfig].name;
        const viewSchema = table[ViewBaseConfig].schema;
        const origViewName = table[ViewBaseConfig].originalName;
        const alias = viewName === origViewName ? void 0 : joinMeta.alias;
        joinsArray.push(
          sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${viewSchema ? sql`${sql.identifier(viewSchema)}.` : void 0}${sql.identifier(origViewName)}${alias && sql` ${sql.identifier(alias)}`}${onSql}`
        );
      } else {
        joinsArray.push(
          sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${table}${onSql}`
        );
      }
      if (index < joins.length - 1) {
        joinsArray.push(sql` `);
      }
    }
    return sql.join(joinsArray);
  }
  buildFromTable(table) {
    if (is(table, Table) && table[Table.Symbol.IsAlias]) {
      let fullName = sql`${sql.identifier(table[Table.Symbol.OriginalName])}`;
      if (table[Table.Symbol.Schema]) {
        fullName = sql`${sql.identifier(table[Table.Symbol.Schema])}.${fullName}`;
      }
      return sql`${fullName} ${sql.identifier(table[Table.Symbol.Name])}`;
    }
    return table;
  }
  buildSelectQuery({
    withList,
    fields,
    fieldsFlat,
    where,
    having,
    table,
    joins,
    orderBy,
    groupBy,
    limit,
    offset,
    lockingClause,
    distinct,
    setOperators
  }) {
    const fieldsList = fieldsFlat ?? orderSelectedFields(fields);
    for (const f of fieldsList) {
      if (is(f.field, Column) && getTableName(f.field.table) !== (is(table, Subquery) ? table._.alias : is(table, PgViewBase) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : getTableName(table)) && !((table2) => joins?.some(
        ({ alias }) => alias === (table2[Table.Symbol.IsAlias] ? getTableName(table2) : table2[Table.Symbol.BaseName])
      ))(f.field.table)) {
        const tableName = getTableName(f.field.table);
        throw new Error(
          `Your "${f.path.join("->")}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`
        );
      }
    }
    const isSingleTable = !joins || joins.length === 0;
    const withSql = this.buildWithCTE(withList);
    let distinctSql;
    if (distinct) {
      distinctSql = distinct === true ? sql` distinct` : sql` distinct on (${sql.join(distinct.on, sql`, `)})`;
    }
    const selection = this.buildSelection(fieldsList, { isSingleTable });
    const tableSql = this.buildFromTable(table);
    const joinsSql = this.buildJoins(joins);
    const whereSql = where ? sql` where ${where}` : void 0;
    const havingSql = having ? sql` having ${having}` : void 0;
    let orderBySql;
    if (orderBy && orderBy.length > 0) {
      orderBySql = sql` order by ${sql.join(orderBy, sql`, `)}`;
    }
    let groupBySql;
    if (groupBy && groupBy.length > 0) {
      groupBySql = sql` group by ${sql.join(groupBy, sql`, `)}`;
    }
    const limitSql = typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    const lockingClauseSql = sql.empty();
    if (lockingClause) {
      const clauseSql = sql` for ${sql.raw(lockingClause.strength)}`;
      if (lockingClause.config.of) {
        clauseSql.append(
          sql` of ${sql.join(
            Array.isArray(lockingClause.config.of) ? lockingClause.config.of : [lockingClause.config.of],
            sql`, `
          )}`
        );
      }
      if (lockingClause.config.noWait) {
        clauseSql.append(sql` nowait`);
      } else if (lockingClause.config.skipLocked) {
        clauseSql.append(sql` skip locked`);
      }
      lockingClauseSql.append(clauseSql);
    }
    const finalQuery = sql`${withSql}select${distinctSql} ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}${lockingClauseSql}`;
    if (setOperators.length > 0) {
      return this.buildSetOperations(finalQuery, setOperators);
    }
    return finalQuery;
  }
  buildSetOperations(leftSelect, setOperators) {
    const [setOperator, ...rest] = setOperators;
    if (!setOperator) {
      throw new Error("Cannot pass undefined values to any set operator");
    }
    if (rest.length === 0) {
      return this.buildSetOperationQuery({ leftSelect, setOperator });
    }
    return this.buildSetOperations(
      this.buildSetOperationQuery({ leftSelect, setOperator }),
      rest
    );
  }
  buildSetOperationQuery({
    leftSelect,
    setOperator: { type, isAll, rightSelect, limit, orderBy, offset }
  }) {
    const leftChunk = sql`(${leftSelect.getSQL()}) `;
    const rightChunk = sql`(${rightSelect.getSQL()})`;
    let orderBySql;
    if (orderBy && orderBy.length > 0) {
      const orderByValues = [];
      for (const singleOrderBy of orderBy) {
        if (is(singleOrderBy, PgColumn)) {
          orderByValues.push(sql.identifier(singleOrderBy.name));
        } else if (is(singleOrderBy, SQL)) {
          for (let i = 0; i < singleOrderBy.queryChunks.length; i++) {
            const chunk = singleOrderBy.queryChunks[i];
            if (is(chunk, PgColumn)) {
              singleOrderBy.queryChunks[i] = sql.identifier(chunk.name);
            }
          }
          orderByValues.push(sql`${singleOrderBy}`);
        } else {
          orderByValues.push(sql`${singleOrderBy}`);
        }
      }
      orderBySql = sql` order by ${sql.join(orderByValues, sql`, `)} `;
    }
    const limitSql = typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
    const operatorChunk = sql.raw(`${type} ${isAll ? "all " : ""}`);
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    return sql`${leftChunk}${operatorChunk}${rightChunk}${orderBySql}${limitSql}${offsetSql}`;
  }
  buildInsertQuery({ table, values: valuesOrSelect, onConflict, returning, withList, select, overridingSystemValue_ }) {
    const valuesSqlList = [];
    const columns = table[Table.Symbol.Columns];
    const colEntries = Object.entries(columns).filter(([_, col]) => !col.shouldDisableInsert());
    const insertOrder = colEntries.map(
      ([, column]) => sql.identifier(this.casing.getColumnCasing(column))
    );
    if (select) {
      const select2 = valuesOrSelect;
      if (is(select2, SQL)) {
        valuesSqlList.push(select2);
      } else {
        valuesSqlList.push(select2.getSQL());
      }
    } else {
      const values = valuesOrSelect;
      valuesSqlList.push(sql.raw("values "));
      for (const [valueIndex, value] of values.entries()) {
        const valueList = [];
        for (const [fieldName, col] of colEntries) {
          const colValue = value[fieldName];
          if (colValue === void 0 || is(colValue, Param) && colValue.value === void 0) {
            if (col.defaultFn !== void 0) {
              const defaultFnResult = col.defaultFn();
              const defaultValue = is(defaultFnResult, SQL) ? defaultFnResult : sql.param(defaultFnResult, col);
              valueList.push(defaultValue);
            } else if (!col.default && col.onUpdateFn !== void 0) {
              const onUpdateFnResult = col.onUpdateFn();
              const newValue = is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col);
              valueList.push(newValue);
            } else {
              valueList.push(sql`default`);
            }
          } else {
            valueList.push(colValue);
          }
        }
        valuesSqlList.push(valueList);
        if (valueIndex < values.length - 1) {
          valuesSqlList.push(sql`, `);
        }
      }
    }
    const withSql = this.buildWithCTE(withList);
    const valuesSql = sql.join(valuesSqlList);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const onConflictSql = onConflict ? sql` on conflict ${onConflict}` : void 0;
    const overridingSql = overridingSystemValue_ === true ? sql`overriding system value ` : void 0;
    return sql`${withSql}insert into ${table} ${insertOrder} ${overridingSql}${valuesSql}${onConflictSql}${returningSql}`;
  }
  buildRefreshMaterializedViewQuery({ view, concurrently, withNoData }) {
    const concurrentlySql = concurrently ? sql` concurrently` : void 0;
    const withNoDataSql = withNoData ? sql` with no data` : void 0;
    return sql`refresh materialized view${concurrentlySql} ${view}${withNoDataSql}`;
  }
  prepareTyping(encoder) {
    if (is(encoder, PgJsonb) || is(encoder, PgJson)) {
      return "json";
    } else if (is(encoder, PgNumeric)) {
      return "decimal";
    } else if (is(encoder, PgTime)) {
      return "time";
    } else if (is(encoder, PgTimestamp) || is(encoder, PgTimestampString)) {
      return "timestamp";
    } else if (is(encoder, PgDate) || is(encoder, PgDateString)) {
      return "date";
    } else if (is(encoder, PgUUID)) {
      return "uuid";
    } else {
      return "none";
    }
  }
  sqlToQuery(sql2, invokeSource) {
    return sql2.toQuery({
      casing: this.casing,
      escapeName: this.escapeName,
      escapeParam: this.escapeParam,
      escapeString: this.escapeString,
      prepareTyping: this.prepareTyping,
      invokeSource
    });
  }
  // buildRelationalQueryWithPK({
  // 	fullSchema,
  // 	schema,
  // 	tableNamesMap,
  // 	table,
  // 	tableConfig,
  // 	queryConfig: config,
  // 	tableAlias,
  // 	isRoot = false,
  // 	joinOn,
  // }: {
  // 	fullSchema: Record<string, unknown>;
  // 	schema: TablesRelationalConfig;
  // 	tableNamesMap: Record<string, string>;
  // 	table: PgTable;
  // 	tableConfig: TableRelationalConfig;
  // 	queryConfig: true | DBQueryConfig<'many', true>;
  // 	tableAlias: string;
  // 	isRoot?: boolean;
  // 	joinOn?: SQL;
  // }): BuildRelationalQueryResult<PgTable, PgColumn> {
  // 	// For { "<relation>": true }, return a table with selection of all columns
  // 	if (config === true) {
  // 		const selectionEntries = Object.entries(tableConfig.columns);
  // 		const selection: BuildRelationalQueryResult<PgTable, PgColumn>['selection'] = selectionEntries.map((
  // 			[key, value],
  // 		) => ({
  // 			dbKey: value.name,
  // 			tsKey: key,
  // 			field: value as PgColumn,
  // 			relationTableTsKey: undefined,
  // 			isJson: false,
  // 			selection: [],
  // 		}));
  // 		return {
  // 			tableTsKey: tableConfig.tsName,
  // 			sql: table,
  // 			selection,
  // 		};
  // 	}
  // 	// let selection: BuildRelationalQueryResult<PgTable, PgColumn>['selection'] = [];
  // 	// let selectionForBuild = selection;
  // 	const aliasedColumns = Object.fromEntries(
  // 		Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)]),
  // 	);
  // 	const aliasedRelations = Object.fromEntries(
  // 		Object.entries(tableConfig.relations).map(([key, value]) => [key, aliasedRelation(value, tableAlias)]),
  // 	);
  // 	const aliasedFields = Object.assign({}, aliasedColumns, aliasedRelations);
  // 	let where, hasUserDefinedWhere;
  // 	if (config.where) {
  // 		const whereSql = typeof config.where === 'function' ? config.where(aliasedFields, operators) : config.where;
  // 		where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
  // 		hasUserDefinedWhere = !!where;
  // 	}
  // 	where = and(joinOn, where);
  // 	// const fieldsSelection: { tsKey: string; value: PgColumn | SQL.Aliased; isExtra?: boolean }[] = [];
  // 	let joins: Join[] = [];
  // 	let selectedColumns: string[] = [];
  // 	// Figure out which columns to select
  // 	if (config.columns) {
  // 		let isIncludeMode = false;
  // 		for (const [field, value] of Object.entries(config.columns)) {
  // 			if (value === undefined) {
  // 				continue;
  // 			}
  // 			if (field in tableConfig.columns) {
  // 				if (!isIncludeMode && value === true) {
  // 					isIncludeMode = true;
  // 				}
  // 				selectedColumns.push(field);
  // 			}
  // 		}
  // 		if (selectedColumns.length > 0) {
  // 			selectedColumns = isIncludeMode
  // 				? selectedColumns.filter((c) => config.columns?.[c] === true)
  // 				: Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
  // 		}
  // 	} else {
  // 		// Select all columns if selection is not specified
  // 		selectedColumns = Object.keys(tableConfig.columns);
  // 	}
  // 	// for (const field of selectedColumns) {
  // 	// 	const column = tableConfig.columns[field]! as PgColumn;
  // 	// 	fieldsSelection.push({ tsKey: field, value: column });
  // 	// }
  // 	let initiallySelectedRelations: {
  // 		tsKey: string;
  // 		queryConfig: true | DBQueryConfig<'many', false>;
  // 		relation: Relation;
  // 	}[] = [];
  // 	// let selectedRelations: BuildRelationalQueryResult<PgTable, PgColumn>['selection'] = [];
  // 	// Figure out which relations to select
  // 	if (config.with) {
  // 		initiallySelectedRelations = Object.entries(config.with)
  // 			.filter((entry): entry is [typeof entry[0], NonNullable<typeof entry[1]>] => !!entry[1])
  // 			.map(([tsKey, queryConfig]) => ({ tsKey, queryConfig, relation: tableConfig.relations[tsKey]! }));
  // 	}
  // 	const manyRelations = initiallySelectedRelations.filter((r) =>
  // 		is(r.relation, Many)
  // 		&& (schema[tableNamesMap[r.relation.referencedTable[Table.Symbol.Name]]!]?.primaryKey.length ?? 0) > 0
  // 	);
  // 	// If this is the last Many relation (or there are no Many relations), we are on the innermost subquery level
  // 	const isInnermostQuery = manyRelations.length < 2;
  // 	const selectedExtras: {
  // 		tsKey: string;
  // 		value: SQL.Aliased;
  // 	}[] = [];
  // 	// Figure out which extras to select
  // 	if (isInnermostQuery && config.extras) {
  // 		const extras = typeof config.extras === 'function'
  // 			? config.extras(aliasedFields, { sql })
  // 			: config.extras;
  // 		for (const [tsKey, value] of Object.entries(extras)) {
  // 			selectedExtras.push({
  // 				tsKey,
  // 				value: mapColumnsInAliasedSQLToAlias(value, tableAlias),
  // 			});
  // 		}
  // 	}
  // 	// Transform `fieldsSelection` into `selection`
  // 	// `fieldsSelection` shouldn't be used after this point
  // 	// for (const { tsKey, value, isExtra } of fieldsSelection) {
  // 	// 	selection.push({
  // 	// 		dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey]!.name,
  // 	// 		tsKey,
  // 	// 		field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
  // 	// 		relationTableTsKey: undefined,
  // 	// 		isJson: false,
  // 	// 		isExtra,
  // 	// 		selection: [],
  // 	// 	});
  // 	// }
  // 	let orderByOrig = typeof config.orderBy === 'function'
  // 		? config.orderBy(aliasedFields, orderByOperators)
  // 		: config.orderBy ?? [];
  // 	if (!Array.isArray(orderByOrig)) {
  // 		orderByOrig = [orderByOrig];
  // 	}
  // 	const orderBy = orderByOrig.map((orderByValue) => {
  // 		if (is(orderByValue, Column)) {
  // 			return aliasedTableColumn(orderByValue, tableAlias) as PgColumn;
  // 		}
  // 		return mapColumnsInSQLToAlias(orderByValue, tableAlias);
  // 	});
  // 	const limit = isInnermostQuery ? config.limit : undefined;
  // 	const offset = isInnermostQuery ? config.offset : undefined;
  // 	// For non-root queries without additional config except columns, return a table with selection
  // 	if (
  // 		!isRoot
  // 		&& initiallySelectedRelations.length === 0
  // 		&& selectedExtras.length === 0
  // 		&& !where
  // 		&& orderBy.length === 0
  // 		&& limit === undefined
  // 		&& offset === undefined
  // 	) {
  // 		return {
  // 			tableTsKey: tableConfig.tsName,
  // 			sql: table,
  // 			selection: selectedColumns.map((key) => ({
  // 				dbKey: tableConfig.columns[key]!.name,
  // 				tsKey: key,
  // 				field: tableConfig.columns[key] as PgColumn,
  // 				relationTableTsKey: undefined,
  // 				isJson: false,
  // 				selection: [],
  // 			})),
  // 		};
  // 	}
  // 	const selectedRelationsWithoutPK:
  // 	// Process all relations without primary keys, because they need to be joined differently and will all be on the same query level
  // 	for (
  // 		const {
  // 			tsKey: selectedRelationTsKey,
  // 			queryConfig: selectedRelationConfigValue,
  // 			relation,
  // 		} of initiallySelectedRelations
  // 	) {
  // 		const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
  // 		const relationTableName = relation.referencedTable[Table.Symbol.Name];
  // 		const relationTableTsName = tableNamesMap[relationTableName]!;
  // 		const relationTable = schema[relationTableTsName]!;
  // 		if (relationTable.primaryKey.length > 0) {
  // 			continue;
  // 		}
  // 		const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
  // 		const joinOn = and(
  // 			...normalizedRelation.fields.map((field, i) =>
  // 				eq(
  // 					aliasedTableColumn(normalizedRelation.references[i]!, relationTableAlias),
  // 					aliasedTableColumn(field, tableAlias),
  // 				)
  // 			),
  // 		);
  // 		const builtRelation = this.buildRelationalQueryWithoutPK({
  // 			fullSchema,
  // 			schema,
  // 			tableNamesMap,
  // 			table: fullSchema[relationTableTsName] as PgTable,
  // 			tableConfig: schema[relationTableTsName]!,
  // 			queryConfig: selectedRelationConfigValue,
  // 			tableAlias: relationTableAlias,
  // 			joinOn,
  // 			nestedQueryRelation: relation,
  // 		});
  // 		const field = sql`${sql.identifier(relationTableAlias)}.${sql.identifier('data')}`.as(selectedRelationTsKey);
  // 		joins.push({
  // 			on: sql`true`,
  // 			table: new Subquery(builtRelation.sql as SQL, {}, relationTableAlias),
  // 			alias: relationTableAlias,
  // 			joinType: 'left',
  // 			lateral: true,
  // 		});
  // 		selectedRelations.push({
  // 			dbKey: selectedRelationTsKey,
  // 			tsKey: selectedRelationTsKey,
  // 			field,
  // 			relationTableTsKey: relationTableTsName,
  // 			isJson: true,
  // 			selection: builtRelation.selection,
  // 		});
  // 	}
  // 	const oneRelations = initiallySelectedRelations.filter((r): r is typeof r & { relation: One } =>
  // 		is(r.relation, One)
  // 	);
  // 	// Process all One relations with PKs, because they can all be joined on the same level
  // 	for (
  // 		const {
  // 			tsKey: selectedRelationTsKey,
  // 			queryConfig: selectedRelationConfigValue,
  // 			relation,
  // 		} of oneRelations
  // 	) {
  // 		const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
  // 		const relationTableName = relation.referencedTable[Table.Symbol.Name];
  // 		const relationTableTsName = tableNamesMap[relationTableName]!;
  // 		const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
  // 		const relationTable = schema[relationTableTsName]!;
  // 		if (relationTable.primaryKey.length === 0) {
  // 			continue;
  // 		}
  // 		const joinOn = and(
  // 			...normalizedRelation.fields.map((field, i) =>
  // 				eq(
  // 					aliasedTableColumn(normalizedRelation.references[i]!, relationTableAlias),
  // 					aliasedTableColumn(field, tableAlias),
  // 				)
  // 			),
  // 		);
  // 		const builtRelation = this.buildRelationalQueryWithPK({
  // 			fullSchema,
  // 			schema,
  // 			tableNamesMap,
  // 			table: fullSchema[relationTableTsName] as PgTable,
  // 			tableConfig: schema[relationTableTsName]!,
  // 			queryConfig: selectedRelationConfigValue,
  // 			tableAlias: relationTableAlias,
  // 			joinOn,
  // 		});
  // 		const field = sql`case when ${sql.identifier(relationTableAlias)} is null then null else json_build_array(${
  // 			sql.join(
  // 				builtRelation.selection.map(({ field }) =>
  // 					is(field, SQL.Aliased)
  // 						? sql`${sql.identifier(relationTableAlias)}.${sql.identifier(field.fieldAlias)}`
  // 						: is(field, Column)
  // 						? aliasedTableColumn(field, relationTableAlias)
  // 						: field
  // 				),
  // 				sql`, `,
  // 			)
  // 		}) end`.as(selectedRelationTsKey);
  // 		const isLateralJoin = is(builtRelation.sql, SQL);
  // 		joins.push({
  // 			on: isLateralJoin ? sql`true` : joinOn,
  // 			table: is(builtRelation.sql, SQL)
  // 				? new Subquery(builtRelation.sql, {}, relationTableAlias)
  // 				: aliasedTable(builtRelation.sql, relationTableAlias),
  // 			alias: relationTableAlias,
  // 			joinType: 'left',
  // 			lateral: is(builtRelation.sql, SQL),
  // 		});
  // 		selectedRelations.push({
  // 			dbKey: selectedRelationTsKey,
  // 			tsKey: selectedRelationTsKey,
  // 			field,
  // 			relationTableTsKey: relationTableTsName,
  // 			isJson: true,
  // 			selection: builtRelation.selection,
  // 		});
  // 	}
  // 	let distinct: PgSelectConfig['distinct'];
  // 	let tableFrom: PgTable | Subquery = table;
  // 	// Process first Many relation - each one requires a nested subquery
  // 	const manyRelation = manyRelations[0];
  // 	if (manyRelation) {
  // 		const {
  // 			tsKey: selectedRelationTsKey,
  // 			queryConfig: selectedRelationQueryConfig,
  // 			relation,
  // 		} = manyRelation;
  // 		distinct = {
  // 			on: tableConfig.primaryKey.map((c) => aliasedTableColumn(c as PgColumn, tableAlias)),
  // 		};
  // 		const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
  // 		const relationTableName = relation.referencedTable[Table.Symbol.Name];
  // 		const relationTableTsName = tableNamesMap[relationTableName]!;
  // 		const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
  // 		const joinOn = and(
  // 			...normalizedRelation.fields.map((field, i) =>
  // 				eq(
  // 					aliasedTableColumn(normalizedRelation.references[i]!, relationTableAlias),
  // 					aliasedTableColumn(field, tableAlias),
  // 				)
  // 			),
  // 		);
  // 		const builtRelationJoin = this.buildRelationalQueryWithPK({
  // 			fullSchema,
  // 			schema,
  // 			tableNamesMap,
  // 			table: fullSchema[relationTableTsName] as PgTable,
  // 			tableConfig: schema[relationTableTsName]!,
  // 			queryConfig: selectedRelationQueryConfig,
  // 			tableAlias: relationTableAlias,
  // 			joinOn,
  // 		});
  // 		const builtRelationSelectionField = sql`case when ${
  // 			sql.identifier(relationTableAlias)
  // 		} is null then '[]' else json_agg(json_build_array(${
  // 			sql.join(
  // 				builtRelationJoin.selection.map(({ field }) =>
  // 					is(field, SQL.Aliased)
  // 						? sql`${sql.identifier(relationTableAlias)}.${sql.identifier(field.fieldAlias)}`
  // 						: is(field, Column)
  // 						? aliasedTableColumn(field, relationTableAlias)
  // 						: field
  // 				),
  // 				sql`, `,
  // 			)
  // 		})) over (partition by ${sql.join(distinct.on, sql`, `)}) end`.as(selectedRelationTsKey);
  // 		const isLateralJoin = is(builtRelationJoin.sql, SQL);
  // 		joins.push({
  // 			on: isLateralJoin ? sql`true` : joinOn,
  // 			table: isLateralJoin
  // 				? new Subquery(builtRelationJoin.sql as SQL, {}, relationTableAlias)
  // 				: aliasedTable(builtRelationJoin.sql as PgTable, relationTableAlias),
  // 			alias: relationTableAlias,
  // 			joinType: 'left',
  // 			lateral: isLateralJoin,
  // 		});
  // 		// Build the "from" subquery with the remaining Many relations
  // 		const builtTableFrom = this.buildRelationalQueryWithPK({
  // 			fullSchema,
  // 			schema,
  // 			tableNamesMap,
  // 			table,
  // 			tableConfig,
  // 			queryConfig: {
  // 				...config,
  // 				where: undefined,
  // 				orderBy: undefined,
  // 				limit: undefined,
  // 				offset: undefined,
  // 				with: manyRelations.slice(1).reduce<NonNullable<typeof config['with']>>(
  // 					(result, { tsKey, queryConfig: configValue }) => {
  // 						result[tsKey] = configValue;
  // 						return result;
  // 					},
  // 					{},
  // 				),
  // 			},
  // 			tableAlias,
  // 		});
  // 		selectedRelations.push({
  // 			dbKey: selectedRelationTsKey,
  // 			tsKey: selectedRelationTsKey,
  // 			field: builtRelationSelectionField,
  // 			relationTableTsKey: relationTableTsName,
  // 			isJson: true,
  // 			selection: builtRelationJoin.selection,
  // 		});
  // 		// selection = builtTableFrom.selection.map((item) =>
  // 		// 	is(item.field, SQL.Aliased)
  // 		// 		? { ...item, field: sql`${sql.identifier(tableAlias)}.${sql.identifier(item.field.fieldAlias)}` }
  // 		// 		: item
  // 		// );
  // 		// selectionForBuild = [{
  // 		// 	dbKey: '*',
  // 		// 	tsKey: '*',
  // 		// 	field: sql`${sql.identifier(tableAlias)}.*`,
  // 		// 	selection: [],
  // 		// 	isJson: false,
  // 		// 	relationTableTsKey: undefined,
  // 		// }];
  // 		// const newSelectionItem: (typeof selection)[number] = {
  // 		// 	dbKey: selectedRelationTsKey,
  // 		// 	tsKey: selectedRelationTsKey,
  // 		// 	field,
  // 		// 	relationTableTsKey: relationTableTsName,
  // 		// 	isJson: true,
  // 		// 	selection: builtRelationJoin.selection,
  // 		// };
  // 		// selection.push(newSelectionItem);
  // 		// selectionForBuild.push(newSelectionItem);
  // 		tableFrom = is(builtTableFrom.sql, PgTable)
  // 			? builtTableFrom.sql
  // 			: new Subquery(builtTableFrom.sql, {}, tableAlias);
  // 	}
  // 	if (selectedColumns.length === 0 && selectedRelations.length === 0 && selectedExtras.length === 0) {
  // 		throw new DrizzleError(`No fields selected for table "${tableConfig.tsName}" ("${tableAlias}")`);
  // 	}
  // 	let selection: BuildRelationalQueryResult<PgTable, PgColumn>['selection'];
  // 	function prepareSelectedColumns() {
  // 		return selectedColumns.map((key) => ({
  // 			dbKey: tableConfig.columns[key]!.name,
  // 			tsKey: key,
  // 			field: tableConfig.columns[key] as PgColumn,
  // 			relationTableTsKey: undefined,
  // 			isJson: false,
  // 			selection: [],
  // 		}));
  // 	}
  // 	function prepareSelectedExtras() {
  // 		return selectedExtras.map((item) => ({
  // 			dbKey: item.value.fieldAlias,
  // 			tsKey: item.tsKey,
  // 			field: item.value,
  // 			relationTableTsKey: undefined,
  // 			isJson: false,
  // 			selection: [],
  // 		}));
  // 	}
  // 	if (isRoot) {
  // 		selection = [
  // 			...prepareSelectedColumns(),
  // 			...prepareSelectedExtras(),
  // 		];
  // 	}
  // 	if (hasUserDefinedWhere || orderBy.length > 0) {
  // 		tableFrom = new Subquery(
  // 			this.buildSelectQuery({
  // 				table: is(tableFrom, PgTable) ? aliasedTable(tableFrom, tableAlias) : tableFrom,
  // 				fields: {},
  // 				fieldsFlat: selectionForBuild.map(({ field }) => ({
  // 					path: [],
  // 					field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field,
  // 				})),
  // 				joins,
  // 				distinct,
  // 			}),
  // 			{},
  // 			tableAlias,
  // 		);
  // 		selectionForBuild = selection.map((item) =>
  // 			is(item.field, SQL.Aliased)
  // 				? { ...item, field: sql`${sql.identifier(tableAlias)}.${sql.identifier(item.field.fieldAlias)}` }
  // 				: item
  // 		);
  // 		joins = [];
  // 		distinct = undefined;
  // 	}
  // 	const result = this.buildSelectQuery({
  // 		table: is(tableFrom, PgTable) ? aliasedTable(tableFrom, tableAlias) : tableFrom,
  // 		fields: {},
  // 		fieldsFlat: selectionForBuild.map(({ field }) => ({
  // 			path: [],
  // 			field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field,
  // 		})),
  // 		where,
  // 		limit,
  // 		offset,
  // 		joins,
  // 		orderBy,
  // 		distinct,
  // 	});
  // 	return {
  // 		tableTsKey: tableConfig.tsName,
  // 		sql: result,
  // 		selection,
  // 	};
  // }
  buildRelationalQueryWithoutPK({
    fullSchema,
    schema,
    tableNamesMap,
    table,
    tableConfig,
    queryConfig: config,
    tableAlias,
    nestedQueryRelation,
    joinOn
  }) {
    let selection = [];
    let limit, offset, orderBy = [], where;
    const joins = [];
    if (config === true) {
      const selectionEntries = Object.entries(tableConfig.columns);
      selection = selectionEntries.map(([key, value]) => ({
        dbKey: value.name,
        tsKey: key,
        field: aliasedTableColumn(value, tableAlias),
        relationTableTsKey: void 0,
        isJson: false,
        selection: []
      }));
    } else {
      const aliasedColumns = Object.fromEntries(
        Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)])
      );
      if (config.where) {
        const whereSql = typeof config.where === "function" ? config.where(aliasedColumns, getOperators()) : config.where;
        where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
      }
      const fieldsSelection = [];
      let selectedColumns = [];
      if (config.columns) {
        let isIncludeMode = false;
        for (const [field, value] of Object.entries(config.columns)) {
          if (value === void 0) {
            continue;
          }
          if (field in tableConfig.columns) {
            if (!isIncludeMode && value === true) {
              isIncludeMode = true;
            }
            selectedColumns.push(field);
          }
        }
        if (selectedColumns.length > 0) {
          selectedColumns = isIncludeMode ? selectedColumns.filter((c) => config.columns?.[c] === true) : Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
        }
      } else {
        selectedColumns = Object.keys(tableConfig.columns);
      }
      for (const field of selectedColumns) {
        const column = tableConfig.columns[field];
        fieldsSelection.push({ tsKey: field, value: column });
      }
      let selectedRelations = [];
      if (config.with) {
        selectedRelations = Object.entries(config.with).filter((entry) => !!entry[1]).map(([tsKey, queryConfig]) => ({ tsKey, queryConfig, relation: tableConfig.relations[tsKey] }));
      }
      let extras;
      if (config.extras) {
        extras = typeof config.extras === "function" ? config.extras(aliasedColumns, { sql }) : config.extras;
        for (const [tsKey, value] of Object.entries(extras)) {
          fieldsSelection.push({
            tsKey,
            value: mapColumnsInAliasedSQLToAlias(value, tableAlias)
          });
        }
      }
      for (const { tsKey, value } of fieldsSelection) {
        selection.push({
          dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
          tsKey,
          field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
          relationTableTsKey: void 0,
          isJson: false,
          selection: []
        });
      }
      let orderByOrig = typeof config.orderBy === "function" ? config.orderBy(aliasedColumns, getOrderByOperators()) : config.orderBy ?? [];
      if (!Array.isArray(orderByOrig)) {
        orderByOrig = [orderByOrig];
      }
      orderBy = orderByOrig.map((orderByValue) => {
        if (is(orderByValue, Column)) {
          return aliasedTableColumn(orderByValue, tableAlias);
        }
        return mapColumnsInSQLToAlias(orderByValue, tableAlias);
      });
      limit = config.limit;
      offset = config.offset;
      for (const {
        tsKey: selectedRelationTsKey,
        queryConfig: selectedRelationConfigValue,
        relation
      } of selectedRelations) {
        const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
        const relationTableName = getTableUniqueName(relation.referencedTable);
        const relationTableTsName = tableNamesMap[relationTableName];
        const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
        const joinOn2 = and(
          ...normalizedRelation.fields.map(
            (field2, i) => eq(
              aliasedTableColumn(normalizedRelation.references[i], relationTableAlias),
              aliasedTableColumn(field2, tableAlias)
            )
          )
        );
        const builtRelation = this.buildRelationalQueryWithoutPK({
          fullSchema,
          schema,
          tableNamesMap,
          table: fullSchema[relationTableTsName],
          tableConfig: schema[relationTableTsName],
          queryConfig: is(relation, One) ? selectedRelationConfigValue === true ? { limit: 1 } : { ...selectedRelationConfigValue, limit: 1 } : selectedRelationConfigValue,
          tableAlias: relationTableAlias,
          joinOn: joinOn2,
          nestedQueryRelation: relation
        });
        const field = sql`${sql.identifier(relationTableAlias)}.${sql.identifier("data")}`.as(selectedRelationTsKey);
        joins.push({
          on: sql`true`,
          table: new Subquery(builtRelation.sql, {}, relationTableAlias),
          alias: relationTableAlias,
          joinType: "left",
          lateral: true
        });
        selection.push({
          dbKey: selectedRelationTsKey,
          tsKey: selectedRelationTsKey,
          field,
          relationTableTsKey: relationTableTsName,
          isJson: true,
          selection: builtRelation.selection
        });
      }
    }
    if (selection.length === 0) {
      throw new DrizzleError({ message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}")` });
    }
    let result;
    where = and(joinOn, where);
    if (nestedQueryRelation) {
      let field = sql`json_build_array(${sql.join(
        selection.map(
          ({ field: field2, tsKey, isJson }) => isJson ? sql`${sql.identifier(`${tableAlias}_${tsKey}`)}.${sql.identifier("data")}` : is(field2, SQL.Aliased) ? field2.sql : field2
        ),
        sql`, `
      )})`;
      if (is(nestedQueryRelation, Many)) {
        field = sql`coalesce(json_agg(${field}${orderBy.length > 0 ? sql` order by ${sql.join(orderBy, sql`, `)}` : void 0}), '[]'::json)`;
      }
      const nestedSelection = [{
        dbKey: "data",
        tsKey: "data",
        field: field.as("data"),
        isJson: true,
        relationTableTsKey: tableConfig.tsName,
        selection
      }];
      const needsSubquery = limit !== void 0 || offset !== void 0 || orderBy.length > 0;
      if (needsSubquery) {
        result = this.buildSelectQuery({
          table: aliasedTable(table, tableAlias),
          fields: {},
          fieldsFlat: [{
            path: [],
            field: sql.raw("*")
          }],
          where,
          limit,
          offset,
          orderBy,
          setOperators: []
        });
        where = void 0;
        limit = void 0;
        offset = void 0;
        orderBy = [];
      } else {
        result = aliasedTable(table, tableAlias);
      }
      result = this.buildSelectQuery({
        table: is(result, PgTable) ? result : new Subquery(result, {}, tableAlias),
        fields: {},
        fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
          path: [],
          field: is(field2, Column) ? aliasedTableColumn(field2, tableAlias) : field2
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    } else {
      result = this.buildSelectQuery({
        table: aliasedTable(table, tableAlias),
        fields: {},
        fieldsFlat: selection.map(({ field }) => ({
          path: [],
          field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    }
    return {
      tableTsKey: tableConfig.tsName,
      sql: result,
      selection
    };
  }
}

class TypedQueryBuilder {
  static [entityKind] = "TypedQueryBuilder";
  /** @internal */
  getSelectedFields() {
    return this._.selectedFields;
  }
}

class PgSelectBuilder {
  static [entityKind] = "PgSelectBuilder";
  fields;
  session;
  dialect;
  withList = [];
  distinct;
  constructor(config) {
    this.fields = config.fields;
    this.session = config.session;
    this.dialect = config.dialect;
    if (config.withList) {
      this.withList = config.withList;
    }
    this.distinct = config.distinct;
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  /**
   * Specify the table, subquery, or other target that you're
   * building a select query against.
   *
   * {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-FROM | Postgres from documentation}
   */
  from(source) {
    const isPartialSelect = !!this.fields;
    const src = source;
    let fields;
    if (this.fields) {
      fields = this.fields;
    } else if (is(src, Subquery)) {
      fields = Object.fromEntries(
        Object.keys(src._.selectedFields).map((key) => [key, src[key]])
      );
    } else if (is(src, PgViewBase)) {
      fields = src[ViewBaseConfig].selectedFields;
    } else if (is(src, SQL)) {
      fields = {};
    } else {
      fields = getTableColumns(src);
    }
    return new PgSelectBase({
      table: src,
      fields,
      isPartialSelect,
      session: this.session,
      dialect: this.dialect,
      withList: this.withList,
      distinct: this.distinct
    }).setToken(this.authToken);
  }
}
class PgSelectQueryBuilderBase extends TypedQueryBuilder {
  static [entityKind] = "PgSelectQueryBuilder";
  _;
  config;
  joinsNotNullableMap;
  tableName;
  isPartialSelect;
  session;
  dialect;
  cacheConfig = void 0;
  usedTables = /* @__PURE__ */ new Set();
  constructor({ table, fields, isPartialSelect, session, dialect, withList, distinct }) {
    super();
    this.config = {
      withList,
      table,
      fields: { ...fields },
      distinct,
      setOperators: []
    };
    this.isPartialSelect = isPartialSelect;
    this.session = session;
    this.dialect = dialect;
    this._ = {
      selectedFields: fields,
      config: this.config
    };
    this.tableName = getTableLikeName(table);
    this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
    for (const item of extractUsedTable(table)) this.usedTables.add(item);
  }
  /** @internal */
  getUsedTables() {
    return [...this.usedTables];
  }
  createJoin(joinType, lateral) {
    return (table, on) => {
      const baseTableName = this.tableName;
      const tableName = getTableLikeName(table);
      for (const item of extractUsedTable(table)) this.usedTables.add(item);
      if (typeof tableName === "string" && this.config.joins?.some((join) => join.alias === tableName)) {
        throw new Error(`Alias "${tableName}" is already used in this query`);
      }
      if (!this.isPartialSelect) {
        if (Object.keys(this.joinsNotNullableMap).length === 1 && typeof baseTableName === "string") {
          this.config.fields = {
            [baseTableName]: this.config.fields
          };
        }
        if (typeof tableName === "string" && !is(table, SQL)) {
          const selection = is(table, Subquery) ? table._.selectedFields : is(table, View) ? table[ViewBaseConfig].selectedFields : table[Table.Symbol.Columns];
          this.config.fields[tableName] = selection;
        }
      }
      if (typeof on === "function") {
        on = on(
          new Proxy(
            this.config.fields,
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          )
        );
      }
      if (!this.config.joins) {
        this.config.joins = [];
      }
      this.config.joins.push({ on, table, joinType, alias: tableName, lateral });
      if (typeof tableName === "string") {
        switch (joinType) {
          case "left": {
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
          case "right": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "cross":
          case "inner": {
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "full": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
        }
      }
      return this;
    };
  }
  /**
   * Executes a `left join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#left-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet | null; }[] = await db.select()
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number | null; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  leftJoin = this.createJoin("left", false);
  /**
   * Executes a `left join lateral` operation by adding subquery to the current query.
   *
   * A `lateral` join allows the right-hand expression to refer to columns from the left-hand side.
   *
   * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#left-join-lateral}
   *
   * @param table the subquery to join.
   * @param on the `on` clause.
   */
  leftJoinLateral = this.createJoin("left", true);
  /**
   * Executes a `right join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the joined table with the corresponding row from the main table, if a match is found. If no matching row exists, it sets all columns of the main table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#right-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User | null; pets: Pet; }[] = await db.select()
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number | null; petId: number; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  rightJoin = this.createJoin("right", false);
  /**
   * Executes an `inner join` operation, creating a new table by combining rows from two tables that have matching values.
   *
   * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  innerJoin = this.createJoin("inner", false);
  /**
   * Executes an `inner join lateral` operation, creating a new table by combining rows from two queries that have matching values.
   *
   * A `lateral` join allows the right-hand expression to refer to columns from the left-hand side.
   *
   * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join-lateral}
   *
   * @param table the subquery to join.
   * @param on the `on` clause.
   */
  innerJoinLateral = this.createJoin("inner", true);
  /**
   * Executes a `full join` operation by combining rows from two tables into a new table.
   *
   * Calling this method retrieves all rows from both main and joined tables, merging rows with matching values and filling in `null` for non-matching columns.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#full-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User | null; pets: Pet | null; }[] = await db.select()
   *   .from(users)
   *   .fullJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number | null; petId: number | null; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .fullJoin(pets, eq(users.id, pets.ownerId))
   * ```
   */
  fullJoin = this.createJoin("full", false);
  /**
   * Executes a `cross join` operation by combining rows from two tables into a new table.
   *
   * Calling this method retrieves all rows from both main and joined tables, merging all rows from each table.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#cross-join}
   *
   * @param table the table to join.
   *
   * @example
   *
   * ```ts
   * // Select all users, each user with every pet
   * const usersWithPets: { user: User; pets: Pet; }[] = await db.select()
   *   .from(users)
   *   .crossJoin(pets)
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number; }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .crossJoin(pets)
   * ```
   */
  crossJoin = this.createJoin("cross", false);
  /**
   * Executes a `cross join lateral` operation by combining rows from two queries into a new table.
   *
   * A `lateral` join allows the right-hand expression to refer to columns from the left-hand side.
   *
   * Calling this method retrieves all rows from both main and joined queries, merging all rows from each query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#cross-join-lateral}
   *
   * @param table the query to join.
   */
  crossJoinLateral = this.createJoin("cross", true);
  createSetOperator(type, isAll) {
    return (rightSelection) => {
      const rightSelect = typeof rightSelection === "function" ? rightSelection(getPgSetOperators()) : rightSelection;
      if (!haveSameKeys(this.getSelectedFields(), rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
      this.config.setOperators.push({ type, isAll, rightSelect });
      return this;
    };
  }
  /**
   * Adds `union` set operator to the query.
   *
   * Calling this method will combine the result sets of the `select` statements and remove any duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union}
   *
   * @example
   *
   * ```ts
   * // Select all unique names from customers and users tables
   * await db.select({ name: users.name })
   *   .from(users)
   *   .union(
   *     db.select({ name: customers.name }).from(customers)
   *   );
   * // or
   * import { union } from 'drizzle-orm/pg-core'
   *
   * await union(
   *   db.select({ name: users.name }).from(users),
   *   db.select({ name: customers.name }).from(customers)
   * );
   * ```
   */
  union = this.createSetOperator("union", false);
  /**
   * Adds `union all` set operator to the query.
   *
   * Calling this method will combine the result-set of the `select` statements and keep all duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union-all}
   *
   * @example
   *
   * ```ts
   * // Select all transaction ids from both online and in-store sales
   * await db.select({ transaction: onlineSales.transactionId })
   *   .from(onlineSales)
   *   .unionAll(
   *     db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   *   );
   * // or
   * import { unionAll } from 'drizzle-orm/pg-core'
   *
   * await unionAll(
   *   db.select({ transaction: onlineSales.transactionId }).from(onlineSales),
   *   db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   * );
   * ```
   */
  unionAll = this.createSetOperator("union", true);
  /**
   * Adds `intersect` set operator to the query.
   *
   * Calling this method will retain only the rows that are present in both result sets and eliminate duplicates.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect}
   *
   * @example
   *
   * ```ts
   * // Select course names that are offered in both departments A and B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .intersect(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { intersect } from 'drizzle-orm/pg-core'
   *
   * await intersect(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  intersect = this.createSetOperator("intersect", false);
  /**
   * Adds `intersect all` set operator to the query.
   *
   * Calling this method will retain only the rows that are present in both result sets including all duplicates.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect-all}
   *
   * @example
   *
   * ```ts
   * // Select all products and quantities that are ordered by both regular and VIP customers
   * await db.select({
   *   productId: regularCustomerOrders.productId,
   *   quantityOrdered: regularCustomerOrders.quantityOrdered
   * })
   * .from(regularCustomerOrders)
   * .intersectAll(
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * // or
   * import { intersectAll } from 'drizzle-orm/pg-core'
   *
   * await intersectAll(
   *   db.select({
   *     productId: regularCustomerOrders.productId,
   *     quantityOrdered: regularCustomerOrders.quantityOrdered
   *   })
   *   .from(regularCustomerOrders),
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * ```
   */
  intersectAll = this.createSetOperator("intersect", true);
  /**
   * Adds `except` set operator to the query.
   *
   * Calling this method will retrieve all unique rows from the left query, except for the rows that are present in the result set of the right query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#except}
   *
   * @example
   *
   * ```ts
   * // Select all courses offered in department A but not in department B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .except(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { except } from 'drizzle-orm/pg-core'
   *
   * await except(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  except = this.createSetOperator("except", false);
  /**
   * Adds `except all` set operator to the query.
   *
   * Calling this method will retrieve all rows from the left query, except for the rows that are present in the result set of the right query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#except-all}
   *
   * @example
   *
   * ```ts
   * // Select all products that are ordered by regular customers but not by VIP customers
   * await db.select({
   *   productId: regularCustomerOrders.productId,
   *   quantityOrdered: regularCustomerOrders.quantityOrdered,
   * })
   * .from(regularCustomerOrders)
   * .exceptAll(
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered,
   *   })
   *   .from(vipCustomerOrders)
   * );
   * // or
   * import { exceptAll } from 'drizzle-orm/pg-core'
   *
   * await exceptAll(
   *   db.select({
   *     productId: regularCustomerOrders.productId,
   *     quantityOrdered: regularCustomerOrders.quantityOrdered
   *   })
   *   .from(regularCustomerOrders),
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * ```
   */
  exceptAll = this.createSetOperator("except", true);
  /** @internal */
  addSetOperators(setOperators) {
    this.config.setOperators.push(...setOperators);
    return this;
  }
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#filtering}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be selected.
   *
   * ```ts
   * // Select all cars with green color
   * await db.select().from(cars).where(eq(cars.color, 'green'));
   * // or
   * await db.select().from(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Select all BMW cars with a green color
   * await db.select().from(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Select all cars with the green or blue color
   * await db.select().from(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    if (typeof where === "function") {
      where = where(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.where = where;
    return this;
  }
  /**
   * Adds a `having` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition. It is typically used with aggregate functions to filter the aggregated data based on a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#aggregations}
   *
   * @param having the `having` clause.
   *
   * @example
   *
   * ```ts
   * // Select all brands with more than one car
   * await db.select({
   * 	brand: cars.brand,
   * 	count: sql<number>`cast(count(${cars.id}) as int)`,
   * })
   *   .from(cars)
   *   .groupBy(cars.brand)
   *   .having(({ count }) => gt(count, 1));
   * ```
   */
  having(having) {
    if (typeof having === "function") {
      having = having(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.having = having;
    return this;
  }
  groupBy(...columns) {
    if (typeof columns[0] === "function") {
      const groupBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
    } else {
      this.config.groupBy = columns;
    }
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] === "function") {
      const orderBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    } else {
      const orderByArray = columns;
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    }
    return this;
  }
  /**
   * Adds a `limit` clause to the query.
   *
   * Calling this method will set the maximum number of rows that will be returned by this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param limit the `limit` clause.
   *
   * @example
   *
   * ```ts
   * // Get the first 10 people from this query.
   * await db.select().from(people).limit(10);
   * ```
   */
  limit(limit) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).limit = limit;
    } else {
      this.config.limit = limit;
    }
    return this;
  }
  /**
   * Adds an `offset` clause to the query.
   *
   * Calling this method will skip a number of rows when returning results from this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param offset the `offset` clause.
   *
   * @example
   *
   * ```ts
   * // Get the 10th-20th people from this query.
   * await db.select().from(people).offset(10).limit(10);
   * ```
   */
  offset(offset) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).offset = offset;
    } else {
      this.config.offset = offset;
    }
    return this;
  }
  /**
   * Adds a `for` clause to the query.
   *
   * Calling this method will specify a lock strength for this query that controls how strictly it acquires exclusive access to the rows being queried.
   *
   * See docs: {@link https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE}
   *
   * @param strength the lock strength.
   * @param config the lock configuration.
   */
  for(strength, config = {}) {
    this.config.lockingClause = { strength, config };
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildSelectQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  as(alias) {
    const usedTables = [];
    usedTables.push(...extractUsedTable(this.config.table));
    if (this.config.joins) {
      for (const it of this.config.joins) usedTables.push(...extractUsedTable(it.table));
    }
    return new Proxy(
      new Subquery(this.getSQL(), this.config.fields, alias, false, [...new Set(usedTables)]),
      new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  /** @internal */
  getSelectedFields() {
    return new Proxy(
      this.config.fields,
      new SelectionProxyHandler({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  $dynamic() {
    return this;
  }
  $withCache(config) {
    this.cacheConfig = config === void 0 ? { config: {}, enable: true, autoInvalidate: true } : config === false ? { enable: false } : { enable: true, autoInvalidate: true, ...config };
    return this;
  }
}
class PgSelectBase extends PgSelectQueryBuilderBase {
  static [entityKind] = "PgSelect";
  /** @internal */
  _prepare(name) {
    const { session, config, dialect, joinsNotNullableMap, authToken, cacheConfig, usedTables } = this;
    if (!session) {
      throw new Error("Cannot execute a query on a query builder. Please use a database instance instead.");
    }
    const { fields } = config;
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      const fieldsList = orderSelectedFields(fields);
      const query = session.prepareQuery(dialect.sqlToQuery(this.getSQL()), fieldsList, name, true, void 0, {
        type: "select",
        tables: [...usedTables]
      }, cacheConfig);
      query.joinsNotNullableMap = joinsNotNullableMap;
      return query.setToken(authToken);
    });
  }
  /**
   * Create a prepared statement for this query. This allows
   * the database to remember this query for the given session
   * and call it by name, rather than specifying the full query.
   *
   * {@link https://www.postgresql.org/docs/current/sql-prepare.html | Postgres prepare documentation}
   */
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = (placeholderValues) => {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(placeholderValues, this.authToken);
    });
  };
}
applyMixins(PgSelectBase, [QueryPromise]);
function createSetOperator(type, isAll) {
  return (leftSelect, rightSelect, ...restSelects) => {
    const setOperators = [rightSelect, ...restSelects].map((select) => ({
      type,
      isAll,
      rightSelect: select
    }));
    for (const setOperator of setOperators) {
      if (!haveSameKeys(leftSelect.getSelectedFields(), setOperator.rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
    }
    return leftSelect.addSetOperators(setOperators);
  };
}
const getPgSetOperators = () => ({
  union,
  unionAll,
  intersect,
  intersectAll,
  except,
  exceptAll
});
const union = createSetOperator("union", false);
const unionAll = createSetOperator("union", true);
const intersect = createSetOperator("intersect", false);
const intersectAll = createSetOperator("intersect", true);
const except = createSetOperator("except", false);
const exceptAll = createSetOperator("except", true);

class QueryBuilder {
  static [entityKind] = "PgQueryBuilder";
  dialect;
  dialectConfig;
  constructor(dialect) {
    this.dialect = is(dialect, PgDialect) ? dialect : void 0;
    this.dialectConfig = is(dialect, PgDialect) ? void 0 : dialect;
  }
  $with = (alias, selection) => {
    const queryBuilder = this;
    const as = (qb) => {
      if (typeof qb === "function") {
        qb = qb(queryBuilder);
      }
      return new Proxy(
        new WithSubquery(
          qb.getSQL(),
          selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
          alias,
          true
        ),
        new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
      );
    };
    return { as };
  };
  with(...queries) {
    const self = this;
    function select(fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        distinct: true
      });
    }
    function selectDistinctOn(on, fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        distinct: { on }
      });
    }
    return { select, selectDistinct, selectDistinctOn };
  }
  select(fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect()
    });
  }
  selectDistinct(fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect(),
      distinct: true
    });
  }
  selectDistinctOn(on, fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect(),
      distinct: { on }
    });
  }
  // Lazy load dialect to avoid circular dependency
  getDialect() {
    if (!this.dialect) {
      this.dialect = new PgDialect(this.dialectConfig);
    }
    return this.dialect;
  }
}

function extractUsedTable(table) {
  if (is(table, PgTable)) {
    return [table[Schema] ? `${table[Schema]}.${table[Table.Symbol.BaseName]}` : table[Table.Symbol.BaseName]];
  }
  if (is(table, Subquery)) {
    return table._.usedTables ?? [];
  }
  if (is(table, SQL)) {
    return table.usedTables ?? [];
  }
  return [];
}

class PgDeleteBase extends QueryPromise {
  constructor(table, session, dialect, withList) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { table, withList };
  }
  static [entityKind] = "PgDelete";
  config;
  cacheConfig;
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will delete only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be deleted.
   *
   * ```ts
   * // Delete all cars with green color
   * await db.delete(cars).where(eq(cars.color, 'green'));
   * // or
   * await db.delete(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Delete all BMW cars with a green color
   * await db.delete(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Delete all cars with the green or blue color
   * await db.delete(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  returning(fields = this.config.table[Table.Symbol.Columns]) {
    this.config.returningFields = fields;
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildDeleteQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(name) {
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true, void 0, {
        type: "delete",
        tables: extractUsedTable(this.config.table)
      }, this.cacheConfig);
    });
  }
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = (placeholderValues) => {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(placeholderValues, this.authToken);
    });
  };
  /** @internal */
  getSelectedFields() {
    return this.config.returningFields ? new Proxy(
      this.config.returningFields,
      new SelectionProxyHandler({
        alias: getTableName(this.config.table),
        sqlAliasedBehavior: "alias",
        sqlBehavior: "error"
      })
    ) : void 0;
  }
  $dynamic() {
    return this;
  }
}

class PgInsertBuilder {
  constructor(table, session, dialect, withList, overridingSystemValue_) {
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.withList = withList;
    this.overridingSystemValue_ = overridingSystemValue_;
  }
  static [entityKind] = "PgInsertBuilder";
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  overridingSystemValue() {
    this.overridingSystemValue_ = true;
    return this;
  }
  values(values) {
    values = Array.isArray(values) ? values : [values];
    if (values.length === 0) {
      throw new Error("values() must be called with at least one value");
    }
    const mappedValues = values.map((entry) => {
      const result = {};
      const cols = this.table[Table.Symbol.Columns];
      for (const colKey of Object.keys(entry)) {
        const colValue = entry[colKey];
        result[colKey] = is(colValue, SQL) ? colValue : new Param(colValue, cols[colKey]);
      }
      return result;
    });
    return new PgInsertBase(
      this.table,
      mappedValues,
      this.session,
      this.dialect,
      this.withList,
      false,
      this.overridingSystemValue_
    ).setToken(this.authToken);
  }
  select(selectQuery) {
    const select = typeof selectQuery === "function" ? selectQuery(new QueryBuilder()) : selectQuery;
    if (!is(select, SQL) && !haveSameKeys(this.table[Columns], select._.selectedFields)) {
      throw new Error(
        "Insert select error: selected fields are not the same or are in a different order compared to the table definition"
      );
    }
    return new PgInsertBase(this.table, select, this.session, this.dialect, this.withList, true);
  }
}
class PgInsertBase extends QueryPromise {
  constructor(table, values, session, dialect, withList, select, overridingSystemValue_) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { table, values, withList, select, overridingSystemValue_ };
  }
  static [entityKind] = "PgInsert";
  config;
  cacheConfig;
  returning(fields = this.config.table[Table.Symbol.Columns]) {
    this.config.returningFields = fields;
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /**
   * Adds an `on conflict do nothing` clause to the query.
   *
   * Calling this method simply avoids inserting a row as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#on-conflict-do-nothing}
   *
   * @param config The `target` and `where` clauses.
   *
   * @example
   * ```ts
   * // Insert one row and cancel the insert if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing();
   *
   * // Explicitly specify conflict target
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing({ target: cars.id });
   * ```
   */
  onConflictDoNothing(config = {}) {
    if (config.target === void 0) {
      this.config.onConflict = sql`do nothing`;
    } else {
      let targetColumn = "";
      targetColumn = Array.isArray(config.target) ? config.target.map((it) => this.dialect.escapeName(this.dialect.casing.getColumnCasing(it))).join(",") : this.dialect.escapeName(this.dialect.casing.getColumnCasing(config.target));
      const whereSql = config.where ? sql` where ${config.where}` : void 0;
      this.config.onConflict = sql`(${sql.raw(targetColumn)})${whereSql} do nothing`;
    }
    return this;
  }
  /**
   * Adds an `on conflict do update` clause to the query.
   *
   * Calling this method will update the existing row that conflicts with the row proposed for insertion as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#upserts-and-conflicts}
   *
   * @param config The `target`, `set` and `where` clauses.
   *
   * @example
   * ```ts
   * // Update the row if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'Porsche' }
   *   });
   *
   * // Upsert with 'where' clause
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'newBMW' },
   *     targetWhere: sql`${cars.createdAt} > '2023-01-01'::date`,
   *   });
   * ```
   */
  onConflictDoUpdate(config) {
    if (config.where && (config.targetWhere || config.setWhere)) {
      throw new Error(
        'You cannot use both "where" and "targetWhere"/"setWhere" at the same time - "where" is deprecated, use "targetWhere" or "setWhere" instead.'
      );
    }
    const whereSql = config.where ? sql` where ${config.where}` : void 0;
    const targetWhereSql = config.targetWhere ? sql` where ${config.targetWhere}` : void 0;
    const setWhereSql = config.setWhere ? sql` where ${config.setWhere}` : void 0;
    const setSql = this.dialect.buildUpdateSet(this.config.table, mapUpdateSet(this.config.table, config.set));
    let targetColumn = "";
    targetColumn = Array.isArray(config.target) ? config.target.map((it) => this.dialect.escapeName(this.dialect.casing.getColumnCasing(it))).join(",") : this.dialect.escapeName(this.dialect.casing.getColumnCasing(config.target));
    this.config.onConflict = sql`(${sql.raw(targetColumn)})${targetWhereSql} do update set ${setSql}${whereSql}${setWhereSql}`;
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildInsertQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(name) {
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true, void 0, {
        type: "insert",
        tables: extractUsedTable(this.config.table)
      }, this.cacheConfig);
    });
  }
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = (placeholderValues) => {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(placeholderValues, this.authToken);
    });
  };
  /** @internal */
  getSelectedFields() {
    return this.config.returningFields ? new Proxy(
      this.config.returningFields,
      new SelectionProxyHandler({
        alias: getTableName(this.config.table),
        sqlAliasedBehavior: "alias",
        sqlBehavior: "error"
      })
    ) : void 0;
  }
  $dynamic() {
    return this;
  }
}

class PgRefreshMaterializedView extends QueryPromise {
  constructor(view, session, dialect) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { view };
  }
  static [entityKind] = "PgRefreshMaterializedView";
  config;
  concurrently() {
    if (this.config.withNoData !== void 0) {
      throw new Error("Cannot use concurrently and withNoData together");
    }
    this.config.concurrently = true;
    return this;
  }
  withNoData() {
    if (this.config.concurrently !== void 0) {
      throw new Error("Cannot use concurrently and withNoData together");
    }
    this.config.withNoData = true;
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildRefreshMaterializedViewQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(name) {
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), void 0, name, true);
    });
  }
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = (placeholderValues) => {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(placeholderValues, this.authToken);
    });
  };
}

class PgUpdateBuilder {
  constructor(table, session, dialect, withList) {
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.withList = withList;
  }
  static [entityKind] = "PgUpdateBuilder";
  authToken;
  setToken(token) {
    this.authToken = token;
    return this;
  }
  set(values) {
    return new PgUpdateBase(
      this.table,
      mapUpdateSet(this.table, values),
      this.session,
      this.dialect,
      this.withList
    ).setToken(this.authToken);
  }
}
class PgUpdateBase extends QueryPromise {
  constructor(table, set, session, dialect, withList) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { set, table, withList, joins: [] };
    this.tableName = getTableLikeName(table);
    this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
  }
  static [entityKind] = "PgUpdate";
  config;
  tableName;
  joinsNotNullableMap;
  cacheConfig;
  from(source) {
    const src = source;
    const tableName = getTableLikeName(src);
    if (typeof tableName === "string") {
      this.joinsNotNullableMap[tableName] = true;
    }
    this.config.from = src;
    return this;
  }
  getTableLikeFields(table) {
    if (is(table, PgTable)) {
      return table[Table.Symbol.Columns];
    } else if (is(table, Subquery)) {
      return table._.selectedFields;
    }
    return table[ViewBaseConfig].selectedFields;
  }
  createJoin(joinType) {
    return (table, on) => {
      const tableName = getTableLikeName(table);
      if (typeof tableName === "string" && this.config.joins.some((join) => join.alias === tableName)) {
        throw new Error(`Alias "${tableName}" is already used in this query`);
      }
      if (typeof on === "function") {
        const from = this.config.from && !is(this.config.from, SQL) ? this.getTableLikeFields(this.config.from) : void 0;
        on = on(
          new Proxy(
            this.config.table[Table.Symbol.Columns],
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          ),
          from && new Proxy(
            from,
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          )
        );
      }
      this.config.joins.push({ on, table, joinType, alias: tableName });
      if (typeof tableName === "string") {
        switch (joinType) {
          case "left": {
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
          case "right": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "inner": {
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "full": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
        }
      }
      return this;
    };
  }
  leftJoin = this.createJoin("left");
  rightJoin = this.createJoin("right");
  innerJoin = this.createJoin("inner");
  fullJoin = this.createJoin("full");
  /**
   * Adds a 'where' clause to the query.
   *
   * Calling this method will update only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param where the 'where' clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be updated.
   *
   * ```ts
   * // Update all cars with green color
   * await db.update(cars).set({ color: 'red' })
   *   .where(eq(cars.color, 'green'));
   * // or
   * await db.update(cars).set({ color: 'red' })
   *   .where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Update all BMW cars with a green color
   * await db.update(cars).set({ color: 'red' })
   *   .where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Update all cars with the green or blue color
   * await db.update(cars).set({ color: 'red' })
   *   .where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  returning(fields) {
    if (!fields) {
      fields = Object.assign({}, this.config.table[Table.Symbol.Columns]);
      if (this.config.from) {
        const tableName = getTableLikeName(this.config.from);
        if (typeof tableName === "string" && this.config.from && !is(this.config.from, SQL)) {
          const fromFields = this.getTableLikeFields(this.config.from);
          fields[tableName] = fromFields;
        }
        for (const join of this.config.joins) {
          const tableName2 = getTableLikeName(join.table);
          if (typeof tableName2 === "string" && !is(join.table, SQL)) {
            const fromFields = this.getTableLikeFields(join.table);
            fields[tableName2] = fromFields;
          }
        }
      }
    }
    this.config.returningFields = fields;
    this.config.returning = orderSelectedFields(fields);
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildUpdateQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  /** @internal */
  _prepare(name) {
    const query = this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, name, true, void 0, {
      type: "insert",
      tables: extractUsedTable(this.config.table)
    }, this.cacheConfig);
    query.joinsNotNullableMap = this.joinsNotNullableMap;
    return query;
  }
  prepare(name) {
    return this._prepare(name);
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute = (placeholderValues) => {
    return this._prepare().execute(placeholderValues, this.authToken);
  };
  /** @internal */
  getSelectedFields() {
    return this.config.returningFields ? new Proxy(
      this.config.returningFields,
      new SelectionProxyHandler({
        alias: getTableName(this.config.table),
        sqlAliasedBehavior: "alias",
        sqlBehavior: "error"
      })
    ) : void 0;
  }
  $dynamic() {
    return this;
  }
}

class PgCountBuilder extends SQL {
  constructor(params) {
    super(PgCountBuilder.buildEmbeddedCount(params.source, params.filters).queryChunks);
    this.params = params;
    this.mapWith(Number);
    this.session = params.session;
    this.sql = PgCountBuilder.buildCount(
      params.source,
      params.filters
    );
  }
  sql;
  token;
  static [entityKind] = "PgCountBuilder";
  [Symbol.toStringTag] = "PgCountBuilder";
  session;
  static buildEmbeddedCount(source, filters) {
    return sql`(select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters})`;
  }
  static buildCount(source, filters) {
    return sql`select count(*) as count from ${source}${sql.raw(" where ").if(filters)}${filters};`;
  }
  /** @intrnal */
  setToken(token) {
    this.token = token;
    return this;
  }
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.session.count(this.sql, this.token)).then(
      onfulfilled,
      onrejected
    );
  }
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally?.();
        return value;
      },
      (reason) => {
        onFinally?.();
        throw reason;
      }
    );
  }
}

class RelationalQueryBuilder {
  constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session) {
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session;
  }
  static [entityKind] = "PgRelationalQueryBuilder";
  findMany(config) {
    return new PgRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? config : {},
      "many"
    );
  }
  findFirst(config) {
    return new PgRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config ? { ...config, limit: 1 } : { limit: 1 },
      "first"
    );
  }
}
class PgRelationalQuery extends QueryPromise {
  constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session, config, mode) {
    super();
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session;
    this.config = config;
    this.mode = mode;
  }
  static [entityKind] = "PgRelationalQuery";
  /** @internal */
  _prepare(name) {
    return tracer.startActiveSpan("drizzle.prepareQuery", () => {
      const { query, builtQuery } = this._toSQL();
      return this.session.prepareQuery(
        builtQuery,
        void 0,
        name,
        true,
        (rawRows, mapColumnValue) => {
          const rows = rawRows.map(
            (row) => mapRelationalRow(this.schema, this.tableConfig, row, query.selection, mapColumnValue)
          );
          if (this.mode === "first") {
            return rows[0];
          }
          return rows;
        }
      );
    });
  }
  prepare(name) {
    return this._prepare(name);
  }
  _getQuery() {
    return this.dialect.buildRelationalQueryWithoutPK({
      fullSchema: this.fullSchema,
      schema: this.schema,
      tableNamesMap: this.tableNamesMap,
      table: this.table,
      tableConfig: this.tableConfig,
      queryConfig: this.config,
      tableAlias: this.tableConfig.tsName
    });
  }
  /** @internal */
  getSQL() {
    return this._getQuery().sql;
  }
  _toSQL() {
    const query = this._getQuery();
    const builtQuery = this.dialect.sqlToQuery(query.sql);
    return { query, builtQuery };
  }
  toSQL() {
    return this._toSQL().builtQuery;
  }
  authToken;
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  execute() {
    return tracer.startActiveSpan("drizzle.operation", () => {
      return this._prepare().execute(void 0, this.authToken);
    });
  }
}

class PgRaw extends QueryPromise {
  constructor(execute, sql, query, mapBatchResult) {
    super();
    this.execute = execute;
    this.sql = sql;
    this.query = query;
    this.mapBatchResult = mapBatchResult;
  }
  static [entityKind] = "PgRaw";
  /** @internal */
  getSQL() {
    return this.sql;
  }
  getQuery() {
    return this.query;
  }
  mapResult(result, isFromBatch) {
    return isFromBatch ? this.mapBatchResult(result) : result;
  }
  _prepare() {
    return this;
  }
  /** @internal */
  isResponseInArrayMode() {
    return false;
  }
}

class PgDatabase {
  constructor(dialect, session, schema) {
    this.dialect = dialect;
    this.session = session;
    this._ = schema ? {
      schema: schema.schema,
      fullSchema: schema.fullSchema,
      tableNamesMap: schema.tableNamesMap,
      session
    } : {
      schema: void 0,
      fullSchema: {},
      tableNamesMap: {},
      session
    };
    this.query = {};
    if (this._.schema) {
      for (const [tableName, columns] of Object.entries(this._.schema)) {
        this.query[tableName] = new RelationalQueryBuilder(
          schema.fullSchema,
          this._.schema,
          this._.tableNamesMap,
          schema.fullSchema[tableName],
          columns,
          dialect,
          session
        );
      }
    }
    this.$cache = { invalidate: async (_params) => {
    } };
  }
  static [entityKind] = "PgDatabase";
  query;
  /**
   * Creates a subquery that defines a temporary named result set as a CTE.
   *
   * It is useful for breaking down complex queries into simpler parts and for reusing the result set in subsequent parts of the query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param alias The alias for the subquery.
   *
   * Failure to provide an alias will result in a DrizzleTypeError, preventing the subquery from being referenced in other queries.
   *
   * @example
   *
   * ```ts
   * // Create a subquery with alias 'sq' and use it in the select query
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * const result = await db.with(sq).select().from(sq);
   * ```
   *
   * To select arbitrary SQL values as fields in a CTE and reference them in other CTEs or in the main query, you need to add aliases to them:
   *
   * ```ts
   * // Select an arbitrary SQL value as a field in a CTE and reference it in the main query
   * const sq = db.$with('sq').as(db.select({
   *   name: sql<string>`upper(${users.name})`.as('name'),
   * })
   * .from(users));
   *
   * const result = await db.with(sq).select({ name: sq.name }).from(sq);
   * ```
   */
  $with = (alias, selection) => {
    const self = this;
    const as = (qb) => {
      if (typeof qb === "function") {
        qb = qb(new QueryBuilder(self.dialect));
      }
      return new Proxy(
        new WithSubquery(
          qb.getSQL(),
          selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
          alias,
          true
        ),
        new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
      );
    };
    return { as };
  };
  $count(source, filters) {
    return new PgCountBuilder({ source, filters, session: this.session });
  }
  $cache;
  /**
   * Incorporates a previously defined CTE (using `$with`) into the main query.
   *
   * This method allows the main query to reference a temporary named result set.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param queries The CTEs to incorporate into the main query.
   *
   * @example
   *
   * ```ts
   * // Define a subquery 'sq' as a CTE using $with
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * // Incorporate the CTE 'sq' into the main query and select from it
   * const result = await db.with(sq).select().from(sq);
   * ```
   */
  with(...queries) {
    const self = this;
    function select(fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries,
        distinct: true
      });
    }
    function selectDistinctOn(on, fields) {
      return new PgSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries,
        distinct: { on }
      });
    }
    function update(table) {
      return new PgUpdateBuilder(table, self.session, self.dialect, queries);
    }
    function insert(table) {
      return new PgInsertBuilder(table, self.session, self.dialect, queries);
    }
    function delete_(table) {
      return new PgDeleteBase(table, self.session, self.dialect, queries);
    }
    return { select, selectDistinct, selectDistinctOn, update, insert, delete: delete_ };
  }
  select(fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect
    });
  }
  selectDistinct(fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect,
      distinct: true
    });
  }
  selectDistinctOn(on, fields) {
    return new PgSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect,
      distinct: { on }
    });
  }
  /**
   * Creates an update query.
   *
   * Calling this method without `.where()` clause will update all rows in a table. The `.where()` clause specifies which rows should be updated.
   *
   * Use `.set()` method to specify which values to update.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param table The table to update.
   *
   * @example
   *
   * ```ts
   * // Update all rows in the 'cars' table
   * await db.update(cars).set({ color: 'red' });
   *
   * // Update rows with filters and conditions
   * await db.update(cars).set({ color: 'red' }).where(eq(cars.brand, 'BMW'));
   *
   * // Update with returning clause
   * const updatedCar: Car[] = await db.update(cars)
   *   .set({ color: 'red' })
   *   .where(eq(cars.id, 1))
   *   .returning();
   * ```
   */
  update(table) {
    return new PgUpdateBuilder(table, this.session, this.dialect);
  }
  /**
   * Creates an insert query.
   *
   * Calling this method will create new rows in a table. Use `.values()` method to specify which values to insert.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert}
   *
   * @param table The table to insert into.
   *
   * @example
   *
   * ```ts
   * // Insert one row
   * await db.insert(cars).values({ brand: 'BMW' });
   *
   * // Insert multiple rows
   * await db.insert(cars).values([{ brand: 'BMW' }, { brand: 'Porsche' }]);
   *
   * // Insert with returning clause
   * const insertedCar: Car[] = await db.insert(cars)
   *   .values({ brand: 'BMW' })
   *   .returning();
   * ```
   */
  insert(table) {
    return new PgInsertBuilder(table, this.session, this.dialect);
  }
  /**
   * Creates a delete query.
   *
   * Calling this method without `.where()` clause will delete all rows in a table. The `.where()` clause specifies which rows should be deleted.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param table The table to delete from.
   *
   * @example
   *
   * ```ts
   * // Delete all rows in the 'cars' table
   * await db.delete(cars);
   *
   * // Delete rows with filters and conditions
   * await db.delete(cars).where(eq(cars.color, 'green'));
   *
   * // Delete with returning clause
   * const deletedCar: Car[] = await db.delete(cars)
   *   .where(eq(cars.id, 1))
   *   .returning();
   * ```
   */
  delete(table) {
    return new PgDeleteBase(table, this.session, this.dialect);
  }
  refreshMaterializedView(view) {
    return new PgRefreshMaterializedView(view, this.session, this.dialect);
  }
  authToken;
  execute(query) {
    const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
    const builtQuery = this.dialect.sqlToQuery(sequel);
    const prepared = this.session.prepareQuery(
      builtQuery,
      void 0,
      void 0,
      false
    );
    return new PgRaw(
      () => prepared.execute(void 0, this.authToken),
      sequel,
      builtQuery,
      (result) => prepared.mapResult(result, true)
    );
  }
  transaction(transaction, config) {
    return this.session.transaction(transaction, config);
  }
}

class Cache {
  static [entityKind] = "Cache";
}
class NoopCache extends Cache {
  strategy() {
    return "all";
  }
  static [entityKind] = "NoopCache";
  async get(_key) {
    return void 0;
  }
  async put(_hashedQuery, _response, _tables, _config) {
  }
  async onMutate(_params) {
  }
}
async function hashQuery(sql, params) {
  const dataToHash = `${sql}-${JSON.stringify(params)}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(dataToHash);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = [...new Uint8Array(hashBuffer)];
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

class PgPreparedQuery {
  constructor(query, cache, queryMetadata, cacheConfig) {
    this.query = query;
    this.cache = cache;
    this.queryMetadata = queryMetadata;
    this.cacheConfig = cacheConfig;
    if (cache && cache.strategy() === "all" && cacheConfig === void 0) {
      this.cacheConfig = { enable: true, autoInvalidate: true };
    }
    if (!this.cacheConfig?.enable) {
      this.cacheConfig = void 0;
    }
  }
  authToken;
  getQuery() {
    return this.query;
  }
  mapResult(response, _isFromBatch) {
    return response;
  }
  /** @internal */
  setToken(token) {
    this.authToken = token;
    return this;
  }
  static [entityKind] = "PgPreparedQuery";
  /** @internal */
  joinsNotNullableMap;
  /** @internal */
  async queryWithCache(queryString, params, query) {
    if (this.cache === void 0 || is(this.cache, NoopCache) || this.queryMetadata === void 0) {
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if (this.cacheConfig && !this.cacheConfig.enable) {
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if ((this.queryMetadata.type === "insert" || this.queryMetadata.type === "update" || this.queryMetadata.type === "delete") && this.queryMetadata.tables.length > 0) {
      try {
        const [res] = await Promise.all([
          query(),
          this.cache.onMutate({ tables: this.queryMetadata.tables })
        ]);
        return res;
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if (!this.cacheConfig) {
      try {
        return await query();
      } catch (e) {
        throw new DrizzleQueryError(queryString, params, e);
      }
    }
    if (this.queryMetadata.type === "select") {
      const fromCache = await this.cache.get(
        this.cacheConfig.tag ?? (await hashQuery(queryString, params)),
        this.queryMetadata.tables,
        this.cacheConfig.tag !== void 0,
        this.cacheConfig.autoInvalidate
      );
      if (fromCache === void 0) {
        let result;
        try {
          result = await query();
        } catch (e) {
          throw new DrizzleQueryError(queryString, params, e);
        }
        await this.cache.put(
          this.cacheConfig.tag ?? (await hashQuery(queryString, params)),
          result,
          // make sure we send tables that were used in a query only if user wants to invalidate it on each write
          this.cacheConfig.autoInvalidate ? this.queryMetadata.tables : [],
          this.cacheConfig.tag !== void 0,
          this.cacheConfig.config
        );
        return result;
      }
      return fromCache;
    }
    try {
      return await query();
    } catch (e) {
      throw new DrizzleQueryError(queryString, params, e);
    }
  }
}
class PgSession {
  constructor(dialect) {
    this.dialect = dialect;
  }
  static [entityKind] = "PgSession";
  /** @internal */
  execute(query, token) {
    return tracer.startActiveSpan("drizzle.operation", () => {
      const prepared = tracer.startActiveSpan("drizzle.prepareQuery", () => {
        return this.prepareQuery(
          this.dialect.sqlToQuery(query),
          void 0,
          void 0,
          false
        );
      });
      return prepared.setToken(token).execute(void 0, token);
    });
  }
  all(query) {
    return this.prepareQuery(
      this.dialect.sqlToQuery(query),
      void 0,
      void 0,
      false
    ).all();
  }
  /** @internal */
  async count(sql2, token) {
    const res = await this.execute(sql2, token);
    return Number(
      res[0]["count"]
    );
  }
}
class PgTransaction extends PgDatabase {
  constructor(dialect, session, schema, nestedIndex = 0) {
    super(dialect, session, schema);
    this.schema = schema;
    this.nestedIndex = nestedIndex;
  }
  static [entityKind] = "PgTransaction";
  rollback() {
    throw new TransactionRollbackError();
  }
  /** @internal */
  getTransactionConfigSQL(config) {
    const chunks = [];
    if (config.isolationLevel) {
      chunks.push(`isolation level ${config.isolationLevel}`);
    }
    if (config.accessMode) {
      chunks.push(config.accessMode);
    }
    if (typeof config.deferrable === "boolean") {
      chunks.push(config.deferrable ? "deferrable" : "not deferrable");
    }
    return sql.raw(chunks.join(" "));
  }
  setTransaction(config) {
    return this.session.execute(sql`set transaction ${this.getTransactionConfigSQL(config)}`);
  }
}

var lib$1 = {exports: {}};

var defaults = {exports: {}};

var pgTypes = {};

var postgresArray = {};

var hasRequiredPostgresArray;

function requirePostgresArray () {
	if (hasRequiredPostgresArray) return postgresArray;
	hasRequiredPostgresArray = 1;

	postgresArray.parse = function (source, transform) {
	  return new ArrayParser(source, transform).parse()
	};

	class ArrayParser {
	  constructor (source, transform) {
	    this.source = source;
	    this.transform = transform || identity;
	    this.position = 0;
	    this.entries = [];
	    this.recorded = [];
	    this.dimension = 0;
	  }

	  isEof () {
	    return this.position >= this.source.length
	  }

	  nextCharacter () {
	    var character = this.source[this.position++];
	    if (character === '\\') {
	      return {
	        value: this.source[this.position++],
	        escaped: true
	      }
	    }
	    return {
	      value: character,
	      escaped: false
	    }
	  }

	  record (character) {
	    this.recorded.push(character);
	  }

	  newEntry (includeEmpty) {
	    var entry;
	    if (this.recorded.length > 0 || includeEmpty) {
	      entry = this.recorded.join('');
	      if (entry === 'NULL' && !includeEmpty) {
	        entry = null;
	      }
	      if (entry !== null) entry = this.transform(entry);
	      this.entries.push(entry);
	      this.recorded = [];
	    }
	  }

	  consumeDimensions () {
	    if (this.source[0] === '[') {
	      while (!this.isEof()) {
	        var char = this.nextCharacter();
	        if (char.value === '=') break
	      }
	    }
	  }

	  parse (nested) {
	    var character, parser, quote;
	    this.consumeDimensions();
	    while (!this.isEof()) {
	      character = this.nextCharacter();
	      if (character.value === '{' && !quote) {
	        this.dimension++;
	        if (this.dimension > 1) {
	          parser = new ArrayParser(this.source.substr(this.position - 1), this.transform);
	          this.entries.push(parser.parse(true));
	          this.position += parser.position - 2;
	        }
	      } else if (character.value === '}' && !quote) {
	        this.dimension--;
	        if (!this.dimension) {
	          this.newEntry();
	          if (nested) return this.entries
	        }
	      } else if (character.value === '"' && !character.escaped) {
	        if (quote) this.newEntry(true);
	        quote = !quote;
	      } else if (character.value === ',' && !quote) {
	        this.newEntry();
	      } else {
	        this.record(character.value);
	      }
	    }
	    if (this.dimension !== 0) {
	      throw new Error('array dimension not balanced')
	    }
	    return this.entries
	  }
	}

	function identity (value) {
	  return value
	}
	return postgresArray;
}

var arrayParser;
var hasRequiredArrayParser;

function requireArrayParser () {
	if (hasRequiredArrayParser) return arrayParser;
	hasRequiredArrayParser = 1;
	var array = requirePostgresArray();

	arrayParser = {
	  create: function (source, transform) {
	    return {
	      parse: function() {
	        return array.parse(source, transform);
	      }
	    };
	  }
	};
	return arrayParser;
}

var postgresDate;
var hasRequiredPostgresDate;

function requirePostgresDate () {
	if (hasRequiredPostgresDate) return postgresDate;
	hasRequiredPostgresDate = 1;

	var DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/;
	var DATE = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/;
	var TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/;
	var INFINITY = /^-?infinity$/;

	postgresDate = function parseDate (isoDate) {
	  if (INFINITY.test(isoDate)) {
	    // Capitalize to Infinity before passing to Number
	    return Number(isoDate.replace('i', 'I'))
	  }
	  var matches = DATE_TIME.exec(isoDate);

	  if (!matches) {
	    // Force YYYY-MM-DD dates to be parsed as local time
	    return getDate(isoDate) || null
	  }

	  var isBC = !!matches[8];
	  var year = parseInt(matches[1], 10);
	  if (isBC) {
	    year = bcYearToNegativeYear(year);
	  }

	  var month = parseInt(matches[2], 10) - 1;
	  var day = matches[3];
	  var hour = parseInt(matches[4], 10);
	  var minute = parseInt(matches[5], 10);
	  var second = parseInt(matches[6], 10);

	  var ms = matches[7];
	  ms = ms ? 1000 * parseFloat(ms) : 0;

	  var date;
	  var offset = timeZoneOffset(isoDate);
	  if (offset != null) {
	    date = new Date(Date.UTC(year, month, day, hour, minute, second, ms));

	    // Account for years from 0 to 99 being interpreted as 1900-1999
	    // by Date.UTC / the multi-argument form of the Date constructor
	    if (is0To99(year)) {
	      date.setUTCFullYear(year);
	    }

	    if (offset !== 0) {
	      date.setTime(date.getTime() - offset);
	    }
	  } else {
	    date = new Date(year, month, day, hour, minute, second, ms);

	    if (is0To99(year)) {
	      date.setFullYear(year);
	    }
	  }

	  return date
	};

	function getDate (isoDate) {
	  var matches = DATE.exec(isoDate);
	  if (!matches) {
	    return
	  }

	  var year = parseInt(matches[1], 10);
	  var isBC = !!matches[4];
	  if (isBC) {
	    year = bcYearToNegativeYear(year);
	  }

	  var month = parseInt(matches[2], 10) - 1;
	  var day = matches[3];
	  // YYYY-MM-DD will be parsed as local time
	  var date = new Date(year, month, day);

	  if (is0To99(year)) {
	    date.setFullYear(year);
	  }

	  return date
	}

	// match timezones:
	// Z (UTC)
	// -05
	// +06:30
	function timeZoneOffset (isoDate) {
	  if (isoDate.endsWith('+00')) {
	    return 0
	  }

	  var zone = TIME_ZONE.exec(isoDate.split(' ')[1]);
	  if (!zone) return
	  var type = zone[1];

	  if (type === 'Z') {
	    return 0
	  }
	  var sign = type === '-' ? -1 : 1;
	  var offset = parseInt(zone[2], 10) * 3600 +
	    parseInt(zone[3] || 0, 10) * 60 +
	    parseInt(zone[4] || 0, 10);

	  return offset * sign * 1000
	}

	function bcYearToNegativeYear (year) {
	  // Account for numerical difference between representations of BC years
	  // See: https://github.com/bendrucker/postgres-date/issues/5
	  return -(year - 1)
	}

	function is0To99 (num) {
	  return num >= 0 && num < 100
	}
	return postgresDate;
}

var mutable;
var hasRequiredMutable;

function requireMutable () {
	if (hasRequiredMutable) return mutable;
	hasRequiredMutable = 1;
	mutable = extend;

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function extend(target) {
	    for (var i = 1; i < arguments.length; i++) {
	        var source = arguments[i];

	        for (var key in source) {
	            if (hasOwnProperty.call(source, key)) {
	                target[key] = source[key];
	            }
	        }
	    }

	    return target
	}
	return mutable;
}

var postgresInterval;
var hasRequiredPostgresInterval;

function requirePostgresInterval () {
	if (hasRequiredPostgresInterval) return postgresInterval;
	hasRequiredPostgresInterval = 1;

	var extend = requireMutable();

	postgresInterval = PostgresInterval;

	function PostgresInterval (raw) {
	  if (!(this instanceof PostgresInterval)) {
	    return new PostgresInterval(raw)
	  }
	  extend(this, parse(raw));
	}
	var properties = ['seconds', 'minutes', 'hours', 'days', 'months', 'years'];
	PostgresInterval.prototype.toPostgres = function () {
	  var filtered = properties.filter(this.hasOwnProperty, this);

	  // In addition to `properties`, we need to account for fractions of seconds.
	  if (this.milliseconds && filtered.indexOf('seconds') < 0) {
	    filtered.push('seconds');
	  }

	  if (filtered.length === 0) return '0'
	  return filtered
	    .map(function (property) {
	      var value = this[property] || 0;

	      // Account for fractional part of seconds,
	      // remove trailing zeroes.
	      if (property === 'seconds' && this.milliseconds) {
	        value = (value + this.milliseconds / 1000).toFixed(6).replace(/\.?0+$/, '');
	      }

	      return value + ' ' + property
	    }, this)
	    .join(' ')
	};

	var propertiesISOEquivalent = {
	  years: 'Y',
	  months: 'M',
	  days: 'D',
	  hours: 'H',
	  minutes: 'M',
	  seconds: 'S'
	};
	var dateProperties = ['years', 'months', 'days'];
	var timeProperties = ['hours', 'minutes', 'seconds'];
	// according to ISO 8601
	PostgresInterval.prototype.toISOString = PostgresInterval.prototype.toISO = function () {
	  var datePart = dateProperties
	    .map(buildProperty, this)
	    .join('');

	  var timePart = timeProperties
	    .map(buildProperty, this)
	    .join('');

	  return 'P' + datePart + 'T' + timePart

	  function buildProperty (property) {
	    var value = this[property] || 0;

	    // Account for fractional part of seconds,
	    // remove trailing zeroes.
	    if (property === 'seconds' && this.milliseconds) {
	      value = (value + this.milliseconds / 1000).toFixed(6).replace(/0+$/, '');
	    }

	    return value + propertiesISOEquivalent[property]
	  }
	};

	var NUMBER = '([+-]?\\d+)';
	var YEAR = NUMBER + '\\s+years?';
	var MONTH = NUMBER + '\\s+mons?';
	var DAY = NUMBER + '\\s+days?';
	var TIME = '([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?';
	var INTERVAL = new RegExp([YEAR, MONTH, DAY, TIME].map(function (regexString) {
	  return '(' + regexString + ')?'
	})
	  .join('\\s*'));

	// Positions of values in regex match
	var positions = {
	  years: 2,
	  months: 4,
	  days: 6,
	  hours: 9,
	  minutes: 10,
	  seconds: 11,
	  milliseconds: 12
	};
	// We can use negative time
	var negatives = ['hours', 'minutes', 'seconds', 'milliseconds'];

	function parseMilliseconds (fraction) {
	  // add omitted zeroes
	  var microseconds = fraction + '000000'.slice(fraction.length);
	  return parseInt(microseconds, 10) / 1000
	}

	function parse (interval) {
	  if (!interval) return {}
	  var matches = INTERVAL.exec(interval);
	  var isNegative = matches[8] === '-';
	  return Object.keys(positions)
	    .reduce(function (parsed, property) {
	      var position = positions[property];
	      var value = matches[position];
	      // no empty string
	      if (!value) return parsed
	      // milliseconds are actually microseconds (up to 6 digits)
	      // with omitted trailing zeroes.
	      value = property === 'milliseconds'
	        ? parseMilliseconds(value)
	        : parseInt(value, 10);
	      // no zeros
	      if (!value) return parsed
	      if (isNegative && ~negatives.indexOf(property)) {
	        value *= -1;
	      }
	      parsed[property] = value;
	      return parsed
	    }, {})
	}
	return postgresInterval;
}

var postgresBytea;
var hasRequiredPostgresBytea;

function requirePostgresBytea () {
	if (hasRequiredPostgresBytea) return postgresBytea;
	hasRequiredPostgresBytea = 1;

	var bufferFrom = Buffer.from || Buffer;

	postgresBytea = function parseBytea (input) {
	  if (/^\\x/.test(input)) {
	    // new 'hex' style response (pg >9.0)
	    return bufferFrom(input.substr(2), 'hex')
	  }
	  var output = '';
	  var i = 0;
	  while (i < input.length) {
	    if (input[i] !== '\\') {
	      output += input[i];
	      ++i;
	    } else {
	      if (/[0-7]{3}/.test(input.substr(i + 1, 3))) {
	        output += String.fromCharCode(parseInt(input.substr(i + 1, 3), 8));
	        i += 4;
	      } else {
	        var backslashes = 1;
	        while (i + backslashes < input.length && input[i + backslashes] === '\\') {
	          backslashes++;
	        }
	        for (var k = 0; k < Math.floor(backslashes / 2); ++k) {
	          output += '\\';
	        }
	        i += Math.floor(backslashes / 2) * 2;
	      }
	    }
	  }
	  return bufferFrom(output, 'binary')
	};
	return postgresBytea;
}

var textParsers;
var hasRequiredTextParsers;

function requireTextParsers () {
	if (hasRequiredTextParsers) return textParsers;
	hasRequiredTextParsers = 1;
	var array = requirePostgresArray();
	var arrayParser = requireArrayParser();
	var parseDate = requirePostgresDate();
	var parseInterval = requirePostgresInterval();
	var parseByteA = requirePostgresBytea();

	function allowNull (fn) {
	  return function nullAllowed (value) {
	    if (value === null) return value
	    return fn(value)
	  }
	}

	function parseBool (value) {
	  if (value === null) return value
	  return value === 'TRUE' ||
	    value === 't' ||
	    value === 'true' ||
	    value === 'y' ||
	    value === 'yes' ||
	    value === 'on' ||
	    value === '1';
	}

	function parseBoolArray (value) {
	  if (!value) return null
	  return array.parse(value, parseBool)
	}

	function parseBaseTenInt (string) {
	  return parseInt(string, 10)
	}

	function parseIntegerArray (value) {
	  if (!value) return null
	  return array.parse(value, allowNull(parseBaseTenInt))
	}

	function parseBigIntegerArray (value) {
	  if (!value) return null
	  return array.parse(value, allowNull(function (entry) {
	    return parseBigInteger(entry).trim()
	  }))
	}

	var parsePointArray = function(value) {
	  if(!value) { return null; }
	  var p = arrayParser.create(value, function(entry) {
	    if(entry !== null) {
	      entry = parsePoint(entry);
	    }
	    return entry;
	  });

	  return p.parse();
	};

	var parseFloatArray = function(value) {
	  if(!value) { return null; }
	  var p = arrayParser.create(value, function(entry) {
	    if(entry !== null) {
	      entry = parseFloat(entry);
	    }
	    return entry;
	  });

	  return p.parse();
	};

	var parseStringArray = function(value) {
	  if(!value) { return null; }

	  var p = arrayParser.create(value);
	  return p.parse();
	};

	var parseDateArray = function(value) {
	  if (!value) { return null; }

	  var p = arrayParser.create(value, function(entry) {
	    if (entry !== null) {
	      entry = parseDate(entry);
	    }
	    return entry;
	  });

	  return p.parse();
	};

	var parseIntervalArray = function(value) {
	  if (!value) { return null; }

	  var p = arrayParser.create(value, function(entry) {
	    if (entry !== null) {
	      entry = parseInterval(entry);
	    }
	    return entry;
	  });

	  return p.parse();
	};

	var parseByteAArray = function(value) {
	  if (!value) { return null; }

	  return array.parse(value, allowNull(parseByteA));
	};

	var parseInteger = function(value) {
	  return parseInt(value, 10);
	};

	var parseBigInteger = function(value) {
	  var valStr = String(value);
	  if (/^\d+$/.test(valStr)) { return valStr; }
	  return value;
	};

	var parseJsonArray = function(value) {
	  if (!value) { return null; }

	  return array.parse(value, allowNull(JSON.parse));
	};

	var parsePoint = function(value) {
	  if (value[0] !== '(') { return null; }

	  value = value.substring( 1, value.length - 1 ).split(',');

	  return {
	    x: parseFloat(value[0])
	  , y: parseFloat(value[1])
	  };
	};

	var parseCircle = function(value) {
	  if (value[0] !== '<' && value[1] !== '(') { return null; }

	  var point = '(';
	  var radius = '';
	  var pointParsed = false;
	  for (var i = 2; i < value.length - 1; i++){
	    if (!pointParsed) {
	      point += value[i];
	    }

	    if (value[i] === ')') {
	      pointParsed = true;
	      continue;
	    } else if (!pointParsed) {
	      continue;
	    }

	    if (value[i] === ','){
	      continue;
	    }

	    radius += value[i];
	  }
	  var result = parsePoint(point);
	  result.radius = parseFloat(radius);

	  return result;
	};

	var init = function(register) {
	  register(20, parseBigInteger); // int8
	  register(21, parseInteger); // int2
	  register(23, parseInteger); // int4
	  register(26, parseInteger); // oid
	  register(700, parseFloat); // float4/real
	  register(701, parseFloat); // float8/double
	  register(16, parseBool);
	  register(1082, parseDate); // date
	  register(1114, parseDate); // timestamp without timezone
	  register(1184, parseDate); // timestamp
	  register(600, parsePoint); // point
	  register(651, parseStringArray); // cidr[]
	  register(718, parseCircle); // circle
	  register(1000, parseBoolArray);
	  register(1001, parseByteAArray);
	  register(1005, parseIntegerArray); // _int2
	  register(1007, parseIntegerArray); // _int4
	  register(1028, parseIntegerArray); // oid[]
	  register(1016, parseBigIntegerArray); // _int8
	  register(1017, parsePointArray); // point[]
	  register(1021, parseFloatArray); // _float4
	  register(1022, parseFloatArray); // _float8
	  register(1231, parseFloatArray); // _numeric
	  register(1014, parseStringArray); //char
	  register(1015, parseStringArray); //varchar
	  register(1008, parseStringArray);
	  register(1009, parseStringArray);
	  register(1040, parseStringArray); // macaddr[]
	  register(1041, parseStringArray); // inet[]
	  register(1115, parseDateArray); // timestamp without time zone[]
	  register(1182, parseDateArray); // _date
	  register(1185, parseDateArray); // timestamp with time zone[]
	  register(1186, parseInterval);
	  register(1187, parseIntervalArray);
	  register(17, parseByteA);
	  register(114, JSON.parse.bind(JSON)); // json
	  register(3802, JSON.parse.bind(JSON)); // jsonb
	  register(199, parseJsonArray); // json[]
	  register(3807, parseJsonArray); // jsonb[]
	  register(3907, parseStringArray); // numrange[]
	  register(2951, parseStringArray); // uuid[]
	  register(791, parseStringArray); // money[]
	  register(1183, parseStringArray); // time[]
	  register(1270, parseStringArray); // timetz[]
	};

	textParsers = {
	  init: init
	};
	return textParsers;
}

var pgInt8;
var hasRequiredPgInt8;

function requirePgInt8 () {
	if (hasRequiredPgInt8) return pgInt8;
	hasRequiredPgInt8 = 1;

	// selected so (BASE - 1) * 0x100000000 + 0xffffffff is a safe integer
	var BASE = 1000000;

	function readInt8(buffer) {
		var high = buffer.readInt32BE(0);
		var low = buffer.readUInt32BE(4);
		var sign = '';

		if (high < 0) {
			high = ~high + (low === 0);
			low = (~low + 1) >>> 0;
			sign = '-';
		}

		var result = '';
		var carry;
		var t;
		var digits;
		var pad;
		var l;
		var i;

		{
			carry = high % BASE;
			high = high / BASE >>> 0;

			t = 0x100000000 * carry + low;
			low = t / BASE >>> 0;
			digits = '' + (t - BASE * low);

			if (low === 0 && high === 0) {
				return sign + digits + result;
			}

			pad = '';
			l = 6 - digits.length;

			for (i = 0; i < l; i++) {
				pad += '0';
			}

			result = pad + digits + result;
		}

		{
			carry = high % BASE;
			high = high / BASE >>> 0;

			t = 0x100000000 * carry + low;
			low = t / BASE >>> 0;
			digits = '' + (t - BASE * low);

			if (low === 0 && high === 0) {
				return sign + digits + result;
			}

			pad = '';
			l = 6 - digits.length;

			for (i = 0; i < l; i++) {
				pad += '0';
			}

			result = pad + digits + result;
		}

		{
			carry = high % BASE;
			high = high / BASE >>> 0;

			t = 0x100000000 * carry + low;
			low = t / BASE >>> 0;
			digits = '' + (t - BASE * low);

			if (low === 0 && high === 0) {
				return sign + digits + result;
			}

			pad = '';
			l = 6 - digits.length;

			for (i = 0; i < l; i++) {
				pad += '0';
			}

			result = pad + digits + result;
		}

		{
			carry = high % BASE;
			t = 0x100000000 * carry + low;
			digits = '' + t % BASE;

			return sign + digits + result;
		}
	}

	pgInt8 = readInt8;
	return pgInt8;
}

var binaryParsers;
var hasRequiredBinaryParsers;

function requireBinaryParsers () {
	if (hasRequiredBinaryParsers) return binaryParsers;
	hasRequiredBinaryParsers = 1;
	var parseInt64 = requirePgInt8();

	var parseBits = function(data, bits, offset, invert, callback) {
	  offset = offset || 0;
	  invert = invert || false;
	  callback = callback || function(lastValue, newValue, bits) { return (lastValue * Math.pow(2, bits)) + newValue; };
	  var offsetBytes = offset >> 3;

	  var inv = function(value) {
	    if (invert) {
	      return ~value & 0xff;
	    }

	    return value;
	  };

	  // read first (maybe partial) byte
	  var mask = 0xff;
	  var firstBits = 8 - (offset % 8);
	  if (bits < firstBits) {
	    mask = (0xff << (8 - bits)) & 0xff;
	    firstBits = bits;
	  }

	  if (offset) {
	    mask = mask >> (offset % 8);
	  }

	  var result = 0;
	  if ((offset % 8) + bits >= 8) {
	    result = callback(0, inv(data[offsetBytes]) & mask, firstBits);
	  }

	  // read bytes
	  var bytes = (bits + offset) >> 3;
	  for (var i = offsetBytes + 1; i < bytes; i++) {
	    result = callback(result, inv(data[i]), 8);
	  }

	  // bits to read, that are not a complete byte
	  var lastBits = (bits + offset) % 8;
	  if (lastBits > 0) {
	    result = callback(result, inv(data[bytes]) >> (8 - lastBits), lastBits);
	  }

	  return result;
	};

	var parseFloatFromBits = function(data, precisionBits, exponentBits) {
	  var bias = Math.pow(2, exponentBits - 1) - 1;
	  var sign = parseBits(data, 1);
	  var exponent = parseBits(data, exponentBits, 1);

	  if (exponent === 0) {
	    return 0;
	  }

	  // parse mantissa
	  var precisionBitsCounter = 1;
	  var parsePrecisionBits = function(lastValue, newValue, bits) {
	    if (lastValue === 0) {
	      lastValue = 1;
	    }

	    for (var i = 1; i <= bits; i++) {
	      precisionBitsCounter /= 2;
	      if ((newValue & (0x1 << (bits - i))) > 0) {
	        lastValue += precisionBitsCounter;
	      }
	    }

	    return lastValue;
	  };

	  var mantissa = parseBits(data, precisionBits, exponentBits + 1, false, parsePrecisionBits);

	  // special cases
	  if (exponent == (Math.pow(2, exponentBits + 1) - 1)) {
	    if (mantissa === 0) {
	      return (sign === 0) ? Infinity : -Infinity;
	    }

	    return NaN;
	  }

	  // normale number
	  return ((sign === 0) ? 1 : -1) * Math.pow(2, exponent - bias) * mantissa;
	};

	var parseInt16 = function(value) {
	  if (parseBits(value, 1) == 1) {
	    return -1 * (parseBits(value, 15, 1, true) + 1);
	  }

	  return parseBits(value, 15, 1);
	};

	var parseInt32 = function(value) {
	  if (parseBits(value, 1) == 1) {
	    return -1 * (parseBits(value, 31, 1, true) + 1);
	  }

	  return parseBits(value, 31, 1);
	};

	var parseFloat32 = function(value) {
	  return parseFloatFromBits(value, 23, 8);
	};

	var parseFloat64 = function(value) {
	  return parseFloatFromBits(value, 52, 11);
	};

	var parseNumeric = function(value) {
	  var sign = parseBits(value, 16, 32);
	  if (sign == 0xc000) {
	    return NaN;
	  }

	  var weight = Math.pow(10000, parseBits(value, 16, 16));
	  var result = 0;
	  var ndigits = parseBits(value, 16);
	  for (var i = 0; i < ndigits; i++) {
	    result += parseBits(value, 16, 64 + (16 * i)) * weight;
	    weight /= 10000;
	  }

	  var scale = Math.pow(10, parseBits(value, 16, 48));
	  return ((sign === 0) ? 1 : -1) * Math.round(result * scale) / scale;
	};

	var parseDate = function(isUTC, value) {
	  var sign = parseBits(value, 1);
	  var rawValue = parseBits(value, 63, 1);

	  // discard usecs and shift from 2000 to 1970
	  var result = new Date((((sign === 0) ? 1 : -1) * rawValue / 1000) + 946684800000);

	  if (!isUTC) {
	    result.setTime(result.getTime() + result.getTimezoneOffset() * 60000);
	  }

	  // add microseconds to the date
	  result.usec = rawValue % 1000;
	  result.getMicroSeconds = function() {
	    return this.usec;
	  };
	  result.setMicroSeconds = function(value) {
	    this.usec = value;
	  };
	  result.getUTCMicroSeconds = function() {
	    return this.usec;
	  };

	  return result;
	};

	var parseArray = function(value) {
	  var dim = parseBits(value, 32);

	  parseBits(value, 32, 32);
	  var elementType = parseBits(value, 32, 64);

	  var offset = 96;
	  var dims = [];
	  for (var i = 0; i < dim; i++) {
	    // parse dimension
	    dims[i] = parseBits(value, 32, offset);
	    offset += 32;

	    // ignore lower bounds
	    offset += 32;
	  }

	  var parseElement = function(elementType) {
	    // parse content length
	    var length = parseBits(value, 32, offset);
	    offset += 32;

	    // parse null values
	    if (length == 0xffffffff) {
	      return null;
	    }

	    var result;
	    if ((elementType == 0x17) || (elementType == 0x14)) {
	      // int/bigint
	      result = parseBits(value, length * 8, offset);
	      offset += length * 8;
	      return result;
	    }
	    else if (elementType == 0x19) {
	      // string
	      result = value.toString(this.encoding, offset >> 3, (offset += (length << 3)) >> 3);
	      return result;
	    }
	    else {
	      console.log("ERROR: ElementType not implemented: " + elementType);
	    }
	  };

	  var parse = function(dimension, elementType) {
	    var array = [];
	    var i;

	    if (dimension.length > 1) {
	      var count = dimension.shift();
	      for (i = 0; i < count; i++) {
	        array[i] = parse(dimension, elementType);
	      }
	      dimension.unshift(count);
	    }
	    else {
	      for (i = 0; i < dimension[0]; i++) {
	        array[i] = parseElement(elementType);
	      }
	    }

	    return array;
	  };

	  return parse(dims, elementType);
	};

	var parseText = function(value) {
	  return value.toString('utf8');
	};

	var parseBool = function(value) {
	  if(value === null) return null;
	  return (parseBits(value, 8) > 0);
	};

	var init = function(register) {
	  register(20, parseInt64);
	  register(21, parseInt16);
	  register(23, parseInt32);
	  register(26, parseInt32);
	  register(1700, parseNumeric);
	  register(700, parseFloat32);
	  register(701, parseFloat64);
	  register(16, parseBool);
	  register(1114, parseDate.bind(null, false));
	  register(1184, parseDate.bind(null, true));
	  register(1000, parseArray);
	  register(1007, parseArray);
	  register(1016, parseArray);
	  register(1008, parseArray);
	  register(1009, parseArray);
	  register(25, parseText);
	};

	binaryParsers = {
	  init: init
	};
	return binaryParsers;
}

/**
 * Following query was used to generate this file:

 SELECT json_object_agg(UPPER(PT.typname), PT.oid::int4 ORDER BY pt.oid)
 FROM pg_type PT
 WHERE typnamespace = (SELECT pgn.oid FROM pg_namespace pgn WHERE nspname = 'pg_catalog') -- Take only builting Postgres types with stable OID (extension types are not guaranted to be stable)
 AND typtype = 'b' -- Only basic types
 AND typelem = 0 -- Ignore aliases
 AND typisdefined -- Ignore undefined types
 */

var builtins;
var hasRequiredBuiltins;

function requireBuiltins () {
	if (hasRequiredBuiltins) return builtins;
	hasRequiredBuiltins = 1;
	builtins = {
	    BOOL: 16,
	    BYTEA: 17,
	    CHAR: 18,
	    INT8: 20,
	    INT2: 21,
	    INT4: 23,
	    REGPROC: 24,
	    TEXT: 25,
	    OID: 26,
	    TID: 27,
	    XID: 28,
	    CID: 29,
	    JSON: 114,
	    XML: 142,
	    PG_NODE_TREE: 194,
	    SMGR: 210,
	    PATH: 602,
	    POLYGON: 604,
	    CIDR: 650,
	    FLOAT4: 700,
	    FLOAT8: 701,
	    ABSTIME: 702,
	    RELTIME: 703,
	    TINTERVAL: 704,
	    CIRCLE: 718,
	    MACADDR8: 774,
	    MONEY: 790,
	    MACADDR: 829,
	    INET: 869,
	    ACLITEM: 1033,
	    BPCHAR: 1042,
	    VARCHAR: 1043,
	    DATE: 1082,
	    TIME: 1083,
	    TIMESTAMP: 1114,
	    TIMESTAMPTZ: 1184,
	    INTERVAL: 1186,
	    TIMETZ: 1266,
	    BIT: 1560,
	    VARBIT: 1562,
	    NUMERIC: 1700,
	    REFCURSOR: 1790,
	    REGPROCEDURE: 2202,
	    REGOPER: 2203,
	    REGOPERATOR: 2204,
	    REGCLASS: 2205,
	    REGTYPE: 2206,
	    UUID: 2950,
	    TXID_SNAPSHOT: 2970,
	    PG_LSN: 3220,
	    PG_NDISTINCT: 3361,
	    PG_DEPENDENCIES: 3402,
	    TSVECTOR: 3614,
	    TSQUERY: 3615,
	    GTSVECTOR: 3642,
	    REGCONFIG: 3734,
	    REGDICTIONARY: 3769,
	    JSONB: 3802,
	    REGNAMESPACE: 4089,
	    REGROLE: 4096
	};
	return builtins;
}

var hasRequiredPgTypes;

function requirePgTypes () {
	if (hasRequiredPgTypes) return pgTypes;
	hasRequiredPgTypes = 1;
	var textParsers = requireTextParsers();
	var binaryParsers = requireBinaryParsers();
	var arrayParser = requireArrayParser();
	var builtinTypes = requireBuiltins();

	pgTypes.getTypeParser = getTypeParser;
	pgTypes.setTypeParser = setTypeParser;
	pgTypes.arrayParser = arrayParser;
	pgTypes.builtins = builtinTypes;

	var typeParsers = {
	  text: {},
	  binary: {}
	};

	//the empty parse function
	function noParse (val) {
	  return String(val);
	}
	//returns a function used to convert a specific type (specified by
	//oid) into a result javascript type
	//note: the oid can be obtained via the following sql query:
	//SELECT oid FROM pg_type WHERE typname = 'TYPE_NAME_HERE';
	function getTypeParser (oid, format) {
	  format = format || 'text';
	  if (!typeParsers[format]) {
	    return noParse;
	  }
	  return typeParsers[format][oid] || noParse;
	}
	function setTypeParser (oid, format, parseFn) {
	  if(typeof format == 'function') {
	    parseFn = format;
	    format = 'text';
	  }
	  typeParsers[format][oid] = parseFn;
	}
	textParsers.init(function(oid, converter) {
	  typeParsers.text[oid] = converter;
	});

	binaryParsers.init(function(oid, converter) {
	  typeParsers.binary[oid] = converter;
	});
	return pgTypes;
}

var hasRequiredDefaults;

function requireDefaults () {
	if (hasRequiredDefaults) return defaults.exports;
	hasRequiredDefaults = 1;
	(function (module) {

		let user;
		try {
		  user = process.platform === 'win32' ? process.env.USERNAME : process.env.USER;
		} catch {
		  // ignore, e.g., Deno without --allow-env
		}

		module.exports = {
		  // database host. defaults to localhost
		  host: 'localhost',

		  // database user's name
		  user,

		  // name of database to connect
		  database: undefined,

		  // database user's password
		  password: null,

		  // a Postgres connection string to be used instead of setting individual connection items
		  // NOTE:  Setting this value will cause it to override any other value (such as database or user) defined
		  // in the defaults object.
		  connectionString: undefined,

		  // database port
		  port: 5432,

		  // number of rows to return at a time from a prepared statement's
		  // portal. 0 will return all rows at once
		  rows: 0,

		  // binary result mode
		  binary: false,

		  // Connection pool options - see https://github.com/brianc/node-pg-pool

		  // number of connections to use in connection pool
		  // 0 will disable connection pooling
		  max: 10,

		  // max milliseconds a client can go unused before it is removed
		  // from the pool and destroyed
		  idleTimeoutMillis: 30000,

		  client_encoding: '',

		  ssl: false,

		  application_name: undefined,

		  fallback_application_name: undefined,

		  options: undefined,

		  parseInputDatesAsUTC: false,

		  // max milliseconds any query using this connection will execute for before timing out in error.
		  // false=unlimited
		  statement_timeout: false,

		  // Abort any statement that waits longer than the specified duration in milliseconds while attempting to acquire a lock.
		  // false=unlimited
		  lock_timeout: false,

		  // Terminate any session with an open transaction that has been idle for longer than the specified duration in milliseconds
		  // false=unlimited
		  idle_in_transaction_session_timeout: false,

		  // max milliseconds to wait for query to complete (client side)
		  query_timeout: false,

		  connect_timeout: 0,

		  keepalives: 1,

		  keepalives_idle: 0,
		};

		const pgTypes = requirePgTypes();
		// save default parsers
		const parseBigInteger = pgTypes.getTypeParser(20, 'text');
		const parseBigIntegerArray = pgTypes.getTypeParser(1016, 'text');

		// parse int8 so you can get your count values as actual numbers
		module.exports.__defineSetter__('parseInt8', function (val) {
		  pgTypes.setTypeParser(20, 'text', val ? pgTypes.getTypeParser(23, 'text') : parseBigInteger);
		  pgTypes.setTypeParser(1016, 'text', val ? pgTypes.getTypeParser(1007, 'text') : parseBigIntegerArray);
		}); 
	} (defaults));
	return defaults.exports;
}

var utils$1;
var hasRequiredUtils$1;

function requireUtils$1 () {
	if (hasRequiredUtils$1) return utils$1;
	hasRequiredUtils$1 = 1;

	const defaults = requireDefaults();

	const util = require$$1;
	const { isDate } = util.types || util; // Node 8 doesn't have `util.types`

	function escapeElement(elementRepresentation) {
	  const escaped = elementRepresentation.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

	  return '"' + escaped + '"'
	}

	// convert a JS array to a postgres array literal
	// uses comma separator so won't work for types like box that use
	// a different array separator.
	function arrayString(val) {
	  let result = '{';
	  for (let i = 0; i < val.length; i++) {
	    if (i > 0) {
	      result = result + ',';
	    }
	    if (val[i] === null || typeof val[i] === 'undefined') {
	      result = result + 'NULL';
	    } else if (Array.isArray(val[i])) {
	      result = result + arrayString(val[i]);
	    } else if (ArrayBuffer.isView(val[i])) {
	      let item = val[i];
	      if (!(item instanceof Buffer)) {
	        const buf = Buffer.from(item.buffer, item.byteOffset, item.byteLength);
	        if (buf.length === item.byteLength) {
	          item = buf;
	        } else {
	          item = buf.slice(item.byteOffset, item.byteOffset + item.byteLength);
	        }
	      }
	      result += '\\\\x' + item.toString('hex');
	    } else {
	      result += escapeElement(prepareValue(val[i]));
	    }
	  }
	  result = result + '}';
	  return result
	}

	// converts values from javascript types
	// to their 'raw' counterparts for use as a postgres parameter
	// note: you can override this function to provide your own conversion mechanism
	// for complex types, etc...
	const prepareValue = function (val, seen) {
	  // null and undefined are both null for postgres
	  if (val == null) {
	    return null
	  }
	  if (typeof val === 'object') {
	    if (val instanceof Buffer) {
	      return val
	    }
	    if (ArrayBuffer.isView(val)) {
	      const buf = Buffer.from(val.buffer, val.byteOffset, val.byteLength);
	      if (buf.length === val.byteLength) {
	        return buf
	      }
	      return buf.slice(val.byteOffset, val.byteOffset + val.byteLength) // Node.js v4 does not support those Buffer.from params
	    }
	    if (isDate(val)) {
	      if (defaults.parseInputDatesAsUTC) {
	        return dateToStringUTC(val)
	      } else {
	        return dateToString(val)
	      }
	    }
	    if (Array.isArray(val)) {
	      return arrayString(val)
	    }

	    return prepareObject(val, seen)
	  }
	  return val.toString()
	};

	function prepareObject(val, seen) {
	  if (val && typeof val.toPostgres === 'function') {
	    seen = seen || [];
	    if (seen.indexOf(val) !== -1) {
	      throw new Error('circular reference detected while preparing "' + val + '" for query')
	    }
	    seen.push(val);

	    return prepareValue(val.toPostgres(prepareValue), seen)
	  }
	  return JSON.stringify(val)
	}

	function dateToString(date) {
	  let offset = -date.getTimezoneOffset();

	  let year = date.getFullYear();
	  const isBCYear = year < 1;
	  if (isBCYear) year = Math.abs(year) + 1; // negative years are 1 off their BC representation

	  let ret =
	    String(year).padStart(4, '0') +
	    '-' +
	    String(date.getMonth() + 1).padStart(2, '0') +
	    '-' +
	    String(date.getDate()).padStart(2, '0') +
	    'T' +
	    String(date.getHours()).padStart(2, '0') +
	    ':' +
	    String(date.getMinutes()).padStart(2, '0') +
	    ':' +
	    String(date.getSeconds()).padStart(2, '0') +
	    '.' +
	    String(date.getMilliseconds()).padStart(3, '0');

	  if (offset < 0) {
	    ret += '-';
	    offset *= -1;
	  } else {
	    ret += '+';
	  }

	  ret += String(Math.floor(offset / 60)).padStart(2, '0') + ':' + String(offset % 60).padStart(2, '0');
	  if (isBCYear) ret += ' BC';
	  return ret
	}

	function dateToStringUTC(date) {
	  let year = date.getUTCFullYear();
	  const isBCYear = year < 1;
	  if (isBCYear) year = Math.abs(year) + 1; // negative years are 1 off their BC representation

	  let ret =
	    String(year).padStart(4, '0') +
	    '-' +
	    String(date.getUTCMonth() + 1).padStart(2, '0') +
	    '-' +
	    String(date.getUTCDate()).padStart(2, '0') +
	    'T' +
	    String(date.getUTCHours()).padStart(2, '0') +
	    ':' +
	    String(date.getUTCMinutes()).padStart(2, '0') +
	    ':' +
	    String(date.getUTCSeconds()).padStart(2, '0') +
	    '.' +
	    String(date.getUTCMilliseconds()).padStart(3, '0');

	  ret += '+00:00';
	  if (isBCYear) ret += ' BC';
	  return ret
	}

	function normalizeQueryConfig(config, values, callback) {
	  // can take in strings or config objects
	  config = typeof config === 'string' ? { text: config } : config;
	  if (values) {
	    if (typeof values === 'function') {
	      config.callback = values;
	    } else {
	      config.values = values;
	    }
	  }
	  if (callback) {
	    config.callback = callback;
	  }
	  return config
	}

	// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
	const escapeIdentifier = function (str) {
	  return '"' + str.replace(/"/g, '""') + '"'
	};

	const escapeLiteral = function (str) {
	  let hasBackslash = false;
	  let escaped = "'";

	  if (str == null) {
	    return "''"
	  }

	  if (typeof str !== 'string') {
	    return "''"
	  }

	  for (let i = 0; i < str.length; i++) {
	    const c = str[i];
	    if (c === "'") {
	      escaped += c + c;
	    } else if (c === '\\') {
	      escaped += c + c;
	      hasBackslash = true;
	    } else {
	      escaped += c;
	    }
	  }

	  escaped += "'";

	  if (hasBackslash === true) {
	    escaped = ' E' + escaped;
	  }

	  return escaped
	};

	utils$1 = {
	  prepareValue: function prepareValueWrapper(value) {
	    // this ensures that extra arguments do not get passed into prepareValue
	    // by accident, eg: from calling values.map(utils.prepareValue)
	    return prepareValue(value)
	  },
	  normalizeQueryConfig,
	  escapeIdentifier,
	  escapeLiteral,
	};
	return utils$1;
}

var utils = {exports: {}};

var utilsLegacy;
var hasRequiredUtilsLegacy;

function requireUtilsLegacy () {
	if (hasRequiredUtilsLegacy) return utilsLegacy;
	hasRequiredUtilsLegacy = 1;
	// This file contains crypto utility functions for versions of Node.js < 15.0.0,
	// which does not support the WebCrypto.subtle API.

	const nodeCrypto = require$$0;

	function md5(string) {
	  return nodeCrypto.createHash('md5').update(string, 'utf-8').digest('hex')
	}

	// See AuthenticationMD5Password at https://www.postgresql.org/docs/current/static/protocol-flow.html
	function postgresMd5PasswordHash(user, password, salt) {
	  const inner = md5(password + user);
	  const outer = md5(Buffer.concat([Buffer.from(inner), salt]));
	  return 'md5' + outer
	}

	function sha256(text) {
	  return nodeCrypto.createHash('sha256').update(text).digest()
	}

	function hashByName(hashName, text) {
	  hashName = hashName.replace(/(\D)-/, '$1'); // e.g. SHA-256 -> SHA256
	  return nodeCrypto.createHash(hashName).update(text).digest()
	}

	function hmacSha256(key, msg) {
	  return nodeCrypto.createHmac('sha256', key).update(msg).digest()
	}

	async function deriveKey(password, salt, iterations) {
	  return nodeCrypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256')
	}

	utilsLegacy = {
	  postgresMd5PasswordHash,
	  randomBytes: nodeCrypto.randomBytes,
	  deriveKey,
	  sha256,
	  hashByName,
	  hmacSha256,
	  md5,
	};
	return utilsLegacy;
}

var utilsWebcrypto;
var hasRequiredUtilsWebcrypto;

function requireUtilsWebcrypto () {
	if (hasRequiredUtilsWebcrypto) return utilsWebcrypto;
	hasRequiredUtilsWebcrypto = 1;
	const nodeCrypto = require$$0;

	utilsWebcrypto = {
	  postgresMd5PasswordHash,
	  randomBytes,
	  deriveKey,
	  sha256,
	  hashByName,
	  hmacSha256,
	  md5,
	};

	/**
	 * The Web Crypto API - grabbed from the Node.js library or the global
	 * @type Crypto
	 */
	// eslint-disable-next-line no-undef
	const webCrypto = nodeCrypto.webcrypto || globalThis.crypto;
	/**
	 * The SubtleCrypto API for low level crypto operations.
	 * @type SubtleCrypto
	 */
	const subtleCrypto = webCrypto.subtle;
	const textEncoder = new TextEncoder();

	/**
	 *
	 * @param {*} length
	 * @returns
	 */
	function randomBytes(length) {
	  return webCrypto.getRandomValues(Buffer.alloc(length))
	}

	async function md5(string) {
	  try {
	    return nodeCrypto.createHash('md5').update(string, 'utf-8').digest('hex')
	  } catch (e) {
	    // `createHash()` failed so we are probably not in Node.js, use the WebCrypto API instead.
	    // Note that the MD5 algorithm on WebCrypto is not available in Node.js.
	    // This is why we cannot just use WebCrypto in all environments.
	    const data = typeof string === 'string' ? textEncoder.encode(string) : string;
	    const hash = await subtleCrypto.digest('MD5', data);
	    return Array.from(new Uint8Array(hash))
	      .map((b) => b.toString(16).padStart(2, '0'))
	      .join('')
	  }
	}

	// See AuthenticationMD5Password at https://www.postgresql.org/docs/current/static/protocol-flow.html
	async function postgresMd5PasswordHash(user, password, salt) {
	  const inner = await md5(password + user);
	  const outer = await md5(Buffer.concat([Buffer.from(inner), salt]));
	  return 'md5' + outer
	}

	/**
	 * Create a SHA-256 digest of the given data
	 * @param {Buffer} data
	 */
	async function sha256(text) {
	  return await subtleCrypto.digest('SHA-256', text)
	}

	async function hashByName(hashName, text) {
	  return await subtleCrypto.digest(hashName, text)
	}

	/**
	 * Sign the message with the given key
	 * @param {ArrayBuffer} keyBuffer
	 * @param {string} msg
	 */
	async function hmacSha256(keyBuffer, msg) {
	  const key = await subtleCrypto.importKey('raw', keyBuffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
	  return await subtleCrypto.sign('HMAC', key, textEncoder.encode(msg))
	}

	/**
	 * Derive a key from the password and salt
	 * @param {string} password
	 * @param {Uint8Array} salt
	 * @param {number} iterations
	 */
	async function deriveKey(password, salt, iterations) {
	  const key = await subtleCrypto.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits']);
	  const params = { name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: iterations };
	  return await subtleCrypto.deriveBits(params, key, 32 * 8, ['deriveBits'])
	}
	return utilsWebcrypto;
}

var hasRequiredUtils;

function requireUtils () {
	if (hasRequiredUtils) return utils.exports;
	hasRequiredUtils = 1;

	const useLegacyCrypto = parseInt(process.versions && process.versions.node && process.versions.node.split('.')[0]) < 15;
	if (useLegacyCrypto) {
	  // We are on an old version of Node.js that requires legacy crypto utilities.
	  utils.exports = requireUtilsLegacy();
	} else {
	  utils.exports = requireUtilsWebcrypto();
	}
	return utils.exports;
}

var certSignatures;
var hasRequiredCertSignatures;

function requireCertSignatures () {
	if (hasRequiredCertSignatures) return certSignatures;
	hasRequiredCertSignatures = 1;
	function x509Error(msg, cert) {
	  return new Error('SASL channel binding: ' + msg + ' when parsing public certificate ' + cert.toString('base64'))
	}

	function readASN1Length(data, index) {
	  let length = data[index++];
	  if (length < 0x80) return { length, index }

	  const lengthBytes = length & 0x7f;
	  if (lengthBytes > 4) throw x509Error('bad length', data)

	  length = 0;
	  for (let i = 0; i < lengthBytes; i++) {
	    length = (length << 8) | data[index++];
	  }

	  return { length, index }
	}

	function readASN1OID(data, index) {
	  if (data[index++] !== 0x6) throw x509Error('non-OID data', data) // 6 = OID

	  const { length: OIDLength, index: indexAfterOIDLength } = readASN1Length(data, index);
	  index = indexAfterOIDLength;
	  const lastIndex = index + OIDLength;

	  const byte1 = data[index++];
	  let oid = ((byte1 / 40) >> 0) + '.' + (byte1 % 40);

	  while (index < lastIndex) {
	    // loop over numbers in OID
	    let value = 0;
	    while (index < lastIndex) {
	      // loop over bytes in number
	      const nextByte = data[index++];
	      value = (value << 7) | (nextByte & 0x7f);
	      if (nextByte < 0x80) break
	    }
	    oid += '.' + value;
	  }

	  return { oid, index }
	}

	function expectASN1Seq(data, index) {
	  if (data[index++] !== 0x30) throw x509Error('non-sequence data', data) // 30 = Sequence
	  return readASN1Length(data, index)
	}

	function signatureAlgorithmHashFromCertificate(data, index) {
	  // read this thread: https://www.postgresql.org/message-id/17760-b6c61e752ec07060%40postgresql.org
	  if (index === undefined) index = 0;
	  index = expectASN1Seq(data, index).index;
	  const { length: certInfoLength, index: indexAfterCertInfoLength } = expectASN1Seq(data, index);
	  index = indexAfterCertInfoLength + certInfoLength; // skip over certificate info
	  index = expectASN1Seq(data, index).index; // skip over signature length field
	  const { oid, index: indexAfterOID } = readASN1OID(data, index);
	  switch (oid) {
	    // RSA
	    case '1.2.840.113549.1.1.4':
	      return 'MD5'
	    case '1.2.840.113549.1.1.5':
	      return 'SHA-1'
	    case '1.2.840.113549.1.1.11':
	      return 'SHA-256'
	    case '1.2.840.113549.1.1.12':
	      return 'SHA-384'
	    case '1.2.840.113549.1.1.13':
	      return 'SHA-512'
	    case '1.2.840.113549.1.1.14':
	      return 'SHA-224'
	    case '1.2.840.113549.1.1.15':
	      return 'SHA512-224'
	    case '1.2.840.113549.1.1.16':
	      return 'SHA512-256'
	    // ECDSA
	    case '1.2.840.10045.4.1':
	      return 'SHA-1'
	    case '1.2.840.10045.4.3.1':
	      return 'SHA-224'
	    case '1.2.840.10045.4.3.2':
	      return 'SHA-256'
	    case '1.2.840.10045.4.3.3':
	      return 'SHA-384'
	    case '1.2.840.10045.4.3.4':
	      return 'SHA-512'
	    // RSASSA-PSS: hash is indicated separately
	    case '1.2.840.113549.1.1.10': {
	      index = indexAfterOID;
	      index = expectASN1Seq(data, index).index;
	      if (data[index++] !== 0xa0) throw x509Error('non-tag data', data) // a0 = constructed tag 0
	      index = readASN1Length(data, index).index; // skip over tag length field
	      index = expectASN1Seq(data, index).index; // skip over sequence length field
	      const { oid: hashOID } = readASN1OID(data, index);
	      switch (hashOID) {
	        // standalone hash OIDs
	        case '1.2.840.113549.2.5':
	          return 'MD5'
	        case '1.3.14.3.2.26':
	          return 'SHA-1'
	        case '2.16.840.1.101.3.4.2.1':
	          return 'SHA-256'
	        case '2.16.840.1.101.3.4.2.2':
	          return 'SHA-384'
	        case '2.16.840.1.101.3.4.2.3':
	          return 'SHA-512'
	      }
	      throw x509Error('unknown hash OID ' + hashOID, data)
	    }
	    // Ed25519 -- see https: return//github.com/openssl/openssl/issues/15477
	    case '1.3.101.110':
	    case '1.3.101.112': // ph
	      return 'SHA-512'
	    // Ed448 -- still not in pg 17.2 (if supported, digest would be SHAKE256 x 64 bytes)
	    case '1.3.101.111':
	    case '1.3.101.113': // ph
	      throw x509Error('Ed448 certificate channel binding is not currently supported by Postgres')
	  }
	  throw x509Error('unknown OID ' + oid, data)
	}

	certSignatures = { signatureAlgorithmHashFromCertificate };
	return certSignatures;
}

var sasl;
var hasRequiredSasl;

function requireSasl () {
	if (hasRequiredSasl) return sasl;
	hasRequiredSasl = 1;
	const crypto = requireUtils();
	const { signatureAlgorithmHashFromCertificate } = requireCertSignatures();

	function startSession(mechanisms, stream) {
	  const candidates = ['SCRAM-SHA-256'];
	  if (stream) candidates.unshift('SCRAM-SHA-256-PLUS'); // higher-priority, so placed first

	  const mechanism = candidates.find((candidate) => mechanisms.includes(candidate));

	  if (!mechanism) {
	    throw new Error('SASL: Only mechanism(s) ' + candidates.join(' and ') + ' are supported')
	  }

	  if (mechanism === 'SCRAM-SHA-256-PLUS' && typeof stream.getPeerCertificate !== 'function') {
	    // this should never happen if we are really talking to a Postgres server
	    throw new Error('SASL: Mechanism SCRAM-SHA-256-PLUS requires a certificate')
	  }

	  const clientNonce = crypto.randomBytes(18).toString('base64');
	  const gs2Header = mechanism === 'SCRAM-SHA-256-PLUS' ? 'p=tls-server-end-point' : stream ? 'y' : 'n';

	  return {
	    mechanism,
	    clientNonce,
	    response: gs2Header + ',,n=*,r=' + clientNonce,
	    message: 'SASLInitialResponse',
	  }
	}

	async function continueSession(session, password, serverData, stream) {
	  if (session.message !== 'SASLInitialResponse') {
	    throw new Error('SASL: Last message was not SASLInitialResponse')
	  }
	  if (typeof password !== 'string') {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string')
	  }
	  if (password === '') {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string')
	  }
	  if (typeof serverData !== 'string') {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string')
	  }

	  const sv = parseServerFirstMessage(serverData);

	  if (!sv.nonce.startsWith(session.clientNonce)) {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce')
	  } else if (sv.nonce.length === session.clientNonce.length) {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short')
	  }

	  const clientFirstMessageBare = 'n=*,r=' + session.clientNonce;
	  const serverFirstMessage = 'r=' + sv.nonce + ',s=' + sv.salt + ',i=' + sv.iteration;

	  // without channel binding:
	  let channelBinding = stream ? 'eSws' : 'biws'; // 'y,,' or 'n,,', base64-encoded

	  // override if channel binding is in use:
	  if (session.mechanism === 'SCRAM-SHA-256-PLUS') {
	    const peerCert = stream.getPeerCertificate().raw;
	    let hashName = signatureAlgorithmHashFromCertificate(peerCert);
	    if (hashName === 'MD5' || hashName === 'SHA-1') hashName = 'SHA-256';
	    const certHash = await crypto.hashByName(hashName, peerCert);
	    const bindingData = Buffer.concat([Buffer.from('p=tls-server-end-point,,'), Buffer.from(certHash)]);
	    channelBinding = bindingData.toString('base64');
	  }

	  const clientFinalMessageWithoutProof = 'c=' + channelBinding + ',r=' + sv.nonce;
	  const authMessage = clientFirstMessageBare + ',' + serverFirstMessage + ',' + clientFinalMessageWithoutProof;

	  const saltBytes = Buffer.from(sv.salt, 'base64');
	  const saltedPassword = await crypto.deriveKey(password, saltBytes, sv.iteration);
	  const clientKey = await crypto.hmacSha256(saltedPassword, 'Client Key');
	  const storedKey = await crypto.sha256(clientKey);
	  const clientSignature = await crypto.hmacSha256(storedKey, authMessage);
	  const clientProof = xorBuffers(Buffer.from(clientKey), Buffer.from(clientSignature)).toString('base64');
	  const serverKey = await crypto.hmacSha256(saltedPassword, 'Server Key');
	  const serverSignatureBytes = await crypto.hmacSha256(serverKey, authMessage);

	  session.message = 'SASLResponse';
	  session.serverSignature = Buffer.from(serverSignatureBytes).toString('base64');
	  session.response = clientFinalMessageWithoutProof + ',p=' + clientProof;
	}

	function finalizeSession(session, serverData) {
	  if (session.message !== 'SASLResponse') {
	    throw new Error('SASL: Last message was not SASLResponse')
	  }
	  if (typeof serverData !== 'string') {
	    throw new Error('SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string')
	  }

	  const { serverSignature } = parseServerFinalMessage(serverData);

	  if (serverSignature !== session.serverSignature) {
	    throw new Error('SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match')
	  }
	}

	/**
	 * printable       = %x21-2B / %x2D-7E
	 *                   ;; Printable ASCII except ",".
	 *                   ;; Note that any "printable" is also
	 *                   ;; a valid "value".
	 */
	function isPrintableChars(text) {
	  if (typeof text !== 'string') {
	    throw new TypeError('SASL: text must be a string')
	  }
	  return text
	    .split('')
	    .map((_, i) => text.charCodeAt(i))
	    .every((c) => (c >= 0x21 && c <= 0x2b) || (c >= 0x2d && c <= 0x7e))
	}

	/**
	 * base64-char     = ALPHA / DIGIT / "/" / "+"
	 *
	 * base64-4        = 4base64-char
	 *
	 * base64-3        = 3base64-char "="
	 *
	 * base64-2        = 2base64-char "=="
	 *
	 * base64          = *base64-4 [base64-3 / base64-2]
	 */
	function isBase64(text) {
	  return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(text)
	}

	function parseAttributePairs(text) {
	  if (typeof text !== 'string') {
	    throw new TypeError('SASL: attribute pairs text must be a string')
	  }

	  return new Map(
	    text.split(',').map((attrValue) => {
	      if (!/^.=/.test(attrValue)) {
	        throw new Error('SASL: Invalid attribute pair entry')
	      }
	      const name = attrValue[0];
	      const value = attrValue.substring(2);
	      return [name, value]
	    })
	  )
	}

	function parseServerFirstMessage(data) {
	  const attrPairs = parseAttributePairs(data);

	  const nonce = attrPairs.get('r');
	  if (!nonce) {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing')
	  } else if (!isPrintableChars(nonce)) {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters')
	  }
	  const salt = attrPairs.get('s');
	  if (!salt) {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing')
	  } else if (!isBase64(salt)) {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64')
	  }
	  const iterationText = attrPairs.get('i');
	  if (!iterationText) {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing')
	  } else if (!/^[1-9][0-9]*$/.test(iterationText)) {
	    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count')
	  }
	  const iteration = parseInt(iterationText, 10);

	  return {
	    nonce,
	    salt,
	    iteration,
	  }
	}

	function parseServerFinalMessage(serverData) {
	  const attrPairs = parseAttributePairs(serverData);
	  const serverSignature = attrPairs.get('v');
	  if (!serverSignature) {
	    throw new Error('SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing')
	  } else if (!isBase64(serverSignature)) {
	    throw new Error('SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64')
	  }
	  return {
	    serverSignature,
	  }
	}

	function xorBuffers(a, b) {
	  if (!Buffer.isBuffer(a)) {
	    throw new TypeError('first argument must be a Buffer')
	  }
	  if (!Buffer.isBuffer(b)) {
	    throw new TypeError('second argument must be a Buffer')
	  }
	  if (a.length !== b.length) {
	    throw new Error('Buffer lengths must match')
	  }
	  if (a.length === 0) {
	    throw new Error('Buffers cannot be empty')
	  }
	  return Buffer.from(a.map((_, i) => a[i] ^ b[i]))
	}

	sasl = {
	  startSession,
	  continueSession,
	  finalizeSession,
	};
	return sasl;
}

var typeOverrides;
var hasRequiredTypeOverrides;

function requireTypeOverrides () {
	if (hasRequiredTypeOverrides) return typeOverrides;
	hasRequiredTypeOverrides = 1;

	const types = requirePgTypes();

	function TypeOverrides(userTypes) {
	  this._types = userTypes || types;
	  this.text = {};
	  this.binary = {};
	}

	TypeOverrides.prototype.getOverrides = function (format) {
	  switch (format) {
	    case 'text':
	      return this.text
	    case 'binary':
	      return this.binary
	    default:
	      return {}
	  }
	};

	TypeOverrides.prototype.setTypeParser = function (oid, format, parseFn) {
	  if (typeof format === 'function') {
	    parseFn = format;
	    format = 'text';
	  }
	  this.getOverrides(format)[oid] = parseFn;
	};

	TypeOverrides.prototype.getTypeParser = function (oid, format) {
	  format = format || 'text';
	  return this.getOverrides(format)[oid] || this._types.getTypeParser(oid, format)
	};

	typeOverrides = TypeOverrides;
	return typeOverrides;
}

var pgConnectionString;
var hasRequiredPgConnectionString;

function requirePgConnectionString () {
	if (hasRequiredPgConnectionString) return pgConnectionString;
	hasRequiredPgConnectionString = 1;

	//Parse method copied from https://github.com/brianc/node-postgres
	//Copyright (c) 2010-2014 Brian Carlson (brian.m.carlson@gmail.com)
	//MIT License

	//parses a connection string
	function parse(str, options = {}) {
	  //unix socket
	  if (str.charAt(0) === '/') {
	    const config = str.split(' ');
	    return { host: config[0], database: config[1] }
	  }

	  // Check for empty host in URL

	  const config = {};
	  let result;
	  let dummyHost = false;
	  if (/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str)) {
	    // Ensure spaces are encoded as %20
	    str = encodeURI(str).replace(/%25(\d\d)/g, '%$1');
	  }

	  try {
	    try {
	      result = new URL(str, 'postgres://base');
	    } catch (e) {
	      // The URL is invalid so try again with a dummy host
	      result = new URL(str.replace('@/', '@___DUMMY___/'), 'postgres://base');
	      dummyHost = true;
	    }
	  } catch (err) {
	    // Remove the input from the error message to avoid leaking sensitive information
	    err.input && (err.input = '*****REDACTED*****');
	    throw err
	  }

	  // We'd like to use Object.fromEntries() here but Node.js 10 does not support it
	  for (const entry of result.searchParams.entries()) {
	    config[entry[0]] = entry[1];
	  }

	  config.user = config.user || decodeURIComponent(result.username);
	  config.password = config.password || decodeURIComponent(result.password);

	  if (result.protocol == 'socket:') {
	    config.host = decodeURI(result.pathname);
	    config.database = result.searchParams.get('db');
	    config.client_encoding = result.searchParams.get('encoding');
	    return config
	  }
	  const hostname = dummyHost ? '' : result.hostname;
	  if (!config.host) {
	    // Only set the host if there is no equivalent query param.
	    config.host = decodeURIComponent(hostname);
	  } else if (hostname && /^%2f/i.test(hostname)) {
	    // Only prepend the hostname to the pathname if it is not a URL encoded Unix socket host.
	    result.pathname = hostname + result.pathname;
	  }
	  if (!config.port) {
	    // Only set the port if there is no equivalent query param.
	    config.port = result.port;
	  }

	  const pathname = result.pathname.slice(1) || null;
	  config.database = pathname ? decodeURI(pathname) : null;

	  if (config.ssl === 'true' || config.ssl === '1') {
	    config.ssl = true;
	  }

	  if (config.ssl === '0') {
	    config.ssl = false;
	  }

	  if (config.sslcert || config.sslkey || config.sslrootcert || config.sslmode) {
	    config.ssl = {};
	  }

	  // Only try to load fs if we expect to read from the disk
	  const fs = config.sslcert || config.sslkey || config.sslrootcert ? require$$0$1 : null;

	  if (config.sslcert) {
	    config.ssl.cert = fs.readFileSync(config.sslcert).toString();
	  }

	  if (config.sslkey) {
	    config.ssl.key = fs.readFileSync(config.sslkey).toString();
	  }

	  if (config.sslrootcert) {
	    config.ssl.ca = fs.readFileSync(config.sslrootcert).toString();
	  }

	  if (options.useLibpqCompat && config.uselibpqcompat) {
	    throw new Error('Both useLibpqCompat and uselibpqcompat are set. Please use only one of them.')
	  }

	  if (config.uselibpqcompat === 'true' || options.useLibpqCompat) {
	    switch (config.sslmode) {
	      case 'disable': {
	        config.ssl = false;
	        break
	      }
	      case 'prefer': {
	        config.ssl.rejectUnauthorized = false;
	        break
	      }
	      case 'require': {
	        if (config.sslrootcert) {
	          // If a root CA is specified, behavior of `sslmode=require` will be the same as that of `verify-ca`
	          config.ssl.checkServerIdentity = function () {};
	        } else {
	          config.ssl.rejectUnauthorized = false;
	        }
	        break
	      }
	      case 'verify-ca': {
	        if (!config.ssl.ca) {
	          throw new Error(
	            'SECURITY WARNING: Using sslmode=verify-ca requires specifying a CA with sslrootcert. If a public CA is used, verify-ca allows connections to a server that somebody else may have registered with the CA, making you vulnerable to Man-in-the-Middle attacks. Either specify a custom CA certificate with sslrootcert parameter or use sslmode=verify-full for proper security.'
	          )
	        }
	        config.ssl.checkServerIdentity = function () {};
	        break
	      }
	    }
	  } else {
	    switch (config.sslmode) {
	      case 'disable': {
	        config.ssl = false;
	        break
	      }
	      case 'prefer':
	      case 'require':
	      case 'verify-ca':
	      case 'verify-full': {
	        if (config.sslmode !== 'verify-full') {
	          deprecatedSslModeWarning(config.sslmode);
	        }
	        break
	      }
	      case 'no-verify': {
	        config.ssl.rejectUnauthorized = false;
	        break
	      }
	    }
	  }

	  return config
	}

	// convert pg-connection-string ssl config to a ClientConfig.ConnectionOptions
	function toConnectionOptions(sslConfig) {
	  const connectionOptions = Object.entries(sslConfig).reduce((c, [key, value]) => {
	    // we explicitly check for undefined and null instead of `if (value)` because some
	    // options accept falsy values. Example: `ssl.rejectUnauthorized = false`
	    if (value !== undefined && value !== null) {
	      c[key] = value;
	    }

	    return c
	  }, {});

	  return connectionOptions
	}

	// convert pg-connection-string config to a ClientConfig
	function toClientConfig(config) {
	  const poolConfig = Object.entries(config).reduce((c, [key, value]) => {
	    if (key === 'ssl') {
	      const sslConfig = value;

	      if (typeof sslConfig === 'boolean') {
	        c[key] = sslConfig;
	      }

	      if (typeof sslConfig === 'object') {
	        c[key] = toConnectionOptions(sslConfig);
	      }
	    } else if (value !== undefined && value !== null) {
	      if (key === 'port') {
	        // when port is not specified, it is converted into an empty string
	        // we want to avoid NaN or empty string as a values in ClientConfig
	        if (value !== '') {
	          const v = parseInt(value, 10);
	          if (isNaN(v)) {
	            throw new Error(`Invalid ${key}: ${value}`)
	          }

	          c[key] = v;
	        }
	      } else {
	        c[key] = value;
	      }
	    }

	    return c
	  }, {});

	  return poolConfig
	}

	// parses a connection string into ClientConfig
	function parseIntoClientConfig(str) {
	  return toClientConfig(parse(str))
	}

	function deprecatedSslModeWarning(sslmode) {
	  if (!deprecatedSslModeWarning.warned && typeof process !== 'undefined' && process.emitWarning) {
	    deprecatedSslModeWarning.warned = true;
	    process.emitWarning(`SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=${sslmode}'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.`);
	  }
	}

	pgConnectionString = parse;

	parse.parse = parse;
	parse.toClientConfig = toClientConfig;
	parse.parseIntoClientConfig = parseIntoClientConfig;
	return pgConnectionString;
}

var connectionParameters;
var hasRequiredConnectionParameters;

function requireConnectionParameters () {
	if (hasRequiredConnectionParameters) return connectionParameters;
	hasRequiredConnectionParameters = 1;

	const dns = require$$0$2;

	const defaults = requireDefaults();

	const parse = requirePgConnectionString().parse; // parses a connection string

	const val = function (key, config, envVar) {
	  if (config[key]) {
	    return config[key]
	  }

	  if (envVar === undefined) {
	    envVar = process.env['PG' + key.toUpperCase()];
	  } else if (envVar === false) ; else {
	    envVar = process.env[envVar];
	  }

	  return envVar || defaults[key]
	};

	const readSSLConfigFromEnvironment = function () {
	  switch (process.env.PGSSLMODE) {
	    case 'disable':
	      return false
	    case 'prefer':
	    case 'require':
	    case 'verify-ca':
	    case 'verify-full':
	      return true
	    case 'no-verify':
	      return { rejectUnauthorized: false }
	  }
	  return defaults.ssl
	};

	// Convert arg to a string, surround in single quotes, and escape single quotes and backslashes
	const quoteParamValue = function (value) {
	  return "'" + ('' + value).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"
	};

	const add = function (params, config, paramName) {
	  const value = config[paramName];
	  if (value !== undefined && value !== null) {
	    params.push(paramName + '=' + quoteParamValue(value));
	  }
	};

	class ConnectionParameters {
	  constructor(config) {
	    // if a string is passed, it is a raw connection string so we parse it into a config
	    config = typeof config === 'string' ? parse(config) : config || {};

	    // if the config has a connectionString defined, parse IT into the config we use
	    // this will override other default values with what is stored in connectionString
	    if (config.connectionString) {
	      config = Object.assign({}, config, parse(config.connectionString));
	    }

	    this.user = val('user', config);
	    this.database = val('database', config);

	    if (this.database === undefined) {
	      this.database = this.user;
	    }

	    this.port = parseInt(val('port', config), 10);
	    this.host = val('host', config);

	    // "hiding" the password so it doesn't show up in stack traces
	    // or if the client is console.logged
	    Object.defineProperty(this, 'password', {
	      configurable: true,
	      enumerable: false,
	      writable: true,
	      value: val('password', config),
	    });

	    this.binary = val('binary', config);
	    this.options = val('options', config);

	    this.ssl = typeof config.ssl === 'undefined' ? readSSLConfigFromEnvironment() : config.ssl;

	    if (typeof this.ssl === 'string') {
	      if (this.ssl === 'true') {
	        this.ssl = true;
	      }
	    }
	    // support passing in ssl=no-verify via connection string
	    if (this.ssl === 'no-verify') {
	      this.ssl = { rejectUnauthorized: false };
	    }
	    if (this.ssl && this.ssl.key) {
	      Object.defineProperty(this.ssl, 'key', {
	        enumerable: false,
	      });
	    }

	    this.client_encoding = val('client_encoding', config);
	    this.replication = val('replication', config);
	    // a domain socket begins with '/'
	    this.isDomainSocket = !(this.host || '').indexOf('/');

	    this.application_name = val('application_name', config, 'PGAPPNAME');
	    this.fallback_application_name = val('fallback_application_name', config, false);
	    this.statement_timeout = val('statement_timeout', config, false);
	    this.lock_timeout = val('lock_timeout', config, false);
	    this.idle_in_transaction_session_timeout = val('idle_in_transaction_session_timeout', config, false);
	    this.query_timeout = val('query_timeout', config, false);

	    if (config.connectionTimeoutMillis === undefined) {
	      this.connect_timeout = process.env.PGCONNECT_TIMEOUT || 0;
	    } else {
	      this.connect_timeout = Math.floor(config.connectionTimeoutMillis / 1000);
	    }

	    if (config.keepAlive === false) {
	      this.keepalives = 0;
	    } else if (config.keepAlive === true) {
	      this.keepalives = 1;
	    }

	    if (typeof config.keepAliveInitialDelayMillis === 'number') {
	      this.keepalives_idle = Math.floor(config.keepAliveInitialDelayMillis / 1000);
	    }
	  }

	  getLibpqConnectionString(cb) {
	    const params = [];
	    add(params, this, 'user');
	    add(params, this, 'password');
	    add(params, this, 'port');
	    add(params, this, 'application_name');
	    add(params, this, 'fallback_application_name');
	    add(params, this, 'connect_timeout');
	    add(params, this, 'options');

	    const ssl = typeof this.ssl === 'object' ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
	    add(params, ssl, 'sslmode');
	    add(params, ssl, 'sslca');
	    add(params, ssl, 'sslkey');
	    add(params, ssl, 'sslcert');
	    add(params, ssl, 'sslrootcert');

	    if (this.database) {
	      params.push('dbname=' + quoteParamValue(this.database));
	    }
	    if (this.replication) {
	      params.push('replication=' + quoteParamValue(this.replication));
	    }
	    if (this.host) {
	      params.push('host=' + quoteParamValue(this.host));
	    }
	    if (this.isDomainSocket) {
	      return cb(null, params.join(' '))
	    }
	    if (this.client_encoding) {
	      params.push('client_encoding=' + quoteParamValue(this.client_encoding));
	    }
	    dns.lookup(this.host, function (err, address) {
	      if (err) return cb(err, null)
	      params.push('hostaddr=' + quoteParamValue(address));
	      return cb(null, params.join(' '))
	    });
	  }
	}

	connectionParameters = ConnectionParameters;
	return connectionParameters;
}

var result;
var hasRequiredResult;

function requireResult () {
	if (hasRequiredResult) return result;
	hasRequiredResult = 1;

	const types = requirePgTypes();

	const matchRegexp = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/;

	// result object returned from query
	// in the 'end' event and also
	// passed as second argument to provided callback
	class Result {
	  constructor(rowMode, types) {
	    this.command = null;
	    this.rowCount = null;
	    this.oid = null;
	    this.rows = [];
	    this.fields = [];
	    this._parsers = undefined;
	    this._types = types;
	    this.RowCtor = null;
	    this.rowAsArray = rowMode === 'array';
	    if (this.rowAsArray) {
	      this.parseRow = this._parseRowAsArray;
	    }
	    this._prebuiltEmptyResultObject = null;
	  }

	  // adds a command complete message
	  addCommandComplete(msg) {
	    let match;
	    if (msg.text) {
	      // pure javascript
	      match = matchRegexp.exec(msg.text);
	    } else {
	      // native bindings
	      match = matchRegexp.exec(msg.command);
	    }
	    if (match) {
	      this.command = match[1];
	      if (match[3]) {
	        // COMMAND OID ROWS
	        this.oid = parseInt(match[2], 10);
	        this.rowCount = parseInt(match[3], 10);
	      } else if (match[2]) {
	        // COMMAND ROWS
	        this.rowCount = parseInt(match[2], 10);
	      }
	    }
	  }

	  _parseRowAsArray(rowData) {
	    const row = new Array(rowData.length);
	    for (let i = 0, len = rowData.length; i < len; i++) {
	      const rawValue = rowData[i];
	      if (rawValue !== null) {
	        row[i] = this._parsers[i](rawValue);
	      } else {
	        row[i] = null;
	      }
	    }
	    return row
	  }

	  parseRow(rowData) {
	    const row = { ...this._prebuiltEmptyResultObject };
	    for (let i = 0, len = rowData.length; i < len; i++) {
	      const rawValue = rowData[i];
	      const field = this.fields[i].name;
	      if (rawValue !== null) {
	        const v = this.fields[i].format === 'binary' ? Buffer.from(rawValue) : rawValue;
	        row[field] = this._parsers[i](v);
	      } else {
	        row[field] = null;
	      }
	    }
	    return row
	  }

	  addRow(row) {
	    this.rows.push(row);
	  }

	  addFields(fieldDescriptions) {
	    // clears field definitions
	    // multiple query statements in 1 action can result in multiple sets
	    // of rowDescriptions...eg: 'select NOW(); select 1::int;'
	    // you need to reset the fields
	    this.fields = fieldDescriptions;
	    if (this.fields.length) {
	      this._parsers = new Array(fieldDescriptions.length);
	    }

	    const row = {};

	    for (let i = 0; i < fieldDescriptions.length; i++) {
	      const desc = fieldDescriptions[i];
	      row[desc.name] = null;

	      if (this._types) {
	        this._parsers[i] = this._types.getTypeParser(desc.dataTypeID, desc.format || 'text');
	      } else {
	        this._parsers[i] = types.getTypeParser(desc.dataTypeID, desc.format || 'text');
	      }
	    }

	    this._prebuiltEmptyResultObject = { ...row };
	  }
	}

	result = Result;
	return result;
}

var query$1;
var hasRequiredQuery$1;

function requireQuery$1 () {
	if (hasRequiredQuery$1) return query$1;
	hasRequiredQuery$1 = 1;

	const { EventEmitter } = require$$0$3;

	const Result = requireResult();
	const utils = requireUtils$1();

	class Query extends EventEmitter {
	  constructor(config, values, callback) {
	    super();

	    config = utils.normalizeQueryConfig(config, values, callback);

	    this.text = config.text;
	    this.values = config.values;
	    this.rows = config.rows;
	    this.types = config.types;
	    this.name = config.name;
	    this.queryMode = config.queryMode;
	    this.binary = config.binary;
	    // use unique portal name each time
	    this.portal = config.portal || '';
	    this.callback = config.callback;
	    this._rowMode = config.rowMode;
	    if (process.domain && config.callback) {
	      this.callback = process.domain.bind(config.callback);
	    }
	    this._result = new Result(this._rowMode, this.types);

	    // potential for multiple results
	    this._results = this._result;
	    this._canceledDueToError = false;
	  }

	  requiresPreparation() {
	    if (this.queryMode === 'extended') {
	      return true
	    }

	    // named queries must always be prepared
	    if (this.name) {
	      return true
	    }
	    // always prepare if there are max number of rows expected per
	    // portal execution
	    if (this.rows) {
	      return true
	    }
	    // don't prepare empty text queries
	    if (!this.text) {
	      return false
	    }
	    // prepare if there are values
	    if (!this.values) {
	      return false
	    }
	    return this.values.length > 0
	  }

	  _checkForMultirow() {
	    // if we already have a result with a command property
	    // then we've already executed one query in a multi-statement simple query
	    // turn our results into an array of results
	    if (this._result.command) {
	      if (!Array.isArray(this._results)) {
	        this._results = [this._result];
	      }
	      this._result = new Result(this._rowMode, this._result._types);
	      this._results.push(this._result);
	    }
	  }

	  // associates row metadata from the supplied
	  // message with this query object
	  // metadata used when parsing row results
	  handleRowDescription(msg) {
	    this._checkForMultirow();
	    this._result.addFields(msg.fields);
	    this._accumulateRows = this.callback || !this.listeners('row').length;
	  }

	  handleDataRow(msg) {
	    let row;

	    if (this._canceledDueToError) {
	      return
	    }

	    try {
	      row = this._result.parseRow(msg.fields);
	    } catch (err) {
	      this._canceledDueToError = err;
	      return
	    }

	    this.emit('row', row, this._result);
	    if (this._accumulateRows) {
	      this._result.addRow(row);
	    }
	  }

	  handleCommandComplete(msg, connection) {
	    this._checkForMultirow();
	    this._result.addCommandComplete(msg);
	    // need to sync after each command complete of a prepared statement
	    // if we were using a row count which results in multiple calls to _getRows
	    if (this.rows) {
	      connection.sync();
	    }
	  }

	  // if a named prepared statement is created with empty query text
	  // the backend will send an emptyQuery message but *not* a command complete message
	  // since we pipeline sync immediately after execute we don't need to do anything here
	  // unless we have rows specified, in which case we did not pipeline the initial sync call
	  handleEmptyQuery(connection) {
	    if (this.rows) {
	      connection.sync();
	    }
	  }

	  handleError(err, connection) {
	    // need to sync after error during a prepared statement
	    if (this._canceledDueToError) {
	      err = this._canceledDueToError;
	      this._canceledDueToError = false;
	    }
	    // if callback supplied do not emit error event as uncaught error
	    // events will bubble up to node process
	    if (this.callback) {
	      return this.callback(err)
	    }
	    this.emit('error', err);
	  }

	  handleReadyForQuery(con) {
	    if (this._canceledDueToError) {
	      return this.handleError(this._canceledDueToError, con)
	    }
	    if (this.callback) {
	      try {
	        this.callback(null, this._results);
	      } catch (err) {
	        process.nextTick(() => {
	          throw err
	        });
	      }
	    }
	    this.emit('end', this._results);
	  }

	  submit(connection) {
	    if (typeof this.text !== 'string' && typeof this.name !== 'string') {
	      return new Error('A query must have either text or a name. Supplying neither is unsupported.')
	    }
	    const previous = connection.parsedStatements[this.name];
	    if (this.text && previous && this.text !== previous) {
	      return new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`)
	    }
	    if (this.values && !Array.isArray(this.values)) {
	      return new Error('Query values must be an array')
	    }
	    if (this.requiresPreparation()) {
	      // If we're using the extended query protocol we fire off several separate commands
	      // to the backend. On some versions of node & some operating system versions
	      // the network stack writes each message separately instead of buffering them together
	      // causing the client & network to send more slowly. Corking & uncorking the stream
	      // allows node to buffer up the messages internally before sending them all off at once.
	      // note: we're checking for existence of cork/uncork because some versions of streams
	      // might not have this (cloudflare?)
	      connection.stream.cork && connection.stream.cork();
	      try {
	        this.prepare(connection);
	      } finally {
	        // while unlikely for this.prepare to throw, if it does & we don't uncork this stream
	        // this client becomes unresponsive, so put in finally block "just in case"
	        connection.stream.uncork && connection.stream.uncork();
	      }
	    } else {
	      connection.query(this.text);
	    }
	    return null
	  }

	  hasBeenParsed(connection) {
	    return this.name && connection.parsedStatements[this.name]
	  }

	  handlePortalSuspended(connection) {
	    this._getRows(connection, this.rows);
	  }

	  _getRows(connection, rows) {
	    connection.execute({
	      portal: this.portal,
	      rows: rows,
	    });
	    // if we're not reading pages of rows send the sync command
	    // to indicate the pipeline is finished
	    if (!rows) {
	      connection.sync();
	    } else {
	      // otherwise flush the call out to read more rows
	      connection.flush();
	    }
	  }

	  // http://developer.postgresql.org/pgdocs/postgres/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY
	  prepare(connection) {
	    // TODO refactor this poor encapsulation
	    if (!this.hasBeenParsed(connection)) {
	      connection.parse({
	        text: this.text,
	        name: this.name,
	        types: this.types,
	      });
	    }

	    // because we're mapping user supplied values to
	    // postgres wire protocol compatible values it could
	    // throw an exception, so try/catch this section
	    try {
	      connection.bind({
	        portal: this.portal,
	        statement: this.name,
	        values: this.values,
	        binary: this.binary,
	        valueMapper: utils.prepareValue,
	      });
	    } catch (err) {
	      this.handleError(err, connection);
	      return
	    }

	    connection.describe({
	      type: 'P',
	      name: this.portal || '',
	    });

	    this._getRows(connection, this.rows);
	  }

	  handleCopyInResponse(connection) {
	    connection.sendCopyFail('No source stream defined');
	  }

	  handleCopyData(msg, connection) {
	    // noop
	  }
	}

	query$1 = Query;
	return query$1;
}

var dist = {};

var messages = {};

var hasRequiredMessages;

function requireMessages () {
	if (hasRequiredMessages) return messages;
	hasRequiredMessages = 1;
	Object.defineProperty(messages, "__esModule", { value: true });
	messages.NoticeMessage = messages.DataRowMessage = messages.CommandCompleteMessage = messages.ReadyForQueryMessage = messages.NotificationResponseMessage = messages.BackendKeyDataMessage = messages.AuthenticationMD5Password = messages.ParameterStatusMessage = messages.ParameterDescriptionMessage = messages.RowDescriptionMessage = messages.Field = messages.CopyResponse = messages.CopyDataMessage = messages.DatabaseError = messages.copyDone = messages.emptyQuery = messages.replicationStart = messages.portalSuspended = messages.noData = messages.closeComplete = messages.bindComplete = messages.parseComplete = void 0;
	messages.parseComplete = {
	    name: 'parseComplete',
	    length: 5,
	};
	messages.bindComplete = {
	    name: 'bindComplete',
	    length: 5,
	};
	messages.closeComplete = {
	    name: 'closeComplete',
	    length: 5,
	};
	messages.noData = {
	    name: 'noData',
	    length: 5,
	};
	messages.portalSuspended = {
	    name: 'portalSuspended',
	    length: 5,
	};
	messages.replicationStart = {
	    name: 'replicationStart',
	    length: 4,
	};
	messages.emptyQuery = {
	    name: 'emptyQuery',
	    length: 4,
	};
	messages.copyDone = {
	    name: 'copyDone',
	    length: 4,
	};
	class DatabaseError extends Error {
	    constructor(message, length, name) {
	        super(message);
	        this.length = length;
	        this.name = name;
	    }
	}
	messages.DatabaseError = DatabaseError;
	class CopyDataMessage {
	    constructor(length, chunk) {
	        this.length = length;
	        this.chunk = chunk;
	        this.name = 'copyData';
	    }
	}
	messages.CopyDataMessage = CopyDataMessage;
	class CopyResponse {
	    constructor(length, name, binary, columnCount) {
	        this.length = length;
	        this.name = name;
	        this.binary = binary;
	        this.columnTypes = new Array(columnCount);
	    }
	}
	messages.CopyResponse = CopyResponse;
	class Field {
	    constructor(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, format) {
	        this.name = name;
	        this.tableID = tableID;
	        this.columnID = columnID;
	        this.dataTypeID = dataTypeID;
	        this.dataTypeSize = dataTypeSize;
	        this.dataTypeModifier = dataTypeModifier;
	        this.format = format;
	    }
	}
	messages.Field = Field;
	class RowDescriptionMessage {
	    constructor(length, fieldCount) {
	        this.length = length;
	        this.fieldCount = fieldCount;
	        this.name = 'rowDescription';
	        this.fields = new Array(this.fieldCount);
	    }
	}
	messages.RowDescriptionMessage = RowDescriptionMessage;
	class ParameterDescriptionMessage {
	    constructor(length, parameterCount) {
	        this.length = length;
	        this.parameterCount = parameterCount;
	        this.name = 'parameterDescription';
	        this.dataTypeIDs = new Array(this.parameterCount);
	    }
	}
	messages.ParameterDescriptionMessage = ParameterDescriptionMessage;
	class ParameterStatusMessage {
	    constructor(length, parameterName, parameterValue) {
	        this.length = length;
	        this.parameterName = parameterName;
	        this.parameterValue = parameterValue;
	        this.name = 'parameterStatus';
	    }
	}
	messages.ParameterStatusMessage = ParameterStatusMessage;
	class AuthenticationMD5Password {
	    constructor(length, salt) {
	        this.length = length;
	        this.salt = salt;
	        this.name = 'authenticationMD5Password';
	    }
	}
	messages.AuthenticationMD5Password = AuthenticationMD5Password;
	class BackendKeyDataMessage {
	    constructor(length, processID, secretKey) {
	        this.length = length;
	        this.processID = processID;
	        this.secretKey = secretKey;
	        this.name = 'backendKeyData';
	    }
	}
	messages.BackendKeyDataMessage = BackendKeyDataMessage;
	class NotificationResponseMessage {
	    constructor(length, processId, channel, payload) {
	        this.length = length;
	        this.processId = processId;
	        this.channel = channel;
	        this.payload = payload;
	        this.name = 'notification';
	    }
	}
	messages.NotificationResponseMessage = NotificationResponseMessage;
	class ReadyForQueryMessage {
	    constructor(length, status) {
	        this.length = length;
	        this.status = status;
	        this.name = 'readyForQuery';
	    }
	}
	messages.ReadyForQueryMessage = ReadyForQueryMessage;
	class CommandCompleteMessage {
	    constructor(length, text) {
	        this.length = length;
	        this.text = text;
	        this.name = 'commandComplete';
	    }
	}
	messages.CommandCompleteMessage = CommandCompleteMessage;
	class DataRowMessage {
	    constructor(length, fields) {
	        this.length = length;
	        this.fields = fields;
	        this.name = 'dataRow';
	        this.fieldCount = fields.length;
	    }
	}
	messages.DataRowMessage = DataRowMessage;
	class NoticeMessage {
	    constructor(length, message) {
	        this.length = length;
	        this.message = message;
	        this.name = 'notice';
	    }
	}
	messages.NoticeMessage = NoticeMessage;
	
	return messages;
}

var serializer = {};

var bufferWriter = {};

var hasRequiredBufferWriter;

function requireBufferWriter () {
	if (hasRequiredBufferWriter) return bufferWriter;
	hasRequiredBufferWriter = 1;
	//binary data writer tuned for encoding binary specific to the postgres binary protocol
	Object.defineProperty(bufferWriter, "__esModule", { value: true });
	bufferWriter.Writer = void 0;
	class Writer {
	    constructor(size = 256) {
	        this.size = size;
	        this.offset = 5;
	        this.headerPosition = 0;
	        this.buffer = Buffer.allocUnsafe(size);
	    }
	    ensure(size) {
	        const remaining = this.buffer.length - this.offset;
	        if (remaining < size) {
	            const oldBuffer = this.buffer;
	            // exponential growth factor of around ~ 1.5
	            // https://stackoverflow.com/questions/2269063/buffer-growth-strategy
	            const newSize = oldBuffer.length + (oldBuffer.length >> 1) + size;
	            this.buffer = Buffer.allocUnsafe(newSize);
	            oldBuffer.copy(this.buffer);
	        }
	    }
	    addInt32(num) {
	        this.ensure(4);
	        this.buffer[this.offset++] = (num >>> 24) & 0xff;
	        this.buffer[this.offset++] = (num >>> 16) & 0xff;
	        this.buffer[this.offset++] = (num >>> 8) & 0xff;
	        this.buffer[this.offset++] = (num >>> 0) & 0xff;
	        return this;
	    }
	    addInt16(num) {
	        this.ensure(2);
	        this.buffer[this.offset++] = (num >>> 8) & 0xff;
	        this.buffer[this.offset++] = (num >>> 0) & 0xff;
	        return this;
	    }
	    addCString(string) {
	        if (!string) {
	            this.ensure(1);
	        }
	        else {
	            const len = Buffer.byteLength(string);
	            this.ensure(len + 1); // +1 for null terminator
	            this.buffer.write(string, this.offset, 'utf-8');
	            this.offset += len;
	        }
	        this.buffer[this.offset++] = 0; // null terminator
	        return this;
	    }
	    addString(string = '') {
	        const len = Buffer.byteLength(string);
	        this.ensure(len);
	        this.buffer.write(string, this.offset);
	        this.offset += len;
	        return this;
	    }
	    add(otherBuffer) {
	        this.ensure(otherBuffer.length);
	        otherBuffer.copy(this.buffer, this.offset);
	        this.offset += otherBuffer.length;
	        return this;
	    }
	    join(code) {
	        if (code) {
	            this.buffer[this.headerPosition] = code;
	            //length is everything in this packet minus the code
	            const length = this.offset - (this.headerPosition + 1);
	            this.buffer.writeInt32BE(length, this.headerPosition + 1);
	        }
	        return this.buffer.slice(code ? 0 : 5, this.offset);
	    }
	    flush(code) {
	        const result = this.join(code);
	        this.offset = 5;
	        this.headerPosition = 0;
	        this.buffer = Buffer.allocUnsafe(this.size);
	        return result;
	    }
	}
	bufferWriter.Writer = Writer;
	
	return bufferWriter;
}

var hasRequiredSerializer;

function requireSerializer () {
	if (hasRequiredSerializer) return serializer;
	hasRequiredSerializer = 1;
	Object.defineProperty(serializer, "__esModule", { value: true });
	serializer.serialize = void 0;
	const buffer_writer_1 = requireBufferWriter();
	const writer = new buffer_writer_1.Writer();
	const startup = (opts) => {
	    // protocol version
	    writer.addInt16(3).addInt16(0);
	    for (const key of Object.keys(opts)) {
	        writer.addCString(key).addCString(opts[key]);
	    }
	    writer.addCString('client_encoding').addCString('UTF8');
	    const bodyBuffer = writer.addCString('').flush();
	    // this message is sent without a code
	    const length = bodyBuffer.length + 4;
	    return new buffer_writer_1.Writer().addInt32(length).add(bodyBuffer).flush();
	};
	const requestSsl = () => {
	    const response = Buffer.allocUnsafe(8);
	    response.writeInt32BE(8, 0);
	    response.writeInt32BE(80877103, 4);
	    return response;
	};
	const password = (password) => {
	    return writer.addCString(password).flush(112 /* code.startup */);
	};
	const sendSASLInitialResponseMessage = function (mechanism, initialResponse) {
	    // 0x70 = 'p'
	    writer.addCString(mechanism).addInt32(Buffer.byteLength(initialResponse)).addString(initialResponse);
	    return writer.flush(112 /* code.startup */);
	};
	const sendSCRAMClientFinalMessage = function (additionalData) {
	    return writer.addString(additionalData).flush(112 /* code.startup */);
	};
	const query = (text) => {
	    return writer.addCString(text).flush(81 /* code.query */);
	};
	const emptyArray = [];
	const parse = (query) => {
	    // expect something like this:
	    // { name: 'queryName',
	    //   text: 'select * from blah',
	    //   types: ['int8', 'bool'] }
	    // normalize missing query names to allow for null
	    const name = query.name || '';
	    if (name.length > 63) {
	        console.error('Warning! Postgres only supports 63 characters for query names.');
	        console.error('You supplied %s (%s)', name, name.length);
	        console.error('This can cause conflicts and silent errors executing queries');
	    }
	    const types = query.types || emptyArray;
	    const len = types.length;
	    const buffer = writer
	        .addCString(name) // name of query
	        .addCString(query.text) // actual query text
	        .addInt16(len);
	    for (let i = 0; i < len; i++) {
	        buffer.addInt32(types[i]);
	    }
	    return writer.flush(80 /* code.parse */);
	};
	const paramWriter = new buffer_writer_1.Writer();
	const writeValues = function (values, valueMapper) {
	    for (let i = 0; i < values.length; i++) {
	        const mappedVal = valueMapper ? valueMapper(values[i], i) : values[i];
	        if (mappedVal == null) {
	            // add the param type (string) to the writer
	            writer.addInt16(0 /* ParamType.STRING */);
	            // write -1 to the param writer to indicate null
	            paramWriter.addInt32(-1);
	        }
	        else if (mappedVal instanceof Buffer) {
	            // add the param type (binary) to the writer
	            writer.addInt16(1 /* ParamType.BINARY */);
	            // add the buffer to the param writer
	            paramWriter.addInt32(mappedVal.length);
	            paramWriter.add(mappedVal);
	        }
	        else {
	            // add the param type (string) to the writer
	            writer.addInt16(0 /* ParamType.STRING */);
	            paramWriter.addInt32(Buffer.byteLength(mappedVal));
	            paramWriter.addString(mappedVal);
	        }
	    }
	};
	const bind = (config = {}) => {
	    // normalize config
	    const portal = config.portal || '';
	    const statement = config.statement || '';
	    const binary = config.binary || false;
	    const values = config.values || emptyArray;
	    const len = values.length;
	    writer.addCString(portal).addCString(statement);
	    writer.addInt16(len);
	    writeValues(values, config.valueMapper);
	    writer.addInt16(len);
	    writer.add(paramWriter.flush());
	    // all results use the same format code
	    writer.addInt16(1);
	    // format code
	    writer.addInt16(binary ? 1 /* ParamType.BINARY */ : 0 /* ParamType.STRING */);
	    return writer.flush(66 /* code.bind */);
	};
	const emptyExecute = Buffer.from([69 /* code.execute */, 0x00, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00]);
	const execute = (config) => {
	    // this is the happy path for most queries
	    if (!config || (!config.portal && !config.rows)) {
	        return emptyExecute;
	    }
	    const portal = config.portal || '';
	    const rows = config.rows || 0;
	    const portalLength = Buffer.byteLength(portal);
	    const len = 4 + portalLength + 1 + 4;
	    // one extra bit for code
	    const buff = Buffer.allocUnsafe(1 + len);
	    buff[0] = 69 /* code.execute */;
	    buff.writeInt32BE(len, 1);
	    buff.write(portal, 5, 'utf-8');
	    buff[portalLength + 5] = 0; // null terminate portal cString
	    buff.writeUInt32BE(rows, buff.length - 4);
	    return buff;
	};
	const cancel = (processID, secretKey) => {
	    const buffer = Buffer.allocUnsafe(16);
	    buffer.writeInt32BE(16, 0);
	    buffer.writeInt16BE(1234, 4);
	    buffer.writeInt16BE(5678, 6);
	    buffer.writeInt32BE(processID, 8);
	    buffer.writeInt32BE(secretKey, 12);
	    return buffer;
	};
	const cstringMessage = (code, string) => {
	    const stringLen = Buffer.byteLength(string);
	    const len = 4 + stringLen + 1;
	    // one extra bit for code
	    const buffer = Buffer.allocUnsafe(1 + len);
	    buffer[0] = code;
	    buffer.writeInt32BE(len, 1);
	    buffer.write(string, 5, 'utf-8');
	    buffer[len] = 0; // null terminate cString
	    return buffer;
	};
	const emptyDescribePortal = writer.addCString('P').flush(68 /* code.describe */);
	const emptyDescribeStatement = writer.addCString('S').flush(68 /* code.describe */);
	const describe = (msg) => {
	    return msg.name
	        ? cstringMessage(68 /* code.describe */, `${msg.type}${msg.name || ''}`)
	        : msg.type === 'P'
	            ? emptyDescribePortal
	            : emptyDescribeStatement;
	};
	const close = (msg) => {
	    const text = `${msg.type}${msg.name || ''}`;
	    return cstringMessage(67 /* code.close */, text);
	};
	const copyData = (chunk) => {
	    return writer.add(chunk).flush(100 /* code.copyFromChunk */);
	};
	const copyFail = (message) => {
	    return cstringMessage(102 /* code.copyFail */, message);
	};
	const codeOnlyBuffer = (code) => Buffer.from([code, 0x00, 0x00, 0x00, 0x04]);
	const flushBuffer = codeOnlyBuffer(72 /* code.flush */);
	const syncBuffer = codeOnlyBuffer(83 /* code.sync */);
	const endBuffer = codeOnlyBuffer(88 /* code.end */);
	const copyDoneBuffer = codeOnlyBuffer(99 /* code.copyDone */);
	const serialize = {
	    startup,
	    password,
	    requestSsl,
	    sendSASLInitialResponseMessage,
	    sendSCRAMClientFinalMessage,
	    query,
	    parse,
	    bind,
	    execute,
	    describe,
	    close,
	    flush: () => flushBuffer,
	    sync: () => syncBuffer,
	    end: () => endBuffer,
	    copyData,
	    copyDone: () => copyDoneBuffer,
	    copyFail,
	    cancel,
	};
	serializer.serialize = serialize;
	
	return serializer;
}

var parser = {};

var bufferReader = {};

var hasRequiredBufferReader;

function requireBufferReader () {
	if (hasRequiredBufferReader) return bufferReader;
	hasRequiredBufferReader = 1;
	Object.defineProperty(bufferReader, "__esModule", { value: true });
	bufferReader.BufferReader = void 0;
	const emptyBuffer = Buffer.allocUnsafe(0);
	class BufferReader {
	    constructor(offset = 0) {
	        this.offset = offset;
	        this.buffer = emptyBuffer;
	        // TODO(bmc): support non-utf8 encoding?
	        this.encoding = 'utf-8';
	    }
	    setBuffer(offset, buffer) {
	        this.offset = offset;
	        this.buffer = buffer;
	    }
	    int16() {
	        const result = this.buffer.readInt16BE(this.offset);
	        this.offset += 2;
	        return result;
	    }
	    byte() {
	        const result = this.buffer[this.offset];
	        this.offset++;
	        return result;
	    }
	    int32() {
	        const result = this.buffer.readInt32BE(this.offset);
	        this.offset += 4;
	        return result;
	    }
	    uint32() {
	        const result = this.buffer.readUInt32BE(this.offset);
	        this.offset += 4;
	        return result;
	    }
	    string(length) {
	        const result = this.buffer.toString(this.encoding, this.offset, this.offset + length);
	        this.offset += length;
	        return result;
	    }
	    cstring() {
	        const start = this.offset;
	        let end = start;
	        // eslint-disable-next-line no-empty
	        while (this.buffer[end++] !== 0) { }
	        this.offset = end;
	        return this.buffer.toString(this.encoding, start, end - 1);
	    }
	    bytes(length) {
	        const result = this.buffer.slice(this.offset, this.offset + length);
	        this.offset += length;
	        return result;
	    }
	}
	bufferReader.BufferReader = BufferReader;
	
	return bufferReader;
}

var hasRequiredParser;

function requireParser () {
	if (hasRequiredParser) return parser;
	hasRequiredParser = 1;
	Object.defineProperty(parser, "__esModule", { value: true });
	parser.Parser = void 0;
	const messages_1 = requireMessages();
	const buffer_reader_1 = requireBufferReader();
	// every message is prefixed with a single bye
	const CODE_LENGTH = 1;
	// every message has an int32 length which includes itself but does
	// NOT include the code in the length
	const LEN_LENGTH = 4;
	const HEADER_LENGTH = CODE_LENGTH + LEN_LENGTH;
	// A placeholder for a `BackendMessage`’s length value that will be set after construction.
	const LATEINIT_LENGTH = -1;
	const emptyBuffer = Buffer.allocUnsafe(0);
	class Parser {
	    constructor(opts) {
	        this.buffer = emptyBuffer;
	        this.bufferLength = 0;
	        this.bufferOffset = 0;
	        this.reader = new buffer_reader_1.BufferReader();
	        if ((opts === null || opts === void 0 ? void 0 : opts.mode) === 'binary') {
	            throw new Error('Binary mode not supported yet');
	        }
	        this.mode = (opts === null || opts === void 0 ? void 0 : opts.mode) || 'text';
	    }
	    parse(buffer, callback) {
	        this.mergeBuffer(buffer);
	        const bufferFullLength = this.bufferOffset + this.bufferLength;
	        let offset = this.bufferOffset;
	        while (offset + HEADER_LENGTH <= bufferFullLength) {
	            // code is 1 byte long - it identifies the message type
	            const code = this.buffer[offset];
	            // length is 1 Uint32BE - it is the length of the message EXCLUDING the code
	            const length = this.buffer.readUInt32BE(offset + CODE_LENGTH);
	            const fullMessageLength = CODE_LENGTH + length;
	            if (fullMessageLength + offset <= bufferFullLength) {
	                const message = this.handlePacket(offset + HEADER_LENGTH, code, length, this.buffer);
	                callback(message);
	                offset += fullMessageLength;
	            }
	            else {
	                break;
	            }
	        }
	        if (offset === bufferFullLength) {
	            // No more use for the buffer
	            this.buffer = emptyBuffer;
	            this.bufferLength = 0;
	            this.bufferOffset = 0;
	        }
	        else {
	            // Adjust the cursors of remainingBuffer
	            this.bufferLength = bufferFullLength - offset;
	            this.bufferOffset = offset;
	        }
	    }
	    mergeBuffer(buffer) {
	        if (this.bufferLength > 0) {
	            const newLength = this.bufferLength + buffer.byteLength;
	            const newFullLength = newLength + this.bufferOffset;
	            if (newFullLength > this.buffer.byteLength) {
	                // We can't concat the new buffer with the remaining one
	                let newBuffer;
	                if (newLength <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) {
	                    // We can move the relevant part to the beginning of the buffer instead of allocating a new buffer
	                    newBuffer = this.buffer;
	                }
	                else {
	                    // Allocate a new larger buffer
	                    let newBufferLength = this.buffer.byteLength * 2;
	                    while (newLength >= newBufferLength) {
	                        newBufferLength *= 2;
	                    }
	                    newBuffer = Buffer.allocUnsafe(newBufferLength);
	                }
	                // Move the remaining buffer to the new one
	                this.buffer.copy(newBuffer, 0, this.bufferOffset, this.bufferOffset + this.bufferLength);
	                this.buffer = newBuffer;
	                this.bufferOffset = 0;
	            }
	            // Concat the new buffer with the remaining one
	            buffer.copy(this.buffer, this.bufferOffset + this.bufferLength);
	            this.bufferLength = newLength;
	        }
	        else {
	            this.buffer = buffer;
	            this.bufferOffset = 0;
	            this.bufferLength = buffer.byteLength;
	        }
	    }
	    handlePacket(offset, code, length, bytes) {
	        const { reader } = this;
	        // NOTE: This undesirably retains the buffer in `this.reader` if the `parse*Message` calls below throw. However, those should only throw in the case of a protocol error, which normally results in the reader being discarded.
	        reader.setBuffer(offset, bytes);
	        let message;
	        switch (code) {
	            case 50 /* MessageCodes.BindComplete */:
	                message = messages_1.bindComplete;
	                break;
	            case 49 /* MessageCodes.ParseComplete */:
	                message = messages_1.parseComplete;
	                break;
	            case 51 /* MessageCodes.CloseComplete */:
	                message = messages_1.closeComplete;
	                break;
	            case 110 /* MessageCodes.NoData */:
	                message = messages_1.noData;
	                break;
	            case 115 /* MessageCodes.PortalSuspended */:
	                message = messages_1.portalSuspended;
	                break;
	            case 99 /* MessageCodes.CopyDone */:
	                message = messages_1.copyDone;
	                break;
	            case 87 /* MessageCodes.ReplicationStart */:
	                message = messages_1.replicationStart;
	                break;
	            case 73 /* MessageCodes.EmptyQuery */:
	                message = messages_1.emptyQuery;
	                break;
	            case 68 /* MessageCodes.DataRow */:
	                message = parseDataRowMessage(reader);
	                break;
	            case 67 /* MessageCodes.CommandComplete */:
	                message = parseCommandCompleteMessage(reader);
	                break;
	            case 90 /* MessageCodes.ReadyForQuery */:
	                message = parseReadyForQueryMessage(reader);
	                break;
	            case 65 /* MessageCodes.NotificationResponse */:
	                message = parseNotificationMessage(reader);
	                break;
	            case 82 /* MessageCodes.AuthenticationResponse */:
	                message = parseAuthenticationResponse(reader, length);
	                break;
	            case 83 /* MessageCodes.ParameterStatus */:
	                message = parseParameterStatusMessage(reader);
	                break;
	            case 75 /* MessageCodes.BackendKeyData */:
	                message = parseBackendKeyData(reader);
	                break;
	            case 69 /* MessageCodes.ErrorMessage */:
	                message = parseErrorMessage(reader, 'error');
	                break;
	            case 78 /* MessageCodes.NoticeMessage */:
	                message = parseErrorMessage(reader, 'notice');
	                break;
	            case 84 /* MessageCodes.RowDescriptionMessage */:
	                message = parseRowDescriptionMessage(reader);
	                break;
	            case 116 /* MessageCodes.ParameterDescriptionMessage */:
	                message = parseParameterDescriptionMessage(reader);
	                break;
	            case 71 /* MessageCodes.CopyIn */:
	                message = parseCopyInMessage(reader);
	                break;
	            case 72 /* MessageCodes.CopyOut */:
	                message = parseCopyOutMessage(reader);
	                break;
	            case 100 /* MessageCodes.CopyData */:
	                message = parseCopyData(reader, length);
	                break;
	            default:
	                return new messages_1.DatabaseError('received invalid response: ' + code.toString(16), length, 'error');
	        }
	        reader.setBuffer(0, emptyBuffer);
	        message.length = length;
	        return message;
	    }
	}
	parser.Parser = Parser;
	const parseReadyForQueryMessage = (reader) => {
	    const status = reader.string(1);
	    return new messages_1.ReadyForQueryMessage(LATEINIT_LENGTH, status);
	};
	const parseCommandCompleteMessage = (reader) => {
	    const text = reader.cstring();
	    return new messages_1.CommandCompleteMessage(LATEINIT_LENGTH, text);
	};
	const parseCopyData = (reader, length) => {
	    const chunk = reader.bytes(length - 4);
	    return new messages_1.CopyDataMessage(LATEINIT_LENGTH, chunk);
	};
	const parseCopyInMessage = (reader) => parseCopyMessage(reader, 'copyInResponse');
	const parseCopyOutMessage = (reader) => parseCopyMessage(reader, 'copyOutResponse');
	const parseCopyMessage = (reader, messageName) => {
	    const isBinary = reader.byte() !== 0;
	    const columnCount = reader.int16();
	    const message = new messages_1.CopyResponse(LATEINIT_LENGTH, messageName, isBinary, columnCount);
	    for (let i = 0; i < columnCount; i++) {
	        message.columnTypes[i] = reader.int16();
	    }
	    return message;
	};
	const parseNotificationMessage = (reader) => {
	    const processId = reader.int32();
	    const channel = reader.cstring();
	    const payload = reader.cstring();
	    return new messages_1.NotificationResponseMessage(LATEINIT_LENGTH, processId, channel, payload);
	};
	const parseRowDescriptionMessage = (reader) => {
	    const fieldCount = reader.int16();
	    const message = new messages_1.RowDescriptionMessage(LATEINIT_LENGTH, fieldCount);
	    for (let i = 0; i < fieldCount; i++) {
	        message.fields[i] = parseField(reader);
	    }
	    return message;
	};
	const parseField = (reader) => {
	    const name = reader.cstring();
	    const tableID = reader.uint32();
	    const columnID = reader.int16();
	    const dataTypeID = reader.uint32();
	    const dataTypeSize = reader.int16();
	    const dataTypeModifier = reader.int32();
	    const mode = reader.int16() === 0 ? 'text' : 'binary';
	    return new messages_1.Field(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, mode);
	};
	const parseParameterDescriptionMessage = (reader) => {
	    const parameterCount = reader.int16();
	    const message = new messages_1.ParameterDescriptionMessage(LATEINIT_LENGTH, parameterCount);
	    for (let i = 0; i < parameterCount; i++) {
	        message.dataTypeIDs[i] = reader.int32();
	    }
	    return message;
	};
	const parseDataRowMessage = (reader) => {
	    const fieldCount = reader.int16();
	    const fields = new Array(fieldCount);
	    for (let i = 0; i < fieldCount; i++) {
	        const len = reader.int32();
	        // a -1 for length means the value of the field is null
	        fields[i] = len === -1 ? null : reader.string(len);
	    }
	    return new messages_1.DataRowMessage(LATEINIT_LENGTH, fields);
	};
	const parseParameterStatusMessage = (reader) => {
	    const name = reader.cstring();
	    const value = reader.cstring();
	    return new messages_1.ParameterStatusMessage(LATEINIT_LENGTH, name, value);
	};
	const parseBackendKeyData = (reader) => {
	    const processID = reader.int32();
	    const secretKey = reader.int32();
	    return new messages_1.BackendKeyDataMessage(LATEINIT_LENGTH, processID, secretKey);
	};
	const parseAuthenticationResponse = (reader, length) => {
	    const code = reader.int32();
	    // TODO(bmc): maybe better types here
	    const message = {
	        name: 'authenticationOk',
	        length,
	    };
	    switch (code) {
	        case 0: // AuthenticationOk
	            break;
	        case 3: // AuthenticationCleartextPassword
	            if (message.length === 8) {
	                message.name = 'authenticationCleartextPassword';
	            }
	            break;
	        case 5: // AuthenticationMD5Password
	            if (message.length === 12) {
	                message.name = 'authenticationMD5Password';
	                const salt = reader.bytes(4);
	                return new messages_1.AuthenticationMD5Password(LATEINIT_LENGTH, salt);
	            }
	            break;
	        case 10: // AuthenticationSASL
	            {
	                message.name = 'authenticationSASL';
	                message.mechanisms = [];
	                let mechanism;
	                do {
	                    mechanism = reader.cstring();
	                    if (mechanism) {
	                        message.mechanisms.push(mechanism);
	                    }
	                } while (mechanism);
	            }
	            break;
	        case 11: // AuthenticationSASLContinue
	            message.name = 'authenticationSASLContinue';
	            message.data = reader.string(length - 8);
	            break;
	        case 12: // AuthenticationSASLFinal
	            message.name = 'authenticationSASLFinal';
	            message.data = reader.string(length - 8);
	            break;
	        default:
	            throw new Error('Unknown authenticationOk message type ' + code);
	    }
	    return message;
	};
	const parseErrorMessage = (reader, name) => {
	    const fields = {};
	    let fieldType = reader.string(1);
	    while (fieldType !== '\0') {
	        fields[fieldType] = reader.cstring();
	        fieldType = reader.string(1);
	    }
	    const messageValue = fields.M;
	    const message = name === 'notice'
	        ? new messages_1.NoticeMessage(LATEINIT_LENGTH, messageValue)
	        : new messages_1.DatabaseError(messageValue, LATEINIT_LENGTH, name);
	    message.severity = fields.S;
	    message.code = fields.C;
	    message.detail = fields.D;
	    message.hint = fields.H;
	    message.position = fields.P;
	    message.internalPosition = fields.p;
	    message.internalQuery = fields.q;
	    message.where = fields.W;
	    message.schema = fields.s;
	    message.table = fields.t;
	    message.column = fields.c;
	    message.dataType = fields.d;
	    message.constraint = fields.n;
	    message.file = fields.F;
	    message.line = fields.L;
	    message.routine = fields.R;
	    return message;
	};
	
	return parser;
}

var hasRequiredDist;

function requireDist () {
	if (hasRequiredDist) return dist;
	hasRequiredDist = 1;
	(function (exports$1) {
		Object.defineProperty(exports$1, "__esModule", { value: true });
		exports$1.DatabaseError = exports$1.serialize = exports$1.parse = void 0;
		const messages_1 = requireMessages();
		Object.defineProperty(exports$1, "DatabaseError", { enumerable: true, get: function () { return messages_1.DatabaseError; } });
		const serializer_1 = requireSerializer();
		Object.defineProperty(exports$1, "serialize", { enumerable: true, get: function () { return serializer_1.serialize; } });
		const parser_1 = requireParser();
		function parse(stream, callback) {
		    const parser = new parser_1.Parser();
		    stream.on('data', (buffer) => parser.parse(buffer, callback));
		    return new Promise((resolve) => stream.on('end', () => resolve()));
		}
		exports$1.parse = parse;
		
	} (dist));
	return dist;
}

var empty = {};

var hasRequiredEmpty;

function requireEmpty () {
	if (hasRequiredEmpty) return empty;
	hasRequiredEmpty = 1;
	Object.defineProperty(empty, "__esModule", { value: true });
	// This is an empty module that is served up when outside of a workerd environment
	// See the `exports` field in package.json
	empty.default = {};
	
	return empty;
}

var stream;
var hasRequiredStream;

function requireStream () {
	if (hasRequiredStream) return stream;
	hasRequiredStream = 1;
	const { getStream, getSecureStream } = getStreamFuncs();

	stream = {
	  /**
	   * Get a socket stream compatible with the current runtime environment.
	   * @returns {Duplex}
	   */
	  getStream,
	  /**
	   * Get a TLS secured socket, compatible with the current environment,
	   * using the socket and other settings given in `options`.
	   * @returns {Duplex}
	   */
	  getSecureStream,
	};

	/**
	 * The stream functions that work in Node.js
	 */
	function getNodejsStreamFuncs() {
	  function getStream(ssl) {
	    const net = require$$0$4;
	    return new net.Socket()
	  }

	  function getSecureStream(options) {
	    const tls = require$$1$1;
	    return tls.connect(options)
	  }
	  return {
	    getStream,
	    getSecureStream,
	  }
	}

	/**
	 * The stream functions that work in Cloudflare Workers
	 */
	function getCloudflareStreamFuncs() {
	  function getStream(ssl) {
	    const { CloudflareSocket } = requireEmpty();
	    return new CloudflareSocket(ssl)
	  }

	  function getSecureStream(options) {
	    options.socket.startTls(options);
	    return options.socket
	  }
	  return {
	    getStream,
	    getSecureStream,
	  }
	}

	/**
	 * Are we running in a Cloudflare Worker?
	 *
	 * @returns true if the code is currently running inside a Cloudflare Worker.
	 */
	function isCloudflareRuntime() {
	  // Since 2022-03-21 the `global_navigator` compatibility flag is on for Cloudflare Workers
	  // which means that `navigator.userAgent` will be defined.
	  // eslint-disable-next-line no-undef
	  if (typeof navigator === 'object' && navigator !== null && typeof navigator.userAgent === 'string') {
	    // eslint-disable-next-line no-undef
	    return navigator.userAgent === 'Cloudflare-Workers'
	  }
	  // In case `navigator` or `navigator.userAgent` is not defined then try a more sneaky approach
	  if (typeof Response === 'function') {
	    const resp = new Response(null, { cf: { thing: true } });
	    if (typeof resp.cf === 'object' && resp.cf !== null && resp.cf.thing) {
	      return true
	    }
	  }
	  return false
	}

	function getStreamFuncs() {
	  if (isCloudflareRuntime()) {
	    return getCloudflareStreamFuncs()
	  }
	  return getNodejsStreamFuncs()
	}
	return stream;
}

var connection;
var hasRequiredConnection;

function requireConnection () {
	if (hasRequiredConnection) return connection;
	hasRequiredConnection = 1;

	const EventEmitter = require$$0$3.EventEmitter;

	const { parse, serialize } = requireDist();
	const { getStream, getSecureStream } = requireStream();

	const flushBuffer = serialize.flush();
	const syncBuffer = serialize.sync();
	const endBuffer = serialize.end();

	// TODO(bmc) support binary mode at some point
	class Connection extends EventEmitter {
	  constructor(config) {
	    super();
	    config = config || {};

	    this.stream = config.stream || getStream(config.ssl);
	    if (typeof this.stream === 'function') {
	      this.stream = this.stream(config);
	    }

	    this._keepAlive = config.keepAlive;
	    this._keepAliveInitialDelayMillis = config.keepAliveInitialDelayMillis;
	    this.parsedStatements = {};
	    this.ssl = config.ssl || false;
	    this._ending = false;
	    this._emitMessage = false;
	    const self = this;
	    this.on('newListener', function (eventName) {
	      if (eventName === 'message') {
	        self._emitMessage = true;
	      }
	    });
	  }

	  connect(port, host) {
	    const self = this;

	    this._connecting = true;
	    this.stream.setNoDelay(true);
	    this.stream.connect(port, host);

	    this.stream.once('connect', function () {
	      if (self._keepAlive) {
	        self.stream.setKeepAlive(true, self._keepAliveInitialDelayMillis);
	      }
	      self.emit('connect');
	    });

	    const reportStreamError = function (error) {
	      // errors about disconnections should be ignored during disconnect
	      if (self._ending && (error.code === 'ECONNRESET' || error.code === 'EPIPE')) {
	        return
	      }
	      self.emit('error', error);
	    };
	    this.stream.on('error', reportStreamError);

	    this.stream.on('close', function () {
	      self.emit('end');
	    });

	    if (!this.ssl) {
	      return this.attachListeners(this.stream)
	    }

	    this.stream.once('data', function (buffer) {
	      const responseCode = buffer.toString('utf8');
	      switch (responseCode) {
	        case 'S': // Server supports SSL connections, continue with a secure connection
	          break
	        case 'N': // Server does not support SSL connections
	          self.stream.end();
	          return self.emit('error', new Error('The server does not support SSL connections'))
	        default:
	          // Any other response byte, including 'E' (ErrorResponse) indicating a server error
	          self.stream.end();
	          return self.emit('error', new Error('There was an error establishing an SSL connection'))
	      }
	      const options = {
	        socket: self.stream,
	      };

	      if (self.ssl !== true) {
	        Object.assign(options, self.ssl);

	        if ('key' in self.ssl) {
	          options.key = self.ssl.key;
	        }
	      }

	      const net = require$$0$4;
	      if (net.isIP && net.isIP(host) === 0) {
	        options.servername = host;
	      }
	      try {
	        self.stream = getSecureStream(options);
	      } catch (err) {
	        return self.emit('error', err)
	      }
	      self.attachListeners(self.stream);
	      self.stream.on('error', reportStreamError);

	      self.emit('sslconnect');
	    });
	  }

	  attachListeners(stream) {
	    parse(stream, (msg) => {
	      const eventName = msg.name === 'error' ? 'errorMessage' : msg.name;
	      if (this._emitMessage) {
	        this.emit('message', msg);
	      }
	      this.emit(eventName, msg);
	    });
	  }

	  requestSsl() {
	    this.stream.write(serialize.requestSsl());
	  }

	  startup(config) {
	    this.stream.write(serialize.startup(config));
	  }

	  cancel(processID, secretKey) {
	    this._send(serialize.cancel(processID, secretKey));
	  }

	  password(password) {
	    this._send(serialize.password(password));
	  }

	  sendSASLInitialResponseMessage(mechanism, initialResponse) {
	    this._send(serialize.sendSASLInitialResponseMessage(mechanism, initialResponse));
	  }

	  sendSCRAMClientFinalMessage(additionalData) {
	    this._send(serialize.sendSCRAMClientFinalMessage(additionalData));
	  }

	  _send(buffer) {
	    if (!this.stream.writable) {
	      return false
	    }
	    return this.stream.write(buffer)
	  }

	  query(text) {
	    this._send(serialize.query(text));
	  }

	  // send parse message
	  parse(query) {
	    this._send(serialize.parse(query));
	  }

	  // send bind message
	  bind(config) {
	    this._send(serialize.bind(config));
	  }

	  // send execute message
	  execute(config) {
	    this._send(serialize.execute(config));
	  }

	  flush() {
	    if (this.stream.writable) {
	      this.stream.write(flushBuffer);
	    }
	  }

	  sync() {
	    this._ending = true;
	    this._send(syncBuffer);
	  }

	  ref() {
	    this.stream.ref();
	  }

	  unref() {
	    this.stream.unref();
	  }

	  end() {
	    // 0x58 = 'X'
	    this._ending = true;
	    if (!this._connecting || !this.stream.writable) {
	      this.stream.end();
	      return
	    }
	    return this.stream.write(endBuffer, () => {
	      this.stream.end();
	    })
	  }

	  close(msg) {
	    this._send(serialize.close(msg));
	  }

	  describe(msg) {
	    this._send(serialize.describe(msg));
	  }

	  sendCopyFromChunk(chunk) {
	    this._send(serialize.copyData(chunk));
	  }

	  endCopyFrom() {
	    this._send(serialize.copyDone());
	  }

	  sendCopyFail(msg) {
	    this._send(serialize.copyFail(msg));
	  }
	}

	connection = Connection;
	return connection;
}

var lib = {exports: {}};

var helper = {exports: {}};

/*
Copyright (c) 2014-2021, Matteo Collina <hello@matteocollina.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

var split2;
var hasRequiredSplit2;

function requireSplit2 () {
	if (hasRequiredSplit2) return split2;
	hasRequiredSplit2 = 1;

	const { Transform } = require$$0$5;
	const { StringDecoder } = require$$1$2;
	const kLast = Symbol('last');
	const kDecoder = Symbol('decoder');

	function transform (chunk, enc, cb) {
	  let list;
	  if (this.overflow) { // Line buffer is full. Skip to start of next line.
	    const buf = this[kDecoder].write(chunk);
	    list = buf.split(this.matcher);

	    if (list.length === 1) return cb() // Line ending not found. Discard entire chunk.

	    // Line ending found. Discard trailing fragment of previous line and reset overflow state.
	    list.shift();
	    this.overflow = false;
	  } else {
	    this[kLast] += this[kDecoder].write(chunk);
	    list = this[kLast].split(this.matcher);
	  }

	  this[kLast] = list.pop();

	  for (let i = 0; i < list.length; i++) {
	    try {
	      push(this, this.mapper(list[i]));
	    } catch (error) {
	      return cb(error)
	    }
	  }

	  this.overflow = this[kLast].length > this.maxLength;
	  if (this.overflow && !this.skipOverflow) {
	    cb(new Error('maximum buffer reached'));
	    return
	  }

	  cb();
	}

	function flush (cb) {
	  // forward any gibberish left in there
	  this[kLast] += this[kDecoder].end();

	  if (this[kLast]) {
	    try {
	      push(this, this.mapper(this[kLast]));
	    } catch (error) {
	      return cb(error)
	    }
	  }

	  cb();
	}

	function push (self, val) {
	  if (val !== undefined) {
	    self.push(val);
	  }
	}

	function noop (incoming) {
	  return incoming
	}

	function split (matcher, mapper, options) {
	  // Set defaults for any arguments not supplied.
	  matcher = matcher || /\r?\n/;
	  mapper = mapper || noop;
	  options = options || {};

	  // Test arguments explicitly.
	  switch (arguments.length) {
	    case 1:
	      // If mapper is only argument.
	      if (typeof matcher === 'function') {
	        mapper = matcher;
	        matcher = /\r?\n/;
	      // If options is only argument.
	      } else if (typeof matcher === 'object' && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
	        options = matcher;
	        matcher = /\r?\n/;
	      }
	      break

	    case 2:
	      // If mapper and options are arguments.
	      if (typeof matcher === 'function') {
	        options = mapper;
	        mapper = matcher;
	        matcher = /\r?\n/;
	      // If matcher and options are arguments.
	      } else if (typeof mapper === 'object') {
	        options = mapper;
	        mapper = noop;
	      }
	  }

	  options = Object.assign({}, options);
	  options.autoDestroy = true;
	  options.transform = transform;
	  options.flush = flush;
	  options.readableObjectMode = true;

	  const stream = new Transform(options);

	  stream[kLast] = '';
	  stream[kDecoder] = new StringDecoder('utf8');
	  stream.matcher = matcher;
	  stream.mapper = mapper;
	  stream.maxLength = options.maxLength;
	  stream.skipOverflow = options.skipOverflow || false;
	  stream.overflow = false;
	  stream._destroy = function (err, cb) {
	    // Weird Node v12 bug that we need to work around
	    this._writableState.errorEmitted = false;
	    cb(err);
	  };

	  return stream
	}

	split2 = split;
	return split2;
}

var hasRequiredHelper;

function requireHelper () {
	if (hasRequiredHelper) return helper.exports;
	hasRequiredHelper = 1;
	(function (module) {

		var path = require$$0$6
		  , Stream = require$$0$5.Stream
		  , split = requireSplit2()
		  , util = require$$1
		  , defaultPort = 5432
		  , isWin = (process.platform === 'win32')
		  , warnStream = process.stderr
		;


		var S_IRWXG = 56     //    00070(8)
		  , S_IRWXO = 7      //    00007(8)
		  , S_IFMT  = 61440  // 00170000(8)
		  , S_IFREG = 32768  //  0100000(8)
		;
		function isRegFile(mode) {
		    return ((mode & S_IFMT) == S_IFREG);
		}

		var fieldNames = [ 'host', 'port', 'database', 'user', 'password' ];
		var nrOfFields = fieldNames.length;
		var passKey = fieldNames[ nrOfFields -1 ];


		function warn() {
		    var isWritable = (
		        warnStream instanceof Stream &&
		          true === warnStream.writable
		    );

		    if (isWritable) {
		        var args = Array.prototype.slice.call(arguments).concat("\n");
		        warnStream.write( util.format.apply(util, args) );
		    }
		}


		Object.defineProperty(module.exports, 'isWin', {
		    get : function() {
		        return isWin;
		    } ,
		    set : function(val) {
		        isWin = val;
		    }
		});


		module.exports.warnTo = function(stream) {
		    var old = warnStream;
		    warnStream = stream;
		    return old;
		};

		module.exports.getFileName = function(rawEnv){
		    var env = rawEnv || process.env;
		    var file = env.PGPASSFILE || (
		        isWin ?
		          path.join( env.APPDATA || './' , 'postgresql', 'pgpass.conf' ) :
		          path.join( env.HOME || './', '.pgpass' )
		    );
		    return file;
		};

		module.exports.usePgPass = function(stats, fname) {
		    if (Object.prototype.hasOwnProperty.call(process.env, 'PGPASSWORD')) {
		        return false;
		    }

		    if (isWin) {
		        return true;
		    }

		    fname = fname || '<unkn>';

		    if (! isRegFile(stats.mode)) {
		        warn('WARNING: password file "%s" is not a plain file', fname);
		        return false;
		    }

		    if (stats.mode & (S_IRWXG | S_IRWXO)) {
		        /* If password file is insecure, alert the user and ignore it. */
		        warn('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', fname);
		        return false;
		    }

		    return true;
		};


		var matcher = module.exports.match = function(connInfo, entry) {
		    return fieldNames.slice(0, -1).reduce(function(prev, field, idx){
		        if (idx == 1) {
		            // the port
		            if ( Number( connInfo[field] || defaultPort ) === Number( entry[field] ) ) {
		                return prev && true;
		            }
		        }
		        return prev && (
		            entry[field] === '*' ||
		              entry[field] === connInfo[field]
		        );
		    }, true);
		};


		module.exports.getPassword = function(connInfo, stream, cb) {
		    var pass;
		    var lineStream = stream.pipe(split());

		    function onLine(line) {
		        var entry = parseLine(line);
		        if (entry && isValidEntry(entry) && matcher(connInfo, entry)) {
		            pass = entry[passKey];
		            lineStream.end(); // -> calls onEnd(), but pass is set now
		        }
		    }

		    var onEnd = function() {
		        stream.destroy();
		        cb(pass);
		    };

		    var onErr = function(err) {
		        stream.destroy();
		        warn('WARNING: error on reading file: %s', err);
		        cb(undefined);
		    };

		    stream.on('error', onErr);
		    lineStream
		        .on('data', onLine)
		        .on('end', onEnd)
		        .on('error', onErr)
		    ;

		};


		var parseLine = module.exports.parseLine = function(line) {
		    if (line.length < 11 || line.match(/^\s+#/)) {
		        return null;
		    }

		    var curChar = '';
		    var prevChar = '';
		    var fieldIdx = 0;
		    var startIdx = 0;
		    var obj = {};
		    var isLastField = false;
		    var addToObj = function(idx, i0, i1) {
		        var field = line.substring(i0, i1);

		        if (! Object.hasOwnProperty.call(process.env, 'PGPASS_NO_DEESCAPE')) {
		            field = field.replace(/\\([:\\])/g, '$1');
		        }

		        obj[ fieldNames[idx] ] = field;
		    };

		    for (var i = 0 ; i < line.length-1 ; i += 1) {
		        curChar = line.charAt(i+1);
		        prevChar = line.charAt(i);

		        isLastField = (fieldIdx == nrOfFields-1);

		        if (isLastField) {
		            addToObj(fieldIdx, startIdx);
		            break;
		        }

		        if (i >= 0 && curChar == ':' && prevChar !== '\\') {
		            addToObj(fieldIdx, startIdx, i+1);

		            startIdx = i+2;
		            fieldIdx += 1;
		        }
		    }

		    obj = ( Object.keys(obj).length === nrOfFields ) ? obj : null;

		    return obj;
		};


		var isValidEntry = module.exports.isValidEntry = function(entry){
		    var rules = {
		        // host
		        0 : function(x){
		            return x.length > 0;
		        } ,
		        // port
		        1 : function(x){
		            if (x === '*') {
		                return true;
		            }
		            x = Number(x);
		            return (
		                isFinite(x) &&
		                  x > 0 &&
		                  x < 9007199254740992 &&
		                  Math.floor(x) === x
		            );
		        } ,
		        // database
		        2 : function(x){
		            return x.length > 0;
		        } ,
		        // username
		        3 : function(x){
		            return x.length > 0;
		        } ,
		        // password
		        4 : function(x){
		            return x.length > 0;
		        }
		    };

		    for (var idx = 0 ; idx < fieldNames.length ; idx += 1) {
		        var rule = rules[idx];
		        var value = entry[ fieldNames[idx] ] || '';

		        var res = rule(value);
		        if (!res) {
		            return false;
		        }
		    }

		    return true;
		}; 
	} (helper));
	return helper.exports;
}

var hasRequiredLib$1;

function requireLib$1 () {
	if (hasRequiredLib$1) return lib.exports;
	hasRequiredLib$1 = 1;

	var fs = require$$0$1
	  , helper = requireHelper()
	;


	lib.exports = function(connInfo, cb) {
	    var file = helper.getFileName();
	    
	    fs.stat(file, function(err, stat){
	        if (err || !helper.usePgPass(stat, file)) {
	            return cb(undefined);
	        }

	        var st = fs.createReadStream(file);

	        helper.getPassword(connInfo, st, cb);
	    });
	};

	lib.exports.warnTo = helper.warnTo;
	return lib.exports;
}

var client$1;
var hasRequiredClient$1;

function requireClient$1 () {
	if (hasRequiredClient$1) return client$1;
	hasRequiredClient$1 = 1;

	const EventEmitter = require$$0$3.EventEmitter;
	const utils = requireUtils$1();
	const nodeUtils = require$$1;
	const sasl = requireSasl();
	const TypeOverrides = requireTypeOverrides();

	const ConnectionParameters = requireConnectionParameters();
	const Query = requireQuery$1();
	const defaults = requireDefaults();
	const Connection = requireConnection();
	const crypto = requireUtils();

	const activeQueryDeprecationNotice = nodeUtils.deprecate(
	  () => {},
	  'Client.activeQuery is deprecated and will be removed in a future version.'
	);

	const queryQueueDeprecationNotice = nodeUtils.deprecate(
	  () => {},
	  'Client.queryQueue is deprecated and will be removed in a future version.'
	);

	const pgPassDeprecationNotice = nodeUtils.deprecate(
	  () => {},
	  'pgpass support is deprecated and will be removed in a future version. ' +
	    'You can provide an async function as the password property to the Client/Pool constructor that returns a password instead. Within this funciton you can call the pgpass module in your own code.'
	);

	const byoPromiseDeprecationNotice = nodeUtils.deprecate(
	  () => {},
	  'Passing a custom Promise implementation to the Client/Pool constructor is deprecated and will be removed in a future version.'
	);

	class Client extends EventEmitter {
	  constructor(config) {
	    super();

	    this.connectionParameters = new ConnectionParameters(config);
	    this.user = this.connectionParameters.user;
	    this.database = this.connectionParameters.database;
	    this.port = this.connectionParameters.port;
	    this.host = this.connectionParameters.host;

	    // "hiding" the password so it doesn't show up in stack traces
	    // or if the client is console.logged
	    Object.defineProperty(this, 'password', {
	      configurable: true,
	      enumerable: false,
	      writable: true,
	      value: this.connectionParameters.password,
	    });

	    this.replication = this.connectionParameters.replication;

	    const c = config || {};

	    if (c.Promise) {
	      byoPromiseDeprecationNotice();
	    }
	    this._Promise = c.Promise || commonjsGlobal.Promise;
	    this._types = new TypeOverrides(c.types);
	    this._ending = false;
	    this._ended = false;
	    this._connecting = false;
	    this._connected = false;
	    this._connectionError = false;
	    this._queryable = true;
	    this._activeQuery = null;

	    this.enableChannelBinding = Boolean(c.enableChannelBinding); // set true to use SCRAM-SHA-256-PLUS when offered
	    this.connection =
	      c.connection ||
	      new Connection({
	        stream: c.stream,
	        ssl: this.connectionParameters.ssl,
	        keepAlive: c.keepAlive || false,
	        keepAliveInitialDelayMillis: c.keepAliveInitialDelayMillis || 0,
	        encoding: this.connectionParameters.client_encoding || 'utf8',
	      });
	    this._queryQueue = [];
	    this.binary = c.binary || defaults.binary;
	    this.processID = null;
	    this.secretKey = null;
	    this.ssl = this.connectionParameters.ssl || false;
	    // As with Password, make SSL->Key (the private key) non-enumerable.
	    // It won't show up in stack traces
	    // or if the client is console.logged
	    if (this.ssl && this.ssl.key) {
	      Object.defineProperty(this.ssl, 'key', {
	        enumerable: false,
	      });
	    }

	    this._connectionTimeoutMillis = c.connectionTimeoutMillis || 0;
	  }

	  get activeQuery() {
	    activeQueryDeprecationNotice();
	    return this._activeQuery
	  }

	  set activeQuery(val) {
	    activeQueryDeprecationNotice();
	    this._activeQuery = val;
	  }

	  _getActiveQuery() {
	    return this._activeQuery
	  }

	  _errorAllQueries(err) {
	    const enqueueError = (query) => {
	      process.nextTick(() => {
	        query.handleError(err, this.connection);
	      });
	    };

	    const activeQuery = this._getActiveQuery();
	    if (activeQuery) {
	      enqueueError(activeQuery);
	      this._activeQuery = null;
	    }

	    this._queryQueue.forEach(enqueueError);
	    this._queryQueue.length = 0;
	  }

	  _connect(callback) {
	    const self = this;
	    const con = this.connection;
	    this._connectionCallback = callback;

	    if (this._connecting || this._connected) {
	      const err = new Error('Client has already been connected. You cannot reuse a client.');
	      process.nextTick(() => {
	        callback(err);
	      });
	      return
	    }
	    this._connecting = true;

	    if (this._connectionTimeoutMillis > 0) {
	      this.connectionTimeoutHandle = setTimeout(() => {
	        con._ending = true;
	        con.stream.destroy(new Error('timeout expired'));
	      }, this._connectionTimeoutMillis);

	      if (this.connectionTimeoutHandle.unref) {
	        this.connectionTimeoutHandle.unref();
	      }
	    }

	    if (this.host && this.host.indexOf('/') === 0) {
	      con.connect(this.host + '/.s.PGSQL.' + this.port);
	    } else {
	      con.connect(this.port, this.host);
	    }

	    // once connection is established send startup message
	    con.on('connect', function () {
	      if (self.ssl) {
	        con.requestSsl();
	      } else {
	        con.startup(self.getStartupConf());
	      }
	    });

	    con.on('sslconnect', function () {
	      con.startup(self.getStartupConf());
	    });

	    this._attachListeners(con);

	    con.once('end', () => {
	      const error = this._ending ? new Error('Connection terminated') : new Error('Connection terminated unexpectedly');

	      clearTimeout(this.connectionTimeoutHandle);
	      this._errorAllQueries(error);
	      this._ended = true;

	      if (!this._ending) {
	        // if the connection is ended without us calling .end()
	        // on this client then we have an unexpected disconnection
	        // treat this as an error unless we've already emitted an error
	        // during connection.
	        if (this._connecting && !this._connectionError) {
	          if (this._connectionCallback) {
	            this._connectionCallback(error);
	          } else {
	            this._handleErrorEvent(error);
	          }
	        } else if (!this._connectionError) {
	          this._handleErrorEvent(error);
	        }
	      }

	      process.nextTick(() => {
	        this.emit('end');
	      });
	    });
	  }

	  connect(callback) {
	    if (callback) {
	      this._connect(callback);
	      return
	    }

	    return new this._Promise((resolve, reject) => {
	      this._connect((error) => {
	        if (error) {
	          reject(error);
	        } else {
	          resolve(this);
	        }
	      });
	    })
	  }

	  _attachListeners(con) {
	    // password request handling
	    con.on('authenticationCleartextPassword', this._handleAuthCleartextPassword.bind(this));
	    // password request handling
	    con.on('authenticationMD5Password', this._handleAuthMD5Password.bind(this));
	    // password request handling (SASL)
	    con.on('authenticationSASL', this._handleAuthSASL.bind(this));
	    con.on('authenticationSASLContinue', this._handleAuthSASLContinue.bind(this));
	    con.on('authenticationSASLFinal', this._handleAuthSASLFinal.bind(this));
	    con.on('backendKeyData', this._handleBackendKeyData.bind(this));
	    con.on('error', this._handleErrorEvent.bind(this));
	    con.on('errorMessage', this._handleErrorMessage.bind(this));
	    con.on('readyForQuery', this._handleReadyForQuery.bind(this));
	    con.on('notice', this._handleNotice.bind(this));
	    con.on('rowDescription', this._handleRowDescription.bind(this));
	    con.on('dataRow', this._handleDataRow.bind(this));
	    con.on('portalSuspended', this._handlePortalSuspended.bind(this));
	    con.on('emptyQuery', this._handleEmptyQuery.bind(this));
	    con.on('commandComplete', this._handleCommandComplete.bind(this));
	    con.on('parseComplete', this._handleParseComplete.bind(this));
	    con.on('copyInResponse', this._handleCopyInResponse.bind(this));
	    con.on('copyData', this._handleCopyData.bind(this));
	    con.on('notification', this._handleNotification.bind(this));
	  }

	  _getPassword(cb) {
	    const con = this.connection;
	    if (typeof this.password === 'function') {
	      this._Promise
	        .resolve()
	        .then(() => this.password())
	        .then((pass) => {
	          if (pass !== undefined) {
	            if (typeof pass !== 'string') {
	              con.emit('error', new TypeError('Password must be a string'));
	              return
	            }
	            this.connectionParameters.password = this.password = pass;
	          } else {
	            this.connectionParameters.password = this.password = null;
	          }
	          cb();
	        })
	        .catch((err) => {
	          con.emit('error', err);
	        });
	    } else if (this.password !== null) {
	      cb();
	    } else {
	      try {
	        const pgPass = requireLib$1();
	        pgPass(this.connectionParameters, (pass) => {
	          if (undefined !== pass) {
	            pgPassDeprecationNotice();
	            this.connectionParameters.password = this.password = pass;
	          }
	          cb();
	        });
	      } catch (e) {
	        this.emit('error', e);
	      }
	    }
	  }

	  _handleAuthCleartextPassword(msg) {
	    this._getPassword(() => {
	      this.connection.password(this.password);
	    });
	  }

	  _handleAuthMD5Password(msg) {
	    this._getPassword(async () => {
	      try {
	        const hashedPassword = await crypto.postgresMd5PasswordHash(this.user, this.password, msg.salt);
	        this.connection.password(hashedPassword);
	      } catch (e) {
	        this.emit('error', e);
	      }
	    });
	  }

	  _handleAuthSASL(msg) {
	    this._getPassword(() => {
	      try {
	        this.saslSession = sasl.startSession(msg.mechanisms, this.enableChannelBinding && this.connection.stream);
	        this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism, this.saslSession.response);
	      } catch (err) {
	        this.connection.emit('error', err);
	      }
	    });
	  }

	  async _handleAuthSASLContinue(msg) {
	    try {
	      await sasl.continueSession(
	        this.saslSession,
	        this.password,
	        msg.data,
	        this.enableChannelBinding && this.connection.stream
	      );
	      this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
	    } catch (err) {
	      this.connection.emit('error', err);
	    }
	  }

	  _handleAuthSASLFinal(msg) {
	    try {
	      sasl.finalizeSession(this.saslSession, msg.data);
	      this.saslSession = null;
	    } catch (err) {
	      this.connection.emit('error', err);
	    }
	  }

	  _handleBackendKeyData(msg) {
	    this.processID = msg.processID;
	    this.secretKey = msg.secretKey;
	  }

	  _handleReadyForQuery(msg) {
	    if (this._connecting) {
	      this._connecting = false;
	      this._connected = true;
	      clearTimeout(this.connectionTimeoutHandle);

	      // process possible callback argument to Client#connect
	      if (this._connectionCallback) {
	        this._connectionCallback(null, this);
	        // remove callback for proper error handling
	        // after the connect event
	        this._connectionCallback = null;
	      }
	      this.emit('connect');
	    }
	    const activeQuery = this._getActiveQuery();
	    this._activeQuery = null;
	    this.readyForQuery = true;
	    if (activeQuery) {
	      activeQuery.handleReadyForQuery(this.connection);
	    }
	    this._pulseQueryQueue();
	  }

	  // if we receive an error event or error message
	  // during the connection process we handle it here
	  _handleErrorWhileConnecting(err) {
	    if (this._connectionError) {
	      // TODO(bmc): this is swallowing errors - we shouldn't do this
	      return
	    }
	    this._connectionError = true;
	    clearTimeout(this.connectionTimeoutHandle);
	    if (this._connectionCallback) {
	      return this._connectionCallback(err)
	    }
	    this.emit('error', err);
	  }

	  // if we're connected and we receive an error event from the connection
	  // this means the socket is dead - do a hard abort of all queries and emit
	  // the socket error on the client as well
	  _handleErrorEvent(err) {
	    if (this._connecting) {
	      return this._handleErrorWhileConnecting(err)
	    }
	    this._queryable = false;
	    this._errorAllQueries(err);
	    this.emit('error', err);
	  }

	  // handle error messages from the postgres backend
	  _handleErrorMessage(msg) {
	    if (this._connecting) {
	      return this._handleErrorWhileConnecting(msg)
	    }
	    const activeQuery = this._getActiveQuery();

	    if (!activeQuery) {
	      this._handleErrorEvent(msg);
	      return
	    }

	    this._activeQuery = null;
	    activeQuery.handleError(msg, this.connection);
	  }

	  _handleRowDescription(msg) {
	    const activeQuery = this._getActiveQuery();
	    if (activeQuery == null) {
	      const error = new Error('Received unexpected rowDescription message from backend.');
	      this._handleErrorEvent(error);
	      return
	    }
	    // delegate rowDescription to active query
	    activeQuery.handleRowDescription(msg);
	  }

	  _handleDataRow(msg) {
	    const activeQuery = this._getActiveQuery();
	    if (activeQuery == null) {
	      const error = new Error('Received unexpected dataRow message from backend.');
	      this._handleErrorEvent(error);
	      return
	    }
	    // delegate dataRow to active query
	    activeQuery.handleDataRow(msg);
	  }

	  _handlePortalSuspended(msg) {
	    const activeQuery = this._getActiveQuery();
	    if (activeQuery == null) {
	      const error = new Error('Received unexpected portalSuspended message from backend.');
	      this._handleErrorEvent(error);
	      return
	    }
	    // delegate portalSuspended to active query
	    activeQuery.handlePortalSuspended(this.connection);
	  }

	  _handleEmptyQuery(msg) {
	    const activeQuery = this._getActiveQuery();
	    if (activeQuery == null) {
	      const error = new Error('Received unexpected emptyQuery message from backend.');
	      this._handleErrorEvent(error);
	      return
	    }
	    // delegate emptyQuery to active query
	    activeQuery.handleEmptyQuery(this.connection);
	  }

	  _handleCommandComplete(msg) {
	    const activeQuery = this._getActiveQuery();
	    if (activeQuery == null) {
	      const error = new Error('Received unexpected commandComplete message from backend.');
	      this._handleErrorEvent(error);
	      return
	    }
	    // delegate commandComplete to active query
	    activeQuery.handleCommandComplete(msg, this.connection);
	  }

	  _handleParseComplete() {
	    const activeQuery = this._getActiveQuery();
	    if (activeQuery == null) {
	      const error = new Error('Received unexpected parseComplete message from backend.');
	      this._handleErrorEvent(error);
	      return
	    }
	    // if a prepared statement has a name and properly parses
	    // we track that its already been executed so we don't parse
	    // it again on the same client
	    if (activeQuery.name) {
	      this.connection.parsedStatements[activeQuery.name] = activeQuery.text;
	    }
	  }

	  _handleCopyInResponse(msg) {
	    const activeQuery = this._getActiveQuery();
	    if (activeQuery == null) {
	      const error = new Error('Received unexpected copyInResponse message from backend.');
	      this._handleErrorEvent(error);
	      return
	    }
	    activeQuery.handleCopyInResponse(this.connection);
	  }

	  _handleCopyData(msg) {
	    const activeQuery = this._getActiveQuery();
	    if (activeQuery == null) {
	      const error = new Error('Received unexpected copyData message from backend.');
	      this._handleErrorEvent(error);
	      return
	    }
	    activeQuery.handleCopyData(msg, this.connection);
	  }

	  _handleNotification(msg) {
	    this.emit('notification', msg);
	  }

	  _handleNotice(msg) {
	    this.emit('notice', msg);
	  }

	  getStartupConf() {
	    const params = this.connectionParameters;

	    const data = {
	      user: params.user,
	      database: params.database,
	    };

	    const appName = params.application_name || params.fallback_application_name;
	    if (appName) {
	      data.application_name = appName;
	    }
	    if (params.replication) {
	      data.replication = '' + params.replication;
	    }
	    if (params.statement_timeout) {
	      data.statement_timeout = String(parseInt(params.statement_timeout, 10));
	    }
	    if (params.lock_timeout) {
	      data.lock_timeout = String(parseInt(params.lock_timeout, 10));
	    }
	    if (params.idle_in_transaction_session_timeout) {
	      data.idle_in_transaction_session_timeout = String(parseInt(params.idle_in_transaction_session_timeout, 10));
	    }
	    if (params.options) {
	      data.options = params.options;
	    }

	    return data
	  }

	  cancel(client, query) {
	    if (client.activeQuery === query) {
	      const con = this.connection;

	      if (this.host && this.host.indexOf('/') === 0) {
	        con.connect(this.host + '/.s.PGSQL.' + this.port);
	      } else {
	        con.connect(this.port, this.host);
	      }

	      // once connection is established send cancel message
	      con.on('connect', function () {
	        con.cancel(client.processID, client.secretKey);
	      });
	    } else if (client._queryQueue.indexOf(query) !== -1) {
	      client._queryQueue.splice(client._queryQueue.indexOf(query), 1);
	    }
	  }

	  setTypeParser(oid, format, parseFn) {
	    return this._types.setTypeParser(oid, format, parseFn)
	  }

	  getTypeParser(oid, format) {
	    return this._types.getTypeParser(oid, format)
	  }

	  // escapeIdentifier and escapeLiteral moved to utility functions & exported
	  // on PG
	  // re-exported here for backwards compatibility
	  escapeIdentifier(str) {
	    return utils.escapeIdentifier(str)
	  }

	  escapeLiteral(str) {
	    return utils.escapeLiteral(str)
	  }

	  _pulseQueryQueue() {
	    if (this.readyForQuery === true) {
	      this._activeQuery = this._queryQueue.shift();
	      const activeQuery = this._getActiveQuery();
	      if (activeQuery) {
	        this.readyForQuery = false;
	        this.hasExecuted = true;

	        const queryError = activeQuery.submit(this.connection);
	        if (queryError) {
	          process.nextTick(() => {
	            activeQuery.handleError(queryError, this.connection);
	            this.readyForQuery = true;
	            this._pulseQueryQueue();
	          });
	        }
	      } else if (this.hasExecuted) {
	        this._activeQuery = null;
	        this.emit('drain');
	      }
	    }
	  }

	  query(config, values, callback) {
	    // can take in strings, config object or query object
	    let query;
	    let result;
	    let readTimeout;
	    let readTimeoutTimer;
	    let queryCallback;

	    if (config === null || config === undefined) {
	      throw new TypeError('Client was passed a null or undefined query')
	    } else if (typeof config.submit === 'function') {
	      readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
	      result = query = config;
	      if (typeof values === 'function') {
	        query.callback = query.callback || values;
	      }
	    } else {
	      readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
	      query = new Query(config, values, callback);
	      if (!query.callback) {
	        result = new this._Promise((resolve, reject) => {
	          query.callback = (err, res) => (err ? reject(err) : resolve(res));
	        }).catch((err) => {
	          // replace the stack trace that leads to `TCP.onStreamRead` with one that leads back to the
	          // application that created the query
	          Error.captureStackTrace(err);
	          throw err
	        });
	      }
	    }

	    if (readTimeout) {
	      queryCallback = query.callback;

	      readTimeoutTimer = setTimeout(() => {
	        const error = new Error('Query read timeout');

	        process.nextTick(() => {
	          query.handleError(error, this.connection);
	        });

	        queryCallback(error);

	        // we already returned an error,
	        // just do nothing if query completes
	        query.callback = () => {};

	        // Remove from queue
	        const index = this._queryQueue.indexOf(query);
	        if (index > -1) {
	          this._queryQueue.splice(index, 1);
	        }

	        this._pulseQueryQueue();
	      }, readTimeout);

	      query.callback = (err, res) => {
	        clearTimeout(readTimeoutTimer);
	        queryCallback(err, res);
	      };
	    }

	    if (this.binary && !query.binary) {
	      query.binary = true;
	    }

	    if (query._result && !query._result._types) {
	      query._result._types = this._types;
	    }

	    if (!this._queryable) {
	      process.nextTick(() => {
	        query.handleError(new Error('Client has encountered a connection error and is not queryable'), this.connection);
	      });
	      return result
	    }

	    if (this._ending) {
	      process.nextTick(() => {
	        query.handleError(new Error('Client was closed and is not queryable'), this.connection);
	      });
	      return result
	    }

	    this._queryQueue.push(query);
	    this._pulseQueryQueue();
	    return result
	  }

	  ref() {
	    this.connection.ref();
	  }

	  unref() {
	    this.connection.unref();
	  }

	  end(cb) {
	    this._ending = true;

	    // if we have never connected, then end is a noop, callback immediately
	    if (!this.connection._connecting || this._ended) {
	      if (cb) {
	        cb();
	      } else {
	        return this._Promise.resolve()
	      }
	    }

	    if (this._getActiveQuery() || !this._queryable) {
	      // if we have an active query we need to force a disconnect
	      // on the socket - otherwise a hung query could block end forever
	      this.connection.stream.destroy();
	    } else {
	      this.connection.end();
	    }

	    if (cb) {
	      this.connection.once('end', cb);
	    } else {
	      return new this._Promise((resolve) => {
	        this.connection.once('end', resolve);
	      })
	    }
	  }
	  get queryQueue() {
	    queryQueueDeprecationNotice();
	    return this._queryQueue
	  }
	}

	// expose a Query constructor
	Client.Query = Query;

	client$1 = Client;
	return client$1;
}

var pgPool;
var hasRequiredPgPool;

function requirePgPool () {
	if (hasRequiredPgPool) return pgPool;
	hasRequiredPgPool = 1;
	const EventEmitter = require$$0$3.EventEmitter;

	const NOOP = function () {};

	const removeWhere = (list, predicate) => {
	  const i = list.findIndex(predicate);

	  return i === -1 ? undefined : list.splice(i, 1)[0]
	};

	class IdleItem {
	  constructor(client, idleListener, timeoutId) {
	    this.client = client;
	    this.idleListener = idleListener;
	    this.timeoutId = timeoutId;
	  }
	}

	class PendingItem {
	  constructor(callback) {
	    this.callback = callback;
	  }
	}

	function throwOnDoubleRelease() {
	  throw new Error('Release called on client which has already been released to the pool.')
	}

	function promisify(Promise, callback) {
	  if (callback) {
	    return { callback: callback, result: undefined }
	  }
	  let rej;
	  let res;
	  const cb = function (err, client) {
	    err ? rej(err) : res(client);
	  };
	  const result = new Promise(function (resolve, reject) {
	    res = resolve;
	    rej = reject;
	  }).catch((err) => {
	    // replace the stack trace that leads to `TCP.onStreamRead` with one that leads back to the
	    // application that created the query
	    Error.captureStackTrace(err);
	    throw err
	  });
	  return { callback: cb, result: result }
	}

	function makeIdleListener(pool, client) {
	  return function idleListener(err) {
	    err.client = client;

	    client.removeListener('error', idleListener);
	    client.on('error', () => {
	      pool.log('additional client error after disconnection due to error', err);
	    });
	    pool._remove(client);
	    // TODO - document that once the pool emits an error
	    // the client has already been closed & purged and is unusable
	    pool.emit('error', err, client);
	  }
	}

	class Pool extends EventEmitter {
	  constructor(options, Client) {
	    super();
	    this.options = Object.assign({}, options);

	    if (options != null && 'password' in options) {
	      // "hiding" the password so it doesn't show up in stack traces
	      // or if the client is console.logged
	      Object.defineProperty(this.options, 'password', {
	        configurable: true,
	        enumerable: false,
	        writable: true,
	        value: options.password,
	      });
	    }
	    if (options != null && options.ssl && options.ssl.key) {
	      // "hiding" the ssl->key so it doesn't show up in stack traces
	      // or if the client is console.logged
	      Object.defineProperty(this.options.ssl, 'key', {
	        enumerable: false,
	      });
	    }

	    this.options.max = this.options.max || this.options.poolSize || 10;
	    this.options.min = this.options.min || 0;
	    this.options.maxUses = this.options.maxUses || Infinity;
	    this.options.allowExitOnIdle = this.options.allowExitOnIdle || false;
	    this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0;
	    this.log = this.options.log || function () {};
	    this.Client = this.options.Client || Client || requireLib().Client;
	    this.Promise = this.options.Promise || commonjsGlobal.Promise;

	    if (typeof this.options.idleTimeoutMillis === 'undefined') {
	      this.options.idleTimeoutMillis = 10000;
	    }

	    this._clients = [];
	    this._idle = [];
	    this._expired = new WeakSet();
	    this._pendingQueue = [];
	    this._endCallback = undefined;
	    this.ending = false;
	    this.ended = false;
	  }

	  _isFull() {
	    return this._clients.length >= this.options.max
	  }

	  _isAboveMin() {
	    return this._clients.length > this.options.min
	  }

	  _pulseQueue() {
	    this.log('pulse queue');
	    if (this.ended) {
	      this.log('pulse queue ended');
	      return
	    }
	    if (this.ending) {
	      this.log('pulse queue on ending');
	      if (this._idle.length) {
	        this._idle.slice().map((item) => {
	          this._remove(item.client);
	        });
	      }
	      if (!this._clients.length) {
	        this.ended = true;
	        this._endCallback();
	      }
	      return
	    }

	    // if we don't have any waiting, do nothing
	    if (!this._pendingQueue.length) {
	      this.log('no queued requests');
	      return
	    }
	    // if we don't have any idle clients and we have no more room do nothing
	    if (!this._idle.length && this._isFull()) {
	      return
	    }
	    const pendingItem = this._pendingQueue.shift();
	    if (this._idle.length) {
	      const idleItem = this._idle.pop();
	      clearTimeout(idleItem.timeoutId);
	      const client = idleItem.client;
	      client.ref && client.ref();
	      const idleListener = idleItem.idleListener;

	      return this._acquireClient(client, pendingItem, idleListener, false)
	    }
	    if (!this._isFull()) {
	      return this.newClient(pendingItem)
	    }
	    throw new Error('unexpected condition')
	  }

	  _remove(client, callback) {
	    const removed = removeWhere(this._idle, (item) => item.client === client);

	    if (removed !== undefined) {
	      clearTimeout(removed.timeoutId);
	    }

	    this._clients = this._clients.filter((c) => c !== client);
	    const context = this;
	    client.end(() => {
	      context.emit('remove', client);

	      if (typeof callback === 'function') {
	        callback();
	      }
	    });
	  }

	  connect(cb) {
	    if (this.ending) {
	      const err = new Error('Cannot use a pool after calling end on the pool');
	      return cb ? cb(err) : this.Promise.reject(err)
	    }

	    const response = promisify(this.Promise, cb);
	    const result = response.result;

	    // if we don't have to connect a new client, don't do so
	    if (this._isFull() || this._idle.length) {
	      // if we have idle clients schedule a pulse immediately
	      if (this._idle.length) {
	        process.nextTick(() => this._pulseQueue());
	      }

	      if (!this.options.connectionTimeoutMillis) {
	        this._pendingQueue.push(new PendingItem(response.callback));
	        return result
	      }

	      const queueCallback = (err, res, done) => {
	        clearTimeout(tid);
	        response.callback(err, res, done);
	      };

	      const pendingItem = new PendingItem(queueCallback);

	      // set connection timeout on checking out an existing client
	      const tid = setTimeout(() => {
	        // remove the callback from pending waiters because
	        // we're going to call it with a timeout error
	        removeWhere(this._pendingQueue, (i) => i.callback === queueCallback);
	        pendingItem.timedOut = true;
	        response.callback(new Error('timeout exceeded when trying to connect'));
	      }, this.options.connectionTimeoutMillis);

	      if (tid.unref) {
	        tid.unref();
	      }

	      this._pendingQueue.push(pendingItem);
	      return result
	    }

	    this.newClient(new PendingItem(response.callback));

	    return result
	  }

	  newClient(pendingItem) {
	    const client = new this.Client(this.options);
	    this._clients.push(client);
	    const idleListener = makeIdleListener(this, client);

	    this.log('checking client timeout');

	    // connection timeout logic
	    let tid;
	    let timeoutHit = false;
	    if (this.options.connectionTimeoutMillis) {
	      tid = setTimeout(() => {
	        this.log('ending client due to timeout');
	        timeoutHit = true;
	        // force kill the node driver, and let libpq do its teardown
	        client.connection ? client.connection.stream.destroy() : client.end();
	      }, this.options.connectionTimeoutMillis);
	    }

	    this.log('connecting new client');
	    client.connect((err) => {
	      if (tid) {
	        clearTimeout(tid);
	      }
	      client.on('error', idleListener);
	      if (err) {
	        this.log('client failed to connect', err);
	        // remove the dead client from our list of clients
	        this._clients = this._clients.filter((c) => c !== client);
	        if (timeoutHit) {
	          err = new Error('Connection terminated due to connection timeout', { cause: err });
	        }

	        // this client won’t be released, so move on immediately
	        this._pulseQueue();

	        if (!pendingItem.timedOut) {
	          pendingItem.callback(err, undefined, NOOP);
	        }
	      } else {
	        this.log('new client connected');

	        if (this.options.maxLifetimeSeconds !== 0) {
	          const maxLifetimeTimeout = setTimeout(() => {
	            this.log('ending client due to expired lifetime');
	            this._expired.add(client);
	            const idleIndex = this._idle.findIndex((idleItem) => idleItem.client === client);
	            if (idleIndex !== -1) {
	              this._acquireClient(
	                client,
	                new PendingItem((err, client, clientRelease) => clientRelease()),
	                idleListener,
	                false
	              );
	            }
	          }, this.options.maxLifetimeSeconds * 1000);

	          maxLifetimeTimeout.unref();
	          client.once('end', () => clearTimeout(maxLifetimeTimeout));
	        }

	        return this._acquireClient(client, pendingItem, idleListener, true)
	      }
	    });
	  }

	  // acquire a client for a pending work item
	  _acquireClient(client, pendingItem, idleListener, isNew) {
	    if (isNew) {
	      this.emit('connect', client);
	    }

	    this.emit('acquire', client);

	    client.release = this._releaseOnce(client, idleListener);

	    client.removeListener('error', idleListener);

	    if (!pendingItem.timedOut) {
	      if (isNew && this.options.verify) {
	        this.options.verify(client, (err) => {
	          if (err) {
	            client.release(err);
	            return pendingItem.callback(err, undefined, NOOP)
	          }

	          pendingItem.callback(undefined, client, client.release);
	        });
	      } else {
	        pendingItem.callback(undefined, client, client.release);
	      }
	    } else {
	      if (isNew && this.options.verify) {
	        this.options.verify(client, client.release);
	      } else {
	        client.release();
	      }
	    }
	  }

	  // returns a function that wraps _release and throws if called more than once
	  _releaseOnce(client, idleListener) {
	    let released = false;

	    return (err) => {
	      if (released) {
	        throwOnDoubleRelease();
	      }

	      released = true;
	      this._release(client, idleListener, err);
	    }
	  }

	  // release a client back to the poll, include an error
	  // to remove it from the pool
	  _release(client, idleListener, err) {
	    client.on('error', idleListener);

	    client._poolUseCount = (client._poolUseCount || 0) + 1;

	    this.emit('release', err, client);

	    // TODO(bmc): expose a proper, public interface _queryable and _ending
	    if (err || this.ending || !client._queryable || client._ending || client._poolUseCount >= this.options.maxUses) {
	      if (client._poolUseCount >= this.options.maxUses) {
	        this.log('remove expended client');
	      }

	      return this._remove(client, this._pulseQueue.bind(this))
	    }

	    const isExpired = this._expired.has(client);
	    if (isExpired) {
	      this.log('remove expired client');
	      this._expired.delete(client);
	      return this._remove(client, this._pulseQueue.bind(this))
	    }

	    // idle timeout
	    let tid;
	    if (this.options.idleTimeoutMillis && this._isAboveMin()) {
	      tid = setTimeout(() => {
	        if (this._isAboveMin()) {
	          this.log('remove idle client');
	          this._remove(client, this._pulseQueue.bind(this));
	        }
	      }, this.options.idleTimeoutMillis);

	      if (this.options.allowExitOnIdle) {
	        // allow Node to exit if this is all that's left
	        tid.unref();
	      }
	    }

	    if (this.options.allowExitOnIdle) {
	      client.unref();
	    }

	    this._idle.push(new IdleItem(client, idleListener, tid));
	    this._pulseQueue();
	  }

	  query(text, values, cb) {
	    // guard clause against passing a function as the first parameter
	    if (typeof text === 'function') {
	      const response = promisify(this.Promise, text);
	      setImmediate(function () {
	        return response.callback(new Error('Passing a function as the first parameter to pool.query is not supported'))
	      });
	      return response.result
	    }

	    // allow plain text query without values
	    if (typeof values === 'function') {
	      cb = values;
	      values = undefined;
	    }
	    const response = promisify(this.Promise, cb);
	    cb = response.callback;

	    this.connect((err, client) => {
	      if (err) {
	        return cb(err)
	      }

	      let clientReleased = false;
	      const onError = (err) => {
	        if (clientReleased) {
	          return
	        }
	        clientReleased = true;
	        client.release(err);
	        cb(err);
	      };

	      client.once('error', onError);
	      this.log('dispatching query');
	      try {
	        client.query(text, values, (err, res) => {
	          this.log('query dispatched');
	          client.removeListener('error', onError);
	          if (clientReleased) {
	            return
	          }
	          clientReleased = true;
	          client.release(err);
	          if (err) {
	            return cb(err)
	          }
	          return cb(undefined, res)
	        });
	      } catch (err) {
	        client.release(err);
	        return cb(err)
	      }
	    });
	    return response.result
	  }

	  end(cb) {
	    this.log('ending');
	    if (this.ending) {
	      const err = new Error('Called end on pool more than once');
	      return cb ? cb(err) : this.Promise.reject(err)
	    }
	    this.ending = true;
	    const promised = promisify(this.Promise, cb);
	    this._endCallback = promised.callback;
	    this._pulseQueue();
	    return promised.result
	  }

	  get waitingCount() {
	    return this._pendingQueue.length
	  }

	  get idleCount() {
	    return this._idle.length
	  }

	  get expiredCount() {
	    return this._clients.reduce((acc, client) => acc + (this._expired.has(client) ? 1 : 0), 0)
	  }

	  get totalCount() {
	    return this._clients.length
	  }
	}
	pgPool = Pool;
	return pgPool;
}

var client = {exports: {}};

var query = {exports: {}};

var hasRequiredQuery;

function requireQuery () {
	if (hasRequiredQuery) return query.exports;
	hasRequiredQuery = 1;

	const EventEmitter = require$$0$3.EventEmitter;
	const util = require$$1;
	const utils = requireUtils$1();

	const NativeQuery = (query.exports = function (config, values, callback) {
	  EventEmitter.call(this);
	  config = utils.normalizeQueryConfig(config, values, callback);
	  this.text = config.text;
	  this.values = config.values;
	  this.name = config.name;
	  this.queryMode = config.queryMode;
	  this.callback = config.callback;
	  this.state = 'new';
	  this._arrayMode = config.rowMode === 'array';

	  // if the 'row' event is listened for
	  // then emit them as they come in
	  // without setting singleRowMode to true
	  // this has almost no meaning because libpq
	  // reads all rows into memory before returning any
	  this._emitRowEvents = false;
	  this.on(
	    'newListener',
	    function (event) {
	      if (event === 'row') this._emitRowEvents = true;
	    }.bind(this)
	  );
	});

	util.inherits(NativeQuery, EventEmitter);

	const errorFieldMap = {
	  sqlState: 'code',
	  statementPosition: 'position',
	  messagePrimary: 'message',
	  context: 'where',
	  schemaName: 'schema',
	  tableName: 'table',
	  columnName: 'column',
	  dataTypeName: 'dataType',
	  constraintName: 'constraint',
	  sourceFile: 'file',
	  sourceLine: 'line',
	  sourceFunction: 'routine',
	};

	NativeQuery.prototype.handleError = function (err) {
	  // copy pq error fields into the error object
	  const fields = this.native.pq.resultErrorFields();
	  if (fields) {
	    for (const key in fields) {
	      const normalizedFieldName = errorFieldMap[key] || key;
	      err[normalizedFieldName] = fields[key];
	    }
	  }
	  if (this.callback) {
	    this.callback(err);
	  } else {
	    this.emit('error', err);
	  }
	  this.state = 'error';
	};

	NativeQuery.prototype.then = function (onSuccess, onFailure) {
	  return this._getPromise().then(onSuccess, onFailure)
	};

	NativeQuery.prototype.catch = function (callback) {
	  return this._getPromise().catch(callback)
	};

	NativeQuery.prototype._getPromise = function () {
	  if (this._promise) return this._promise
	  this._promise = new Promise(
	    function (resolve, reject) {
	      this._once('end', resolve);
	      this._once('error', reject);
	    }.bind(this)
	  );
	  return this._promise
	};

	NativeQuery.prototype.submit = function (client) {
	  this.state = 'running';
	  const self = this;
	  this.native = client.native;
	  client.native.arrayMode = this._arrayMode;

	  let after = function (err, rows, results) {
	    client.native.arrayMode = false;
	    setImmediate(function () {
	      self.emit('_done');
	    });

	    // handle possible query error
	    if (err) {
	      return self.handleError(err)
	    }

	    // emit row events for each row in the result
	    if (self._emitRowEvents) {
	      if (results.length > 1) {
	        rows.forEach((rowOfRows, i) => {
	          rowOfRows.forEach((row) => {
	            self.emit('row', row, results[i]);
	          });
	        });
	      } else {
	        rows.forEach(function (row) {
	          self.emit('row', row, results);
	        });
	      }
	    }

	    // handle successful result
	    self.state = 'end';
	    self.emit('end', results);
	    if (self.callback) {
	      self.callback(null, results);
	    }
	  };

	  if (process.domain) {
	    after = process.domain.bind(after);
	  }

	  // named query
	  if (this.name) {
	    if (this.name.length > 63) {
	      console.error('Warning! Postgres only supports 63 characters for query names.');
	      console.error('You supplied %s (%s)', this.name, this.name.length);
	      console.error('This can cause conflicts and silent errors executing queries');
	    }
	    const values = (this.values || []).map(utils.prepareValue);

	    // check if the client has already executed this named query
	    // if so...just execute it again - skip the planning phase
	    if (client.namedQueries[this.name]) {
	      if (this.text && client.namedQueries[this.name] !== this.text) {
	        const err = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
	        return after(err)
	      }
	      return client.native.execute(this.name, values, after)
	    }
	    // plan the named query the first time, then execute it
	    return client.native.prepare(this.name, this.text, values.length, function (err) {
	      if (err) return after(err)
	      client.namedQueries[self.name] = self.text;
	      return self.native.execute(self.name, values, after)
	    })
	  } else if (this.values) {
	    if (!Array.isArray(this.values)) {
	      const err = new Error('Query values must be an array');
	      return after(err)
	    }
	    const vals = this.values.map(utils.prepareValue);
	    client.native.query(this.text, vals, after);
	  } else if (this.queryMode === 'extended') {
	    client.native.query(this.text, [], after);
	  } else {
	    client.native.query(this.text, after);
	  }
	};
	return query.exports;
}

var hasRequiredClient;

function requireClient () {
	if (hasRequiredClient) return client.exports;
	hasRequiredClient = 1;

	// eslint-disable-next-line
	var Native;
	// eslint-disable-next-line no-useless-catch
	try {
	  // Wrap this `require()` in a try-catch to avoid upstream bundlers from complaining that this might not be available since it is an optional import
	  Native = require('pg-native');
	} catch (e) {
	  throw e
	}
	const TypeOverrides = requireTypeOverrides();
	const EventEmitter = require$$0$3.EventEmitter;
	const util = require$$1;
	const ConnectionParameters = requireConnectionParameters();

	const NativeQuery = requireQuery();

	const Client = (client.exports = function (config) {
	  EventEmitter.call(this);
	  config = config || {};

	  this._Promise = config.Promise || commonjsGlobal.Promise;
	  this._types = new TypeOverrides(config.types);

	  this.native = new Native({
	    types: this._types,
	  });

	  this._queryQueue = [];
	  this._ending = false;
	  this._connecting = false;
	  this._connected = false;
	  this._queryable = true;

	  // keep these on the object for legacy reasons
	  // for the time being. TODO: deprecate all this jazz
	  const cp = (this.connectionParameters = new ConnectionParameters(config));
	  if (config.nativeConnectionString) cp.nativeConnectionString = config.nativeConnectionString;
	  this.user = cp.user;

	  // "hiding" the password so it doesn't show up in stack traces
	  // or if the client is console.logged
	  Object.defineProperty(this, 'password', {
	    configurable: true,
	    enumerable: false,
	    writable: true,
	    value: cp.password,
	  });
	  this.database = cp.database;
	  this.host = cp.host;
	  this.port = cp.port;

	  // a hash to hold named queries
	  this.namedQueries = {};
	});

	Client.Query = NativeQuery;

	util.inherits(Client, EventEmitter);

	Client.prototype._errorAllQueries = function (err) {
	  const enqueueError = (query) => {
	    process.nextTick(() => {
	      query.native = this.native;
	      query.handleError(err);
	    });
	  };

	  if (this._hasActiveQuery()) {
	    enqueueError(this._activeQuery);
	    this._activeQuery = null;
	  }

	  this._queryQueue.forEach(enqueueError);
	  this._queryQueue.length = 0;
	};

	// connect to the backend
	// pass an optional callback to be called once connected
	// or with an error if there was a connection error
	Client.prototype._connect = function (cb) {
	  const self = this;

	  if (this._connecting) {
	    process.nextTick(() => cb(new Error('Client has already been connected. You cannot reuse a client.')));
	    return
	  }

	  this._connecting = true;

	  this.connectionParameters.getLibpqConnectionString(function (err, conString) {
	    if (self.connectionParameters.nativeConnectionString) conString = self.connectionParameters.nativeConnectionString;
	    if (err) return cb(err)
	    self.native.connect(conString, function (err) {
	      if (err) {
	        self.native.end();
	        return cb(err)
	      }

	      // set internal states to connected
	      self._connected = true;

	      // handle connection errors from the native layer
	      self.native.on('error', function (err) {
	        self._queryable = false;
	        self._errorAllQueries(err);
	        self.emit('error', err);
	      });

	      self.native.on('notification', function (msg) {
	        self.emit('notification', {
	          channel: msg.relname,
	          payload: msg.extra,
	        });
	      });

	      // signal we are connected now
	      self.emit('connect');
	      self._pulseQueryQueue(true);

	      cb(null, this);
	    });
	  });
	};

	Client.prototype.connect = function (callback) {
	  if (callback) {
	    this._connect(callback);
	    return
	  }

	  return new this._Promise((resolve, reject) => {
	    this._connect((error) => {
	      if (error) {
	        reject(error);
	      } else {
	        resolve(this);
	      }
	    });
	  })
	};

	// send a query to the server
	// this method is highly overloaded to take
	// 1) string query, optional array of parameters, optional function callback
	// 2) object query with {
	//    string query
	//    optional array values,
	//    optional function callback instead of as a separate parameter
	//    optional string name to name & cache the query plan
	//    optional string rowMode = 'array' for an array of results
	//  }
	Client.prototype.query = function (config, values, callback) {
	  let query;
	  let result;
	  let readTimeout;
	  let readTimeoutTimer;
	  let queryCallback;

	  if (config === null || config === undefined) {
	    throw new TypeError('Client was passed a null or undefined query')
	  } else if (typeof config.submit === 'function') {
	    readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
	    result = query = config;
	    // accept query(new Query(...), (err, res) => { }) style
	    if (typeof values === 'function') {
	      config.callback = values;
	    }
	  } else {
	    readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
	    query = new NativeQuery(config, values, callback);
	    if (!query.callback) {
	      let resolveOut, rejectOut;
	      result = new this._Promise((resolve, reject) => {
	        resolveOut = resolve;
	        rejectOut = reject;
	      }).catch((err) => {
	        Error.captureStackTrace(err);
	        throw err
	      });
	      query.callback = (err, res) => (err ? rejectOut(err) : resolveOut(res));
	    }
	  }

	  if (readTimeout) {
	    queryCallback = query.callback;

	    readTimeoutTimer = setTimeout(() => {
	      const error = new Error('Query read timeout');

	      process.nextTick(() => {
	        query.handleError(error, this.connection);
	      });

	      queryCallback(error);

	      // we already returned an error,
	      // just do nothing if query completes
	      query.callback = () => {};

	      // Remove from queue
	      const index = this._queryQueue.indexOf(query);
	      if (index > -1) {
	        this._queryQueue.splice(index, 1);
	      }

	      this._pulseQueryQueue();
	    }, readTimeout);

	    query.callback = (err, res) => {
	      clearTimeout(readTimeoutTimer);
	      queryCallback(err, res);
	    };
	  }

	  if (!this._queryable) {
	    query.native = this.native;
	    process.nextTick(() => {
	      query.handleError(new Error('Client has encountered a connection error and is not queryable'));
	    });
	    return result
	  }

	  if (this._ending) {
	    query.native = this.native;
	    process.nextTick(() => {
	      query.handleError(new Error('Client was closed and is not queryable'));
	    });
	    return result
	  }

	  this._queryQueue.push(query);
	  this._pulseQueryQueue();
	  return result
	};

	// disconnect from the backend server
	Client.prototype.end = function (cb) {
	  const self = this;

	  this._ending = true;

	  if (!this._connected) {
	    this.once('connect', this.end.bind(this, cb));
	  }
	  let result;
	  if (!cb) {
	    result = new this._Promise(function (resolve, reject) {
	      cb = (err) => (err ? reject(err) : resolve());
	    });
	  }
	  this.native.end(function () {
	    self._errorAllQueries(new Error('Connection terminated'));

	    process.nextTick(() => {
	      self.emit('end');
	      if (cb) cb();
	    });
	  });
	  return result
	};

	Client.prototype._hasActiveQuery = function () {
	  return this._activeQuery && this._activeQuery.state !== 'error' && this._activeQuery.state !== 'end'
	};

	Client.prototype._pulseQueryQueue = function (initialConnection) {
	  if (!this._connected) {
	    return
	  }
	  if (this._hasActiveQuery()) {
	    return
	  }
	  const query = this._queryQueue.shift();
	  if (!query) {
	    if (!initialConnection) {
	      this.emit('drain');
	    }
	    return
	  }
	  this._activeQuery = query;
	  query.submit(this);
	  const self = this;
	  query.once('_done', function () {
	    self._pulseQueryQueue();
	  });
	};

	// attempt to cancel an in-progress query
	Client.prototype.cancel = function (query) {
	  if (this._activeQuery === query) {
	    this.native.cancel(function () {});
	  } else if (this._queryQueue.indexOf(query) !== -1) {
	    this._queryQueue.splice(this._queryQueue.indexOf(query), 1);
	  }
	};

	Client.prototype.ref = function () {};
	Client.prototype.unref = function () {};

	Client.prototype.setTypeParser = function (oid, format, parseFn) {
	  return this._types.setTypeParser(oid, format, parseFn)
	};

	Client.prototype.getTypeParser = function (oid, format) {
	  return this._types.getTypeParser(oid, format)
	};
	return client.exports;
}

var native;
var hasRequiredNative;

function requireNative () {
	if (hasRequiredNative) return native;
	hasRequiredNative = 1;
	native = requireClient();
	return native;
}

var hasRequiredLib;

function requireLib () {
	if (hasRequiredLib) return lib$1.exports;
	hasRequiredLib = 1;
	(function (module) {

		const Client = requireClient$1();
		const defaults = requireDefaults();
		const Connection = requireConnection();
		const Result = requireResult();
		const utils = requireUtils$1();
		const Pool = requirePgPool();
		const TypeOverrides = requireTypeOverrides();
		const { DatabaseError } = requireDist();
		const { escapeIdentifier, escapeLiteral } = requireUtils$1();

		const poolFactory = (Client) => {
		  return class BoundPool extends Pool {
		    constructor(options) {
		      super(options, Client);
		    }
		  }
		};

		const PG = function (clientConstructor) {
		  this.defaults = defaults;
		  this.Client = clientConstructor;
		  this.Query = this.Client.Query;
		  this.Pool = poolFactory(this.Client);
		  this._pools = [];
		  this.Connection = Connection;
		  this.types = requirePgTypes();
		  this.DatabaseError = DatabaseError;
		  this.TypeOverrides = TypeOverrides;
		  this.escapeIdentifier = escapeIdentifier;
		  this.escapeLiteral = escapeLiteral;
		  this.Result = Result;
		  this.utils = utils;
		};

		let clientConstructor = Client;

		let forceNative = false;
		try {
		  forceNative = !!process.env.NODE_PG_FORCE_NATIVE;
		} catch {
		  // ignore, e.g., Deno without --allow-env
		}

		if (forceNative) {
		  clientConstructor = requireNative();
		}

		module.exports = new PG(clientConstructor);

		// lazy require native module...the native module may not have installed
		Object.defineProperty(module.exports, 'native', {
		  configurable: true,
		  enumerable: false,
		  get() {
		    let native = null;
		    try {
		      native = new PG(requireNative());
		    } catch (err) {
		      if (err.code !== 'MODULE_NOT_FOUND') {
		        throw err
		      }
		    }

		    // overwrite module.exports.native so that getter is never called again
		    Object.defineProperty(module.exports, 'native', {
		      value: native,
		    });

		    return native
		  },
		}); 
	} (lib$1));
	return lib$1.exports;
}

var libExports = requireLib();
var pg = /*@__PURE__*/getDefaultExportFromCjs(libExports);

// ESM wrapper for pg

// Re-export all the properties
pg.Client;
pg.Pool;
pg.Connection;
pg.types;
pg.Query;
pg.DatabaseError;
pg.escapeIdentifier;
pg.escapeLiteral;
pg.Result;
pg.TypeOverrides;

// Also export the defaults
pg.defaults;

class ConsoleLogWriter {
  static [entityKind] = "ConsoleLogWriter";
  write(message) {
    console.log(message);
  }
}
class DefaultLogger {
  static [entityKind] = "DefaultLogger";
  writer;
  constructor(config) {
    this.writer = config?.writer ?? new ConsoleLogWriter();
  }
  logQuery(query, params) {
    const stringifiedParams = params.map((p) => {
      try {
        return JSON.stringify(p);
      } catch {
        return String(p);
      }
    });
    const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
    this.writer.write(`Query: ${query}${paramsStr}`);
  }
}
class NoopLogger {
  static [entityKind] = "NoopLogger";
  logQuery() {
  }
}

const { Pool: Pool$1, types } = pg;
class NodePgPreparedQuery extends PgPreparedQuery {
  constructor(client, queryString, params, logger, cache, queryMetadata, cacheConfig, fields, name, _isResponseInArrayMode, customResultMapper) {
    super({ sql: queryString, params }, cache, queryMetadata, cacheConfig);
    this.client = client;
    this.queryString = queryString;
    this.params = params;
    this.logger = logger;
    this.fields = fields;
    this._isResponseInArrayMode = _isResponseInArrayMode;
    this.customResultMapper = customResultMapper;
    this.rawQueryConfig = {
      name,
      text: queryString,
      types: {
        // @ts-ignore
        getTypeParser: (typeId, format) => {
          if (typeId === types.builtins.TIMESTAMPTZ) {
            return (val) => val;
          }
          if (typeId === types.builtins.TIMESTAMP) {
            return (val) => val;
          }
          if (typeId === types.builtins.DATE) {
            return (val) => val;
          }
          if (typeId === types.builtins.INTERVAL) {
            return (val) => val;
          }
          if (typeId === 1231) {
            return (val) => val;
          }
          if (typeId === 1115) {
            return (val) => val;
          }
          if (typeId === 1185) {
            return (val) => val;
          }
          if (typeId === 1187) {
            return (val) => val;
          }
          if (typeId === 1182) {
            return (val) => val;
          }
          return types.getTypeParser(typeId, format);
        }
      }
    };
    this.queryConfig = {
      name,
      text: queryString,
      rowMode: "array",
      types: {
        // @ts-ignore
        getTypeParser: (typeId, format) => {
          if (typeId === types.builtins.TIMESTAMPTZ) {
            return (val) => val;
          }
          if (typeId === types.builtins.TIMESTAMP) {
            return (val) => val;
          }
          if (typeId === types.builtins.DATE) {
            return (val) => val;
          }
          if (typeId === types.builtins.INTERVAL) {
            return (val) => val;
          }
          if (typeId === 1231) {
            return (val) => val;
          }
          if (typeId === 1115) {
            return (val) => val;
          }
          if (typeId === 1185) {
            return (val) => val;
          }
          if (typeId === 1187) {
            return (val) => val;
          }
          if (typeId === 1182) {
            return (val) => val;
          }
          return types.getTypeParser(typeId, format);
        }
      }
    };
  }
  static [entityKind] = "NodePgPreparedQuery";
  rawQueryConfig;
  queryConfig;
  async execute(placeholderValues = {}) {
    return tracer.startActiveSpan("drizzle.execute", async () => {
      const params = fillPlaceholders(this.params, placeholderValues);
      this.logger.logQuery(this.rawQueryConfig.text, params);
      const { fields, rawQueryConfig: rawQuery, client, queryConfig: query, joinsNotNullableMap, customResultMapper } = this;
      if (!fields && !customResultMapper) {
        return tracer.startActiveSpan("drizzle.driver.execute", async (span) => {
          span?.setAttributes({
            "drizzle.query.name": rawQuery.name,
            "drizzle.query.text": rawQuery.text,
            "drizzle.query.params": JSON.stringify(params)
          });
          return this.queryWithCache(rawQuery.text, params, async () => {
            return await client.query(rawQuery, params);
          });
        });
      }
      const result = await tracer.startActiveSpan("drizzle.driver.execute", (span) => {
        span?.setAttributes({
          "drizzle.query.name": query.name,
          "drizzle.query.text": query.text,
          "drizzle.query.params": JSON.stringify(params)
        });
        return this.queryWithCache(query.text, params, async () => {
          return await client.query(query, params);
        });
      });
      return tracer.startActiveSpan("drizzle.mapResponse", () => {
        return customResultMapper ? customResultMapper(result.rows) : result.rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
      });
    });
  }
  all(placeholderValues = {}) {
    return tracer.startActiveSpan("drizzle.execute", () => {
      const params = fillPlaceholders(this.params, placeholderValues);
      this.logger.logQuery(this.rawQueryConfig.text, params);
      return tracer.startActiveSpan("drizzle.driver.execute", (span) => {
        span?.setAttributes({
          "drizzle.query.name": this.rawQueryConfig.name,
          "drizzle.query.text": this.rawQueryConfig.text,
          "drizzle.query.params": JSON.stringify(params)
        });
        return this.queryWithCache(this.rawQueryConfig.text, params, async () => {
          return this.client.query(this.rawQueryConfig, params);
        }).then((result) => result.rows);
      });
    });
  }
  /** @internal */
  isResponseInArrayMode() {
    return this._isResponseInArrayMode;
  }
}
class NodePgSession extends PgSession {
  constructor(client, dialect, schema, options = {}) {
    super(dialect);
    this.client = client;
    this.schema = schema;
    this.options = options;
    this.logger = options.logger ?? new NoopLogger();
    this.cache = options.cache ?? new NoopCache();
  }
  static [entityKind] = "NodePgSession";
  logger;
  cache;
  prepareQuery(query, fields, name, isResponseInArrayMode, customResultMapper, queryMetadata, cacheConfig) {
    return new NodePgPreparedQuery(
      this.client,
      query.sql,
      query.params,
      this.logger,
      this.cache,
      queryMetadata,
      cacheConfig,
      fields,
      name,
      isResponseInArrayMode,
      customResultMapper
    );
  }
  async transaction(transaction, config) {
    const session = this.client instanceof Pool$1 ? new NodePgSession(await this.client.connect(), this.dialect, this.schema, this.options) : this;
    const tx = new NodePgTransaction(this.dialect, session, this.schema);
    await tx.execute(sql`begin${config ? sql` ${tx.getTransactionConfigSQL(config)}` : void 0}`);
    try {
      const result = await transaction(tx);
      await tx.execute(sql`commit`);
      return result;
    } catch (error) {
      await tx.execute(sql`rollback`);
      throw error;
    } finally {
      if (this.client instanceof Pool$1) {
        session.client.release();
      }
    }
  }
  async count(sql2) {
    const res = await this.execute(sql2);
    return Number(
      res["rows"][0]["count"]
    );
  }
}
class NodePgTransaction extends PgTransaction {
  static [entityKind] = "NodePgTransaction";
  async transaction(transaction) {
    const savepointName = `sp${this.nestedIndex + 1}`;
    const tx = new NodePgTransaction(
      this.dialect,
      this.session,
      this.schema,
      this.nestedIndex + 1
    );
    await tx.execute(sql.raw(`savepoint ${savepointName}`));
    try {
      const result = await transaction(tx);
      await tx.execute(sql.raw(`release savepoint ${savepointName}`));
      return result;
    } catch (err) {
      await tx.execute(sql.raw(`rollback to savepoint ${savepointName}`));
      throw err;
    }
  }
}

class NodePgDriver {
  constructor(client, dialect, options = {}) {
    this.client = client;
    this.dialect = dialect;
    this.options = options;
  }
  static [entityKind] = "NodePgDriver";
  createSession(schema) {
    return new NodePgSession(this.client, this.dialect, schema, {
      logger: this.options.logger,
      cache: this.options.cache
    });
  }
}
class NodePgDatabase extends PgDatabase {
  static [entityKind] = "NodePgDatabase";
}
function construct(client, config = {}) {
  const dialect = new PgDialect({ casing: config.casing });
  let logger;
  if (config.logger === true) {
    logger = new DefaultLogger();
  } else if (config.logger !== false) {
    logger = config.logger;
  }
  let schema;
  if (config.schema) {
    const tablesConfig = extractTablesRelationalConfig(
      config.schema,
      createTableRelationsHelpers
    );
    schema = {
      fullSchema: config.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap
    };
  }
  const driver = new NodePgDriver(client, dialect, { logger, cache: config.cache });
  const session = driver.createSession(schema);
  const db = new NodePgDatabase(dialect, session, schema);
  db.$client = client;
  db.$cache = config.cache;
  if (db.$cache) {
    db.$cache["invalidate"] = config.cache?.onMutate;
  }
  return db;
}
function drizzle(...params) {
  if (typeof params[0] === "string") {
    const instance = new pg.Pool({
      connectionString: params[0]
    });
    return construct(instance, params[1]);
  }
  if (isConfig(params[0])) {
    const { connection, client, ...drizzleConfig } = params[0];
    if (client) return construct(client, drizzleConfig);
    const instance = typeof connection === "string" ? new pg.Pool({
      connectionString: connection
    }) : new pg.Pool(connection);
    return construct(instance, drizzleConfig);
  }
  return construct(params[0], params[1]);
}
((drizzle2) => {
  function mock(config) {
    return construct({}, config);
  }
  drizzle2.mock = mock;
})(drizzle || (drizzle = {}));

const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull().default(""),
  notes: text("notes").notNull().default(""),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow()
});
const clientProficiencies = pgTable("client_proficiencies", {
  client_id: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  category_id: text("category_id").notNull(),
  proficiency: text("proficiency").notNull().default("beginner"),
  notes: text("notes").notNull().default("")
}, (t) => [primaryKey({ columns: [t.client_id, t.category_id] })]);
const assessments = pgTable("assessments", {
  id: text("id").primaryKey(),
  project_name: text("project_name").notNull(),
  client_name: text("client_name").notNull().default(""),
  client_id: text("client_id").references(() => clients.id, { onDelete: "set null" }),
  architect: text("architect").notNull().default(""),
  project_path: text("project_path").notNull().default(""),
  // New generic stack model
  source_stack: jsonb("source_stack").notNull().default({}),
  target_stack: jsonb("target_stack").notNull().default({}),
  migration_scope: jsonb("migration_scope").notNull().default({}),
  // Legacy fields (deprecated — kept for backward compatibility)
  sitecore_version: text("sitecore_version").notNull().default(""),
  topology: text("topology").notNull().default(""),
  source_cloud: text("source_cloud").notNull().default("aws"),
  target_cloud: text("target_cloud").notNull().default("azure"),
  target_timeline: text("target_timeline").notNull().default(""),
  environment_count: integer("environment_count").notNull().default(1),
  environments: jsonb("environments").notNull().default([]),
  status: text("status").notNull().default("discovery"),
  challenge_required: boolean("challenge_required").notNull().default(false),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow()
}, (t) => [index("idx_assessments_project_path").on(t.project_path)]);
const discoveryDimensions = pgTable("discovery_dimensions", {
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  dimension: text("dimension").notNull(),
  status: text("status").notNull().default("not_started"),
  completed_at: timestamp("completed_at", { mode: "string" }),
  last_updated: timestamp("last_updated", { mode: "string" }).notNull().defaultNow()
}, (t) => [primaryKey({ columns: [t.assessment_id, t.dimension] })]);
const discoveryAnswers = pgTable("discovery_answers", {
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  dimension: text("dimension").notNull(),
  question_id: text("question_id").notNull(),
  value: jsonb("value").notNull().default(null),
  notes: text("notes").notNull().default(""),
  confidence: text("confidence").notNull().default("unknown"),
  basis: text("basis")
}, (t) => [primaryKey({ columns: [t.assessment_id, t.dimension, t.question_id] })]);
const risks = pgTable("risks", {
  id: text("id").notNull(),
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  category: text("category").notNull().default(""),
  description: text("description").notNull().default(""),
  likelihood: text("likelihood").notNull().default(""),
  impact: text("impact").notNull().default(""),
  severity: text("severity").notNull().default(""),
  estimated_hours_impact: real("estimated_hours_impact").notNull().default(0),
  linked_assumptions: jsonb("linked_assumptions").notNull().default([]),
  mitigation: text("mitigation").notNull().default(""),
  contingency: text("contingency").notNull().default(""),
  owner: text("owner").notNull().default(""),
  status: text("status").notNull().default("open")
}, (t) => [primaryKey({ columns: [t.id, t.assessment_id] })]);
const assumptions = pgTable("assumptions", {
  id: text("id").notNull(),
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  dimension: text("dimension").notNull().default(""),
  question_id: text("question_id"),
  assumed_value: text("assumed_value").notNull().default(""),
  basis: text("basis").notNull().default(""),
  confidence: text("confidence").notNull().default("unknown"),
  validation_status: text("validation_status").notNull().default("unvalidated"),
  validation_method: text("validation_method").notNull().default(""),
  pessimistic_widening_hours: real("pessimistic_widening_hours").notNull().default(0),
  affected_components: jsonb("affected_components").notNull().default([]),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  validated_at: timestamp("validated_at", { mode: "string" }),
  actual_value: text("actual_value")
}, (t) => [primaryKey({ columns: [t.id, t.assessment_id] })]);
const activeMultipliers = pgTable("active_multipliers", {
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  multiplier_id: text("multiplier_id").notNull(),
  name: text("name").notNull().default(""),
  factor: real("factor").notNull().default(1),
  trigger_condition: text("trigger_condition").notNull().default(""),
  affected_components: jsonb("affected_components").notNull().default([])
}, (t) => [primaryKey({ columns: [t.assessment_id, t.multiplier_id] })]);
const dependencyChains = pgTable("dependency_chains", {
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  from_component: text("from_component").notNull(),
  to_component: text("to_component").notNull(),
  dependency_type: text("dependency_type").notNull().default("hard")
}, (t) => [primaryKey({ columns: [t.assessment_id, t.from_component, t.to_component] })]);
const riskClusters = pgTable("risk_clusters", {
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  risks: jsonb("risks").notNull().default([]),
  assumptions: jsonb("assumptions").notNull().default([]),
  combined_widening_hours: real("combined_widening_hours").notNull().default(0)
}, (t) => [primaryKey({ columns: [t.assessment_id, t.name] })]);
const estimateSnapshots = pgTable("estimate_snapshots", {
  id: serial("id").primaryKey(),
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  confidence_score: real("confidence_score").notNull().default(0),
  total_base_hours: real("total_base_hours").notNull().default(0),
  total_gotcha_hours: real("total_gotcha_hours").notNull().default(0),
  total_expected_hours: real("total_expected_hours").notNull().default(0),
  assumption_widening_hours: real("assumption_widening_hours").notNull().default(0),
  totals: jsonb("totals").notNull().default({}),
  total_by_role: jsonb("total_by_role").notNull().default({}),
  client_summary: jsonb("client_summary").notNull().default({}),
  phases_json: jsonb("phases_json").notNull().default([]),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow()
}, (t) => [unique("uq_estimate_version").on(t.assessment_id, t.version)]);
const estimateComponents = pgTable("estimate_components", {
  snapshot_id: integer("snapshot_id").notNull().references(() => estimateSnapshots.id, { onDelete: "cascade" }),
  phase_id: text("phase_id").notNull(),
  phase_name: text("phase_name").notNull().default(""),
  component_id: text("component_id").notNull(),
  component_name: text("component_name").notNull().default(""),
  units: integer("units").notNull().default(1),
  base_hours: real("base_hours").notNull().default(0),
  multipliers_applied: jsonb("multipliers_applied").notNull().default([]),
  gotcha_hours: real("gotcha_hours").notNull().default(0),
  final_hours: real("final_hours").notNull().default(0),
  firm_hours: real("firm_hours").notNull().default(0),
  assumption_dependent_hours: real("assumption_dependent_hours").notNull().default(0),
  assumptions_affecting: jsonb("assumptions_affecting").notNull().default([]),
  hours: jsonb("hours").notNull().default({}),
  ai_alternatives: jsonb("ai_alternatives").notNull().default([]),
  by_role: jsonb("by_role").notNull().default({})
}, (t) => [primaryKey({ columns: [t.snapshot_id, t.component_id] })]);
const aiSelections = pgTable("ai_selections", {
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  tool_id: text("tool_id").notNull(),
  enabled: boolean("enabled").notNull().default(false),
  reason: text("reason")
}, (t) => [primaryKey({ columns: [t.assessment_id, t.tool_id] })]);
const scopeExclusions = pgTable("scope_exclusions", {
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  component_id: text("component_id").notNull(),
  excluded: boolean("excluded").notNull().default(false),
  reason: text("reason")
}, (t) => [primaryKey({ columns: [t.assessment_id, t.component_id] })]);
const calibrations = pgTable("calibrations", {
  id: serial("id").primaryKey(),
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  engagement_name: text("engagement_name").notNull().default(""),
  estimate_date: text("estimate_date").notNull().default(""),
  calibration_date: timestamp("calibration_date", { mode: "string" }).notNull().defaultNow(),
  status: text("status").notNull().default("in_progress"),
  total_estimated: jsonb("total_estimated").notNull().default({}),
  total_actual: real("total_actual"),
  surprises: jsonb("surprises").notNull().default([]),
  smoother: jsonb("smoother").notNull().default([]),
  suggested_adjustments: jsonb("suggested_adjustments").notNull().default([]),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow()
});
const calibrationPhases = pgTable("calibration_phases", {
  calibration_id: integer("calibration_id").notNull().references(() => calibrations.id, { onDelete: "cascade" }),
  phase_id: text("phase_id").notNull(),
  phase_name: text("phase_name").notNull().default(""),
  estimated_hours: real("estimated_hours").notNull().default(0),
  actual_hours: real("actual_hours").notNull().default(0),
  variance_percent: real("variance_percent").notNull().default(0),
  variance_direction: text("variance_direction").notNull().default(""),
  notes: text("notes").notNull().default("")
}, (t) => [primaryKey({ columns: [t.calibration_id, t.phase_id] })]);
const calibrationComponents = pgTable("calibration_components", {
  calibration_id: integer("calibration_id").notNull().references(() => calibrations.id, { onDelete: "cascade" }),
  component_id: text("component_id").notNull(),
  estimated_hours: real("estimated_hours").notNull().default(0),
  actual_hours: real("actual_hours").notNull().default(0),
  variance_percent: real("variance_percent").notNull().default(0),
  notes: text("notes").notNull().default("")
}, (t) => [primaryKey({ columns: [t.calibration_id, t.component_id] })]);
const calibrationAiTools = pgTable("calibration_ai_tools", {
  calibration_id: integer("calibration_id").notNull().references(() => calibrations.id, { onDelete: "cascade" }),
  tool_id: text("tool_id").notNull(),
  tool_name: text("tool_name").notNull().default(""),
  was_used: boolean("was_used").notNull().default(false),
  estimated_savings_hours: real("estimated_savings_hours").notNull().default(0),
  actual_savings_hours: real("actual_savings_hours").notNull().default(0),
  variance_percent: real("variance_percent").notNull().default(0),
  notes: text("notes").notNull().default("")
}, (t) => [primaryKey({ columns: [t.calibration_id, t.tool_id] })]);
const challengeReviews = pgTable("challenge_reviews", {
  id: serial("id").primaryKey(),
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  step: text("step").notNull(),
  // discovery | analysis | estimate | refine
  round: integer("round").notNull().default(1),
  status: text("status").notNull().default("in_progress"),
  // in_progress | passed | conditional_pass | failed | skipped
  confidence_score: real("confidence_score").notNull().default(0),
  score_breakdown: jsonb("score_breakdown").notNull().default({}),
  acceptance_criteria_met: jsonb("acceptance_criteria_met").notNull().default({}),
  challenges: jsonb("challenges").notNull().default([]),
  findings: jsonb("findings").notNull().default([]),
  summary: text("summary").notNull().default(""),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  completed_at: timestamp("completed_at", { mode: "string" })
}, (t) => [
  index("idx_challenge_reviews_assessment").on(t.assessment_id),
  index("idx_challenge_reviews_step").on(t.assessment_id, t.step)
]);
const workspaceState = pgTable("workspace_state", {
  project_path: text("project_path").primaryKey(),
  active_assessment_id: text("active_assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow()
});
const deliverables = pgTable("deliverables", {
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  file_path: text("file_path").notNull().default(""),
  generated_at: timestamp("generated_at", { mode: "string" }).notNull().defaultNow()
}, (t) => [primaryKey({ columns: [t.assessment_id, t.name] })]);
const knowledgePacks = pgTable("knowledge_packs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  vendor: text("vendor").notNull().default(""),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull().default(""),
  description: text("description").notNull().default(""),
  direction: text("direction").notNull().default("both"),
  latest_version: text("latest_version").notNull().default(""),
  supported_versions: jsonb("supported_versions").notNull().default([]),
  eol_versions: jsonb("eol_versions").notNull().default({}),
  valid_topologies: jsonb("valid_topologies").notNull().default([]),
  deployment_models: jsonb("deployment_models").notNull().default([]),
  compatible_targets: jsonb("compatible_targets").notNull().default([]),
  compatible_infrastructure: jsonb("compatible_infrastructure").notNull().default([]),
  required_services: jsonb("required_services").notNull().default([]),
  optional_services: jsonb("optional_services").notNull().default([]),
  confidence: text("confidence").notNull().default("draft"),
  last_researched: timestamp("last_researched", { mode: "string" }),
  pack_version: text("pack_version").notNull().default("1"),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow()
}, (t) => [
  index("idx_knowledge_packs_category").on(t.category),
  index("idx_knowledge_packs_direction").on(t.direction)
]);
const knowledgePackVersions = pgTable("knowledge_pack_versions", {
  id: serial("id").primaryKey(),
  pack_id: text("pack_id").notNull().references(() => knowledgePacks.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  created_by: text("created_by").notNull().default(""),
  change_summary: text("change_summary").notNull().default(""),
  snapshot_data: jsonb("snapshot_data").notNull().default({}),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow()
}, (t) => [
  unique("uq_pack_version").on(t.pack_id, t.version),
  index("idx_pack_versions_pack_id").on(t.pack_id)
]);
const knowledgeDiscoveryTrees = pgTable("knowledge_discovery_trees", {
  pack_id: text("pack_id").notNull().references(() => knowledgePacks.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  dimensions_json: jsonb("dimensions_json").notNull().default([]),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow()
}, (t) => [primaryKey({ columns: [t.pack_id, t.version] })]);
const knowledgeEffortHours = pgTable("knowledge_effort_hours", {
  pack_id: text("pack_id").notNull().references(() => knowledgePacks.id, { onDelete: "cascade" }),
  component_id: text("component_id").notNull(),
  component_name: text("component_name").notNull().default(""),
  base_hours: real("base_hours").notNull().default(0),
  unit: text("unit").notNull().default(""),
  includes: text("includes").notNull().default(""),
  role_breakdown: jsonb("role_breakdown").notNull().default({}),
  phase_id: text("phase_id").notNull().default("")
}, (t) => [primaryKey({ columns: [t.pack_id, t.component_id] })]);
const knowledgeMultipliers = pgTable("knowledge_multipliers", {
  pack_id: text("pack_id").notNull().references(() => knowledgePacks.id, { onDelete: "cascade" }),
  multiplier_id: text("multiplier_id").notNull(),
  condition: text("condition").notNull().default(""),
  factor: real("factor").notNull().default(1),
  applies_to: jsonb("applies_to").notNull().default([]),
  reason: text("reason").notNull().default(""),
  supersedes: text("supersedes")
}, (t) => [primaryKey({ columns: [t.pack_id, t.multiplier_id] })]);
const knowledgeGotchaPatterns = pgTable("knowledge_gotcha_patterns", {
  pack_id: text("pack_id").notNull().references(() => knowledgePacks.id, { onDelete: "cascade" }),
  pattern_id: text("pattern_id").notNull(),
  pattern_condition: text("pattern_condition").notNull().default(""),
  risk_level: text("risk_level").notNull().default("medium"),
  hours_impact: real("hours_impact").notNull().default(0),
  description: text("description").notNull().default(""),
  mitigation: text("mitigation").notNull().default(""),
  affected_components: jsonb("affected_components").notNull().default([])
}, (t) => [primaryKey({ columns: [t.pack_id, t.pattern_id] })]);
const knowledgeDependencyChains = pgTable("knowledge_dependency_chains", {
  pack_id: text("pack_id").notNull().references(() => knowledgePacks.id, { onDelete: "cascade" }),
  chain_id: text("chain_id").notNull(),
  predecessor: text("predecessor").notNull(),
  successors: jsonb("successors").notNull().default([]),
  dependency_type: text("dependency_type").notNull().default("hard"),
  reason: text("reason").notNull().default("")
}, (t) => [primaryKey({ columns: [t.pack_id, t.chain_id] })]);
const knowledgePhaseMappings = pgTable("knowledge_phase_mappings", {
  pack_id: text("pack_id").notNull().references(() => knowledgePacks.id, { onDelete: "cascade" }),
  phase_id: text("phase_id").notNull(),
  phase_name: text("phase_name").notNull().default(""),
  phase_order: integer("phase_order").notNull().default(0),
  component_ids: jsonb("component_ids").notNull().default([])
}, (t) => [primaryKey({ columns: [t.pack_id, t.phase_id] })]);
const knowledgeRoles = pgTable("knowledge_roles", {
  pack_id: text("pack_id").notNull().references(() => knowledgePacks.id, { onDelete: "cascade" }),
  role_id: text("role_id").notNull(),
  description: text("description").notNull().default(""),
  typical_rate_range: text("typical_rate_range").notNull().default("")
}, (t) => [primaryKey({ columns: [t.pack_id, t.role_id] })]);
const migrationPaths = pgTable("migration_paths", {
  id: text("id").primaryKey(),
  source_pack_id: text("source_pack_id").notNull().references(() => knowledgePacks.id, { onDelete: "cascade" }),
  target_pack_id: text("target_pack_id").notNull().references(() => knowledgePacks.id, { onDelete: "cascade" }),
  prevalence: text("prevalence").notNull().default(""),
  complexity: text("complexity").notNull().default(""),
  typical_duration: text("typical_duration").notNull().default(""),
  primary_drivers: jsonb("primary_drivers").notNull().default([]),
  prerequisites: jsonb("prerequisites").notNull().default([]),
  service_map: jsonb("service_map").notNull().default({}),
  migration_tools: jsonb("migration_tools").notNull().default([]),
  path_gotcha_patterns: jsonb("path_gotcha_patterns").notNull().default([]),
  path_effort_adjustments: jsonb("path_effort_adjustments").notNull().default([]),
  step_by_step: text("step_by_step").notNull().default(""),
  decision_points: text("decision_points").notNull().default(""),
  case_studies: text("case_studies").notNull().default(""),
  incompatibilities: text("incompatibilities").notNull().default(""),
  confidence: text("confidence").notNull().default("draft"),
  last_researched: timestamp("last_researched", { mode: "string" }),
  version: text("version").notNull().default("1"),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow()
}, (t) => [
  unique("uq_migration_path_pair").on(t.source_pack_id, t.target_pack_id),
  index("idx_migration_paths_source").on(t.source_pack_id),
  index("idx_migration_paths_target").on(t.target_pack_id)
]);
const knowledgeAiAlternatives = pgTable("knowledge_ai_alternatives", {
  pack_id: text("pack_id").notNull().references(() => knowledgePacks.id, { onDelete: "cascade" }),
  tool_id: text("tool_id").notNull(),
  name: text("name").notNull().default(""),
  vendor: text("vendor").notNull().default(""),
  category: text("category").notNull().default(""),
  description: text("description").notNull().default(""),
  url: text("url").notNull().default(""),
  applicable_components: jsonb("applicable_components").notNull().default([]),
  applicable_phases: jsonb("applicable_phases").notNull().default([]),
  hours_saved: jsonb("hours_saved").notNull().default({}),
  cost: jsonb("cost").notNull().default({}),
  pros: jsonb("pros").notNull().default([]),
  cons: jsonb("cons").notNull().default([]),
  prerequisites: jsonb("prerequisites").notNull().default([]),
  recommendation: text("recommendation").notNull().default("conditional"),
  applicability_conditions: jsonb("applicability_conditions").notNull().default({}),
  mutual_exclusion_group: text("mutual_exclusion_group")
}, (t) => [primaryKey({ columns: [t.pack_id, t.tool_id] })]);
const knowledgeSourceUrls = pgTable("knowledge_source_urls", {
  id: serial("id").primaryKey(),
  pack_id: text("pack_id").references(() => knowledgePacks.id, { onDelete: "cascade" }),
  migration_path_id: text("migration_path_id").references(() => migrationPaths.id, { onDelete: "cascade" }),
  source_url: text("source_url").notNull(),
  title: text("title").notNull().default(""),
  source_type: text("source_type").notNull().default("vendor-docs"),
  accessed_at: timestamp("accessed_at", { mode: "string" }).notNull().defaultNow(),
  claims: jsonb("claims").notNull().default([]),
  confidence: text("confidence").notNull().default("medium"),
  still_accessible: boolean("still_accessible").notNull().default(true)
}, (t) => [
  index("idx_source_urls_pack").on(t.pack_id),
  index("idx_source_urls_path").on(t.migration_path_id)
]);
const assessmentKnowledgePins = pgTable("assessment_knowledge_pins", {
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  pack_id: text("pack_id").notNull().references(() => knowledgePacks.id, { onDelete: "cascade" }),
  pinned_version: integer("pinned_version").notNull(),
  pinned_at: timestamp("pinned_at", { mode: "string" }).notNull().defaultNow()
}, (t) => [primaryKey({ columns: [t.assessment_id, t.pack_id] })]);
const knowledgeProficiencyCatalog = pgTable("knowledge_proficiency_catalog", {
  category_id: text("category_id").primaryKey(),
  name: text("name").notNull().default(""),
  description: text("description").notNull().default(""),
  adoption_base_hours: real("adoption_base_hours").notNull().default(0),
  maps_to_tools: jsonb("maps_to_tools").notNull().default([]),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow()
});
const wbsSnapshots = pgTable("wbs_snapshots", {
  id: serial("id").primaryKey(),
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  estimate_version: integer("estimate_version").notNull().default(1),
  total_items: integer("total_items").notNull().default(0),
  total_hours: real("total_hours").notNull().default(0),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow()
}, (t) => [unique("uq_wbs_version").on(t.assessment_id, t.version)]);
const workItems = pgTable("work_items", {
  id: serial("id").primaryKey(),
  snapshot_id: integer("snapshot_id").notNull().references(() => wbsSnapshots.id, { onDelete: "cascade" }),
  parent_id: integer("parent_id"),
  type: text("type").notNull().default("story"),
  // epic|feature|story|task|spike
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  hours: real("hours").notNull().default(0),
  base_hours: real("base_hours").notNull().default(0),
  role: text("role"),
  phase_id: text("phase_id").notNull().default(""),
  component_id: text("component_id").notNull().default(""),
  labels: jsonb("labels").notNull().default([]),
  acceptance_criteria: jsonb("acceptance_criteria").notNull().default([]),
  priority: text("priority").notNull().default("medium"),
  confidence: text("confidence").notNull().default("medium"),
  sort_order: integer("sort_order").notNull().default(0),
  source: text("source").notNull().default("generated"),
  // generated|custom
  blocked_by: jsonb("blocked_by").notNull().default([]),
  blocks: jsonb("blocks").notNull().default([])
}, (t) => [
  index("idx_work_items_snapshot").on(t.snapshot_id),
  index("idx_work_items_parent").on(t.parent_id)
]);
const teamSnapshots = pgTable("team_snapshots", {
  id: serial("id").primaryKey(),
  assessment_id: text("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  estimate_version: integer("estimate_version").notNull().default(1),
  assumptions: jsonb("assumptions").notNull().default({}),
  cost_projection: jsonb("cost_projection").notNull().default({}),
  phase_staffing: jsonb("phase_staffing").notNull().default([]),
  hiring_notes: jsonb("hiring_notes").notNull().default([]),
  notes: text("notes").notNull().default(""),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow()
}, (t) => [unique("uq_team_version").on(t.assessment_id, t.version)]);
const teamRoles = pgTable("team_roles", {
  id: serial("id").primaryKey(),
  snapshot_id: integer("snapshot_id").notNull().references(() => teamSnapshots.id, { onDelete: "cascade" }),
  role_id: text("role_id").notNull(),
  role_name: text("role_name").notNull().default(""),
  total_hours: real("total_hours").notNull().default(0),
  base_hours: real("base_hours").notNull().default(0),
  headcount: integer("headcount").notNull().default(1),
  allocation: text("allocation").notNull().default("full-time"),
  seniority: text("seniority").notNull().default("mid"),
  rate_min: real("rate_min").notNull().default(0),
  rate_max: real("rate_max").notNull().default(0),
  rate_override: real("rate_override"),
  phases: jsonb("phases").notNull().default([]),
  notes: text("notes").notNull().default(""),
  source: text("source").notNull().default("generated"),
  sort_order: integer("sort_order").notNull().default(0)
}, (t) => [index("idx_team_roles_snapshot").on(t.snapshot_id)]);
const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  session_id: text("session_id").notNull(),
  event: text("event").notNull(),
  category: text("category").notNull().default(""),
  properties: jsonb("properties").notNull().default({}),
  path: text("path").notNull().default(""),
  assessment_id: text("assessment_id"),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow()
}, (t) => [
  index("idx_analytics_events_session").on(t.session_id),
  index("idx_analytics_events_event").on(t.event),
  index("idx_analytics_events_created_at").on(t.created_at)
]);
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  activeMultipliers,
  aiSelections,
  analyticsEvents,
  assessmentKnowledgePins,
  assessments,
  assumptions,
  calibrationAiTools,
  calibrationComponents,
  calibrationPhases,
  calibrations,
  challengeReviews,
  clientProficiencies,
  clients,
  deliverables,
  dependencyChains,
  discoveryAnswers,
  discoveryDimensions,
  estimateComponents,
  estimateSnapshots,
  knowledgeAiAlternatives,
  knowledgeDependencyChains,
  knowledgeDiscoveryTrees,
  knowledgeEffortHours,
  knowledgeGotchaPatterns,
  knowledgeMultipliers,
  knowledgePackVersions,
  knowledgePacks,
  knowledgePhaseMappings,
  knowledgeProficiencyCatalog,
  knowledgeRoles,
  knowledgeSourceUrls,
  migrationPaths,
  riskClusters,
  risks,
  scopeExclusions,
  teamRoles,
  teamSnapshots,
  wbsSnapshots,
  workItems,
  workspaceState
}, Symbol.toStringTag, { value: "Module" }));
const { Pool } = pg;
let _pool = null;
let _db = null;
function getDb(connectionStringOverride) {
  if (_db)
    return _db;
  const connectionString = connectionStringOverride || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  _pool = new Pool({
    connectionString,
    max: process.env.DB_POOL_SIZE ? parseInt(process.env.DB_POOL_SIZE, 10) : 5
  });
  _db = drizzle(_pool, { schema });
  return _db;
}
async function closeDb() {
  if (_pool) {
    await _pool.end();
    _pool = null;
    _db = null;
  }
}
const db = () => getDb(private_env.DATABASE_URL);
const db$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  db
}, Symbol.toStringTag, { value: "Module" }));

var db$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	A: knowledgeAiAlternatives,
	B: knowledgeSourceUrls,
	C: teamSnapshots,
	D: teamRoles,
	E: wbsSnapshots,
	F: workItems,
	G: challengeReviews,
	H: migrationPaths,
	I: calibrations,
	J: calibrationPhases,
	K: calibrationComponents,
	L: calibrationAiTools,
	M: deliverables,
	N: assessmentKnowledgePins,
	O: closeDb,
	P: getDb,
	Q: knowledgeProficiencyCatalog,
	R: db$1,
	a: analyticsEvents,
	b: assessments,
	c: aiSelections,
	d: db,
	e: discoveryDimensions,
	f: discoveryAnswers,
	g: activeMultipliers,
	h: dependencyChains,
	i: riskClusters,
	j: assumptions,
	k: estimateSnapshots,
	l: estimateComponents,
	m: clients,
	n: clientProficiencies,
	o: knowledgePacks,
	p: knowledgePackVersions,
	q: knowledgeEffortHours,
	r: risks,
	s: scopeExclusions,
	t: knowledgeMultipliers,
	u: knowledgeGotchaPatterns,
	v: knowledgeDependencyChains,
	w: workspaceState,
	x: knowledgePhaseMappings,
	y: knowledgeRoles,
	z: knowledgeDiscoveryTrees
});

export { isNull as $, scopeExclusions as A, is as B, Column as C, like as D, gt as E, gte as F, lte as G, asc as H, clients as I, ilike as J, clientProficiencies as K, knowledgePackVersions as L, or as M, knowledgeEffortHours as N, knowledgeMultipliers as O, knowledgeGotchaPatterns as P, knowledgeDependencyChains as Q, knowledgePhaseMappings as R, knowledgeRoles as S, knowledgeDiscoveryTrees as T, migrationPaths as U, aiSelections as V, deliverables as W, wbsSnapshots as X, workItems as Y, teamSnapshots as Z, teamRoles as _, assumptions as a, lt as a0, assessmentKnowledgePins as a1, closeDb as a2, getDb as a3, knowledgeProficiencyCatalog as a4, db$2 as a5, desc as b, challengeReviews as c, db as d, estimateSnapshots as e, calibrations as f, calibrationPhases as g, calibrationComponents as h, calibrationAiTools as i, assessments as j, knowledgePacks as k, estimateComponents as l, activeMultipliers as m, knowledgeSourceUrls as n, knowledgeAiAlternatives as o, analyticsEvents as p, inArray as q, risks as r, sql as s, eq as t, discoveryDimensions as u, discoveryAnswers as v, workspaceState as w, and as x, dependencyChains as y, riskClusters as z };
//# sourceMappingURL=db-BWpbog7L.js.map
