# Ground Control

## Getting started

### Linux

The easiest way to get started in Linux is with [Docker](https://docs.docker.com/engine/installation/ubuntulinux/).  After installing Docker, just run:

`docker compose up`

### OS X

In OS X, we currently run everything locally using a Procfile and node-foreman. To get started, install [Node.js](https://nodejs.org/en/download/) and [Homebrew](http://brew.sh/). Then do the following:

`npm install`
`./setup-osx`

Then you should be able to start Ground Control on `http://localhost:3000` with

`npm run dev`

If you ever want to re-seed the database, run

`npm run seed`

### Windows

The best way to run everything on Windows is probably to try to get Docker working on Windows and use the Linux installation instructions.

## What is this?

The purposes of Ground Control are:

1. A central portal for volunteers who want to get involved with the campaign and an admin interface to manage volunteers. This is the code that runs http://organize.berniesanders.com.

2. Be the central routing point/API for applications to integrate with the CRMs the campaign uses (BSD and VAN)

3. Be a repository for data that does not fit neatly into BSD and VAN and give people outside of our system access to this data as well

4. An effort to build out more organizing tools on top of what we already have (which leads to the data in #2). Currently this means a phonebanking tool and a tool for scheduling conference calls with volunteers.

## What are these "CRMs the campaign uses?"

BSD is Blue State Digital and VAN is Voter Activation Network.  BSD is basically a CRM including a mailer, way to create surveys, and way to look at signup data.  VAN is a giant database of voter information that is used for canvassing/voter outreach efforts.  Here is a rough diagram of how it fits together. Rectangles are things that exist, circles are things we are building: [https://gomockingbird.com/projects/0govthz/sXMAyD](https://gomockingbird.com/projects/0govthz/sXMAyD).

VAN and BSD have their own APIs, and currently Ground Control makes use of the BSD API heavily for its syncing purposes.

    * [BSD API](https://www.bluestatedigital.com/page/api/doc)
    * [VAN API](http://developers.ngpvan.com/van-api)

## What stack is this project using?

We are using RethinkDB for our database.  Take a look at the [RethinkDB query language](https://www.rethinkdb.com/docs/guide/javascript/) -- it's a very powerful model for querying data by chaining together actions, and that is the main reason we are using it for this project.

On top of that, we are creating a [GraphQL](http://graphql.org/) API.  GraphQL is designed to make it easy to build APIs for objects that have many relationships.  On the frontend, we are using [React](https://facebook.github.io/react/) for the view layer, and React talks to GraphQL via [Relay](https://facebook.github.io/relay/).

If you are feeling stuck/aren't familiar with any of this and want some help, please don't bang your head against a wall!  Talk to me (saikat@berniesanders.com, @saikat in the BernieBuilders Slack).

## More info?

See the [docs](docs).

## License

This project is licensed under [AGPL](LICENSE).