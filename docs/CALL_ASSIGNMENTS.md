# Call assignments

Call assignments in Ground Control are, conceptually, the mapping between a survey and a target group of people to call.  To make a call assignment do the following:

1. Go into the Blue State Digital admin and make a new survey that you'd like to use with your call assignment.  **Make sure to use the GROUND CONTROL - Survey wrapper**.

2. In Blue State Digital, create a constituent group that you would like to be the target of your call assignment.  You can do this by searching for people and saving that group.  If you have a target that is too complex for the BSD constituent group generator (e.g. 'call everyone that is near any event that has not yet been filled'), skip this step and move on.

3. In Ground Control, login and go to /admin.  If you see a 'Nothing to see here...' message there, ask Saikat to make you an admin in Ground Control.

4. Go to "Call Assignments" at the top and then Create Assignment.

5. Fill out the new assignment.

    a) **Name**: What you want callers to see.
    b) **BSD Signup Form ID**: The numeric ID for the BSD form you created.
    c) **How to render the survey?**: Different renderers display the survey in different ways. If you want a new one, let Saikat know and he can implement it.
    d) **Target group of interviewees**:  Either enter your cons_id or, for something fancier, a SQL query that returns a list of cons_ids.  **If you used a cons_id, let Saikat know or it won't actually get synced.**
    e) **Post-submit survey processors**: This is how we do different dynamic actions based on survey responses.  These work off of tags on survey form field names.  The only one supported right now is "Create event RSVPs" and this will only work if you have a form field on your survey that starts with [event_id].

Once you hit create, the call assignment will be created but you will need to wait for the target group of interviewees to exist.  In the case of using a cons_id, it will happen within an hour of you telling Saikat.  In the case of using a SQL query, it should happen within 5 minutes to an hour, depending on how big the target group is.