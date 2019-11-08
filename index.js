const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const app = express();
const port = '1125';

let people = [];
app.use(express.json());

// welcome
app.get('/api', (req, res) => res.send('welcome to my api'));

// get people
app.get('/api/people', (req, res) => res.json(people));

// create person
app.post('/api/people', async (req, res) => {
  const { error } = validateBody(req.body);
  if (error) return res.send(error.details[0].message);
  try {
    const hashedPw = await bcrypt.hash(req.body.password, 10);
    const person = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPw
    };
    people = people.concat(person);
    res.status(201).send();
  } catch (err) {
    res.status(403).send(err);
  }
});

// get that person
app.get('/api/people/person', validateUser, async (req, res) => {
  try {
    const person = await people.find(pers => pers.name === req.user.name);
    res.json({ person });
  } catch (error) {
    res.sendStatus(404);
  }
});

// jwt token
app.post('/api/register', async (req, res) => {
  const per = {
    name: req.body.name
  };
  const token = await jwt.sign(per, 'secretkey');
  res.json({ token });
});

// validate middleware
async function validateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(400);
  try {
    const userObj = await jwt.verify(token, 'secretkey');
    req.user = userObj;
    next();
  } catch (err) {
    res.status(403).send(err);
  }
}

// vaidation function
function validateBody(body) {
  const schema = Joi.object().keys({
    name: Joi.string()
      .min(3)
      .max(10)
      .required(),
    email: Joi.string()
      .max(255)
      .email()
      .required(),
    password: Joi.string()
      .min(3)
      .max(1024)
      .required()
  });

  return Joi.validate(body, schema);
}

app.listen(port, () => console.log(`listening on porn ${port}`));
