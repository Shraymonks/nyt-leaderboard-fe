const admin = require('firebase-admin');
const express = require('express');
const serviceAccount = require('./auth.json');
const port = process.env.PORT || 8080;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
const app = express();

app.get('/index.html', (req, resp) => {
  admin.firestore().collection('leaderboard').get().then(snapshot => {
    let content = '';
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      content += `<a href="/user/${doc.id}">${data.name} - ${data.results.length} Completed</a><br>`;
    });
    resp.set('Content-Type', 'text/html');
    resp.send(`
      <!DOCTYPE html>
      <html>
        <body>
        ${content}
        </body>
      </html>`);
  });
});

function average(results) {
  let total = 0;
  results.forEach(result => {
    total += result.time
  });
  let avg = total / results.length;
  let hours = Math.floor(avg / 60);
  let seconds = Math.floor(avg % 60);
  return `${hours}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function winTimes(docs, userId) {
  
}

app.get('/user/:userId', (req, resp) => {
  admin.firestore().collection('leaderboard').get().then(snapshot => {
    const docs = snapshot.docs;
    let doc = null;
    for (const d of docs) {
      if (d.id == req.params.userId) {
        doc = d.data();
        break;
      }
    }
    if (!doc) {
      return resp.send('');
    }
    resp.set('Content-Type', 'text/html');
    resp.send(`
      <!DOCTYPE html>
      <html>
        <body>
          <h2>${doc.name}</h2>
          <h4>Stats</h4>
          <ul>
            <li>Completed: ${doc.results.length}</li>
            <li>Average: ${average(doc.results)}</li>
          </ul>
        </body>
      </html>`);
  });
});

app.listen(port);
