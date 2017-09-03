 const chai = require('chai');
 const chaiHttp = require('chai-http');

 const {app} = require('../server');

 const should = chai.should();
 chai.use(chaiHttp);

 describe('Game Endpoints', function() {

   it('should return possible movie options', function() {
     return chai.request(app)
       .get('/game/movieoptions/Deadpool')
       .then(function(res) {
         res.should.have.status(200);
         res.should.be.json;
       });
   });

   it('should return movie details', function() {
     return chai.request(app)
       .get('/game/moviedetails/11')
       .then(function(res) {
         res.should.have.status(200);
         res.should.be.json;
       });
   });

   it('should list of castmember movies', function() {
     return chai.request(app)
       .get('/game/castmembermovies/2')
       .then(function(res) {
         res.should.have.status(200);
         res.should.be.json;
       });
   });

   it('should return castmember details', function() {
     return chai.request(app)
       .get('/game/castinfo/2')
       .then(function(res) {
         res.should.have.status(200);
         res.should.be.json;
       });
   });


 });
