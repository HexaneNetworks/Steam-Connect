/**
 * Steam Connect Redirector
 * https://github.com/HexaneNetworks/Steam-Connect
 *
 * MIT License
 * Copyright (c) 2024 Hexane Networks
 *
 * Licensed under the MIT License. See the LICENSE file for more information.
 */

export default {
  fetch(request) {
    // Parse the incoming request URL
    const url = new URL(request.url);

    // Retrieve query parameters: 'ip' (server IP) and 'port' (server port)
    const ip = url.searchParams.get("ip");
    const port = url.searchParams.get("port");

    // Prepare common response headers for security
    const responseHeaders = {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",        // Prevent MIME type sniffing
      "Content-Security-Policy": "default-src 'none';", // Disallow all content
      "Referrer-Policy": "no-referrer",           // Do not send referrer information
      "X-Frame-Options": "DENY",                  // Prevent clickjacking
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload", // Enforce HTTPS
    };

    // Validate that both 'ip' and 'port' parameters are present
    if (!ip || !port) {
      return new Response(
        JSON.stringify({ error: "Missing 'ip' and 'port' parameters." }),
        {
          status: 400,
          headers: responseHeaders,
        }
      );
    }

    // Validate the IP address format (IPv4)
    if (!isValidIPv4(ip)) {
      return new Response(
        JSON.stringify({ error: "'ip' parameter must be a valid IP address." }),
        {
          status: 400,
          headers: responseHeaders,
        }
      );
    }

    // Restrict private and reserved IP addresses for security
    if (isPrivateOrReservedIP(ip)) {
      return new Response(
        JSON.stringify({
          error: "Redirecting to private or reserved IP addresses is not allowed.",
        }),
        {
          status: 400,
          headers: responseHeaders,
        }
      );
    }

    // Validate that 'port' consists entirely of digits
    if (!/^\d+$/.test(port)) {
      return new Response(
        JSON.stringify({ error: "'port' parameter must be a valid port number." }),
        {
          status: 400,
          headers: responseHeaders,
        }
      );
    }

    // Convert the 'port' parameter to an integer
    const portNumber = parseInt(port, 10);

    // Validate that 'port' is within the valid range (1-65535)
    if (portNumber < 1 || portNumber > 65535) {
      return new Response(
        JSON.stringify({ error: "'port' parameter must be between 1 and 65535." }),
        {
          status: 400,
          headers: responseHeaders,
        }
      );
    }

    // Construct the Steam connect URL using the validated parameters
    const steamUrl = `steam://connect/${ip}:${portNumber}`;

    // Prepare redirect response headers
    const redirectHeaders = {
      Location: steamUrl,
      // Include security headers in the redirect response
      ...responseHeaders,
    };

    // Redirect the user to the constructed Steam URL with a 301 Moved Permanently status code
    return new Response(null, {
      status: 301,
      headers: redirectHeaders,
    });
  },
};

/**
 * Validates if the given string is a valid IPv4 address.
 * @param {string} ip - The IP address to validate.
 * @returns {boolean} - True if valid IPv4, false otherwise.
 */
function isValidIPv4(ip) {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  for (const part of parts) {
    // Ensure each part is a decimal number between 0 and 255
    if (!/^\d+$/.test(part)) return false;
    const num = Number(part);
    if (num < 0 || num > 255) return false;
    if (part.length > 1 && part.startsWith("0")) return false; // Disallow leading zeros
  }
  return true;
}

/**
 * Checks if the IP address is within private or reserved ranges.
 * @param {string} ip - The IP address to check.
 * @returns {boolean} - True if IP is private or reserved, false otherwise.
 */
function isPrivateOrReservedIP(ip) {
  // List of CIDR blocks for private and reserved IP addresses
  const cidrBlocks = [
    // IPv4 private and reserved ranges
    "0.0.0.0/8",         // "This" network
    "10.0.0.0/8",        // Private network
    "127.0.0.0/8",       // Loopback
    "169.254.0.0/16",    // Link-local
    "172.16.0.0/12",     // Private network
    "192.0.0.0/24",      // IETF Protocol Assignments
    "192.168.0.0/16",    // Private network
    "255.255.255.255/32",// Broadcast
  ];

  // Check if the IP is in any of the private or reserved CIDR blocks
  return cidrBlocks.some((cidr) => ipInCidr(ip, cidr));
}

/**
 * Checks if an IP address is within a given CIDR range.
 * Supports IPv4 addresses.
 * @param {string} ip - The IP address to check.
 * @param {string} cidr - The CIDR range to check against.
 * @returns {boolean} - True if IP is within CIDR range, false otherwise.
 */
function ipInCidr(ip, cidr) {
  // Split CIDR notation into IP and prefix length
  const [range, prefixLength] = cidr.split("/");

    // Convert IPv4 addresses to integers
    const ipInt = ipv4ToInt(ip);
    const rangeInt = ipv4ToInt(range);
    const mask = ~(2 ** (32 - Number(prefixLength)) - 1);
    return (ipInt & mask) === (rangeInt & mask);

}

/**
 * Converts an IPv4 address to a 32-bit integer.
 * @param {string} ip - The IPv4 address.
 * @returns {number} - The integer representation of the IP address.
 */
function ipv4ToInt(ip) {
  return ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}
