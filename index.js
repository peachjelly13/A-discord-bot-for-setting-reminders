import { config as dotenvConfig } from 'dotenv';
import fs from "fs";
dotenvConfig();
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const remindersFile = './reminders.json';
let reminders = [];

// Load reminders from the file
try {
    const data = fs.readFileSync(remindersFile, 'utf8');
    reminders = JSON.parse(data);
} catch (error) {
    console.error('Error loading reminders:', error);
}

// Save reminders to the file
function saveReminders() {
    fs.writeFileSync(remindersFile, JSON.stringify(reminders, null, 2), 'utf8');
}

// Check for due reminders periodically
function checkReminders() {
    const now = Date.now();
    reminders.forEach(reminder => {
        if (reminder.time <= now) {
            const user = client.users.cache.get(reminder.authorId);
            if (user) {
                user.send(`Reminder: ${reminder.text}`).catch(console.error);
            }
            // Remove the reminder from the list after triggering
            reminders = reminders.filter(r => r.id !== reminder.id);
            saveReminders();
        }
    });
}

// Set an interval to check reminders every minute
setInterval(checkReminders, 60000);

client.on("messageCreate", (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith('create') && !message.content.startsWith('reminder')&& !message.content.startsWith("show reminders")) {
        message.reply({
            content: "Welcome to ourBot Server"
        });
    }

    if (message.content.startsWith('create')) {
        const url = message.content.split("create")[1];
        if (url.length == 0) {
            const error = "enter the url";
            return message.reply({
                content: error
            });
        }
        return message.reply({
            content: 'Generating short id for ' + url,
        });
    }

    if (message.content.startsWith('reminder')) {
        // Slice or separate the reminder part from the rest of it
        const args = message.content.slice('reminder'.length).trim().split(/ +/);
        const time = args.shift();
        const text = args.join(' ');
        if (text.length < 2 || !time || !text) {
            const errorMessage = "Please enter time and reminder";
            return message.reply({
                content: `${errorMessage}`
            });
        }

        let ms = 0;
        // Regex expression to parse time
        const match = time.match(/(\d+)(s|m|h|d)/);
        if (match) {
            const num = parseInt(match[1]);
            const unit = match[2];
            if (unit === 's') {
                ms = num * 1000;
            } else if (unit === 'm') {
                ms = num * 60 * 1000;
            } else if (unit === 'h') {
                ms = num * 60 * 60 * 1000;
            } else if (unit === 'd') {
                ms = num * 24 * 60 * 60 * 1000;
            }
        }
        if (ms === 0) {
            return message.reply('Invalid time format. Use something like "10m", "1h30m", etc.');
        }
        const remindAt = Date.now() + ms;

        // Creating a reminder object
        const reminder = {
            id: reminders.length + 1,
            authorId: message.author.id,
            text: text,
            time: remindAt,
        };

        reminders.push(reminder);
        saveReminders();
        // Inform user about the reminder
        message.reply(`Reminder set for ${new Date(remindAt).toLocaleString()}: ${text}`);
    }
    if(message.content.startsWith("show reminders")){
        if (reminders.length === 0) {
            return message.reply('No reminders set.');
        }

        let reminderMessages = reminders.map(reminder => {
            let user = client.users.cache.get(reminder.authorId);
            let username = user ? user.username : 'Unknown user';
            let time = new Date(reminder.time).toLocaleString();
            return `Reminder ID: ${reminder.id}\nAuthor: ${username}\nTime: ${time}\nText: ${reminder.text}`;
        }).join('\n\n');

        message.reply({
            content: reminderMessages
        });
    }
});

client.on("interactionCreate", (interaction) => {
    console.log(interaction);
    interaction.reply("pong!");
});

client.login(process.env.TOKEN);
