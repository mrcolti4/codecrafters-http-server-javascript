const net = require("net");
const fs = require("fs");
const path = require("path");
// You can use print statements as follows for debugging, they'll be visible when running tests.
// console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
function getResponse(headers, body) {
  let response = "HTTP/1.1 200 OK\r\n";
  for (const [key, value] of Object.entries(headers)) {
    response += `${key}: ${value}\r\n`;
  }
  response += "\r\n";
  response += body;
  return response;
}

const server = net.createServer((socket) => {
  socket.on("data", async (data) => {
    const request = data.toString();
    const splitedRequest = request.split("\r\n");
    const requestMethod = splitedRequest[0].split(" ")[0];
    const requestTarget = splitedRequest[0].split(" ")[1];

    if (requestTarget === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (requestTarget.startsWith("/echo/")) {
      const paramText = requestTarget.split("/echo/")[1];
      const headers = {
        "Content-Type": "text/plain",
        "Content-Length": paramText.length,
      };
      const response = getResponse(headers, "");
      socket.write(response);
    } else if (requestTarget.startsWith("/user-agent")) {
      const userAgent = splitedRequest
        .find((value) => value.startsWith("User-Agent"))
        ?.split(": ")[1];

      const responseHeaders = {
        "Content-Type": "text/plain",
        "Content-Length": userAgent?.length,
      };
      const response = getResponse(responseHeaders, userAgent);
      socket.write(response);
    } else if (requestTarget.startsWith("/files/")) {
      const requestFilePath = requestTarget.split("/")[2];
      const directory = process.argv[3];
      const resolvedFilePath = path.resolve(directory, requestFilePath);
      switch (requestMethod) {
        case "GET":
          if (fs.existsSync(resolvedFilePath)) {
            const content = fs.readFileSync(resolvedFilePath).toString();
            const responseHeaders = {
              "Content-Type": "application/octet-stream",
              "Content-Length": content.length,
            };
            socket.write(getResponse(responseHeaders, content));
          } else {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
          }
          break;
        case "POST":
          console.log(splitedRequest);
          try {
            fs.writeFileSync(resolvedFilePath, body);
            socket.write("HTTP/1.1 201 File created\r\n\r\n");
          } catch (err) {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
          }
        default:
          break;
      }
    } else {
    }
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
  });
  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
