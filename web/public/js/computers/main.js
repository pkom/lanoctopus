/* eslint-env jquery, browser */
$(document).ready(() => {
  $('#computers').DataTable({
    responsive: true,
    processing: true,
    serverSide: true,
    rowId: '_id',
    order: [[ 7, "desc"]],
    ajax: {
      url: '/api/computer/mdt',
      data: (d) => {
        d.oFilters = [
          {
            displayField: 'createdAtLocale',
            field: 'createdAt',
            type: 'date'
          },
          {
            displayField: 'updatedAtLocale',
            field: 'updatedAt',
            type: 'date'
          },
          {
            displayField: 'lastInfoDatetimeFrom',
            field: 'lastInfoDatetime',
            type: 'date'
          },
          {
            displayField: 'online',
            field: 'online',
            type: 'boolean',
            valueIfTrue: 'Online',
            valueIfFalse: 'Offline'
          }
        ];
      }
    },
    // stateSave: true,
    columns: [
      {
        data: 'name',
        name: 'Equipo',
        defaultContent: 'No Disp.'
      },
      {
        data: 'online',
        name: 'Estado',
        defaultContent: 'No Disp.'
      },
      {
        data: 'systemInfo.facters.tipo',
        name: 'Tipo',
        defaultContent: 'No Disp.'
      },
      {
        data: 'systemInfo.facters.sistema',
        name: 'Sistema',
        defaultContent: 'No Disp.'
      },
      {
        data: 'systemInfo.facters.uso',
        name: 'Uso',
        defaultContent: 'No Disp.'
      },
      {
        data: 'systemInfo.facters.usuario',
        name: 'Usuario',
        defaultContent: 'No Disp.'
      },
      {
        data: 'createdAtLocale',
        name: 'Creado',
        defaultContent: 'No Disp.'
      },
      {
        data: 'updatedAtLocale',
        name: 'Actualizado',
        defaultContent: 'No Disp.'
      },
      {
        data: 'lastInfoDatetimeFrom',
        name: 'Informado',
        searchable: 'false',
        defaultContent: 'No Disp.'
      },
      {
        data: 'action',
        defaultContent: `<button><a href="/computer/user/infolab-pro" target="_blank">Usuarios</a></button><button>Estados</button>`,
        searchable: false,
        orderable: false
      }
    ]
  });
  // $('#computers-client').DataTable({
  //   columns: [
  //     { data: 'name'},
  //     { data: 'status'},
  //     { data: 'type'},
  //     { data: 'system'},
  //     { data: 'use'},
  //     { data: 'user'},
  //     { data: 'createAtLocale'},
  //     { data: 'updatedAtLocale'},
  //     { data: 'lastInfoDatetimeLocale'}
  //   ],
  //   stateSave: true,
  //   initComplete() {
  //     this.api().columns([1, 2, 3, 4, 5]).every(function() {
  //       const column = this;
  //       const select = $('<select><option value=""></option></select>')
  //         .appendTo($(column.footer()).empty())
  //         .on('change', function () {
  //           const val = $.fn.dataTable.util.escapeRegex($(this).val());
  //           column
  //             .search(val ? `^${val}$` : '', true, false)
  //             .draw();
  //         });

  //       column.data().unique().sort().each((d, j) => {
  //         select.append(`<option value="${d}">${d}</option>`);
  //       });
  //     });
  //   }
  // });
});
