class Leaderboard {
  credsPromise = null;
  client = null;
  name = "";
  score = null;

  constructor() {
    AWS.config.region = "us-east-1";
    // Configure the credentials provider to use your identity pool
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: "us-east-1:2d3c91f4-1653-4f9b-84bc-bdf20c9f7244",
    });
  }

  async _getClient() {
    if (this.client) return this.client;
    const creds = await this._getCreds();

    const dynamodb = new AWS.DynamoDB({
      apiVersion: "2012-08-10",
      secretAccessKey: creds.secretAccessKey,
    });

    this.client = new AWS.DynamoDB.DocumentClient({ service: dynamodb });
    return this.client;
  }

  async _getCreds() {
    if (this.credsPromise) return this.credsPromise;

    this.credsPromise = new Promise((res) => {
      AWS.config.credentials.get(function () {
        // Credentials will be available when this function is called.
        const accessKeyId = AWS.config.credentials.accessKeyId;
        const secretAccessKey = AWS.config.credentials.secretAccessKey;
        const sessionToken = AWS.config.credentials.sessionToken;
        console.log({ accessKeyId, secretAccessKey, sessionToken });
        res({ accessKeyId, secretAccessKey, sessionToken });
      });
    });

    return this.credsPromise;
  }

  async getScores() {
    const client = await this._getClient();

    const params = {
      TableName: "vf-game-leaderboard",
      Limit: 1000,
    };

    return new Promise((res, rej) => {
      client.scan(params, function (err, data) {
        if (err) return console.log(err);
        const items = data.Items.sort((a, b) => b.Score - a.Score).slice(0, 8);
        res(items);
      });
    });
  }

  setName(name) {
    this.name = name;
  }

  setScore(score) {
    this.score = score;
  }

  async submit() {
    const client = await this._getClient();
    const creds = await this._getCreds();

    // Cognito IAM role scoped to allow put row with User, Score, Name attributes

    const params = {
      TableName: "vf-game-leaderboard",
      Item: {
        User: creds.accessKeyId + this.name, // primarykey string
        Score: this.score, // sortkey number
        Name: this.name, // string
      },
    };

    return new Promise((res, rej) => {
      client.put(params, function (err, data) {
        if (err) return console.log(err);
        res(data);
      });
    });
  }
}

window.leaderboard = new Leaderboard();
