const express = require('express');

const router = express.Router();

const Computer = require('../models/Computer');

router.get('/', async (req, res) => {
  const computers = await Computer
    .find({})
    .sort('name')
    .lean({
      virtuals: ['status', 'type', 'user', 'use', 'user', 'system',
        'createdAtLocale', 'updatedAtLocale', 'lastInfoDatetimeFrom']
    });
  res.status(200).send(computers);
});

router.get('/mdt', (req, res) => {
  Computer.dataTables({
    limit: req.query.length,
    skip: req.query.start,
    order: req.query.order,
    columns: req.query.columns,
    oFilters: req.query.oFilters,
    search: req.query.search,
    // sort: {
    //   updatedAt: -1
    // },
    formatter: (computer) => {
      return {
        name: computer.name,
        online: computer.online ? 'Online' : 'Offline',
        systemInfo: computer.systemInfo,
        createdAtLocale: computer.createdAtLocale,
        updatedAtLocale: computer.updatedAtLocale,
        lastInfoDatetimeFrom: computer.lastInfoDatetimeFrom,
        action: `<a class="btn btn-primary btn-sm mr-1" href="/computer/user/${computer.name}" target="_blank" data-toggle="tooltip" data-placement="top" title="Sesiones de usuario"><i class="fa fa-user mr-0"></i></a><a class="btn btn-secondary btn-sm" href="/computer/status/${computer.name}" target="_blank" data-toggle="tooltip" data-placement="top" title="Encendidos y apagados"><i class="fa fa-desktop mr-0"></i></a>`
      };
    }
  }).then((table) => {
    res.json({
      data: table.data,
      recordsFiltered: table.totalFiltered,
      recordsTotal: table.total
    });
  });
});

router.get('/dt', async (req, res) => {
  const {
    draw, length, order, search, start, columns
  } = req.query;

  const skip = Number(start);
  const limit = Number(length);
  const iDraw = Number(draw);

  let sort = '';

  if (order) {
    order.forEach((ord) => {
      const { column, dir } = ord;
      const columnObject = columns[parseInt(column, 10)];
      if (columnObject.orderable === 'true') {
        const colOrder = dir === 'asc' ? '' : '-';
        const colName = columnObject.data;
        sort += colOrder;
        if (colName === 'name') {
          sort += 'name ';
        }
        if (colName === 'status') {
          sort += 'online ';
        }
        if (colName === 'type') {
          sort += 'systemInfo.facters.tipo ';
        }
        if (colName === 'system') {
          sort += 'systemInfo.facters.sistema ';
        }
        if (colName === 'use') {
          sort += 'systemInfo.facters.uso ';
        }
        if (colName === 'user') {
          sort += 'systemInfo.facters.usuario ';
        }
        if (colName === 'createdAtLocale') {
          sort += 'createdAt ';
        }
        if (colName === 'updatedAtLocale') {
          sort += 'updatedAt ';
        }
        if (colName === 'lastInfoDatetimeFrom') {
          sort += 'lastInfoDatetime ';
        }
      }
    });
  }
  sort = sort.trim();

  const { value, regex } = search;
  let searchObj = {};
  let searchCol = {};
  // global searching
  if (value) {
    const searchList = [];
    searchObj = { $or: searchList };
    let search = value;
    // if (regex === 'true') {
    search = new RegExp(value, 'i');
    // } else {
    //   search = value;
    // }
    // global searching
    columns.forEach((column) => {
      if (column.searchable === 'true') {
        // global searching
        let searchDate;
        const s = {};
        let c = column.data;
        if (column.data !== 'status') {
          if (column.data === 'type') {
            c = 'systemInfo.facters.tipo';
          }
          if (column.data === 'system') {
            c = 'systemInfo.facters.sistema';
          }
          if (column.data === 'use') {
            c = 'systemInfo.facters.uso';
          }
          if (column.data === 'user') {
            c = 'systemInfo.facters.usuario';
          }
          if (column.data === 'createdAtLocale') {
            c = 'createdAt';
            searchDate = new Date(value);
          }
          if (column.data === 'updatedAtLocale') {
            c = 'updatedAt';
            searchDate = new Date(value);
          }
          if (column.data === 'lastInfoDatetimeFrom') {
            c = 'lastInfoDatetime';
            searchDate = new Date(value);
          }
          if (['createdAt', 'updatedAt', 'lastInfoDatetime'].includes(c)) {
            if (!isNaN(searchDate)) {
              s[c] = {
                $gte: searchDate
              }
              searchList.push(s)
            }
          } else {
            s[c] = search;
            searchList.push(s);
          }
        } else {
          c = 'online';
          if (search.test('Online')) {
            s[c] = true;
            searchList.push(s);
          }
          if (search.test('Offline')) {
            s[c] = false;
            searchList.push(s);
          }
        }
      }
    });
  };

  // column searching
  columns.forEach((column) => {
    if (column.searchable === 'true') {
      const w = {};
      if (column.search.value !== '') {
        let c = column.data;
        if (c === 'type') c = 'systemInfo.facters.tipo';
        if (c === 'system') c = 'systemInfo.facters.sistema';

        let { value, regex } = column.search;
        if (regex === 'true') {
          value = new RegExp(value, 'i');
        }
        searchCol[c] = value;
      }    
    }
  });

  const recordsTotal = await Computer.estimatedDocumentCount();
  const recordsFiltered = await Computer.countDocuments(searchObj);
  const computers = await Computer.find(searchObj)
    .where(searchCol)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .lean({
      virtuals: ['status', 'type', 'user', 'use', 'user', 'system',
        'createdAtLocale', 'updatedAtLocale', 'lastInfoDatetimeFrom']
    })
    .exec();
  const response = {
    draw: iDraw,
    recordsTotal,
    recordsFiltered,
    data: computers
  };
  return res.status(200).json(response);
});

router.get('/filters', async (req, res) => {
  const status = await Computer
    .find({})
    .distinct('online')
    .lean({
      virtuals: ['status']
    })
    .exec();

  const type = await Computer
    .find({})
    .distinct('systemInfo.facters.tipo')
    .lean({
      virtuals: ['type']
    })
    .exec();

    const system = await Computer
    .find({})
    .distinct('systemInfo.facters.sistema')
    .lean({
      virtuals: ['system']
    })
    .exec();

    const use = await Computer
    .find({})
    .distinct('systemInfo.facters.uso')
    .lean({
      virtuals: ['use']
    })
    .exec();

    const user = await Computer
    .find({})
    .distinct('systemInfo.facters.usuario')
    .lean({
      virtuals: ['user']
    })
    .exec();

  res.send({ 
    status,
    type,
    system,
    use,
    user
  });
});

router.get('/:name', async (req, res) => {
  const { name } = req.params;
  const computer = await Computer.findOne({ name });
  return res.status(computer ? 200 : 204).json(computer);
});

module.exports = router;
