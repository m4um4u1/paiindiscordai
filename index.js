require('dotenv').config();
// Instantiate a DialogFlow client.
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

const dialogflowClient = new dialogflow.SessionsClient({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const sessionId = uuid.v4();

// Define session path
const sessionPath = dialogflowClient.projectAgentSessionPath(process.env.PROJECT_ID, sessionId);

const Discord = require('discord.js');

const discordClient = new Discord.Client();

discordClient.on('ready', () => {
    console.log('Ready!');
});

discordClient.on('message', m => {
    if (!shouldBeInvoked(m)) {
        return;
    }

    const message = remove(discordClient.user.username, m.cleanContent);

    const dialogflowRequest = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: 'de-DE'
            }
        }
    };

    dialogflowClient.detectIntent(dialogflowRequest).then(responses => {
        m.channel.send(responses[0].queryResult.fulfillmentText);
    });
});

function shouldBeInvoked(message) {
    return (message.content.startsWith(process.env.DISCORD_PREFIX) ||
        message.mentions.users.first() === discordClient.user ||
        message.channel.type === 'dm') &&
        discordClient.user.id !== message.author.id;
}

function remove(username, text) {
    return text.replace('@' + username + ' ', '').replace(process.env.DISCORD_PREFIX + ' ', '');
}

discordClient.login(process.env.DISCORD_TOKEN);
