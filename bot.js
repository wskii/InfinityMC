// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot pomyślnie wystartował. Obecnie obsługuję ${client.users.size} użytkowników, w ${client.channels.size} kanałach na ${client.guilds.size} serwerach.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`ihelp| Oficjalny bot InfinityMC!`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`Dołączono do nowego serwera: ${guild.name} (id: ${guild.id}). Ten serwer ma ${guild.memberCount} członków!`);
  client.user.setActivity(`ihelp| Oficjalny bot InfinityMC!`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`Zostałem usunięty z ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`ihelp| Oficjalny bot InfinityMC!`)
});


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // Let's go with a few common example commands! Feel free to delete or change those.
  
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("͡° ͜ʖ ͡°");
    m.edit(`Pong! Czas oczekiwania wynosi ${m.createdTimestamp - message.createdTimestamp}ms.`);
  }
  
  if(command === "pong") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("͡° ͜ʖ ͡°");
    m.edit(`Ping! Czas oczekiwania wynosi ${m.createdTimestamp - message.createdTimestamp}ms.`);
	
  }
  
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }
  
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!message.member.roles.some(r=>["[CEO]".includes(r.name)) )
      return message.reply("Nie masz uprawnień by to zrobić!");
    
    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    // We can also support getting the member by ID, which would be args[0]
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Wybierz prawidłowego użytkownika!");
    if(!member.kickable) 
      return message.reply("Nie mogę wyrzucić tego użytkownika. Sprawdź czy mam odpowiednie uprawnienia i czy moja rola jest wyżej od jego.");
    
    // slice(1) removes the first part, which here should be the user mention or ID
    // join(' ') takes all the various parts to make it a single string.
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "Podaj powód.";
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Przepraszam, ${message.author} nie mogę wyrzucić tego użytkownika, ponieważ : ${error}`));
    message.reply(`${member.user.tag} został wyrzucony ${message.author.tag} bo: ${reason}`);

  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["[CEO]"].includes(r.name)) )
      return message.reply("Nie masz uprawnień by to zrobić!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Wybierz prawidłowego użytkownika!");
    if(!member.bannable) 
      return message.reply("Nie mogę zbanować tego użytkownika. Sprawdź czy mam odpowiednie uprawnienia i czy moja rola jest wyżej od jego.");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "Nie podano powodu";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} Nie mogłem zbanować z powodu : ${error}`));
    message.reply(`${member.user.tag} został zbanowany ${message.author.tag} z powodem: ${reason}`);
  }
  
  if(command === "purge") {
    if(!message.member.roles.some(r=>["[CEO]",].includes(r.name)) )
      return message.reply("Nie masz uprawnień by to zrobić!");
    // This command removes all messages from all users in the channel, up to 100.
    
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 1 || deleteCount > 100)
      return message.reply("Podaj liczbę od 1 do 100");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  
  }

  if(command === "help") {
    message.reply ("Dostępne komendy: say, ping, pong, help, stats, skład, purge, kick, ban")
  }
  
  if(command === "stats") {
	  message.reply(`Obecnie obsługuję ${client.users.size} użytkowników, w ${client.channels.size} kanałach.`); 
 
  }

  if(command === "skład") {
	  message.reply("Obecny właściciel serwera: [CEO]: Vi3ctm AKA zone10054");
 
  }
});

client.login(config.token);