'use strict';
let koa     = require('koa'),
    send    = require('koa-send'),
    router  = require('koa-router')(),
    serve   = require('koa-static'),
    bodyParser = require('koa-bodyparser'),
    spawn = require('child_process').spawn,
    net = require('net');

let children = {
  'node': 'js',
  'ruby': 'rb'
}
//start children servers
for( let runtime in children ){
  let childServer =  spawn(runtime,[`./children/${runtime}/child.${children[runtime]}`]);
  //listen to stdout and err
  childServer.stdout.on('data', (data) => {
    console.log(`${runtime} child out: ${data}`);
  });
  childServer.stderr.on('data', (data) => {
    console.log(`${runtime} child err: ${data}`);
  });

  childServer.on('close', (code) => {
    console.log(`${runtime} child exited with code ${code}`);
    //restart server on close (could cause thrashing)
    let childServer = spawn(runtime,[`./children/${runtime}/child.${children[runtime]}`]);
  });

}


let app = koa();

app.use(serve(__dirname + '/public'));
app.use(bodyParser());

router.post('/api/runEvent', function *(){
  let scriptInput = JSON.stringify(this.request.body)

  yield new Promise((resolve, reject) => {
    //connect to unix port
    const connection = net.createConnection(`./children/${this.request.body.runtime}/port`);
    //write data to port
    connection.write(scriptInput + '\n')

    connection.on('data', (data) => {
      console.log(data.toString());

      if(data.toString()==='success\n'){
        this.body = this.request.body //echo input object on success
      } else {//child error
        this.status = 400 //bad request
        this.body = JSON.stringify(data.toString()) //send error to client
      }
      //close unix port
      connection.end();
      //send http response to client
      resolve()
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
