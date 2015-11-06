Ground Control exposes a GraphQL-based API that you can explore in src/backend/data/schema.js.

These are the main conceptual models in Ground Control and what they represent.  Additionally, many of these models have a "BSDLink" field.  This represents the id of the corresponding object in BSD when the object was created by BSD.

# Person

This is a person.  Very minimal data exists at a top level of a person because, as it turns out, everything can change and we want to keep track of these changes (not an absolute truth, but until we find it too hard to do so).

# Field

A field represents something that can be filled out for a person.  E.g. email, why do you like Bernie Sanders, etc.

# Note

A note is simple a pairing between a field and a person.

# Survey

A survey is a model that has an array of different data sources and a template that points to an actual React component that knows how to render the survey given the data.  Most surveys will just have Fields as their data, but you could imagine, for example, a survey that is used to sign up for one of many group calls where each group call available to that survey is also a member of the data.  A survey template will generally be created using a Field abstraction (which is itself a React component) that takes these props:

    {
        label
        helpText
        baseField : {
            type
            validationFunc
        }
        cleanFunc
        displayFunc
        onChange
    }

There is also a hook on the Survey React component for onSubmit to do any cross-field validations.  Surveys will be rendered by a higher order component called SurveyRenderer that will handle data fetching and mutations for the survey. When a survey is submitted, it can be processed by a series of SurveyProcessors.  These can do things from the data like add Notes to Persons, sign up the Person for a Group Call, create an event, etc.