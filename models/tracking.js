var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('./api.properties');

// Definición del log
var fs = require('fs');
var log = require('tracer').console({
    transport : function(data) {
        //console.log(data.output);
        fs.open(properties.get('main.log.file'), 'a', 0666, function(e, id) {
            fs.write(id, data.output+"\n", null, 'utf8', function() {
                fs.close(id, function() {
                });
            });
        });
    }
});

var mysql = require('mysql'),

// Crear la conexion a la base de datos
connection = mysql.createConnection(
    {
      host: properties.get('bbdd.mysql.ip') ,
      user: properties.get('bbdd.mysql.user') ,
      password: properties.get('bbdd.mysql.passwd') ,
      database: properties.get('bbdd.mysql.name')
    }
);

// Crear un objeto para ir almacenando todo lo necesario
var trackingModel = {};

// Convertir grados en grados y minutos
function kcoords(px, py)
{
    var x  = Math.abs(px);
    var dx = Math.floor(x);
    var mx = Math.floor((x - dx)*60);
    var sx = Math.floor(((x - dx) - (mx/60))*3600);
    if (px < 0) dx = -dx;
    var y  = Math.abs(py);
    var dy = Math.floor(y);
    var my = Math.floor((y - dy)*60);
    var sy = Math.floor(((y - dy) - (my/60))*3600);
    if (py < 0) dy = -dy;
    return (dx + '|' + (mx+sx/60) + ',' + dy + '|' + (my+sy/60));
}

// Obtener todos las trackings_1
trackingModel.getTrackings1 = function(callback)
{
    if (connection)
    {
        var sql = 'SELECT TRACKING_ID as id, VEHICLE_LICENSE as vehicleLicense, DEVICE_ID as deviceId, ALERT_FLAG as alertFlag, ALERT_DESCRIPTION as alertDescription, (POS_LATITUDE_DEGREE + POS_LATITUDE_MIN/60) as latitude, (POS_LONGITUDE_DEGREE + POS_LONGITUDE_MIN/60) as longitude, ALTITUDE as altitude, GPS_SPEED as speed, HEADING as heading, POS_DATE as posDate FROM TRACKING_1 ORDER BY POS_DATE desc';
        log.debug ("Query: "+sql);
        connection.query(sql, function(error, rows)
        {
            if(error)
            {
                callback(error, null);
            }
            else
            {
                callback(null, rows);
            }
        });
    }
    else
    {
      callback(null, null);
    }
}

// Obtener todos las trackings_5
trackingModel.getTrackings5 = function(callback)
{
    if (connection)
    {
        var sql = 'SELECT TRACKING_ID as id, VEHICLE_LICENSE as vehicleLicense, DEVICE_ID as deviceId, ALERT_FLAG as alertFlag, ALERT_DESCRIPTION as alertDescription, (POS_LATITUDE_DEGREE + POS_LATITUDE_MIN/60) as latitude, (POS_LONGITUDE_DEGREE + POS_LONGITUDE_MIN/60) as longitude, ALTITUDE as altitude, GPS_SPEED as speed, HEADING as heading, POS_DATE as posDate FROM TRACKING_5 ORDER BY POS_DATE desc';
        log.debug ("Query: "+sql);
        connection.query(sql, function(error, rows)
        {
            if(error)
            {
                callback(error, null);
            }
            else
            {
                callback(null, rows);
            }
        });
    }
    else
    {
      callback(null, null);
    }
}

// Obtener todos las trackings
trackingModel.getTrackings = function(callback)
{
    if (connection)
    {
        var sql = 'SELECT TRACKING_ID as id, VEHICLE_LICENSE as vehicleLicense, DEVICE_ID as deviceId, ALERT_FLAG as alertFlag, ALERT_DESCRIPTION as alertDescription, (POS_LATITUDE_DEGREE + POS_LATITUDE_MIN/60) as latitude, (POS_LONGITUDE_DEGREE + POS_LONGITUDE_MIN/60) as longitude, ALTITUDE as altitude, GPS_SPEED as speed, HEADING as heading, POS_DATE as posDate FROM TRACKING ORDER BY POS_DATE desc limit 500';
        log.debug ("Query: "+sql);
        connection.query(sql, function(error, rows)
        {
            if(error)
            {
                callback(error, null);
            }
            else
            {
                callback(null, rows);
            }
        });
    }
    else
    {
      callback(null, null);
    }
}

// Obtener un tracking por su id
trackingModel.getTracking = function(id,callback)
{
    if (connection)
    {
        var sql = 'SELECT TRACKING_ID as id, VEHICLE_LICENSE as vehicleLicense, DEVICE_ID as deviceId, ALERT_FLAG as alertFlag, ALERT_DESCRIPTION as alertDescription, (POS_LATITUDE_DEGREE + POS_LATITUDE_MIN/60) as latitude, (POS_LONGITUDE_DEGREE + POS_LONGITUDE_MIN/60) as longitude, ALTITUDE as altitude, GPS_SPEED as speed, HEADING as heading, POS_DATE as posDate FROM TRACKING WHERE TRACKING_ID = ' + connection.escape(id);
        log.debug ("Query: "+sql);
        connection.query(sql, function(error, row)
        {
            if(error)
            {
                callback(error, null);
            }
            else
            {
                callback(null, row);
            }
        });
    } else
    {
      callback(null, null);
    }
}

// Actualizar un tracking
trackingModel.updateTracking = function(trackingData, callback)
{
    var coordenadas = kcoords(trackingData.latitude, trackingData.longitude);
    var lat = coordenadas.substring(0, coordenadas.indexOf(','));
    var lon = coordenadas.substring(coordenadas.indexOf(',')+1, coordenadas.length);
    var latdeg = lat.substring(0, lat.indexOf('|'));
    var latmin = lat.substring(lat.indexOf('|')+1, lat.length);
    var londeg = lon.substring(0, lon.indexOf('|'));
    var lonmin = lon.substring(lon.indexOf('|')+1, lon.length);

    if(connection)
    {
        var sql = 'UPDATE TRACKING SET VEHICLE_LICENSE = ' + connection.escape(trackingData.vehiceLicense) + ',' +
        'DEVICE_ID = ' + connection.escape(trackingData.deviceId) + ',' +
        'ALERT_FLAG = ' + connection.escape(trackingData.alertFlag) + ',' +
        'ALERT_DESCRIPTION = ' + connection.escape(trackingData.alertDescription) + ',' +
        'ALTITUDE = ' + connection.escape(trackingData.altitude) + ',' +
        'GPS_SPEED = ' + connection.escape(trackingData.speed) + ',' +
        'HEADING = ' + connection.escape(trackingData.heading) + ',' +
        'POS_DATE = ' + connection.escape(trackingData.posDate) + ',' +
        'POS_LATITUDE_DEGREE = ' + latdeg + ',' +
        'POS_LATITUDE_MIN = ' + latmin + ',' +
        'POS_LONGITUDE_DEGREE = ' + londeg + ',' +
        'POS_LONGITUDE_MIN = ' + londeg + ' ' +
        'WHERE TRACKING_ID = ' + trackingData.id;
        log.debug ("Query: "+sql);

        connection.query(sql, function(error, result)
        {
            if(error)
            {
               callback(error, null);
            }
            else
            {
                callback(null,{"message":"success"});
            }
        });
    } else
    {
      callback(null, null);
    }

}

//añadir una nuevo tracking
trackingModel.insertTracking = function(trackingData,callback)
{
    var coordenadas = kcoords(trackingData.latitude, trackingData.longitude);
    var lat = coordenadas.substring(0, coordenadas.indexOf(','));
    var lon = coordenadas.substring(coordenadas.indexOf(',')+1, coordenadas.length);
    var latdeg = lat.substring(0, lat.indexOf('|'));
    var latmin = lat.substring(lat.indexOf('|')+1, lat.length);
    var londeg = lon.substring(0, lon.indexOf('|'));
    var lonmin = lon.substring(lon.indexOf('|')+1, lon.length);

    if (connection)
    {
        var sql = 'INSERT INTO TRACKING SET VEHICLE_LICENSE = ' + connection.escape(trackingData.vehicleLicense) + ',' +
        'DEVICE_ID = ' + connection.escape(trackingData.deviceId) + ',' +
        'ALERT_FLAG = ' + connection.escape(trackingData.alertFlag) + ',' +
        'ALERT_DESCRIPTION = ' + connection.escape(trackingData.alertDescription) + ',' +
        'ALTITUDE = ' + connection.escape(trackingData.altitude) + ',' +
        'GPS_SPEED = ' + connection.escape(trackingData.speed) + ',' +
        'HEADING = ' + connection.escape(trackingData.heading) + ',' +
        'POS_DATE = ' + connection.escape(trackingData.posDate) + ',' +
        'POS_LATITUDE_DEGREE = ' + latdeg + ',' +
        'POS_LATITUDE_MIN = ' + latmin + ',' +
        'POS_LONGITUDE_DEGREE = ' + londeg + ',' +
        'POS_LONGITUDE_MIN = ' + londeg;
        log.debug ("Query: "+sql);

        connection.query(sql, function(error, result)
        {
            if(error)
            {
               callback(error, null);
            }
            else
            {
                //devolvemos la última id insertada
                callback(null,{"insertId" : result.insertId});
            }
        });
    }
    else
    {
      callback(null, null);
    }
}

// Eliminar un tracking pasando la id a eliminar
trackingModel.deleteTracking = function(id, callback)
{
    if(connection)
    {
        var sqlExists = 'SELECT * FROM TRACKING WHERE TRACKING_ID = ' + connection.escape(id);
        log.debug ("Query: "+sqlExists);
        connection.query(sqlExists, function(err, row)
        {
            //si existe la id del vertice a eliminar
            if(row)
            {
                var sql = 'DELETE FROM TRACKING WHERE TRACKING_ID = ' + connection.escape(id);
                log.debug ("Query: "+sql);
                connection.query(sql, function(error, result)
                {
                    if(error)
                    {
                      callback(error, null);
                    }
                    else
                    {
                        callback(null,{"message":"deleted"});
                    }
                });
            }
            else
            {
                callback(null,{"message":"notExist"});
            }
        });
    }
    else
    {
      callback(null, null);
    }
}

//exportamos el objeto para tenerlo disponible en la zona de rutas
module.exports = trackingModel;
