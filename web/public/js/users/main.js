/* eslint-env jquery, browser */
$(document).ready(() => {

  $('#act-ldap').on('click', async function(evt) {
    $(this).attr("disabled", true);
    $(this).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Procesando');
    try {
      await axios.post('/api/ldap/updateusers');
    } catch (err) {
      alert(`Se ha producido un error: ${err.message}`)
    };
    $(this).removeAttr("disabled");
    $(this).text('LDAP Act');
  });

  $('#users').DataTable({
    // dom: 'Bflrtip',
    // buttons: [
    //     {
    //         text: `<button class="btn btn-primary" type="button">LDAP Act</button>`,
    //         action: function ( e, dt, node, config ) {
    //             alert( 'Button activated' );
    //         }
    //     }
    // ],
    responsive: true,
    processing: true,
    serverSide: true,
    rowId: '_id',
    order: [[ 7, "desc"]],
    ajax: {
      url: '/api/user/mdt',
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
        name: 'Usuario',
        defaultContent: 'No Disp.'
      },
      {
        data: 'online',
        name: 'Estado',
        defaultContent: 'No Disp.'
      },
      {
        data: 'profile.lastName',
        name: 'Apellidos',
        defaultContent: 'No Disp.'
      },
      {
        data: 'profile.firstName',
        name: 'Nombre',
        defaultContent: 'No Disp.'
      },
      {
        data: 'profile.employeeNumber',
        name: 'Nombre',
        defaultContent: 'No Disp.'
      },
      {
        data: 'photo',
        name: 'Foto',
        defaultContent: 'No Disp.',
        orderable: false,
        searchable: false
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
        data: 'action',
        name: 'Acciones',
        orderable: false,
        searchable: false,
        defaultContent: 'No Disp.'
      }
    ]
  });
});
