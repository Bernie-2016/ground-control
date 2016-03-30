# Ground Control

Ground Control is the campaign's central platform for creating, managing, and increasing turnout to events. It contains several key tools used every day by campaign volunteers and staff:

* An administrative interface for editing and approving events
* An event creation tool
* Call and email tools for event hosts to increase turnout
* A constituent lookup tool for administrative use
* A constituent event dashboard to allow uploading of data files for review by our data team

## Getting Started

### OS X

In OS X, we currently run everything locally using a Procfile and node-foreman. To get started, install [Node.js 5.x](https://nodejs.org/en/download/stable/) and [Homebrew](http://brew.sh/). Then clone this repository and cd into ground-control. Then do the following:

```
npm install
./setup-osx
```

Then you should be able to start Ground Control on `http://localhost:3000` with

`npm run dev`

### Windows & Linux

On Linux, follow the same directions as OS X above, but substitute `./setup-linux` for the equivalent OS X script.

You will also need to have [Docker](https://docs.docker.com/engine/installation) and [docker-compose](https://docs.docker.com/compose/install) installed to provide your database.

### Environment Variables
You can find environment defaults in `.env.sample`. The first time a setup script is run, `.env` will be generated with these defaults.

If you ever need to generate a missing `.env`, run

`npm run gen-env`

## Contributing [![Stories in Ready](https://badge.waffle.io/Bernie-2016/ground-control.png?label=status-ready&title=Ready)](https://waffle.io/Bernie-2016/ground-control) [![Stories in Ready](https://badge.waffle.io/Bernie-2016/ground-control.png?label=newbie-friendly&title=Newbie%20Friendly)](https://github.com/Bernie-2016/ground-control/issues?q=is%3Aissue+is%3Aopen+label%3Anewbie-friendly)

Want to help out? You can jump right in to see issues that are ready to be tackled by looking at the [status-ready](https://github.com/Bernie-2016/ground-control/issues?q=is%3Aissue+is%3Aopen+label%3Astatus-ready) issue label. If you are just getting started with the project, also check out the [newbie-friendly](https://github.com/Bernie-2016/ground-control/issues?q=is%3Aissue+is%3Aopen+label%3Anewbie-friendly) label.

You can also see an overview of where all of our issues stand at https://waffle.io/Bernie-2016/ground-control

### More Info

[Read our wiki for more guidance on development and other FAQs.](https://github.com/Bernie-2016/ground-control/wiki)

### Contribution Activity

[![Throughput Graph](https://graphs.waffle.io/Bernie-2016/ground-control/throughput.svg)](https://waffle.io/Bernie-2016/ground-control)

## License

This project is licensed under [AGPL](LICENSE).