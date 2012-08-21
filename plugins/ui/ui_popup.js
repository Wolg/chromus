(function() {
  var App, Controls, Footer, Player, Playlist, PlaylistView, Track, TrackInfo, clear_playlist,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Handlebars.registerHelper('lfm_img', function(context) {
    var image;
    if (context.images == null) context.images = context.image;
    if (!context.images) return "about:blank";
    image = context.images[0];
    if (typeof context.images[0] !== "string") {
      try {
        return context.images[1]["#text"];
      } catch (error) {

      }
    } else {
      return context.images[0];
    }
  });

  Track = (function(_super) {

    __extends(Track, _super);

    function Track() {
      Track.__super__.constructor.apply(this, arguments);
    }

    return Track;

  })(Backbone.Model);

  Playlist = (function(_super) {

    __extends(Playlist, _super);

    function Playlist() {
      Playlist.__super__.constructor.apply(this, arguments);
    }

    Playlist.prototype.model = Track;

    return Playlist;

  })(Backbone.Collection);

  Player = (function(_super) {

    __extends(Player, _super);

    function Player() {
      Player.__super__.constructor.apply(this, arguments);
    }

    Player.prototype.initialize = function() {
      _.bindAll(this, "listener");
      this.playlist = new Playlist();
      this.state = new Backbone.Model();
      this.settings = new Backbone.Model({
        repeat: false,
        shuffle: false
      });
      return browser.addMessageListener(this.listener);
    };

    Player.prototype.currentTrack = function() {
      return this.playlist.get(this.get('current_track'));
    };

    Player.prototype.play = function(track_id) {
      var track;
      if (track_id == null) track_id = this.get('current_track');
      track = this.playlist.get(track_id);
      if (!track.get('action')) {
        this.set({
          'current_track': track_id
        });
        this.state.set({
          'name': 'playing'
        });
      } else {
        track.set({
          'song': "Loading..."
        });
      }
      return browser.postMessage({
        method: 'play',
        track: parseInt(track_id)
      });
    };

    Player.prototype.pause = function() {
      this.state.set({
        'name': 'paused'
      });
      return browser.postMessage({
        method: 'pause'
      });
    };

    Player.prototype.next = function() {
      return browser.postMessage({
        method: 'nextTrack'
      });
    };

    Player.prototype.setPosition = function(position) {
      this.state.set({
        'played': position
      });
      return browser.postMessage({
        method: 'setPosition',
        position: position
      });
    };

    Player.prototype.setVolume = function(volume) {
      this.set({
        'volume': volume
      });
      return browser.postMessage({
        method: 'setVolume',
        volume: volume
      });
    };

    Player.prototype.setSettings = function(data) {
      this.settings.set(data);
      return browser.postMessage({
        method: 'setSettings',
        data: data
      });
    };

    Player.prototype.listener = function(msg) {
      var _ref;
      if (msg.method.match("^sm2")) return;
      if (!msg.method.match('(playerState|updateState)')) {
        console.log("Popup received message", msg.method, msg);
      } else {
        if (msg.track && ((_ref = msg.state.name) === "playing" || _ref === "loading")) {
          this.playlist.get(msg.track.id).set(msg.track);
          this.set({
            'current_track': msg.track.id
          });
        }
      }
      if (msg.settings != null) this.settings.set(msg.settings);
      if (msg.volume != null) {
        this.set({
          'volume': msg.volume
        });
      }
      if (msg.state != null) this.state.set(msg.state);
      if (msg.playlist) return this.playlist.reset(msg.playlist);
    };

    return Player;

  })(Backbone.Model);

  Controls = (function(_super) {

    __extends(Controls, _super);

    function Controls() {
      Controls.__super__.constructor.apply(this, arguments);
    }

    Controls.prototype.el = $('#header');

    Controls.prototype.search_template = Handlebars.templates['search_results.tmpl'];

    Controls.prototype.events = {
      "click .inner": "setPosition",
      "click .progress": "setPosition",
      "click .toggle": "togglePlaying",
      "click .next": "nextTrack",
      "click .search": "toggleSearch",
      "keyup .search_bar .text": "search"
    };

    Controls.prototype.initialize = function() {
      var opts,
        _this = this;
      _.bindAll(this);
      this.model.state.bind('change', this.updateState);
      opts = {
        lines: 8,
        length: 2,
        width: 2,
        radius: 3,
        color: "#fff"
      };
      this.spinner = new Spinner(opts);
      this.updateState(this.model.state);
      $('.panel.search span.add_to_playlist').live('click', function(evt) {
        return _this.addToPlaylist(evt);
      });
      return $('.panel.search a.ex_container').live('click', function(evt) {
        return _this.playSearchedTrack(evt);
      });
    };

    Controls.prototype.updateState = function(state) {
      var toggle, track;
      track = this.model.currentTrack();
      state = state.toJSON();
      toggle = this.$('.toggle').removeClass('play pause');
      this.spinner.stop();
      switch (state.name) {
        case "playing":
        case "stopped":
          toggle.addClass('play');
          break;
        case "paused":
          toggle.addClass('pause');
          break;
        case "loading":
          this.spinner.spin(toggle[0]);
          break;
        default:
          toggle.addClass('play');
      }
      if (track != null ? track.get('duration') : void 0) {
        this.$('.inner').width(state.played / track.get('duration') * 100 + '%');
        this.$('.time').html("-" + prettyTime(track.get('duration') - state.played));
        if (state.buffered == null) state.buffered = 0;
        return this.$('.progress').width(state.buffered / track.get('duration') * 100 + '%');
      } else {
        return this.$('.time').html(prettyTime(0));
      }
    };

    Controls.prototype.setPosition = function(evt) {
      var position, track;
      track = this.model.currentTrack();
      position = (evt.offsetX / 278) * track.get('duration');
      return this.model.setPosition(position);
    };

    Controls.prototype.togglePlaying = function() {
      if (this.model.state.get('name') === "paused") {
        return this.model.play();
      } else {
        return this.model.pause();
      }
    };

    Controls.prototype.nextTrack = function() {
      return this.model.next();
    };

    Controls.prototype.toggleSearch = function() {
      var _ref,
        _this = this;
      $('#first_run .search-tip').hide();
      this.$el.toggleClass('search_mode');
      if (this.$el.hasClass('search_mode')) {
        this.$('.search_bar').addClass('show');
        setTimeout(function() {
          return _this.$('.search_bar').find('input').focus();
        }, 500);
        return this.search_panel = chromus.openPanel(this.search_template((_ref = this.search_view) != null ? _ref : {})).addClass('search');
      } else {
        this.$('.search_bar').removeClass('show');
        return chromus.closePanel();
      }
    };

    Controls.prototype.search = _.debounce(function(evt) {
      var render, text, _ref,
        _this = this;
      if ((_ref = evt.keyCode) === 40 || _ref === 45 || _ref === 37 || _ref === 39 || _ref === 38) {
        return;
      }
      text = evt.currentTarget.value;
      if (!text.trim()) {
        return this.$('.search_bar .result').html('');
      } else {
        $('#first_run .search-tip').hide();
        this.search_view = {
          'search_term': text,
          'show_tracks': function(fn) {
            var _ref2;
            if (!this.tracks || ((_ref2 = this.tracks) != null ? _ref2.length : void 0)) {
              return fn(this);
            }
          },
          'show_albums': function(fn) {
            var _ref2;
            if (!this.albums || ((_ref2 = this.albums) != null ? _ref2.length : void 0)) {
              return fn(this);
            }
          },
          'show_artists': function(fn) {
            var _ref2;
            if (!this.artists || ((_ref2 = this.artists) != null ? _ref2.length : void 0)) {
              return fn(this);
            }
          }
        };
        render = function() {
          var _ref2;
          return _this.search_panel.html(_this.search_template((_ref2 = _this.search_view) != null ? _ref2 : {})).find('.loader').spin('small');
        };
        render();
        chromus.plugins.lastfm.artist.search(text, function(artists) {
          if (artists == null) artists = [];
          _this.search_view.artists = _.first(artists, 4);
          return render();
        });
        chromus.plugins.lastfm.track.search(text, function(tracks) {
          if (tracks == null) tracks = [];
          _this.search_view.tracks = _.first(tracks, 4);
          return render();
        });
        return chromus.plugins.lastfm.album.search(text, function(albums) {
          if (albums == null) albums = [];
          _this.search_view.albums = _.first(albums, 4);
          return render();
        });
      }
    }, 500);

    Controls.prototype.playSearchedTrack = function(evt) {
      var track_info;
      track_info = getTrackInfo(evt.currentTarget);
      browser.postMessage({
        method: 'play',
        track: track_info,
        playlist: [track_info]
      });
      return this.toggleSearch();
    };

    Controls.prototype.addToPlaylist = function(evt) {
      var track_info;
      track_info = getTrackInfo(evt.currentTarget.parentNode);
      browser.postMessage({
        method: 'addToPlaylist',
        tracks: [track_info]
      });
      this.toggleSearch();
      return evt.stopPropagation();
    };

    return Controls;

  })(Backbone.View);

  TrackInfo = (function(_super) {

    __extends(TrackInfo, _super);

    function TrackInfo() {
      TrackInfo.__super__.constructor.apply(this, arguments);
    }

    TrackInfo.prototype.el = $('#current_song');

    TrackInfo.prototype.events = {
      "click .album_img": "albumCover"
    };

    TrackInfo.prototype.template = Handlebars.templates['track_info.tmpl'];

    TrackInfo.prototype.initialize = function() {
      _.bindAll(this, "updateInfo");
      this.model.bind('change:current_track', this.updateInfo);
      return this.model.playlist.bind('all', _.debounce(this.updateInfo, 500));
    };

    TrackInfo.prototype.updateInfo = function() {
      var last_fm, track, _ref;
      track = (_ref = this.model.currentTrack()) != null ? _ref.toJSON() : void 0;
      if (!track) return this.$el.empty();
      if (track.images == null) {
        track.images = [
          chromus.plugins.lastfm.image({
            artist: track.artist
          })
        ];
      }
      last_fm = "http://last.fm/music";
      track.artist_url = "" + last_fm + "/" + track.artist;
      track.album_url = "" + last_fm + "/" + track.artist + "/" + track.album;
      track.song_url = "" + last_fm + "/" + track.artist + "/_/" + track.song;
      return this.$el.html(this.template(track)).show();
    };

    TrackInfo.prototype.albumCover = function() {
      var img, src, track;
      return false;
      track = this.model.currentTrack();
      if (track.get('images').length) {
        img = new Image();
        src = _.last(track.get('images'));
        if (typeof src !== "string") src = src['#text'];
        img.src = src;
        img.onclick = function() {
          return $('#dialog').hide();
        };
        $('#dialog .content').html(img);
        return $('#dialog').show();
      }
    };

    return TrackInfo;

  })(Backbone.View);

  Footer = (function(_super) {

    __extends(Footer, _super);

    function Footer() {
      Footer.__super__.constructor.apply(this, arguments);
    }

    Footer.prototype.el = $('#footer');

    Footer.prototype.events = {
      "click .menu": "toggleMenu",
      "click .volume": "toggleVolume",
      "click .volume_bar .bar_bg": "setVolume",
      "click .shuffle": "toggleShuffle",
      "click .repeat": "toggleRepeat"
    };

    Footer.prototype.initialize = function() {
      _.bindAll(this);
      this.model.bind('change:volume', this.updateVolume);
      this.model.settings.bind('change', this.updateSettings);
      this.updateVolume();
      return $(document).bind('click', function(evt) {
        if ($('#main_menu').css('display') !== 'none' && !$(evt.target).hasClass('menu')) {
          if (!$(evt.target).closest('#main_menu').length) {
            return $('#main_menu').hide();
          }
        }
      });
    };

    Footer.prototype.toggleMenu = function() {
      $('#first_run .settings-tip').hide();
      return $('#main_menu').toggle();
    };

    Footer.prototype.toggleVolume = function() {
      return this.model.setVolume(0);
    };

    Footer.prototype.setVolume = function(evt) {
      var total_width, volume;
      total_width = this.$('.volume_bar .bar_bg').width();
      volume = evt.layerX / total_width * 100;
      return this.model.setVolume(volume);
    };

    Footer.prototype.updateVolume = function() {
      return this.$('.volume_bar .bar').css({
        width: this.model.get('volume') + "%"
      });
    };

    Footer.prototype.toggleShuffle = function() {
      return this.model.setSettings({
        'shuffle': !this.$('.shuffle').hasClass('active')
      });
    };

    Footer.prototype.toggleRepeat = function() {
      return this.model.setSettings({
        'repeat': !this.$('.repeat').hasClass('active')
      });
    };

    Footer.prototype.updateSettings = function() {
      this.$('.shuffle').toggleClass('active', this.model.settings.get('shuffle'));
      return this.$('.repeat').toggleClass('active', this.model.settings.get('repeat'));
    };

    return Footer;

  })(Backbone.View);

  PlaylistView = (function(_super) {

    __extends(PlaylistView, _super);

    function PlaylistView() {
      PlaylistView.__super__.constructor.apply(this, arguments);
    }

    PlaylistView.prototype.el = $('#playlist');

    PlaylistView.prototype.template = Handlebars.templates['playlist.tmpl'];

    PlaylistView.prototype.events = {
      "click #playlist .song": "togglePlaying"
    };

    PlaylistView.prototype.initialize = function() {
      var evt, render_limiter, _i, _len, _ref;
      _.bindAll(this, 'updatePlaylist', 'updateCurrent');
      render_limiter = _.debounce(this.updatePlaylist, 200);
      _ref = ['change:song', 'change:artist', 'add', 'remove', 'reset'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        evt = _ref[_i];
        this.model.playlist.bind(evt, render_limiter);
      }
      this.model.bind("change:current_track", this.updateCurrent);
      return this.$el.find('.nano').nanoScroller();
    };

    PlaylistView.prototype.togglePlaying = function(evt) {
      var id;
      id = +$(evt.currentTarget).attr('data-id');
      if (this.model.get('current_track') === id) {
        return this.model.pause();
      } else {
        return this.model.play(id);
      }
    };

    PlaylistView.prototype.artistPlaylistCount = function(artist, start_from) {
      var count, track, _i, _len, _ref;
      count = 0;
      _ref = this.model.playlist.models.slice(start_from, (start_from + 3) + 1 || 9e9);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        track = _ref[_i];
        if (track.get('artist') === artist) count++;
      }
      return count;
    };

    PlaylistView.prototype.updateCurrent = function() {
      var current;
      this.$('.song.playing').removeClass('playing');
      current = this.model.get('current_track');
      if (current) {
        return this.$(".track_container.id" + current + " .song").addClass('playing');
      }
    };

    PlaylistView.prototype.updatePlaylist = function() {
      var helpers, merge_rows, model, playlist, track, view, _i, _len;
      merge_rows = 0;
      playlist = this.model.playlist.toJSON();
      for (_i = 0, _len = playlist.length; _i < _len; _i++) {
        track = playlist[_i];
        if (track.images == null) {
          track.images = [
            chromus.plugins.lastfm.image({
              artist: track.artist
            })
          ];
        }
        track.previous = playlist[_i - 1];
        track.next = playlist[_i + 1];
        if (!track.previous || track.previous.artist !== track.artist) {
          track.artist_playlist_count = this.artistPlaylistCount(track.artist, _i);
        }
      }
      view = {
        playlist: playlist
      };
      model = this.model;
      helpers = {
        is_previous: function(fn) {
          if (!this.previous || this.previous.artist !== this.artist) {
            return fn(this);
          }
        },
        is_next: function(fn) {
          if (!this.next || this.next.artist !== this.artist) return fn(this);
        },
        title: function(fn) {
          if (this.type === 'artist') {
            return "Loading...";
          } else {
            return this.song || this.name;
          }
        },
        more_then_two: function(fn) {
          if (this.artist_playlist_count > 2) return fn(this);
        },
        is_current: function(fn) {
          if (this.id === model.get('current_track')) return fn(this);
        }
      };
      helpers = _.defaults(helpers, Handlebars.helpers);
      this.$el.find('.container').html(this.template(view, {
        helpers: helpers
      }));
      this.$el.css({
        visibility: 'visible'
      });
      this.$el.find('.track_container').each(function(idx, el) {
        if (idx % 2 === 0) return $(el).addClass('odd');
      });
      return this.$el.find('.nano').nanoScroller();
    };

    return PlaylistView;

  })(Backbone.View);

  App = (function(_super) {

    __extends(App, _super);

    function App() {
      App.__super__.constructor.apply(this, arguments);
    }

    App.prototype.initialize = function() {
      this.model = new Player();
      this.playlist = new PlaylistView({
        model: this.model
      });
      this.controls = new Controls({
        model: this.model
      });
      this.track_info = new TrackInfo({
        model: this.model
      });
      this.footer = new Footer({
        model: this.model
      });
      $('#dialog').bind('click', function(evt) {
        if (evt.target.id === "dialog") return $('#dialog').hide();
      });
      if (browser.isPokki) {
        $('#minimize').bind('click', function() {
          return pokki.closePopup();
        });
      }
      if (!store.get('first_run')) {
        $('#first_run').show();
        $('#first_run > div').bind('click', function(evt) {
          return $(evt.currentTarget).remove();
        });
        store.set('first_run', true);
      }
      return $('.panel .back').live('click', function(evt) {
        return $('#header').removeClass('search_mode').find('.search_bar').removeClass('show');
      });
    };

    App.prototype.start = function() {
      return browser.postMessage({
        method: 'ui:init'
      });
    };

    return App;

  })(Backbone.View);

  this.app = new App();

  $(function() {
    return browser.onReady(function() {
      return app.start();
    });
  });

  clear_playlist = $('<li>Clear playlist</li>').bind('click', function() {
    $('#main_menu').hide();
    return browser.postMessage({
      method: "clearPlaylist"
    });
  });

  chromus.addMenu(clear_playlist);

}).call(this);
