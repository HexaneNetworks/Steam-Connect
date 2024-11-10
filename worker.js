export default {
    async fetch(request) {
      try {
        // Parse the incoming request URL
        const url = new URL(request.url);
  
        // Retrieve query parameters: 'ip' (server IP) and 'port' (server port)
        const ip = url.searchParams.get("ip");
        const port = url.searchParams.get("port");
  
        // Validate that both 'ip' and 'port' parameters are present
        if (!ip || !port) {
          // If any required parameter is missing, return a 400 Bad Request error
          return new Response(
            "Error: Missing one or more required parameters. 'ip' and 'port' are required.",
            {
              status: 400,
              headers: { "Content-Type": "text/plain" },
            }
          );
        }
  
        // Validate the IP address format (basic regex for IPv4)
        const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipPattern.test(ip)) {
          // If the 'ip' parameter does not match the IPv4 pattern, return a 400 error
          return new Response("Error: 'ip' parameter must be a valid IPv4 address.", {
            status: 400,
            headers: { "Content-Type": "text/plain" },
          });
        }
  
        // Convert the 'port' parameter to an integer
        const portNumber = parseInt(port, 10);
  
        // Validate that 'port' is a valid number within the range of 1 to 65535
        if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
          return new Response(
            "Error: 'port' parameter must be a valid port number between 1 and 65535.",
            {
              status: 400,
              headers: { "Content-Type": "text/plain" },
            }
          );
        }
  
        // Construct the Steam connect URL using the validated parameters
        const steamUrl = `steam://connect/${ip}:${port}`;
  
        // Redirect the user to the constructed Steam URL with a 302 Found status code
        return Response.redirect(steamUrl, 302);
  
      } catch (error) {
        // Catch any unexpected errors during execution
        console.error("Unexpected error:", error);
  
        // Return a 500 Internal Server Error response if something unexpected occurs
        return new Response("Internal Server Error: An unexpected error occurred.", {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }
    },
  };
  