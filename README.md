# Ground Control

## Getting started

Install the [Heroku toolbelt](https://toolbelt.heroku.com/), [RethinkDB](http://rethinkdb.com/docs/install/), and [Node.js](https://nodejs.org/en/download/). Then run:

`./start`

Ground Control should be running at `http://localhost:3000`.  The [RethinkDB database admin](https://www.rethinkdb.com/docs/administration-tools/) will be running at `http://localhost:8080`.

## What is this?

Right now, Ground Control is a tool for scheduling conference calls on the MaestroConference system.  In the near future, it will also generate spreadsheets for notetakers on these calls to take notes and send back into Ground Control.  But in general, you can think of Ground Control as, ultimately, our central tool for managing our volunteer organizing efforts.  It will have two major goals:

1. Expose a variety of ways to communicate with/survey our volunteers (conference calls, one-on-one calls, e-mail, etc.) and collect all this data in a very flexible model.
2. Expose an API for others to build apps on top of using this data

In other words, think of Ground Control as a central repository of information that can be written to in a multitude of different ways.

There are multiple tools that the campaign is already using for various parts of organizing people who want to get Bernie elected, and this diagram tries to roughly sketch out how they fit together and what the architecture we are going for.  Rectangles are things that exist, circles are things we are building: [https://gomockingbird.com/projects/0govthz/sXMAyD](https://gomockingbird.com/projects/0govthz/sXMAyD).

## What stack is this project using?

We are using RethinkDB for our database.  Take a look at the [RethinkDB query language](https://www.rethinkdb.com/docs/guide/javascript/) -- it's a very powerful model for querying data by chaining together actions, and that is the main reason we are using it for this project.

On top of that, we are creating a [GraphQL](http://graphql.org/) API.  GraphQL is designed to make it easy to build APIs for objects that have many relationships.  On the frontend, we are using [React](https://facebook.github.io/react/) for the view layer, and React talks to GraphQL via [Relay](https://facebook.github.io/relay/).

If you are feeling stuck/aren't familiar with any of this and want some help, please don't bang your head against a wall!  Talk to me (saikat@berniesanders.com, @saikat in the BernieBuilders Slack).

