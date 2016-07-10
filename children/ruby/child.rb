require 'socket'
require 'segment/analytics'
require 'json'
portPath = File.dirname(__FILE__) + "/port"
STDOUT.sync = true

puts(portPath)

 def runEvent(jsonString)
   begin

     inputObject = JSON.parse(jsonString)

     writeKey = inputObject['writeKey']
     throw "You must pass your Segment project's write key." if writeKey.length < 2

     method = inputObject['testType']
     payload =  JSON.parse(inputObject['inputJSON'],  symbolize_names: true)

     #Id -> _id hacks
       payload[:user_id] = payload[:userId]
       payload.delete(:userId)

       payload[:previous_id] = payload[:previousId] if payload[:previousId]
       payload.delete(:previousId)

       payload[:group_id] = payload[:groupId] if payload[:groupId]
       payload.delete(:groupId)


     analytics = Segment::Analytics.new({
      write_key: writeKey,
      on_error: Proc.new { |status, msg| puts msg }
      })

      if analytics.respond_to? method
         analytics.public_send(method, payload)
      else
       return "unknown method #{method}"
      end
    rescue => e
      return e
    end

  analytics.flush
  puts "wrote: #{payload}"
  return "success"
 end

Socket.unix_server_loop(portPath) do |conn, client_addrinfo|
  Thread.new do
     begin
       loop do
         line = conn.readline
         result = runEvent(line)
         conn.puts(result)
       end
     rescue EOFError
       conn.close
     end
   end
 end
