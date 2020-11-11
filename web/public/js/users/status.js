/* eslint-env jquery, browser */
$(document).ready(() => {

  $('#user-status').DataTable({
    responsive: true,
    rowId: '_id',
    order: [[ 3, "desc"]],
    // stateSave: true,
    columns: [
      {
        data: 'photo',
        name: 'Foto',
        orderable: false,
        searchable: false,
        defaultContent: 'No Disp.'
      },
      {
        data: 'user',
        name: 'Usuario',
        orderable: false,
        searchable: false,
        defaultContent: 'No Disp.'
      },
      {
        data: 'computer',
        name: 'Ordenador',
        defaultContent: 'No Disp.'
      },
      {
        data: 'at',
        name: 'Fecha',
        defaultContent: 'No Disp.'
      },
      {
        data: 'statusSpanish',
        name: 'Estado',
        defaultContent: 'No Disp.'
      }
    ]
  });
});
