function generateContactAssignments() {
  const contactAssignments = [
    {
      name: 'Register Voters - CA',
      expires: new Date('01/01/2017'),
      description: 'Register voters in California',
      instructions: 'Call first, then send a text!',
      require_call_first: true,
      call_actions: [
        {
          name: 'Are you registered?',
          call_script: 'Hello {{contact.firstName}}, this is {{user.firstName}}.  Are you registered to vote in California?'
        }
      ],
      text_actions: [
        {
          name: `Here's the link`,
          message_content: `Hey {{contact.firstName}} -- here's that voter registration link: https://vote.berniesanders.com/CA`
        },
        {
          name: `Check your party affiliation`,
          message_content: `Hey {{contact.firstName}} -- since you're already registered, be sure to check your affiliation before May 23rd to vote for Bernie!`
        }
      ]
    }
  ]

  return contactAssignments
}

export default generateContactAssignments