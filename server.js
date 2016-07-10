'use strict';
let koa     = require('koa'),
    send    = require('koa-send'),
    router  = require('koa-router')(),
    serve   = require('koa-static'),
    bodyParser = require('koa-bodyparser'),
    spawn = require('child_process').spawn,
    net = require('net');



const nodeServer = spawn('node',['./children/node/child.js']);
nodeServer.stdout.on('data', (data) => {
  console.log(`node server: ${data}`);
});
nodeServer.stderr.on('data', (data) => {
  console.log(`node server: ${data}`);
});
nodeServer.on('close', (code) => {
  console.log(`node server exited with code ${code}`);
});

let app = koa();

app.use(serve(__dirname + '/public'));
app.use(bodyParser());

router.post('/api/runEvent', function *(){
  let scriptInput = JSON.stringify(this.request.body)

  yield new Promise((resolve, reject) => {

    const connection = net.createConnection(`./children/${this.request.body.runtime}/port`);

    connection.write(scriptInput)
    connection.on('data', (data) => {
      console.log(data.toString());
      if(data.toString()==="success"){
        this.body = this.request.body
      } else {//library error
        this.status=400 //bad request
        this.body = JSON.stringify(data.toString())
      }
      resolve()
      connection.end();
    });

    connection.on('error', (data) => {
      throw data
      reject()
      connection.end();
    });

  });

});


app.use(router.routes());

app.listen(4000);
