# Ground Control [![Stories in Ready](https://badge.waffle.io/Bernie-2016/ground-control.png?label=status-ready&title=Ready)](https://waffle.io/Bernie-2016/ground-control)

Currently, Ground Control is two things:

* A tool for calling other volunteers of the campaign and integrating that data back into BSD, which is a CRM the campaign uses.  In the near future, it is going to also be used to call voters.
* A tool to create and manage events.  These include both volunteer-run events and official events.  The goal here is to replace [go.berniesanders.com/page/event/create](https://go.berniesanders.com/page/event/create) and start replacing some of the functionality of the event administration backed.

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

## Contributing

Want to help out? You can jump right in to see issues that are ready to be tackled by looking at the [status-ready](https://github.com/Bernie-2016/ground-control/issues?q=is%3Aissue+is%3Aopen+label%3Astatus-ready) issue label. If you are just getting started with the project, also check out the [newbie-friendly](https://github.com/Bernie-2016/ground-control/issues?q=is%3Aissue+is%3Aopen+label%3Anewbie-friendly) label.

You can also see an overview of where all of our issues stand at https://waffle.io/Bernie-2016/ground-control

### More Info

[Read our wiki for more guidance on development and other FAQs.](https://github.com/Bernie-2016/ground-control/wiki)

### Contribution Activity

[![Throughput Graph](https://graphs.waffle.io/Bernie-2016/ground-control/throughput.svg)](https://waffle.io/Bernie-2016/ground-control/metrics)

## License

This project is licensed under [AGPL](LICENSE).
