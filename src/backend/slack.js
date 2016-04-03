import requestPromise from 'request-promise';
import url from 'url';
import log from './log';

const error_message = { success: false };
const success_message = { success: true };

// Current Slack Teams:
//   - afam4bernie (AFAM4BERNIE_SLACK_API_KEY)
//   - bernie2016states (BERNIE2016STATES_SLACK_API_KEY)
//   - berniebarnstorms (BERNIEBARNSTORMS_SLACK_API_KEY)
//   - berniebuilders (BERNIEBUILDERS_SLACK_API_KEY)
//   - callforbernie (CALLFORBERNIE_SLACK_API_KEY)
//   - codersforsanders (CODERSFORSANDERS_SLACK_API_KEY)

export default class Slack {
  constructor() {
  }

  async createInvite(team, email) {
    try {
      let token_keyword = team.toUpperCase() + '_SLACK_API_KEY'
      let token = process.env[ token_keyword ];
      let url = `https://${team}.slack.com/api/users.admin.invite?email=${email}&token=${token}&set_active=true`;

      let options = {
        uri: url,
        method: 'POST',
        json: true
      }

      let response = await requestPromise(options)

      if (response.ok) {
        return true
      } else {
        log.error('Error in processing Slack invitation')
        return false
      }
    } catch (e) {
      log.error(e);
      return false;
    }
  }
}
