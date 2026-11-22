# 🚌 Swindon Transit

**A Discord-based public transport information system for Swindon.**

Swindon Transit is an open-source project aiming to make public transport information more accessible through Discord. Using timetable data from the UK Bus Open Data Service, the project will provide information about bus routes, stops, timetables and departures across Swindon.

> 🚧 **Status: In Development**

## Features

Planned functionality includes:

- 🚌 **Route information** – Browse available bus routes.
- 🚏 **Stop information** – Find stops and their associated services.
- 🕒 **Departures** – View upcoming departures from selected stops.
- 📅 **Timetables** – Access scheduled service information.
- 🔎 **Search** – Find routes and stops easily through Discord.
- 🔄 **Data updates** – Refresh timetable information when new datasets become available.

Features will be introduced progressively as development continues.

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| JavaScript | Application development |
| discord.js | Discord integration |
| MySQL | Data storage |
| GTFS | Public transport timetable format |
| adm-zip | GTFS archive handling |
| csv-parse | GTFS data parsing |

## Project Structure

```text
swindon-transit/
├── src/
│   ├── commands/
│   ├── database/
│   ├── import/
│   ├── services/
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

## Getting Started

### Prerequisites

- Node.js
- npm
- MySQL server
- A Discord application and bot token

### Installation

1. Clone the repository:

```bash
git clone https://github.com/itsollie-m/swindon-transit.git
```

2. Navigate into the project:

```bash
cd swindon-transit
```

3. Install dependencies:

```bash
npm install
```

4. Create your environment configuration:

```bash
cp .env.example .env
```

5. Configure your environment variables and database connection.

6. Start development once the application entry point is ready.

> The application is currently under development, so the complete deployment instructions will be added as functionality becomes available.

## Data Sources & Licensing

Swindon Transit uses public transport data sourced from the **UK Bus Open Data Service (BODS)**.

The following data categories are licensed under the Open Government Licence v3.0:

- Network data
- Mobile products data
- Stop data

[Read the Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).

Where required, appropriate attribution will be provided for the source datasets.

Third-party data remains subject to its respective licensing terms. The project's software licence does not replace or override those terms.

## Contributing

Contributions, suggestions and improvements are welcome!

If you'd like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Submit a pull request describing your contribution.

Please ensure changes are tested before submitting a pull request.

## Licence

The Swindon Transit source code is distributed under the **MIT Licence**.

See the [LICENSE](LICENSE) file for further information.

Third-party datasets and resources remain subject to their respective licences.

---

**Developed by [itsollie-m](https://github.com/itsollie-m)**

[GitHub Repository](https://github.com/itsollie-m/swindon-transit)