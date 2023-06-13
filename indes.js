const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h1>Hello World</h1>');
    res.end();
    return;
  }

  if (req.url === '/read') {
    const start = new Date(); // Capture the start time

    fs.readFile('text.txt', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write(err.toString());
        res.end();
        return;
      }

      const end = new Date(); // Capture the end time
      const timeSpent = end - start; // Calculate the time spent in milliseconds

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(`<html><body>${data}</body></html>`);
      res.write(`<p>Time Spent: ${timeSpent}ms</p>`); // Display the time spent
      res.end();
    });
    return;
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.write(`<h5 style="color: red">I believe you lost.</h5>`);
    res.end();
  }

  res.writeHead(404);
  res.end();
});

server.listen(3000);
