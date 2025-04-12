# Frontend valgfag

## Deployment git / glitch.com

### Hvad er dette?

For at løse eksamensopgaven skal du forbinde til et backend, som vi har bygget.

Du har kun brug for én server pr. gruppe, så vælg én til at gøre det. Vi bruger glitch.com, da det er gratis.

### Fjernserver

Sæt den op og test din løsning mod den en gang imellem.

1. Fork dette repository
2. Kopier URL'en, du skal bruge til at klone dit repo
3. Tilmeld dig Glitch på https://glitch.com
4. Klik på "New Project" og derefter "Import from GitHub"
5. Indsæt URL'en, du kopierede fra dit repository
6. Når det er færdigt, får du et sitenavn, f.eks. `free-simple-babcat`
7. Din server er nu live på `https://free-simple-babcat.glitch.me` (erstat med jeres sitenavn)
8. Prøv at tilføje `/events` til URL'en for at verificere, at det virker

### Lokal server

Bør bruges under udvikling. Det er hurtigere og bruger færre ressourcer.

1. Klon dit repository
2. `npm install`
3. `npm run dev`

Dette giver dig en server, der kører på `http://localhost:8080`. Prøv at åbne den i din browser og tilføj `/events` i slutningen

### Bemærk venligst

1. Fjernserveren (Glitch) lukker ned, når den kan. Så første gang du rammer den, kan der være en forsinkelse på 5-30 sekunder. Overvej derfor også at implementere en loader/spinner i jeres projekt.

Dette vil sandsynligvis forstyrre Next.js ved serverside-fetching, hvilket er OK — det er trods alt en gratis service. Opdater blot siden, så virker alt fint.

### Endpoints

Alle endpoints er [dokumenteret her](https://daviatkea.github.io/API/)
