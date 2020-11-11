function dataTablesPlugin(schema, options) {
  options = options || {};
  const totalKey = options.totalKey || 'total';
  const totalKeyFiltered = options.totalKey || 'totalFiltered';
  const dataKey = options.dataKey || 'data';
  const formatters = options.formatters || {};

  schema.statics.dataTables = function (params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = {};
    }

    callback = callback || (() => {});

    const thisSchema = this;
    const limit = parseInt(params.limit, 10);
    const skip = parseInt(params.skip, 10);
    const select = params.select || {};
    const find = params.find || {};
    let sort = params.sort || {};
    const search = params.search || {};
    const order = params.order || [];
    const columns = params.columns || [];
    const { formatter } = params;
    const { oFilters } = params;

    if (search && search.value) {
      find.$or = [];
      const searchQuery = {
        $regex: search.value,
        $options: 'i'
      };
      columns.forEach((column) => {
        if (column.searchable === 'true') {
          const obj = {};
          const oFilter = oFilters.find((field) => field.displayField === column.data);
          if (oFilter) {
            if (oFilter.type === 'date') {
              const date = new Date(search.value);
              if (!isNaN(date)) {
                obj[oFilter.field] = { $gte: date };
                find.$or.push(obj);
              }
            }
            if (oFilter.type === 'boolean') {
              const regex = new RegExp(search.value, 'i');
              if (regex.test(oFilter.valueIfTrue)) {
                obj[oFilter.field] = true;
                find.$or.push(obj);
              }
              if (regex.test(oFilter.valueIfFalse)) {
                obj[oFilter.field] = false;
                find.$or.push(obj);
              }
            }
          } else {
            obj[column.data] = searchQuery;
            find.$or.push(obj);
          }
        }
      });
    }

    if (order && columns) {
      const sortByOrder = order.reduce((memo, ordr) => {
        const column = columns[ordr.column];
        const oFilter = oFilters.find((field) => field.displayField === column.data);
        if (oFilter) {
          memo[oFilter.field] = ordr.dir === 'asc' ? 1 : -1;
        } else {
          memo[column.data] = ordr.dir === 'asc' ? 1 : -1;
        }
        return memo;
      }, {});

      if (Object.keys(sortByOrder).length) {
        sort = sortByOrder;
      }
    }

    const query = thisSchema
      .find(find)
      .select(select)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    if (params.populate) {
      query.populate(params.populate);
    }

    return new Promise((resolve, reject) => {
      // validate formatter
      // formatters can be a function or a string from a formatter defined on options
      if (formatter && !(
        typeof formatter === 'function'
          || (typeof formatter === 'string' && formatters[formatter])
      )) {
        return reject(new Error('Invalid formatter'));
      }

      Promise
        .all([query.exec(), thisSchema.countDocuments(find), thisSchema.estimatedDocumentCount()])
        .then((results) => {
          const response = {};
          response[totalKeyFiltered] = results[1];
          response[totalKey] = results[2];

          if (typeof formatter === 'string' && formatters[formatter]) {
            response[dataKey] = results[0].map(formatters[formatter]);
          } else if (typeof formatter === 'function') {
            response[dataKey] = results[0].map(formatter);
          } else {
            response[dataKey] = results[0];
          }

          resolve(response);
          callback(null, response);
        })
        .catch((err) => {
          reject(err);
          callback(err);
        });
    });
  };
}

module.exports = dataTablesPlugin;
