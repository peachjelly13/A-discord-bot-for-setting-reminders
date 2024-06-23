import { REST, Routes } from 'discord.js';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name:'create',
    desciption:'creates a short url',
  },
  {
    name:'setReminder',
    description:"for setting reminders"
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}