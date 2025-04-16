# Async/Exhibit – Server

For at løse eksamensopgaven skal I forbinde frontenden til en backend, som vi har bygget.

Dette repository er backenden til eksamensprojektet.

Serveren fungerer som et REST API, hvor jeres frontend kan:

- Hente datoer, lokationer og events
- Oprette og redigere events
- Booke billetter som bruger

---

## Sådan kommer du i gang (lokalt)

1. Fork dette repository, så du har din egen version på GitHub.

2. Klon dit eget repository

3. Installer dependencies:

   ```bash
   npm install
   ```

4. Start udviklingsserver:

   ```bash
   npm run dev
   ```

Serveren kører nu på:
`http://localhost:8080`

Du kan teste fx `http://localhost:8080/events` i din browser eller med fetch i din frontend.

### OBS! I kan ikke aflevere med `localhost`

> [!WARNING]
> Når I skal aflevere jeres projekt, skal I deploye jeres server til en fjernserver – se [vejledning til opsætning af serveren](REMOTESERVER.md).

---

## Funktionalitet

Serveren understøtter følgende endpoints:

| Metode | Endpoint           | Funktion                                  |
| ------ | ------------------ | ----------------------------------------- |
| GET    | `/dates`           | Hent tilladte datoer for events           |
| GET    | `/locations`       | Hent mulige lokationer og deres kapacitet |
| GET    | `/events`          | Hent alle events                          |
| GET    | `/events/:id`      | Hent ét specifikt event                   |
| POST   | `/events`          | Opret et nyt event (som kurator)          |
| PATCH  | `/events/:id`      | Rediger et eksisterende event             |
| DELETE | `/events/:id`      | Slet et event                             |
| PUT    | `/events/:id/book` | Book billetter til et event               |
| POST   | `/events/reset`    | Nulstil events til testdata               |

> [!WARNING]
> Events gemmes i hukommelsen – der er ingen database. Alt nulstilles ved reset eller genstart af serveren.

Alle endpoints til jeres backend er yderligere dokumenteret her: [API Documentation](https://daviatkea.github.io/API/).
