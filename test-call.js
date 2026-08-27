const http = require('http');

const data = JSON.stringify({
  callerId: "user1",
  callerName: "User 1",
  receiverId: "user2",
  receiverName: "User 2",
  roomId: "room123"
});

const req = http.request('http://localhost:3000/api/calls', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log("POST res:", body);
    
    http.get('http://localhost:3000/api/calls/pending?userId=user2', (res2) => {
      let body2 = '';
      res2.on('data', d => body2 += d);
      res2.on('end', () => console.log("GET pending res:", body2));
    });
  });
});

req.write(data);
req.end();
