async function test() {
  const res = await fetch('http://localhost:3000/api/calls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callerId: "user1",
      callerName: "User 1",
      receiverId: "user2",
      receiverName: "User 2",
      roomId: "room123"
    })
  });
  console.log("POST:", await res.text());
  
  const res2 = await fetch('http://localhost:3000/api/calls/pending?userId=user2');
  console.log("GET:", await res2.text());
}
test();
