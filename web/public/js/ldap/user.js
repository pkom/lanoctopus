$(document).ready(() => {

  fetch('/api/ldap/user')
    .then((response) => response.json())
    .then((data) => {
      $('#ldapusers').DataTable({
        processing: true,
        data: data,
        responsive: true,
        order: [[ 2, "asc"]],
        columns: [
          {
            data: 'tipo',
            name: 'Tipo',
            defaultContent: 'No Disp.'
          },
          {
            data: 'photo',
            name: 'Foto',
            orderable: false,
            searchable: false,
            defaultContent: 'No Disp.'
          },
          {
            data: 'name',
            name: 'Nombre',
            defaultContent: 'No Disp.'
          },
          {
            data: 'user',
            name: 'Usuario',
            defaultContent: 'No Disp.'
          },
          {
            data: 'uid',
            name: 'Uid',
            defaultContent: 'No Disp.'
          },
          {
            data: 'gid',
            name: 'Gid',
            defaultContent: 'No Disp.'
          },
          {
            data: 'id',
            name: 'Id',
            defaultContent: 'No Disp.'
          }
        ]
      });
    





    })
    .catch((err) => console.error(err.message))

});
