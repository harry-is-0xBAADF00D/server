(function() {

  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  Handlebars.registerHelper('list', function(items, options) {
    var out = "<ul>";

    for(var i=0, l=items.length; i<l; i++) {
      out = out + "<li>" + options.fn(items[i]) + "</li>";
    }

    return out + "</ul>";
  });

  var userProfileSource = document.getElementById('user-profile-template').innerHTML,
      userProfileTemplate = Handlebars.compile(userProfileSource),
      userProfilePlaceholder = document.getElementById('user-profile');

  var userPlaylistsSource = document.getElementById('user-playlists-template').innerHTML,
      userPlaylistsTemplate = Handlebars.compile(userPlaylistsSource),
      userPlaylistsPlaceholder = document.getElementById('user-playlists');

  var params = getHashParams();

  console.log(params);

  var access_token = params.access_token,
      refresh_token = params.refresh_token,
      error = params.error;

  if (error) {
    alert('There was an error during the authentication');
  } else {
    if (access_token) {

      $.ajax({
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            console.log(response);
            userProfilePlaceholder.innerHTML = userProfileTemplate(response);

            $('#login').hide();
            $('#loggedin').show();
          }
      });

      $.ajax({
          url: 'https://api.spotify.com/v1/me/playlists',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            console.log(response);
            var playlists = {
              playlists: response
            }
            userPlaylistsPlaceholder.innerHTML = userPlaylistsTemplate(playlists);
          }
      });



    } else {
        // render initial screen
        $('#login').show();
        $('#loggedin').hide();
    }

  }

  
  graphics();

})();