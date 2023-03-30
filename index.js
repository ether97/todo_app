const express = require("express");
const fs = require("fs");
const app = express();
const fns = require("date-fns");
const PORT = 5000;
const cors = require("cors");
app.use(cors());
const { v4: uuidv4 } = require("uuid");
app.use("/", express.json());

app.get("/todo/:filename", (req, res) => {
  const { filename } = req.params;
  if (fs.existsSync(filename)) {
    fs.readFile(filename, function (err, data) {
      if (err) throw err;
      res.send(JSON.parse(data));
    });
  }
});

app.get("/", (req, res) => {
  fs.readdir(__dirname, function (err, files) {
    if (err) {
      return console.log("Error: ", err);
    }
    res.send(files);
  });
});

app.post("/add", (req, res) => {
  const { filename, todo } = req.body;
  todo.timestamp = fns.format(new Date(), "MM/dd/yyyy");
  todo.id = uuidv4();
  if (fs.existsSync(filename)) {
    fs.readFile(filename, function (err, data) {
      var jsonData = JSON.parse(data) || [];
      jsonData.push(todo);
      fs.writeFile(filename, JSON.stringify(jsonData), function (err) {
        if (err) throw err;
        res.json({ status: res.statusCode, addedTodo: todo });
      });
    });
  } else {
    console.log("file does not exist!");
  }
});

app.put("/todo", (req, res) => {
  const { filename, todo } = req.body;
  todo.timestamp = fns.format(new Date(), "MM/dd/yyyy");
  fs.readFile(filename, function (err, data) {
    var jsonData = JSON.parse(data) || [];
    let keys = ["title", "description", "status", "priority"];
    let index = jsonData.findIndex((item) => item.title === todo.title);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (key in todo) {
        jsonData[index][key] = todo[key];
      }
    }
    fs.writeFile(filename, JSON.stringify(jsonData), function (err) {
      if (err) throw err;
      res.json({ status: res.statusCode, updatedTodo: jsonData[index] });
    });
  });
});

app.delete("/todo/:filename/:id", (req, res) => {
  const { filename, id } = req.params;
  if (!fs.existsSync(filename)) {
    return res.send({ message: "filename does not exist!" });
  }
  fs.readFile(filename, function (err, data) {
    if (err) {
      return res.send({ error: err });
    }
    var jsonData = JSON.parse(data);
    jsonData = jsonData.filter((item) => item.id !== id);
    fs.writeFile(filename, JSON.stringify(jsonData), function (err) {
      if (err) throw err;
      res.json({ status: res.statusCode, todoList: jsonData });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT}`);
});
