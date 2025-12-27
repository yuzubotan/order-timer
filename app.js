const express = require('express');
const app = express();
const port = 3001;
const bodyParser = require('body-parser');

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false }))
app.use(express.static('public'));



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


  
module.exports = app;
