## More getting started

Once you get Ground Control running you can go to /admin or to just the root directory.  You won't have any data, so that's the first step.  Unfortunately we don't have an easy way to seed data yet.  Saikat can walk you through how he's doing it though.

## Code Structure

The bulk of logic is in the frontend folder under components.  app.js is the entry-point and where a lot of the routing happens.  There is also some routing logic and a backend in backend/server.js.  Most of the backend logic actually happens in backend/data/schema.js in the GraphQL resolve functions.