/* eslint-env jquery, browser */
$(document).ready(() => {

  $('#computer-status').DataTable({
    responsive: true,
    rowId: '_id',
    order: [[ 1, "desc"]],
    // stateSave: true,
    columns: [
      {
        data: 'computer',
        name: 'Ordenador',
        orderable: false,
        searchable: false,
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
