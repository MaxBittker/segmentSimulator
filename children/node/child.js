let Analytics = require('analytics-node');
let net = require('net');
let fs = require('fs')
const port = __dirname + '/port'


const runEvent = json => {
  let input = JSON.parse(json)
  let writeKey = input.writeKey,
      method = input.testType,
      payload = JSON.parse(input.inputJSON)

  let analytics = new Analytics(writeKey,{ flushAt: 1 });

  if(analytics[method]){
    analytics[method](payload)
  }else {
    throw(`unrecognized method: ${method}` )
  }
  console.log('wrote: ',method,' : ', payload)
}

let unixServer = net.createServer(function(client) {
    client.on('data',d=>{
      try{
        runEvent(d)
        client.write('success\n');
      }catch(e){
        console.error(e)
        if(e.message)
          client.write(e.message);
        else
          client.write(e);
      }
    })
});

console.log(port)

try{
  fs.unlinkSync(port)
}catch(e){}

unixServer.listen(port);
