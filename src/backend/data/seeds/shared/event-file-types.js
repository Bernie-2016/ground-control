function generateEventFileTypes() {
  let eventFileTypes = [
    {
      name: 'Event Photos',
      description: 'Photos taken at an event',
      slug: 'photos'
    },
    {
      name: 'Event Hosting Sheets',
      description: 'Forms containing information about future events',
      slug: 'hosting-sheets'
    },
    {
      name: 'Event Signup Sheets',
      description: 'Sign-in forms from an event',
      slug: 'sign-in-sheets'
    }
  ]

  const timestamp = new Date()
  eventFileTypes.forEach((type) => {
    type.create_dt = timestamp
    type.modified_dt = timestamp
  })
  return eventFileTypes
}

export default generateEventFileTypes