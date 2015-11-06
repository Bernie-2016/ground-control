# Person

# Field

# Note

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

There will also be a hook on the Survey for onSubmit to do any cross-field validations.  Surveys will be rendered by a HOC called SurveyRenderer that will handle data fetching and mutations for the survey. When a survey is submitted, it can be processed by a series of SurveyProcessors.  These can do things from the data like add Notes to Persons, sign up the Person for a Group Call, create an event, etc.