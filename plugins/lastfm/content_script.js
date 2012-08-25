(function() {

  _.extend(this.chromus.utils, {
    urlType: function(url) {
      var params;
      params = _.rest(url.replace(/https?\:\/\//, '').split('/'));
      switch (params[0]) {
        case "music":
          if (params.length === 2) {
            return "band";
          } else if (params[2] === '_') {
            return "song";
          } else if (params[2][0] === '+') {
            return "music";
          } else if (params.length === 3) {
            return "album";
          }
          break;
        default:
          return params[0];
      }
    }
  });

}).call(this);
