# Ground Control

## Getting started

Install [RethinkDB](http://rethinkdb.com/docs/install/) and [Node.js](https://nodejs.org/en/download/). Then run the following once to install all the packages

`npm install`

Then to start Ground Control, you will run this every time:

`npm start`

Ground Control should be running at `http://localhost:3000`.  The [RethinkDB database admin](https://www.rethinkdb.com/docs/administration-tools/) will be running at `http://localhost:8080`.

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

## Using Docker

For local development, we have included a dockerized version of this stack. To use it, you will need a recent version of:

* [Docker](https://docs.docker.com/engine/installation/)
* [docker-compose](https://docs.docker.com/compose/install/)

IMPORTANT: remove your `node_modules` directory BEFORE running docker, less you encounter segfaults for native modules.

If you want to develop with the entire project in Docker, simply:

      docker-compose up

docker-compose will handle reloading all of the proper services and re-running npm install if necessary as you change files! :-)

If you want to work on the code outside of Docker, but use the dockerized databases, simply:

      docker-compose start rethinkdb && docker-compose start db

> Note:
> If you see the error "Please increase the amount of inotify watches allowed per user"
> you need to run `sudo sysctl fs.inotify.max_user_watches=524288` either on your laptop
> if you run Docker natively, or inside the boot2docker virtual machine

## More info?

See the [docs](docs).

## License

This project is licensed under [AGPL](LICENSE).
