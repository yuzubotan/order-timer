const db = require("./db.js");
const app = require("./app.js");
const port = process.env.PORT || 3000
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

let timerValue = 0;
setInterval(() => {
  if(timerValue > 0) {
    timerValue--;
    broadcastTimer();
  } else {
    timerValue = 0;
    broadcastTimer();
  }
}, 1000);
  

function broadcastTimer() {
  const message = JSON.stringify({ type: 'update', timerValue});
  wss.clients.forEach(client => {
    if(client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}


wss.on('connection', (ws) => {
    console.log('クライアントが接続しました');

    ws.send(JSON.stringify({ type: 'update', timerValue }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        if(data.action === 'increase') {
          timerValue += data.amount;
          broadcastTimer();
        } else if(data.action === 'reset') {
          timerValue = 0;
          broadcastTimer();
        }
      } catch(e) {
        console.error('メッセージパースエラー', e);
      }
    });
});

app.get('/', (req, res) => {
    let sql = "select * from tel where checked = 0 order by time asc limit 1";
    db.all(sql, (err, rows) => {
      let opt = {
        title: "timer",
        data: rows.map(row => ({
          ...row,
          startTime: new Date(new Date(row.time).getTime() - (row.number / 10 + 5) * 60 * 1000)
        })),
    }
    res.render('timer.ejs', opt)
  })
})

app.get('/add', (req, res) => {
  let sql = "select * from tel order by time asc";
  db.all(sql, (err, rows) => {
    let opt = {
      title: "timer",
      data: rows,
    };
  
  
  res.render("add.ejs", opt);
});
});

app.post("/add", (req, res) => {
  
    let time = req.body.time;
    let number = req.body.number;
    let name = req.body.name;
    let detail = req.body.detail;
    
    let sql ="insert into `tel` (time, number, name, detail) values (?,?,?,?)";
    let values = [time, number, name, detail];
    db.run(sql, values, (err) => {
      if (err) {
        return res.status(200).send('Data added successfully')
      }
      
       res.redirect("/");
    });
    
  });

  app.get("/view", (req,res) => {
    db.all("select * from tel order by time asc", (err, rows) => {
      
      let opt = {
        title: 'order',
        data: rows.map(row => ({
          ...row,
          startTime: new Date(new Date(row.time).getTime() - (row.number / 10 + 5) * 60 * 1000)
        })),
      };
      
      res.render('view.ejs', opt);
    })
  })

  app.get('/view/del', (req, res) => {
    let id = req.query.id;
    let sql = 'delete from tel where id =' + id;
    db.run(sql, (err) => {
      res.redirect('/');
    })
  })
  
  // サーバーサイドのエンドポイント
  app.post("/reset", (req, res) => {
    let sql = "DELETE FROM tel";
    db.run(sql, (err) => {
      if (err) {
        console.error('データベースのリセットに失敗しました。', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('データベースをリセットしました。');
        res.status(200).send('OK');
      }
    
      
    });
  });
  
  app.get('/checked', (req, res) => {
    let id = req.query.id;
    let sql = "update tel set checked = 1 where id =" + id;
    db.run(sql, (err) => {
      
      res.redirect('/');
    })
  })

  app.get('/customer', (req, res) => {
    res.render('customer');
  })

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});