
/*
Class WrapperManager

This Class is responsible for managing page change for Last.fm site.

We have a lot of blocks with songs on site.
For each block you need to create new wrapper and register it in InjectionManager like this:

manager.registerWrapper('ul.mediumChartWithImages', SongsChart)

All wrappers have same interface and inherited from MusicDomElement.
*/

(function() {
  var AlbumsLibrary, AlbumsMedium, ArtistRecomendations, ArtistRecsPreview, ArtistsLargeThumbnails, ArtistsWithInfo, FriendsLoved, MusicDomElement, NewReleases, NowPlaying, RecentAlbums, SingleTrack, TrackList, WrapperManager, manager,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  WrapperManager = (function() {

    WrapperManager.prototype.registred_wrappers = {};

    function WrapperManager() {
      this.init();
    }

    WrapperManager.prototype.init = function() {
      var title, type;
      this.artist = void 0;
      this.track_count = 0;
      this.container_count = 0;
      try {
        title = document.querySelector("meta[property=\"og:title\"]").content;
        type = document.querySelector("meta[property=\"og:type\"]").content;
        if (type === "song" || type === "band" || type === "album") {
          return this.artist = title.split(" – ")[0];
        }
      } catch (e) {
        type = null;
        try {
          return this.artist = document.querySelector("#libraryBreadcrumb h2").innerText;
        } catch (e) {

        }
      }
    };

    /*
      WrapperManager#wrapMusicElements() -> null
    
      Uses all registered wrappers to handle all the possible elements on the page.
    */

    WrapperManager.prototype.wrapMusicElements = function() {
      var artist, class_name, css_expr, elements, i, wrapper, _results;
      artist = this.artist;
      _results = [];
      for (css_expr in this.registred_wrappers) {
        wrapper = this.registred_wrappers[css_expr];
        elements = document.querySelectorAll(css_expr);
        i = 0;
        if (elements.length > 0) console.warn("Using wrapper: " + css_expr);
        _results.push((function() {
          var _results2;
          _results2 = [];
          while (i < elements.length) {
            class_name = elements[i].className || "";
            if (!class_name.match("with_vk_search")) {
              try {
                new wrapper(elements[i], artist).injectSearch();
                this.container_count += 1;
              } catch (e) {
                console.warn(elements[i]);
                console.warn(e.message);
              }
              elements[i].className += " with_vk_search";
              elements[i].setAttribute("data-index-number", this.container_count);
            }
            _results2.push(i++);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };

    WrapperManager.prototype.registerWrapper = function(css_expr, wrapper) {
      return this.registred_wrappers[css_expr] = wrapper;
    };

    return WrapperManager;

  })();

  manager = new WrapperManager();

  /*
  Base Class for all wrappers
  */

  MusicDomElement = (function() {

    MusicDomElement.prototype.child_items_pattern = "tbody tr:not(.artist)";

    function MusicDomElement(element, artist) {
      this.element = element;
      this.artist = artist;
    }

    /*
      MusicDomElement#getTrack(element) -> Array
      - element (Element): table row, li, or other element with track information
    
      Get track information from given element.
      Returns Array -> [artist, track]
    */

    MusicDomElement.prototype.getTrack = function(el) {
      return console.error("You should redefine this function");
    };

    /*
      MusicDomElement#inserLink(element, track) -> Array
      - element (Element): table row, li, or other element with track information
      - track (String): Track obtained from MusicDomElement#getTrack
    
      Insert play and search link
    */

    MusicDomElement.prototype.insertLink = function(el, track) {
      return console.error("Abstract function");
    };

    /*
      Finds all parent blocks matching a pattern, and injects play and search links into all matching childs.
    */

    MusicDomElement.prototype.injectSearch = function() {
      var childs, counter, i, track, track_info, _results;
      track = void 0;
      if (!this.element) return false;
      childs = this.element.querySelectorAll(this.child_items_pattern);
      counter = 0;
      i = 0;
      _results = [];
      while (i < childs.length) {
        try {
          track_info = this.getTrack(childs[i]);
          if (!track_info) continue;
          if (track_info[0]) {
            childs[i].className += " ex_container";
            childs[i].setAttribute("data-artist", track_info[0] || this.artist);
            track = void 0;
            if (track_info[1]) {
              childs[i].setAttribute("data-song", track_info[1]);
              track = track_info.join(" - ");
            } else {
              track = track_info[0];
              if (track_info[2]) {
                childs[i].className += " ex_album";
                childs[i].setAttribute("data-album", track_info[2]);
              } else {
                childs[i].className += " ex_artist";
              }
            }
            if (this.insertLink(childs[i], track) !== false) {
              if (track_info[1]) {
                childs[i].setAttribute("data-index-number", counter);
                counter += 1;
              }
            }
          }
        } catch (e) {
          console.error("Can't wrap row:", e.message, childs[i]);
        }
        _results.push(i++);
      }
      return _results;
    };

    MusicDomElement.prototype.generateAudioLink = function(track) {
      var link;
      link = "<a href=\"javascript:;\" target='_blank' class='sm2_button' title='Play song' id='ex_button_" + manager.track_count + "' >" + track + "</a>";
      manager.track_count += 1;
      return link;
    };

    return MusicDomElement;

  })();

  /*
    Most popular block. User/Artist charts.
  */

  TrackList = (function(_super) {

    __extends(TrackList, _super);

    function TrackList() {
      TrackList.__super__.constructor.apply(this, arguments);
    }

    TrackList.prototype.getTrack = function(row) {
      var track_info;
      track_info = row.querySelectorAll(".subjectCell a");
      if (track_info.length === 0) track_info = row.querySelectorAll(".subject a");
      if (track_info.length === 0) track_info = row.querySelectorAll(".track a");
      if (this.artist && !this.element.className.match("big") && !document.getElementById("thePlaylist")) {
        return [this.artist, track_info[0].innerText];
      } else {
        return [track_info[0].innerText, (track_info[1] ? track_info[1].innerText : undefined)];
      }
    };

    TrackList.prototype.insertLink = function(row, track) {
      var td, td_playbtn;
      td = row.querySelector("td.smallmultibuttonCell, td.multibuttonCell");
      td_playbtn = row.querySelector("td.playbuttonCell");
      if (td_playbtn) {
        return td_playbtn.innerHTML = this.generateAudioLink(track);
      } else {
        return false;
      }
    };

    return TrackList;

  })(MusicDomElement);

  manager.registerWrapper("table.tracklist, table.chart", TrackList);

  /*
  Track page, http://www.lastfm.ru/music/Ke$ha/_/TiK+ToK
  */

  SingleTrack = (function(_super) {

    __extends(SingleTrack, _super);

    function SingleTrack() {
      SingleTrack.__super__.constructor.apply(this, arguments);
    }

    SingleTrack.prototype.child_items_pattern = "span[itemprop=name]";

    SingleTrack.prototype.getTrack = function() {
      var song;
      song = document.querySelector(".track-overview h1 span[itemprop=name]").innerText;
      return [this.artist, song];
    };

    SingleTrack.prototype.insertLink = function(el, track) {
      el.innerHTML = this.generateAudioLink(track) + " " + el.innerHTML;
      return el.className = el.className + " ex_container";
    };

    return SingleTrack;

  })(MusicDomElement);

  manager.registerWrapper(".track-overview h1", SingleTrack);

  FriendsLoved = (function(_super) {

    __extends(FriendsLoved, _super);

    function FriendsLoved() {
      FriendsLoved.__super__.constructor.apply(this, arguments);
    }

    FriendsLoved.prototype.child_items_pattern = "li";

    FriendsLoved.prototype.getTrack = function(li) {
      var track_info;
      track_info = li.querySelectorAll(".object strong a");
      return [track_info[track_info.length - 2].innerText, track_info[track_info.length - 1].innerText];
    };

    FriendsLoved.prototype.insertLink = function(li, track) {
      var elm;
      elm = li.querySelector(".object");
      if (elm.querySelector(".previewbutton")) {
        elm.querySelector(".previewbutton").style.display = "none";
      }
      return elm.innerHTML = generateAudioLink(track) + elm.innerHTML;
    };

    return FriendsLoved;

  })(MusicDomElement);

  manager.registerWrapper("#friendsLoved", FriendsLoved);

  NowPlaying = (function(_super) {

    __extends(NowPlaying, _super);

    function NowPlaying() {
      NowPlaying.__super__.constructor.apply(this, arguments);
    }

    NowPlaying.prototype.child_items_pattern = "li";

    NowPlaying.prototype.getTrack = function(li) {
      var track_info;
      track_info = li.querySelectorAll(".track a");
      return [track_info[track_info.length - 2].innerText, track_info[track_info.length - 1].innerText];
    };

    NowPlaying.prototype.insertLink = function(li, track) {
      var elm;
      elm = li.querySelector(".track");
      return elm.innerHTML = this.generateAudioLink(track) + elm.innerHTML;
    };

    return NowPlaying;

  })(MusicDomElement);

  manager.registerWrapper("#nowPlaying", NowPlaying);

  /*
  Used in artists library
  */

  ArtistsLargeThumbnails = (function(_super) {

    __extends(ArtistsLargeThumbnails, _super);

    function ArtistsLargeThumbnails() {
      ArtistsLargeThumbnails.__super__.constructor.apply(this, arguments);
    }

    ArtistsLargeThumbnails.prototype.child_items_pattern = "li";

    ArtistsLargeThumbnails.prototype.getTrack = function(li) {
      var artist;
      try {
        artist = li.querySelector("strong.name").innerHTML;
      } catch (_error) {}
      return [artist];
    };

    ArtistsLargeThumbnails.prototype.insertLink = function(li, track) {
      var playbtn;
      playbtn = li.querySelector(".playbutton");
      if (playbtn) li.removeChild(playbtn);
      return li.innerHTML += this.generateAudioLink(track);
    };

    return ArtistsLargeThumbnails;

  })(MusicDomElement);

  manager.registerWrapper("ul.artistsLarge", ArtistsLargeThumbnails);

  /*
  www.lastfm.ru/home/recs
  */

  ArtistRecomendations = (function(_super) {

    __extends(ArtistRecomendations, _super);

    function ArtistRecomendations() {
      ArtistRecomendations.__super__.constructor.apply(this, arguments);
    }

    ArtistRecomendations.prototype.child_items_pattern = "li";

    ArtistRecomendations.prototype.getTrack = function(li) {
      var artist;
      artist = li.querySelector("h2 a.name").innerHTML;
      return [artist];
    };

    ArtistRecomendations.prototype.insertLink = function(li, track) {
      var elm, playbtn;
      elm = li.querySelector("h2");
      playbtn = elm.querySelector("a.playbutton");
      if (playbtn) elm.removeChild(playbtn);
      return elm.innerHTML = this.generateAudioLink(track) + elm.innerHTML;
    };

    return ArtistRecomendations;

  })(MusicDomElement);

  manager.registerWrapper("ul#artistRecs", ArtistRecomendations);

  /*
  www.lastfm.ru/home Recomendations block
  */

  ArtistRecsPreview = (function(_super) {

    __extends(ArtistRecsPreview, _super);

    function ArtistRecsPreview() {
      ArtistRecsPreview.__super__.constructor.apply(this, arguments);
    }

    ArtistRecsPreview.prototype.child_items_pattern = "li";

    ArtistRecsPreview.prototype.getTrack = function(li) {
      var artist;
      artist = li.querySelector("strong.name").innerHTML;
      return [artist];
    };

    ArtistRecsPreview.prototype.insertLink = function(li, track) {
      var elm, playbtn;
      elm = li.querySelector(".container");
      elm.innerHTML += this.generateAudioLink(track);
      playbtn = elm.querySelector(".playbutton");
      if (playbtn) return elm.removeChild(playbtn);
    };

    return ArtistRecsPreview;

  })(MusicDomElement);

  manager.registerWrapper("ul.artistRecs", ArtistRecsPreview);

  /*
  www.lastfm.ru/music/Camille/+similar
  */

  ArtistsWithInfo = (function(_super) {

    __extends(ArtistsWithInfo, _super);

    function ArtistsWithInfo() {
      ArtistsWithInfo.__super__.constructor.apply(this, arguments);
    }

    ArtistsWithInfo.prototype.child_items_pattern = "li";

    ArtistsWithInfo.prototype.getTrack = function(li) {
      var artist;
      artist = li.querySelector("a.artist strong").innerHTML;
      return [artist];
    };

    ArtistsWithInfo.prototype.insertLink = function(li, track) {
      var playbtn;
      li.innerHTML += this.generateAudioLink(track);
      playbtn = li.querySelector(".playbutton");
      if (playbtn) return li.removeChild(playbtn);
    };

    return ArtistsWithInfo;

  })(MusicDomElement);

  manager.registerWrapper("ul.artistsWithInfo", ArtistsWithInfo);

  /*
  www.lastfm.ru/home
  www.lastfm.ru/music/Carla+Bruni/+albums
  */

  AlbumsMedium = (function(_super) {

    __extends(AlbumsMedium, _super);

    function AlbumsMedium() {
      AlbumsMedium.__super__.constructor.apply(this, arguments);
    }

    AlbumsMedium.prototype.child_items_pattern = "li";

    AlbumsMedium.prototype.getTrack = function(li) {
      var album, artist;
      if (li.parentNode.className.match(/lfmDropDownBody/)) return false;
      artist = li.querySelector("a.artist").innerHTML;
      album = li.querySelector("strong a").childNodes[1].nodeValue.replace(/^\s+/, "");
      return [artist, undefined, album];
    };

    AlbumsMedium.prototype.insertLink = function(li, track) {
      var elm, playbtn;
      li.innerHTML += this.generateAudioLink(track);
      elm = li.querySelector("div.resContainer");
      playbtn = elm.querySelector(".playbutton");
      if (playbtn) return elm.removeChild(playbtn);
    };

    return AlbumsMedium;

  })(MusicDomElement);

  manager.registerWrapper("ul.albumsMedium, ul.albumsLarge", AlbumsMedium);

  /*
  www.lastfm.ru/user/buger_swamp/library/music/Carla+Bruni
  */

  AlbumsLibrary = (function(_super) {

    __extends(AlbumsLibrary, _super);

    function AlbumsLibrary() {
      AlbumsLibrary.__super__.constructor.apply(this, arguments);
    }

    AlbumsLibrary.prototype.child_items_pattern = "li";

    AlbumsLibrary.prototype.getTrack = function(li) {
      var album;
      album = li.querySelector("strong.title").innerHTML;
      return [this.artist, undefined, album];
    };

    AlbumsLibrary.prototype.insertLink = function(li, track) {
      var elm;
      elm = li.querySelector("span.albumCover");
      return elm.innerHTML = this.generateAudioLink(track) + elm.innerHTML;
    };

    return AlbumsLibrary;

  })(MusicDomElement);

  manager.registerWrapper("#albumstrip ul", AlbumsLibrary);

  /*
  www.lastfm.ru/home/newreleases
  */

  NewReleases = (function(_super) {

    __extends(NewReleases, _super);

    function NewReleases() {
      NewReleases.__super__.constructor.apply(this, arguments);
    }

    NewReleases.prototype.getTrack = function(tr) {
      var album, artist;
      album = tr.querySelector(".release a.title strong");
      if (!album) return false;
      album = album.innerHTML;
      artist = tr.querySelector(".library a.artist strong").innerHTML;
      return [artist, undefined, album];
    };

    NewReleases.prototype.insertLink = function(tr, track) {
      var elm, playbtn;
      elm = tr.querySelector(".release");
      elm.innerHTML = this.generateAudioLink(track) + elm.innerHTML;
      playbtn = elm.querySelector(".playbutton");
      if (playbtn) return elm.removeChild(playbtn);
    };

    return NewReleases;

  })(MusicDomElement);

  manager.registerWrapper("#newReleases", NewReleases);

  /*
  www.last.fm/tag/baroque%20pop Recently added block
  */

  RecentAlbums = (function(_super) {

    __extends(RecentAlbums, _super);

    function RecentAlbums() {
      RecentAlbums.__super__.constructor.apply(this, arguments);
    }

    RecentAlbums.prototype.child_items_pattern = "li";

    RecentAlbums.prototype.getTrack = function(li) {
      var album, artist;
      if (li.parentNode.className.match(/lfmDropDownBody/)) return false;
      album = li.querySelector("a.album strong").innerHTML;
      artist = li.querySelector("a.artist").innerHTML;
      console.log("Album:", album);
      return [artist, undefined, album];
    };

    RecentAlbums.prototype.insertLink = function(li, track) {
      var playbtn;
      li.innerHTML += this.generateAudioLink(track);
      playbtn = li.querySelector(".playbutton");
      if (playbtn) return li.removeChild(playbtn);
    };

    return RecentAlbums;

  })(MusicDomElement);

  manager.registerWrapper("ul.recentAlbums", RecentAlbums);

  chromus.plugins.lastfm.manager = manager;

}).call(this);
