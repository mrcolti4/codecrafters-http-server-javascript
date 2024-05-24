const net = require("net");
const EventEmitter = require("node:events");
// You can use print statements as follows for debugging, they'll be visible when running tests.
// console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const splitedRequest = request.split("\r\n");
    const requestTarget = splitedRequest[0].split(" ")[1];

    if (requestTarget === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (requestTarget.startsWith("/echo/")) {
      const paramText = requestTarget.split("/echo/")[1];
      const headers = {
        "Content-Type": "text/plain",
        "Content-Length": paramText.length,
      };
      const response = `HTTP/1.1 200 OK\r\n${Object.entries(headers).join("\r\n").replace(/,/g, ": ")}\r\n\r\n${paramText}`;
      socket.write(response);
    } else if (requestTarget.startsWith("/user-agent")) {
      const userAgent = splitedRequest
        .find((value) => value.startsWith("User-Agent"))
        .split(": ")[1];

      const responseHeaders = {
        "Content-Type": "text/plain",
        "Content-Length": userAgent.length,
      };

      const response = `HTTP/1.1 200 OK\r\n${Object.entries(responseHeaders).join("\r\n").replace(/,/g, ": ")}\r\n\r\n${userAgent}`;
      socket.write(response);
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  });
  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
