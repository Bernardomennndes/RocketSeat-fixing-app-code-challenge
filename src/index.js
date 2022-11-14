const express = require("express");

const { v4: uuidv4, validate } = require("uuid");

const app = express();

app.use(express.json());

const repositories = [];

function checkRepositoryIdentity(request, response, next) {
  const { id } = request.params;

  const existingRepository = repositories.find((repo) => repo.id === id);

  if (!existingRepository)
    return response.status(404).json({ error: "Repository not found" });

  request.repository = existingRepository;

  return next();
}

app.get("/repositories", (_, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const newRepository = {
    id: uuidv4(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(newRepository);

  return response.status(201).json(newRepository);
});

app.put("/repositories/:id", checkRepositoryIdentity, (request, response) => {
  const { repository } = request;
  const payload = request.body;

  if (payload.likes) delete payload.likes;

  repository = {
    ...repository,
    ...payload,
  };

  return response.json(repository);
});

app.delete(
  "/repositories/:id",
  checkRepositoryIdentity,
  (request, response) => {
    const { repository } = request;

    const repositoryIndex = repositories.indexOf(repository);

    repositories.splice(repositoryIndex, 1);

    return response.status(204).send();
  }
);

app.post(
  "/repositories/:id/like",
  checkRepositoryIdentity,
  (request, response) => {
    const { repository } = request;

    ++repository.likes;

    return response.json({ likes: repository.likes || 0 });
  }
);

module.exports = app;
