# Steam Connect Redirector

A Cloudflare Worker that redirects users to a Steam server using the `steam://connect/` protocol.

## Purpose

Steam hyperlinks using `steam://connect/` may not function in some contexts. This worker provides a direct redirect to the specified Steam server.

## Usage

Access the worker URL with the `ip` and `port` query parameters:

```
https://steam-connect.hexane.co/?ip=IP&port=PORT
```

- `ip`: The IP address of the Steam server (IPv4).
- `port`: The port number of the Steam server (1-65535).

### Example

```
https://steam-connect.hexane.co/?ip=51.68.200.55&port=27015
```

This redirects to:

```
steam://connect/51.68.200.55:27015
```

## Features

- Validates IPv4 addresses.
- Ensures port numbers are within the valid range.
- Blocks redirects to private or reserved IP addresses.
- Returns JSON error messages with appropriate HTTP status codes.

## Deployment

- Deploy the script as a Cloudflare Worker.
- Assign a route to the worker in your Cloudflare dashboard.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
