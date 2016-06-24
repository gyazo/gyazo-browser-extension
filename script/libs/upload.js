var request = require('request-promise')
var exec = require('child_process').execSync

var githubToken = process.env.GITHUB_TOKEN

var ref = exec('git show-ref refs/heads/`git rev-parse --abbrev-ref HEAD`').toString().split(' ')[0]

module.exports = function ({targetEnv, fileName, path}) {
  request({
    method: 'POST',
    uri: 'https://api.github.com/repos/gyazo/gyazo-browser-extension/deployments',
    headers: {
      'Authorization': 'token ' + githubToken,
      'User-Agent': 'gyazo/gyazo-browser-extension'
    },
    body: {
      ref: ref,
      required_contexts: [],
      auto_merge: false,
      environment: targetEnv,
      description: ''
    },
    json: true,
    resolveWithFullResponse: true
  }).then(function (res) {
    var err = false
    var uploadUrl = `http://storage.googleapis.com/${path}${fileName}`
    if (res.statusCode < 400) {
      try {
        var ext = fileName.split('.').pop()
        exec(`gsutil cp -z ${ext} -a public-read build/${fileName} gs://${path}`)
      } catch (e) {
        err = true
      }
    } else {
      err = true
    }
    if (err) {
      request({
        method: 'POST',
        headers: {'Authorization': 'token ' + githubToken, 'User-Agent': 'gyazo/gyazo-browser-extension'},
        uri: 'https://api.github.com/repos/gyazo/gyazo-browser-extension/deployments/' + res.body.id + '/statuses',
        body: {state: 'error'},
        json: true
      }).then(function () {
        process.exit(1)
      })
      return
    }
    request({
      method: 'POST',
      headers: {
        'Authorization': 'token ' + githubToken,
        'User-Agent': 'gyazo/gyazo-browser-extension'
      },
      uri: 'https://api.github.com/repos/gyazo/gyazo-browser-extension/deployments/' + res.body.id + '/statuses',
      body: {
        state: 'success',
        target_url: uploadUrl
      },
      json: true
    })
  })
}
