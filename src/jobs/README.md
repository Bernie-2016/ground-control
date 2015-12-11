Job Scheduler
============

# Usage

## jobs.json

Add your jobs to the `jobs.json` file, as an object in the `jobs` array.

The `cron` string is constructed as so:

* Seconds: 0-59
* Minutes: 0-59
* Hours: 0-23
* Day of Month: 1-31
* Months: 0-11
* Day of Week: 0-6

The `job` string is relative path to a JSON module that contains the job specification. Checkout [modules](#modules) for more info

Example job object:

```json
{
  "cron": "00 */2 * * * *',
  "job": "./jobs/foobar.js"
}
```

This will execute the foobar job every 2 minutes.

## Modules

There are 3 lifecycle functions your module can provide. The `job` function is required.

### job

This will be called to run your job for every cron tick that matches your job's cron schedule.

### init

This will be called once, when the application starts up. If your job needs to aquire resources
on boot, do it in init. It is expected to be asyncronous and will be passed a callback.

If you fail to aquire your resources, and it will prevent you from executing your job, pass
an error to the callback.

### destroy

Currently this is unused, however it may become important later. It would be good practice to
implement one if you need to release resources.

A good example is if you create a persistant database connection in your `init` function. When you
are done executing your job (perhaps we will add support for ephemeral jobs moving forward), you should
release this resource.


### Example

```js
var m = module.exports = {}
m.job = function job() {};
m.init = function init(cb) {cb()};
m.destroy = function destroy() {};
```

# Environment Variables

`jobs/bsd_assigned_calls_ttl.js` requires that `DATABASE_URL` be set to the postgresql database;
