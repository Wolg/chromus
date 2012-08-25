###
Class WrapperManager

This Class is responsible for managing page change for Last.fm site.

We have a lot of blocks with songs on site.
For each block you need to create new wrapper and register it in InjectionManager like this:

manager.registerWrapper('ul.mediumChartWithImages', SongsChart)

All wrappers have same interface and inherited from MusicDomElement.
###

class WrapperManager

  registred_wrappers: {}

  constructor: -> 
    @init()


  init: ->
    @artist = undefined
    @track_count = 0
    @container_count = 0

    try
      title = document.querySelector("meta[property=\"og:title\"]").content
      type = document.querySelector("meta[property=\"og:type\"]").content

      if type is "song" or type is "band" or type is "album"
        @artist = title.split(" – ")[0]
    catch e
      type = null

      try
        @artist = document.querySelector("#libraryBreadcrumb h2").innerText  
      catch e      


  ###
  WrapperManager#wrapMusicElements() -> null

  Uses all registered wrappers to handle all the possible elements on the page.
  ###
  wrapMusicElements: ->
    
    #    if(window.location.toString().match(/\/event\//))
    #        return
    artist = @artist
    for css_expr of @registred_wrappers

      wrapper = @registred_wrappers[css_expr]
      elements = document.querySelectorAll(css_expr)
      i = 0

      console.warn "Using wrapper: #{css_expr}" if elements.length > 0


      while i < elements.length
        class_name = elements[i].className or ""

        unless class_name.match("with_vk_search")
          try
            new wrapper(elements[i], artist).injectSearch()
            @container_count += 1
          catch e
            console.warn elements[i]
            console.warn e.message
          elements[i].className += " with_vk_search"
          elements[i].setAttribute "data-index-number", @container_count
        i++

  registerWrapper: (css_expr, wrapper) ->
    @registred_wrappers[css_expr] = wrapper

manager = new WrapperManager()

###
Base Class for all wrappers
###
class MusicDomElement

  child_items_pattern: "tbody tr:not(.artist)"

  constructor: (element, artist) ->
    @element = element
    @artist = artist

  ###
  MusicDomElement#getTrack(element) -> Array
  - element (Element): table row, li, or other element with track information

  Get track information from given element.
  Returns Array -> [artist, track]
  ###
  getTrack: (el) ->
    console.error "You should redefine this function"


  ###
  MusicDomElement#inserLink(element, track) -> Array
  - element (Element): table row, li, or other element with track information
  - track (String): Track obtained from MusicDomElement#getTrack

  Insert play and search link
  ###
  insertLink: (el, track) ->
    console.error "Abstract function"


  ###
  Finds all parent blocks matching a pattern, and injects play and search links into all matching childs.
  ###
  injectSearch: ->
    track = undefined
    return false  unless @element

    childs = @element.querySelectorAll(@child_items_pattern)
    counter = 0
    i = 0    

    while i < childs.length
      try
        track_info = @getTrack(childs[i])
        continue  unless track_info
        if track_info[0]
          childs[i].className += " ex_container"
          childs[i].setAttribute "data-artist", (track_info[0]||@artist)
          track = undefined
          if track_info[1]
            childs[i].setAttribute "data-song", track_info[1]
            track = track_info.join(" - ")
          else
            track = track_info[0]
            if track_info[2]
              childs[i].className += " ex_album"
              childs[i].setAttribute "data-album", track_info[2]
            else
              childs[i].className += " ex_artist"
          unless @insertLink(childs[i], track) is false
            if track_info[1]
              childs[i].setAttribute "data-index-number", counter
              counter += 1
      catch e
        console.error "Can't wrap row:", e.message, childs[i]
      i++

  generateAudioLink: (track) ->
    link = "<a href=\"javascript:;\" target='_blank' class='sm2_button' title='Play song' id='ex_button_" + manager.track_count + "' >" + track + "</a>"
    manager.track_count += 1
    link


###
  Most popular block. User/Artist charts.
###
class TrackList extends MusicDomElement

  getTrack: (row) ->
    track_info = row.querySelectorAll(".subjectCell a")
    track_info = row.querySelectorAll(".subject a")  if track_info.length is 0
    track_info = row.querySelectorAll(".track a")  if track_info.length is 0
    
    # If inside artist page
    if @artist and not @element.className.match("big") and not document.getElementById("thePlaylist")
      [@artist, track_info[0].innerText]
    else
      [track_info[0].innerText, (if track_info[1] then track_info[1].innerText else `undefined`)]

  insertLink: (row, track) ->
    td = row.querySelector("td.smallmultibuttonCell, td.multibuttonCell")
    td_playbtn = row.querySelector("td.playbuttonCell")
    if td_playbtn
      td_playbtn.innerHTML = @generateAudioLink(track)
    else
      false

manager.registerWrapper "table.tracklist, table.chart", TrackList


###
Track page, http://www.lastfm.ru/music/Ke$ha/_/TiK+ToK
###
class SingleTrack extends MusicDomElement

  child_items_pattern: "span[itemprop=name]"

  getTrack: ->
    #    var artist = document.querySelector('.breadcrumb a').innerHTML
    song = document.querySelector(".track-overview h1 span[itemprop=name]").innerText
    [@artist, song]

  insertLink: (el, track) ->
    el.innerHTML = @generateAudioLink(track) + " " + el.innerHTML
    el.className = el.className + " ex_container"

manager.registerWrapper ".track-overview h1", SingleTrack


class FriendsLoved extends MusicDomElement

  child_items_pattern: "li"

  getTrack: (li) ->
    track_info = li.querySelectorAll(".object strong a")
    [track_info[track_info.length - 2].innerText, track_info[track_info.length - 1].innerText]

  insertLink: (li, track) ->
    elm = li.querySelector(".object")
    elm.querySelector(".previewbutton").style.display = "none"  if elm.querySelector(".previewbutton")
    elm.innerHTML = generateAudioLink(track) + elm.innerHTML

manager.registerWrapper "#friendsLoved", FriendsLoved


class NowPlaying extends MusicDomElement

  child_items_pattern: "li"

  getTrack: (li) ->
    track_info = li.querySelectorAll(".track a")
    [track_info[track_info.length - 2].innerText, track_info[track_info.length - 1].innerText]

  insertLink: (li, track) ->
    elm = li.querySelector(".track")
    elm.innerHTML = @generateAudioLink(track) + elm.innerHTML

manager.registerWrapper "#nowPlaying", NowPlaying


###
Used in artists library
###
class ArtistsLargeThumbnails extends MusicDomElement

  child_items_pattern: "li"

  getTrack: (li) ->
    try
      artist = li.querySelector("strong.name").innerHTML
    [artist]

  insertLink: (li, track) ->
    playbtn = li.querySelector(".playbutton")
    li.removeChild playbtn  if playbtn
    li.innerHTML += @generateAudioLink(track)

manager.registerWrapper "ul.artistsLarge", ArtistsLargeThumbnails

###
www.lastfm.ru/home/recs
###
class ArtistRecomendations extends MusicDomElement

  child_items_pattern: "li"

  getTrack: (li) ->
    artist = li.querySelector("h2 a.name").innerHTML
    [artist]

  insertLink: (li, track) ->
    elm = li.querySelector("h2")
    playbtn = elm.querySelector("a.playbutton")
    elm.removeChild playbtn  if playbtn
    elm.innerHTML = @generateAudioLink(track) + elm.innerHTML

manager.registerWrapper "ul#artistRecs", ArtistRecomendations

###
www.lastfm.ru/home Recomendations block
###
class ArtistRecsPreview extends MusicDomElement

  child_items_pattern: "li"

  getTrack: (li) ->
    artist = li.querySelector("strong.name").innerHTML
    [artist]

  insertLink: (li, track) ->
    elm = li.querySelector(".container")
    elm.innerHTML += @generateAudioLink(track)
    playbtn = elm.querySelector(".playbutton")
    elm.removeChild playbtn  if playbtn

manager.registerWrapper "ul.artistRecs", ArtistRecsPreview


###
www.lastfm.ru/music/Camille/+similar
###
class ArtistsWithInfo extends MusicDomElement

  child_items_pattern: "li"

  getTrack: (li) ->
    artist = li.querySelector("a.artist strong").innerHTML
    [artist]

  insertLink: (li, track) ->
    li.innerHTML += @generateAudioLink(track)
    playbtn = li.querySelector(".playbutton")
    li.removeChild playbtn  if playbtn

manager.registerWrapper "ul.artistsWithInfo", ArtistsWithInfo

###
www.lastfm.ru/home
www.lastfm.ru/music/Carla+Bruni/+albums
###
class AlbumsMedium extends MusicDomElement

  child_items_pattern: "li"

  getTrack: (li) ->
    return false  if li.parentNode.className.match(/lfmDropDownBody/)
    artist = li.querySelector("a.artist").innerHTML
    album = li.querySelector("strong a").childNodes[1].nodeValue.replace(/^\s+/, "")
    [artist, `undefined`, album]

  insertLink: (li, track) ->
    li.innerHTML += @generateAudioLink(track)
    elm = li.querySelector("div.resContainer")
    playbtn = elm.querySelector(".playbutton")
    elm.removeChild playbtn  if playbtn

manager.registerWrapper "ul.albumsMedium, ul.albumsLarge", AlbumsMedium

###
www.lastfm.ru/user/buger_swamp/library/music/Carla+Bruni
###
class AlbumsLibrary extends MusicDomElement

  child_items_pattern: "li"

  getTrack: (li) ->
    album = li.querySelector("strong.title").innerHTML
    [@artist, `undefined`, album]

  insertLink: (li, track) ->
    elm = li.querySelector("span.albumCover")
    elm.innerHTML = @generateAudioLink(track) + elm.innerHTML

manager.registerWrapper "#albumstrip ul", AlbumsLibrary

###
www.lastfm.ru/home/newreleases
###
class NewReleases extends MusicDomElement

  getTrack: (tr) ->
    album = tr.querySelector(".release a.title strong")
    return false  unless album
    album = album.innerHTML
    artist = tr.querySelector(".library a.artist strong").innerHTML
    [artist, `undefined`, album]

  insertLink: (tr, track) ->
    elm = tr.querySelector(".release")
    elm.innerHTML = @generateAudioLink(track) + elm.innerHTML
    playbtn = elm.querySelector(".playbutton")
    elm.removeChild playbtn  if playbtn

manager.registerWrapper "#newReleases", NewReleases

###
www.last.fm/tag/baroque%20pop Recently added block
###
class RecentAlbums extends MusicDomElement
  
  child_items_pattern: "li"

  getTrack: (li) ->
    return false  if li.parentNode.className.match(/lfmDropDownBody/)
    album = li.querySelector("a.album strong").innerHTML
    artist = li.querySelector("a.artist").innerHTML
    console.log "Album:", album
    [artist, `undefined`, album]

  insertLink: (li, track) ->
    li.innerHTML += @generateAudioLink(track)
    playbtn = li.querySelector(".playbutton")
    li.removeChild playbtn  if playbtn

manager.registerWrapper "ul.recentAlbums", RecentAlbums


chromus.plugins.lastfm.manager = manager