import http from "http";

var server = http.createServer((request, response)=>{
    console.log("URL:", request.url);
    console.log("METHOD:", response.method);

    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Server 8080 portunda çalışıyor");
})

server.listen(8080);

console.log('node.js server at port 8080')