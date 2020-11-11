/* eslint-env jquery, browser */
$(document).ready(() => {

  $('#computer-user').DataTable({
    responsive: true,
    rowId: '_id',
    order: [[ 3, "desc"]],
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
        data: 'user.photo',
        name: 'Foto',
        orderable: false,
        searchable: false,
        defaultContent: 'No Disp.'
      },
      {
        data: 'user.fullNameRev',
        name: 'Usuario',
        defaultContent: 'No Disp.'
      },
      {
        data: 'at',
        name: 'Fecha',
        defaultContent: 'No Disp.'
      },
      {
        data: 'actionSpanish',
        name: 'Acción',
        defaultContent: 'No Disp.'
      }
    ]
  });
});
