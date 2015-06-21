var should = require('should');
var assert = require('assert');
var request = require('supertest');
var winston = require('winston');

var trackingInserted = 0;

describe('Tracking', function() {
  var url = 'http://localhost:3000';
  before(function(done) {
    done();
  });

  describe('API REST test', function()
	{
    it('[POST]    Get all trackings', function(done) {
    request(url)
	  .post('/kyrosapi/trackings')

    // end handles the response
	  .end(function(err, res) {
          if (err) {
            throw err;
          }
					res.status.should.be.equal(200);
          done();
        });
    });

/*
	it('[POST]    Add tracking', function(done) {
    var body = {
      deviceId: '13',
      vehicleLicence: '1615-FDW',
      alertFlag: '0',
      alertDescription: 'alert description',
      posDate: '1434781120000',
      altitude: '700',
      speed: '100',
      heading: '120',
      latitude: '42.3',
      longitude: '-3.1'
  	};
	request(url)
	.post('/kyrosapi/tracking')
	.send(body)
	// end handles the response
	.end(function(err, res) {
				if (err) {
					throw err;
				}
        //console.log(res);
        uxoInserted = res.body.message;
				res.status.should.be.equal(200);
				done();
			});
	});

  it('[POST]    Get tracking', function(done) {
  request(url)
  .post('/kyrosapi/tracking/'+trackingInserted)
  // end handles the response
  .end(function(err, res) {
        if (err) {
          throw err;
        }
        res.status.should.be.equal(200);
        done();
      });
  });


  it('[PUT]     Update tracking', function(done){
  var body = {
  id: trackingInserted,
  deviceId: '13',
  vehicleLicence: '1615-FDW',
  alertFlag: '0',
  alertDescription: 'alert description',
  posDate: '1434781120000',
  altitude: '700',
  speed: '100',
  heading: '120',
  latitude: '42.3',
  longitude: '-3.1'
  };
  request(url)
  .put('/kyrosapi/tracking')
  .send(body)
  .expect('Content-Type', /json/)
  .expect(200) //Status code
  .end(function(err,res) {
    if (err) {
      throw err;
    }
    // Should.js fluent syntax applied
    done();
  });
  });

  it('[DELETE]  Remove tracking', function(done) {
    var body = {
      id: trackingInserted
  	};
	request(url)
	.delete('/kyrosapi/tracking')
	.send(body)
	// end handles the response
	.end(function(err, res) {
				if (err) {
					throw err;
				}
				res.status.should.be.equal(200);
				done();
			});
	});
*/
  });
});
