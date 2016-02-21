var checkCode = function(code) {
  for (var i = 0; i < code.length; i++) {
    if (code[i] === ' ') {
      return false;
    }
  }
  return true;
}

var main = function() {
  /**
   * Login button
   */
  $('.login').on('click', function() {
    console.log('login button is clicked');
    swal({   title: "Error!",   text: "Here's my error message!",   type: "error",   confirmButtonText: "Cool" });
  });

  /**
   * Conference code form
   */
  $('.conf-code').keydown(function(key) {
    if (key.keyCode === 13) {

      var code = $('.conf-code').val().trim();
      if (!checkCode(code)) {
        console.log('코드에 공백 문자열이 있습니다.');
        // swal({title: "Error!", text: "Here's my error message!", type: "error",   confirmButtonText: "Cool" });
      } else {
        $.post( "localhost:3000/getConferenceId", { code: code })
          .done(function( data ) {
            alert( "Data Loaded: " + data );
          });
      }
      $('.conf-code').val('');
    }
  });

  
//  $('.conf-code').bind("keyup",showSweet).focus();
};

$(document).ready(main);
