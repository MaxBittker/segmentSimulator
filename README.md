# Segment Analytics event builder
This application consists of a web interface, an HTTP API server (server.js),
and multiple child server implementations of various Segment libraries
(located in the children directory)  

## UI
The user interface is a single page react application which provides a form for
the user to provide their write key, which runtime/library environment they want  
to test, which method they want to invoke, and a syntax highlighted JSON editor
to compose and validate inputs.

When a request is triggered, these are sent to server as a JSON object.
The response to this request is either the JSON that was successfully run, or
the error emitted from the specific segment library it was run on, which is
displayed to the user.

A list of all successful requests and their parameters is kept on the bottom of
the page for reference.


## API server
The API server is a koa application which serves the static front-end resources
and exposes a single API endpoint - "runEvent". This endpoint accepts JSON
containing

-  method
-  write key
-  runtime
- JSON payload

parameters, but *only* concerns itself with the runtime parameter. It uses this
string to decide which UNIX socket to connect to. Each request gets its own UNIX
 socket connection to a child server of the runtime it specified, which it
communicates with to make the Segment event and respond to the original request
with the result (success or error).

Another responsibility of this application is to launch the child
servers.

## Child servers
Each child server's implements a common interface in order to avoid special case
logic on the API server or client. This interface is:
  - Listen for UNIX socket connections at './port' (the application uses a
directory structure to organize its different runtimes)
  - When a connection is opened, parse the JSON that is sent over it, instantiate
  a Segment library with the provided write key, and make an API request to the
   appropriate endpoint with the provided JSON payload.
  - Catch any errors and report them upstream to the API server, otherwise
   return "success"

At the moment, only node and ruby child servers are implemented.

### extensions:
  Currently, error handling is slightly haphazard and different cases are handled
  at different stages of the application. For instance, the front end validates
  the JSON and drop down options, and the other stages of the application rely on
  these aspects being correct. This would be problematic especially if you
  were to consume the API from another client (possibly as a component of
  an integration test suite)
  Additionally, it would be fun to build more child server implementations,
  and tools on the front end for templating requests and triggering massive
  numbers of segment events per request.

### Time breakdown
Approximately
- 1 hour on the initial koa server
- 3 hours on the front end
- 3 hours on the node child server and integration
- 3 hours on the ruby child server
- 2 hours general planning, debugging and system integration
