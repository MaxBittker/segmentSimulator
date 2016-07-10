var Analytics = require('analytics-node');
var net = require('net');
var fs = require('fs')
const port = __dirname + "/port"


const runEvent = json => {
  var input = JSON.parse(json)
  var writeKey = input.writeKey,
      method = input.testType,
      payload = JSON.parse(input.inputJSON)

  var analytics = new Analytics(writeKey,{ flushAt: 1 });

  if(analytics[method]){
    analytics[method](payload)
  }else {
    throw(`unrecognized method: ${method}` )
  }
  console.log("wrote: ",method," : ", payload)
  return
}

var unixServer = net.createServer(function(client) {
    client.on('data',d=>{
      try{
        runEvent(d)
        client.write("success");
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
