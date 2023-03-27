const express = require("express");
const app = express();
const cors = require("cors");
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key 6ebcef4be1e64b178aaf15cbe110afa3");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

const database = {
  users: [
    {
      id: 1,
      name: "Black Box",
      email: "black@gm.com",
      password: "12345",
      entries: 0,
      joined: new Date(),
    },
    {
      id: 2,
      name: "abc",
      email: "abc@gm.com",
      password: "pass123",
      entries: 0,
      joined: new Date(),
    },
  ],
};

app.get("/", (req, res) => {
  res.send(database.users);
});
app.post("/signin", (req, res) => {
  const userObj = database?.users?.find((obj) => obj?.email === req.body.email);

  if (userObj && req.body.password == userObj.password) {
    res.send(`welcome ${userObj?.name}`);
  } else if (!userObj) {
    res.json("user not found");
  } else {
    res.status(400).send("error logging in");
  }
});

app.post("/register", (req, res) => {
  database?.users?.push({
    id: 3,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    entries: 0,
    joined: new Date(),
  });
  res.json(database?.users.at(-1));
});

app.get("/profile/:id", (req, res) => {
  const userObj = database?.users?.find((obj) => obj?.id == req.params.id);

  if (userObj) {
    res.json(userObj);
  } else {
    res.send("profile not found");
  }
});
app.put("/image", (req, res) => {
  const userObj = database?.users?.find((obj) => obj?.id == req.body.id);
  if (userObj) {
    userObj.entries++;
    res.json(userObj?.entries);
  } else {
    res.send("user not found");
  }
});

app.post("/detect", (req, res) => {
  const url = req.body.url;
  if (url) {
    stub.PostModelOutputs(
      {
        // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
        // model_id: "aaa03c23b3724a16a56b629203edc62c",
        model_id: "face-detection",
        inputs: [
          {
            data: { image: { url: url } },
          },
        ],
      },
      metadata,
      (err, response) => {
        if (err) {
          console.log("Error: " + err);

          return res.json({ err });
        }

        if (response.status.code !== 10000) {
          console.log(
            "Received failed status: " +
              response.status.description +
              "\n" +
              response.status.details
          );
          return res.json({ error: response.status.details });
        }

        return res.json(response);

        // console.log("Predicted concepts, with confidence values:", response);
        // for (const c of response.outputs[0].data.concepts) {
        //   console.log(c.name + ": " + c.value);
        // }
      }
    );
  } else {
    res.send("no url");
  }
});

app.listen(4343, () => {
  console.log("backend server running on port 3000");
});
