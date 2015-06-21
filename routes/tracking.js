var express = require('express');
var router = express.Router();
var TrackingModel = require('../models/tracking');

// Fichero de propiedades
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



/* POST. Obtenemos y mostramos todos los tracking */
/**
 * @api {post} /trackings Request all tracking information
 * @apiName GetTrackings
 * @apiGroup Tracking
 * @apiVersion 1.0.1
 * @apiDescription List of trackings
 * @apiParam {String} deviceId Vehicle unique identification
 * @apiParam {Number} posDate Date for the tracking. Milliseconds since january 1 1970 (epoch)
 * @apiParam {Number} latitude Latitude of the tracking (WGS84)
 * @apiParam {Number} longitude Longitude of the tracking (WGS84)
 * @apiParam {String} [vehicleLicense] Vehicle license
 * @apiParam {String} [alertFlag] Alert flag of tracking
 * @apiParam {String} [alertDescription] Alert description of tracking
 * @apiParam {Number} [speed=0] Speed in km/hour
 * @apiParam {Number} [heading=0] Heading in degrees (0-360)
 * @apiParam {Number} [altitude=0] Altitude in meters
 * @apiSampleRequest http://api.kyroslbs.com:3000/kyrosapi/trackings
 * @apiHeader {String} x-access-token JSON Web Token (JWT)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "x-access-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0MzIyMTg2ODc1ODksImlzcyI6InN1bW8iLCJyb2xlIjoiYWRtaW5pc3RyYXRvciJ9._tYZLkBrESt9FwOccyvripIsZR5S0m8PLZmEgIDEFaY"
 *     }
 *
 *
 * @apiSuccess {Object[]} tracking       List of tracking
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Not authorized
 *     {
 *       "message": "Invalid user"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Not authorized
 *     {
 *       "message": "Invalid token"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Not authorized
 *     {
 *       "message": "Token expired"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not found
 *     {
 *       "message": "notExist"
 *     }
 */
router.post('/trackings/', function(req, res)
{
    log.info ("Procesando GET de trackings");

    TrackingModel.getTrackings(function(error, data)
    {
        //si existen vertices, se envia el json
        if (typeof data !== 'undefined')
        {
            res.status(200).json({"results":data})
        }
        //en otro caso se muestra un error
        else
        {
            res.status(400).json({"message":"notExist"})
        }
    });
});

/* POST. Se obtiene un tracking por su id */
/**
 * @api {post} /tracking/:id Request tracking information
 * @apiName PostTracking Request tracking information
 * @apiGroup Tracking
 * @apiDescription Tracking information
 * @apiSampleRequest http://api.kyroslbs.com:3000/kyrosapi/tracking
 * @apiHeader {String} x-access-token JSON Web Token (JWT)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "x-access-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0MzIyMTg2ODc1ODksImlzcyI6InN1bW8iLCJyb2xlIjoiYWRtaW5pc3RyYXRvciJ9._tYZLkBrESt9FwOccyvripIsZR5S0m8PLZmEgIDEFaY"
 *     }
 *
 *
 * @apiParam {Number} id Tracking unique ID
 *
 * @apiParam {Number} trackingId Identification of the tracking
 *
 * @apiSuccess {String} deviceId Vehicle unique identification
 * @apiSuccess {String} vehicleLicense Vehicle license
 * @apiSuccess {String} alertFlag Alert flag of tracking
 * @apiSuccess {String} alertDescription Alert description of tracking
 * @apiSuccess {Number} posDate Date for the tracking. Milliseconds since january 1 1970 (epoch)
 * @apiSuccess {Number} speed Speed in km/hour
 * @apiSuccess {Number} heading Heading in degrees (0-360)
 * @apiSuccess {Number} altitude Altitude in meters
 * @apiSuccess {Number} latitude Latitude of the tracking (WGS84)
 * @apiSuccess {Number} longitude Longitude of the tracking (WGS84)
 * @apiError TrackingNotFound The <code>id</code> of the tracking was not found.
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "notExist"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Not authorized
 *     {
 *       "message": "Invalid user"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Not authorized
 *     {
 *       "message": "Invalid token"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Not authorized
 *     {
 *       "message": "Token expired"
 *     }
 */
router.get('/tracking/:id', function(req, res)
{

   log.info ("Procesando GET de tracking. id="+req.params.id);


    var id = req.params.id;
    //solo actualizamos si la id es un número
    if(!isNaN(id))
    {
        TrackingModel.getTracking(id,function(error, data)
        {
          if (data == null)
          {
            res.json(500,{"message":"mmmm ... something went wrong :("});
          }
          else
          {
            //si existe el vertice enviamos el json
            if (typeof data !== 'undefined' && data.length > 0)
            {
                res.json(200,{"message":data})
            }
            //en otro caso mostramos un error
            else
            {
                res.json(404,{"message":"notExist"});
            }
          }
        });
    }
    //si la id no es numerica mostramos un error de servidor
    else
    {
        res.json(500,{"message":"The id must be numeric"});
    }
});

/* PUT. Actualizamos un tracking existente */
/**
 * @api {put} /tracking/ Update tracking
 * @apiName PutNewTracking
 * @apiGroup Tracking
 * @apiDescription Update tracking
 * @apiSampleRequest http://api.kyroslbs.com:3000/kyrosapi/tracking
 * @apiHeader {String} x-access-token JSON Web Token (JWT)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "x-access-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0MzIyMTg2ODc1ODksImlzcyI6InN1bW8iLCJyb2xlIjoiYWRtaW5pc3RyYXRvciJ9._tYZLkBrESt9FwOccyvripIsZR5S0m8PLZmEgIDEFaY"
 *     }
 *
 *
 * @apiParam {String} deviceId Vehicle unique identification
 * @apiParam {String} vehicleLicense Vehicle license
 * @apiParam {String} alertFlag Alert flag of tracking
 * @apiParam {String} alertDescription Alert description of tracking
 * @apiParam {Number} posDate Date for the tracking. Milliseconds since january 1 1970 (epoch)
 * @apiParam {Number} speed Speed in km/hour
 * @apiParam {Number} heading Heading in degrees (0-360)
 * @apiParam {Number} altitude Altitude in meters
 * @apiParam {Number} latitude Latitude of the tracking (WGS84)
 * @apiParam {Number} longitude Longitude of the tracking (WGS84)
 *
 * @apiSuccess {String} message Result message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Tracking 867 updated",
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Not authorized
 *     {
 *       "message": "Invalid user"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Not authorized
 *     {
 *       "message": "Invalid token"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Not authorized
 *     {
 *       "message": "Token expired"
 *     }
 */
router.put('/tracking/', function(req, res)
{

    log.info ("Procesando PUT de tracking. id="+req.params.id);

    //almacenamos los datos del formulario en un objeto
    var trackingData = {id:req.param('id'),deviceId:req.param('deviceId'),alertFlag:req.param('alertFlag'),alertDescription:req.param('alertDescription'),altitude:req.param('altitude'),speed:req.param('speed'),heading:req.param('heading'),posDate:req.param('posDate'),latitude:req.param('latitude'),longitude:req.param('longitude')};
    TrackingModel.updateTracking(trackingData,function(error, data)
    {
        if (data == null)
        {
          res.json(500,{"message":"mmmm ... something went wrong :("});
        }
        else
        {
          //si el vertex se ha actualizado correctamente mostramos un mensaje
          if(data && data.message)
          {
              res.json(200,{"message":"Vertex " + req.param('id') + "updated"})
          }
          else
          {
            res.json(500,{"message":"mmmm ... something went wrong :("});
          }
        }
    });
});


/* Creamos un nuevo tracking */
/**
 * @api {post} /area/ Create new tracking
 * @apiName PostNewTracking
 * @apiGroup Tracking
 *
 * @apiDescription Create new tracking
 * @apiSampleRequest http://api.kyroslbs.com:3000/kyrosapi/tracking
 * @apiHeader {String} x-access-token JSON Web Token (JWT)
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "x-access-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0MzIyMTg2ODc1ODksImlzcyI6InN1bW8iLCJyb2xlIjoiYWRtaW5pc3RyYXRvciJ9._tYZLkBrESt9FwOccyvripIsZR5S0m8PLZmEgIDEFaY"
 *     }
 *
 * @apiParam {String} deviceId Vehicle unique identification
 * @apiParam {Number} posDate Date for the tracking. Milliseconds since january 1 1970 (epoch)
 * @apiParam {Number} latitude Latitude of the tracking (WGS84)
 * @apiParam {Number} longitude Longitude of the tracking (WGS84)
 * @apiParam {String} [vehicleLicense] Vehicle license
 * @apiParam {String} [alertFlag] Alert flag of tracking
 * @apiParam {String} [alertDescription] Alert description of tracking
 * @apiParam {Number} [speed=0] Speed in km/hour
 * @apiParam {Number} [heading=0] Heading in degrees (0-360)
 * @apiParam {Number} [altitude=0] Altitude in meters
 *
 * @apiSuccess {Number} id Tracking unique ID
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": 867
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Not authorized
 *     {
 *       "message": "Invalid user"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Not authorized
 *     {
 *       "message": "Invalid token"
 *     }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 401 Not authorized
 *     {
 *       "message": "Token expired"
 *     }
 */
 /* Crear un nuevo tracking */
router.post("/tracking", function(req,res)
{

    log.info ("Procesando POST de tracking");


    // Crear un objeto con los datos a insertar del tracking
    var trackingData = {
        id : null,
        vehicleLicense : req.body.vehicleLicense,
        deviceId : req.body.deviceId,
        alertFlag : req.body.alertFlag,
        alertDescription : req.body.alertDescription,
        altitude : req.body.altitude,
        speed : req.body.speed,
        heading : req.body.heading,
        posDate : req.body.posDate,
        latitude : req.body.latitude,
        longitude : req.body.longitude
    };

    TrackingModel.insertTracking(trackingData,function(error, data)
    {
        if (data == null)
        {
          res.status(500).json({"message":"mmmm ... something went wrong :("});
        }
        else
        {
          // si el vertice se ha insertado correctamente mostramos su messaje de exito
          if(data && data.insertId)
          {
              res.json(200,{"message":data.insertId});
              res.status(200).json({"message":data.insertId});
          }
          else
          {
            res.status(500).json({"message":"mmmm ... something went wrong :("});
          }
        }
    });
});

/* Eliminar un tracking */
router.delete("/tracking/", function(req, res)
{
    log.info ("Procesando DELETE de tracking");

    // id del tracking a eliminar
    var id = req.param('id');

    TrackingModel.deleteTracking(id,function(error, data)
    {
          if (data == null)
          {
            res.status(500).json({"message":"mmmm ... something went wrong :("})
          }
          else
          {
              if(data && data.message === "deleted" || data.message === "notExist")
              {
                res.status(200).json({"message":"UXO " + req.params.id + "deleted"})
              }
              else
              {
                res.status(500).json({"message":"mmmm ... something went wrong :("})
              }
          }
      });

  });

module.exports = router;
