/* eslint-env jquery, browser */
$(document).ready(() => {

  // Spanish datatables
  $.extend( $.fn.dataTable.defaults, {
    "language": {
      // "url": "//cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
      "url": "/Spanish.json"
    }    
  } );    


});
