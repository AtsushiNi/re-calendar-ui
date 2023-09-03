var express = require('express');
var router = express.Router();
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const process = require('process')
const path = require('path')
const fs = require('fs').promises

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
const TOKEN_PATH = path.join(process.cwd(), "backend", "token.json")
const CREDENTIALS_PATH = path.join(process.cwd(), "backend", "credentials.json")

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/* GET calendars listing. */
router.get('/', async function(req, res, next) {
  const auth = await authorize()

  const calendar = google.calendar({ version: 'v3', auth })
  const response = await calendar.calendarList.list()

  let calendarList = response.data.items.filter(item => item.selected)
  calendarList = calendarList.map(item => {
    return {
      id: item.id,
      summary: item.summary,
      backgroundColor: item.backgroundColor,
      foregroundColor: item.foregroundColor,
      colorId: item.colorId,
      events: []
    }
  })

  // それぞれのカレンダーのイベント一覧を取得
  // lambdaは日本時間が使えないので換算
  let startDate = new Date((new Date(req.query.startDate)) + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000))
  startDate.setHours(0,0,0,0)
  startDate = new Date(startDate - ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000))

  let endDate = new Date((new Date(req.query.endDate)) + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000))
  endDate.setHours(23,59,59,999)
  endDate = new Date(endDate - ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000))

  let results = []
  calendarList.forEach(calendarItem => {
    results.push(
      calendar.events.list({
        calendarId: calendarItem.id,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true
      })
    )
  })
  const result = await Promise.all(results)
  result.forEach((res, index) => {
    calendarList[index].events = res.data.items.map(event => {
        return {
            summary: event.summary,
            start: event.start,
            end: event.end
    }})
  })

  res.json(calendarList)
})

module.exports = router;
