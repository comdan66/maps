/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 OA Wu Design
 */

$(function () {
  var $map = $('#map');
  if (!$map.length) return;
  var $colors = $('#colors');
  var _map = null;
  var _timer = null;
  var _now = [];
  var _maxSpeed = 0;
  var _paths = [];
  var _polylines = [];
  var colors = ['#CCDDFF', '#99BBFF', '#5599FF', '#0066FF', '#0044BB', '#003C9D', '#003377', '#550088', '#770077'];
  // var colors = ['#CC00CC','#A500CC','#7700BB','#5500DD','#4400CC','#0000CC','#0044BB','#009FCC','#00DDDD','#00DDAA','#00DD77','#00DD00','#66DD00','#99DD00','#FFFF33','#FFDD55','#FFBB66','#FF7744','#FF5511','#FF0000',];

  function initMarker (path) {
    return {
      id: path.id,
      speed: path.s,
      pathMarker: new google.maps.Marker ({
        draggable: false,
        position: new google.maps.LatLng (path.lat, path.lng),
        icon: { path: 'M 0 0' }
      })
    };
  }
  function color (speed) {
    speed = parseInt ((colors.length / _maxSpeed) * speed, 10);
    return colors[speed] ? colors[speed] : colors[colors.length - 1];
  }
  function drawPolyline (unit) {
    if (_polylines[unit.user_id]) _polylines[unit.user_id].map (function (t) { t.setMap (null); });
    _polylines[unit.user_id] = [];

    paths = unit.paths.map (initMarker);

    for (var i = 1; i < paths.length; i++) {
      _polylines[unit.user_id].push (new google.maps.Polyline ({
          map: _map,
          strokeWeight: 6,
          path: [paths[i - 1].pathMarker.getPosition (), paths[i].pathMarker.getPosition ()],
          strokeColor: color (paths[i].speed)
        }));
    }
    return paths;
  }
  function loadPolyline () {
    $.ajax ({
      url: $('#polylines_url').val (),
      data: { },
      async: true, cache: false, dataType: 'json', type: 'GET',
      beforeSend: function () {}
    })
    .done (function (result) {
      if (!result.status) return;

      _maxSpeed = result.units.map (function (t, i) { return t.paths.max ('s'); }).max ();

      $colors.empty ().append (colors.map (function (c, i) {
        return $('<div />').text (parseInt ((_maxSpeed < 0 ? 0 : _maxSpeed * 3.6 / colors.length) * i, 10)).css ({ 'background-color': c });
      }));

      var bounds = new google.maps.LatLngBounds ();
      result.units.forEach (function (t, i) {
        if (!_paths[t.user_id]) _paths[t.user_id] = [];

        var paths = drawPolyline (t);
        var deletes = _paths[t.user_id].diff (paths, 'id');
        var adds = paths.diff (_paths[t.user_id], 'id');
        var delete_ids = deletes.column ('id');
        var add_ids = adds.column ('id');
        deletes.map (function (t) { t.pathMarker.setMap (null); });
        adds.map (function (t) { t.pathMarker.setMap (_map); });

        if (paths.length) {
          if (!_now[t.user_id]) {
            _now[t.user_id] = new MarkerWithLabel ({
              map: _map,
              position: paths[0].pathMarker.getPosition (),
              draggable: false,
              raiseOnDrag: false,
              clickable: true,
              labelContent: '<div class="avatar"><img src="' + t.avatar + '" /></div><div class="cover"></div><div class="arrow1"></div><div class="arrow2"></div>',
              labelAnchor: new google.maps.Point (60, 110),
              labelClass: "marker_label",
              icon: { path: 'M 0 0' }
            });
          } else {
            _now[t.user_id].setPosition (paths[0].pathMarker.getPosition ());
          }
          bounds.extend (paths[0].pathMarker.getPosition ());
        }
        _paths[t.user_id] = _paths[t.user_id].filter (function (t) { return $.inArray (t.id, delete_ids) == -1; }).concat (paths.filter (function (t) { return $.inArray (t.id, add_ids) != -1; }));
      });
      if (result.units.length)
        _map.fitBounds (bounds);

      if (_timer) clearTimeout (_timer);
      if (!result.is_finished) _timer = setTimeout (loadPolyline, 5000);
    })
    .fail (window.ajaxError)
    .complete (function (result) {});
  }
  function initialize () {
    _map = new google.maps.Map ($map.get (0), {
        zoom: 11,
        zoomControl: true,
        scrollwheel: true,
        scaleControl: true,
        mapTypeControl: false,
        navigationControl: true,
        streetViewControl: false,
        disableDoubleClickZoom: true,
        center: new google.maps.LatLng (25.04, 121.55),
      });

    var styledMapType = new google.maps.StyledMapType ([
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      { featureType: 'poi', stylers: [{ visibility: 'off' }] }
    ]);
    
    _map.mapTypes.set ('map_style', styledMapType);
    _map.setMapTypeId ('map_style');

    loadPolyline ();
  }

  google.maps.event.addDomListener (window, 'load', initialize);
});