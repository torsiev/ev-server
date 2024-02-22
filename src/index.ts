import http from "http";

export const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      data: "Hello World!",
    }),
  );
});

server.listen(8000, () => {
  console.log(`Server run on http://localhost:8000`);
});
